import React, { useCallback, useEffect, useState } from 'react';
import { PenLine, Star } from 'lucide-react';
import ReviewSummary from './ReviewSummary';
import ReviewCard from './ReviewCard';
import ReviewFormModal from './ReviewFormModal';
import MyReviewItem from './MyReviewItem';
import ReportViolationModal from '../forms/ReportViolationModal';
import { reviewRequest } from './reviewApi';
import { JOB_CRITERIA } from '../../utils/reviewDisplay';

const box = { background: '#ffffff', borderRadius: 14, border: '1px solid #EAE5F0', padding: '20px 22px', boxShadow: '0 1px 3px rgba(89, 70, 117, 0.03)' };

/**
 * Đánh giá công việc trên trang chi tiết việc làm.
 * Không có đánh giá đã duyệt và người xem không đủ điều kiện viết → không hiển thị gì (không tạo điểm giả).
 */
export default function JobReviewsSection({ jobId, jobTitle, currentUser, onOpenAuth, showToast }) {
  const [summary, setSummary] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [list, setList] = useState({ data: [], pagination: null });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const token = currentUser?.token;

  const loadBase = useCallback(async () => {
    if (!jobId) return;
    try {
      const [s, e] = await Promise.all([
        reviewRequest(`/reviews/jobs/${jobId}/summary`),
        reviewRequest(`/reviews/jobs/${jobId}/eligibility`, { token }),
      ]);
      setSummary(s.data);
      setEligibility(e.data);
    } catch {
      setSummary(null); // lỗi tải → ẩn khu vực, không chặn trang chi tiết
    }
  }, [jobId, token]);
  useEffect(() => { setPage(1); loadBase(); }, [loadBase]);

  useEffect(() => {
    if (!summary?.total) return undefined;
    let alive = true;
    reviewRequest(`/reviews/jobs/${jobId}/job-reviews?page=${page}&limit=3`)
      .then(r => alive && setList(prev => ({ data: page === 1 ? r.data : [...prev.data, ...r.data], pagination: r.pagination })))
      .catch(() => {});
    return () => { alive = false; };
  }, [jobId, page, summary]);

  if (!summary) return null;
  const canWrite = eligibility?.can_review;
  const mine = eligibility?.existing;
  if (!summary.total && !canWrite && !mine) return null;

  return (
    <section id="job-reviews-section" style={box} aria-labelledby="h-job-reviews">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <h4 id="h-job-reviews" style={{ fontSize: 14, fontWeight: 800, color: '#30283A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={16} color="#F59E0B" /> Đánh giá công việc từ người đã làm
        </h4>
        {canWrite && (
          <button type="button" onClick={() => (token ? setModal({ existing: null }) : onOpenAuth?.('login'))}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', background: '#7565A8', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <PenLine size={14} /> Đánh giá công việc này
          </button>
        )}
      </div>

      {mine && (
        <div style={{ border: '1px solid #DDD6FE', background: '#FBFAFE', borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#594675', marginBottom: 8 }}>Đánh giá của bạn</div>
          <MyReviewItem review={mine} currentUser={currentUser} showToast={showToast} onChanged={loadBase} onEdit={(r) => setModal({ existing: r })} />
        </div>
      )}

      {summary.total > 0 ? (
        <>
          <ReviewSummary summary={summary} criteria={JOB_CRITERIA} compact />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {list.data.map(r => <ReviewCard key={r.id} review={r} onReport={token ? setReportTarget : undefined} />)}
          </div>
          {list.pagination && page < list.pagination.totalPages && (
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button type="button" onClick={() => setPage(p => p + 1)}
                style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #CBD5E1', background: '#fff', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Xem thêm đánh giá ({list.pagination.total - list.data.length})
              </button>
            </div>
          )}
        </>
      ) : (
        !mine && <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Công việc chưa có đánh giá nào được duyệt. Bạn đã làm công việc này — hãy chia sẻ trải nghiệm để giúp các ứng viên khác.</p>
      )}

      {modal && (
        <ReviewFormModal isOpen onClose={() => setModal(null)} type="job" targetId={jobId} targetName={jobTitle}
          existing={modal.existing} currentUser={currentUser} showToast={showToast} onSaved={loadBase} />
      )}
      <ReportViolationModal isOpen={Boolean(reportTarget)} onClose={() => setReportTarget(null)} targetType="JOB_REVIEW"
        targetId={reportTarget?.id} targetTitle={jobTitle} currentUser={currentUser} showToast={showToast} onOpenAuth={onOpenAuth} />
    </section>
  );
}
