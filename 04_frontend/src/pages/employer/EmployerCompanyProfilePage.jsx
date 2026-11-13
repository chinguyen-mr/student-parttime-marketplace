import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ImagePlus, Trash2, Plus, Save, RotateCcw, Loader2, Globe, Eye, ArrowLeft, ArrowRight, MapPin, Check, X, AlertCircle,
} from 'lucide-react';
import { resolveFileUrl } from '../../config/api';
import AvatarUploader from '../../components/common/AvatarUploader';
import { checkImageFile, resizeImageFile } from '../../utils/imageResize';
import LocationPicker from '../../components/employer/LocationPicker';
import CompanyVerificationSection, { LegalStatusBadge } from '../../components/employer/CompanyVerificationSection';
import {
  COMPANY_TYPES, COMPANY_SIZES, INDUSTRIES, SOCIALS, ABOUT_FIELDS, POLICY_FIELDS, POLICY_DETAIL_KEYS, OFFICE_MAX, BRANCHES_MAX,
  apiJson, companyFormFromApi, validateCompanyForm, completionOf, emptyBranch,
  card, input, inputError, labelStyle, hintStyle, errorStyle, grid, btn, btnDanger, btnPrimary, sectionTitle,
} from '../../components/employer/companyProfileShared';

const SECTIONS = [
  ['media', 'Logo, ảnh bìa & thư viện'],
  ['general', 'Thông tin chung'],
  ['about', 'Giới thiệu & văn hóa'],
  ['policies', 'Chính sách nhân sự'],
  ['contact', 'Liên hệ công khai'],
  ['branches', 'Chi nhánh'],
  ['map', 'Vị trí trụ sở'],
  ['verification', 'Xác minh doanh nghiệp'],
];
// Trường thuộc phân vùng nào → dẫn tới đúng phân vùng khi có lỗi
const sectionOfField = (path) => {
  if (path.startsWith('branches.')) return 'branches';
  if (path.startsWith('social_links.') || ['public_email', 'public_phone', 'website'].includes(path)) return 'contact';
  return 'general';
};

function Field({ label, required, hint, error, children }) {
  return (
    <label style={{ display: 'block', minWidth: 0 }}>
      <span style={labelStyle}>{label}{required && <span style={{ color: '#DC2626' }}> *</span>}</span>
      {children}
      {error ? <p style={errorStyle} role="alert">{error}</p> : hint ? <p style={hintStyle}>{hint}</p> : null}
    </label>
  );
}

/**
 * Hồ sơ doanh nghiệp: thông tin công khai trên trang công ty + xác minh pháp lý.
 * Ảnh lưu ngay khi tải lên; các trường chữ lưu chung bằng thanh "Lưu" (cảnh báo khi rời trang chưa lưu).
 */
