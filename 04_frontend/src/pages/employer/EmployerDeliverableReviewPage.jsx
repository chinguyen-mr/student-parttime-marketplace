import React, { useEffect, useState } from 'react';
import { ExternalLink, CheckCircle2, RotateCcw, ArrowLeft, Clock, History, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';

const STATUS = {
  SUBMITTED: ['Chờ duyệt', '#1D4ED8', '#EFF6FF', '#BFDBFE'],
  REVISION_REQUESTED: ['Cần chỉnh sửa', '#B45309', '#FEF3C7', '#FDE68A'],
  ACCEPTED: ['Đã chấp nhận', '#047857', '#ECFDF5', '#A7F3D0'],
};
const WORK = { NOT_STARTED: 'Chưa nhận việc', IN_PROGRESS: 'Đang làm việc', COMPLETED: 'Đã hoàn thành', RESIGNED: 'Đã xin nghỉ', TERMINATED: 'Đã cho thôi việc' };
const fmt = (v) => (v ? new Date(v).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
const card = { background: '#fff', border: '1px solid var(--color-border)', borderRadius: 14, padding: '18px 20px' };

/**
 * WF-E10: Nhà tuyển dụng xem tiến độ công việc và duyệt sản phẩm bàn giao của sinh viên.
 * Dữ liệu lưu DB: work_progress, work_deliverables, deliverable_reviews.
 */
export default function EmployerDeliverableReviewPage({ currentUser, assignment, onBack, showToast }) {
  const [state, setState] = useState({ loading: true, error: null, progress: [], deliverables: [] });
  const [reasons, setReasons] = useState({});
  const [busy, setBusy] = useState(null);

  const api = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}/assignments/${assignment.id}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Thao tác thất bại');
    return data.data;
  };

  const load = async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const [progress, deliverables] = await Promise.all([api('/progress'), api('/deliverables')]);
      setState({ loading: false, error: null, progress, deliverables });
    } catch (err) {
      setState({ loading: false, error: formatApiError(err, 'Không tải được tiến độ'), progress: [], deliverables: [] });
    }
  };
  useEffect(() => { if (assignment?.id) load(); }, [assignment?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!assignment) {
    return (
      <div style={card}>
        Chưa chọn hợp đồng. <Button variant="secondary" onClick={onBack}>Quay lại danh sách</Button>
      </div>
    );
  }

  const review = async (d, decision) => {
    const comment = (reasons[d.id] || '').trim();
    if (decision === 'REVISION_REQUESTED' && comment.length < 5) { showToast?.('Vui lòng nhập lý do yêu cầu chỉnh sửa (tối thiểu 5 ký tự)', 'error'); return; }
    setBusy(`${d.id}-${decision}`);
    try {
      await api(`/deliverables/${d.id}/review`, { method: 'POST', body: JSON.stringify({ decision, comment }) });
      await load();
      showToast?.(decision === 'ACCEPTED' ? `Đã chấp nhận phiên bản v${d.version_no}` : `Đã yêu cầu chỉnh sửa v${d.version_no}`, 'success');
    } catch (err) { showToast?.(formatApiError(err), 'error'); } finally { setBusy(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 60 }}>
      <div>
        <button type="button" onClick={onBack} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <ArrowLeft size={15} /> Quay lại Quản lý hợp đồng
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 4px' }}>Tiến độ & sản phẩm bàn giao</h1>
        <div style={{ fontSize: 13.5, color: 'var(--color-text-secondary)' }}>
          Hợp đồng #{assignment.id} · <b>{assignment.job_title}</b> · Sinh viên <b>{assignment.student_name}</b> · {WORK[assignment.status] || assignment.status}
        </div>
      </div>

      {state.loading && <div style={{ ...card, color: '#64748B' }}><Loader2 size={16} className="animate-spin" /> Đang tải…</div>}
      {state.error && (
        <div style={{ ...card, color: '#B91C1C' }} role="alert">
          <AlertTriangle size={16} /> {state.error} <Button variant="secondary" onClick={load} style={{ marginLeft: 8 }}>Thử lại</Button>
        </div>
      )}

      {!state.loading && !state.error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 18, alignItems: 'start' }}>
          {/* Sản phẩm bàn giao */}
          <section style={card}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <History size={17} color="#7565A8" /> Sản phẩm bàn giao ({state.deliverables.length})
            </h2>
            {state.deliverables.length === 0 && <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>Sinh viên chưa nộp phiên bản nào.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {state.deliverables.map(d => {
                const [label, color, bg, border] = STATUS[d.status] || [d.status, '#475569', '#F1F5F9', '#E2E8F0'];
                return (
                  <div key={d.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--color-primary)' }}>Phiên bản v{d.version_no}</strong>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color, background: bg, border: `1px solid ${border}`, padding: '2px 9px', borderRadius: 999 }}>{label}</span>
                    </div>
                    <a href={d.file_key} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 13, color: '#7565A8', fontWeight: 600, wordBreak: 'break-all' }}>
                      <ExternalLink size={13} /> {d.file_key}
                    </a>
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#334155' }}>{d.description}</p>
                    <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}><Clock size={11} /> Nộp lúc {fmt(d.submitted_at)}</div>
                    {d.review_comment && (
                      <div style={{ marginTop: 6, fontSize: 12.5, color: d.review_decision === 'ACCEPTED' ? '#047857' : '#B45309' }}>
                        Nhận xét ({fmt(d.reviewed_at)}): {d.review_comment}
                      </div>
                    )}
                    {d.status === 'SUBMITTED' && (
                      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <textarea rows={2} maxLength={1000} value={reasons[d.id] || ''} onChange={(e) => setReasons(r => ({ ...r, [d.id]: e.target.value }))}
                          placeholder="Nhận xét (bắt buộc khi yêu cầu chỉnh sửa)" aria-label="Nhận xét"
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Button variant="success" disabled={Boolean(busy)} onClick={() => review(d, 'ACCEPTED')} style={{ padding: '7px 14px', fontSize: 12.5, gap: 6 }}>
                            <CheckCircle2 size={14} /> Chấp nhận
                          </Button>
                          <Button variant="secondary" disabled={Boolean(busy)} onClick={() => review(d, 'REVISION_REQUESTED')} style={{ padding: '7px 14px', fontSize: 12.5, gap: 6 }}>
                            <RotateCcw size={14} /> Yêu cầu chỉnh sửa
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tiến độ công việc */}
          <section style={card}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px' }}>Nhật ký tiến độ ({state.progress.length})</h2>
            {state.progress.length === 0 && <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>Chưa có cập nhật tiến độ.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {state.progress.map(p => (
                <div key={p.id} style={{ borderLeft: `3px solid ${p.updated_by_role === 'EMPLOYER' ? '#F4B99D' : '#7565A8'}`, padding: '4px 0 4px 12px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>
                    {p.description}{p.progress_percent !== null && p.progress_percent !== undefined ? ` (${p.progress_percent}%)` : ''}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                    {p.updated_by_role === 'EMPLOYER' ? 'Nhà tuyển dụng' : 'Sinh viên'} ({p.updated_by_name}) · {fmt(p.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
