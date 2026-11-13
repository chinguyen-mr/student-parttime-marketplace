-- =============================================================================
-- MIGRATION: 009_student_ward.sql
-- Địa chỉ 2 cấp theo đơn vị hành chính mới (từ 01/07/2025): Tỉnh/Thành phố → Phường/Xã.
-- detailed_address giữ phần số nhà, tên đường.
-- =============================================================================

ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS ward VARCHAR(255);
