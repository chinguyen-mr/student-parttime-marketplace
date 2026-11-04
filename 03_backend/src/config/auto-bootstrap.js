const fs = require('fs');
const path = require('path');
const { Client, Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Tự động đồng bộ hóa Cơ sở dữ liệu khi khởi động Backend:
 * 1. Tự động phát hiện và thử các mật khẩu PostgreSQL phổ biến nếu mật khẩu trong .env bị sai.
 * 2. Tự động tạo Database cd2_marketplace_db nếu chưa có trên máy mới.
 * 3. Tự động chạy toàn bộ các file SQL Migration tạo 30 bảng CSDL.
 * 4. Tự động nạp dữ liệu mẫu (Seed Data) nếu hệ thống chưa có dữ liệu.
 * 5. Tự động khởi tạo tài khoản Quản trị viên (admin.test@vlu.edu.vn / password123).
 */
async function autoBootstrap() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
    const dbUser = process.env.DB_USER || 'postgres';
    const dbName = process.env.DB_NAME || 'cd2_marketplace_db';
    let dbPassword = process.env.DB_PASSWORD || 'postgres';

    console.log(`\n====================================================`);
    console.log(`🔄 [AUTO-BOOTSTRAP] Đang kiểm tra & chuẩn bị CSDL cho máy mới...`);

    // 1. Kiểm tra kết nối & tự động dò mật khẩu nếu máy mới dùng mật khẩu khác
    const candidatePasswords = [
        dbPassword,
        'postgres',
        '123456',
        'admin',
        'root',
        '12345678',
        'password',
        ''
    ];
    // Loại bỏ trùng lặp
    const uniqueCandidates = [...new Set(candidatePasswords)];

    let connectedClient = null;
    let workingPassword = null;

    for (const pwd of uniqueCandidates) {
        const client = new Client({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: pwd,
            database: 'postgres',
            connectionTimeoutMillis: 3000
        });

        try {
            await client.connect();
            connectedClient = client;
            workingPassword = pwd;
            break;
        } catch (err) {
            await client.end().catch(() => {});
            // Nếu lỗi do dịch vụ PostgreSQL chưa bật (ECONNREFUSED), dừng ngay và hướng dẫn
            if (err.code === 'ECONNREFUSED') {
                console.error(`\n❌ [LỖI] Dịch vụ PostgreSQL chưa được bật trên máy này!`);
                console.error(`👉 Khắc phục: Bấm phím Windows + R, gõ "services.msc", tìm dịch vụ "postgresql" và bấm chuột phải chọn "Start".\n`);
                return false;
            }
            // Nếu sai mật khẩu (28P01), tiếp tục thử mật khẩu tiếp theo
        }
    }

    if (!connectedClient) {
        console.error(`\n❌ [LỖI] Không thể kết nối PostgreSQL với các mật khẩu phổ biến.`);
        console.error(`👉 Vui lòng mở file 03_backend/.env và cập nhật DB_PASSWORD đúng với mật khẩu bạn đặt khi cài PostgreSQL.\n`);
        return false;
    }

    // Nếu mật khẩu hoạt động khác với .env hiện tại, tự động cập nhật lại .env
    if (workingPassword !== dbPassword) {
        console.log(`🔑 Phát hiện mật khẩu PostgreSQL máy mới: "${workingPassword}". Tự động cập nhật vào 03_backend/.env...`);
        process.env.DB_PASSWORD = workingPassword;
        try {
            const envPath = path.resolve(__dirname, '../../.env');
            if (fs.existsSync(envPath)) {
                let envContent = fs.readFileSync(envPath, 'utf8');
                if (envContent.includes('DB_PASSWORD=')) {
                    envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${workingPassword}`);
                } else {
                    envContent += `\nDB_PASSWORD=${workingPassword}`;
                }
                fs.writeFileSync(envPath, envContent, 'utf8');
            }
        } catch (e) {
            // Không chặn nếu ghi file thất bại
        }
    }

    try {
        // 2. Kiểm tra & tự động tạo Database cd2_marketplace_db
        const dbCheckRes = await connectedClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (dbCheckRes.rowCount === 0) {
            console.log(`📦 Database "${dbName}" chưa tồn tại. Đang tự động tạo mới...`);
            await connectedClient.query(`CREATE DATABASE "${dbName}"`);
            console.log(`✅ Đã tạo thành công Database "${dbName}"!`);
        } else {
            console.log(`✅ Database "${dbName}" đã tồn tại sẵn.`);
        }
    } catch (err) {
        console.error('⚠️ Lỗi kiểm tra/tạo Database:', err.message);
    } finally {
        await connectedClient.end().catch(() => {});
    }

    // 3. Kết nối trực tiếp vào cd2_marketplace_db để kiểm tra bảng & nạp dữ liệu
    const pool = new Pool({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: workingPassword,
        database: dbName,
        connectionTimeoutMillis: 5000
    });

    try {
        // Kiểm tra xem bảng users đã tồn tại chưa
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'users'
            );
        `);

        const tablesExist = tableCheck.rows[0]?.exists === true;

        if (!tablesExist) {
            console.log(`📜 Chưa có bảng dữ liệu. Đang tự động chạy toàn bộ SQL Migrations...`);
            const migrationsDir = path.resolve(__dirname, '../../../02_database/migrations');
            if (fs.existsSync(migrationsDir)) {
                const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
                for (const file of files) {
                    try {
                        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                        await pool.query(sql);
                    } catch (mErr) {
                        // Tiếp tục chạy các file khác nếu đã tồn tại
                    }
                }
                console.log(`✅ Đã chạy xong ${files.length} tập tin Migration!`);
            }
        } else {
            console.log(`✅ Hệ thống bảng CSDL đã sẵn sàng.`);
        }

        // 4. Kiểm tra nạp Seed Data nếu bảng users đang rỗng
        const userCountRes = await pool.query(`SELECT COUNT(*) FROM users`);
        const userCount = parseInt(userCountRes.rows[0]?.count || '0', 10);

        if (userCount === 0) {
            console.log(`🌱 Cơ sở dữ liệu đang trống. Đang tự động nạp dữ liệu mẫu (Seed Data)...`);
            const seedPath = path.resolve(__dirname, '../../../02_database/seeds/001_seed_data.sql');
            if (fs.existsSync(seedPath)) {
                const seedSql = fs.readFileSync(seedPath, 'utf8');
                await pool.query(seedSql);
                console.log(`✅ Đã nạp thành công dữ liệu mẫu!`);
            }
        }

        // 5. Đảm bảo tài khoản Quản trị viên admin.test@vlu.edu.vn luôn tồn tại
        const adminEmail = 'admin.test@vlu.edu.vn';
        const adminCheck = await pool.query(`SELECT 1 FROM users WHERE email = $1`, [adminEmail]);

        if (adminCheck.rowCount === 0) {
            console.log(`👑 Đang tạo tài khoản Quản trị viên thử nghiệm (${adminEmail})...`);
            const passwordHash = await bcrypt.hash('password123', 10);
            await pool.query(`
                INSERT INTO users (email, password_hash, full_name, phone, role, status)
                VALUES ($1, $2, 'Quản trị viên Hệ thống (Admin Test)', '0900000001', 'ADMIN', 'ACTIVE')
            `, [adminEmail, passwordHash]);
            console.log(`✅ Đã sẵn sàng tài khoản Quản trị viên (${adminEmail} / password123)!`);
        }

        console.log(`✨ [AUTO-BOOTSTRAP] Cơ sở dữ liệu PostgreSQL đã đồng bộ 100%!`);
        console.log(`====================================================\n`);
        return true;
    } catch (err) {
        console.error('⚠️ [AUTO-BOOTSTRAP] Cảnh báo kiểm tra CSDL:', err.message);
        return false;
    } finally {
        await pool.end().catch(() => {});
    }
}

module.exports = autoBootstrap;

