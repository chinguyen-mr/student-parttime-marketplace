import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Trash2, Plus, Save, RotateCcw, Loader2, Globe, Eye } from 'lucide-react';
import { API_BASE, resolveFileUrl } from '../../config/api';
import AvatarUploader from '../common/AvatarUploader';
import { checkImageFile, resizeImageFile } from '../../utils/imageResize';
import LocationPicker from './LocationPicker';

const COMPANY_SIZES = ['Dưới 10 nhân viên', '10 – 49 nhân viên', '50 – 199 nhân viên', '200 – 499 nhân viên', '500 – 999 nhân viên', 'Trên 1.000 nhân viên'];
const INDUSTRIES = ['Công nghệ thông tin', 'Giáo dục & Đào tạo', 'Nhà hàng – Khách sạn – F&B', 'Bán lẻ & Thương mại', 'Marketing & Truyền thông', 'Logistics & Vận tải', 'Tài chính – Ngân hàng', 'Sản xuất', 'Dịch vụ'];
const SOCIALS = [
  { key: 'facebook', label: 'Facebook' }, { key: 'linkedin', label: 'LinkedIn' },
  { key: 'tiktok', label: 'TikTok' }, { key: 'youtube', label: 'YouTube' }, { key: 'instagram', label: 'Instagram' },
];
const TEXT_FIELDS = [
  ['mission', 'Sứ mệnh & tầm nhìn'],
  ['core_values', 'Giá trị cốt lõi'],
  ['products_services', 'Sản phẩm & dịch vụ'],
  ['achievements', 'Thành tựu nổi bật'],
  ['work_environment_desc', 'Môi trường làm việc & hoạt động nội bộ'],
  ['benefits', 'Phúc lợi'],
  ['hr_policies', 'Chính sách nhân sự'],
];
const OFFICE_MAX = 8;

const EMPTY = {
  brand_name: '', founded_year: '', industry: '', company_size: '', public_email: '', public_phone: '',
  mission: '', core_values: '', products_services: '', achievements: '', work_environment_desc: '', benefits: '', hr_policies: '',
  latitude: '', longitude: '',
  branches: [], social_links: {},
};

const fromApi = (p = {}) => {
  const f = { ...EMPTY };
  for (const k of Object.keys(EMPTY)) {
    if (k === 'branches') f.branches = Array.isArray(p.branches) ? p.branches : [];
    else if (k === 'social_links') f.social_links = p.social_links && typeof p.social_links === 'object' ? p.social_links : {};
    else f[k] = p[k] === null || p[k] === undefined ? '' : String(p[k]);
  }
  return f;
};

const input = {
  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--color-border, #E2E8F0)',
  fontSize: 13.5, background: '#ffffff', boxSizing: 'border-box', fontFamily: 'inherit', color: 'var(--color-text)'
};
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 };
const card = { background: '#ffffff', borderRadius: 14, border: '1px solid var(--color-border)', padding: '22px 24px' };
const smallBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8,
  border: '1.5px solid #7565A8', background: '#ffffff', color: '#7565A8', fontSize: 12.5, fontWeight: 700, cursor: 'pointer'
};

/**
 * Thông tin hiển thị trên trang công ty công khai: logo, ảnh bìa, ảnh văn phòng và các mục giới thiệu.
 * Tên, giới thiệu ngắn, website, địa chỉ, thông tin pháp lý vẫn sửa ở form "Hồ sơ & Thông tin Pháp lý" phía trên.
 */
