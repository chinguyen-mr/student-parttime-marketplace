const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { getJwtSecret } = require('./config/jwt.config');
const autoBootstrap = require('./config/auto-bootstrap');

async function startServer() {
    // 1. Fail-fast: JWT_SECRET bắt buộc hợp lệ TRƯỚC khi listen.
    try {
        getJwtSecret();
    } catch (e) {
        console.error(`\n❌ [CONFIG] ${e.message}`);
        console.error(`👉 Mở 03_backend/.env và đặt JWT_SECRET tối thiểu 32 ký tự.`);
        console.error(`   Tạo nhanh: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"\n`);
        process.exit(1);
    }

    // 2. Kiểm tra kết nối CSDL theo AUTO_BOOTSTRAP=off|check. KHÔNG ghi dữ liệu.
    //    Lỗi DB không chặn startup — /health sẽ báo degraded.
    try {
        await autoBootstrap();
    } catch (e) {
        console.error('Cảnh báo quá trình kiểm tra CSDL:', e.message);
    }

    // 3. Nạp Express App
    const app = require('./app');
    const PORT = process.env.PORT || 5000;
    // '::' = dual-stack: nhận cả IPv4 (127.0.0.1) lẫn IPv6 (::1) trên cùng socket.
    // Quan trọng trên Windows vì trình duyệt phân giải 'localhost' → ::1 trước IPv4.
    const HOST = process.env.HOST || '::';

    app.listen(PORT, HOST, () => {
        console.log(`====================================================`);
        console.log(`🚀 CD2 Marketplace Backend is running on http://${HOST}:${PORT}`);
        console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`👉 Health Check: http://${HOST}:${PORT}/health`);
        console.log(`👉 Database: PostgreSQL (${process.env.DB_NAME || 'cd2_marketplace_db'})`);
        console.log(`====================================================`);
    });
}

startServer();
