-- =============================================================================
-- MIGRATION 003: TẠO CẤU TRÚC DỮ LIỆU LỊCH RẢNH SINH VIÊN VÀ CA LÀM VIỆC DOANH NGHIỆP
-- Dự án: JOBNEST
-- Khóa ngoại: users(id) [INT], jobs(id) [INT]
-- Quy ước ngày trong tuần: 1 = Chủ Nhật, 2 = Thứ Hai, ..., 7 = Thứ Bảy
-- =============================================================================

-- 1. BẢNG LỊCH RẢNH SINH VIÊN (STUDENT_AVAILABILITIES)
CREATE TABLE IF NOT EXISTS student_availabilities (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_student_time_range CHECK (end_time > start_time),
    CONSTRAINT uq_student_avail_slot UNIQUE (student_id, day_of_week, start_time, end_time)
);

CREATE INDEX IF NOT EXISTS idx_student_avail_lookup 
    ON student_availabilities (student_id, day_of_week) 
    WHERE is_active = TRUE;

-- 2. BẢNG CA LÀM VIỆC YÊU CẦU CỦA CÔNG VIỆC (JOB_WORK_SCHEDULES)
CREATE TABLE IF NOT EXISTS job_work_schedules (
    id SERIAL PRIMARY KEY,
    job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    min_hours_per_shift NUMERIC(4, 2) DEFAULT 0 CHECK (min_hours_per_shift >= 0),
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_job_time_range CHECK (end_time > start_time),
    CONSTRAINT uq_job_schedule_slot UNIQUE (job_id, day_of_week, start_time, end_time)
);

CREATE INDEX IF NOT EXISTS idx_job_schedule_lookup 
    ON job_work_schedules (job_id, day_of_week);

