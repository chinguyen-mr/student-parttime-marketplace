-- Migration 016: Thêm cột withdraw_reason cho bảng applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS withdraw_reason TEXT;

