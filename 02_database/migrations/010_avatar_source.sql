-- =============================================================================
-- MIGRATION: 010_avatar_source.sql
-- Giữ ảnh gốc của ảnh đại diện (AVATAR_SOURCE, chỉ chủ tài khoản xem được)
-- để có thể căn chỉnh/cắt lại ảnh mà không phải tải ảnh mới.
-- =============================================================================

ALTER TABLE file_uploads DROP CONSTRAINT IF EXISTS file_uploads_kind_check;
ALTER TABLE file_uploads ADD CONSTRAINT file_uploads_kind_check
  CHECK (kind IN ('AVATAR', 'AVATAR_SOURCE', 'CV', 'REVIEW_IMAGE'));
