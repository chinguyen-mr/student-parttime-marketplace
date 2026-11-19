// Tiện ích chung cho bộ kiểm thử tự động JobNest (chạy trên Docker local)
const { spawnSync } = require('child_process');
const crypto = require('crypto');

const API = process.env.API_URL || 'http://localhost:5000/api';
const R = Date.now().toString(36);              // mã lần chạy, gắn vào email/tiêu đề để dọn dẹp
const results = [];

async function api(method, path, token, body, extraHeaders = {}) {
  const t0 = Date.now();
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...extraHeaders },
    body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)),
  });
  const text = await res.text();
  let j = null; try { j = JSON.parse(text); } catch { j = { raw: text.slice(0, 300) }; }
  return { s: res.status, j, ms: Date.now() - t0, text };
}

// Truy vấn DB qua psql trong container (trả mảng dòng, mỗi dòng là mảng cột)
function sql(q) {
  const r = spawnSync('docker', ['exec', '-i', 'jobnest-postgres', 'psql', '-U', 'postgres', '-d', 'cd2_marketplace_db', '-At', '-F', '\t', '-v', 'ON_ERROR_STOP=1'], { input: q, encoding: 'utf8' });
  if (r.status !== 0) throw new Error('SQL lỗi: ' + (r.stderr || '').slice(0, 300));
  return r.stdout.trim() ? r.stdout.trim().split('\n').map(l => l.split('\t')) : [];
}
const one = (q) => (sql(q)[0] || [])[0];

async function tc(id, fn) {
  try {
    const out = await fn();
    const [status, note] = Array.isArray(out) ? out : [out ? 'PASS' : 'FAIL', ''];
    results.push({ id, status, note });
  } catch (e) {
    results.push({ id, status: 'FAIL', note: 'Ngoại lệ: ' + e.message.slice(0, 200) });
  }
  const r = results[results.length - 1];
  console.log(`${r.status === 'PASS' ? '✔' : r.status === 'FAIL' ? '✖' : '–'} ${id} ${r.note ? '— ' + r.note : ''}`);
}
const pass = (note = '') => ['PASS', note];
const fail = (note) => ['FAIL', note];
const blocked = (note) => ['BLOCKED', note];
const check = (cond, okNote, badNote) => (cond ? pass(okNote) : fail(badNote));

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const futureDate = (days = 20) => new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);

async function login(email, password) {
  const r = await api('POST', '/auth/login', null, { email, password });
  if (!r.j?.data?.token) throw new Error('Không đăng nhập được ' + email + ': ' + r.s + ' ' + (r.j?.message || ''));
  return { token: r.j.data.token, id: r.j.data.user.id, email };
}

module.exports = { api, sql, one, tc, pass, fail, blocked, check, results, R, sha256, futureDate, login };
