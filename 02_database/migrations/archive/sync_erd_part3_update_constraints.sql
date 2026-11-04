-- =====================================================================
-- JOBNEST — ĐỒNG BỘ ERD PART 3: UPDATE CONSTRAINTS & CỘT
-- File: sync_erd_part3_update_constraints.sql
-- =====================================================================

-- Bổ sung cột cho work_assignments nếu thiếu
ALTER TABLE work_assignments ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE work_assignments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Sửa constraint status work_assignments (đảm bảo đúng ERD)
ALTER TABLE work_assignments DROP CONSTRAINT IF EXISTS chk_work_assignments_status;
ALTER TABLE work_assignments ADD CONSTRAINT chk_work_assignments_status 
  CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'));

-- Sửa constraint status jobs (đảm bảo đúng ERD, bao gồm cả trạng thái tương thích)
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_status_check 
  CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'CLOSED', 'EXPIRED', 'REJECTED', 'OPEN', 'FILLED', 'COMPLETED'));
