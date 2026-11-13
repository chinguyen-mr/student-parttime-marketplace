import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatRating, distributionPercent, emptyReviewForm, validateReviewForm, COMPANY_CRITERIA } from './reviewDisplay.js';

test('formatRating: không có điểm → gạch ngang, không hiển thị 0', () => {
  assert.equal(formatRating(null), '—');
  assert.equal(formatRating(4), '4,0');
  assert.equal(formatRating(3.46), '3,5');
});

test('distributionPercent', () => {
  assert.equal(distributionPercent({ 5: 3, 4: 1 }, 5, 4), 75);
  assert.equal(distributionPercent({}, 5, 0), 0);
});

test('Form rỗng không có điểm mặc định và mặc định ẩn danh', () => {
  const f = emptyReviewForm('company');
  for (const [k] of COMPANY_CRITERIA) assert.equal(f[k], 0);
  assert.equal(f.is_anonymous, true);
  assert.ok(validateReviewForm('company', f).some(e => e.startsWith('Chưa chấm điểm')));
});

test('Form công việc hợp lệ', () => {
  const f = { ...emptyReviewForm('job'), experience_type: 'WORKED', content: 'Công việc đúng mô tả, quản lý hỗ trợ tốt, lương đúng hạn.' };
  for (const k of Object.keys(f)) if (k.startsWith('rating_')) f[k] = 4;
  assert.deepEqual(validateReviewForm('job', f), []);
  assert.ok(validateReviewForm('job', { ...f, experience_type: 'APPLIED' }).length > 0);
});
