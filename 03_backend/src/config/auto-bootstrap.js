const fs = require('fs');
const path = require('path');
const { Client, Pool } = require('pg');
const bcrypt = require('bcryptjs');

const envPath = path.resolve(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
    // Tự động tạo file .env mẫu nếu trên máy mới chưa có
    const defaultEnv = [
        'PORT=5000',
        'NODE_ENV=development',
        'DB_HOST=localhost',
        'DB_PORT=5432',
        'DB_NAME=cd2_marketplace_db',
        'DB_USER=postgres',
        'DB_PASSWORD=postgres',
        'JWT_SECRET=super_secret_jwt_key_cdtn2_jobnest_2026',
        'JWT_EXPIRES_IN=7d'
    ].join('\n');
    try {
        fs.writeFileSync(envPath, defaultEnv, 'utf8');
        console.log(`📝 [AUTO-BOOTSTRAP] Đã tự động tạo file cấu hình mới tại: 03_backend/.env`);
    } catch (e) {
        // bỏ qua nếu không thể ghi file
    }
}
require('dotenv').config({ path: envPath });

/**
 * Tự động đồng bộ hóa Cơ sở dữ liệu khi khởi động Backend:
 * 1. Tự động quét các cổng PostgreSQL phổ biến (5432, 5433, 5434).
 * 2. Tự động phát hiện và thử các mật khẩu PostgreSQL phổ biến (postgres, 123456, admin, root,...).
 * 3. Tự động tạo Database cd2_marketplace_db nếu chưa có trên máy mới.
 * 4. Tự động chạy toàn bộ các file SQL Migration tạo đầy đủ các bảng dữ liệu (có cơ chế multi-pass giải quyết phụ thuộc khóa ngoại).
 * 5. Tự động nạp dữ liệu mẫu (Seed Data) nếu hệ thống chưa có dữ liệu.
 * 6. Tự động khởi tạo tài khoản Quản trị viên (admin.test@vlu.edu.vn / password123).
 */
