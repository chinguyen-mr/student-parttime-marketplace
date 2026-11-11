-- =============================================================================
-- MIGRATION: 005_registration_redesign_profiles.sql
-- Thêm các trường hỗ trợ Quy trình Đăng ký 2 bước cho Candidate & Employer
-- Đảm bảo an toàn 100% với ADD COLUMN IF NOT EXISTS
-- =============================================================================

-- 1. Mở rộng thông tin bảng student_profiles (Ứng viên)
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
  ADD COLUMN IF NOT EXISTS province VARCHAR(255),
  ADD COLUMN IF NOT EXISTS interested_category VARCHAR(255),
  ADD COLUMN IF NOT EXISTS desired_position VARCHAR(255),
  ADD COLUMN IF NOT EXISTS detailed_address TEXT,
  ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS desired_salary VARCHAR(100),
  ADD COLUMN IF NOT EXISTS desired_work_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS profile_completion_rate INT DEFAULT 30,
  ADD COLUMN IF NOT EXISTS is_profile_completed BOOLEAN DEFAULT FALSE;

-- 2. Mở rộng thông tin bảng employer_profiles (Nhà tuyển dụng)
ALTER TABLE employer_profiles
  ADD COLUMN IF NOT EXISTS representative_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS representative_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS company_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS industry VARCHAR(255),
  ADD COLUMN IF NOT EXISTS company_size VARCHAR(100),
  ADD COLUMN IF NOT EXISTS province VARCHAR(255),
  ADD COLUMN IF NOT EXISTS detailed_address TEXT,
  ADD COLUMN IF NOT EXISTS cover_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS recruiter_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS recruiter_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS work_environment_desc TEXT,
  ADD COLUMN IF NOT EXISTS office_images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'UNVERIFIED',
  ADD COLUMN IF NOT EXISTS profile_completion_rate INT DEFAULT 30,
  ADD COLUMN IF NOT EXISTS is_profile_completed BOOLEAN DEFAULT FALSE;

-- 3. Tạo index phục vụ tìm kiếm và thống kê
CREATE INDEX IF NOT EXISTS idx_student_profiles_province ON student_profiles(province);
CREATE INDEX IF NOT EXISTS idx_student_profiles_category ON student_profiles(interested_category);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_industry ON employer_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_province ON employer_profiles(province);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_vstatus ON employer_profiles(verification_status);

