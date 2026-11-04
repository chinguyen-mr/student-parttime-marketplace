-- Học vấn của sinh viên
CREATE TABLE IF NOT EXISTS student_educations (
  id SERIAL PRIMARY KEY,
  student_profile_id INT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255),
  start_date DATE,
  end_date DATE CHECK (end_date > start_date)
);
CREATE INDEX IF NOT EXISTS idx_student_educations_profile ON student_educations(student_profile_id);
