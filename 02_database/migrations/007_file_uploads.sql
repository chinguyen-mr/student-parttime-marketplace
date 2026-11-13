-- =============================================================================
-- MIGRATION: 007_file_uploads.sql
-- Lưu file người dùng tải lên (ảnh đại diện, CV, ảnh đánh giá) ngay trong PostgreSQL.
-- Chạy được cả Docker lẫn Vercel, không cần dịch vụ lưu trữ ngoài.
-- Chạy lại nhiều lần vẫn an toàn (idempotent).
-- =============================================================================

CREATE TABLE IF NOT EXISTS file_uploads (
    id            SERIAL PRIMARY KEY,
    owner_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind          VARCHAR(20) NOT NULL CHECK (kind IN ('AVATAR', 'CV', 'REVIEW_IMAGE')),
    original_name VARCHAR(255),
    mime_type     VARCHAR(100) NOT NULL,
    size_bytes    INTEGER NOT NULL CHECK (size_bytes > 0),
    data          BYTEA NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_file_uploads_owner_kind ON file_uploads(owner_id, kind);
