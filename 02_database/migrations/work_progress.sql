-- Cập nhật tiến độ % thực hiện công việc
CREATE TABLE IF NOT EXISTS work_progress (
  id SERIAL PRIMARY KEY,
  assignment_id INT NOT NULL REFERENCES work_assignments(id) ON DELETE CASCADE,
  updated_by INT NOT NULL REFERENCES users(id),
  progress_percent INT CHECK (progress_percent >= 0 AND progress_percent <= 100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_work_progress_assignment ON work_progress(assignment_id);
