-- =============================================================================
-- MIGRATION: 006_normalize_work_type.sql
-- JobNest chỉ hỗ trợ 2 loại hình: PART_TIME và FULL_TIME.
-- Không có Freelance, Thời vụ (Seasonal) hay làm việc từ xa (Remote/Hybrid).
-- Chạy lại nhiều lần vẫn an toàn (idempotent).
-- =============================================================================

BEGIN;

-- 1. Hai tin Freelance thiết kế banner → CTV Part-time làm tại văn phòng nhà tuyển dụng,
--    thù lao trọn gói (FIXED) → lương tháng (MONTHLY).
UPDATE jobs j
SET location    = COALESCE(NULLIF(ep.location, ''), 'TP. Hồ Chí Minh'),
    title       = regexp_replace(j.title, '\s*Freelance\s*$', ' Part-time', 'i'),
    salary_type = 'MONTHLY',
    updated_at  = NOW()
FROM employer_profiles ep
WHERE ep.user_id = j.employer_id
  AND j.work_type = 'FREELANCE';

-- 2. Bỏ ghi chú Remote/Hybrid trong địa điểm làm việc
UPDATE jobs
SET location   = btrim(regexp_replace(location, '\s*\((Hỗ trợ )?(Hybrid|Remote)\)', '', 'gi')),
    updated_at = NOW()
WHERE location ~* '(hybrid|remote)';

-- 2b. Chi tiết tin #2 (seed 002) và quyền lợi "làm từ xa" → mô tả làm tại văn phòng
UPDATE jobs
SET level = 'Cộng tác viên bán thời gian',
    work_schedule = 'Thứ 2 - Thứ 6: chọn 3 buổi/tuần (08:00 - 12:00 hoặc 13:30 - 17:30) tại văn phòng, đăng ký ca theo lịch học sinh viên',
    benefits = E'• Mức lương: 2.500.000đ/tháng cho 3 buổi/tuần, thanh toán đúng hạn qua tài khoản ngân hàng.\n• Thưởng nóng nếu sản phẩm đạt tương tác cao trong chiến dịch.\n• Cung cấp tài khoản bản quyền Figma, Envato Elements, Freepik Premium.\n• Được Senior Designer hướng dẫn trực tiếp, môi trường làm việc sáng tạo.'
WHERE id = 2 AND level ~* 'freelanc';

UPDATE jobs
SET benefits = regexp_replace(benefits, ',\s*một phần có thể làm từ xa', '', 'gi')
WHERE benefits ~* 'làm từ xa';

-- 2c. Trước khi chuẩn hóa: work_type cũ chứa tên ca ("Ca sáng (8h-12h)"...) → tạo ca làm cụ thể
--     Thứ 2 – Thứ 7, sinh viên cần rảnh ít nhất 2 giờ trong ca, ít nhất 1 ngày (chỉ cho tin chưa có ca).
INSERT INTO job_work_schedules (job_id, day_of_week, start_time, end_time, min_hours_per_shift, is_mandatory)
SELECT j.id, d.day, v.start_time, v.end_time, 2, TRUE
FROM jobs j
JOIN (VALUES
    ('Ca sáng (8h-12h)',   TIME '08:00', TIME '12:00'),
    ('Ca chiều (13h-17h)', TIME '13:00', TIME '17:00'),
    ('Ca tối (18h-22h)',   TIME '18:00', TIME '22:00')
) AS v(shift_name, start_time, end_time) ON v.shift_name = j.work_type
CROSS JOIN generate_series(2, 7) AS d(day)  -- 1 = Chủ nhật, 2..7 = Thứ 2..Thứ 7
WHERE NOT EXISTS (SELECT 1 FROM job_work_schedules s WHERE s.job_id = j.id);

-- 3. Mọi giá trị khác (FREELANCE, SEASONAL, tên ca làm như "Ca sáng (8h-12h)", NULL) → PART_TIME.
--    Giờ làm cụ thể vẫn được giữ trong bảng job_work_schedules.
UPDATE jobs
SET work_type = 'PART_TIME'
WHERE work_type IS NULL OR work_type NOT IN ('PART_TIME', 'FULL_TIME');

-- 4. Khóa chặt ở tầng database
ALTER TABLE jobs ALTER COLUMN work_type SET DEFAULT 'PART_TIME';
ALTER TABLE jobs ALTER COLUMN work_type SET NOT NULL;
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_work_type_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_work_type_check CHECK (work_type IN ('PART_TIME', 'FULL_TIME'));

COMMIT;
