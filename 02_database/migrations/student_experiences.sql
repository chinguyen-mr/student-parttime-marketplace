-- Kinh nghiệm làm việc của sinh viên
CREATE TABLE IF NOT EXISTS student_experiences (
  id SERIAL PRIMARY KEY,
  student_profile_id INT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  description TEXT,
  start_date DATE,
  end_date DATE
);
CREATE INDEX IF NOT EXISTS idx_student_experiences_profile ON student_experiences(student_profile_id);
