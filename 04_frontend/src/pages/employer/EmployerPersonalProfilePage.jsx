import React, { useEffect, useRef, useState } from 'react';
import { User, Mail, Phone, ShieldCheck, Save, Camera, Trash2, Settings, Loader2, Lock, CircleDashed, AlertCircle, Building2, MonitorSmartphone } from 'lucide-react';
import { checkImageFile, resizeImageFile } from '../../utils/imageResize';
import {
  apiJson, fetchPrivateBlobUrl, card, input, inputError, labelStyle, hintStyle, errorStyle, grid, btn, btnDanger, btnPrimary, sectionTitle,
} from '../../components/employer/companyProfileShared';

function ReadOnlyField({ icon: Icon, label, value, verified }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <span style={labelStyle}>{label} <span style={{ fontWeight: 500, color: '#94A3B8' }}>(chỉ đọc)</span></span>
        <span style={{ fontSize: 12, fontWeight: 700, color: verified ? '#047857' : '#B45309', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {verified ? <><ShieldCheck size={13} /> Đã xác minh</> : <><CircleDashed size={13} /> Chưa xác minh</>}
        </span>
      </div>
      <div style={{ position: 'relative' }}>
        <input value={value || 'Chưa có'} readOnly aria-readonly="true" aria-label={label}
          style={{ ...input, padding: '10px 12px 10px 36px', background: '#F8FAFC', color: '#64748B', cursor: 'default' }} />
        <Icon size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 12 }} />
      </div>
    </div>
  );
}

/**
 * Thông tin người đại diện (người quản lý tài khoản nhà tuyển dụng).
 * Không hiển thị công khai. Thông tin doanh nghiệp nằm ở mục "Hồ sơ doanh nghiệp".
 */
