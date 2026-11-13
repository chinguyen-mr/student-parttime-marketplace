import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatSalary, salaryCaption, workTypeLabel, shortLocation, postedLabel, deadlineInfo, applyBlockReason, formatSchedules,
  salaryOptionsFor, matchesSalaryFilter
} from './jobDisplay.js';

const daysFromNow = (n) => new Date(Date.now() + n * 86400000).toISOString();

const fullJob = {
  id: 1, title: 'Nhân viên Barista Part-time', status: 'OPEN', work_type: 'PART_TIME',
  salary: 32000, salary_type: 'HOURLY', location: '69/68 Đặng Thùy Trâm, Phường Bình Thạnh, TP. Hồ Chí Minh',
  experience: 'Không yêu cầu kinh nghiệm', level: 'Nhân viên', headcount: 5,
  created_at: daysFromNow(-2), application_deadline: daysFromNow(20),
};

describe('Hiển thị tin tuyển dụng (thẻ & popup xem nhanh)', () => {
  test('Tin đầy đủ dữ liệu', () => {
    assert.equal(formatSalary(fullJob), '32.000 đ/giờ');
    assert.equal(salaryCaption(fullJob), 'Lương theo giờ');
    assert.equal(workTypeLabel(fullJob), 'Part-time');
    assert.equal(shortLocation(fullJob), '69/68 Đặng Thùy Trâm, TP. Hồ Chí Minh');
    assert.equal(postedLabel(fullJob), 'Đăng 2 ngày trước');
    assert.equal(deadlineInfo(fullJob).expired, false);
    assert.equal(applyBlockReason(fullJob), null);
  });

  test('Lương tháng hiển thị đúng số, không tự cộng thành khoảng', () => {
    assert.equal(formatSalary({ salary: 18000000, salary_type: 'MONTHLY' }), '18 triệu/tháng');
    assert.equal(formatSalary({ salary: 4500000, salary_type: 'MONTHLY' }), '4,5 triệu/tháng');
    assert.equal(workTypeLabel({ work_type: 'FULL_TIME' }), 'Full-time');
  });

  test('Tin không có lương → "Thỏa thuận"', () => {
    assert.equal(formatSalary({ salary: 0 }), 'Thỏa thuận');
    assert.equal(formatSalary({}), 'Thỏa thuận');
    assert.equal(salaryCaption({ salary: null }), 'Trao đổi khi phỏng vấn');
  });

  test('Tin không có hạn ứng tuyển → không hiện hạn, vẫn ứng tuyển được', () => {
    const job = { ...fullJob, application_deadline: null, deadline: null };
    assert.equal(deadlineInfo(job), null);
    assert.equal(applyBlockReason(job), null);
  });

  test('Tin hết hạn → chặn ứng tuyển', () => {
    const job = { ...fullJob, application_deadline: daysFromNow(-3) };
    assert.equal(deadlineInfo(job).expired, true);
    assert.match(applyBlockReason(job), /hết hạn/);
  });

  test('Hạn nộp là hôm nay → vẫn còn hạn, đánh dấu gấp', () => {
    const d = deadlineInfo({ application_deadline: new Date().toISOString() });
    assert.equal(d.expired, false);
    assert.equal(d.urgent, true);
    assert.equal(d.daysLeft, 0);
  });

  test('Tin đã đóng → chặn ứng tuyển', () => {
    assert.match(applyBlockReason({ ...fullJob, status: 'CLOSED' }), /ngừng nhận hồ sơ/);
    assert.match(applyBlockReason({ ...fullJob, status: 'FILLED' }), /ngừng nhận hồ sơ/);
  });

  test('Tin thiếu địa điểm / ngày đăng → trả null để giao diện ẩn mục', () => {
    assert.equal(shortLocation({ location: '' }), null);
    assert.equal(postedLabel({ created_at: null }), null);
  });

  test('Ca làm việc: gộp ngày cùng khung giờ', () => {
    const ws = [3, 5, 7].map(d => ({ day_of_week: d, start_time: '08:00:00', end_time: '11:30:00' }));
    assert.deepEqual(formatSchedules(ws), ['T3, T5, T7 · 08:00–11:30']);
    const weekday = [2, 3, 4, 5, 6, 7].map(d => ({ day_of_week: d, start_time: '18:00:00', end_time: '22:00:00' }));
    assert.deepEqual(formatSchedules(weekday), ['T2 – T7 · 18:00–22:00']);
    // Chủ nhật (1) đứng cuối
    assert.deepEqual(formatSchedules([1, 7].map(d => ({ day_of_week: d, start_time: '08:00:00', end_time: '17:00:00' }))), ['T7, CN · 08:00–17:00']);
    assert.deepEqual(formatSchedules([]), []);
    assert.deepEqual(formatSchedules(undefined), []);
  });

  test('Lọc mức lương theo loại hình', () => {
    const pt = { work_type: 'PART_TIME', salary: 30000, salary_type: 'HOURLY' };
    const ft = { work_type: 'FULL_TIME', salary: 18000000, salary_type: 'MONTHLY' };
    assert.equal(matchesSalaryFilter(pt, 'PT_H_25_35K'), true);
    assert.equal(matchesSalaryFilter(ft, 'PT_H_25_35K'), false);
    assert.equal(matchesSalaryFilter(ft, 'FT_12_20M'), true);
    assert.equal(matchesSalaryFilter({ salary: 0 }, 'NEGOTIABLE'), true);
    assert.equal(matchesSalaryFilter(pt, ''), true);
    assert.ok(salaryOptionsFor('').some(o => o.label.startsWith('Full-time ·')));
  });
});
