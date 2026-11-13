-- =============================================================================
-- MIGRATION: 017_employer_company_restructure.sql
-- Tách "Thông tin người đại diện" và "Hồ sơ doanh nghiệp", bổ sung xác minh pháp lý.
-- Chỉ THÊM cột/bảng (IF NOT EXISTS) → không xóa, không sửa dữ liệu hiện có.
-- Chạy lại nhiều lần vẫn an toàn (idempotent).
-- =============================================================================

ALTER TABLE employer_profiles
  -- Ảnh đại diện cá nhân của người đại diện (khác logo doanh nghiệp = avatar_url), không công khai
  ADD COLUMN IF NOT EXISTS representative_avatar_url VARCHAR(500),
  -- Giới thiệu & văn hóa: "Văn hóa nội bộ" (work_environment_desc = Môi trường làm việc)
  ADD COLUMN IF NOT EXISTS internal_culture TEXT,
  -- Chính sách nhân sự chi tiết (ưu tiên sinh viên). Khóa hợp lệ do backend kiểm soát:
  -- internship, training, student_support, flexible_schedule, part_time, full_time, career_growth
  ADD COLUMN IF NOT EXISTS hr_policy_details JSONB DEFAULT '{}'::jsonb,
  -- Xác minh pháp lý doanh nghiệp (verification_status đã có từ 005):
  -- UNVERIFIED | PENDING | VERIFIED | NEEDS_INFO | REJECTED
  ADD COLUMN IF NOT EXISTS verification_note TEXT,               -- lý do từ chối / yêu cầu bổ sung
  ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMPTZ;

-- branches (JSONB, từ 012) giờ chứa object { name, address, phone, email, latitude, longitude, is_active }.
-- Dữ liệu cũ dạng chuỗi được backend tự đọc thành { address: "<chuỗi cũ>" } → không cần chuyển đổi.

-- Loại file mới: ảnh người đại diện (riêng tư) và tài liệu pháp lý (riêng tư, chỉ chủ tài khoản + admin)
ALTER TABLE file_uploads DROP CONSTRAINT IF EXISTS file_uploads_kind_check;
ALTER TABLE file_uploads ADD CONSTRAINT file_uploads_kind_check
  CHECK (kind IN ('AVATAR', 'AVATAR_SOURCE', 'CV', 'REVIEW_IMAGE', 'COVER', 'OFFICE_IMAGE', 'REP_AVATAR', 'LEGAL_DOC'));

-- Lịch sử thay đổi các thông tin quan trọng của hồ sơ doanh nghiệp
CREATE TABLE IF NOT EXISTS employer_profile_changes (
    id          SERIAL PRIMARY KEY,
    employer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    changed_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    section     VARCHAR(40) NOT NULL,      -- REPRESENTATIVE | COMPANY | VERIFICATION | VERIFICATION_REVIEW
    changes     JSONB NOT NULL DEFAULT '{}'::jsonb,   -- { field: { from, to } } (văn bản dài chỉ ghi "đã đổi")
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_employer_profile_changes_employer
  ON employer_profile_changes(employer_id, created_at DESC);
