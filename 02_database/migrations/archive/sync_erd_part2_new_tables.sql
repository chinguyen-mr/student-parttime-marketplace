-- =====================================================================
-- JOBNEST — ĐỒNG BỘ ERD PART 2: CÁC BẢNG THEO CHUẨN ERD
-- File: sync_erd_part2_new_tables.sql
-- =====================================================================

-- Dọn dẹp các bảng phụ trợ khác cấu trúc nếu có từ lần chạy trước
DROP TABLE IF EXISTS deliverable_reviews CASCADE;
DROP TABLE IF EXISTS work_deliverables CASCADE;
DROP TABLE IF EXISTS work_progress CASCADE;
DROP TABLE IF EXISTS report_actions CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS job_views CASCADE;
DROP TABLE IF EXISTS job_skills CASCADE;
DROP TABLE IF EXISTS freelance_details CASCADE;
DROP TABLE IF EXISTS seasonal_details CASCADE;
DROP TABLE IF EXISTS part_time_details CASCADE;
DROP TABLE IF EXISTS student_cvs CASCADE;
DROP TABLE IF EXISTS student_experiences CASCADE;
DROP TABLE IF EXISTS student_educations CASCADE;
DROP TABLE IF EXISTS student_skills CASCADE;
DROP TABLE IF EXISTS system_configs CASCADE;

-- ---------------------------------------------------------------------
-- NHÓM TÀI KHOẢN (2 bảng)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel VARCHAR(10) CHECK (channel IN ('EMAIL', 'PHONE')),
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  attempt_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- NHÓM STUDENT (4 bảng - chuẩn hóa FK sang student_profiles)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS student_skills (
  id SERIAL PRIMARY KEY,
  student_profile_id INT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS student_educations (
  id SERIAL PRIMARY KEY,
  student_profile_id INT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255),
  start_date DATE,
  end_date DATE CHECK (end_date > start_date)
);

CREATE TABLE IF NOT EXISTS student_experiences (
  id SERIAL PRIMARY KEY,
  student_profile_id INT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  description TEXT,
  start_date DATE,
  end_date DATE
);

CREATE TABLE IF NOT EXISTS student_cvs (
  id SERIAL PRIMARY KEY,
  student_profile_id INT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  file_key VARCHAR(500) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  size_bytes INT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- NHÓM JOB (6 bảng)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  parent_id INT REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS part_time_details (
  job_id INT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
  shift_description VARCHAR(255),
  weekly_schedule TEXT,
  hours_per_week INT
);

CREATE TABLE IF NOT EXISTS seasonal_details (
  job_id INT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  schedule_description TEXT
);

CREATE TABLE IF NOT EXISTS freelance_details (
  job_id INT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  deliverable_requirements TEXT NOT NULL,
  deadline DATE NOT NULL,
  revision_limit INT
);

CREATE TABLE IF NOT EXISTS job_skills (
  job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
  skill_name VARCHAR(100),
  PRIMARY KEY (job_id, skill_name)
);

CREATE TABLE IF NOT EXISTS job_views (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  viewer_id INT REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- NHÓM WORK (3 bảng)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS work_progress (
  id SERIAL PRIMARY KEY,
  assignment_id INT NOT NULL REFERENCES work_assignments(id) ON DELETE CASCADE,
  updated_by INT NOT NULL REFERENCES users(id),
  progress_percent INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_deliverables (
  id SERIAL PRIMARY KEY,
  assignment_id INT NOT NULL REFERENCES work_assignments(id) ON DELETE CASCADE,
  submitted_by INT NOT NULL REFERENCES users(id),
  version_no INT NOT NULL,
  file_key VARCHAR(500),
  description TEXT,
  status VARCHAR(30) CHECK (status IN ('SUBMITTED', 'ACCEPTED', 'REVISION_REQUESTED')),
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (assignment_id, version_no)
);

CREATE TABLE IF NOT EXISTS deliverable_reviews (
  id SERIAL PRIMARY KEY,
  deliverable_id INT NOT NULL REFERENCES work_deliverables(id) ON DELETE CASCADE,
  reviewed_by INT NOT NULL REFERENCES users(id),
  decision VARCHAR(30) CHECK (decision IN ('ACCEPTED', 'REVISION_REQUESTED')),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- NHÓM HỆ THỐNG (3 bảng)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) CHECK (target_type IN ('JOB', 'USER')),
  target_id INT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_actions (
  id SERIAL PRIMARY KEY,
  report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  admin_id INT NOT NULL REFERENCES users(id),
  action VARCHAR(100),
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
