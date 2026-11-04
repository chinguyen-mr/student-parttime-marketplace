-- Migration 002: Bổ sung các trường chi tiết công việc, hồ sơ doanh nghiệp và bảng lưu việc làm yêu thích (saved_jobs)

-- 1. Mở rộng bảng jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS benefits TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience VARCHAR(100) DEFAULT 'Không yêu cầu kinh nghiệm';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS education VARCHAR(100) DEFAULT 'Đại học / Cao đẳng';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS headcount INT DEFAULT 1;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS level VARCHAR(100) DEFAULT 'Nhân viên';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deadline DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days');
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_schedule TEXT;

-- 2. Mở rộng bảng profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_size VARCHAR(100) DEFAULT '25 - 99 nhân viên';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_industry VARCHAR(150) DEFAULT 'Công nghệ thông tin & Phần mềm';

-- 3. Tạo bảng saved_jobs (Lưu tin yêu thích)
CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_saved_job UNIQUE (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
