/**
 * connect_db.js
 * CÔNG CỤ TỰ ĐỘNG KẾT NỐI & KHỞI TẠO CƠ SỞ DỮ LIỆU DÀNH CHO MÁY MỚI (MÁY B)
 * 
 * Chức năng:
 * 1. Tự động kiểm tra file cấu hình 03_backend/.env, tự tạo nếu chưa có.
 * 2. Tự động quét và kết nối PostgreSQL qua các cổng 5432, 5433, 5434.
 * 3. Tự động thử nghiệm các mật khẩu phổ biến (postgres, 123456, admin, root,...).
 * 4. Tự động tạo cơ sở dữ liệu `cd2_marketplace_db`.
 * 5. Tự động áp dụng toàn bộ 31 tập tin Migration tạo bảng.
 * 6. Tự động nạp dữ liệu mẫu (Seed Data).
 * 7. Tự động tạo tài khoản Quản trị viên (admin.test@vlu.edu.vn / password123).
 */

const path = require('path');
const autoBootstrap = require('./03_backend/src/config/auto-bootstrap');

async function main() {
    console.log(`\n=============================================================`);
    console.log(`🚀 [JOBNEST] BẮT ĐẦU KẾT NỐI DỰ ÁN VỚI POSTGRESQL TRÊN MÁY NÀY`);
    console.log(`=============================================================`);

    const success = await autoBootstrap();

    if (success) {
        console.log(`🎉 CHÚC MỪNG! DỰ ÁN ĐÃ KẾT NỐI VÀ ĐỒNG BỘ THÀNH CÔNG VỚI SQL!`);
        console.log(`-------------------------------------------------------------`);
        console.log(`📋 BÂY GIỜ BẠN CÓ THỂ CHẠY HỆ THỐNG BẰNG CÁC LỆNH SAU:`);
        console.log(`   1. Chạy Backend:    npm run dev:backend`);
        console.log(`   2. Chạy Frontend:   npm run dev:frontend`);
        console.log(`   Hoặc chạy cả hai:   npm run dev`);
        console.log(`-------------------------------------------------------------`);
        console.log(`👑 TÀI KHOẢN ADMIN ĐÃ SẴN SÀNG:`);
        console.log(`   - Email:     admin.test@vlu.edu.vn`);
        console.log(`   - Mật khẩu:  password123`);
        console.log(`=============================================================\n`);
        process.exit(0);
    } else {
        console.error(`\n❌ CHƯA THỂ KẾT NỐI ĐƯỢC VỚI POSTGRESQL.`);
        console.error(`Vui lòng làm theo hướng dẫn ở trên để Bật dịch vụ PostgreSQL hoặc cài đặt lại, sau đó chạy lại lệnh này.\n`);
        process.exit(1);
    }
}

main();
