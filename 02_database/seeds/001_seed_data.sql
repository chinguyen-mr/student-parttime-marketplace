-- Password cho toàn bộ tài khoản mẫu: password123
-- Hash: $2b$10$71YiwSCn2zYmMvUwKYoWu.tgrK8Dc/Tquy4JLS6e4OFcvpk1O17Ua

-- 1. Quản trị viên (Admin)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status)
VALUES (1, 'admin@marketplace.vlu.edu.vn', '$2b$10$71YiwSCn2zYmMvUwKYoWu.tgrK8Dc/Tquy4JLS6e4OFcvpk1O17Ua', 'Hệ Thống Quản Trị', '0901234567', 'ADMIN', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. Nhà tuyển dụng (Employers)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status)
VALUES 
(2, 'techcorp@gmail.com', '$2b$10$71YiwSCn2zYmMvUwKYoWu.tgrK8Dc/Tquy4JLS6e4OFcvpk1O17Ua', 'Công Ty Công Nghệ TechCorp', '0988111222', 'EMPLOYER', 'ACTIVE'),
(3, 'coffeehouse@gmail.com', '$2b$10$71YiwSCn2zYmMvUwKYoWu.tgrK8Dc/Tquy4JLS6e4OFcvpk1O17Ua', 'The Coffee Chill House', '0977333444', 'EMPLOYER', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. Sinh viên (Students)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status)
VALUES 
(4, 'nguyen.van.chi@vlu.edu.vn', '$2b$10$71YiwSCn2zYmMvUwKYoWu.tgrK8Dc/Tquy4JLS6e4OFcvpk1O17Ua', 'Nguyễn Văn Chí', '0912345678', 'STUDENT', 'ACTIVE'),
(5, 'le.quang.tuan@vlu.edu.vn', '$2b$10$71YiwSCn2zYmMvUwKYoWu.tgrK8Dc/Tquy4JLS6e4OFcvpk1O17Ua', 'Lê Quang Anh Tuấn', '0912888999', 'STUDENT', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. Hồ sơ Nhà tuyển dụng
INSERT INTO employer_profiles (user_id, display_name, bio, location)
VALUES 
(2, 'Công Ty Công Nghệ TechCorp', 'Chuyên phát triển giải pháp phần mềm và web application.', 'Tòa nhà A, Quận 1, TP.HCM'),
(3, 'The Coffee Chill House', 'Chuỗi cà phê văn phòng thân thiện cho sinh viên làm việc bán thời gian.', '123 Đặng Thùy Trâm, Bình Thạnh, TP.HCM')
ON CONFLICT (user_id) DO NOTHING;

-- 5. Hồ sơ Sinh viên
INSERT INTO student_profiles (user_id, full_name, school, major, bio)
VALUES 
(4, 'Nguyễn Văn Chí', 'Đại học Văn Lang', 'Công nghệ thông tin', 'Sinh viên năm cuối ngành Kỹ thuật phần mềm Đại học Văn Lang.'),
(5, 'Lê Quang Anh Tuấn', 'Đại học Văn Lang', 'Quản trị kinh doanh', 'Sinh viên năng động, có kinh nghiệm phục vụ và pha chế đồ uống.')
ON CONFLICT (user_id) DO NOTHING;

-- 6. Tin tuyển dụng mẫu
INSERT INTO jobs (id, employer_id, title, description, requirements, category, location, salary_type, salary, work_type, status, moderation_status)
VALUES 
(1, 2, 'Lập trình viên Frontend React.js Part-time', 'Hỗ trợ phát triển giao diện người dùng cho hệ thống nội bộ công ty. Làm việc linh hoạt 20h/tuần.', 'Biết React.js cơ bản, Tailwind CSS, ham học hỏi và có trách nhiệm.', 'Công nghệ thông tin', 'Quận 1, TP.HCM', 'HOURLY', 45000, 'PART_TIME', 'OPEN', 'APPROVED'),
(2, 2, 'Cộng tác viên Thiết kế Banner UI/UX Part-time', 'Thiết kế ấn phẩm truyền thông và landing page quảng bá chiến dịch tháng.', 'Sử dụng thành thạo Figma hoặc Photoshop/Illustrator.', 'Thiết kế đồ họa', 'Tòa nhà A, Quận 1, TP.HCM', 'MONTHLY', 2500000, 'PART_TIME', 'OPEN', 'APPROVED'),
(3, 3, 'Nhân viên Phục vụ ca tối The Coffee Chill', 'Tiếp đón khách hàng, order đồ uống và giữ gìn vệ sinh khu vực phục vụ.', 'Nhanh nhẹn, trung thực, có thái độ phục vụ tốt.', 'Dịch vụ & F&B', 'Bình Thạnh, TP.HCM', 'HOURLY', 30000, 'PART_TIME', 'OPEN', 'APPROVED')
ON CONFLICT (id) DO NOTHING;

-- 7. Đơn ứng tuyển mẫu
INSERT INTO applications (id, job_id, student_id, cover_letter, cv_url, status)
VALUES 
(1, 1, 4, 'Em là sinh viên Kỹ thuật phần mềm Văn Lang, em đã từng làm đồ án với React và muốn ứng tuyển vị trí này để trau dồi.', 'https://cv.example.com/nguyen-van-chi.pdf', 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- 8. Đồng bộ sequence id
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('jobs_id_seq', COALESCE((SELECT MAX(id) FROM jobs), 1));
SELECT setval('applications_id_seq', COALESCE((SELECT MAX(id) FROM applications), 1));
