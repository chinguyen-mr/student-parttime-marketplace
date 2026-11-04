-- Migration 009: Fix default status for work_assignments and add constraint
ALTER TABLE work_assignments ALTER COLUMN status SET DEFAULT 'NOT_STARTED';
UPDATE work_assignments SET status = 'NOT_STARTED' WHERE status = 'ASSIGNED';
ALTER TABLE work_assignments DROP CONSTRAINT IF EXISTS chk_work_assignments_status;
ALTER TABLE work_assignments ADD CONSTRAINT chk_work_assignments_status 
  CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'));
