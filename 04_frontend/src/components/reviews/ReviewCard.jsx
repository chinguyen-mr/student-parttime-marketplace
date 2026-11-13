import React, { useState } from 'react';
import { ShieldCheck, Flag, MessageSquareReply, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import RatingStars from './RatingStars';
import { EXPERIENCE_LABEL, COMPANY_CRITERIA, JOB_CRITERIA, reviewDate, formatRating } from '../../utils/reviewDisplay';

const chip = (bg, color, border) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: bg, color, border: `1px solid ${border}` });
const textStyle = { fontSize: 14, color: '#334155', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line', overflowWrap: 'anywhere' };

function Labeled({ label, color, children }) {
  if (!children) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 2 }}>{label}</div>
      <p style={textStyle}>{children}</p>
    </div>
  );
}

/**
 * Một đánh giá công khai. Nội dung luôn render dạng text (React tự escape) — không dùng HTML.
 * onReport: hiện nút báo cáo; onOpenJob: bấm tên công việc (job review) để mở tin.
 */
export default function ReviewCard({ review, onReport, onOpenJob, children }) {
  const [showCriteria, setShowCriteria] = useState(false);
  const isCompany = review.type === 'company';
  const criteria = (isCompany ? COMPANY_CRITERIA : JOB_CRITERIA).filter(([k]) => k !== 'rating_overall');
  return (
    <article style={{ border: '1px solid #EEF0F4', borderRadius: 14, padding: '16px 18px', background: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <RatingStars value={review.rating_overall} size={15} />
        <strong style={{ fontSize: 13.5, color: 'var(--color-text)' }}>{formatRating(review.rating_overall)}</strong>
        <span style={chip('#F1EEF8', '#594675', '#DDD6FE')}>{EXPERIENCE_LABEL[review.experience_type]}</span>
        {review.is_verified && (
          <span style={chip('#ECFDF5', '#047857', '#A7F3D0')} title="Hệ thống đã đối chiếu trải nghiệm này với dữ liệu ứng tuyển / công việc trên JobNest">
            <ShieldCheck size={12} /> Trải nghiệm đã xác thực
          </span>
        )}
      </div>

      {!isCompany && review.job_title && (
        <div style={{ marginTop: 8, fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Briefcase size={13} /> Đánh giá công việc:&nbsp;
          {onOpenJob
            ? <button type="button" onClick={() => onOpenJob(review.job_id)} style={{ border: 'none', background: 'none', padding: 0, color: '#7565A8', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>{review.job_title}</button>
            : <strong>{review.job_title}</strong>}
        </div>
      )}

      {isCompany && <h4 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--color-text)', margin: '10px 0 0 0', overflowWrap: 'anywhere' }}>{review.title}</h4>}
      {isCompany ? (
        <>
          <Labeled label="Ưu điểm" color="#047857">{review.pros}</Labeled>
          <Labeled label="Hạn chế" color="#B45309">{review.cons}</Labeled>
          <Labeled label="Lời khuyên cho ứng viên" color="#594675">{review.advice}</Labeled>
        </>
      ) : (
        <p style={{ ...textStyle, marginTop: 8 }}>{review.content}</p>
      )}

      <button type="button" onClick={() => setShowCriteria(v => !v)} aria-expanded={showCriteria}
        style={{ marginTop: 10, border: 'none', background: 'none', padding: 0, color: '#7565A8', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {showCriteria ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Điểm theo tiêu chí
      </button>
      {showCriteria && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '4px 18px', marginTop: 6 }}>
          {criteria.map(([k, label]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12.5, color: '#475569' }}>
              <span>{label}</span><RatingStars value={review[k]} size={12} />
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12, color: '#94A3B8' }}>
        <span>
          {review.author_name || 'Ứng viên ẩn danh'} · {reviewDate(review.published_at)}{review.edited ? ' · đã chỉnh sửa' : ''}
        </span>
        {onReport && (
          <button type="button" onClick={() => onReport(review)}
            style={{ border: 'none', background: 'none', padding: 0, color: '#94A3B8', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Flag size={12} /> Báo cáo
          </button>
        )}
      </div>

      {review.reply && (
        <div style={{ marginTop: 12, background: '#F8F7FB', borderLeft: '3px solid #7565A8', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#594675', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <MessageSquareReply size={13} /> Phản hồi từ nhà tuyển dụng · <span style={{ fontWeight: 500, color: '#94A3B8' }}>{reviewDate(review.reply.updated_at)}</span>
          </div>
          <p style={{ ...textStyle, fontSize: 13.5 }}>{review.reply.content}</p>
        </div>
      )}
      {children}
    </article>
  );
}
