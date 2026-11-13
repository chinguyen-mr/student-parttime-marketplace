const { test, describe } = require('node:test');
const assert = require('node:assert');
const { toPublicDto, validatePublicInfo } = require('../../src/modules/auth/employer-public.service');

const baseRow = {
    user_id: 4, display_name: 'Công ty TNHH ABC', company_name: 'Công ty TNHH ABC', full_name: 'Nguyễn Văn HR',
    account_type: 'Doanh nghiệp / Công ty', industry: 'Giáo dục', company_size: '50-200',
    location: 'TP. Hồ Chí Minh', detailed_address: '69/68 Đặng Thùy Trâm, Bình Thạnh',
    email: 'hr_4@company.com', phone: '0969296070', tax_code: '6324778711',
    business_license_file: 'Giay_Phep.pdf', representative_name: 'Trần Văn B', recruiter_email: 'hr@abc.vn',
    status: 'ACTIVE', verification_status: 'UNVERIFIED', email_verified_at: null, phone_verified_at: null,
    office_images: ['/api/files/10', 'https://evil.example/x.png'], branches: ['Hà Nội', ''],
    social_links: { facebook: 'https://facebook.com/abc', linkedin: 'javascript:alert(1)' },
    website: 'https://abc.vn', user_created_at: '2026-01-01T00:00:00Z',
};

describe('Hồ sơ công ty công khai', () => {
    test('Không lộ dữ liệu nội bộ / pháp lý / cá nhân', () => {
        const dto = toPublicDto(baseRow, 3);
        for (const key of ['email', 'phone', 'tax_code', 'business_license_file', 'representative_name', 'recruiter_email', 'status', 'full_name']) {
            assert.ok(!(key in dto), `không được có trường ${key}`);
        }
        assert.strictEqual(dto.open_jobs_count, 3);
    });

    test('Loại tài khoản lấy từ account_type, không suy luận từ tên', () => {
        assert.strictEqual(toPublicDto(baseRow, 0).account_type, 'BUSINESS');
        // Tên có chữ "Công ty" nhưng tài khoản là hộ kinh doanh → vẫn INDIVIDUAL
        assert.strictEqual(toPublicDto({ ...baseRow, account_type: 'Hộ kinh doanh / Cá nhân' }, 0).account_type, 'INDIVIDUAL');
        assert.strictEqual(toPublicDto({ ...baseRow, account_type: null }, 0).account_type, null);
    });

    test('Cá nhân/hộ kinh doanh: không công khai địa chỉ chi tiết', () => {
        assert.strictEqual(toPublicDto(baseRow, 0).headquarters, '69/68 Đặng Thùy Trâm, Bình Thạnh');
        const indiv = toPublicDto({ ...baseRow, account_type: 'Hộ kinh doanh / Cá nhân', location: '27 Võ Văn Ngân, Thủ Đức, TP. Hồ Chí Minh' }, 0);
        assert.strictEqual(indiv.headquarters, null);
        assert.strictEqual(indiv.location, 'Thủ Đức, TP. Hồ Chí Minh');
        // Chưa khai loại tài khoản → cũng coi như không công khai số nhà
        assert.strictEqual(toPublicDto({ ...baseRow, account_type: null, location: '12 Lê Lợi, Quận 1' }, 0).location, 'Quận 1');
    });

    test('Xác minh email/SĐT tách biệt với xác minh pháp lý', () => {
        const onlyContact = toPublicDto({ ...baseRow, email_verified_at: new Date(), phone_verified_at: new Date() }, 0);
        assert.deepStrictEqual(onlyContact.verification, { email: true, phone: true, legal: false, legal_status: 'UNVERIFIED' });
        const legal = toPublicDto({ ...baseRow, verification_status: 'VERIFIED' }, 0);
        assert.strictEqual(legal.verification.legal, true);
        assert.strictEqual(toPublicDto({ ...baseRow, verification_status: 'abc' }, 0).verification.legal_status, 'UNVERIFIED');
    });

    test('Tọa độ: chỉ công khai với doanh nghiệp, làm tròn 6 chữ số', () => {
        const ok = validatePublicInfo({ latitude: '10.82731944', longitude: 106.69964301 });
        assert.strictEqual(ok.latitude, 10.827319);
        assert.strictEqual(validatePublicInfo({}).latitude, null);
        assert.strictEqual(toPublicDto({ ...baseRow, latitude: '10.827319', longitude: '106.699643' }, 0).latitude, 10.827319);
        const indiv = toPublicDto({ ...baseRow, account_type: 'Hộ kinh doanh / Cá nhân', latitude: '10.8', longitude: '106.7' }, 0);
        assert.strictEqual(indiv.latitude, null);
        assert.strictEqual(indiv.longitude, null);
    });

    test('Lọc ảnh/link không hợp lệ', () => {
        const dto = toPublicDto(baseRow, 0);
        assert.deepStrictEqual(dto.office_images, ['/api/files/10']);
        assert.deepStrictEqual(dto.social_links, { facebook: 'https://facebook.com/abc' });
        assert.deepStrictEqual(dto.branches, ['Hà Nội']);
    });

    test('Validate thông tin công khai', () => {
        const ok = validatePublicInfo({ founded_year: '2020', public_phone: '028 3838 8888', branches: ['Hà Nội', ' '] });
        assert.strictEqual(ok.founded_year, 2020);
        assert.strictEqual(ok.public_phone, '02838388888');
        assert.deepStrictEqual(ok.branches, ['Hà Nội']);
        const bad = [
            [{ founded_year: 1700 }, /Năm thành lập/],
            [{ founded_year: new Date().getFullYear() + 1 }, /Năm thành lập/],
            [{ public_phone: '12' }, /Số điện thoại/],
            [{ latitude: 10.8 }, /vĩ độ và kinh độ/],
            [{ latitude: 48.8, longitude: 2.35 }, /Việt Nam/],
            [{ public_email: 'abc' }, /Email/],
            [{ social_links: { facebook: 'javascript:alert(1)' } }, /facebook/],
        ];
        for (const [body, re] of bad) assert.throws(() => validatePublicInfo(body), (e) => e.statusCode === 400 && re.test(e.message));
    });
});
