-- Sản phẩm bàn giao Freelance theo phiên bản
CREATE TABLE IF NOT EXISTS work_deliverables (
  id SERIAL PRIMARY KEY,
  assignment_id INT NOT NULL REFERENCES work_assignments(id) ON DELETE CASCADE,
  submitted_by INT NOT NULL REFERENCES users(id),
  version_no INT NOT NULL,
  file_key VARCHAR(500),
  description TEXT,
  status VARCHAR(30) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'ACCEPTED', 'REVISION_REQUESTED')),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (assignment_id, version_no)
);
CREATE INDEX IF NOT EXISTS idx_work_deliverables_assignment ON work_deliverables(assignment_id);