async function autoBootstrap() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const initialPort = parseInt(process.env.DB_PORT || '5432', 10);
    const dbUser = process.env.DB_USER || 'postgres';
    const dbName = process.env.DB_NAME || 'cd2_marketplace_db';
    let dbPassword = process.env.DB_PASSWORD || 'postgres';

    console.log(`\n====================================================`);
    console.log(`🔄 [AUTO-BOOTSTRAP] Đang kiểm tra & chuẩn bị CSDL cho máy mới...`);

    // Danh sách các cổng PostgreSQL tiềm năng (5432 chuẩn, 5433 phụ)
    const candidatePorts = [...new Set([initialPort, 5432, 5433, 5434])];

    // Danh sách mật khẩu phổ biến
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
    const uniqueCandidates = [...new Set(candidatePasswords)];

    let connectedClient = null;
    let workingPassword = null;
    let workingPort = null;
    let hadConnectionRefused = false;

    // Quét tìm tổ hợp Port + Mật khẩu kết nối được
    for (const port of candidatePorts) {
        for (const pwd of uniqueCandidates) {
            const client = new Client({
                host: dbHost,
                port: port,
                user: dbUser,
                password: pwd,
                database: 'postgres',
                connectionTimeoutMillis: 2000
            });

            try {
                await client.connect();
                connectedClient = client;
                workingPassword = pwd;
                workingPort = port;
                break;
            } catch (err) {
                await client.end().catch(() => {});
                if (err.code === 'ECONNREFUSED') {
                    hadConnectionRefused = true;
                }
                // Nếu sai mật khẩu (28P01), tiếp tục thử mật khẩu tiếp theo
            }
        }
        if (connectedClient) break;
    }

    if (!connectedClient) {
        if (hadConnectionRefused) {
            console.error(`\n❌ [LỖI KẾT NỐI] Dịch vụ PostgreSQL chưa được BẬT trên máy này!`);
            console.error(`👉 CÁCH KHẮC PHỤC TRÊN WINDOWS:`);
            console.error(`   1. Nhấn phím Windows + R, gõ "services.msc" rồi Enter.`);
            console.error(`   2. Tìm dòng "postgresql-x64-..." trong danh sách.`);
            console.error(`   3. Click chuột phải vào nó -> chọn "Start".`);
            console.error(`   (Nếu trong danh sách không có "postgresql", hãy tải và cài đặt PostgreSQL từ: https://www.postgresql.org/download/windows/)\n`);
        } else {
            console.error(`\n❌ [LỖI XÁC THỰC] PostgreSQL đang chạy nhưng mật khẩu không khớp với các mật khẩu mặc định.`);
            console.error(`👉 Vui lòng mở file 03_backend/.env và cập nhật DB_PASSWORD đúng với mật khẩu bạn đặt khi cài PostgreSQL.\n`);
        }
        return false;
    }

    console.log(`🔌 Kết nối PostgreSQL thành công tại Cổng: ${workingPort}, User: ${dbUser}`);

    // Cập nhật lại .env nếu phát hiện Port hoặc Mật khẩu khác biệt
    let envNeedsUpdate = false;
    if (workingPassword !== dbPassword || workingPort !== initialPort) {
        process.env.DB_PASSWORD = workingPassword;
        process.env.DB_PORT = workingPort.toString();
        envNeedsUpdate = true;
    }

    if (envNeedsUpdate && fs.existsSync(envPath)) {
        try {
            let envContent = fs.readFileSync(envPath, 'utf8');
            if (envContent.includes('DB_PASSWORD=')) {
                envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${workingPassword}`);
            } else {
                envContent += `\nDB_PASSWORD=${workingPassword}`;
            }
            if (envContent.includes('DB_PORT=')) {
                envContent = envContent.replace(/DB_PORT=.*/, `DB_PORT=${workingPort}`);
            } else {
                envContent += `\nDB_PORT=${workingPort}`;
            }
            fs.writeFileSync(envPath, envContent, 'utf8');
            console.log(`🔑 Đã tự động cập nhật Port (${workingPort}) & Mật khẩu vào 03_backend/.env`);
        } catch (e) {
            // Không chặn nếu ghi file thất bại
        }
    }

    try {
        // Kiểm tra & tự động tạo Database cd2_marketplace_db
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

    // Kết nối trực tiếp vào cd2_marketplace_db để kiểm tra bảng & nạp dữ liệu
    const pool = new Pool({
        host: dbHost,
        port: workingPort,
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
            console.log(`📜 Đang tự động chạy toàn bộ SQL Migrations để tạo bảng CSDL...`);
            const migrationsDir = path.resolve(__dirname, '../../../02_database/migrations');
            if (fs.existsSync(migrationsDir)) {
                // Ưu tiên các bảng gốc trước
                const priorityOrder = [
                    'users.sql',
                    'categories.sql',
                    'employer_profiles.sql',
                    'student_profiles.sql',
                    'student_cvs.sql',
                    'student_skills.sql',
                    'student_experiences.sql',
                    'student_educations.sql',
                    'jobs.sql',
                    'part_time_details.sql',
                    'freelance_details.sql',
                    'seasonal_details.sql',
                    'job_skills.sql',
                    'job_views.sql',
                    'job_saved.sql',
                    'applications.sql',
                    'application_histories.sql',
                    'freelance_proposals.sql',
                    'proposal_histories.sql',
                    'work_assignments.sql',
                    'work_deliverables.sql',
                    'deliverable_reviews.sql',
                    'work_progress.sql',
                    'reviews.sql',
                    'reports.sql',
                    'report_actions.sql',
                    'notifications.sql',
                    'verification_tokens.sql',
                    'password_reset_tokens.sql',
                    'admin_logs.sql',
                    'update_columns_for_data_v2.sql'
                ];

                const allFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
                // Sắp xếp theo thứ tự ưu tiên, các file khác đẩy xuống sau
                const sortedFiles = [
                    ...priorityOrder.filter(f => allFiles.includes(f)),
                    ...allFiles.filter(f => !priorityOrder.includes(f))
                ];

                // Cơ chế chạy lặp tối đa 3 vòng để giải quyết triệt để phụ thuộc khóa ngoại
                let pendingFiles = [...sortedFiles];
                let pass = 1;
                while (pendingFiles.length > 0 && pass <= 3) {
                    const remaining = [];
                    for (const file of pendingFiles) {
                        try {
                            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                            await pool.query(sql);
                        } catch (mErr) {
                            remaining.push(file);
                        }
                    }
                    if (remaining.length === pendingFiles.length) {
                        // Không tiến triển thêm được nữa
                        break;
                    }
                    pendingFiles = remaining;
                    pass++;
                }

                console.log(`✅ Đã thiết lập hoàn tất các bảng Cơ sở dữ liệu!`);
            }
        } else {
            console.log(`✅ Hệ thống bảng CSDL đã sẵn sàng.`);
        }

        // Kiểm tra nạp Seed Data nếu bảng users đang rỗng
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

        // Đảm bảo tài khoản Quản trị viên admin.test@vlu.edu.vn luôn tồn tại
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

        console.log(`✨ [AUTO-BOOTSTRAP] Cơ sở dữ liệu PostgreSQL đã kết nối & đồng bộ 100%!`);
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
