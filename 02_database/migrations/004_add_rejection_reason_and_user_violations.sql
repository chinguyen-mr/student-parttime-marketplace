-- Migration 004: Bổ sung lý do từ chối cho applications và hệ thống quản lý vi phạm, khiếu nại
-- Tương thích 100% với schema hiện tại, an toàn, không mất dữ liệu.

-- 1. Bổ sung thông tin lý do từ chối và thời điểm xử lý cho đơn ứng tuyển
ALTER TABLE applications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS decided_by INTEGER REFERENCES users(id);

-- 2. Bổ sung thông tin theo dõi vi phạm và tạm khóa cho tài khoản người dùng
ALTER TABLE users ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_expires_at TIMESTAMPTZ;

-- 3. Bảng quản lý hồ sơ vi phạm (user_violations)
CREATE TABLE IF NOT EXISTS user_violations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    violation_code VARCHAR(50) NOT NULL,
    violation_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    tier INTEGER DEFAULT 1, -- 1: Cảnh báo, 2: Cảnh cáo hạn chế, 3: Tạm khóa, 4: Khóa vĩnh viễn
    reason TEXT NOT NULL,
    evidence TEXT,
    handled_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, APPEALED, REVOKED
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng quản lý khiếu nại và yêu cầu mở khóa (user_appeals)
CREATE TABLE IF NOT EXISTS user_appeals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    violation_id INTEGER REFERENCES user_violations(id) ON DELETE SET NULL,
    appeal_reason TEXT NOT NULL,
    evidence_url TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    admin_response TEXT,
    resolved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_violations_user_id ON user_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_appeals_user_id ON user_appeals(user_id);

