import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, X, ShieldCheck, AlertTriangle, ChevronLeft, ChevronRight, Loader2, History, Flag, EyeOff } from 'lucide-react';
import ReviewCard from '../../components/reviews/ReviewCard';
import { reviewRequest } from '../../components/reviews/reviewApi';
import { STATUS_LABEL, EXPERIENCE_LABEL, FLAG_LABEL, REPORT_REASONS, reviewDate, formatRating } from '../../utils/reviewDisplay';

const card = { background: '#ffffff', borderRadius: 14, border: '1px solid var(--color-border)', padding: '16px 18px' };
const btn = (variant = 'outline') => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
  border: variant === 'outline' ? '1.5px solid #CBD5E1' : 'none',
  background: { outline: '#fff', primary: '#7565A8', danger: '#DC2626', success: '#059669' }[variant],
  color: variant === 'outline' ? '#334155' : '#fff',
});
const REASON_LABEL = Object.fromEntries(REPORT_REASONS);
const QUEUES = [
  ['PENDING', 'Chờ duyệt', 'pending'],
  ['PUBLISHED', 'Đang công khai', null],
  ['REPORTED', 'Bị báo cáo', 'pending_reports'],
  ['REPORTS', 'Báo cáo vi phạm', 'pending_reports'],
  ['APPEALS', 'Khiếu nại', 'pending_appeals'],
  ['CLOSED', 'Đã từ chối / ẩn / gỡ', null],
];
// Hành động khả dụng theo trạng thái (đồng bộ backend MODERATION_ACTIONS)
const ACTIONS = {
  PENDING: [['APPROVE', 'Duyệt & công khai', 'success'], ['REJECT', 'Từ chối', 'danger'], ['REMOVE', 'Gỡ', 'danger']],
  PUBLISHED: [['HIDE', 'Ẩn', 'danger'], ['REMOVE', 'Gỡ', 'danger']],
  HIDDEN: [['RESTORE', 'Khôi phục công khai', 'success'], ['REMOVE', 'Gỡ', 'danger']],
  REJECTED: [['RESTORE', 'Khôi phục công khai', 'success'], ['REMOVE', 'Gỡ', 'danger']],
  REMOVED: [['RESTORE', 'Khôi phục công khai', 'success']],
};
const LOG_LABEL = {
  CREATED: 'Ứng viên gửi đánh giá', EDITED: 'Ứng viên chỉnh sửa', APPROVE: 'Duyệt', REJECT: 'Từ chối', HIDE: 'Ẩn', RESTORE: 'Khôi phục',
  REMOVE: 'Gỡ', REPORTED: 'Bị báo cáo', APPEALED: 'Tác giả khiếu nại', REPORT_DISMISSED: 'Bác bỏ báo cáo', APPEAL_DENIED: 'Từ chối khiếu nại',
  REPLIED: 'Doanh nghiệp phản hồi', REPLY_EDITED: 'Doanh nghiệp sửa phản hồi', REPLY_DELETED: 'Doanh nghiệp xóa phản hồi',
  HIDE_REPLY: 'Ẩn phản hồi doanh nghiệp', SHOW_REPLY: 'Hiện lại phản hồi',
};

function StatusPill({ status }) {
  const [text, color, bg] = STATUS_LABEL[status] || ['—', '#475569', '#F1F5F9'];
  return <span style={{ fontSize: 11.5, fontWeight: 800, color, background: bg, padding: '2px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>{text}</span>;
}

function Pager({ pagination, page, setPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <nav aria-label="Phân trang" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 12 }}>
      <button type="button" style={btn()} disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Trang trước"><ChevronLeft size={14} /></button>
      <span style={{ fontSize: 13 }}>Trang {page}/{pagination.totalPages}</span>
      <button type="button" style={btn()} disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} aria-label="Trang sau"><ChevronRight size={14} /></button>
    </nav>
  );
}

