-- Rollback Migration 004
DROP TABLE IF EXISTS user_appeals CASCADE;
DROP TABLE IF EXISTS user_violations CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS suspension_expires_at;
ALTER TABLE users DROP COLUMN IF EXISTS suspended_at;
ALTER TABLE users DROP COLUMN IF EXISTS suspension_reason;
ALTER TABLE users DROP COLUMN IF EXISTS violation_count;
ALTER TABLE applications DROP COLUMN IF EXISTS decided_by;
ALTER TABLE applications DROP COLUMN IF EXISTS decided_at;
ALTER TABLE applications DROP COLUMN IF EXISTS rejection_reason;

