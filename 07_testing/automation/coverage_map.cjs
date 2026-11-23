// Ma trận phủ: mỗi chức năng (01_docs/10_JOBNEST_Danh_Sach_Chuc_Nang) ↔ test case cũ (theo tiền tố) + mới (trường feat)
const OLD = { REG_STU: ['G06'], REG_EMP: ['G06'], LOGIN_STU: ['G07'], LOGIN_EMP: ['G07'], LOGIN_ADM: ['G07'], LOGOUT_STU: ['C02'], LOGOUT_EMP: ['C02'], LOGOUT_ADM: ['C02'],
  RESET_STU: ['G08', 'H07'], RESET_EMP: ['G08', 'H07'], RBAC_STU: ['H01'], RBAC_EMP: ['H01'], JOB_CREATE: ['E12', 'A13'], JOB_EDIT: ['E13', 'E15'], JOB_SEARCH: ['G02'], JOB_FILTER: ['G02'],
  JOB_DETAIL: ['G03'], APPLY: ['S07'], APPLICANTS: ['E16'], APP_APPROVE: ['E16', 'H03'], APP_REJECT: ['E16', 'H03'], JOB_STATUS: ['E15'], REVIEW_EMP: ['S13'], REVIEW_STU: ['E20'],
  NOTICE_STU: ['S19', 'H03'], NOTICE_EMP: ['E23', 'H03'], PROFILE_STU_VIEW: ['S02'], PROFILE_STU_EDIT: ['S02'], PROFILE_EMP_VIEW: ['E03'], PROFILE_EMP_EDIT: ['E03'],
  MOD_QUEUE: ['A06'], JOB_MODERATE: ['A06'], USER_ADMIN: ['A02'], EMP_VERIFY: ['A05'], COMPLAINT: ['A09'], VIOLATION: ['A07'], REVIEW_MOD: ['A08'], CATEGORY: ['A11'], AUDIT_LOG: ['A12'] };
const fs = require('fs');
const old = fs.readFileSync(require('path').join(__dirname, 'old_testcases.tsv'), 'utf8').split('\n').filter(Boolean).map(l => l.split('\t')[1]);
const cov = {};
const addc = (f, id) => (cov[f] = cov[f] || []).push(id);
for (const id of old) { const k = Object.keys(OLD).find(p => id.startsWith('TC_' + p + '_')); if (k) OLD[k].forEach(f => addc(f, id)); else addc('?', id); }
for (const t of [...require('./new_features.cjs').T, ...require('./new_features_ui.cjs').T]) addc(t.feat, t.id);
module.exports = { cov };
const FEATS = 'G01 G02 G03 G04 G05 G06 G07 G08 G09 G10 G11 G12 C01 C02 C03 C04 C05 C06 C07 S01 S02 S03 S04 S05 S06 S07 S08 S09 S10 S11 S12 S13 S14 S15 S16 S17 S18 S19 S20 E01 E02 E03 E04 E05 E06 E07 E08 E09 E10 E11 E12 E13 E14 E15 E16 E17 E18 E19 E20 E21 E22 E23 E24 A01 A02 A03 A04 A05 A06 A07 A08 A09 A10 A11 A12 A13 A14 A15 A16 H01 H02 H03 H04 H05 H06 H07'.split(' ');
const zero = FEATS.filter(f => !cov[f]);
if (require.main === module) console.log('Chưa có test case nào:', zero.length, zero.join(' '));
if (require.main === module) console.log('Chỉ 1 test case:', FEATS.filter(f => cov[f]?.length === 1).map(f => `${f}(${cov[f][0]})`).join(' '));
if (require.main === module) console.log('Không ánh xạ được:', (cov['?'] || []).length);
