import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Download, FileText, CheckCircle2, AlertTriangle, XCircle, History, X } from 'lucide-react';
import { apiJson, fetchPrivateBlobUrl, card, input, btn, btnDanger, btnPrimary, hintStyle, labelStyle } from '../../components/employer/companyProfileShared';
import { LegalStatusBadge } from '../../components/employer/CompanyVerificationSection';

const FILTERS = [['PENDING', 'Chờ duyệt'], ['NEEDS_INFO', 'Cần bổ sung'], ['REJECTED', 'Đã từ chối'], ['VERIFIED', 'Đã xác minh'], ['ALL', 'Tất cả']];
const fmt = (d) => (d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—');
const SECTION_LABEL = { REPRESENTATIVE: 'Người đại diện', COMPANY: 'Hồ sơ doanh nghiệp', VERIFICATION: 'Thông tin pháp lý', VERIFICATION_REVIEW: 'Xét duyệt' };

/** Quản trị viên xét duyệt hồ sơ pháp lý doanh nghiệp (khác "tick xanh" xác minh email/SĐT ở trang Người dùng). */
export default function AdminEmployerVerificationPage({ currentUser, showToast }) {
  const token = currentUser?.token;
  const [filter, setFilter] = useState('PENDING');
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');
  const [selected, setSelected] = useState(null); // { detail, history }
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const notify = (m, t) => showToast && showToast(m, t);

  const load = async () => {
    setState('loading');
    try { setRows(await apiJson(token, `/admin/employer-verifications?status=${filter}`)); setState('ready'); } catch { setState('error'); }
  };
  useEffect(() => { if (token) load(); }, [token, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = async (id) => {
    setBusy(`open-${id}`);
    try {
      const [detail, history] = await Promise.all([
        apiJson(token, `/admin/employer-verifications/${id}`),
        apiJson(token, `/admin/employers/${id}/profile-changes`),
      ]);
      setSelected({ detail, history });
      setNote('');
    } catch (ex) { notify(ex.message, 'error'); } finally { setBusy(''); }
  };

  const download = async (doc) => {
    try {
      const url = await fetchPrivateBlobUrl(token, `/files/legal-documents/${doc.id}`);
      const a = document.createElement('a');
      a.href = url; a.download = doc.name || 'tai-lieu'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (ex) { notify(ex.message, 'error'); }
  };

  const decide = async (status) => {
    if (status !== 'VERIFIED' && !note.trim()) { notify('Hãy ghi lý do để doanh nghiệp biết cần sửa gì.', 'error'); return; }
    const label = { VERIFIED: 'xác minh', NEEDS_INFO: 'yêu cầu bổ sung', REJECTED: 'từ chối' }[status];
    if (!window.confirm(`Xác nhận ${label} doanh nghiệp "${selected.detail.display_name}"?`)) return;
    setBusy(status);
    try {
      const detail = await apiJson(token, `/admin/employer-verifications/${selected.detail.user_id}`, { method: 'PATCH', body: { status, note: note.trim() || undefined } });
      notify('Đã lưu kết quả xét duyệt và thông báo cho doanh nghiệp.', 'success');
      setSelected(s => ({ ...s, detail }));
      load();
    } catch (ex) { notify(ex.message, 'error'); } finally { setBusy(''); }
  };

  const d = selected?.detail;
  const canDecide = d && (d.status === 'PENDING' || d.status === 'VERIFIED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Xác minh doanh nghiệp</h1>
        <p style={{ ...hintStyle, fontSize: 13.5 }}>Đối chiếu tên pháp nhân, mã số thuế và giấy tờ. Tài liệu chỉ quản trị viên và chính doanh nghiệp xem được.</p>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map(([v, l]) => (
          <button key={v} type="button" onClick={() => setFilter(v)} aria-pressed={filter === v}
            style={{ ...btn, borderColor: filter === v ? '#7565A8' : '#E2E8F0', background: filter === v ? '#F1EEF8' : '#fff', color: filter === v ? '#594675' : '#475569' }}>{l}</button>
        ))}
        <button type="button" style={{ ...btn, marginLeft: 'auto' }} onClick={load}><RefreshCw size={14} /> Tải lại</button>
      </div>

      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        {state === 'loading' && <div style={{ padding: 20, color: '#64748B' }}><Loader2 size={16} className="animate-spin" /> Đang tải…</div>}
        {state === 'error' && <div style={{ padding: 20, color: '#B91C1C' }} role="alert">Không tải được danh sách. <button type="button" style={btn} onClick={load}>Thử lại</button></div>}
        {state === 'ready' && rows.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8' }}>Không có hồ sơ nào ở trạng thái này.</div>}
        {state === 'ready' && rows.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 720 }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#F8FAFC', color: '#475569' }}>
                {['Doanh nghiệp', 'Tên pháp nhân / MST', 'Tài liệu', 'Gửi lúc', 'Trạng thái', ''].map(h => <th key={h} style={{ padding: '10px 14px', fontWeight: 700 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.user_id} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 14px' }}><strong>{r.display_name}</strong><div style={{ fontSize: 12, color: '#94A3B8' }}>{r.email}</div></td>
                  <td style={{ padding: '10px 14px' }}>{r.company_name || '—'}<div style={{ fontSize: 12, color: '#64748B' }}>{r.tax_code || 'Chưa có MST'}</div></td>
                  <td style={{ padding: '10px 14px' }}>{r.document_count}</td>
                  <td style={{ padding: '10px 14px' }}>{fmt(r.verification_submitted_at)}</td>
                  <td style={{ padding: '10px 14px' }}><LegalStatusBadge status={r.verification_status} /></td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <button type="button" style={btn} disabled={busy === `open-${r.user_id}`} onClick={() => open(r.user_id)}>Xem hồ sơ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {d && (
        <div role="dialog" aria-modal="true" aria-label={`Hồ sơ xác minh ${d.display_name}`} onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(15,23,42,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '5vh 16px', overflowY: 'auto' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...card, width: 'min(720px, 100%)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>{d.display_name}</h2>
                <div style={{ marginTop: 6 }}><LegalStatusBadge status={d.status} /></div>
              </div>
              <button type="button" aria-label="Đóng" onClick={() => setSelected(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>
            <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 14px', margin: 0, fontSize: 13.5 }}>
              <dt style={{ color: '#64748B' }}>Tên pháp nhân</dt><dd style={{ margin: 0, fontWeight: 600 }}>{d.company_name || '—'}</dd>
              <dt style={{ color: '#64748B' }}>Mã số thuế</dt><dd style={{ margin: 0, fontWeight: 600 }}>{d.tax_code || '—'}</dd>
              <dt style={{ color: '#64748B' }}>Gửi lúc</dt><dd style={{ margin: 0 }}>{fmt(d.submitted_at)}</dd>
              <dt style={{ color: '#64748B' }}>Xét duyệt lần cuối</dt><dd style={{ margin: 0 }}>{fmt(d.reviewed_at)}</dd>
              {d.note && <><dt style={{ color: '#64748B' }}>Ghi chú trước</dt><dd style={{ margin: 0 }}>{d.note}</dd></>}
            </dl>
            <div>
              <div style={labelStyle}>Tài liệu ({d.documents.length})</div>
              {d.documents.length === 0 ? <div style={{ fontSize: 13, color: '#94A3B8' }}>Không có tài liệu.</div> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.documents.map(doc => (
                    <li key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                      <FileText size={16} color="#7565A8" /><span style={{ flex: 1, overflowWrap: 'anywhere' }}>{doc.name}</span>
                      <button type="button" style={btn} onClick={() => download(doc)}><Download size={14} /> Tải về</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {canDecide && (
              <div>
                <label>
                  <span style={labelStyle}>Lý do / ghi chú cho doanh nghiệp {d.status === 'PENDING' ? '(bắt buộc khi yêu cầu bổ sung hoặc từ chối)' : '(bắt buộc khi thu hồi)'}</span>
                  <textarea style={{ ...input, minHeight: 70 }} value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="VD: Ảnh giấy phép bị mờ, vui lòng tải bản rõ hơn." />
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {d.status === 'PENDING' && (
                    <button type="button" style={btnPrimary} disabled={Boolean(busy)} onClick={() => decide('VERIFIED')}>
                      {busy === 'VERIFIED' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Xác minh
                    </button>
                  )}
                  <button type="button" style={{ ...btn, borderColor: '#FED7AA', color: '#C2410C' }} disabled={Boolean(busy)} onClick={() => decide('NEEDS_INFO')}>
                    <AlertTriangle size={14} /> Yêu cầu bổ sung
                  </button>
                  <button type="button" style={btnDanger} disabled={Boolean(busy)} onClick={() => decide('REJECTED')}>
                    <XCircle size={14} /> {d.status === 'VERIFIED' ? 'Thu hồi xác minh' : 'Từ chối'}
                  </button>
                </div>
              </div>
            )}
            <div>
              <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}><History size={14} /> Lịch sử thay đổi gần đây</div>
              {selected.history.length === 0 ? <div style={{ fontSize: 13, color: '#94A3B8' }}>Chưa có.</div> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 220, overflowY: 'auto', fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.history.map(h => (
                    <li key={h.id} style={{ borderLeft: '3px solid #DDD6FE', paddingLeft: 8 }}>
                      <strong>{SECTION_LABEL[h.section] || h.section}</strong> · {fmt(h.created_at)} · {h.changed_by_role === 'ADMIN' ? 'Quản trị viên' : 'Doanh nghiệp'}
                      <div style={{ color: '#64748B', overflowWrap: 'anywhere' }}>
                        {Object.entries(h.changes).map(([k, v]) => (v && typeof v === 'object' && 'to' in v ? `${k}: ${JSON.stringify(v.from)} → ${JSON.stringify(v.to)}` : `${k}: đã cập nhật`)).join('; ')}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
