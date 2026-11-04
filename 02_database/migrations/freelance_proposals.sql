-- Đề xuất chào giá dự án Freelance
CREATE TABLE IF NOT EXISTS freelance_proposals (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposal_text TEXT NOT NULL,
  estimated_duration VARCHAR(100),
  proposed_price DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'REVIEWING', 'ACCEPTED', 'REJECTED')),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_freelance_proposals_job ON freelance_proposals(job_id);
CREATE INDEX IF NOT EXISTS idx_freelance_proposals_student ON freelance_proposals(student_id);
