-- =============================================================================
-- SEED 003: DỮ LIỆU DEMO ĐỐI CHỨNG SO KHỚP THỜI GIAN THEO LỊCH HỌC SINH VIÊN
-- Sinh viên A: Ca sáng (T2, T4, T6)
-- Sinh viên B: Ca tối (T3, T5, T7)
-- Job A (Sáng): The Coffee Chill House
-- Job B (Tối): Galaxy Cinema
-- Job C (Linh hoạt/Một phần): Siêu thị Emart
-- =============================================================================

-- 1. CẬP NHẬT PROFILE SINH VIÊN A & B
INSERT INTO student_profiles (user_id, full_name, school, major, bio)
SELECT id, 'Trần Văn Sáng (SV Ca Sáng)', 'Trường Đại học Văn Lang (VLU)', 'Du lịch - Khách sạn', 'Sinh viên năm 3 rảnh các buổi sáng trong tuần, mong muốn làm thêm tại chuỗi F&B.'
FROM users WHERE email = 'student.morning@vlu.edu.vn'
ON CONFLICT (user_id) DO UPDATE 
SET major = 'Du lịch - Khách sạn', 
    bio = 'Sinh viên năm 3 rảnh các buổi sáng trong tuần, mong muốn làm thêm tại chuỗi F&B.',
    updated_at = NOW();

INSERT INTO student_profiles (user_id, full_name, school, major, bio)
SELECT id, 'Lê Thị Tối (SV Ca Tối)', 'Trường Đại học Văn Lang (VLU)', 'Công nghệ Thông tin', 'Sinh viên năm cuối rảnh các buổi tối trong tuần, tìm việc làm ca tối linh hoạt.'
FROM users WHERE email = 'student.evening@vlu.edu.vn'
ON CONFLICT (user_id) DO UPDATE 
SET major = 'Công nghệ Thông tin', 
    bio = 'Sinh viên năm cuối rảnh các buổi tối trong tuần, tìm việc làm ca tối linh hoạt.',
    updated_at = NOW();

-- 2. CÀI ĐẶT LỊCH RẢNH SINH VIÊN A (Ca Sáng: T2, T4, T6 từ 07:30 đến 11:30)
DELETE FROM student_availabilities 
WHERE student_id IN (SELECT id FROM users WHERE email IN ('student.morning@vlu.edu.vn', 'student.evening@vlu.edu.vn'));

-- Sinh viên A: Thứ 2 (2), Thứ 4 (4), Thứ 6 (6)
INSERT INTO student_availabilities (student_id, day_of_week, start_time, end_time, is_active)
SELECT u.id, 2, '07:30:00'::TIME, '11:30:00'::TIME, TRUE FROM users u WHERE u.email = 'student.morning@vlu.edu.vn'
UNION ALL
SELECT u.id, 4, '07:30:00'::TIME, '11:30:00'::TIME, TRUE FROM users u WHERE u.email = 'student.morning@vlu.edu.vn'
UNION ALL
SELECT u.id, 6, '07:30:00'::TIME, '11:30:00'::TIME, TRUE FROM users u WHERE u.email = 'student.morning@vlu.edu.vn';

-- Sinh viên B: Thứ 3 (3), Thứ 5 (5), Thứ 7 (7) từ 18:00 đến 22:00
INSERT INTO student_availabilities (student_id, day_of_week, start_time, end_time, is_active)
SELECT u.id, 3, '18:00:00'::TIME, '22:00:00'::TIME, TRUE FROM users u WHERE u.email = 'student.evening@vlu.edu.vn'
UNION ALL
SELECT u.id, 5, '18:00:00'::TIME, '22:00:00'::TIME, TRUE FROM users u WHERE u.email = 'student.evening@vlu.edu.vn'
UNION ALL
SELECT u.id, 7, '18:00:00'::TIME, '22:00:00'::TIME, TRUE FROM users u WHERE u.email = 'student.evening@vlu.edu.vn';

-- 3. TẠO HOẶC CẬP NHẬT 3 CÔNG VIỆC DEMO ĐỐI CHỨNG (DO EMPLOYER.TEST ĐĂNG)
DO $$
DECLARE
    emp_id INT;
    job_morning_id INT;
    job_evening_id INT;
    job_partial_id INT;
