"""
JobNest — Nạp 02_database/JobNest_Data_v3.xlsx vào PostgreSQL.

CẢNH BÁO: XÓA SẠCH dữ liệu hiện có (TRUNCATE mọi bảng trừ schema_migrations) rồi nạp lại.

Kết nối lấy theo thứ tự: --db-url  >  biến môi trường DATABASE_URL  >  DB_* trong 03_backend/.env
  python scripts/data_v3/import_data_v3.py --yes
  python scripts/data_v3/import_data_v3.py --db-url postgresql://postgres:mk@localhost:5432/cd2_marketplace_db --yes
"""
import argparse
import json
import os
import sys
from pathlib import Path

import psycopg2
from openpyxl import load_workbook

if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_XLSX = ROOT / '02_database' / 'JobNest_Data_v3.xlsx'
SKIP_SHEETS = {'TongQuan'}


def connect(url):
    if url:
        return psycopg2.connect(url)
    env = {}
    p = ROOT / '03_backend' / '.env'
    if p.exists():
        for line in p.read_text(encoding='utf-8').splitlines():
            if '=' in line and not line.lstrip().startswith('#'):
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip()
    g = lambda k, d: os.environ.get(k) or env.get(k) or d
    return psycopg2.connect(host=g('DB_HOST', 'localhost'), port=g('DB_PORT', '5432'), user=g('DB_USER', 'postgres'),
                            password=g('DB_PASSWORD', ''), dbname=g('DB_NAME', 'cd2_marketplace_db'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--file', default=str(DEFAULT_XLSX))
    ap.add_argument('--db-url', default=os.environ.get('DATABASE_URL'))
    ap.add_argument('--yes', action='store_true', help='xác nhận xóa dữ liệu cũ')
    a = ap.parse_args()
    if not a.yes:
        sys.exit('Lệnh này XÓA toàn bộ dữ liệu hiện có. Chạy lại với --yes để xác nhận.')

    wb = load_workbook(a.file, read_only=True)
    conn = connect(a.db_url)
    cur = conn.cursor()
    cur.execute("SELECT current_database()")
    print(f'📂 {a.file}\n🗄️  DB: {cur.fetchone()[0]}')

    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name <> 'schema_migrations'")
    all_tables = [r[0] for r in cur.fetchall()]
    cur.execute(f"TRUNCATE {', '.join(all_tables)} RESTART IDENTITY CASCADE")

    total = 0
    for ws in wb.worksheets:
        table = ws.title
        if table in SKIP_SHEETS:
            continue
        cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=%s", (table,))
        types = dict(cur.fetchall())
        if not types:
            print(f'   ⚠️  Bỏ qua sheet [{table}] — không có bảng tương ứng.')
            continue
        rows = ws.iter_rows(values_only=True)
        cols = [c for c in next(rows)]
        unknown = [c for c in cols if c not in types]
        if unknown:
            raise SystemExit(f'Sheet [{table}] có cột không tồn tại trong DB: {unknown}')

        def conv(col, v):
            if v is None or v == '':
                return None
            t = types[col]
            if t == 'ARRAY':
                return json.loads(v) if isinstance(v, str) else v
            if t in ('json', 'jsonb') and not isinstance(v, str):
                return json.dumps(v, ensure_ascii=False)
            if t == 'bytea':  # đường dẫn file tương đối thư mục chứa Excel (VD data_v3_files/cv/stu_001.pdf)
                return psycopg2.Binary((Path(a.file).parent / v).read_bytes())
            return v

        data = [tuple(conv(c, v) for c, v in zip(cols, r)) for r in rows if any(x is not None for x in r)]
        if data:
            sql = f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(['%s'] * len(cols))})"
            cur.executemany(sql, data)
        total += len(data)
        print(f'   ✅ {table:28s} {len(data):6d} dòng')

    # Đồng bộ sequence cho các bảng có cột id
    cur.execute("""SELECT table_name, pg_get_serial_sequence(table_name, 'id') FROM information_schema.columns
                   WHERE table_schema='public' AND column_name='id' AND table_name = ANY(%s)""", (all_tables,))
    for t, seq in cur.fetchall():
        if seq:
            cur.execute(f"SELECT setval(%s, COALESCE((SELECT MAX(id) FROM {t}), 0) + 1, false)", (seq,))
    conn.commit()
    print(f'🎉 Hoàn tất: {total} dòng. Đăng nhập bằng mật khẩu ghi ở sheet TongQuan.')


if __name__ == '__main__':
    main()
