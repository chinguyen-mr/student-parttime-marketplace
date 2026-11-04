/**
 * connect_db.js
 * KIỂM TRA KẾT NỐI PostgreSQL cho máy mới — KHÔNG tạo và KHÔNG sửa dữ liệu.
 *
 * Chức năng:
 * 1. Kiểm tra biến môi trường trong 03_backend/.env (không tự tạo file).
 * 2. Kiểm tra kết nối PostgreSQL bằng đúng thông tin cấu hình (không đoán mật khẩu).
 * 3. Báo cáo tình trạng database và hướng dẫn lệnh thủ công cần chạy.
 *
 * KHÔNG tự động: tạo database, chạy migration, seed, tạo tài khoản.
 * Migration và seed phải chạy thủ công:
 *   npm run migrate
 *   npm run seed
 */

const autoBootstrap = require('./03_backend/src/config/auto-bootstrap');

async function main() {
    console.log(`\n=============================================================`);
    console.log(`🔍 [JOBNEST] KIỂM TRA KẾT NỐI POSTGRESQL (không ghi dữ liệu)`);
    console.log(`=============================================================`);

    const success = await autoBootstrap();

    if (success) {
        console.log(`🎉 KẾT NỐI THÀNH CÔNG!`);
        console.log(`-------------------------------------------------------------`);
        console.log(`📋 CÁC BƯỚC TIẾP THEO (thủ công, chỉ chạy trên database mới):`);
        console.log(`   1. Tạo bảng:        npm run migrate`);
        console.log(`   2. Nạp dữ liệu mẫu: npm run seed`);
        console.log(`   3. Chạy Backend:    npm run dev:backend`);
        console.log(`   4. Chạy Frontend:   npm run dev:frontend`);
        console.log(`   Hoặc chạy cả hai:   npm run dev`);
        console.log(`-------------------------------------------------------------`);
        console.log(`ℹ️ Tài khoản test (admin/student/employer) tạo bằng script riêng:`);
        console.log(`   node setup_temp_admin.js       (cần SEED_ADMIN_PASSWORD)`);
        console.log(`   npm --prefix 03_backend run setup:employer`);
        console.log(`   npm --prefix 03_backend run setup:student`);
        console.log(`=============================================================\n`);
        process.exit(0);
    } else {
        console.error(`\n❌ CHƯA THỂ KẾT NỐI ĐƯỢC VỚI POSTGRESQL.`);
        console.error(`👉 Kiểm tra: dịch vụ PostgreSQL đã chạy chưa?`);
        console.error(`👉 Kiểm tra 03_backend/.env: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.`);
        console.error(`👉 Sau khi sửa cấu hình, chạy lại lệnh này.\n`);
        process.exit(1);
    }
}

main();