export default function EmployerPublicInfoForm({ currentUser, showToast, onViewPublic }) {
  const token = currentUser?.token;
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(EMPTY);
  const [media, setMedia] = useState({ logo: null, cover: null, office: [] });
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyMedia, setBusyMedia] = useState('');
  const [errors, setErrors] = useState([]);
  const coverInput = useRef(null);
  const officeInput = useRef(null);
  const notify = (m, t) => showToast && showToast(m, t);

  useEffect(() => {
    if (!token) return undefined;
    let alive = true;
    fetch(`${API_BASE}/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (!alive || !d?.success) return;
        const f = fromApi(d.data);
        setForm(f);
        setSaved(f);
        setAddress(d.data.detailed_address || d.data.location || '');
        setMedia({
          logo: d.data.avatar_url || null,
          cover: d.data.cover_url || null,
          office: Array.isArray(d.data.office_images) ? d.data.office_images.filter(u => String(u).startsWith('/api/files/')) : [],
        });
      })
      .catch(() => notify('Không tải được hồ sơ công ty.', 'error'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const callFiles = async (path, method, body) => {
    const res = await fetch(`${API_BASE}/files/${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Không thực hiện được.');
    return data.data;
  };

  const uploadCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const err = checkImageFile(file);
    if (err) return notify(err, 'error');
    setBusyMedia('cover');
    try {
      const image = await resizeImageFile(file, { maxWidth: 1600, maxHeight: 900 });
      const d = await callFiles('cover', 'PUT', { image });
      setMedia(m => ({ ...m, cover: d.cover_url }));
      notify('Đã cập nhật ảnh bìa.', 'success');
    } catch (ex) { notify(ex.message, 'error'); } finally { setBusyMedia(''); }
  };

  const removeCover = async () => {
    if (!window.confirm('Xóa ảnh bìa?')) return;
    setBusyMedia('cover');
    try { await callFiles('cover', 'DELETE'); setMedia(m => ({ ...m, cover: null })); notify('Đã xóa ảnh bìa.', 'success'); }
    catch (ex) { notify(ex.message, 'error'); } finally { setBusyMedia(''); }
  };

  const addOffice = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    setBusyMedia('office');
    try {
      let list = media.office;
      for (const file of files.slice(0, OFFICE_MAX - list.length)) {
        const err = checkImageFile(file);
        if (err) { notify(`${file.name}: ${err}`, 'error'); continue; }
        const image = await resizeImageFile(file, { maxWidth: 1280, maxHeight: 1280 });
        list = (await callFiles('office-images', 'POST', { image })).office_images;
        setMedia(m => ({ ...m, office: list }));
      }
      if (files.length > OFFICE_MAX - media.office.length) notify(`Chỉ thêm được tối đa ${OFFICE_MAX} ảnh.`, 'info');
    } catch (ex) { notify(ex.message, 'error'); } finally { setBusyMedia(''); }
  };

  const removeOffice = async (url) => {
    const id = url.split('/').pop();
    setBusyMedia(`office-${id}`);
    try { const d = await callFiles(`office-images/${id}`, 'DELETE'); setMedia(m => ({ ...m, office: d.office_images })); }
    catch (ex) { notify(ex.message, 'error'); } finally { setBusyMedia(''); }
  };

  const save = async () => {
    setErrors([]);
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/profile/me/employer-public`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, branches: form.branches.filter(b => b.trim()) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors(Array.isArray(data.details) ? data.details : [data.message || 'Không lưu được.']);
        throw new Error(data.message || 'Không lưu được.');
      }
      const f = fromApi(data.data);
      setForm(f);
      setSaved(f);
      notify('Đã lưu thông tin trang công ty.', 'success');
    } catch (ex) { notify(ex.message, 'error'); } finally { setSaving(false); }
  };

  if (loading) {
    return <div style={{ ...card, marginTop: 24, color: 'var(--color-text-secondary)', textAlign: 'center' }}><Loader2 size={20} className="animate-spin" /> Đang tải…</div>;
  }

  return (
    <section style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18 }} aria-labelledby="public-info-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 id="public-info-title" style={{ fontSize: 19, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Thông tin hiển thị trên trang công ty</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            Ứng viên xem các thông tin này trên trang công ty công khai. Mục để trống sẽ được ẩn. Mã số thuế, giấy phép và email/SĐT đăng nhập không bao giờ hiển thị công khai.
          </p>
        </div>
        {onViewPublic && (
          <button type="button" onClick={onViewPublic} style={smallBtn}><Eye size={14} /> Xem trang công khai</button>
        )}
      </div>

      {/* Hình ảnh */}
      <div style={card}>
        <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: '0 0 14px 0' }}>Logo & ảnh bìa</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ textAlign: 'center' }}>
            <AvatarUploader token={token} avatarUrl={media.logo} fallbackText={(currentUser?.full_name || 'C').charAt(0)} size={96}
              showToast={showToast} onChange={(url) => setMedia(m => ({ ...m, logo: url }))} />
            <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}>Logo (ảnh vuông)</div>
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{
              height: 150, borderRadius: 12, overflow: 'hidden', border: '1px dashed #CBD5E1',
              background: media.cover ? '#F1F5F9' : 'linear-gradient(135deg, #F5F3FF 0%, #FDF2EC 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13
            }}>
              {media.cover ? <img src={resolveFileUrl(media.cover)} alt="Ảnh bìa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'Chưa có ảnh bìa (khuyến nghị tỉ lệ 16:6, tối thiểu 1200px)'}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" style={smallBtn} disabled={busyMedia === 'cover'} onClick={() => coverInput.current?.click()}>
                {busyMedia === 'cover' ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} {media.cover ? 'Đổi ảnh bìa' : 'Tải ảnh bìa'}
              </button>
              {media.cover && <button type="button" style={{ ...smallBtn, borderColor: '#FECACA', color: '#DC2626' }} disabled={busyMedia === 'cover'} onClick={removeCover}><Trash2 size={14} /> Xóa</button>}
              <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadCover} />
            </div>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: 0 }}>Ảnh văn phòng & hoạt động ({media.office.length}/{OFFICE_MAX})</h3>
          {media.office.length < OFFICE_MAX && (
            <button type="button" style={smallBtn} disabled={busyMedia === 'office'} onClick={() => officeInput.current?.click()}>
              {busyMedia === 'office' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Thêm ảnh
            </button>
          )}
          <input ref={officeInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={addOffice} />
        </div>
        {media.office.length === 0 ? (
          <div style={{ fontSize: 13, color: '#94A3B8', padding: 16, border: '1px dashed #E2E8F0', borderRadius: 10, textAlign: 'center' }}>
            Chưa có ảnh. Ảnh thật về văn phòng, đội ngũ và hoạt động giúp ứng viên tin tưởng hơn.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {media.office.map(url => (
              <div key={url} style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 10, overflow: 'hidden', background: '#F1F5F9' }}>
                <img src={resolveFileUrl(url)} alt="Ảnh văn phòng" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" aria-label="Xóa ảnh" onClick={() => removeOffice(url)} disabled={busyMedia === `office-${url.split('/').pop()}`}
                  style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(15,23,42,0.65)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Thông tin chung */}
      <div style={card}>
        <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: '0 0 14px 0' }}>Thông tin chung</h3>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
          <label><span style={labelStyle}>Tên thương hiệu</span><input style={input} value={form.brand_name} onChange={set('brand_name')} maxLength={255} placeholder="VD: JobNest" /></label>
          <label><span style={labelStyle}>Năm thành lập</span><input type="number" style={input} value={form.founded_year} onChange={set('founded_year')} min={1800} max={new Date().getFullYear()} placeholder="VD: 2018" /></label>
          <label><span style={labelStyle}>Lĩnh vực hoạt động</span>
            <input style={input} value={form.industry} onChange={set('industry')} list="employer-industries" maxLength={255} />
            <datalist id="employer-industries">{INDUSTRIES.map(i => <option key={i} value={i} />)}</datalist>
          </label>
          <label><span style={labelStyle}>Quy mô nhân sự</span>
            <select style={input} value={form.company_size} onChange={set('company_size')}>
              <option value="">-- Chọn --</option>
              {form.company_size && !COMPANY_SIZES.includes(form.company_size) && <option value={form.company_size}>{form.company_size}</option>}
              {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: '0 0 14px 0' }}>Giới thiệu & văn hóa</h3>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
          {TEXT_FIELDS.map(([key, lbl]) => (
            <label key={key}>
              <span style={labelStyle}>{lbl}</span>
              <textarea style={{ ...input, minHeight: 90, resize: 'vertical' }} value={form[key]} onChange={set(key)} maxLength={3000} />
            </label>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: '0 0 6px 0' }}>Liên hệ công khai</h3>
        <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 14px 0' }}>Chỉ hiển thị khi bạn nhập. Nên dùng email/SĐT tuyển dụng chung, không dùng số cá nhân.</p>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
          <label><span style={labelStyle}>Email tuyển dụng</span><input type="email" style={input} value={form.public_email} onChange={set('public_email')} placeholder="tuyendung@congty.vn" /></label>
          <label><span style={labelStyle}>Số điện thoại tuyển dụng</span><input type="tel" style={input} value={form.public_phone} onChange={set('public_phone')} placeholder="028 3838 8888" /></label>
          {SOCIALS.map(s => (
            <label key={s.key}>
              <span style={labelStyle}><Globe size={13} style={{ verticalAlign: -2 }} /> {s.label}</span>
              <input type="url" style={input} value={form.social_links[s.key] || ''} placeholder="https://"
                onChange={(e) => setForm(f => ({ ...f, social_links: { ...f.social_links, [s.key]: e.target.value } }))} />
            </label>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={labelStyle}>Chi nhánh</span>
            {form.branches.length < 20 && (
              <button type="button" style={smallBtn} onClick={() => setForm(f => ({ ...f, branches: [...f.branches, ''] }))}><Plus size={14} /> Thêm chi nhánh</button>
            )}
          </div>
          {form.branches.length === 0 && <div style={{ fontSize: 13, color: '#94A3B8' }}>Chưa có chi nhánh.</div>}
          {form.branches.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input style={input} value={b} maxLength={255} aria-label={`Chi nhánh ${i + 1}`} placeholder="VD: Chi nhánh Hà Nội – 12 Láng Hạ, Đống Đa"
                onChange={(e) => setForm(f => ({ ...f, branches: f.branches.map((x, j) => (j === i ? e.target.value : x)) }))} />
              <button type="button" aria-label="Xóa chi nhánh" onClick={() => setForm(f => ({ ...f, branches: f.branches.filter((_, j) => j !== i) }))}
                style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer', padding: 6 }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: '0 0 6px 0' }}>Vị trí trụ sở trên bản đồ</h3>
        <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 12px 0' }}>
          Bản đồ trên trang công ty dùng vị trí bạn ghim. Nếu chưa ghim, bản đồ chỉ ước lượng theo địa chỉ và có thể lệch (đặc biệt với số nhà trong hẻm hoặc địa chỉ theo đơn vị hành chính cũ).
          {address && <><br />Địa chỉ đã khai báo: <strong>{address}</strong></>}
        </p>
        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          address={address}
          onChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat === null ? '' : String(Math.round(lat * 1e6) / 1e6), longitude: lng === null ? '' : String(Math.round(lng * 1e6) / 1e6) }))}
        />
      </div>

      {/* Thanh lưu */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 5, background: dirty ? '#FFF7ED' : '#ffffff', border: `1px solid ${dirty ? '#FED7AA' : 'var(--color-border)'}`,
        borderRadius: 14, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 -4px 16px rgba(15,23,42,0.06)'
      }}>
        <span style={{ fontSize: 13, color: errors.length ? '#B91C1C' : '#334155' }}>
          {errors.length ? errors[0] : dirty ? <strong style={{ color: '#C2410C' }}>Có thay đổi chưa lưu</strong> : 'Ảnh được lưu ngay khi tải lên. Các mục chữ cần bấm Lưu.'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {dirty && <button type="button" style={{ ...smallBtn, borderColor: '#CBD5E1', color: '#475569' }} onClick={() => { setForm(saved); setErrors([]); }}><RotateCcw size={14} /> Hoàn tác</button>}
          <button type="button" onClick={save} disabled={!dirty || saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: !dirty || saving ? '#C4B5FD' : '#7565A8', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: !dirty || saving ? 'not-allowed' : 'pointer' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Lưu thông tin
          </button>
        </div>
      </div>
    </section>
  );
}