BEGIN
    SELECT id INTO emp_id FROM users WHERE email = 'employer.test@vlu.edu.vn';

    IF emp_id IS NOT NULL THEN
        -- Job 1: Ca Sáng - The Coffee Chill House
        SELECT id INTO job_morning_id FROM jobs 
        WHERE employer_id = emp_id AND title = 'Nhân viên Phục vụ Part-time The Coffee Chill House (Ca Sáng)' LIMIT 1;

        IF job_morning_id IS NULL THEN
            INSERT INTO jobs (
                employer_id, title, description, requirements, category, location, 
                salary_type, salary, work_type, status, moderation_status, application_deadline
            ) VALUES (
                emp_id, 
                'Nhân viên Phục vụ Part-time The Coffee Chill House (Ca Sáng)',
                'Phục vụ order đồ uống và tiếp đón khách hàng ca sáng. Phù hợp sinh viên học buổi chiều/tối.',
                'Nhanh nhẹn, chăm chỉ, đúng giờ.',
                'Nhà hàng / F&B',
                'Quận Bình Thạnh, TP.HCM',
                'HOURLY', 35000, 'PART_TIME', 'OPEN', 'APPROVED', NOW() + INTERVAL '30 days'
            ) RETURNING id INTO job_morning_id;
        ELSE
            UPDATE jobs SET 
                status = 'OPEN', moderation_status = 'APPROVED',
                salary = 35000, location = 'Quận Bình Thạnh, TP.HCM', category = 'Nhà hàng / F&B'
            WHERE id = job_morning_id;
        END IF;

        -- Job 2: Ca Tối - Thu ngân & Soát vé Galaxy Cinema
        SELECT id INTO job_evening_id FROM jobs 
        WHERE employer_id = emp_id AND title = 'Thu ngân & Soát vé Rạp chiếu phim Galaxy (Ca Tối)' LIMIT 1;

        IF job_evening_id IS NULL THEN
            INSERT INTO jobs (
                employer_id, title, description, requirements, category, location, 
                salary_type, salary, work_type, status, moderation_status, application_deadline
            ) VALUES (
                emp_id, 
                'Thu ngân & Soát vé Rạp chiếu phim Galaxy (Ca Tối)',
                'Bán vé và hướng dẫn khán giả vào phòng chiếu ca tối. Môi trường trẻ trung, máy lạnh.',
                'Thân thiện, trung thực, giao tiếp tốt.',
                'Dịch vụ / Bán vé',
                'Quận Gò Vấp, TP.HCM',
                'HOURLY', 38000, 'PART_TIME', 'OPEN', 'APPROVED', NOW() + INTERVAL '30 days'
            ) RETURNING id INTO job_evening_id;
        ELSE
            UPDATE jobs SET 
                status = 'OPEN', moderation_status = 'APPROVED',
                salary = 38000, location = 'Quận Gò Vấp, TP.HCM', category = 'Dịch vụ / Bán vé'
            WHERE id = job_evening_id;
        END IF;

        -- Job 3: Ca Linh hoạt - Cộng tác viên Trưng bày Emart
        SELECT id INTO job_partial_id FROM jobs 
        WHERE employer_id = emp_id AND title = 'Cộng tác viên Bán hàng & Trưng bày Siêu thị Emart (Ca Linh hoạt)' LIMIT 1;

        IF job_partial_id IS NULL THEN
            INSERT INTO jobs (
                employer_id, title, description, requirements, category, location, 
                salary_type, salary, work_type, status, moderation_status, application_deadline
            ) VALUES (
                emp_id, 
                'Cộng tác viên Bán hàng & Trưng bày Siêu thị Emart (Ca Linh hoạt)',
                'Hỗ trợ sắp xếp hàng hóa kệ trưng bày. Ca làm việc linh hoạt theo ngày đăng ký.',
                'Sức khỏe tốt, cẩn thận.',
                'Bán lẻ',
                'Quận Gò Vấp, TP.HCM',
                'HOURLY', 32000, 'PART_TIME', 'OPEN', 'APPROVED', NOW() + INTERVAL '30 days'
            ) RETURNING id INTO job_partial_id;
        ELSE
            UPDATE jobs SET 
                status = 'OPEN', moderation_status = 'APPROVED',
                salary = 32000, location = 'Quận Gò Vấp, TP.HCM', category = 'Bán lẻ'
            WHERE id = job_partial_id;
        END IF;

        -- 4. GẮN CA LÀM VIỆC CẤU TRÚC (JOB_WORK_SCHEDULES) - IDEMPOTENT
        DELETE FROM job_work_schedules WHERE job_id IN (job_morning_id, job_evening_id, job_partial_id);

        -- Job Ca Sáng: T2, T4, T6 (08:00 - 11:30, Bắt buộc, tối thiểu 3.5h)
        INSERT INTO job_work_schedules (job_id, day_of_week, start_time, end_time, min_hours_per_shift, is_mandatory)
        VALUES 
            (job_morning_id, 2, '08:00:00', '11:30:00', 3.5, TRUE),
            (job_morning_id, 4, '08:00:00', '11:30:00', 3.5, TRUE),
            (job_morning_id, 6, '08:00:00', '11:30:00', 3.5, TRUE);

        -- Job Ca Tối: T3, T5, T7 (18:00 - 22:00, Bắt buộc, tối thiểu 3.5h)
        INSERT INTO job_work_schedules (job_id, day_of_week, start_time, end_time, min_hours_per_shift, is_mandatory)
        VALUES 
            (job_evening_id, 3, '18:00:00', '22:00:00', 3.5, TRUE),
            (job_evening_id, 5, '18:00:00', '22:00:00', 3.5, TRUE),
            (job_evening_id, 7, '18:00:00', '22:00:00', 3.5, TRUE);

        -- Job Linh hoạt: Sáng T2 (08:00 - 11:30) & Tối T3 (18:00 - 21:30, Tùy chọn)
        INSERT INTO job_work_schedules (job_id, day_of_week, start_time, end_time, min_hours_per_shift, is_mandatory)
        VALUES 
            (job_partial_id, 2, '08:00:00', '11:30:00', 3.0, FALSE),
            (job_partial_id, 3, '18:00:00', '21:30:00', 3.0, FALSE);

    END IF;
END $$;
