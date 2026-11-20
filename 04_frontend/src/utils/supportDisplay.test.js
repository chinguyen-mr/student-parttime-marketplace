import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSupportBody } from './supportDisplay.js';

test('tách họ tên, email, nội dung từ thông báo hỗ trợ', () => {
  assert.deepEqual(
    parseSupportBody('Nguyễn Văn A (a@example.com): Không đăng nhập được: báo sai mật khẩu'),
    { name: 'Nguyễn Văn A', email: 'a@example.com', message: 'Không đăng nhập được: báo sai mật khẩu' },
  );
});

test('nội dung nhiều dòng giữ nguyên xuống dòng', () => {
  assert.equal(parseSupportBody('B (b@x.vn): dòng 1\ndòng 2').message, 'dòng 1\ndòng 2');
});

test('định dạng lạ → không đoán email, trả nguyên nội dung', () => {
  assert.deepEqual(parseSupportBody('chuỗi tự do'), { name: '', email: '', message: 'chuỗi tự do' });
  assert.deepEqual(parseSupportBody(null), { name: '', email: '', message: '' });
});
