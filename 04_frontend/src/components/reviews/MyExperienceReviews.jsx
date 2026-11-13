import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Building2 } from 'lucide-react';
import MyReviewItem from './MyReviewItem';
import ReviewFormModal from './ReviewFormModal';
import { reviewRequest } from './reviewApi';

/** Danh sách đánh giá doanh nghiệp / công việc ứng viên đã gửi, kèm trạng thái kiểm duyệt (trang Sinh viên). */
export default function MyExperienceReviews({ currentUser, showToast, onSelectJob }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      const r = await reviewRequest('/reviews/mine', { token: currentUser?.token });
      setData(r.data);
    } catch {
      setError(true);
    }
  }, [currentUser?.token]);
  useEffect(() => { load(); }, [load]);

  const all = data ? [...data.company, ...data.job].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>Đánh giá doanh nghiệp & công việc của bạn</div>
      <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 10px 0' }}>
        Viết đánh giá tại trang doanh nghiệp (tab “Đánh giá”) hoặc trang chi tiết công việc bạn đã làm.
      </p>
      {error ? (
        <div role="alert" style={{ fontSize: 13, color: '#B91C1C' }}>
          Không tải được đánh giá của bạn. <button type="button" onClick={load} style={{ border: 'none', background: 'none', color: '#7565A8', fontWeight: 700, cursor: 'pointer' }}><RefreshCw size={13} /> Thử lại</button>
        </div>
      ) : !data ? (
        <div aria-busy="true" style={{ fontSize: 13, color: '#94A3B8' }}>Đang tải…</div>
      ) : all.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 12px', border: '1px dashed #E2E8F0', borderRadius: 12, color: '#64748B', fontSize: 13.5 }}>
          <Building2 size={22} color="#CBD5E1" style={{ display: 'block', margin: '0 auto 6px' }} />
          Bạn chưa gửi đánh giá doanh nghiệp hoặc công việc nào.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {all.map(r => (
            <MyReviewItem key={`${r.type}-${r.id}`} review={r} currentUser={currentUser} showToast={showToast} onChanged={load}
              onEdit={(rv) => setModal(rv)} onOpenJob={onSelectJob ? (id) => onSelectJob({ id }) : undefined} />
          ))}
        </div>
      )}
      {modal && (
        <ReviewFormModal isOpen onClose={() => setModal(null)} type={modal.type}
          targetId={modal.type === 'company' ? modal.employer_id : modal.job_id}
          targetName={modal.type === 'company' ? modal.employer_name : modal.job_title}
          existing={modal} verifiable={modal.is_verified ? [modal.experience_type] : []} currentUser={currentUser} showToast={showToast} onSaved={load} />
      )}
    </div>
  );
}
