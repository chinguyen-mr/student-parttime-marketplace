-- =============================================================================
-- MIGRATION: 013_employer_location.sql
-- Tọa độ trụ sở do chính doanh nghiệp ghim trên bản đồ (nguồn dữ liệu tin cậy),
-- thay cho việc để Google tự đoán từ chuỗi địa chỉ.
-- NULL = chưa ghim → bản đồ hiển thị vị trí ước lượng theo địa chỉ.
-- =============================================================================

ALTER TABLE employer_profiles
  ADD COLUMN IF NOT EXISTS latitude  NUMERIC(9, 6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6);

ALTER TABLE employer_profiles DROP CONSTRAINT IF EXISTS employer_profiles_coords_check;
ALTER TABLE employer_profiles ADD CONSTRAINT employer_profiles_coords_check CHECK (
  (latitude IS NULL AND longitude IS NULL)
  OR (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
);
