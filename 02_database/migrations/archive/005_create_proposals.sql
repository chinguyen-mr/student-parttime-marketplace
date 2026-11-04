-- Migration 005: Create proposals table for Freelance bidding flow
CREATE TABLE IF NOT EXISTS proposals (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposal_text TEXT NOT NULL,
  estimated_duration VARCHAR(100),
  proposed_price INT,
  status VARCHAR(30) DEFAULT 'SUBMITTED' 
    CHECK (status IN ('SUBMITTED', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (job_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_proposals_job_status ON proposals(job_id, status);
CREATE INDEX IF NOT EXISTS idx_proposals_student ON proposals(student_id);
