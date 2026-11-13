import React from 'react';
import { ShieldCheck } from 'lucide-react';
import RatingStars from './RatingStars';
import { formatRating, distributionPercent } from '../../utils/reviewDisplay';

/** Tóm tắt điểm: điểm tổng, số lượt, phân phối 1–5 sao, điểm từng tiêu chí. Chỉ dùng khi total > 0. */
export default function ReviewSummary({ summary, criteria, compact = false }) {
  if (!summary?.total) return null;
  const { total, average_overall: avg, distribution, verified_count: verified } = summary;
  const criteriaRows = criteria.filter(([k]) => k !== 'rating_overall' && summary.criteria?.[k] !== null && summary.criteria?.[k] !== undefined);
  return (
    <div className="review-summary">
      <div className="review-summary-score">
        <div style={{ fontSize: compact ? 34 : 42, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{formatRating(avg)}</div>
        <RatingStars value={avg} size={compact ? 15 : 18} />
        <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>{total} đánh giá đã duyệt</div>
        {verified > 0 && (
          <div style={{ fontSize: 12, color: '#047857', marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <ShieldCheck size={12} /> {verified} có trải nghiệm xác thực
          </div>
        )}
      </div>
      <div className="review-summary-dist" aria-label="Phân phối số sao">
        {[5, 4, 3, 2, 1].map(star => {
          const pct = distributionPercent(distribution, star, total);
          return (
            <div key={star} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 34px', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#475569' }}>
              <span>{star} ★</span>
              <span style={{ height: 8, borderRadius: 999, background: '#F1F5F9', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: `${pct}%`, background: '#F59E0B', borderRadius: 999 }} />
              </span>
              <span style={{ textAlign: 'right', color: '#64748B' }}>{distribution?.[star] || 0}</span>
            </div>
          );
        })}
      </div>
      {criteriaRows.length > 0 && (
        <div className="review-summary-criteria">
          {criteriaRows.map(([k, label]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155', padding: '4px 0' }}>
              <span style={{ minWidth: 0 }}>{label}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <RatingStars value={summary.criteria[k]} size={12} />
                <strong style={{ width: 28, textAlign: 'right' }}>{formatRating(summary.criteria[k])}</strong>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
