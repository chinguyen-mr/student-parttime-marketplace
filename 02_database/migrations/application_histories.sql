-- Lịch sử trạng thái đơn ứng tuyển
CREATE TABLE IF NOT EXISTS application_histories (
  id SERIAL PRIMARY KEY,
  application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  changed_by INT NOT NULL REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_application_histories_app ON application_histories(application_id);
