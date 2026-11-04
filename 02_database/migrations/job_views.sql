-- Lượt xem và tương tác tin tuyển dụng
CREATE TABLE IF NOT EXISTS job_views (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  viewer_id INT REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_job_views_job ON job_views(job_id);
