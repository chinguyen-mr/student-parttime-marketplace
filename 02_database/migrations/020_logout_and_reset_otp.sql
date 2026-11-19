-- Đăng xuất thu hồi phiên: token có thời điểm phát hành (iat) không sau mốc này bị từ chối
ALTER TABLE users ADD COLUMN IF NOT EXISTS tokens_valid_after TIMESTAMPTZ;

-- Khôi phục mật khẩu bằng mã OTP 6 số: đếm số lần nhập sai để khóa mã khi bị dò
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
