-- =====================================================================
-- JOBNEST — ĐỒNG BỘ ERD PART 1: RENAME VÀ TÁCH PROFILE
-- File: sync_erd_part1_rename.sql
-- =====================================================================

-- 1. Đổi tên bảng profiles thành student_profiles và employer_profiles
-- (Hiện tại DB đang dùng bảng profiles chung cho cả 2 role)
-- Tạo 2 bảng mới copy cấu trúc từ profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  school VARCHAR(255),
  major VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  location VARCHAR(255),
  avatar_url VARCHAR(500),
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Copy data từ bảng profiles cũ sang 2 bảng mới
INSERT INTO student_profiles (user_id, full_name, avatar_url, bio, school, major, created_at, updated_at)
SELECT p.user_id, u.full_name, p.avatar_url, p.bio, p.university, p.major, NOW(), p.updated_at
FROM profiles p
JOIN users u ON u.id = p.user_id
WHERE u.role = 'STUDENT'
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url;

-- Đảm bảo sinh viên chưa có profile cũng có bản ghi cơ bản
INSERT INTO student_profiles (user_id, full_name, created_at, updated_at)
SELECT u.id, u.full_name, NOW(), NOW()
FROM users u
WHERE u.role = 'STUDENT'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO employer_profiles (user_id, display_name, avatar_url, bio, location, created_at, updated_at)
SELECT p.user_id, COALESCE(p.company_name, u.full_name), COALESCE(p.company_logo_url, p.avatar_url), p.bio, p.company_address, NOW(), p.updated_at
FROM profiles p
JOIN users u ON u.id = p.user_id
WHERE u.role = 'EMPLOYER'
ON CONFLICT (user_id) DO UPDATE 
SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url;

-- Đảm bảo nhà tuyển dụng chưa có profile cũng có bản ghi cơ bản
INSERT INTO employer_profiles (user_id, display_name, created_at, updated_at)
SELECT u.id, u.full_name, NOW(), NOW()
FROM users u
WHERE u.role = 'EMPLOYER'
ON CONFLICT (user_id) DO NOTHING;

-- Đổi tên saved_jobs thành job_saved
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_jobs') THEN
    ALTER TABLE saved_jobs RENAME TO job_saved;
  END IF;
END $$;

-- Đổi tên proposals thành freelance_proposals
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'proposals') THEN
    ALTER TABLE proposals RENAME TO freelance_proposals;
  END IF;
END $$;
