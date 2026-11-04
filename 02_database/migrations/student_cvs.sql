-- Danh sách file CV của sinh viên
CREATE TABLE IF NOT EXISTS student_cvs (
  id SERIAL PRIMARY KEY,
  student_profile_id INT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  file_key VARCHAR(500) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  size_bytes INT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_student_cvs_profile ON student_cvs(student_profile_id);
