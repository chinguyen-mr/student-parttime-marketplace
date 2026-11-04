-- Lịch sử trạng thái đề xuất Freelance
CREATE TABLE IF NOT EXISTS proposal_histories (
  id SERIAL PRIMARY KEY,
  proposal_id INT NOT NULL REFERENCES freelance_proposals(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  changed_by INT NOT NULL REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_proposal_histories_prop ON proposal_histories(proposal_id);
