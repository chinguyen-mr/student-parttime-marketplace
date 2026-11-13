-- Migration 015: Bổ sung trạng thái TERMINATED và RESIGNED cho work_assignments
DO $$ 
BEGIN 
  -- Drop existing status check constraints if any
  ALTER TABLE work_assignments DROP CONSTRAINT IF EXISTS chk_work_assignments_status;
  ALTER TABLE work_assignments DROP CONSTRAINT IF EXISTS work_assignments_status_check;
  
  -- Add updated constraint
  ALTER TABLE work_assignments ADD CONSTRAINT chk_work_assignments_status 
    CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'TERMINATED', 'RESIGNED'));
    
  -- Add termination tracking columns if not exist
  ALTER TABLE work_assignments ADD COLUMN IF NOT EXISTS termination_reason TEXT;
  ALTER TABLE work_assignments ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMP;
EXCEPTION 
  WHEN others THEN NULL;
END $$;

