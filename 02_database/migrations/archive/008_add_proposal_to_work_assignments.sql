-- Migration 008: Add proposal_id and XOR constraint to work_assignments
ALTER TABLE work_assignments ALTER COLUMN application_id DROP NOT NULL;

ALTER TABLE work_assignments ADD COLUMN IF NOT EXISTS proposal_id INT REFERENCES proposals(id) ON DELETE CASCADE;

ALTER TABLE work_assignments DROP CONSTRAINT IF EXISTS chk_xor_source;
ALTER TABLE work_assignments ADD CONSTRAINT chk_xor_source 
CHECK (
  (application_id IS NOT NULL)::int + (proposal_id IS NOT NULL)::int = 1
);

ALTER TABLE work_assignments DROP CONSTRAINT IF EXISTS unique_proposal_assignment;
ALTER TABLE work_assignments ADD CONSTRAINT unique_proposal_assignment UNIQUE (proposal_id);
