const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const autoBootstrap = require('./config/auto-bootstrap');

async function startServer() {
    // 1. Tự động kiểm tra và khởi tạo CSDL, bảng, dữ liệu mẫu và Admin trên máy mới trước khi nạp routes & pool
    try {
        await autoBootstrap();
    } catch (e) {
        console.error('Cảnh báo quá trình Auto-Bootstrap:', e.message);
    }

    // 2. Nạp Express App sau khi CSDL đã sẵn sàng
    const app = require('./app');
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 CD2 Marketplace Backend is running on port ${PORT}`);
        console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`👉 Health Check: http://localhost:${PORT}/health`);
        console.log(`👉 Database: PostgreSQL (${process.env.DB_NAME || 'cd2_marketplace_db'})`);
        console.log(`====================================================`);
    });
}

startServer();
