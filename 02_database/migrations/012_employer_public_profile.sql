-- =============================================================================
-- MIGRATION: 012_employer_public_profile.sql
-- Thông tin hiển thị trên trang hồ sơ công khai của nhà tuyển dụng.
-- Tất cả cột đều cho phép NULL → không ảnh hưởng dữ liệu hiện có.
-- Chạy lại nhiều lần vẫn an toàn (idempotent).
-- =============================================================================

ALTER TABLE employer_profiles
  ADD COLUMN IF NOT EXISTS brand_name        VARCHAR(255),
  ADD COLUMN IF NOT EXISTS founded_year      SMALLINT,
  ADD COLUMN IF NOT EXISTS mission           TEXT,          -- Sứ mệnh & tầm nhìn
  ADD COLUMN IF NOT EXISTS core_values       TEXT,
  ADD COLUMN IF NOT EXISTS products_services TEXT,
  ADD COLUMN IF NOT EXISTS achievements      TEXT,
  ADD COLUMN IF NOT EXISTS benefits          TEXT,          -- Phúc lợi chung của công ty
  ADD COLUMN IF NOT EXISTS hr_policies       TEXT,
  ADD COLUMN IF NOT EXISTS branches          JSONB DEFAULT '[]'::jsonb,   -- ["Chi nhánh Hà Nội: ...", ...]
  ADD COLUMN IF NOT EXISTS social_links      JSONB DEFAULT '{}'::jsonb,   -- { facebook, linkedin, tiktok, youtube }
  -- Liên hệ công khai: chỉ hiển thị khi doanh nghiệp chủ động nhập (khác email/SĐT đăng nhập)
  ADD COLUMN IF NOT EXISTS public_email      VARCHAR(255),
  ADD COLUMN IF NOT EXISTS public_phone      VARCHAR(20);

ALTER TABLE employer_profiles DROP CONSTRAINT IF EXISTS employer_profiles_founded_year_check;
ALTER TABLE employer_profiles ADD CONSTRAINT employer_profiles_founded_year_check
  CHECK (founded_year IS NULL OR founded_year BETWEEN 1800 AND 2100);

-- Ảnh bìa và ảnh văn phòng của doanh nghiệp được lưu cùng bảng file_uploads
ALTER TABLE file_uploads DROP CONSTRAINT IF EXISTS file_uploads_kind_check;
ALTER TABLE file_uploads ADD CONSTRAINT file_uploads_kind_check
  CHECK (kind IN ('AVATAR', 'AVATAR_SOURCE', 'CV', 'REVIEW_IMAGE', 'COVER', 'OFFICE_IMAGE'));
