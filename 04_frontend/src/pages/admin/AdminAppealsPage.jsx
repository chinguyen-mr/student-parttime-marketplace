import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { apiJson, card, input, btn, btnDanger, btnPrimary, hintStyle } from '../../components/employer/companyProfileShared';

const FILTERS = [['PENDING', 'Chờ xử lý'], ['APPROVED', 'Đã chấp nhận'], ['REJECTED', 'Đã từ chối'], ['ALL', 'Tất cả']];
const STATUS_LABEL = { PENDING: 'Chờ xử lý', APPROVED: 'Đã chấp nhận (mở khóa)', REJECTED: 'Đã từ chối' };
const fmt = (d) => (d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—');

/** Khiếu nại của tài khoản bị khóa: chấp nhận = mở khóa tài khoản; từ chối = giữ khóa. Phản hồi bắt buộc. */
export default function AdminAppealsPage({ currentUser, showToast }) {
  const token = currentUser?.token;
  const [filter, setFilter] = useState('PENDING');
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');
  const [responses, setResponses] = useState({});
  const [busy, setBusy] = useState(null);
  const notify = (m, t) => showToast && showToast(m, t);

  const load = async () => {
    setState('loading');
    try { setRows(await apiJson(token, `/admin/appeals?status=${filter}`)); setState('ready'); } catch { setState('error'); }
  };
  useEffect(() => { if (token) load(); }, [token, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolve = async (row, status) => {
    const admin_response = (responses[row.id] || '').trim();
    if (!admin_response) { notify('Vui lòng nhập phản hồi cho người dùng.', 'error'); return; }
    if (!window.confirm(status === 'APPROVED' ? `Chấp nhận khiếu nại và MỞ KHÓA tài khoản ${row.email}?` : `Từ chối khiếu nại của ${row.email}? Tài khoản vẫn bị khóa.`)) return;
    setBusy(`${row.id}-${status}`);
    try {
      await apiJson(token, `/admin/appeals/${row.id}`, { method: 'PATCH', body: { status, admin_response } });
      notify(status === 'APPROVED' ? 'Đã mở khóa tài khoản.' : 'Đã từ chối khiếu nại.', 'success');
      load();
    } catch (ex) { notify(ex.message, 'error'); } finally { setBusy(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Khiếu nại tài khoản</h1>
        <p style={{ ...hintStyle, fontSize: 13.5 }}>Người dùng bị khóa gửi khiếu nại từ màn hình đăng nhập. Chấp nhận sẽ mở khóa tài khoản ngay.</p>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FILTERS.map(([v, l]) => (
          <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)}
            style={{ ...btn, borderColor: filter === v ? '#7565A8' : '#E2E8F0', background: filter === v ? '#F1EEF8' : '#fff', color: filter === v ? '#594675' : '#475569' }}>{l}</button>
        ))}
        <button type="button" style={{ ...btn, marginLeft: 'auto' }} onClick={load}><RefreshCw size={14} /> Tải lại</button>
      </div>

      {state === 'loading' && <div style={{ ...card, color: '#64748B' }}><Loader2 size={16} className="animate-spin" /> Đang tải…</div>}
      {state === 'error' && <div style={{ ...card, color: '#B91C1C' }} role="alert">Không tải được danh sách khiếu nại. <button type="button" style={btn} onClick={load}>Thử lại</button></div>}
      {state === 'ready' && rows.length === 0 && <div style={{ ...card, textAlign: 'center', color: '#94A3B8' }}>Không có khiếu nại nào.</div>}
      {state === 'ready' && rows.map(row => (
        <div key={row.id} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <strong>{row.full_name || row.email}</strong> <span style={{ color: '#64748B' }}>· {row.email} · {row.role}</span>
              <div style={{ fontSize: 12.5, color: '#64748B' }}>Gửi lúc {fmt(row.created_at)} · Tài khoản: {row.user_status}</div>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: row.status === 'PENDING' ? '#B45309' : row.status === 'APPROVED' ? '#047857' : '#B91C1C' }}>{STATUS_LABEL[row.status] || row.status}</span>
          </div>
          {row.suspension_reason && <div style={{ fontSize: 13 }}><b>Lý do khóa:</b> {row.suspension_reason}</div>}
          <div style={{ fontSize: 13.5, whiteSpace: 'pre-line', background: '#F8FAFC', borderRadius: 8, padding: '10px 12px' }}><b>Nội dung khiếu nại:</b> {row.appeal_reason}</div>
          {row.status === 'PENDING' ? (
            <>
              <textarea rows={2} maxLength={1000} style={{ ...input, resize: 'vertical' }} placeholder="Phản hồi gửi người dùng (bắt buộc)"
                value={responses[row.id] || ''} onChange={(e) => setResponses(r => ({ ...r, [row.id]: e.target.value }))} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" style={btnPrimary} disabled={Boolean(busy)} onClick={() => resolve(row, 'APPROVED')}>
                  {busy === `${row.id}-APPROVED` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Chấp nhận & mở khóa
                </button>
                <button type="button" style={btnDanger} disabled={Boolean(busy)} onClick={() => resolve(row, 'REJECTED')}>
                  <XCircle size={14} /> Từ chối
                </button>
              </div>
            </>
          ) : (
            row.admin_response && <div style={{ fontSize: 13 }}><b>Phản hồi:</b> {row.admin_response} <span style={{ color: '#94A3B8' }}>({fmt(row.resolved_at)})</span></div>
          )}
        </div>
      ))}
    </div>
  );
}
