import React, { useState, useEffect } from 'react';
import { Star, Award, CheckCircle2, AlertCircle, ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { Button } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';

export default function EmployerReviewStudentPage({
  currentUser,
  assignment,
  onBack,
  onSuccess,
  showToast
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedAssignments, setCompletedAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(assignment || null);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchCompletedAssignments = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${currentUser?.token}` };
        const res = await fetch(`${API_BASE}/assignments/employer-assignments`, { headers });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          // Filter COMPLETED assignments
          const done = data.data.filter(a => a.status === 'COMPLETED');
          setCompletedAssignments(done);
          if (!selectedAssignment && done.length > 0) {
            setSelectedAssignment(done[0]);
          }
        }
      } catch (err) {
        console.warn('Could not fetch completed assignments from API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedAssignments();
  }, [currentUser]);

  // Fallback demo data if no completed assignment yet
  const displayAssignments = completedAssignments.length > 0 ? completedAssignments : [
    {
      id: 588,
      student_id: 2,
      student_name: 'Nguyễn Văn Chi',
      job_title: 'Dự án Thiết kế UI Website E-commerce',
      status: 'COMPLETED'
    }
  ];

  const currentItem = selectedAssignment || displayAssignments[0];

  const handleSubmitReview = async (e) => {
    e?.preventDefault();
    if (!comment.trim()) {
      if (showToast) showToast('Vui lòng nhập nhận xét chi tiết về sinh viên', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          work_assignment_id: currentItem.id,
          reviewee_id: currentItem.student_id || 2,
          rating: Number(rating),
          comment: comment.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(`Đã gửi đánh giá ${rating} sao cho ${currentItem.student_name} thành công!`, 'success');
        setComment('');
        if (onSuccess) onSuccess();
      } else {
        if (showToast) showToast(data.message || 'Lỗi gửi đánh giá sinh viên', 'error');
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Lỗi gửi đánh giá sinh viên'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            WF-E11 — REVIEW STUDENT
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0 0' }}>
            Đánh giá & Nhận xét Sinh viên sau hoàn thành
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: 13.5, color: 'var(--color-text-secondary)' }}>
            Chỉ áp dụng cho các Work Assignment đã chuyển sang trạng thái COMPLETED và chưa được đánh giá.
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              background: '#ffffff',
              border: '1.5px solid #000000',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ArrowLeft size={15} /> Quay lại
          </button>
        )}
      </div>

      {/* Main Table: Assignment COMPLETED chưa đánh giá */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1.5px solid #000000',
        padding: 24,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#000000', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #E2E8F0' }}>
          Assignment COMPLETED chưa đánh giá
        </div>

        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #000000' }}>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Student</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Công việc</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'right' }}>Chọn đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {displayAssignments.map((a, idx) => {
                const isCurrent = currentItem.id === a.id;
                return (
                  <tr
                    key={a.id || idx}
                    onClick={() => setSelectedAssignment(a)}
                    style={{
                      borderBottom: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      background: isCurrent ? '#F0FDF4' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A' }}>
                      {a.student_name || 'Nguyễn Văn Chi'}
                    </td>
                    <td style={{ padding: '14px', color: '#475569' }}>
                      {a.job_title}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 700,
                        background: isCurrent ? '#059669' : '#F1F5F9',
                        color: isCurrent ? '#ffffff' : '#334155'
                      }}>
                        {isCurrent ? '● Đang chọn' : 'Chọn việc này'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Box Đánh giá */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: 12,
          border: '1.5px solid #000000',
          padding: 24
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#000000', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="#D97706" />
            <span>Đánh giá cho: {currentItem.student_name} ({currentItem.job_title})</span>
          </div>

          <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* 5 Star Interactive Rating */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
                Số sao (C10 TBD)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 2,
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <Star
                        size={28}
                        fill={isFilled ? '#F59E0B' : 'none'}
                        color={isFilled ? '#F59E0B' : '#CBD5E1'}
                      />
                    </button>
                  );
                })}
                <span style={{ fontSize: 15, fontWeight: 800, color: '#F59E0B', marginLeft: 8 }}>
                  {rating} / 5 sao
                </span>
              </div>
            </div>

            {/* Nhận xét */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
                Nhận xét
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhận xét chi tiết về thái độ, kỹ năng, tinh thần trách nhiệm và chất lượng sản phẩm..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #000000',
                  fontSize: 13.5,
                  outline: 'none',
                  resize: 'vertical',
                  background: '#ffffff'
                }}
              />
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#000000',
                  color: '#ffffff',
                  border: '1.5px solid #000000',
                  borderRadius: 8,
                  padding: '11px 26px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: submitting ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Send size={16} />
                <span>{submitting ? 'Đang gửi...' : 'Gửi đánh giá'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Wireframe Note Box matching WF-E11 100% */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 8,
        border: '1.5px dashed #CBD5E1',
        background: '#F8FAFC',
        fontSize: 13,
        color: '#64748B',
        lineHeight: 1.5
      }}>
        Trạng thái UI / TBD: G-41, G-42 TBD.
      </div>
    </div>
  );
}

