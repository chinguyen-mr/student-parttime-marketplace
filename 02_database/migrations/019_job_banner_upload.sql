-- Ảnh banner tin tuyển dụng: nhà tuyển dụng tải ảnh từ máy (thay cho dán đường dẫn)
ALTER TABLE file_uploads DROP CONSTRAINT IF EXISTS file_uploads_kind_check;
ALTER TABLE file_uploads ADD CONSTRAINT file_uploads_kind_check
  CHECK (kind IN ('AVATAR', 'AVATAR_SOURCE', 'CV', 'REVIEW_IMAGE', 'COVER', 'OFFICE_IMAGE', 'REP_AVATAR', 'LEGAL_DOC', 'JOB_BANNER'));
