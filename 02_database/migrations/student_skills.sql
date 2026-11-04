-- Kỹ năng của sinh viên
CREATE TABLE IF NOT EXISTS student_skills (
  id SERIAL PRIMARY KEY,
  student_profile_id INT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_student_skills_profile ON student_skills(student_profile_id);
