"""
=============================================================================
JOBNEST - SMART POSTGRESQL IMPORT PIPELINE (Data_v2.xlsx)
Senior Data Engineer:
- Tự động map dữ liệu giữa Excel và PostgreSQL
- Xử lý các Check Constraints (status 'LOCKED' -> 'BANNED', 'RECRUITING' -> 'OPEN')
- Đồng bộ cả work_assignments và work_progress cho sheet TienDoCongViec
- Chuẩn hóa Notifications (title, body, target_id)
- Tự động cập nhật sequence (setval) sau khi nạp xong
=============================================================================
"""

import os
import sys
import math

# Khắc phục lỗi font Unicode / Emoji trên Windows Terminal (cp1252)
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import pandas as pd
from datetime import datetime, date
from sqlalchemy import create_engine, text

# 1. CẤU HÌNH DATABASE POSTGRESQL
ENV_PATH = os.path.join(os.path.dirname(__file__), "03_backend", ".env")
DB_HOST = "localhost"
DB_PORT = "5432"
DB_USER = "postgres"
DB_PASS = "123"
DB_NAME = "cd2_marketplace_db"

if os.path.exists(ENV_PATH):
    try:
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("DB_HOST="):
                    DB_HOST = line.split("=", 1)[1].strip()
                elif line.startswith("DB_PORT="):
                    DB_PORT = line.split("=", 1)[1].strip()
                elif line.startswith("DB_USER="):
                    DB_USER = line.split("=", 1)[1].strip()
                elif line.startswith("DB_PASSWORD="):
                    DB_PASS = line.split("=", 1)[1].strip()
                elif line.startswith("DB_NAME="):
                    DB_NAME = line.split("=", 1)[1].strip()
    except Exception as e:
        print(f"Lưu ý: Không đọc được .env ({e}), dùng thông số mặc định.")

DB_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# 2. ĐƯỜNG DẪN FILE EXCEL
EXCEL_FILE_PATH = r"D:\Tai Lieu\DuLieuHoc\Đồ Án Tốt Nghiệp\Chuyên Đề 2\Dự án\Data_v2.xlsx"

# 3. CỜ XÓA SẠCH DỮ LIỆU CŨ TRƯỚC KHI IMPORT
RESET_DB_BEFORE_IMPORT = True

# 4. HÀM CHUẨN HÓA DỮ LIỆU
def parse_excel_date(val):
    if val is None or pd.isna(val) or val == "" or str(val).strip() == "":
        return None
    if isinstance(val, (int, float)):
        try:
            dt = pd.to_datetime(val, unit='D', origin='1899-12-30')
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except Exception:
            return None
    if isinstance(val, (datetime, pd.Timestamp)):
        return val.strftime('%Y-%m-%d %H:%M:%S')
    if isinstance(val, date):
        return val.strftime('%Y-%m-%d 00:00:00')
    val_str = str(val).strip()
    try:
        dt = pd.to_datetime(val_str)
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except Exception:
        return None

def clean_val(v):
    if pd.isna(v) or v is None or (isinstance(v, float) and math.isnan(v)):
        return None
    if isinstance(v, str) and v.strip() == "":
        return None
    return v

