const app = require('./app');
const autoBootstrap = require('./config/auto-bootstrap');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    // Tự động kiểm tra và khởi tạo CSDL, bảng, dữ liệu mẫu và Admin trên máy mới
    try {
        await autoBootstrap();
    } catch (e) {
        console.error('Cảnh báo quá trình Auto-Bootstrap:', e.message);
    }

    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 CD2 Marketplace Backend is running on port ${PORT}`);
        console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`👉 Health Check: http://localhost:${PORT}/health`);
        console.log(`👉 Database: PostgreSQL (cd2_marketplace_db)`);
        console.log(`====================================================`);
    });
}

startServer();
