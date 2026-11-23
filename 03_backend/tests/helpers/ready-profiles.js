/**
 * Đưa tài khoản thử về trạng thái "hồ sơ hoàn thiện 100%":
 * - Sinh viên: đủ 11 mục → được ứng tuyển.
 * - Nhà tuyển dụng: đủ 11 mục + đã xác minh (VERIFIED) → được đăng tin.
 * Dùng cho test cần ứng tuyển / đăng tin nhưng không kiểm tra chính quy tắc hồ sơ.
 */
const STUDENT_SQL = `
    UPDATE users SET full_name = COALESCE(NULLIF(full_name, ''), 'Sinh viên thử'), phone = COALESCE(phone, '0901234567') WHERE id = $1;
    INSERT INTO student_profiles (user_id, full_name) SELECT id, full_name FROM users WHERE id = $1 AND NOT EXISTS (SELECT 1 FROM student_profiles WHERE user_id = $1);
    UPDATE student_profiles SET date_of_birth = '2004-05-12', gender = 'Nam', province = 'TP. Hồ Chí Minh', ward = 'Phường Bến Nghé',
        school = 'Đại học Văn Lang', major = 'Công nghệ thông tin', bio = 'Sinh viên năm 3, chăm chỉ, có kinh nghiệm phục vụ.',
        desired_position = 'Nhân viên phục vụ', skills = ARRAY['Giao tiếp', 'Làm việc nhóm'],
        languages = '[{"language": "Tiếng Anh", "level": "Giao tiếp"}]'::jsonb
    WHERE user_id = $1;`;

const EMPLOYER_SQL = `
    UPDATE employer_profiles SET avatar_url = '/api/files/1', cover_url = '/api/files/2',
        office_images = '["/api/files/1", "/api/files/2", "/api/files/3"]'::jsonb,
        industry = 'Dịch vụ', company_size = '10 – 49 nhân viên', province = 'TP. Hồ Chí Minh', detailed_address = '10 Lê Lợi, Quận 1',
        bio = 'Chuỗi cà phê dành cho sinh viên.', work_environment_desc = 'Thân thiện, linh hoạt ca.',
        hr_policy_details = '{"internship": "Có xác nhận thực tập", "training": "Kèm cặp 1 tuần"}'::jsonb,
        public_email = 'tuyendung@example.test', latitude = 10.7769, longitude = 106.7009, verification_status = 'VERIFIED'
    WHERE user_id = $1;`;

const run = async (db, sql, userId) => {
    for (const stmt of sql.split(';').map(s => s.trim()).filter(Boolean)) await db.query(stmt, [userId]);
};

module.exports = {
    makeStudentReady: (db, userId) => run(db, STUDENT_SQL, userId),
    makeEmployerReady: (db, userId) => run(db, EMPLOYER_SQL, userId),
};
