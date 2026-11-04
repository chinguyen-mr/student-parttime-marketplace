-- =====================================================================
-- JOBNEST — BỔ SUNG 19 BẢNG CÒN THIẾU ĐỂ ĐỦ 30 BẢNG ERD
-- File: complete_remaining_tables.sql
-- Chạy 1 lần để hoàn thiện schema
-- =====================================================================

-- ---------------------------------------------------------------------
-- NHÓM 1: ACCOUNTS (3 bảng)
-- ---------------------------------------------------------------------

-- Bảng xác minh OTP (email + phone)
CREATE TABLE IF NOT EXISTS verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel VARCHAR(10) NOT NULL CHECK (channel IN ('EMAIL', 'PHONE')),
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  attempt_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user ON verification_tokens(user_id);

-- Bảng token đặt lại mật khẩu
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);

-- Bảng cấu hình hệ thống (bảng thứ 30 — không có trong ERD gốc nhưng hữu ích)
CREATE TABLE IF NOT EXISTS system_configs (
  config_key VARCHAR(100) PRIMARY KEY,
  config_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- NHÓM 2: STUDENT (4 bảng)
-- ---------------------------------------------------------------------

-- Kỹ năng của sinh viên
CREATE TABLE IF NOT EXISTS student_skills (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  proficiency VARCHAR(20) CHECK (proficiency IN ('BEGINNER', 'INTERMEDIATE', 'EXPERT')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id);

-- Học vấn của sinh viên
CREATE TABLE IF NOT EXISTS student_educations (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_name VARCHAR(255) NOT NULL,
  degree VARCHAR(255),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_student_educations_student ON student_educations(student_id);

-- Kinh nghiệm làm việc của sinh viên
CREATE TABLE IF NOT EXISTS student_experiences (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_student_experiences_student ON student_experiences(student_id);

-- CV của sinh viên (file upload)
CREATE TABLE IF NOT EXISTS student_cvs (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_size INT,
  mime_type VARCHAR(100),
  is_default BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_student_cvs_student ON student_cvs(student_id);

-- ---------------------------------------------------------------------
-- NHÓM 3: JOB (6 bảng)
-- ---------------------------------------------------------------------

-- Danh mục công việc
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  parent_id INT REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chi tiết Job Part-time
CREATE TABLE IF NOT EXISTS part_time_details (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE UNIQUE,
  shift_description VARCHAR(255),
  weekly_schedule TEXT,
  hours_per_week INT
);
CREATE INDEX IF NOT EXISTS idx_part_time_details_job ON part_time_details(job_id);

-- Chi tiết Job Seasonal
CREATE TABLE IF NOT EXISTS seasonal_details (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  schedule_description TEXT
);
CREATE INDEX IF NOT EXISTS idx_seasonal_details_job ON seasonal_details(job_id);

-- Chi tiết Job Freelance
CREATE TABLE IF NOT EXISTS freelance_details (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE UNIQUE,
  scope TEXT NOT NULL,
  deliverable_requirements TEXT NOT NULL,
  deadline DATE NOT NULL,
  revision_limit INT
);
CREATE INDEX IF NOT EXISTS idx_freelance_details_job ON freelance_details(job_id);

-- Kỹ năng yêu cầu cho Job
CREATE TABLE IF NOT EXISTS job_skills (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_job_skills_job ON job_skills(job_id);

-- Lượt xem Job (analytics)
CREATE TABLE IF NOT EXISTS job_views (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  viewer_id INT REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_job_views_job ON job_views(job_id);

-- ---------------------------------------------------------------------
-- NHÓM 4: WORK (3 bảng)
-- ---------------------------------------------------------------------

-- Tiến độ công việc (cập nhật %)
CREATE TABLE IF NOT EXISTS work_progress (
  id SERIAL PRIMARY KEY,
  assignment_id INT NOT NULL REFERENCES work_assignments(id) ON DELETE CASCADE,
  progress_percent INT CHECK (progress_percent >= 0 AND progress_percent <= 100),
  description TEXT,
  updated_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_work_progress_assignment ON work_progress(assignment_id);

-- Sản phẩm bàn giao Freelance
CREATE TABLE IF NOT EXISTS work_deliverables (
  id SERIAL PRIMARY KEY,
  assignment_id INT NOT NULL REFERENCES work_assignments(id) ON DELETE CASCADE,
  submitted_by INT NOT NULL REFERENCES users(id),
  version_no INT NOT NULL DEFAULT 1,
  file_url VARCHAR(500),
  description TEXT,
  status VARCHAR(30) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'ACCEPTED', 'REVISION_REQUESTED')),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (assignment_id, version_no)
);
CREATE INDEX IF NOT EXISTS idx_work_deliverables_assignment ON work_deliverables(assignment_id);

-- Đánh giá nghiệm thu Deliverable
CREATE TABLE IF NOT EXISTS deliverable_reviews (
  id SERIAL PRIMARY KEY,
  deliverable_id INT NOT NULL REFERENCES work_deliverables(id) ON DELETE CASCADE,
  reviewed_by INT NOT NULL REFERENCES users(id),
  decision VARCHAR(30) NOT NULL CHECK (decision IN ('ACCEPTED', 'REVISION_REQUESTED')),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_deliverable_reviews_deliverable ON deliverable_reviews(deliverable_id);

-- ---------------------------------------------------------------------
-- NHÓM 5: SYSTEM (3 bảng)
-- ---------------------------------------------------------------------

-- Báo cáo vi phạm (từ user)
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('JOB', 'USER')),
  target_id INT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Hành động xử lý báo cáo (bởi Admin)
CREATE TABLE IF NOT EXISTS report_actions (
  id SERIAL PRIMARY KEY,
  report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  admin_id INT NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_report_actions_report ON report_actions(report_id);

-- Nhật ký hoạt động Admin
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);

-- =====================================================================
-- KẾT THÚC — 19 bảng đã tạo
-- Tổng DB sau khi chạy: 11 (cũ) + 19 (mới) = 30 bảng
-- =====================================================================
