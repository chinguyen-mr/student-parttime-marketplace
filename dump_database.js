const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const pgDumpPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe';
const outputPath = path.resolve(__dirname, '02_database/cd2_marketplace_full_dump.sql');

console.log('⏳ Đang xuất toàn bộ dữ liệu CSDL cd2_marketplace_db dạng chuẩn INSERT (tương thích 100% với pgAdmin 4)...');

try {
    const res = spawnSync(pgDumpPath, [
        '-h', 'localhost',
        '-p', '5432',
        '-U', 'postgres',
        '-d', 'cd2_marketplace_db',
        '--clean',
        '--if-exists',
        '--inserts'
    ], {
        env: {
            ...process.env,
            PGPASSWORD: '123'
        },
        maxBuffer: 50 * 1024 * 1024 // 50MB
    });

    if (res.error) {
        throw res.error;
    }
    if (res.status !== 0) {
        throw new Error(res.stderr.toString('utf8'));
    }

    let sqlText = res.stdout.toString('utf8');
    // Loại bỏ các meta-command của psql (\restrict, \unrestrict) để chạy mượt trong Query Tool của pgAdmin 4
    sqlText = sqlText.replace(/^\\.*$/gm, '-- $&');

    fs.writeFileSync(outputPath, sqlText, 'utf8');

    const stats = fs.statSync(outputPath);
    console.log(`✅ Xuất thành công file SQL: ${outputPath}`);
    console.log(`📦 Dung lượng file: ${(stats.size / 1024).toFixed(2)} KB`);
} catch (err) {
    console.error('❌ Lỗi khi xuất SQL:', err.message);
    process.exit(1);
}