export default function EmployerCompanyProfilePage({ currentUser, showToast, initialSection = 'media', onDirtyChange, onProfileUpdated }) {
  const token = currentUser?.token;
  const [section, setSection] = useState(initialSection);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(null);
  const [legal, setLegal] = useState({ company_name: '', tax_code: '' });
  const [legalStatus, setLegalStatus] = useState('UNVERIFIED');
  const [media, setMedia] = useState({ logo: null, cover: null, office: [] });
  const [coverDraft, setCoverDraft] = useState(null);
  const [busy, setBusy] = useState('');
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [pinBranch, setPinBranch] = useState(null);
  const coverInput = useRef(null);
  const officeInput = useRef(null);
  const notify = (m, t) => showToast && showToast(m, t);

  useEffect(() => { setSection(initialSection); }, [initialSection]);

  const load = async () => {
    setStatus('loading');
    try {
      const p = await apiJson(token, '/profile/me');
      const f = companyFormFromApi(p);
      setForm(f);
      setSaved(f);
      setLegal({ company_name: p.company_name || '', tax_code: p.tax_code || '' });
      setMedia({
        logo: p.avatar_url || null,
        cover: p.cover_url || null,
        office: Array.isArray(p.office_images) ? p.office_images.filter(u => String(u).startsWith('/api/files/')) : [],
      });
      setStatus('ready');
      return f;
    } catch {
      setStatus('error');
      return null;
    }
  };
  useEffect(() => { if (token) load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = useMemo(() => Boolean(form && saved && JSON.stringify(form) !== JSON.stringify(saved)), [form, saved]);
  const errors = useMemo(() => (form ? validateCompanyForm(form) : {}), [form]);
  const visibleErrors = touched ? errors : {};
  const progress = useMemo(() => (saved ? completionOf(saved, media, legalStatus) : null), [saved, media, legalStatus]);

  // Cảnh báo khi đóng/tải lại tab còn thay đổi chưa lưu; báo cho khung ngoài để chặn chuyển mục menu
  useEffect(() => {
    onDirtyChange && onDirtyChange(dirty);
    if (!dirty) return undefined;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => onDirtyChange && onDirtyChange(false), []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setPolicy = (k) => (e) => setForm(f => (POLICY_DETAIL_KEYS.includes(k)
    ? { ...f, hr_policy_details: { ...f.hr_policy_details, [k]: e.target.value } }
    : { ...f, [k]: e.target.value }));
  const setBranch = (i, patch) => setForm(f => ({ ...f, branches: f.branches.map((b, j) => (j === i ? { ...b, ...patch } : b)) }));

  const save = async () => {
    setTouched(true);
    setServerErrors([]);
    const errs = validateCompanyForm(form);
    const first = Object.keys(errs)[0];
    if (first) {
      setSection(sectionOfField(first));
      notify('Vui lòng sửa các trường được đánh dấu đỏ.', 'error');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, branches: form.branches.filter(b => b.name.trim() || b.address.trim() || b.phone.trim() || b.email.trim()) };
      await apiJson(token, '/profile/me/employer-public', { method: 'PUT', body });
      const fresh = await load();
      setTouched(false);
      notify('Đã lưu hồ sơ doanh nghiệp.', 'success');
      if (fresh && onProfileUpdated) onProfileUpdated({ display_name: fresh.display_name });
    } catch (ex) {
      setServerErrors(ex.details || [ex.message]);
      notify(ex.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Ảnh (lưu ngay, độc lập với nút Lưu) ----------
  const pickCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const err = checkImageFile(file);
    if (err) return notify(err, 'error');
    try { setCoverDraft(await resizeImageFile(file, { maxWidth: 1600, maxHeight: 900 })); } catch (ex) { notify(ex.message, 'error'); }
  };
  const saveCover = async () => {
    setBusy('cover');
    try {
      const d = await apiJson(token, '/files/cover', { method: 'PUT', body: { image: coverDraft } });
      setMedia(m => ({ ...m, cover: d.cover_url }));
      setCoverDraft(null);
      notify('Đã cập nhật ảnh bìa.', 'success');
    } catch (ex) { notify(ex.message, 'error'); } finally { setBusy(''); }
  };
  const removeCover = async () => {
    if (!window.confirm('Xóa ảnh bìa?')) return;
    setBusy('cover');
    try { await apiJson(token, '/files/cover', { method: 'DELETE' }); setMedia(m => ({ ...m, cover: null })); notify('Đã xóa ảnh bìa.', 'success'); }
    catch (ex) { notify(ex.message, 'error'); } finally { setBusy(''); }
  };
  const addOffice = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    setBusy('office');
    try {
      let list = media.office;
      for (const file of files) {
        if (list.length >= OFFICE_MAX) { notify(`Chỉ được tối đa ${OFFICE_MAX} ảnh.`, 'info'); break; }
        const err = checkImageFile(file);
        if (err) { notify(`${file.name}: ${err}`, 'error'); continue; }
        const image = await resizeImageFile(file, { maxWidth: 1280, maxHeight: 1280 });
        list = (await apiJson(token, '/files/office-images', { method: 'POST', body: { image } })).office_images;
        setMedia(m => ({ ...m, office: list }));
      }
    } catch (ex) { notify(ex.message, 'error'); } finally { setBusy(''); }
  };
  const removeOffice = async (url) => {
    if (!window.confirm('Xóa ảnh này khỏi thư viện?')) return;
    setBusy(url);
    try { const d = await apiJson(token, `/files/office-images/${url.split('/').pop()}`, { method: 'DELETE' }); setMedia(m => ({ ...m, office: d.office_images })); }
    catch (ex) { notify(ex.message, 'error'); } finally { setBusy(''); }
  };
  const moveOffice = async (i, dir) => {
    const next = [...media.office];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setBusy('order');
    try { const d = await apiJson(token, '/files/office-images/order', { method: 'PUT', body: { order: next } }); setMedia(m => ({ ...m, office: d.office_images })); }
    catch (ex) { notify(ex.message, 'error'); } finally { setBusy(''); }
  };

  const previewPublic = () => {
    if (dirty && !window.confirm('Trang công khai chỉ hiển thị dữ liệu đã lưu. Vẫn mở xem trước?')) return;
    window.open(`/?employerId=${currentUser.id}`, '_blank', 'noopener');
  };

  if (status === 'loading' && !form) {
    return <div style={{ ...card, color: '#64748B', textAlign: 'center' }} aria-busy="true"><Loader2 size={18} className="animate-spin" /> Đang tải hồ sơ doanh nghiệp…</div>;
  }
  if (status === 'error' && !form) {
    return (
      <div style={{ ...card, textAlign: 'center' }} role="alert">
        <AlertCircle size={28} color="#DC2626" style={{ margin: '0 auto 8px' }} />
        <p style={{ margin: '0 0 12px 0' }}>Không tải được hồ sơ doanh nghiệp.</p>
        <button type="button" style={btn} onClick={load}>Thử lại</button>
      </div>
    );
  }

  const textArea = (key, value, onChange, rows = 4) => (
    <textarea style={{ ...input, minHeight: rows * 22, resize: 'vertical' }} value={value} onChange={onChange} maxLength={key === 'bio' ? 5000 : 3000} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
      {/* Tiêu đề + tiến độ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', paddingBottom: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Hồ sơ doanh nghiệp</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0 0', overflowWrap: 'anywhere' }}>{saved.display_name || 'Doanh nghiệp'}</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: 13.5, color: 'var(--color-text-secondary)' }}>
            Thông tin ứng viên xem trên trang công ty. Mục để trống sẽ được ẩn. Email/SĐT đăng nhập và thông tin người đại diện không bao giờ hiển thị công khai.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <LegalStatusBadge status={legalStatus} />
          <button type="button" style={btn} onClick={previewPublic}><Eye size={14} /> Xem trang công khai</button>
        </div>
      </div>

      {progress && (
        <div style={{ ...card, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>Mức độ hoàn thiện hồ sơ</strong>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#7565A8' }}>{progress.percent}%</span>
          </div>
          <div role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Mức độ hoàn thiện hồ sơ doanh nghiệp"
            style={{ height: 8, borderRadius: 999, background: '#F1EEF8', overflow: 'hidden' }}>
            <div style={{ width: `${progress.percent}%`, height: '100%', background: 'linear-gradient(90deg, #7565A8, #F4B99D)', transition: 'width .3s' }} />
          </div>
          {progress.missing.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              <span style={{ fontSize: 12.5, color: '#64748B', alignSelf: 'center' }}>Còn thiếu:</span>
              {progress.missing.map(m => (
                <button key={m.label} type="button" onClick={() => setSection(m.section)}
                  style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, border: '1px dashed #CBD5E1', background: '#ffffff', color: '#475569', cursor: 'pointer' }}>
                  + {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Điều hướng phân vùng */}
      <div role="tablist" aria-label="Phân vùng hồ sơ doanh nghiệp" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {SECTIONS.map(([id, label]) => {
          const active = section === id;
          const hasError = touched && Object.keys(errors).some(k => sectionOfField(k) === id);
          return (
            <button key={id} type="button" role="tab" aria-selected={active} onClick={() => setSection(id)}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: active ? 700 : 600, cursor: 'pointer', whiteSpace: 'nowrap',
                border: `1.5px solid ${hasError ? '#FCA5A5' : active ? '#7565A8' : '#E2E8F0'}`,
                background: active ? '#F1EEF8' : '#ffffff', color: hasError ? '#B91C1C' : active ? '#594675' : '#475569',
              }}>
              {label}{hasError ? ' •' : ''}
            </button>
          );
        })}
      </div>

      {/* A + B. Logo, ảnh bìa, thư viện */}
      {section === 'media' && (
        <>
          <div style={card}>
            <h3 style={sectionTitle}>Logo & ảnh bìa</h3>
            <p style={{ ...hintStyle, marginTop: 0, marginBottom: 14 }}>Ảnh được lưu ngay khi bạn xác nhận. JPG, PNG hoặc WEBP; logo vuông ≥ 400px, ảnh bìa tỉ lệ 16:6, rộng ≥ 1200px.</p>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ textAlign: 'center' }}>
                <AvatarUploader token={token} avatarUrl={media.logo} fallbackText={(saved.display_name || 'C').charAt(0)} size={96}
                  showToast={showToast} onChange={(url) => setMedia(m => ({ ...m, logo: url }))} />
                <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}>Logo doanh nghiệp</div>
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{
                  aspectRatio: '16 / 6', borderRadius: 12, overflow: 'hidden', border: coverDraft ? '2px solid #F4B99D' : '1px dashed #CBD5E1',
                  background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2EC 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13, textAlign: 'center', padding: coverDraft || media.cover ? 0 : 12,
                }}>
                  {coverDraft || media.cover
                    ? <img src={coverDraft || resolveFileUrl(media.cover)} alt={coverDraft ? 'Xem trước ảnh bìa mới' : 'Ảnh bìa hiện tại'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : 'Chưa có ảnh bìa'}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  {coverDraft ? (
                    <>
                      <span style={{ fontSize: 12.5, color: '#C2410C', fontWeight: 600 }}>Đang xem trước — chưa lưu</span>
                      <button type="button" style={btnPrimary} disabled={busy === 'cover'} onClick={saveCover}>
                        {busy === 'cover' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Lưu ảnh bìa
                      </button>
                      <button type="button" style={btn} onClick={() => setCoverDraft(null)}><X size={14} /> Hủy</button>
                    </>
                  ) : (
                    <>
                      <button type="button" style={btn} disabled={busy === 'cover'} onClick={() => coverInput.current?.click()}>
                        <ImagePlus size={14} /> {media.cover ? 'Đổi ảnh bìa' : 'Chọn ảnh bìa'}
                      </button>
                      {media.cover && <button type="button" style={btnDanger} disabled={busy === 'cover'} onClick={removeCover}><Trash2 size={14} /> Xóa</button>}
                    </>
                  )}
                  <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pickCover} />
                </div>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h3 style={{ ...sectionTitle, margin: 0 }}>Thư viện hình ảnh ({media.office.length}/{OFFICE_MAX})</h3>
              {media.office.length < OFFICE_MAX && (
                <button type="button" style={btn} disabled={busy === 'office'} onClick={() => officeInput.current?.click()}>
                  {busy === 'office' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Thêm ảnh
                </button>
              )}
              <input ref={officeInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={addOffice} />
            </div>
            <p style={{ ...hintStyle, marginTop: 0, marginBottom: 12 }}>Ảnh thật về văn phòng, cửa hàng/địa điểm làm việc, đội ngũ và hoạt động nội bộ. Ảnh đầu tiên hiển thị lớn nhất.</p>
            {media.office.length === 0 ? (
              <div style={{ fontSize: 13, color: '#94A3B8', padding: 16, border: '1px dashed #E2E8F0', borderRadius: 10, textAlign: 'center' }}>Chưa có ảnh.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                {media.office.map((url, i) => (
                  <figure key={url} style={{ margin: 0, position: 'relative', aspectRatio: '4 / 3', borderRadius: 10, overflow: 'hidden', background: '#F1F5F9' }}>
                    <img src={resolveFileUrl(url)} alt={`Ảnh thư viện ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <figcaption style={{ position: 'absolute', inset: 'auto 0 0 0', display: 'flex', justifyContent: 'space-between', padding: 6, background: 'linear-gradient(transparent, rgba(15,23,42,0.6))' }}>
                      <span style={{ display: 'flex', gap: 4 }}>
                        <button type="button" aria-label={`Đưa ảnh ${i + 1} lên trước`} disabled={i === 0 || busy === 'order'} onClick={() => moveOffice(i, -1)} style={thumbBtn(i === 0)}><ArrowLeft size={14} /></button>
                        <button type="button" aria-label={`Đưa ảnh ${i + 1} ra sau`} disabled={i === media.office.length - 1 || busy === 'order'} onClick={() => moveOffice(i, 1)} style={thumbBtn(i === media.office.length - 1)}><ArrowRight size={14} /></button>
                      </span>
                      <button type="button" aria-label={`Xóa ảnh ${i + 1}`} disabled={busy === url} onClick={() => removeOffice(url)} style={thumbBtn(false)}><Trash2 size={14} /></button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* C. Thông tin chung */}
      {section === 'general' && (
        <div style={card}>
          <h3 style={sectionTitle}>Thông tin chung</h3>
          <p style={{ ...hintStyle, marginTop: 0, marginBottom: 14 }}>Hiển thị công khai, trừ tên pháp nhân và mã số thuế (chỉ dùng để xác minh).</p>
          <div style={grid}>
            <Field label="Tên hiển thị" required hint="Tên ứng viên nhìn thấy trên tin tuyển dụng và trang công ty." error={visibleErrors.display_name}>
              <input style={visibleErrors.display_name ? inputError : input} value={form.display_name} onChange={set('display_name')} maxLength={255} aria-invalid={Boolean(visibleErrors.display_name)} />
            </Field>
            <Field label="Tên thương hiệu" hint="Nếu khác tên hiển thị, VD: tên chuỗi cửa hàng.">
              <input style={input} value={form.brand_name} onChange={set('brand_name')} maxLength={255} />
            </Field>
            <Field label="Loại hình doanh nghiệp">
              <select style={input} value={form.company_type} onChange={set('company_type')}>
                <option value="">-- Chọn --</option>
                {form.company_type && !COMPANY_TYPES.includes(form.company_type) && <option value={form.company_type}>{form.company_type}</option>}
                {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Lĩnh vực hoạt động">
              <input style={input} value={form.industry} onChange={set('industry')} list="employer-industries" maxLength={255} />
              <datalist id="employer-industries">{INDUSTRIES.map(i => <option key={i} value={i} />)}</datalist>
            </Field>
            <Field label="Quy mô nhân sự">
              <select style={input} value={form.company_size} onChange={set('company_size')}>
                <option value="">-- Chọn --</option>
                {form.company_size && !COMPANY_SIZES.includes(form.company_size) && <option value={form.company_size}>{form.company_size}</option>}
                {COMPANY_SIZES.map(sz => <option key={sz} value={sz}>{sz}</option>)}
              </select>
            </Field>
            <Field label="Năm thành lập" error={visibleErrors.founded_year}>
              <input style={visibleErrors.founded_year ? inputError : input} inputMode="numeric" value={form.founded_year} onChange={set('founded_year')} maxLength={4} placeholder="VD: 2018" />
            </Field>
            <Field label="Tỉnh / Thành phố">
              <input style={input} value={form.province} onChange={set('province')} maxLength={255} placeholder="VD: TP. Hồ Chí Minh" />
            </Field>
            <Field label="Địa chỉ trụ sở" hint="Hiển thị đầy đủ với doanh nghiệp; hộ kinh doanh/cá nhân chỉ hiển thị khu vực.">
              <input style={input} value={form.detailed_address} onChange={set('detailed_address')} maxLength={500} placeholder="Số nhà, đường, phường/xã" />
            </Field>
          </div>
          <div style={{ ...grid, marginTop: 16, paddingTop: 16, borderTop: '1px dashed #E2E8F0' }}>
            <Field label="Tên pháp nhân" hint="Chỉ dùng để xác minh. Sửa trong mục Xác minh doanh nghiệp.">
              <input style={{ ...input, background: '#F8FAFC', color: '#64748B' }} value={legal.company_name || 'Chưa khai báo'} readOnly aria-readonly="true" />
            </Field>
            <Field label="Mã số thuế" hint="Không công khai. Sửa trong mục Xác minh doanh nghiệp.">
              <input style={{ ...input, background: '#F8FAFC', color: '#64748B' }} value={legal.tax_code || 'Chưa khai báo'} readOnly aria-readonly="true" />
            </Field>
          </div>
          <button type="button" style={{ ...btn, marginTop: 12 }} onClick={() => setSection('verification')}>Đi tới Xác minh doanh nghiệp</button>
        </div>
      )}

      {/* D. Giới thiệu & văn hóa */}
      {section === 'about' && (
        <div style={card}>
          <h3 style={sectionTitle}>Giới thiệu & văn hóa</h3>
          <p style={{ ...hintStyle, marginTop: 0, marginBottom: 14 }}>Viết ngắn gọn, cụ thể. Mục để trống sẽ không hiển thị.</p>
          <div style={{ ...grid, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {ABOUT_FIELDS.map(([key, label, hint]) => (
              <Field key={key} label={label} hint={hint}>{textArea(key, form[key], set(key), key === 'bio' ? 6 : 4)}</Field>
            ))}
          </div>
        </div>
      )}

      {/* E. Chính sách nhân sự */}
      {section === 'policies' && (
        <div style={card}>
          <h3 style={sectionTitle}>Chính sách nhân sự</h3>
          <p style={{ ...hintStyle, marginTop: 0, marginBottom: 14 }}>Ưu tiên thông tin sinh viên quan tâm. Chỉ điền chính sách doanh nghiệp thực sự áp dụng — mục trống sẽ được ẩn.</p>
          <div style={{ ...grid, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {POLICY_FIELDS.map(([key, label, hint]) => (
              <Field key={key} label={label} hint={hint}>
                {textArea(key, POLICY_DETAIL_KEYS.includes(key) ? form.hr_policy_details[key] : form[key], setPolicy(key), 3)}
              </Field>
            ))}
          </div>
        </div>
      )}

      {/* F. Liên hệ công khai */}
      {section === 'contact' && (
        <div style={card}>
          <h3 style={sectionTitle}>Liên hệ công khai</h3>
          <p style={{ ...hintStyle, marginTop: 0, marginBottom: 14 }}>
            Chỉ hiển thị khi bạn nhập. Dùng kênh tuyển dụng chung — email và số điện thoại đăng nhập của người đại diện <strong>không</strong> được dùng thay.
          </p>
          <div style={grid}>
            <Field label="Email tuyển dụng" error={visibleErrors.public_email}>
              <input type="email" style={visibleErrors.public_email ? inputError : input} value={form.public_email} onChange={set('public_email')} placeholder="tuyendung@congty.vn" maxLength={255} />
            </Field>
            <Field label="Số điện thoại tuyển dụng" error={visibleErrors.public_phone}>
              <input type="tel" style={visibleErrors.public_phone ? inputError : input} value={form.public_phone} onChange={set('public_phone')} placeholder="028 3838 8888" maxLength={20} />
            </Field>
            <Field label="Website" error={visibleErrors.website}>
              <input type="url" style={visibleErrors.website ? inputError : input} value={form.website} onChange={set('website')} placeholder="https://congty.vn" maxLength={500} />
            </Field>
            {SOCIALS.map(({ key, label }) => (
              <Field key={key} label={<><Globe size={13} style={{ verticalAlign: -2 }} /> {label}</>} error={visibleErrors[`social_links.${key}`]}>
                <input type="url" style={visibleErrors[`social_links.${key}`] ? inputError : input} value={form.social_links[key]} placeholder="https://" maxLength={255}
                  onChange={(e) => setForm(f => ({ ...f, social_links: { ...f.social_links, [key]: e.target.value } }))} />
              </Field>
            ))}
          </div>
        </div>
      )}

      {/* G. Chi nhánh */}
      {section === 'branches' && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h3 style={{ ...sectionTitle, margin: 0 }}>Chi nhánh ({form.branches.length}/{BRANCHES_MAX})</h3>
            {form.branches.length < BRANCHES_MAX && (
              <button type="button" style={btn} onClick={() => setForm(f => ({ ...f, branches: [...f.branches, emptyBranch()] }))}><Plus size={14} /> Thêm chi nhánh</button>
            )}
          </div>
          <p style={{ ...hintStyle, marginTop: 0, marginBottom: 12 }}>Chi nhánh "Tạm ngừng" được giữ lại nhưng không hiển thị công khai.</p>
          {form.branches.length === 0 && <div style={{ fontSize: 13, color: '#94A3B8', padding: 16, border: '1px dashed #E2E8F0', borderRadius: 10, textAlign: 'center' }}>Chưa có chi nhánh.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {form.branches.map((b, i) => {
              const err = (k) => visibleErrors[`branches.${i}.${k}`];
              return (
                <fieldset key={i} style={{ border: `1px solid ${b.is_active ? '#E2E8F0' : '#FED7AA'}`, borderRadius: 12, padding: 14, margin: 0, background: b.is_active ? '#ffffff' : '#FFFBF5' }}>
                  <legend style={{ fontSize: 13, fontWeight: 700, padding: '0 6px' }}>{b.name.trim() || `Chi nhánh ${i + 1}`}</legend>
                  <div style={grid}>
                    <Field label="Tên chi nhánh"><input style={input} value={b.name} maxLength={120} onChange={(e) => setBranch(i, { name: e.target.value })} placeholder="VD: CN Thủ Đức" /></Field>
                    <Field label="Địa chỉ" required error={err('address')}>
                      <input style={err('address') ? inputError : input} value={b.address} maxLength={255} onChange={(e) => setBranch(i, { address: e.target.value })} />
                    </Field>
                    <Field label="Số điện thoại" error={err('phone')}><input type="tel" style={err('phone') ? inputError : input} value={b.phone} maxLength={20} onChange={(e) => setBranch(i, { phone: e.target.value })} /></Field>
                    <Field label="Email (nếu có)" error={err('email')}><input type="email" style={err('email') ? inputError : input} value={b.email} maxLength={255} onChange={(e) => setBranch(i, { email: e.target.value })} /></Field>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={b.is_active} onChange={(e) => setBranch(i, { is_active: e.target.checked })} /> Đang hoạt động
                    </label>
                    <button type="button" style={btn} onClick={() => setPinBranch(pinBranch === i ? null : i)}>
                      <MapPin size={14} /> {b.latitude ? 'Sửa vị trí' : 'Ghim vị trí'}{b.latitude ? ' ✓' : ''}
                    </button>
                    <button type="button" style={{ ...btnDanger, marginLeft: 'auto' }} onClick={() => {
                      if (!window.confirm(`Xóa ${b.name.trim() || `chi nhánh ${i + 1}`}? Thay đổi có hiệu lực khi bấm Lưu.`)) return;
                      setPinBranch(null);
                      setForm(f => ({ ...f, branches: f.branches.filter((_, j) => j !== i) }));
                    }}><Trash2 size={14} /> Xóa</button>
                  </div>
                  {pinBranch === i && (
                    <div style={{ marginTop: 12 }}>
                      <LocationPicker latitude={b.latitude} longitude={b.longitude} address={b.address}
                        onChange={(lat, lng) => setBranch(i, { latitude: lat === null ? '' : String(Math.round(lat * 1e6) / 1e6), longitude: lng === null ? '' : String(Math.round(lng * 1e6) / 1e6) })} />
                    </div>
                  )}
                </fieldset>
              );
            })}
          </div>
        </div>
      )}

      {/* H. Vị trí trụ sở */}
      {section === 'map' && (
        <div style={card}>
          <h3 style={sectionTitle}>Vị trí trụ sở trên bản đồ</h3>
          <p style={{ ...hintStyle, marginTop: 0, marginBottom: 12 }}>
            Bản đồ tự đưa tới địa chỉ trụ sở nhưng <strong>không tự ghim</strong>. Bấm đúng vị trí tòa nhà/cổng để ghim, rồi bấm Lưu để xác nhận.
            {form.detailed_address && <><br />Địa chỉ trụ sở: <strong>{form.detailed_address}</strong></>}
          </p>
          <LocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            address={[form.detailed_address, form.province].filter(Boolean).join(', ')}
            onChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat === null ? '' : String(Math.round(lat * 1e6) / 1e6), longitude: lng === null ? '' : String(Math.round(lng * 1e6) / 1e6) }))}
          />
        </div>
      )}

      {/* I. Xác minh doanh nghiệp (lưu riêng) */}
      <div hidden={section !== 'verification'}>
        <CompanyVerificationSection token={token} showToast={showToast}
          onChange={(d) => {
            setLegalStatus(d.status);
            setLegal({ company_name: d.company_name || '', tax_code: d.tax_code || '' });
            if (onProfileUpdated) onProfileUpdated({ verification_status: d.status });
          }} />
      </div>

      {/* Thanh lưu: chỉ cho các phân vùng chữ */}
      {!['media', 'verification'].includes(section) && (
        <div style={{
          position: 'sticky', bottom: 0, zIndex: 5, background: dirty ? '#FFF7ED' : '#ffffff', border: `1px solid ${dirty ? '#FED7AA' : 'var(--color-border)'}`,
          borderRadius: 14, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          boxShadow: '0 -4px 16px rgba(15,23,42,0.06)',
        }}>
          <span style={{ fontSize: 13, color: serverErrors.length ? '#B91C1C' : '#334155' }} role={serverErrors.length ? 'alert' : undefined}>
            {serverErrors.length ? serverErrors[0] : dirty ? <strong style={{ color: '#C2410C' }}>Có thay đổi chưa lưu (áp dụng cho tất cả phân vùng)</strong> : 'Mọi thay đổi đã được lưu.'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {dirty && <button type="button" style={{ ...btn, borderColor: '#CBD5E1', color: '#475569' }} onClick={() => { setForm(saved); setTouched(false); setServerErrors([]); }}><RotateCcw size={14} /> Hoàn tác</button>}
            <button type="button" onClick={save} disabled={!dirty || saving}
              style={{ ...btnPrimary, background: !dirty || saving ? '#C4B5FD' : '#7565A8', cursor: !dirty || saving ? 'not-allowed' : 'pointer' }}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Lưu hồ sơ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const thumbBtn = (disabled) => ({
  width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(15,23,42,0.65)', color: '#fff',
  cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
});
