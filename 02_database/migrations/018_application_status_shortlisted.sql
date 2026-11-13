-- =============================================================================
-- MIGRATION: 018_application_status_shortlisted.sql
-- Nút "Rút gọn" (SHORTLISTED) và trạng thái "Đang xem xét" (REVIEWING) được API cho phép
-- (application.validator) nhưng CHECK constraint chỉ có PENDING/ACCEPTED/REJECTED/WITHDRAWN
-- → mọi lần rút gọn đều lỗi 500. Chỉ nới ràng buộc, không đổi dữ liệu. Chạy lại nhiều lần vẫn an toàn.
-- =============================================================================

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('PENDING', 'REVIEWING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'));
