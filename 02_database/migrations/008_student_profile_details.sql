-- =============================================================================
-- MIGRATION: 008_student_profile_details.sql
-- Bổ sung thông tin học vấn cho hồ sơ xin việc sinh viên.
-- Chạy lại nhiều lần vẫn an toàn (idempotent).
-- =============================================================================

ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS year_of_study   VARCHAR(30),     -- 'Năm 1'..'Năm 5', 'Đã tốt nghiệp'
  ADD COLUMN IF NOT EXISTS graduation_year SMALLINT,        -- năm tốt nghiệp (dự kiến)
  ADD COLUMN IF NOT EXISTS gpa             NUMERIC(4, 2);   -- thang 4 hoặc 10

ALTER TABLE student_profiles DROP CONSTRAINT IF EXISTS student_profiles_gpa_check;
ALTER TABLE student_profiles ADD CONSTRAINT student_profiles_gpa_check CHECK (gpa IS NULL OR (gpa >= 0 AND gpa <= 10));

ALTER TABLE student_profiles DROP CONSTRAINT IF EXISTS student_profiles_graduation_year_check;
ALTER TABLE student_profiles ADD CONSTRAINT student_profiles_graduation_year_check
  CHECK (graduation_year IS NULL OR graduation_year BETWEEN 1990 AND 2100);

CREATE INDEX IF NOT EXISTS idx_student_experiences_profile ON student_experiences(student_profile_id);

-- Chuyển nội dung "kinh nghiệm" dạng văn bản cũ thành 1 mục kinh nghiệm có cấu trúc (nếu chưa có mục nào)
INSERT INTO student_experiences (student_profile_id, title, description)
SELECT sp.id, 'Kinh nghiệm làm việc', sp.experience
FROM student_profiles sp
WHERE sp.experience IS NOT NULL AND btrim(sp.experience) <> ''
  AND NOT EXISTS (SELECT 1 FROM student_experiences se WHERE se.student_profile_id = sp.id);
