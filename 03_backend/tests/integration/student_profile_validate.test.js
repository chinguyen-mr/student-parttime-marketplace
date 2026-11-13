const { test, describe } = require('node:test');
const assert = require('node:assert');
const { validate } = require('../../src/modules/auth/student-profile.service');

const base = { full_name: 'Nguyễn Văn A' };

describe('Hồ sơ sinh viên: kiểm tra dữ liệu form', () => {
    test('Dữ liệu hợp lệ được chuẩn hóa (trim, bỏ trùng kỹ năng, chuẩn hóa SĐT)', () => {
        const out = validate({
            ...base,
            phone: '0901 234 567',
            gender: 'Nữ',
            date_of_birth: '2004-05-20',
            skills: [' ReactJS ', 'reactjs', 'Figma', ''],
            languages: [{ language: 'Tiếng Anh', level: 'Giao tiếp' }, { language: '' }],
            experiences: [{ title: 'Phục vụ', organization: 'Cafe A', start_month: '2024-01', end_month: '' }],
            gpa: '3.4',
            graduation_year: '2027',
            desired_work_type: 'PART_TIME',
        });
        assert.strictEqual(out.phone, '0901234567');
        assert.deepStrictEqual(out.skills, ['ReactJS', 'Figma']);
        assert.strictEqual(out.languages.length, 1);
        assert.strictEqual(out.experiences[0].end_month, null);
        assert.strictEqual(out.gpa, 3.4);
        assert.strictEqual(out.graduation_year, 2027);
    });

    test('Trường để trống trở thành null (cho phép xóa thông tin cũ)', () => {
        const out = validate({ ...base, province: '   ', bio: '' });
        assert.strictEqual(out.province, null);
        assert.strictEqual(out.bio, null);
    });

    const invalid = [
        ['thiếu họ tên', { full_name: ' ' }, /Họ và tên/],
        ['SĐT sai', { ...base, phone: '12345' }, /Số điện thoại/],
        ['ngày sinh quá nhỏ tuổi', { ...base, date_of_birth: new Date().toISOString().slice(0, 10) }, /Ngày sinh/],
        ['giới tính lạ', { ...base, gender: 'X' }, /Giới tính/],
        ['GPA > 10', { ...base, gpa: 11 }, /GPA/],
        ['loại hình FREELANCE', { ...base, desired_work_type: 'FREELANCE' }, /Part-time hoặc Full-time/],
        ['kinh nghiệm thiếu vị trí', { ...base, experiences: [{ organization: 'X' }] }, /Kinh nghiệm #1/],
        ['kinh nghiệm kết thúc trước bắt đầu', { ...base, experiences: [{ title: 'A', start_month: '2025-05', end_month: '2024-01' }] }, /kết thúc trước/],
    ];
    for (const [name, body, re] of invalid) {
        test(`Từ chối: ${name}`, () => {
            assert.throws(() => validate(body), (err) => err.statusCode === 400 && re.test(err.message));
        });
    }
});
