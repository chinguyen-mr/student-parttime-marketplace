-- Migration 003: Bổ sung tọa độ (latitude, longitude) và địa chỉ làm việc chi tiết (work_address) cho bảng jobs

-- 1. Bổ sung các cột
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_address VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);

-- 2. Cập nhật dữ liệu tọa độ thực tế cho các công việc mẫu tiêu biểu

-- Job 1: Lập trình viên Frontend React.js Part-time (Quận 1, TP.HCM)
UPDATE jobs SET 
    work_address = 'Tòa nhà Bitexco Financial Tower, 02 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    latitude = 10.7716610,
    longitude = 106.7044030
WHERE id = 1;

-- Job 2: Cộng tác viên Thiết kế Banner UI/UX Freelance (Remote)
UPDATE jobs SET 
    work_address = NULL,
    latitude = NULL,
    longitude = NULL
WHERE id = 2;

-- Job 3: Nhân viên Phục vụ ca tối The Coffee Chill (123 Đặng Thùy Trâm, Bình Thạnh, TP.HCM)
UPDATE jobs SET 
    work_address = '123 Đặng Thùy Trâm, Phường 13, Bình Thạnh, TP. Hồ Chí Minh',
    latitude = 10.8277250,
    longitude = 106.6997120
WHERE id = 3;

-- Job 4: Triển Khai Kỹ Thuật Thi Công (Nội Thất Văn Phòng) (Quận 1, TP.HCM)
UPDATE jobs SET 
    work_address = 'Tòa nhà Saigon Tower, 29 Lê Duẩn, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    latitude = 10.7818500,
    longitude = 106.7001200
WHERE id = 4;

-- Job 103: Cộng tác viên Tester (Manual) (Khu Công Nghệ Cao, TP. Thủ Đức / Quận 9)
UPDATE jobs SET 
    work_address = '305 Đường D1, Khu Công Nghệ Cao, Phường Tăng Nhơn Phú B, TP. Thủ Đức, TP. Hồ Chí Minh',
    latitude = 10.8542100,
    longitude = 106.7865400
WHERE id = 103;

-- Cập nhật tọa độ mặc định theo khu vực cho các job khác nếu có tên quận/thành phố
UPDATE jobs SET 
    work_address = COALESCE(work_address, location),
    latitude = COALESCE(latitude, 10.7768890),
    longitude = COALESCE(longitude, 106.7008060)
WHERE location ILIKE '%quận 1%' AND latitude IS NULL;

UPDATE jobs SET 
    work_address = COALESCE(work_address, location),
    latitude = COALESCE(latitude, 10.8015000),
    longitude = COALESCE(longitude, 106.7112000)
WHERE location ILIKE '%bình thạnh%' AND latitude IS NULL;

UPDATE jobs SET 
    work_address = COALESCE(work_address, location),
    latitude = COALESCE(latitude, 10.8542100),
    longitude = COALESCE(longitude, 106.7865400)
WHERE (location ILIKE '%quận 9%' OR location ILIKE '%thủ đức%') AND latitude IS NULL;
