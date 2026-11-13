const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { toPublicDto, validatePublicInfo, normalizeLegalStatus, readBranches } = require('../../src/modules/auth/employer-public.service');
const { validateRepresentative, validateLegalInfo, normalizeTaxCode } = require('../../src/modules/auth/employer-account.service');
const { diffFields } = require('../../src/modules/auth/employer-audit');

const row = {
    user_id: 7, display_name: 'ABC', company_name: 'Công ty TNHH ABC', account_type: 'Doanh nghiệp / Công ty',
    tax_code: '0312345678', representative_name: 'Trần Văn B', representative_title: 'HR Manager',
    representative_avatar_url: '/api/files/representative-avatar?v=9', verification_note: 'Ảnh mờ',
    verification_status: 'NEEDS_INFO', hr_policy_details: { internship: 'Có phụ cấp', hacker: 'x' },
    internal_culture: 'Thứ 6 vui vẻ',
    branches: [
        'Chi nhánh cũ: 12 Láng Hạ, Hà Nội',
        { name: 'CN Thủ Đức', address: '1 Võ Văn Ngân', phone: '0901234567', email: 'td@abc.vn', is_active: true },
        { name: 'CN đóng', address: '2 Lê Lợi', is_active: false },
    ],
};

describe('Hồ sơ doanh nghiệp — dữ liệu công khai', () => {
    test('Không lộ thông tin người đại diện, MST, ghi chú xét duyệt', () => {
        const dto = toPublicDto(row, 0);
        for (const k of ['tax_code', 'representative_name', 'representative_title', 'representative_avatar_url', 'verification_note']) {
            assert.ok(!(k in dto), `không được có ${k}`);
        }
        assert.ok(!JSON.stringify(dto).includes('Ảnh mờ'));
    });

    test('Trạng thái nội bộ NEEDS_INFO/REJECTED hiển thị công khai là UNVERIFIED', () => {
        assert.equal(toPublicDto(row, 0).verification.legal_status, 'UNVERIFIED');
        assert.equal(toPublicDto({ ...row, verification_status: 'REJECTED' }, 0).verification.legal_status, 'UNVERIFIED');
        assert.equal(toPublicDto({ ...row, verification_status: 'PENDING' }, 0).verification.legal_status, 'PENDING');
        assert.equal(normalizeLegalStatus('PENDING_VERIFICATION'), 'UNVERIFIED');
    });

    test('Chi nhánh: chuỗi cũ vẫn đọc được, chi nhánh ngừng hoạt động bị ẩn', () => {
        const all = readBranches(row.branches);
        assert.equal(all.length, 3);
        assert.equal(all[0].address, 'Chi nhánh cũ: 12 Láng Hạ, Hà Nội');
        const pub = toPublicDto(row, 0).branches;
        assert.deepEqual(pub.map(b => b.name), [null, 'CN Thủ Đức']);
        assert.ok(pub.every(b => !('is_active' in b)));
    });

    test('Chính sách nhân sự: chỉ khóa hợp lệ', () => {
        assert.deepEqual(toPublicDto(row, 0).hr_policy_details, { internship: 'Có phụ cấp' });
        assert.equal(toPublicDto(row, 0).internal_culture, 'Thứ 6 vui vẻ');
    });
});

describe('Hồ sơ doanh nghiệp — kiểm tra dữ liệu nhập', () => {
    test('Chỉ ghi các trường có gửi lên', () => {
        const v = validatePublicInfo({ brand_name: 'X', latitude: '' });
        assert.deepEqual(v.present.sort(), ['brand_name', 'latitude', 'longitude']);
    });

    test('Chi nhánh: cần địa chỉ, SĐT/email/tọa độ hợp lệ; dòng trống bị bỏ', () => {
        const ok = validatePublicInfo({ branches: [{ name: 'CN1', address: '1 Lê Lợi', phone: '028 3838 8888', latitude: '10.77', longitude: '106.7' }, { name: '' }] });
        assert.equal(ok.branches.length, 1);
        assert.equal(ok.branches[0].phone, '02838388888');
        assert.equal(ok.branches[0].is_active, true);
        const bad = [
            [{ branches: [{ name: 'CN1' }] }, /địa chỉ/],
            [{ branches: [{ address: 'x', phone: '12' }] }, /số điện thoại/],
            [{ branches: [{ address: 'x', email: 'abc' }] }, /email/],
            [{ branches: [{ address: 'x', latitude: 48.8, longitude: 2.3 }] }, /Việt Nam/],
            [{ branches: Array.from({ length: 21 }, () => ({ address: 'x' })) }, /Tối đa 20/],
            [{ display_name: '  ' }, /Tên hiển thị/],
            [{ website: 'javascript:alert(1)' }, /Website/],
        ];
        for (const [body, re] of bad) assert.throws(() => validatePublicInfo(body), (e) => e.statusCode === 400 && re.test(e.message));
    });

    test('Chính sách nhân sự: bỏ khóa lạ', () => {
        assert.deepEqual(validatePublicInfo({ hr_policy_details: { part_time: ' Ca linh hoạt ', evil: 'x' } }).hr_policy_details, { part_time: 'Ca linh hoạt' });
    });

    test('Người đại diện', () => {
        assert.deepEqual(validateRepresentative({ representative_name: '  Nguyễn  Văn A ', representative_title: '' }),
            { representative_name: 'Nguyễn Văn A', representative_title: null });
        assert.throws(() => validateRepresentative({ representative_name: 'A' }), /ít nhất 2/);
        assert.throws(() => validateRepresentative({ representative_name: 'Nguyễn 123' }), /số hoặc ký tự/);
    });

    test('Thông tin pháp lý: MST 10 số hoặc 10-3', () => {
        assert.equal(normalizeTaxCode('0312 345 678'), '0312345678');
        assert.equal(normalizeTaxCode('0312345678-001'), '0312345678-001');
        assert.equal(normalizeTaxCode('12345'), null);
        assert.throws(() => validateLegalInfo({ company_name: 'Công ty A', tax_code: '1' }), /Mã số thuế/);
        assert.throws(() => validateLegalInfo({ tax_code: '0312345678' }), /tên pháp nhân/);
    });
});

describe('Lịch sử thay đổi', () => {
    test('Ghi cũ → mới cho trường quan trọng, chỉ "đã cập nhật" cho văn bản dài; tọa độ so theo số', () => {
        const changes = diffFields(
            { display_name: 'A', latitude: '10.800000', bio: 'cũ', mission: 'giữ nguyên' },
            { display_name: 'B', latitude: 10.8, bio: 'mới', mission: 'giữ nguyên' },
            ['display_name', 'latitude'], ['bio', 'mission']
        );
        assert.deepEqual(changes, { display_name: { from: 'A', to: 'B' }, bio: { updated: true } });
    });
});
