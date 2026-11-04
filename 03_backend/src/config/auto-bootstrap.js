/**
 * auto-bootstrap.js
 * KIỂM TRA trạng thái cơ sở dữ liệu PostgreSQL — KHÔNG tạo và KHÔNG sửa dữ liệu.
 *
 * Chế độ (AUTO_BOOTSTRAP trong .env):
 *   - off   (mặc định): chỉ kiểm tra kết nối. Không ghi bất cứ gì.
 *   - check            : kiểm tra kết nối + báo cáo tình trạng thiếu gì,
 *                        kèm lệnh thủ công cần chạy. Không ghi dữ liệu.
 *
 * TUYỆT ĐỐI KHÔNG:
 *   - Không tạo/ghi đè file .env
 *   - Không đoán/thử mật khẩu PostgreSQL
 *   - Không CREATE DATABASE
 *   - Không nạp file SQL dump
 *   - Không chạy migration
 *   - Không seed dữ liệu
 *   - Không tạo/cập nhật tài khoản admin
 *
 * Migration và seed phải được chạy thủ công:
 *   npm run migrate
 *   npm run seed
 */

const db = require('./db');

function getMode() {
    const mode = (process.env.AUTO_BOOTSTRAP || 'off').trim().toLowerCase();
    return mode === 'check' ? 'check' : 'off';
}

async function checkSchemaState() {
    try {
        const res = await db.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 200`
        );
        const tables = res.rows.map(r => r.table_name);
        const hasUsers = tables.includes('users');
        let userCount = null;
        if (hasUsers) {
            const cnt = await db.query('SELECT COUNT(*) FROM users');
            userCount = parseInt(cnt.rows[0]?.count || '0', 10);
        }
        return { ok: true, hasUsers, userCount, tableCount: tables.length };
    } catch (err) {
        return { ok: false, code: err.code || 'UNKNOWN' };
    }
}

async function autoBootstrap() {
    const mode = getMode();

    // 1. Kiểm tra cấu hình bắt buộc (không ghi file nào)
    const missing = [];
    if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
    if (!process.env.DB_PASSWORD) missing.push('DB_PASSWORD');
    if (!process.env.DB_NAME) missing.push('DB_NAME');

    if (missing.length > 0) {
        console.error(`❌ [BOOTSTRAP] Thiếu biến môi trường: ${missing.join(', ')}. Hãy cấu hình trong 03_backend/.env.`);
        return false;
    }

    // 2. Kiểm tra kết nối (chỉ đọc)
    console.log(`🔍 [BOOTSTRAP] Đang kiểm tra kết nối PostgreSQL (mode: ${mode})...`);
    const conn = await db.testConnection();

    if (!conn.ok) {
        console.error(`❌ [BOOTSTRAP] Không kết nối được PostgreSQL (${conn.code}).`);
        console.error(`👉 Kiểm tra: PostgreSQL đã chạy chưa? DB_HOST/DB_PORT/DB_USER/DB_PASSWORD trong .env đã đúng chưa?`);
        console.error(`👉 Nếu database chưa tồn tại, chạy thủ công: npm run migrate`);
        return false;
    }

    console.log(`✅ [BOOTSTRAP] Kết nối PostgreSQL thành công.`);

    // 3. Chế độ 'check': báo cáo tình trạng, không ghi dữ liệu
    if (mode === 'check') {
        const state = await checkSchemaState();
        if (!state.ok) {
            console.warn(`⚠️ [BOOTSTRAP] Không đọc được danh sách bảng (${state.code}).`);
        } else {
            console.log(`📊 [BOOTSTRAP] Số bảng trong schema 'public': ${state.tableCount}`);
            if (!state.hasUsers) {
                console.warn(`⚠️ [BOOTSTRAP] Chưa có bảng 'users'. Chạy thủ công: npm run migrate`);
            } else {
                console.log(`📊 [BOOTSTRAP] Số tài khoản trong bảng 'users': ${state.userCount}`);
                if (state.userCount === 0) {
                    console.warn(`⚠️ [BOOTSTRAP] Database chưa có dữ liệu. Chạy thủ công: npm run seed`);
                }
            }
        }
        console.log(`ℹ️ [BOOTSTRAP] Không có thao tác ghi dữ liệu nào được thực hiện.`);
    }

    return true;
}

module.exports = autoBootstrap;
