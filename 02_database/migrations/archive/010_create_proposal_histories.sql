-- Migration 010: Create proposal_histories table for status auditing
CREATE TABLE IF NOT EXISTS proposal_histories (
  id SERIAL PRIMARY KEY,
  proposal_id INT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  changed_by INT REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_proposal_histories_prop_id ON proposal_histories(proposal_id);