// Chi tiết 1 đánh giá: danh tính thật (kể cả khi ẩn danh), bằng chứng, cờ, báo cáo, lịch sử, thao tác có lý do
function ReviewDetail({ type, id, token, onClose, onChanged, showToast }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try { setDetail((await reviewRequest(`/admin/reviews/${type}/${id}`, { token })).data); } catch (e) { setError(e.message); }
  }, [type, id, token]);
  useEffect(() => { load(); }, [load]);

  const act = async (action) => {
    setBusy(true);
    setError('');
    try {
      await reviewRequest(`/admin/reviews/${type}/${id}/moderate`, { method: 'POST', token, body: { action, reason } });
      showToast?.('Đã cập nhật đánh giá', 'success');
      setReason('');
      await load();
      onChanged();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  if (!detail) {
    return <div style={card}>{error ? <span role="alert" style={{ color: '#B91C1C' }}>{error}</span> : <span aria-busy="true">Đang tải chi tiết…</span>}</div>;
  }
  const r = detail.review;
  const dto = { ...r, type, author_name: r.reviewer_name, reply: null, published_at: r.published_at || r.created_at };
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }} aria-label="Chi tiết đánh giá">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong>Đánh giá {type === 'company' ? 'doanh nghiệp' : 'công việc'} #{r.id}</strong> <StatusPill status={r.status} />
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng chi tiết" style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} /></button>
      </div>

      <div style={{ fontSize: 13, color: '#334155', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '4px 16px' }}>
        <div><b>Người viết:</b> {r.reviewer_name} ({r.reviewer_email}){r.is_anonymous ? ' — đăng ẩn danh' : ''}</div>
        <div><b>Doanh nghiệp:</b> {r.employer_name} (#{r.employer_id})</div>
        {type === 'job' && <div><b>Công việc:</b> {r.job_title} (#{r.job_id})</div>}
        <div><b>Trải nghiệm khai báo:</b> {EXPERIENCE_LABEL[r.experience_type]}</div>
        <div style={{ color: r.is_verified ? '#047857' : '#B45309' }}>
          {r.is_verified ? <ShieldCheck size={13} style={{ verticalAlign: -2 }} /> : <AlertTriangle size={13} style={{ verticalAlign: -2 }} />}{' '}
          {r.is_verified ? `Đã xác thực (${r.verification_source === 'WORK_ASSIGNMENT' ? 'có công việc được giao' : 'có đơn ứng tuyển'})` : 'Chưa xác thực'}
        </div>
        <div><b>Dữ liệu hệ thống:</b> {detail.evidence.assignments.length} công việc được giao · {detail.evidence.applications.length} đơn ứng tuyển</div>
        <div><b>Gửi lúc:</b> {reviewDate(r.created_at)} · sửa {r.edit_count} lần</div>
      </div>

      {r.moderation_flags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {r.moderation_flags.map(f => <span key={f} style={{ fontSize: 11.5, fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: 999 }}>{FLAG_LABEL[f] || f}</span>)}
        </div>
      )}
      {r.moderation_reason && <div style={{ fontSize: 12.5, color: '#B91C1C' }}>Lý do hiện tại: {r.moderation_reason}</div>}

      <ReviewCard review={dto} />

      {detail.reply && (
        <div style={{ background: '#F8F7FB', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}>
          <b>Phản hồi doanh nghiệp</b> ({detail.reply.status === 'HIDDEN' ? 'đang ẩn' : 'đang hiển thị'}): <span style={{ whiteSpace: 'pre-line' }}>{detail.reply.content}</span>
          <div style={{ marginTop: 6 }}>
            <button type="button" style={btn()} disabled={busy} onClick={() => act(detail.reply.status === 'HIDDEN' ? 'SHOW_REPLY' : 'HIDE_REPLY')}>
              <EyeOff size={13} /> {detail.reply.status === 'HIDDEN' ? 'Hiện lại phản hồi' : 'Ẩn phản hồi'}
            </button>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="mod-reason" style={{ fontSize: 13, fontWeight: 700 }}>Lý do xử lý (bắt buộc khi từ chối / ẩn / gỡ / khôi phục)</label>
        <textarea id="mod-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500}
          style={{ width: '100%', boxSizing: 'border-box', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontFamily: 'inherit', fontSize: 13 }} />
        <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0' }}>Không gỡ đánh giá chỉ vì điểm thấp — chỉ xử lý khi nội dung vi phạm quy định.</p>
        {error && <div role="alert" style={{ color: '#B91C1C', fontSize: 12.5, marginTop: 4 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {(ACTIONS[r.status] || []).map(([a, text, variant]) => (
            <button key={a} type="button" style={btn(variant)} disabled={busy} onClick={() => act(a)}>{busy && <Loader2 size={13} className="animate-spin" />} {text}</button>
          ))}
        </div>
      </div>

      {detail.reports.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}><Flag size={13} /> Báo cáo / khiếu nại ({detail.reports.length})</div>
          {detail.reports.map(x => (
            <div key={x.id} style={{ fontSize: 12.5, borderTop: '1px solid #F1F5F9', padding: '6px 0' }}>
              <b>{x.kind === 'APPEAL' ? 'Khiếu nại' : REASON_LABEL[x.reason] || x.reason}</b> — {x.reporter_name} ({x.reporter_role}) · {reviewDate(x.created_at)} · {x.status}
              {x.description && <div style={{ color: '#475569', whiteSpace: 'pre-line' }}>{x.description}</div>}
              {x.resolution_note && <div style={{ color: '#64748B' }}>Kết quả: {x.resolution_note}</div>}
            </div>
          ))}
        </div>
      )}

      <div>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}><History size={13} /> Lịch sử kiểm duyệt</div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#334155' }}>
          {detail.logs.map(l => (
            <li key={l.id} style={{ marginBottom: 3 }}>
              {new Date(l.created_at).toLocaleString('vi-VN')} — <b>{LOG_LABEL[l.action] || l.action}</b> bởi {l.actor_name || l.actor_role}
              {l.from_status && l.to_status && l.from_status !== l.to_status ? ` (${l.from_status} → ${l.to_status})` : l.to_status && !l.from_status ? ` (→ ${l.to_status})` : ''}
              {l.reason && <span style={{ color: '#64748B' }}> · {l.reason}</span>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// Xử lý 1 báo cáo / khiếu nại
function ReportRow({ item, token, onOpen, onDone, showToast }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const options = item.kind === 'APPEAL'
    ? [['ACCEPT', 'Chấp nhận & khôi phục', 'success'], ['DENY', 'Từ chối khiếu nại', 'outline']]
    : [['DISMISS', 'Bác bỏ (giữ đánh giá)', 'outline'], ['HIDE', 'Ẩn đánh giá', 'danger'], ['REMOVE', 'Gỡ đánh giá', 'danger']];
  const resolve = async (action) => {
    setBusy(true);
    setError('');
    try {
      await reviewRequest(`/admin/reviews/reports/${item.id}/resolve`, { method: 'POST', token, body: { action, note } });
      showToast?.('Đã xử lý', 'success');
      onDone();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
        <span><b>{item.kind === 'APPEAL' ? 'Khiếu nại của tác giả' : REASON_LABEL[item.reason] || item.reason}</b> — {item.reporter_name} ({item.reporter_role}) · {reviewDate(item.created_at)}</span>
        <StatusPill status={item.review_status} />
      </div>
      <div style={{ fontSize: 13, color: '#475569' }}>
        Đánh giá {item.review_type === 'company' ? 'doanh nghiệp' : 'công việc'} #{item.review_id} ({formatRating(item.review_rating)}★): “{item.review_excerpt}”
        {' '}<button type="button" onClick={() => onOpen(item.review_type, item.review_id)} style={{ border: 'none', background: 'none', color: '#7565A8', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Xem chi tiết</button>
      </div>
      {item.description && <div style={{ fontSize: 13, whiteSpace: 'pre-line' }}>{item.description}</div>}
      {item.status === 'PENDING' ? (
        <>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú xử lý (bắt buộc, tối thiểu 5 ký tự)" aria-label="Ghi chú xử lý"
            style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13 }} />
          {error && <div role="alert" style={{ color: '#B91C1C', fontSize: 12.5 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {options.map(([a, text, v]) => <button key={a} type="button" style={btn(v)} disabled={busy} onClick={() => resolve(a)}>{text}</button>)}
          </div>
        </>
      ) : <div style={{ fontSize: 12.5, color: '#64748B' }}>Đã xử lý: {item.resolution_note}</div>}
    </div>
  );
}

/** Kiểm duyệt đánh giá doanh nghiệp / công việc */
export default function AdminReviewsPage({ currentUser, showToast }) {
  const token = currentUser?.token;
  const [queue, setQueue] = useState('PENDING');
  const [type, setType] = useState('company');
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [list, setList] = useState({ data: [], pagination: null, loading: true });
  const [selected, setSelected] = useState(null);
  const [closedStatus, setClosedStatus] = useState('REJECTED');

  const loadStats = useCallback(async () => {
    try { setStats((await reviewRequest('/admin/reviews/stats', { token })).data); } catch { setStats(null); }
  }, [token]);

  const loadList = useCallback(async () => {
    setList(l => ({ ...l, loading: true }));
    try {
      let path;
      if (queue === 'REPORTS' || queue === 'APPEALS') {
        path = `/admin/reviews/reports?kind=${queue === 'REPORTS' ? 'REPORT' : 'APPEAL'}&status=PENDING&page=${page}`;
      } else {
        const q = new URLSearchParams({ page: String(page) });
        if (queue === 'PENDING' || queue === 'PUBLISHED') q.set('status', queue);
        if (queue === 'CLOSED') q.set('status', closedStatus);
        if (queue === 'REPORTED') q.set('reported', 'true');
        path = `/admin/reviews/${type}?${q}`;
      }
      const r = await reviewRequest(path, { token });
      setList({ data: r.data, pagination: r.pagination, loading: false });
    } catch (e) {
      setList({ data: [], pagination: null, loading: false, error: e.message });
    }
  }, [token, queue, type, page, closedStatus]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadList(); }, [loadList]);
  const refresh = () => { loadStats(); loadList(); };
  const isReportQueue = queue === 'REPORTS' || queue === 'APPEALS';
  const badge = (key) => {
    if (!stats || !key) return null;
    const n = key === 'pending' ? stats.pending_company + stats.pending_job : stats[key];
    return n ? <span style={{ marginLeft: 6, background: '#DC2626', color: '#fff', borderRadius: 999, fontSize: 11, padding: '0 6px' }}>{n}</span> : null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Kiểm duyệt đánh giá</h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Đánh giá doanh nghiệp và đánh giá công việc của ứng viên. Mọi thao tác đều được ghi lịch sử kèm lý do.
          </p>
        </div>
        <button type="button" style={btn()} onClick={refresh}><RefreshCw size={14} /> Làm mới</button>
      </div>

      <div role="tablist" aria-label="Hàng đợi kiểm duyệt" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {QUEUES.map(([k, text, key]) => (
          <button key={k} type="button" role="tab" aria-selected={queue === k} onClick={() => { setQueue(k); setPage(1); setSelected(null); }}
            style={{ ...btn(queue === k ? 'primary' : 'outline'), borderRadius: 999 }}>
            {text}{badge(key === 'pending_reports' && k === 'REPORTED' ? null : key)}
          </button>
        ))}
      </div>

      {!isReportQueue && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['company', 'Đánh giá doanh nghiệp'], ['job', 'Đánh giá công việc']].map(([k, text]) => (
            <button key={k} type="button" aria-pressed={type === k} onClick={() => { setType(k); setPage(1); setSelected(null); }} style={btn(type === k ? 'primary' : 'outline')}>
              {text}{stats && queue === 'PENDING' ? ` (${k === 'company' ? stats.pending_company : stats.pending_job} chờ duyệt)` : ''}
            </button>
          ))}
          {queue === 'CLOSED' && (
            <select value={closedStatus} onChange={(e) => { setClosedStatus(e.target.value); setPage(1); }} aria-label="Trạng thái"
              style={{ padding: '7px 10px', borderRadius: 9, border: '1.5px solid #E2E8F0', fontSize: 13 }}>
              <option value="REJECTED">Bị từ chối</option>
              <option value="HIDDEN">Đang ẩn</option>
              <option value="REMOVED">Đã gỡ</option>
            </select>
          )}
        </div>
      )}

      <div className="admin-reviews-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          {list.loading ? <div aria-busy="true" style={{ color: '#94A3B8' }}>Đang tải…</div>
            : list.error ? <div role="alert" style={{ color: '#B91C1C' }}>{list.error}</div>
            : list.data.length === 0 ? <div style={{ ...card, textAlign: 'center', color: '#64748B' }}>Không có mục nào.</div>
            : isReportQueue ? list.data.map(item => (
              <ReportRow key={item.id} item={item} token={token} showToast={showToast} onDone={refresh} onOpen={(t, id) => setSelected({ type: t, id })} />
            )) : list.data.map(r => (
              <button key={r.id} type="button" onClick={() => setSelected({ type, id: r.id })}
                style={{ ...card, textAlign: 'left', cursor: 'pointer', borderColor: selected?.id === r.id && selected?.type === type ? '#7565A8' : 'var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <strong style={{ fontSize: 14, overflowWrap: 'anywhere' }}>{type === 'company' ? r.title : r.job_title}</strong>
                  <StatusPill status={r.status} />
                </div>
                <div style={{ fontSize: 12.5, color: '#475569', marginTop: 4 }}>
                  {formatRating(r.rating_overall)}★ · {EXPERIENCE_LABEL[r.experience_type]} · {r.is_verified ? 'đã xác thực' : 'chưa xác thực'} · {r.employer_name} · {r.reviewer_name}{r.is_anonymous ? ' (ẩn danh)' : ''} · {reviewDate(r.created_at)}
                </div>
                {(r.moderation_flags?.length > 0 || r.pending_reports > 0) && (
                  <div style={{ fontSize: 12, color: '#B45309', marginTop: 4 }}>
                    {r.moderation_flags.map(f => FLAG_LABEL[f] || f).join(', ')}{r.pending_reports > 0 ? `${r.moderation_flags.length ? ' · ' : ''}${r.pending_reports} báo cáo chờ xử lý` : ''}
                  </div>
                )}
              </button>
            ))}
          <Pager pagination={list.pagination} page={page} setPage={setPage} />
        </div>
        {selected && (
          <ReviewDetail key={`${selected.type}-${selected.id}`} type={selected.type} id={selected.id} token={token} showToast={showToast}
            onClose={() => setSelected(null)} onChanged={refresh} />
        )}
      </div>
    </div>
  );
}
