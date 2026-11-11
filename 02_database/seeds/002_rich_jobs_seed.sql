-- Seed data bổ sung: Cập nhật thông tin chi tiết cho Jobs hiện có và thêm công việc mẫu theo yêu cầu

-- Cập nhật dữ liệu chi tiết cho Job 1
UPDATE jobs SET 
    experience = 'Dưới 1 năm kinh nghiệm',
    education = 'Đang theo học hoặc tốt nghiệp CĐ/ĐH',
    headcount = 2,
    level = 'Thực tập sinh / Junior',
    deadline = '2026-11-30',
    work_schedule = 'Thứ 2 - Thứ 6: 08:00 - 12:00 hoặc 13:30 - 17:30 (Đăng ký ca linh hoạt theo lịch học sinh viên, tối thiểu 20h/tuần)',
    benefits = '• Mức thu nhập: 45.000đ/giờ + Phụ cấp chuyên cần và gửi xe.
• Hỗ trợ dấu thực tập và tài liệu làm khóa luận tốt nghiệp.
• Được đào tạo bài bản quy trình Agile/Scrum, review code 1-1 bởi Senior Dev.
• Tham gia các buổi Workshop nội bộ, teambuilding định kỳ hàng tháng.
• Cơ hội được xem xét trở thành nhân viên chính thức sau khi tốt nghiệp.'
WHERE id = 1;

-- Cập nhật dữ liệu chi tiết cho Job 2
UPDATE jobs SET 
    experience = '1 - 2 năm kinh nghiệm',
    education = 'Không yêu cầu bằng cấp, đánh giá theo Portfolio',
    headcount = 1,
    level = 'Cộng tác viên (Freelancer)',
    deadline = '2026-12-10',
    work_schedule = 'Làm việc từ xa (Remote 100%), chủ động sắp xếp thời gian miễn đảm bảo tiến độ bàn giao thiết kế (Deadline theo tuần)',
    benefits = '• Thù lao hấp dẫn: 2.500.000đ/dự án/gói thiết kế, thanh toán đúng hạn qua tài khoản ngân hàng.
• Thưởng nóng nếu sản phẩm đạt tương tác cao trong chiến dịch.
• Cung cấp tài khoản bản quyền Figma, Envato Elements, Freepik Premium.
• Tự do sáng tạo và làm việc linh hoạt tại bất kỳ đâu.'
WHERE id = 2;

-- Cập nhật dữ liệu chi tiết cho Job 3
UPDATE jobs SET 
    experience = 'Không yêu cầu kinh nghiệm',
    education = 'Tốt nghiệp THPT trở lên',
    headcount = 3,
    level = 'Nhân viên bán thời gian',
    deadline = '2026-11-25',
    work_schedule = 'Ca tối: 17:00 - 22:30 (Thứ 2 đến Chủ nhật, đăng ký tối thiểu 4 ca/tuần)',
    benefits = '• Mức lương: 30.000đ/giờ + Thưởng doanh thu ca và tiền Tip.
• Miễn phí 01 phần đồ uống trong mỗi ca làm việc.
• Giảm giá 30% toàn menu khi sử dụng dịch vụ tại quán cùng bạn bè/gia đình.
• Môi trường làm việc trẻ trung, năng động, đồng nghiệp thân thiện hỗ trợ nhau.'
WHERE id = 3;

-- Thêm công việc mẫu yêu cầu: "Triển Khai Kỹ Thuật Thi Công (Nội Thất Văn Phòng)"
INSERT INTO jobs (
    id, employer_id, title, description, requirements, category, location, 
    salary_type, salary, work_type, status, moderation_status,
    experience, education, headcount, level, deadline, work_schedule, benefits
)
VALUES (
    4,
    2,
    'Triển Khai Kỹ Thuật Thi Công (Nội Thất Văn Phòng)',
    '• Triển khai bản vẽ kỹ thuật 2D chi tiết cho các dự án nội thất văn phòng và thương mại.
• Thể hiện đầy đủ và chính xác thông tin vật liệu, phụ kiện, quy cách kỹ thuật phục vụ gia công sản xuất.
• Triển khai hồ sơ shopdrawing, phối hợp bóc tách khối lượng vật tư và cấu kiện thi công.
• Phối hợp chặt chẽ với bộ phận thiết kế ý tưởng và đội ngũ kỹ sư giám sát tại công trình.
• Thực hiện các công việc chuyên môn khác liên quan theo sự phân công của Trưởng bộ phận Kỹ thuật.',
    '• Tối thiểu 02 năm kinh nghiệm ở vị trí triển khai kỹ thuật / shopdrawing nội thất văn phòng.
• Có kinh nghiệm thực tế triển khai hoàn thiện hồ sơ thi công nội thất, fit-out thương mại.
• Am hiểu sâu về cấu tạo đồ gỗ nội thất, vật liệu mới và các phụ kiện kỹ thuật hiện đại.
• Có khả năng đọc hiểu bản vẽ hệ thống M&E cơ bản để phối hợp ăn khớp trên mặt bằng.
• Sử dụng thành thạo AutoCAD 2D, SketchUp; ưu tiên ứng viên biết thêm Revit hoặc 3dsMax.',
    'Thiết kế đồ họa',
    'Quận 1, TP. Hồ Chí Minh',
    'MONTHLY',
    18000000,
    'FULL_TIME',
    'OPEN',
    'APPROVED',
    'Tối thiểu 02 năm',
    'Cao đẳng / Đại học chuyên ngành Kiến trúc, Nội thất',
    2,
    'Nhân viên kỹ thuật',
    '2026-12-15',
    'Thứ 2 – Thứ 7 (08:30 – 18:00, Nghỉ trưa 12:00 – 13:30; Thứ 7 làm việc cách tuần)',
    '• Mức lương cạnh tranh: 15.000.000 – 20.000.000 VNĐ/tháng theo năng lực thực tế.
• Hoa hồng hấp dẫn theo từng hợp đồng thi công bàn giao thành công.
• Đầy đủ chế độ BHXH, BHYT, BHTN theo đúng quy định của Luật Lao động.
• Hoạt động Team building, du lịch nghỉ dưỡng hàng năm, khám sức khỏe định kỳ.
• Thưởng các ngày lễ tết, lương tháng 13 và xét duyệt tăng lương định kỳ.'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    requirements = EXCLUDED.requirements,
    category = EXCLUDED.category,
    location = EXCLUDED.location,
    salary_type = EXCLUDED.salary_type,
    salary = EXCLUDED.salary,
    work_type = EXCLUDED.work_type,
    experience = EXCLUDED.experience,
    education = EXCLUDED.education,
    headcount = EXCLUDED.headcount,
    level = EXCLUDED.level,
    deadline = EXCLUDED.deadline,
    work_schedule = EXCLUDED.work_schedule,
    benefits = EXCLUDED.benefits;

-- Cập nhật profile TechCorp website
UPDATE employer_profiles SET 
    website = 'https://techcorp.vn'
WHERE user_id = 2;

-- Cập nhật profile Coffee Chill website
UPDATE employer_profiles SET 
    website = 'https://coffeechill.vn'
WHERE user_id = 3;

-- Đồng bộ sequence id
SELECT setval('jobs_id_seq', (SELECT MAX(id) FROM jobs));
