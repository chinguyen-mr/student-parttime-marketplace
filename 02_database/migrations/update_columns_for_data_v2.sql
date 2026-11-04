-- =============================================================================
-- MIGRATION: BỔ SUNG CỘT CHO BẢNG EMPLOYER_PROFILES, JOBS, WORK_PROGRESS (PostgreSQL)
-- Đồng bộ theo Data_v2.xlsx
-- =============================================================================

-- 1. Bổ sung các cột cho EMPLOYER_PROFILES
ALTER TABLE employer_profiles
  ADD COLUMN IF NOT EXISTS account_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS tax_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS website VARCHAR(255),
  ADD COLUMN IF NOT EXISTS business_license_file VARCHAR(255);

-- 2. Bổ sung các cột cho JOBS
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMP,
  ADD COLUMN IF NOT EXISTS job_banner_url VARCHAR(500);

-- 3. Bổ sung cột cho WORK_PROGRESS
ALTER TABLE work_progress
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;

-- 4. Kiểm tra cấu trúc các cột vừa bổ sung
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('employer_profiles', 'jobs', 'work_progress')
  AND column_name IN (
    'account_type', 'tax_code', 'website', 'business_license_file', 
    'application_deadline', 'job_banner_url', 'started_at'
  )
ORDER BY table_name, column_name;
