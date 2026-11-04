-- Việc làm đã lưu của người dùng
CREATE TABLE IF NOT EXISTS job_saved (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);
CREATE INDEX IF NOT EXISTS idx_job_saved_user ON job_saved(user_id);
