-- Hợp đồng phân công công việc (A3 Rule - Part-time & Freelance)
CREATE TABLE IF NOT EXISTS work_assignments (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id INT REFERENCES applications(id) ON DELETE CASCADE,
  proposal_id INT REFERENCES freelance_proposals(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_assignment_source CHECK (
    (application_id IS NOT NULL AND proposal_id IS NULL) OR
    (application_id IS NULL AND proposal_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_work_assignments_job ON work_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_work_assignments_student ON work_assignments(student_id);
