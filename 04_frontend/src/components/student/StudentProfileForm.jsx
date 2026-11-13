import React, { useEffect, useMemo, useState } from 'react';
import {
  User, GraduationCap, Target, Briefcase, Sparkles, Languages, Plus, Trash2, Save, RotateCcw, Loader2, AlertCircle, RefreshCw, MapPin
} from 'lucide-react';
import { API_BASE } from '../../config/api';
import SkillTagInput from './SkillTagInput';
import AvatarUploader from '../common/AvatarUploader';
import {
  PROVINCES, GENDERS, YEARS_OF_STUDY, WORK_TYPES, JOB_CATEGORIES, LANGUAGES, LANGUAGE_LEVELS, MAJORS
} from '../../constants/profileOptions';

const EMPTY = {
  full_name: '', phone: '', date_of_birth: '', gender: '', province: '', ward: '', detailed_address: '',
  school: '', major: '', year_of_study: '', graduation_year: '', gpa: '', student_code: '',
  bio: '', desired_position: '', interested_category: '', desired_work_type: '', desired_salary: '',
  skills: [], languages: [], experiences: [],
};

// Dữ liệu API → state form (null → chuỗi rỗng để input có kiểm soát)
function fromApi(p = {}) {
  const f = { ...EMPTY };
  for (const k of Object.keys(EMPTY)) {
    if (Array.isArray(EMPTY[k])) f[k] = Array.isArray(p[k]) ? p[k] : [];
    else f[k] = p[k] === null || p[k] === undefined ? '' : String(p[k]);
  }
  f.experiences = f.experiences.map(e => ({
    title: e.title || '', organization: e.organization || '', description: e.description || '',
    start_month: e.start_month || '', end_month: e.end_month || '',
  }));
  return f;
}

// Danh sách phường/xã theo tỉnh (file tĩnh, tải 1 lần khi cần)
let wardsPromise = null;
const loadWards = () => {
  if (!wardsPromise) {
    wardsPromise = fetch('/data/vn-provinces-wards.json')
      .then(r => { if (!r.ok) throw new Error('load failed'); return r.json(); })
      .then(d => Object.fromEntries(d.provinces.map(p => [p.name, p.wards])))
      .catch(err => { wardsPromise = null; throw err; });
  }
  return wardsPromise;
};

// Mục quan trọng để tính % hoàn thiện (khớp với backend)
const COMPLETION = [
  ['full_name', 'Họ và tên'], ['phone', 'Số điện thoại'], ['date_of_birth', 'Ngày sinh'], ['gender', 'Giới tính'],
  ['ward', 'Địa chỉ (Tỉnh/Thành phố, Phường/Xã)'], ['school', 'Trường'], ['major', 'Chuyên ngành'], ['bio', 'Giới thiệu bản thân'],
  ['desired_position', 'Vị trí mong muốn'], ['skills', 'Kỹ năng'], ['experiences', 'Kinh nghiệm hoặc Ngoại ngữ'],
];
const isFilled = (f, k) => (k === 'experiences' ? f.experiences.length > 0 || f.languages.length > 0
  : Array.isArray(f[k]) ? f[k].length > 0 : Boolean(String(f[k]).trim()));

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--color-border, #E2E8F0)',
  fontSize: 13.5, background: '#ffffff', boxSizing: 'border-box', fontFamily: 'inherit', color: 'var(--color-text)'
};

