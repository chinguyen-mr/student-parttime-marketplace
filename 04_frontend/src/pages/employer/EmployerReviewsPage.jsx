import React, { useCallback, useEffect, useState } from 'react';
import { Star, MessageSquare, Bell, Briefcase, RefreshCw, Flag, Loader2, Trash2, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import ReviewSummary from '../../components/reviews/ReviewSummary';
import ReviewCard from '../../components/reviews/ReviewCard';
import ReportViolationModal from '../../components/forms/ReportViolationModal';
import { reviewRequest } from '../../components/reviews/reviewApi';
import { COMPANY_CRITERIA, JOB_CRITERIA, formatRating } from '../../utils/reviewDisplay';

const card = { background: '#ffffff', borderRadius: 14, border: '1px solid var(--color-border)', padding: '18px 20px', boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)' };
const btn = (primary) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
  border: primary ? 'none' : '1.5px solid #CBD5E1', background: primary ? '#7565A8' : '#fff', color: primary ? '#fff' : '#334155' });

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div style={{ ...card, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', fontSize: 12.5, fontWeight: 700 }}><Icon size={15} color="#7565A8" /> {label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', marginTop: 6 }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

// Phản hồi của doanh nghiệp cho một đánh giá (tạo / sửa / xóa)
function ReplyEditor({ review, type, token, onSaved, showToast }) {
  const mine = review.my_reply;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(mine?.content || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (mine?.status === 'HIDDEN') {
    return <div style={{ marginTop: 10, fontSize: 12.5, color: '#B91C1C' }}>Phản hồi của bạn đã bị quản trị viên ẩn do vi phạm quy định.</div>;
  }
  const save = async () => {
    setError('');
    if (text.trim().length < 10) { setError('Phản hồi cần tối thiểu 10 ký tự'); return; }
    setBusy(true);
    try {
      await reviewRequest(`/reviews/${type}/${review.id}/reply`, { method: 'PUT', token, body: { content: text } });
      showToast?.('Đã lưu phản hồi', 'success');
      setOpen(false);
      onSaved();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!window.confirm('Xóa phản hồi này?')) return;
    setBusy(true);
    try {
      await reviewRequest(`/reviews/${type}/${review.id}/reply`, { method: 'DELETE', token });
      showToast?.('Đã xóa phản hồi', 'success');
      setText('');
      onSaved();
    } catch (err) { showToast?.(err.message, 'error'); } finally { setBusy(false); }
  };

  if (!open) {
    return (
      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" style={btn(!mine)} onClick={() => { setText(mine?.content || ''); setOpen(true); }}>
          <MessageSquare size={13} /> {mine ? 'Sửa phản hồi' : 'Phản hồi đánh giá'}
        </button>
        {mine && <button type="button" style={btn(false)} onClick={remove} disabled={busy}><Trash2 size={13} /> Xóa phản hồi</button>}
      </div>
    );
  }
  return (
    <div style={{ marginTop: 10 }}>
      <label htmlFor={`reply-${type}-${review.id}`} style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>Phản hồi công khai của doanh nghiệp ({text.length}/2000)</label>
      <textarea id={`reply-${type}-${review.id}`} rows={3} value={text} maxLength={2000} onChange={(e) => setText(e.target.value)}
        placeholder="Cảm ơn góp ý, giải thích hoặc nêu hướng cải thiện. Không công khai thông tin cá nhân của ứng viên."
        style={{ width: '100%', boxSizing: 'border-box', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontFamily: 'inherit', fontSize: 13.5 }} />
      {error && <div role="alert" style={{ color: '#B91C1C', fontSize: 12.5 }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
        <button type="button" style={btn(false)} onClick={() => setOpen(false)} disabled={busy}>Hủy</button>
        <button type="button" style={btn(true)} onClick={save} disabled={busy}>{busy && <Loader2 size={13} className="animate-spin" />} Lưu phản hồi</button>
      </div>
    </div>
  );
}

const monthLabel = (m) => { const [y, mo] = m.split('-'); return `${mo}/${y}`; };

/** WF-E: Quản lý đánh giá — Employer chỉ xem, phản hồi và báo cáo; không sửa/xóa đánh giá của ứng viên. */
export default function EmployerReviewsPage({ currentUser, showToast }) {
  const token = currentUser?.token;
  const [overview, setOverview] = useState(null);
  const [state, setState] = useState('loading');
  const [type, setType] = useState('company');
  const [replied, setReplied] = useState('');
  const [page, setPage] = useState(1);
  const [list, setList] = useState({ data: [], pagination: null, loading: true });
  const [reportTarget, setReportTarget] = useState(null);

  const loadOverview = useCallback(async () => {
    try {
      const r = await reviewRequest('/reviews/employer/overview', { token });
      setOverview(r.data);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [token]);
  useEffect(() => { loadOverview(); }, [loadOverview]);

  const loadList = useCallback(async () => {
    setList(l => ({ ...l, loading: true }));
    const q = new URLSearchParams({ page: String(page), limit: '10' });
    if (replied) q.set('replied', replied);
    try {
      const r = await reviewRequest(`/reviews/employer/${type}?${q}`, { token });
      setList({ data: r.data, pagination: r.pagination, loading: false });
    } catch {
      setList({ data: [], pagination: null, loading: false, error: true });
    }
  }, [token, type, replied, page]);
  useEffect(() => { loadList(); }, [loadList]);

  const refreshAll = () => { loadOverview(); loadList(); };

  if (state === 'loading') return <div aria-busy="true" style={{ color: '#94A3B8' }}>Đang tải đánh giá…</div>;
  if (state === 'error') {
    return (
      <div role="alert" style={{ ...card, textAlign: 'center' }}>
        Không tải được dữ liệu đánh giá. <button type="button" style={btn(false)} onClick={loadOverview}><RefreshCw size={13} /> Thử lại</button>
      </div>
    );
  }

  const c = overview.company;
  const j = overview.jobs;
  const months = [...new Set(overview.monthly.map(m => m.month))];
  const monthRow = (kind, m) => overview.monthly.find(x => x.kind === kind && x.month === m);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Đánh giá từ ứng viên</h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={14} /> Bạn có thể phản hồi công khai hoặc báo cáo đánh giá vi phạm. Doanh nghiệp không thể sửa hay xóa đánh giá của ứng viên.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        <StatCard icon={Star} label="Điểm doanh nghiệp" value={c.total ? `${formatRating(c.average_overall)} / 5` : '—'} hint={c.total ? `${c.total} đánh giá doanh nghiệp` : 'Chưa có đánh giá được duyệt'} />
        <StatCard icon={Briefcase} label="Điểm công việc" value={j.total ? `${formatRating(j.average_overall)} / 5` : '—'} hint={j.total ? `${j.total} đánh giá công việc` : 'Chưa có đánh giá được duyệt'} />
        <StatCard icon={Bell} label="Đánh giá mới (30 ngày)" value={overview.new_last_30_days} />
        <StatCard icon={MessageSquare} label="Chưa phản hồi" value={overview.unreplied} />
      </div>

      {c.total > 0 && (
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px 0' }}>Điểm doanh nghiệp theo tiêu chí</h2>
          <ReviewSummary summary={c} criteria={COMPANY_CRITERIA} compact />
        </div>
      )}
      {j.total > 0 && (
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px 0' }}>Điểm công việc theo tiêu chí (tính riêng)</h2>
          <ReviewSummary summary={j} criteria={JOB_CRITERIA} compact />
        </div>
      )}

      {months.length > 0 && (
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 10px 0' }}>Thống kê theo tháng (12 tháng gần nhất)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '6px 8px' }}>Tháng</th>
                  <th style={{ padding: '6px 8px' }}>Đánh giá doanh nghiệp</th>
                  <th style={{ padding: '6px 8px' }}>Đánh giá công việc</th>
                </tr>
              </thead>
              <tbody>
                {months.map(m => {
                  const cr = monthRow('company', m);
                  const jr = monthRow('job', m);
                  const cell = (r) => (r ? `${r.total} lượt · TB ${formatRating(r.average)}★` : '—');
                  return (
                    <tr key={m} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 700 }}>{monthLabel(m)}</td>
                      <td style={{ padding: '6px 8px' }}>{cell(cr)}</td>
                      <td style={{ padding: '6px 8px' }}>{cell(jr)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <div role="tablist" aria-label="Loại đánh giá" style={{ display: 'flex', gap: 6 }}>
            {[['company', 'Đánh giá doanh nghiệp'], ['job', 'Đánh giá công việc']].map(([k, text]) => (
              <button key={k} type="button" role="tab" aria-selected={type === k} onClick={() => { setType(k); setPage(1); }}
                style={{ ...btn(type === k), borderRadius: 999 }}>{text}</button>
            ))}
          </div>
          <select value={replied} onChange={(e) => { setReplied(e.target.value); setPage(1); }} aria-label="Lọc theo phản hồi"
            style={{ padding: '7px 10px', borderRadius: 9, border: '1.5px solid #E2E8F0', fontSize: 13, fontWeight: 600 }}>
            <option value="">Tất cả</option>
            <option value="no">Chưa phản hồi</option>
            <option value="yes">Đã phản hồi</option>
          </select>
        </div>

        {list.loading ? <div aria-busy="true" style={{ color: '#94A3B8', fontSize: 13 }}>Đang tải…</div>
          : list.error ? <div role="alert" style={{ color: '#B91C1C', fontSize: 13 }}>Không tải được danh sách. <button type="button" style={btn(false)} onClick={loadList}>Thử lại</button></div>
          : list.data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', border: '1px dashed #E2E8F0', borderRadius: 12, color: '#64748B', fontSize: 13.5 }}>
              {replied ? 'Không có đánh giá phù hợp bộ lọc.' : 'Chưa có đánh giá nào được duyệt.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {list.data.map(r => (
                <ReviewCard key={r.id} review={{ ...r, reply: null }}>
                  {r.my_reply && r.my_reply.status === 'VISIBLE' && (
                    <div style={{ marginTop: 10, background: '#F8F7FB', borderLeft: '3px solid #7565A8', borderRadius: 8, padding: '8px 10px', fontSize: 13.5, color: '#334155', whiteSpace: 'pre-line' }}>
                      <strong style={{ fontSize: 12, color: '#594675' }}>Phản hồi của bạn:</strong><br />{r.my_reply.content}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                    <ReplyEditor review={r} type={type} token={token} onSaved={refreshAll} showToast={showToast} />
                    <div style={{ marginTop: 10 }}>
                      {r.my_report_pending
                        ? <span style={{ fontSize: 12, color: '#B45309' }}>Đã báo cáo – chờ quản trị viên xử lý</span>
                        : <button type="button" style={btn(false)} onClick={() => setReportTarget(r)}><Flag size={13} /> Báo cáo vi phạm</button>}
                    </div>
                  </div>
                </ReviewCard>
              ))}
            </div>
          )}

        {list.pagination?.totalPages > 1 && (
          <nav aria-label="Phân trang" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <button type="button" style={btn(false)} disabled={page <= 1} onClick={() => setPage(p => p - 1)} aria-label="Trang trước"><ChevronLeft size={14} /></button>
            <span style={{ fontSize: 13, color: '#475569' }}>Trang {page}/{list.pagination.totalPages}</span>
            <button type="button" style={btn(false)} disabled={page >= list.pagination.totalPages} onClick={() => setPage(p => p + 1)} aria-label="Trang sau"><ChevronRight size={14} /></button>
          </nav>
        )}
      </div>

      <ReportViolationModal
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetType={type === 'job' ? 'JOB_REVIEW' : 'COMPANY_REVIEW'}
        targetId={reportTarget?.id}
        targetTitle={reportTarget ? (reportTarget.title || reportTarget.job_title) : ''}
        currentUser={currentUser}
        showToast={showToast}
        onSubmitted={loadList}
      />
    </div>
  );
}
