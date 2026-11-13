import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Clock3, CircleDashed, AlertTriangle, XCircle, Upload, Trash2, Download, Loader2, Send, Save, Lock, FileText } from 'lucide-react';
import {
  apiJson, fetchPrivateBlobUrl, readFileAsDataUrl, card, input, inputError, labelStyle, hintStyle, errorStyle, grid, btn, btnDanger, btnPrimary, sectionTitle,
} from './companyProfileShared';

export const LEGAL_STATUS_UI = {
  UNVERIFIED: { label: 'Chưa gửi xác minh', icon: CircleDashed, color: '#475569', bg: '#F8FAFC', border: '#E2E8F0' },
  PENDING: { label: 'Chờ xét duyệt', icon: Clock3, color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  VERIFIED: { label: 'Đã xác minh', icon: ShieldCheck, color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
  NEEDS_INFO: { label: 'Cần bổ sung hồ sơ', icon: AlertTriangle, color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
  REJECTED: { label: 'Từ chối xác minh', icon: XCircle, color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
};
const DOC_MAX_BYTES = 5 * 1024 * 1024;
const DOCS_MAX = 5;
const DOC_TYPES = /^(application\/pdf|image\/(jpeg|png|webp))$/;

export function LegalStatusBadge({ status }) {
  const ui = LEGAL_STATUS_UI[status] || LEGAL_STATUS_UI.UNVERIFIED;
  const Icon = ui.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, color: ui.color, background: ui.bg, border: `1px solid ${ui.border}` }}>
      <Icon size={14} /> {ui.label}
    </span>
  );
}

const fmtSize = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const fmtDate = (d) => (d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '');

/** Xác minh pháp lý doanh nghiệp — khác xác minh email/SĐT. Tài liệu chỉ chủ tài khoản và quản trị viên xem được. */
export default function CompanyVerificationSection({ token, showToast, onChange }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [legal, setLegal] = useState({ company_name: '', tax_code: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState('');
  const fileRef = useRef(null);
  const notify = (m, t) => showToast && showToast(m, t);

  const apply = (d) => {
    setData(d);
    setLegal({ company_name: d.company_name || '', tax_code: d.tax_code || '' });
    onChange && onChange(d);
  };

  const load = async () => {
    setState('loading');
    try { apply(await apiJson(token, '/profile/me/verification')); setState('ready'); } catch { setState('error'); }
  };
  useEffect(() => { if (token) load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state === 'loading') return <div style={{ ...card, color: '#64748B' }}><Loader2 size={16} className="animate-spin" /> Đang tải trạng thái xác minh…</div>;
  if (state === 'error') {
    return (
      <div style={{ ...card, color: '#B91C1C' }} role="alert">
        Không tải được thông tin xác minh. <button type="button" style={{ ...btn, marginLeft: 8 }} onClick={load}>Thử lại</button>
      </div>
    );
  }

  const legalDirty = legal.company_name !== (data.company_name || '') || legal.tax_code !== (data.tax_code || '');
  const validate = () => {
    const e = {};
    if (legal.company_name.trim().length < 2) e.company_name = 'Nhập đúng tên trên giấy chứng nhận đăng ký doanh nghiệp.';
    if (!/^\d{10}(-\d{3})?$/.test(legal.tax_code.replace(/\s/g, ''))) e.tax_code = 'Gồm 10 chữ số, hoặc 10 số + "-" + 3 số với chi nhánh.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const saveLegal = async () => {
    if (!validate()) return false;
    setBusy('legal');
    try { apply(await apiJson(token, '/profile/me/verification', { method: 'PUT', body: legal })); notify('Đã lưu thông tin pháp lý.', 'success'); return true; }
    catch (ex) { notify(ex.message, 'error'); return false; } finally { setBusy(''); }
  };

  const uploadDocs = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    setBusy('upload');
    try {
      let docs = data.documents;
      for (const file of files) {
        if (docs.length >= DOCS_MAX) { notify(`Tối đa ${DOCS_MAX} tài liệu.`, 'info'); break; }
        if (!DOC_TYPES.test(file.type)) { notify(`${file.name}: chỉ nhận PDF, JPG, PNG, WEBP.`, 'error'); continue; }
        if (file.size > DOC_MAX_BYTES) { notify(`${file.name}: vượt quá 5MB.`, 'error'); continue; }
        const doc = await apiJson(token, '/files/legal-documents', { method: 'POST', body: { file: await readFileAsDataUrl(file), name: file.name } });
        docs = [...docs, doc];
        setData(d => ({ ...d, documents: docs }));
      }
    } catch (ex) { notify(ex.message, 'error'); } finally { setBusy(''); }
  };

  const removeDoc = async (doc) => {
    if (!window.confirm(`Xóa tài liệu "${doc.name}"?`)) return;
    setBusy(`doc-${doc.id}`);
    try { await apiJson(token, `/files/legal-documents/${doc.id}`, { method: 'DELETE' }); setData(d => ({ ...d, documents: d.documents.filter(x => x.id !== doc.id) })); }
    catch (ex) { notify(ex.message, 'error'); } finally { setBusy(''); }
  };

  const downloadDoc = async (doc) => {
    try {
      const url = await fetchPrivateBlobUrl(token, `/files/legal-documents/${doc.id}`);
      const a = document.createElement('a');
      a.href = url; a.download = doc.name || 'tai-lieu'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (ex) { notify(ex.message, 'error'); }
  };

  const submit = async () => {
    if (legalDirty && !(await saveLegal())) return;
    if (!validate()) return;
    if (!data.documents.length) { notify('Cần tải lên ít nhất 1 tài liệu.', 'error'); return; }
    if (!window.confirm('Gửi hồ sơ để JobNest xét duyệt? Trong lúc chờ duyệt bạn sẽ không sửa được tên pháp nhân, mã số thuế và tài liệu.')) return;
    setBusy('submit');
    try { apply(await apiJson(token, '/profile/me/verification/submit', { method: 'POST' })); notify('Đã gửi hồ sơ xác minh.', 'success'); }
    catch (ex) { notify(ex.message, 'error'); } finally { setBusy(''); }
  };

  const locked = !data.editable;
  const ui = LEGAL_STATUS_UI[data.status] || LEGAL_STATUS_UI.UNVERIFIED;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ ...card, borderColor: ui.border, background: ui.bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <h3 style={sectionTitle}>Trạng thái xác minh pháp lý</h3>
            <p style={{ ...hintStyle, marginTop: 0 }}>
              Khác với xác minh email/số điện thoại. Huy hiệu "Đã xác minh pháp lý" chỉ hiện trên trang công ty khi JobNest duyệt hồ sơ.
            </p>
          </div>
          <LegalStatusBadge status={data.status} />
        </div>
        {data.note && ['NEEDS_INFO', 'REJECTED'].includes(data.status) && (
          <div role="alert" style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: '#ffffff', border: `1px solid ${ui.border}`, fontSize: 13.5, color: ui.color }}>
            <strong>Phản hồi từ JobNest:</strong> {data.note}
          </div>
        )}
        <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {data.submitted_at && <span>Gửi lúc: {fmtDate(data.submitted_at)}</span>}
          {data.reviewed_at && <span>Xét duyệt lúc: {fmtDate(data.reviewed_at)}</span>}
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Thông tin pháp lý</h3>
        <p style={{ ...hintStyle, marginTop: 0, marginBottom: 14 }}>
          <Lock size={12} style={{ verticalAlign: -1 }} /> Mã số thuế và tài liệu chỉ dùng để xác minh, không hiển thị cho ứng viên.
          {locked && ' Hồ sơ đang chờ duyệt hoặc đã xác minh nên không thể sửa.'}
        </p>
        <div style={grid}>
          <label>
            <span style={labelStyle}>Tên pháp nhân <span style={{ color: '#DC2626' }}>*</span></span>
            <input style={errors.company_name ? inputError : input} value={legal.company_name} disabled={locked} maxLength={255}
              aria-invalid={Boolean(errors.company_name)} placeholder="VD: Công ty TNHH Giải pháp ABC"
              onChange={(e) => setLegal(l => ({ ...l, company_name: e.target.value }))} />
            {errors.company_name && <p style={errorStyle}>{errors.company_name}</p>}
          </label>
          <label>
            <span style={labelStyle}>Mã số thuế <span style={{ color: '#DC2626' }}>*</span></span>
            <input style={errors.tax_code ? inputError : input} value={legal.tax_code} disabled={locked} maxLength={14} inputMode="numeric"
              aria-invalid={Boolean(errors.tax_code)} placeholder="0312345678"
              onChange={(e) => setLegal(l => ({ ...l, tax_code: e.target.value }))} />
            {errors.tax_code && <p style={errorStyle}>{errors.tax_code}</p>}
          </label>
        </div>
        {!locked && (
          <div style={{ marginTop: 12 }}>
            <button type="button" style={btn} disabled={!legalDirty || busy === 'legal'} onClick={saveLegal}>
              {busy === 'legal' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Lưu thông tin pháp lý
            </button>
          </div>
        )}
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <div>
            <h3 style={sectionTitle}>Tài liệu ({data.documents.length}/{DOCS_MAX})</h3>
            <p style={{ ...hintStyle, marginTop: 0 }}>Giấy chứng nhận đăng ký doanh nghiệp (bắt buộc) và tài liệu liên quan. PDF/JPG/PNG/WEBP, tối đa 5MB mỗi file.</p>
          </div>
          {!locked && data.documents.length < DOCS_MAX && (
            <button type="button" style={btn} disabled={busy === 'upload'} onClick={() => fileRef.current?.click()}>
              {busy === 'upload' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Tải tài liệu
            </button>
          )}
          <input ref={fileRef} type="file" hidden multiple accept="application/pdf,image/jpeg,image/png,image/webp" onChange={uploadDocs} />
        </div>
        {data.documents.length === 0 ? (
          <div style={{ fontSize: 13, color: '#94A3B8', padding: 14, border: '1px dashed #E2E8F0', borderRadius: 10, textAlign: 'center' }}>Chưa có tài liệu.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.documents.map(doc => (
              <li key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 10, flexWrap: 'wrap' }}>
                <FileText size={18} color="#7565A8" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, overflowWrap: 'anywhere' }}>{doc.name}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{fmtSize(doc.size_bytes)} · {fmtDate(doc.created_at)}</div>
                </div>
                <button type="button" style={btn} onClick={() => downloadDoc(doc)}><Download size={14} /> Tải về</button>
                {!locked && (
                  <button type="button" style={btnDanger} disabled={busy === `doc-${doc.id}`} onClick={() => removeDoc(doc)} aria-label={`Xóa ${doc.name}`}>
                    <Trash2 size={14} /> Xóa
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!locked && (
        <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#475569' }}>
            {data.status === 'UNVERIFIED' ? 'Sẵn sàng? Gửi hồ sơ để JobNest đối chiếu.' : 'Đã chỉnh sửa theo phản hồi? Gửi lại để xét duyệt.'}
          </span>
          <button type="button" style={btnPrimary} disabled={busy === 'submit'} onClick={submit}>
            {busy === 'submit' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {data.status === 'UNVERIFIED' ? 'Gửi xác minh' : 'Gửi lại hồ sơ'}
          </button>
        </div>
      )}
    </div>
  );
}
