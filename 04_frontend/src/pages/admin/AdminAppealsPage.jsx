import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { apiJson, card, input, btn, btnDanger, btnPrimary, hintStyle } from '../../components/employer/companyProfileShared';
import ExportMenu from '../../components/common/ExportMenu';

const FILTERS = [['PENDING', 'Chờ xử lý'], ['IN_REVIEW', 'Đang xử lý'], ['APPROVED', 'Đã chấp nhận'], ['REJECTED', 'Đã từ chối'], ['ALL', 'Tất cả']];
const STATUS_LABEL = { PENDING: 'Chờ xử lý', IN_REVIEW: 'Đang xử lý', APPROVED: 'Đã chấp nhận (mở khóa)', REJECTED: 'Đã từ chối' };
const fmt = (d) => (d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'Chưa có');
const ROLE_LABEL = { STUDENT: 'Sinh viên', EMPLOYER: 'Nhà tuyển dụng', ADMIN: 'Quản trị viên' };
const ACCOUNT_LABEL = { ACTIVE: 'Đang hoạt động', SUSPENDED: 'Tạm ngưng', BANNED: 'Đang bị khóa', LOCKED: 'Đang bị khóa' };
const STATUS_BADGE = {
  PENDING: { background: '#FEF3C7', color: '#78350F', border: '1px solid #FCD34D' },
  IN_REVIEW: { background: '#DBEAFE', color: '#1E3A8A', border: '1px solid #93C5FD' },
  APPROVED: { background: '#DCFCE7', color: '#14532D', border: '1px solid #86EFAC' },
  REJECTED: { background: '#FEE2E2', color: '#7F1D1D', border: '1px solid #FCA5A5' }
};

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
    // "Nhận xử lý" chỉ đổi trạng thái, chưa cần phản hồi; quyết định cuối bắt buộc có phản hồi
    if (status !== 'IN_REVIEW') {
      if (!admin_response) { notify('Vui lòng nhập phản hồi cho người dùng.', 'error'); return; }
      if (!window.confirm(status === 'APPROVED' ? `Chấp nhận khiếu nại và MỞ KHÓA tài khoản ${row.email}?` : `Từ chối khiếu nại của ${row.email}? Tài khoản vẫn bị khóa.`)) return;
    }
    setBusy(`${row.id}-${status}`);
    try {
      await apiJson(token, `/admin/appeals/${row.id}`, { method: 'PATCH', body: { status, admin_response } });
      notify(status === 'IN_REVIEW' ? 'Đã chuyển khiếu nại sang Đang xử lý.' : status === 'APPROVED' ? 'Đã mở khóa tài khoản.' : 'Đã từ chối khiếu nại.', 'success');
      load();
    } catch (ex) { notify(ex.message, 'error'); } finally { setBusy(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{
        position: 'sticky', top: 'var(--app-header-h, 74px)', zIndex: 6,
        background: 'var(--color-background)', margin: '-28px 0 0', padding: '28px 0 14px',
        borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 14
      }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Khiếu nại tài khoản</h1>
        <p style={{ ...hintStyle, fontSize: 13.5, color: '#475569', maxWidth: '60ch' }}>Người dùng bị khóa gửi khiếu nại từ màn hình đăng nhập. Chấp nhận sẽ mở khóa tài khoản ngay.</p>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FILTERS.map(([v, l]) => (
          <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)}
            style={{ ...btn, borderColor: filter === v ? '#7565A8' : '#E2E8F0', background: filter === v ? '#F1EEF8' : '#fff', color: filter === v ? '#594675' : '#475569' }}>{l}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <ExportMenu
            disabled={state !== 'ready'}
            onError={() => notify('Xuất báo cáo thất bại', 'error')}
            getReport={() => ({
              title: 'Báo cáo khiếu nại tài khoản',
              subtitle: `Bộ lọc: ${FILTERS.find(f => f[0] === filter)[1]}`,
              fileName: 'khieu-nai-tai-khoan',
              author: currentUser?.full_name,
              summary: [['Tổng khiếu nại', rows.length], ['Chờ xử lý', rows.filter(r => r.status === 'PENDING').length],
                ['Đang xử lý', rows.filter(r => r.status === 'IN_REVIEW').length],
                ['Đã chấp nhận', rows.filter(r => r.status === 'APPROVED').length], ['Đã từ chối', rows.filter(r => r.status === 'REJECTED').length]],
              columns: [
                { header: 'Người dùng', value: r => r.full_name, width: 24 },
                { header: 'Email', value: r => r.email, width: 28 },
                { header: 'Vai trò', value: r => ({ STUDENT: 'Sinh viên', EMPLOYER: 'Nhà tuyển dụng' }[r.role] || r.role), width: 14 },
                { header: 'Lý do bị khóa', value: r => r.suspension_reason, width: 28 },
                { header: 'Nội dung khiếu nại', value: r => r.appeal_reason, width: 44 },
                { header: 'Gửi lúc', value: r => r.created_at, type: 'datetime', width: 16 },
                { header: 'Kết quả', value: r => STATUS_LABEL[r.status] || r.status, width: 20 },
              ],
              rows,
            })}
          />
          <button type="button" style={btn} onClick={load}><RefreshCw size={14} /> Tải lại</button>
        </div>
      </div>
      </div>

      {state === 'loading' && <div style={{ ...card, color: '#475569' }}><Loader2 size={16} className="animate-spin" /> Đang tải…</div>}
      {state === 'error' && <div style={{ ...card, color: '#B91C1C' }} role="alert">Không tải được danh sách khiếu nại. <button type="button" style={btn} onClick={load}>Thử lại</button></div>}
      {state === 'ready' && rows.length === 0 && <div style={{ ...card, textAlign: 'center', color: '#475569' }}>Không có khiếu nại nào.</div>}
      {state === 'ready' && rows.map(row => (
        <div key={row.id} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <strong>{row.full_name || row.email}</strong> <span style={{ color: '#475569' }}>· {ROLE_LABEL[row.role] || row.role}</span>
              <div style={{ fontSize: 13, color: '#475569', overflowWrap: 'anywhere' }}>{row.email}</div>
              <div style={{ fontSize: 13, color: '#475569' }}>Gửi lúc {fmt(row.created_at)} · Tài khoản: {ACCOUNT_LABEL[row.user_status] || row.user_status}</div>
            </div>
            <span style={{ alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 6, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', ...(STATUS_BADGE[row.status] || STATUS_BADGE.PENDING) }}>{STATUS_LABEL[row.status] || row.status}</span>
          </div>
          {row.suspension_reason && <div style={{ fontSize: 13.5, maxWidth: '72ch' }}><b>Lý do khóa:</b> {row.suspension_reason}</div>}
          <div style={{ fontSize: 13.5, lineHeight: 1.55, whiteSpace: 'pre-line', background: '#F8FAFC', borderRadius: 8, padding: '10px 12px' }}><b>Nội dung khiếu nại:</b> <span style={{ display: 'block', maxWidth: '72ch', marginTop: 2 }}>{row.appeal_reason}</span></div>
          {['PENDING', 'IN_REVIEW'].includes(row.status) ? (
            <>
              <textarea rows={2} maxLength={1000} style={{ ...input, resize: 'vertical' }} placeholder="Phản hồi gửi người dùng (bắt buộc khi chấp nhận hoặc từ chối)"
                value={responses[row.id] || ''} onChange={(e) => setResponses(r => ({ ...r, [row.id]: e.target.value }))} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {row.status === 'PENDING' && (
                  <button type="button" style={btn} disabled={Boolean(busy)} onClick={() => resolve(row, 'IN_REVIEW')}>
                    {busy === `${row.id}-IN_REVIEW` ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />} Nhận xử lý
                  </button>
                )}
                <button type="button" style={btnPrimary} disabled={Boolean(busy)} onClick={() => resolve(row, 'APPROVED')}>
                  {busy === `${row.id}-APPROVED` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Chấp nhận & mở khóa
                </button>
                <button type="button" style={btnDanger} disabled={Boolean(busy)} onClick={() => resolve(row, 'REJECTED')}>
                  <XCircle size={14} /> Từ chối
                </button>
              </div>
            </>
          ) : (
            row.admin_response && <div style={{ fontSize: 13.5, maxWidth: '72ch' }}><b>Phản hồi:</b> {row.admin_response} <span style={{ color: '#475569' }}>({fmt(row.resolved_at)})</span></div>
          )}
        </div>
      ))}
    </div>
  );
}
