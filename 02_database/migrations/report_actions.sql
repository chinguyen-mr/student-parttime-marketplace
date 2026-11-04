-- Hành động xử lý báo cáo vi phạm của Quản trị viên
CREATE TABLE IF NOT EXISTS report_actions (
  id SERIAL PRIMARY KEY,
  report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  admin_id INT NOT NULL REFERENCES users(id),
  action VARCHAR(100),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_report_actions_report ON report_actions(report_id);
