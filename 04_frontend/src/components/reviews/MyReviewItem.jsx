import React, { useState } from 'react';
import { Pencil, Scale, Loader2, Building2 } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { reviewRequest } from './reviewApi';
import { STATUS_LABEL } from '../../utils/reviewDisplay';

/** Đánh giá của chính ứng viên: trạng thái kiểm duyệt, lý do, sửa, khiếu nại. */
export default function MyReviewItem({ review, currentUser, onEdit, onChanged, onOpenCompany, onOpenJob, showToast }) {
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [text, color, bg] = STATUS_LABEL[review.status] || STATUS_LABEL.PENDING;

  const sendAppeal = async () => {
    setError('');
    if (appealText.trim().length < 20) { setError('Nội dung khiếu nại cần tối thiểu 20 ký tự'); return; }
    setSending(true);
    try {
      const res = await reviewRequest(`/reviews/${review.type}/${review.id}/appeal`, { method: 'POST', token: currentUser?.token, body: { description: appealText } });
      showToast?.(res.message, 'success');
      setAppealOpen(false);
      setAppealText('');
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color, background: bg, padding: '3px 10px', borderRadius: 999 }}>{text}</span>
          {review.employer_name && (
            onOpenCompany
              ? <button type="button" onClick={() => onOpenCompany(review.employer_id)} style={{ border: 'none', background: 'none', padding: 0, color: '#7565A8', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Building2 size={13} /> {review.employer_name}</button>
              : <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{review.employer_name}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {review.can_edit && (
            <button type="button" onClick={() => onEdit(review)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #7565A8', background: '#fff', color: '#7565A8', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
              <Pencil size={13} /> Sửa ({review.edits_left} lần còn lại)
            </button>
          )}
          {review.can_appeal && !appealOpen && (
            <button type="button" onClick={() => setAppealOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', background: '#fff', color: '#334155', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
              <Scale size={13} /> Khiếu nại
            </button>
          )}
        </div>
      </div>

      {review.status === 'PENDING' && (
        <div style={{ fontSize: 12.5, color: '#92400E' }}>
          {review.is_verified ? 'Nội dung cần được kiểm duyệt trước khi hiển thị.' : 'Trải nghiệm chưa được xác thực nên đánh giá cần quản trị viên duyệt trước khi hiển thị.'}
        </div>
      )}
      {review.moderation_reason && (
        <div style={{ fontSize: 12.5, color: '#B91C1C', background: '#FEF2F2', borderRadius: 8, padding: '8px 10px' }}>Lý do từ quản trị viên: {review.moderation_reason}</div>
      )}
      {review.pending_appeal && <div style={{ fontSize: 12.5, color: '#475569' }}>Khiếu nại của bạn đang chờ quản trị viên xem xét.</div>}

      {appealOpen && (
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
          <label htmlFor={`appeal-${review.type}-${review.id}`} style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>Nội dung khiếu nại</label>
          <textarea id={`appeal-${review.type}-${review.id}`} rows={3} value={appealText} onChange={(e) => setAppealText(e.target.value)}
            placeholder="Giải thích vì sao bạn cho rằng đánh giá nên được hiển thị lại (20–1000 ký tự)"
            style={{ width: '100%', boxSizing: 'border-box', marginTop: 6, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontFamily: 'inherit', fontSize: 13.5 }} />
          {error && <div role="alert" style={{ color: '#B91C1C', fontSize: 12.5, marginTop: 4 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => { setAppealOpen(false); setError(''); }} style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Hủy</button>
            <button type="button" onClick={sendAppeal} disabled={sending} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#7565A8', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {sending && <Loader2 size={13} className="animate-spin" />} Gửi khiếu nại
            </button>
          </div>
        </div>
      )}

      <ReviewCard
        review={{ ...review, published_at: review.published_at || review.created_at, author_name: review.is_anonymous ? 'Bạn (đăng ẩn danh)' : review.author_name }}
        onOpenJob={onOpenJob}
      />
    </div>
  );
}