function Section({ icon: Icon, title, hint, children, action }) {
  return (
    <section style={{
      background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)',
      padding: '22px 26px', boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon size={18} color="#7565A8" /> {title}
          </h3>
          {hint && <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, children, full, hint }) {
  return (
    <label style={{ display: 'block', gridColumn: full ? '1 / -1' : undefined }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
      </span>
      {children}
      {hint && <span style={{ display: 'block', fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}>{hint}</span>}
    </label>
  );
}

// Lưới 2 cột đều nhau; màn hình hẹp → 1 cột (CSS .profile-grid trong index.css)
const grid = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 };

const smallBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8,
  border: '1.5px solid #7565A8', background: '#ffffff', color: '#7565A8', fontSize: 12.5, fontWeight: 700, cursor: 'pointer'
};

/**
 * Hồ sơ xin việc của sinh viên (thông tin cá nhân, học vấn, nguyện vọng, kinh nghiệm, kỹ năng, ngoại ngữ).
 * onSaved(profile) được gọi sau khi lưu thành công.
 */
export default function StudentProfileForm({ token, email, showToast, onSaved, avatarUrl, onAvatarChange }) {
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [wardsByProvince, setWardsByProvince] = useState(null);
  const [wardsError, setWardsError] = useState(false);

  useEffect(() => {
    let alive = true;
    loadWards().then(m => alive && setWardsByProvince(m)).catch(() => alive && setWardsError(true));
    return () => { alive = false; };
  }, []);

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch(`${API_BASE}/profile/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Không tải được hồ sơ.');
      const f = fromApi(data.data);
      setForm(f);
      setSaved(f);
    } catch (err) {
      setLoadError(err.message || 'Không tải được hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e && e.target ? e.target.value : e }));
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const missing = COMPLETION.filter(([k]) => !isFilled(form, k));
  const percent = Math.round(((COMPLETION.length - missing.length) / COMPLETION.length) * 100);

  // Cảnh báo khi rời trang mà chưa lưu
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const updateList = (key, idx, patch) => setForm(f => ({ ...f, [key]: f[key].map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  const removeFromList = (key, idx) => setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setErrors([]);
    if (!form.full_name.trim()) { setErrors(['Vui lòng nhập họ và tên.']); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/profile/me/student`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          graduation_year: form.graduation_year || null,
          gpa: form.gpa === '' ? null : form.gpa,
          experiences: form.experiences.filter(e => e.title.trim() || e.organization.trim() || e.description.trim()),
          languages: form.languages.filter(l => l.language),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors(Array.isArray(data.details) ? data.details : [data.message || 'Không lưu được hồ sơ.']);
        throw new Error(data.message || 'Không lưu được hồ sơ.');
      }
      const f = fromApi(data.data);
      setForm(f);
      setSaved(f);
      if (showToast) showToast('Đã lưu hồ sơ.', 'success');
      if (onSaved) onSaved(data.data);
    } catch (err) {
      if (showToast) showToast(err.message || 'Không lưu được hồ sơ.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 10px', display: 'block', color: '#7565A8' }} />
        Đang tải hồ sơ...
      </div>
    );
  }
  if (loadError) {
    return (
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 20, color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={18} /> {loadError}</span>
        <button type="button" onClick={load} style={{ ...smallBtn, borderColor: '#DC2626', color: '#DC2626' }}><RefreshCw size={14} /> Thử lại</button>
      </div>
    );
  }

  const provinceOptions = form.province && !PROVINCES.includes(form.province) ? [form.province, ...PROVINCES] : PROVINCES;
  const wardList = (wardsByProvince && wardsByProvince[form.province]) || [];
  const wardOptions = form.ward && !wardList.includes(form.ward) ? [form.ward, ...wardList] : wardList;
  const currentYear = new Date().getFullYear();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Mức độ hoàn thiện */}
      <div style={{ background: '#FAF8FF', border: '1px solid #E9E3F7', borderRadius: 16, padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Hồ sơ xin việc</h2>
            <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
              Nhà tuyển dụng xem hồ sơ này khi bạn ứng tuyển. Hồ sơ càng đầy đủ, cơ hội được chọn càng cao.
            </p>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: percent >= 80 ? '#047857' : '#7565A8' }}>{percent}%</div>
        </div>
        <div style={{ height: 8, background: '#E9E3F7', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${percent}%`, height: '100%', background: percent >= 80 ? '#10B981' : '#7565A8', transition: 'width 0.3s ease' }} />
        </div>
        {missing.length > 0 && (
          <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 8 }}>
            Còn thiếu: {missing.map(([, label]) => label).join(', ')}
          </div>
        )}
      </div>

      {/* 1. Thông tin cá nhân (kèm ảnh hồ sơ) */}
      <Section icon={User} title="Thông tin cá nhân">
        <div className="profile-personal" style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <div style={{ width: 150, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <AvatarUploader
              token={token}
              avatarUrl={avatarUrl}
              fallbackText={form.full_name?.trim()?.charAt(0) || 'S'}
              size={120}
              showToast={showToast}
              onChange={onAvatarChange}
            />
            <span style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 8, lineHeight: 1.4 }}>
              Ảnh chân dung rõ mặt giúp hồ sơ chuyên nghiệp hơn. Bấm vào ảnh để đổi.
            </span>
          </div>

          <div className="profile-grid" style={{ ...grid, flex: 1, minWidth: 0 }}>
            <Field label="Họ và tên" required full>
              <input style={inputStyle} value={form.full_name} onChange={set('full_name')} maxLength={255} placeholder="Nguyễn Văn A" />
            </Field>
            <Field label="Ngày sinh" required>
              <input type="date" style={inputStyle} value={form.date_of_birth} onChange={set('date_of_birth')}
                max={`${currentYear - 15}-12-31`} min={`${currentYear - 70}-01-01`} />
            </Field>
            <Field label="Giới tính" required>
              <select style={inputStyle} value={form.gender} onChange={set('gender')}>
                <option value="">-- Chọn --</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Số điện thoại" required>
              <input type="tel" style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="0901 234 567" maxLength={15} />
            </Field>
            <Field label="Email" hint="Email đăng nhập, không đổi tại đây.">
              <input style={{ ...inputStyle, background: '#F8FAFC', color: '#64748B' }} value={email || ''} readOnly />
            </Field>
          </div>
        </div>
      </Section>

      {/* 1b. Địa chỉ: Tỉnh/Thành phố → Phường/Xã → Số nhà, đường (đơn vị hành chính từ 01/07/2025) */}
      <Section icon={MapPin} title="Địa chỉ" hint="Theo đơn vị hành chính mới (từ 01/07/2025): Tỉnh/Thành phố → Phường/Xã, không còn cấp Quận/Huyện.">
        <div className="profile-grid" style={grid}>
          <Field label="Tỉnh/Thành phố" required>
            <select style={inputStyle} value={form.province}
              onChange={(e) => setForm(f => ({ ...f, province: e.target.value, ward: '' }))}>
              <option value="">-- Chọn tỉnh/thành phố --</option>
              {provinceOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Phường/Xã" required hint={wardsError ? 'Không tải được danh sách, hãy nhập tay.' : (form.province && wardList.length ? `${wardList.length} phường/xã` : undefined)}>
            {wardsError ? (
              <input style={inputStyle} value={form.ward} onChange={set('ward')} placeholder="VD: Phường Bình Thạnh" maxLength={255} />
            ) : (
              <select style={inputStyle} value={form.ward} onChange={set('ward')} disabled={!form.province || !wardsByProvince}>
                <option value="">{!form.province ? '-- Chọn tỉnh/thành phố trước --' : !wardsByProvince ? 'Đang tải...' : '-- Chọn phường/xã --'}</option>
                {wardOptions.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            )}
          </Field>
          <Field label="Số nhà, tên đường" full hint="Không bắt buộc.">
            <input style={inputStyle} value={form.detailed_address} onChange={set('detailed_address')} placeholder="VD: 69/68 Đặng Thùy Trâm" maxLength={500} />
          </Field>
        </div>
      </Section>

      {/* 2. Học vấn */}
      <Section icon={GraduationCap} title="Học vấn">
        <div className="profile-grid" style={grid}>
          <Field label="Trường" required>
            <input style={inputStyle} value={form.school} onChange={set('school')} placeholder="Trường Đại học Văn Lang" maxLength={255} />
          </Field>
          <Field label="Chuyên ngành" required>
            <input style={inputStyle} value={form.major} onChange={set('major')} list="jobnest-majors" placeholder="VD: Công nghệ Thông tin" maxLength={255} />
            <datalist id="jobnest-majors">{MAJORS.map(m => <option key={m} value={m} />)}</datalist>
          </Field>
          <Field label="Sinh viên năm">
            <select style={inputStyle} value={form.year_of_study} onChange={set('year_of_study')}>
              <option value="">-- Chọn --</option>
              {YEARS_OF_STUDY.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
          <Field label="Năm tốt nghiệp (dự kiến)">
            <input type="number" style={inputStyle} value={form.graduation_year} onChange={set('graduation_year')}
              min={currentYear - 10} max={currentYear + 8} placeholder={String(currentYear + 1)} />
          </Field>
          <Field label="GPA" hint="Thang 4 hoặc thang 10, không bắt buộc.">
            <input type="number" step="0.01" min="0" max="10" style={inputStyle} value={form.gpa} onChange={set('gpa')} placeholder="3.20" />
          </Field>
          <Field label="Mã số sinh viên" hint="Không bắt buộc. Chỉ dùng khi cần xác minh là sinh viên, không hiển thị công khai.">
            <input style={inputStyle} value={form.student_code} onChange={set('student_code')} maxLength={50} />
          </Field>
        </div>
      </Section>

      {/* 3. Giới thiệu & nguyện vọng */}
      <Section icon={Target} title="Giới thiệu & Nguyện vọng">
        <div className="profile-grid" style={grid}>
          <Field label="Giới thiệu bản thân / Mục tiêu nghề nghiệp" required full hint={`${form.bio.length}/3000 ký tự`}>
            <textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} value={form.bio} onChange={set('bio')} maxLength={3000}
              placeholder="Giới thiệu ngắn về bản thân, điểm mạnh và mục tiêu khi đi làm thêm…" />
          </Field>
          <Field label="Vị trí mong muốn" required>
            <input style={inputStyle} value={form.desired_position} onChange={set('desired_position')} placeholder="VD: Nhân viên phục vụ, Lập trình viên Frontend" maxLength={255} />
          </Field>
          <Field label="Ngành nghề quan tâm">
            <select style={inputStyle} value={form.interested_category} onChange={set('interested_category')}>
              <option value="">-- Chọn ngành nghề --</option>
              {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Loại hình công việc">
            <select style={inputStyle} value={form.desired_work_type} onChange={set('desired_work_type')}>
              <option value="">-- Chọn --</option>
              {WORK_TYPES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </Field>
          <Field label="Mức lương mong muốn">
            <input style={inputStyle} value={form.desired_salary} onChange={set('desired_salary')} placeholder="VD: 25.000 – 35.000 đ/giờ hoặc Thỏa thuận" maxLength={100} />
          </Field>
        </div>
      </Section>

      {/* 4. Kinh nghiệm */}
      <Section
        icon={Briefcase}
        title="Kinh nghiệm làm việc & hoạt động"
        hint="Việc làm thêm, thực tập, dự án, câu lạc bộ, tình nguyện… đều được tính."
        action={form.experiences.length < 20 && (
          <button type="button" style={smallBtn}
            onClick={() => setForm(f => ({ ...f, experiences: [...f.experiences, { title: '', organization: '', description: '', start_month: '', end_month: '' }] }))}>
            <Plus size={14} /> Thêm kinh nghiệm
          </button>
        )}
      >
        {form.experiences.length === 0 ? (
          <div style={{ fontSize: 13, color: '#94A3B8', padding: '14px 0', textAlign: 'center', border: '1px dashed #E2E8F0', borderRadius: 10 }}>
            Chưa có kinh nghiệm nào. Bấm "Thêm kinh nghiệm" để bổ sung.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {form.experiences.map((exp, i) => (
              <div key={i} style={{ border: '1px solid #EEF0F4', borderRadius: 12, padding: 16, background: '#FCFCFD' }}>
                <div className="profile-grid" style={grid}>
                  <Field label="Vị trí / Công việc" required>
                    <input style={inputStyle} value={exp.title} onChange={(e) => updateList('experiences', i, { title: e.target.value })} placeholder="VD: Nhân viên phục vụ" maxLength={255} />
                  </Field>
                  <Field label="Nơi làm việc / Tổ chức">
                    <input style={inputStyle} value={exp.organization} onChange={(e) => updateList('experiences', i, { organization: e.target.value })} placeholder="VD: The Coffee House" maxLength={255} />
                  </Field>
                  <Field label="Từ tháng">
                    <input type="month" style={inputStyle} value={exp.start_month} onChange={(e) => updateList('experiences', i, { start_month: e.target.value })} />
                  </Field>
                  <Field label="Đến tháng" hint="Để trống nếu bạn vẫn đang làm.">
                    <input type="month" style={inputStyle} value={exp.end_month} min={exp.start_month || undefined} onChange={(e) => updateList('experiences', i, { end_month: e.target.value })} />
                  </Field>
                  <Field label="Mô tả công việc" full>
                    <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={exp.description} maxLength={2000}
                      onChange={(e) => updateList('experiences', i, { description: e.target.value })} placeholder="Nhiệm vụ chính, kết quả đạt được…" />
                  </Field>
                </div>
                <div style={{ textAlign: 'right', marginTop: 10 }}>
                  <button type="button" onClick={() => removeFromList('experiences', i)}
                    style={{ ...smallBtn, borderColor: '#FECACA', color: '#DC2626' }}>
                    <Trash2 size={13} /> Xóa mục này
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 5. Kỹ năng */}
      <Section icon={Sparkles} title="Kỹ năng" hint="Gợi ý dựa trên chuyên ngành bạn đã nhập ở phần Học vấn.">
        <SkillTagInput value={form.skills} onChange={set('skills')} major={form.major} />
      </Section>

      {/* 6. Ngoại ngữ */}
      <Section
        icon={Languages}
        title="Ngoại ngữ"
        action={form.languages.length < 10 && (
          <button type="button" style={smallBtn} onClick={() => setForm(f => ({ ...f, languages: [...f.languages, { language: '', level: '' }] }))}>
            <Plus size={14} /> Thêm ngoại ngữ
          </button>
        )}
      >
        {form.languages.length === 0 ? (
          <div style={{ fontSize: 13, color: '#94A3B8' }}>Chưa có ngoại ngữ nào.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {form.languages.map((l, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto', gap: 10, alignItems: 'center' }}>
                <input style={inputStyle} value={l.language} list="jobnest-languages" placeholder="Ngôn ngữ" aria-label="Ngôn ngữ"
                  onChange={(e) => updateList('languages', i, { language: e.target.value })} maxLength={60} />
                <select style={inputStyle} aria-label="Trình độ" value={l.level || ''} onChange={(e) => updateList('languages', i, { level: e.target.value })}>
                  <option value="">-- Trình độ --</option>
                  {LANGUAGE_LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
                  {l.level && !LANGUAGE_LEVELS.includes(l.level) && <option value={l.level}>{l.level}</option>}
                </select>
                <button type="button" onClick={() => removeFromList('languages', i)} aria-label="Xóa ngoại ngữ"
                  style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer', padding: 6 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <datalist id="jobnest-languages">{LANGUAGES.map(x => <option key={x} value={x} />)}</datalist>
          </div>
        )}
      </Section>

      {/* Thanh lưu dính đáy màn hình */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 5, marginTop: 4,
        background: dirty ? '#FFF7ED' : '#ffffff', border: `1px solid ${dirty ? '#FED7AA' : 'var(--color-border)'}`,
        borderRadius: 14, padding: '12px 18px', boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: 13, color: errors.length ? '#B91C1C' : '#334155', minWidth: 0 }}>
          {errors.length > 0
            ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={15} /> {errors[0]}{errors.length > 1 ? ` (+${errors.length - 1} lỗi khác)` : ''}</span>
            : dirty ? <strong style={{ color: '#C2410C' }}>Có thay đổi chưa lưu</strong> : 'Hồ sơ đã được lưu'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {dirty && (
            <button type="button" disabled={saving} onClick={() => { setForm(saved); setErrors([]); }}
              style={{ ...smallBtn, borderColor: '#CBD5E1', color: '#475569' }}>
              <RotateCcw size={14} /> Hoàn tác
            </button>
          )}
          <button type="button" onClick={handleSave} disabled={saving || !dirty}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none',
              background: saving || !dirty ? '#C4B5FD' : '#7565A8', color: '#ffffff', fontSize: 13.5, fontWeight: 700,
              cursor: saving || !dirty ? 'not-allowed' : 'pointer'
            }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>
      </div>
    </div>
  );
}
