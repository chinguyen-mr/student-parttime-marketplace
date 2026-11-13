-- =============================================================================
-- MIGRATION: 011_application_snapshot_withdraw.sql
-- 1) Lưu bản chụp hồ sơ sinh viên tại thời điểm nộp đơn (nội dung "hồ sơ đã gửi"
--    không đổi khi sinh viên sửa hồ sơ sau này).
-- 2) Cho phép sinh viên rút đơn khi đơn còn chờ duyệt (trạng thái WITHDRAWN).
-- =============================================================================

ALTER TABLE applications ADD COLUMN IF NOT EXISTS profile_snapshot JSONB;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ;

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'));
