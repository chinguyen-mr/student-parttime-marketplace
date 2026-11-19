// Gộp kết quả các bước của một lượt chạy thành final_results.json (bước sau ghi đè bước trước cho cùng mã test case)
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const ids = JSON.parse(fs.readFileSync(path.join(dir, 'tcs.json'), 'utf8')).map(c => c.id);
const base = JSON.parse(fs.readFileSync(path.join(dir, 'api_results.json'), 'utf8'));
const m = new Map(base.results.map(r => [r.id, { ...r, src: 'run_api/rerun/run_ui' }]));
for (const f of ['verify_results', 'verify_blocked', 'final_checks', 'cv_checks', 'placeholder_checks', 'audit_checks', 'strict_checks']) {
  const p = path.join(dir, f + '.json');
  if (!fs.existsSync(p)) { console.log('Thiếu', f + '.json'); continue; }
  for (const r of JSON.parse(fs.readFileSync(p, 'utf8'))) if (ids.includes(r.id)) m.set(r.id, { ...r, src: f });
}
const results = ids.map(id => m.get(id) || { id, status: 'NOT_RUN', note: '' });
fs.writeFileSync(path.join(dir, 'final_results.json'), JSON.stringify({ ...base, results }, null, 1));
const count = {};
results.forEach(r => { count[r.status] = (count[r.status] || 0) + 1; });
console.log('Tổng', ids.length, count);
results.filter(r => r.status !== 'PASS').forEach(r => console.log(r.status, r.id, '|', r.note));