export default function EmployerPersonalProfilePage({ currentUser, showToast, onNavigateSettings, onNavigateCompany }) {
  const token = currentUser?.token;
  const [state, setState] = useState('loading'); // loading | ready | error
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ representative_name: '', representative_title: '' });
  const [saved, setSaved] = useState(form);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState({ url: null, busy: false });
  const fileRef = useRef(null);
  const notify = (m, t) => showToast && showToast(m, t);

  const loadAvatar = async (hasAvatar) => {
    if (!hasAvatar) { setAvatar(a => ({ ...a, url: null })); return; }
    try {
      const url = await fetchPrivateBlobUrl(token, '/files/representative-avatar');
      setAvatar(a => { if (a.url) URL.revokeObjectURL(a.url); return { ...a, url }; });
    } catch { setAvatar(a => ({ ...a, url: null })); }
  };

  const load = async () => {
    setState('loading');
    try {
      const p = await apiJson(token, '/profile/me');
      const f = { representative_name: p.representative_name || '', representative_title: p.representative_title || '' };
      setProfile(p);
      setForm(f);
      setSaved(f);
      setState('ready');
      loadAvatar(Boolean(p.representative_avatar_url));
    } catch {
      setState('error');
    }
  };
  useEffect(() => { if (token) load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (avatar.url) URL.revokeObjectURL(avatar.url); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = form.representative_name !== saved.representative_name || form.representative_title !== saved.representative_title;
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const validate = () => {
    const name = form.representative_name.trim();
    const msg = name.length < 2 ? 'Nhập họ và tên (ít nhất 2 ký tự).' : /[<>{}\d]/.test(name) ? 'Họ và tên không được chứa số hoặc ký tự đặc biệt.' : '';
    setError(msg);
    return !msg;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const d = await apiJson(token, '/profile/me/representative', { method: 'PUT', body: form });
      const f = { representative_name: d.representative_name || '', representative_title: d.representative_title || '' };
      setForm(f);
      setSaved(f);
      notify('Đã lưu thông tin người đại diện.', 'success');
    } catch (ex) { notify(ex.message, 'error'); } finally { setSaving(false); }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const err = checkImageFile(file);
    if (err) return notify(err, 'error');
    setAvatar(a => ({ ...a, busy: true }));
    try {
      const image = await resizeImageFile(file, { maxWidth: 512, maxHeight: 512 });
      await apiJson(token, '/files/representative-avatar', { method: 'PUT', body: { image } });
      await loadAvatar(true);
      notify('Đã cập nhật ảnh đại diện.', 'success');
    } catch (ex) { notify(ex.message, 'error'); } finally { setAvatar(a => ({ ...a, busy: false })); }
  };

  const removeAvatar = async () => {
    if (!window.confirm('Xóa ảnh đại diện cá nhân?')) return;
    setAvatar(a => ({ ...a, busy: true }));
    try {
      await apiJson(token, '/files/representative-avatar', { method: 'DELETE' });
      setAvatar(a => { if (a.url) URL.revokeObjectURL(a.url); return { url: null, busy: false }; });
    } catch (ex) { notify(ex.message, 'error'); setAvatar(a => ({ ...a, busy: false })); }
  };

  if (state === 'loading' && !profile) {
    return <div style={{ ...card, color: '#64748B', textAlign: 'center' }} aria-busy="true"><Loader2 size={18} className="animate-spin" /> Đang tải…</div>;
  }
  if (state === 'error' && !profile) {
    return (
      <div style={{ ...card, textAlign: 'center' }} role="alert">
        <AlertCircle size={28} color="#DC2626" style={{ margin: '0 auto 8px' }} />
        <p style={{ margin: '0 0 12px 0' }}>Không tải được thông tin người đại diện.</p>
        <button type="button" style={btn} onClick={load}>Thử lại</button>
      </div>
    );
  }

  const initial = (form.representative_name || currentUser?.full_name || 'N').trim().charAt(0).toUpperCase();

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Tài khoản</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0 0' }}>Thông tin người đại diện</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: 13.5, color: 'var(--color-text-secondary)' }}>
          <Lock size={13} style={{ verticalAlign: -2 }} /> Thông tin cá nhân của người quản lý tài khoản. Không hiển thị trên trang công ty và không dùng làm liên hệ tuyển dụng.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20, alignItems: 'start' }}>
        <form onSubmit={save} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
          <h3 style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} /> Hồ sơ người đại diện</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #7565A8, #A997C5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>
              {avatar.url ? <img src={avatar.url} alt="Ảnh đại diện cá nhân" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" style={btn} disabled={avatar.busy} onClick={() => fileRef.current?.click()}>
                  {avatar.busy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />} {avatar.url ? 'Đổi ảnh' : 'Tải ảnh lên'}
                </button>
                {avatar.url && <button type="button" style={btnDanger} disabled={avatar.busy} onClick={removeAvatar}><Trash2 size={14} /> Xóa</button>}
              </div>
              <p style={hintStyle}>JPG, PNG, WEBP. Khác với logo doanh nghiệp.</p>
              <input ref={fileRef} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} />
            </div>
          </div>

          <div style={grid}>
            <label>
              <span style={labelStyle}>Họ và tên <span style={{ color: '#DC2626' }}>*</span></span>
              <input style={error ? inputError : input} value={form.representative_name} maxLength={100} aria-invalid={Boolean(error)} autoComplete="name"
                onChange={(e) => setForm(f => ({ ...f, representative_name: e.target.value }))} onBlur={() => form.representative_name && validate()} />
              {error && <p style={errorStyle} role="alert">{error}</p>}
            </label>
            <label>
              <span style={labelStyle}>Chức vụ</span>
              <input style={input} value={form.representative_title} maxLength={100} placeholder="VD: Trưởng phòng nhân sự" autoComplete="organization-title"
                onChange={(e) => setForm(f => ({ ...f, representative_title: e.target.value }))} />
            </label>
          </div>

          <ReadOnlyField icon={Mail} label="Email tài khoản" value={profile?.email} verified={Boolean(profile?.email_verified_at)} />
          <ReadOnlyField icon={Phone} label="Số điện thoại cá nhân" value={profile?.phone} verified={Boolean(profile?.phone_verified_at)} />
          <p style={{ ...hintStyle, marginTop: -8 }}>
            Email và số điện thoại dùng để đăng nhập nên không sửa trực tiếp được. Việc thay đổi cần quy trình xác minh mã OTP — liên hệ quản trị viên JobNest nếu cần đổi.
          </p>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="submit" disabled={!dirty || saving} style={{ ...btnPrimary, background: !dirty || saving ? '#C4B5FD' : '#7565A8', cursor: !dirty || saving ? 'not-allowed' : 'pointer' }}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Lưu thay đổi
            </button>
            {dirty && <span style={{ fontSize: 12.5, color: '#C2410C', fontWeight: 600 }}>Có thay đổi chưa lưu</span>}
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={card}>
            <h3 style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={18} color="#047857" /> Bảo mật tài khoản</h3>
            <p style={{ ...hintStyle, marginTop: 0, marginBottom: 12 }}>Đổi mật khẩu và các cài đặt bảo mật nằm ở Cài đặt tài khoản.</p>
            {onNavigateSettings && (
              <button type="button" style={{ ...btn, width: '100%', justifyContent: 'center' }} onClick={onNavigateSettings}>
                <Settings size={15} /> Cài đặt tài khoản & Đổi mật khẩu
              </button>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 14, padding: '10px 12px', borderRadius: 8, background: '#F8FAFC', fontSize: 12.5, color: '#64748B' }}>
              <MonitorSmartphone size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Quản lý phiên đăng nhập trên từng thiết bị: hệ thống chưa hỗ trợ. Nếu nghi ngờ lộ tài khoản, hãy đổi mật khẩu ngay.</span>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={18} color="#7565A8" /> Thông tin doanh nghiệp</h3>
            <p style={{ ...hintStyle, marginTop: 0, marginBottom: 12 }}>Logo, giới thiệu, liên hệ tuyển dụng, chi nhánh và xác minh pháp lý được quản lý riêng.</p>
            {onNavigateCompany && <button type="button" style={{ ...btn, width: '100%', justifyContent: 'center' }} onClick={onNavigateCompany}>Mở Hồ sơ doanh nghiệp</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