# 5. THỰC THI PIPELINE IMPORT
def run_import():
    print(f"🚀 Kết nối DB: {DB_HOST}:{DB_PORT}/{DB_NAME} (User: {DB_USER})")
    print(f"📂 Đọc file Excel từ: {EXCEL_FILE_PATH}")
    if not os.path.exists(EXCEL_FILE_PATH):
        raise FileNotFoundError(f"Không tìm thấy file Excel tại {EXCEL_FILE_PATH}")

    engine = create_engine(DB_URL)
    excel_file = pd.ExcelFile(EXCEL_FILE_PATH)

    with engine.begin() as conn:
        # BƯỚC A: TRUNCATE SẠCH DỮ LIỆU CŨ NẾU ĐƯỢC BẬT
        if RESET_DB_BEFORE_IMPORT:
            print("\n🧹 Đang làm sạch dữ liệu cũ (TRUNCATE ... RESTART IDENTITY CASCADE)...")
            tables_to_clean = [
                "password_reset_tokens", "notifications", "reviews", 
                "work_progress", "work_deliverables", "work_assignments",
                "applications", "freelance_proposals", "jobs", 
                "employer_profiles", "student_profiles", "users", "categories"
            ]
            conn.execute(text(f"TRUNCATE TABLE {', '.join(tables_to_clean)} RESTART IDENTITY CASCADE;"))
            print("   ✅ Đã làm sạch các bảng dữ liệu.")

        # 1. CATEGORIES (NganhNghe)
        print("\n📦 Đang xử lý Sheet [NganhNghe] -> Bảng [categories]...")
        df_cat = pd.read_excel(excel_file, sheet_name="NganhNghe", dtype=str)
        cat_records = []
        cat_id_to_name = {}
        for _, r in df_cat.iterrows():
            cid = int(r["category_id"])
            cname = str(r["name"]).strip()
            cat_id_to_name[str(cid)] = cname
            cat_records.append({
                "id": cid,
                "name": cname,
                "is_active": True
            })
        conn.execute(text("INSERT INTO categories (id, name, is_active) VALUES (:id, :name, :is_active)"), cat_records)
        print(f"   ✅ Đã import {len(cat_records)} dòng vào bảng [categories].")

        # 2. USERS (NguoiDung)
        print("\n📦 Đang xử lý Sheet [NguoiDung] -> Bảng [users]...")
        df_users = pd.read_excel(excel_file, sheet_name="NguoiDung", dtype=str)
        user_records = []
        for _, r in df_users.iterrows():
            status_val = str(r.get("status") or "ACTIVE").strip().upper()
            # Khắc phục users_status_check: chỉ cho phép 'ACTIVE', 'BANNED', 'PENDING'
            if status_val in ["LOCKED", "INACTIVE"]:
                status_val = "BANNED"
            elif status_val not in ["ACTIVE", "BANNED", "PENDING"]:
                status_val = "ACTIVE"

            user_records.append({
                "id": int(r["user_id"]),
                "email": str(r["email"]).strip(),
                "password_hash": str(r["password_hash"]).strip(),
                "full_name": str(r["full_name"]).strip(),
                "phone": clean_val(r.get("phone")),
                "role": str(r["role"]).strip().upper(),
                "status": status_val,
                "created_at": parse_excel_date(r.get("created_at")),
                "updated_at": parse_excel_date(r.get("updated_at"))
            })
        conn.execute(text("""
            INSERT INTO users (id, email, password_hash, full_name, phone, role, status, created_at, updated_at)
            VALUES (:id, :email, :password_hash, :full_name, :phone, :role, :status, :created_at, :updated_at)
        """), user_records)
        print(f"   ✅ Đã import {len(user_records)} dòng vào bảng [users].")

        # 3. STUDENT_PROFILES (HoSoSinhVien)
        print("\n📦 Đang xử lý Sheet [HoSoSinhVien] -> Bảng [student_profiles]...")
        df_students = pd.read_excel(excel_file, sheet_name="HoSoSinhVien", dtype=str)
        student_records = []
        for _, r in df_students.iterrows():
            student_records.append({
                "user_id": int(r["student_id"]),
                "full_name": str(r.get("student_name") or "").strip() or "Sinh viên",
                "school": clean_val(r.get("university")),
                "major": clean_val(r.get("major")),
                "bio": clean_val(r.get("bio") or r.get("experience")),
                "avatar_url": clean_val(r.get("default_cv_url"))
            })
        conn.execute(text("""
            INSERT INTO student_profiles (user_id, full_name, school, major, bio, avatar_url)
            VALUES (:user_id, :full_name, :school, :major, :bio, :avatar_url)
        """), student_records)
        print(f"   ✅ Đã import {len(student_records)} dòng vào bảng [student_profiles].")

        # 4. EMPLOYER_PROFILES (NhaTuyenDung)
        print("\n📦 Đang xử lý Sheet [NhaTuyenDung] -> Bảng [employer_profiles]...")
        df_employers = pd.read_excel(excel_file, sheet_name="NhaTuyenDung", dtype=str)
        employer_records = []
        for _, r in df_employers.iterrows():
            employer_records.append({
                "user_id": int(r["employer_id"]),
                "display_name": str(r.get("company_name") or r.get("representative_name") or "").strip(),
                "bio": clean_val(r.get("company_description")),
                "location": clean_val(r.get("google_maps_address") or r.get("city")),
                "avatar_url": clean_val(r.get("company_logo_url")),
                "account_type": clean_val(r.get("account_type")),
                "tax_code": clean_val(r.get("tax_code")),
                "website": clean_val(r.get("website")),
                "business_license_file": clean_val(r.get("business_license_file"))
            })
        conn.execute(text("""
            INSERT INTO employer_profiles (user_id, display_name, bio, location, avatar_url, account_type, tax_code, website, business_license_file)
            VALUES (:user_id, :display_name, :bio, :location, :avatar_url, :account_type, :tax_code, :website, :business_license_file)
        """), employer_records)
        print(f"   ✅ Đã import {len(employer_records)} dòng vào bảng [employer_profiles].")

        # 5. JOBS (TinTuyenDung)
        print("\n📦 Đang xử lý Sheet [TinTuyenDung] -> Bảng [jobs]...")
        df_jobs = pd.read_excel(excel_file, sheet_name="TinTuyenDung", dtype=str)
        job_records = []
        for _, r in df_jobs.iterrows():
            # Khắc phục jobs_status_check ('RECRUITING' -> 'OPEN')
            status_val = str(r.get("job_status") or "OPEN").strip().upper()
            if status_val == "RECRUITING":
                status_val = "OPEN"
            elif status_val not in ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'CLOSED', 'EXPIRED', 'REJECTED', 'OPEN', 'FILLED', 'COMPLETED']:
                status_val = "OPEN"

            # salary_type
            sunit = str(r.get("salary_unit") or "").upper()
            stype = "HOURLY" if "HOUR" in sunit else ("MONTHLY" if "MONTH" in sunit else "PROJECT")

            # category
            cat_name = clean_val(r.get("category"))
            if not cat_name:
                cid = str(r.get("category_id") or "")
                cat_name = cat_id_to_name.get(cid, "Bán lẻ")

            job_records.append({
                "id": int(r["job_id"]),
                "employer_id": int(r["employer_id"]),
                "title": str(r["title"]).strip(),
                "description": str(r["description"]).strip(),
                "requirements": clean_val(r.get("requirements")),
                "benefits": clean_val(r.get("benefits")),
                "category": cat_name,
                "location": clean_val(r.get("exact_google_address") or r.get("province_city") or "TP.HCM"),
                "salary_type": stype,
                "salary": float(r.get("salary_amount") or 35000),
                "work_type": clean_val(r.get("work_time") or "PART_TIME"),
                "status": status_val,
                "moderation_status": str(r.get("moderation_status") or "APPROVED").strip().upper(),
                "application_deadline": parse_excel_date(r.get("application_deadline")),
                "job_banner_url": clean_val(r.get("job_banner_url")),
                "created_at": parse_excel_date(r.get("posted_date")),
                "updated_at": parse_excel_date(r.get("updated_at"))
            })
        conn.execute(text("""
            INSERT INTO jobs (
                id, employer_id, title, description, requirements, benefits, 
                category, location, salary_type, salary, work_type, status, 
                moderation_status, application_deadline, job_banner_url, created_at, updated_at
            )
            VALUES (
                :id, :employer_id, :title, :description, :requirements, :benefits,
                :category, :location, :salary_type, :salary, :work_type, :status,
                :moderation_status, :application_deadline, :job_banner_url, :created_at, :updated_at
            )
        """), job_records)
        print(f"   ✅ Đã import {len(job_records)} dòng vào bảng [jobs].")

        # 6. APPLICATIONS (HoSoUngTuyen)
        print("\n📦 Đang xử lý Sheet [HoSoUngTuyen] -> Bảng [applications]...")
        df_apps = pd.read_excel(excel_file, sheet_name="HoSoUngTuyen", dtype=str)
        app_records = []
        for _, r in df_apps.iterrows():
            app_records.append({
                "id": int(r["application_id"]),
                "job_id": int(r["job_id"]),
                "student_id": int(r["student_id"]),
                "cover_letter": clean_val(r.get("cover_letter")),
                "cv_url": clean_val(r.get("cv_file_name")),
                "status": str(r.get("status") or "PENDING").strip().upper(),
                "applied_at": parse_excel_date(r.get("applied_date")),
                "updated_at": parse_excel_date(r.get("decided_at"))
            })
        conn.execute(text("""
            INSERT INTO applications (id, job_id, student_id, cover_letter, cv_url, status, applied_at, updated_at)
            VALUES (:id, :job_id, :student_id, :cover_letter, :cv_url, :status, :applied_at, :updated_at)
        """), app_records)
        print(f"   ✅ Đã import {len(app_records)} dòng vào bảng [applications].")

        # 7. WORK_ASSIGNMENTS & WORK_PROGRESS (TienDoCongViec)
        print("\n📦 Đang xử lý Sheet [TienDoCongViec] -> Bảng [work_assignments] & [work_progress]...")
        df_progress = pd.read_excel(excel_file, sheet_name="TienDoCongViec", dtype=str)
        assignment_records = []
        progress_records = []
        for _, r in df_progress.iterrows():
            pid = int(r["progress_id"])
            aid = int(r["application_id"])
            jid = int(r["job_id"])
            sid = int(r["student_id"])
            cstatus = str(r.get("current_status") or "IN_PROGRESS").strip().upper()
            st_val = "COMPLETED" if cstatus == "COMPLETED" else "IN_PROGRESS"
            
            started_dt = parse_excel_date(r.get("started_at"))
            completed_dt = parse_excel_date(r.get("completed_at"))
            updated_dt = parse_excel_date(r.get("updated_at"))

            assignment_records.append({
                "id": pid,
                "job_id": jid,
                "student_id": sid,
                "application_id": aid,
                "status": st_val,
                "started_at": started_dt,
                "completed_at": completed_dt,
                "created_at": started_dt or updated_dt,
                "updated_at": updated_dt
            })

            progress_records.append({
                "id": pid,
                "assignment_id": pid,
                "updated_by": sid,
                "progress_percent": 100 if st_val == "COMPLETED" else 50,
                "description": clean_val(r.get("note") or f"Trạng thái: {cstatus}"),
                "started_at": started_dt,
                "created_at": updated_dt or started_dt
            })

        conn.execute(text("""
            INSERT INTO work_assignments (id, job_id, student_id, application_id, status, started_at, completed_at, created_at, updated_at)
            VALUES (:id, :job_id, :student_id, :application_id, :status, :started_at, :completed_at, :created_at, :updated_at)
        """), assignment_records)
        
        conn.execute(text("""
            INSERT INTO work_progress (id, assignment_id, updated_by, progress_percent, description, started_at, created_at)
            VALUES (:id, :assignment_id, :updated_by, :progress_percent, :description, :started_at, :created_at)
        """), progress_records)
        print(f"   ✅ Đã import {len(assignment_records)} dòng vào [work_assignments] và [work_progress].")

        # 8. REVIEWS (DanhGiaHaiChieu)
        print("\n📦 Đang xử lý Sheet [DanhGiaHaiChieu] -> Bảng [reviews]...")
        df_reviews = pd.read_excel(excel_file, sheet_name="DanhGiaHaiChieu", dtype=str)
        review_records = []
        for _, r in df_reviews.iterrows():
            review_records.append({
                "id": int(r["review_id"]),
                "job_id": int(r["job_id"]),
                "reviewer_id": int(r["reviewer_id"]),
                "reviewee_id": int(r["reviewee_id"]),
                "rating": int(r["rating"]),
                "comment": clean_val(r.get("comment")),
                "created_at": parse_excel_date(r.get("created_date"))
            })
        conn.execute(text("""
            INSERT INTO reviews (id, job_id, reviewer_id, reviewee_id, rating, comment, created_at)
            VALUES (:id, :job_id, :reviewer_id, :reviewee_id, :rating, :comment, :created_at)
        """), review_records)
        print(f"   ✅ Đã import {len(review_records)} dòng vào bảng [reviews].")

        # 9. NOTIFICATIONS (ThongBao)
        print("\n📦 Đang xử lý Sheet [ThongBao] -> Bảng [notifications]...")
        df_notifs = pd.read_excel(excel_file, sheet_name="ThongBao", dtype=str)
        notif_records = []
        for _, r in df_notifs.iterrows():
            created_dt = parse_excel_date(r.get("created_at"))
            is_read = str(r.get("is_read") or "0").strip() in ["1", "true", "t"]
            
            notif_records.append({
                "id": int(r["notification_id"]),
                "user_id": int(r["user_id"]),
                "type": str(r.get("type") or "NEW_APPLICATION").strip(),
                "title": f"Thông báo: {str(r.get('type') or 'Tin tuyển dụng')}",
                "body": str(r.get("content") or "").strip(),
                "target_type": "APPLICATION" if clean_val(r.get("application_id")) else None,
                "target_id": int(r["application_id"]) if clean_val(r.get("application_id")) else None,
                "read_at": created_dt if is_read else None,
                "created_at": created_dt
            })
        conn.execute(text("""
            INSERT INTO notifications (id, user_id, type, title, body, target_type, target_id, read_at, created_at)
            VALUES (:id, :user_id, :type, :title, :body, :target_type, :target_id, :read_at, :created_at)
        """), notif_records)
        print(f"   ✅ Đã import {len(notif_records)} dòng vào bảng [notifications].")

        # 10. PASSWORD_RESET_TOKENS (MaDatLaiMatKhau)
        print("\n📦 Đang xử lý Sheet [MaDatLaiMatKhau] -> Bảng [password_reset_tokens]...")
        df_tokens = pd.read_excel(excel_file, sheet_name="MaDatLaiMatKhau", dtype=str)
        token_records = []
        for _, r in df_tokens.iterrows():
            token_records.append({
                "id": int(r["token_id"]),
                "user_id": int(r["user_id"]),
                "token_hash": str(r["token_hash"]).strip(),
                "expires_at": parse_excel_date(r.get("expires_at")),
                "used_at": parse_excel_date(r.get("used_at")),
                "created_at": parse_excel_date(r.get("created_at"))
            })
        conn.execute(text("""
            INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at)
            VALUES (:id, :user_id, :token_hash, :expires_at, :used_at, :created_at)
        """), token_records)
        print(f"   ✅ Đã import {len(token_records)} dòng vào bảng [password_reset_tokens].")

        # BƯỚC C: TỰ ĐỘNG RESET SEQUENCE (setval) CHO TẤT CẢ BẢNG
        print("\n⚙️ Đang tự động cập nhật PostgreSQL Sequences (setval)...")
        tables_to_seq = [
            "categories", "users", "jobs", "applications", 
            "work_assignments", "work_progress", "reviews", 
            "notifications", "password_reset_tokens"
        ]
        for tbl in tables_to_seq:
            try:
                seq_query = text(f"SELECT pg_get_serial_sequence('{tbl}', 'id');")
                seq_name = conn.execute(seq_query).scalar()
                if seq_name:
                    setval_sql = text(f"SELECT setval('{seq_name}', COALESCE((SELECT MAX(id) FROM {tbl}), 1));")
                    conn.execute(setval_sql)
                    print(f"   🔄 Sequence [{seq_name}] đã cập nhật.")
            except Exception as e:
                pass

    print("\n🎉 HOÀN TẤT IMPORT TOÀN BỘ 10 SHEET VÀO DATABASE POSTGRESQL THÀNH CÔNG RỰC RỠ!")

if __name__ == "__main__":
    run_import()
