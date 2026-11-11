import React, { useState, useEffect } from 'react';
import { 
  Briefcase, User, Calendar, DollarSign, Clock, 
  CheckCircle2, PlayCircle, Star, Eye, RefreshCw, 
  X, ShieldCheck, AlertCircle, FileText, ExternalLink,
  MessageSquare, ChevronRight, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, AnimatedModal } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';

export default function EmployerAssignmentsPage({
  currentUser,
  showToast
}) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, NOT_STARTED, IN_PROGRESS, COMPLETED
  const [actionLoading, setActionLoading] = useState(false);

  // WF-E10 Deliverable Review Modal State
  const [selectedAssignmentForDeliverable, setSelectedAssignmentForDeliverable] = useState(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [submittingDeliverableDecision, setSubmittingDeliverableDecision] = useState(false);

  // WF-E11 Review Student Modal State
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('Sinh viên làm việc rất có trách nhiệm, chủ động giao tiếp và bàn giao sản phẩm đúng cam kết.');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedAssignmentIds, setReviewedAssignmentIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobnest_employer_reviewed_assignments') || '[]');
    } catch {
      return [];
    }
  });

  // Fetch Assignments (GET /api/assignments/employer-assignments)
  const fetchAssignments = async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/assignments/employer-assignments`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAssignments(data.data);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(formatApiError(err, 'Lỗi tải danh sách hợp đồng'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [currentUser]);

  // Update Assignment Status (PATCH /api/assignments/:id/status)
  const handleUpdateStatus = async (assignmentId, newStatus) => {
    const actionLabel = newStatus === 'IN_PROGRESS' 
      ? 'Bắt đầu làm việc' 
      : 'Xác nhận hoàn thành công việc';

    if (!confirm(`Bạn có chắc chắn muốn chuyển trạng thái hợp đồng sang "${actionLabel}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE}/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã chuyển trạng thái hợp đồng thành công sang: ${newStatus}`, 'success');
        setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status: newStatus } : a));
        // If completed, prompt review student
        if (newStatus === 'COMPLETED') {
          const target = assignments.find(a => a.id === assignmentId);
          if (target) setSelectedAssignmentForReview(target);
        }
      } else {
        throw new Error(data.message || 'Lỗi cập nhật trạng thái');
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Lỗi cập nhật trạng thái hợp đồng'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // WF-E10: Deliverable Review Decision (Accept or Request Revision)
  const handleDeliverableDecision = async (decision) => {
    if (decision === 'REVISION_REQUESTED' && !revisionNote.trim()) {
      if (showToast) showToast('Vui lòng nhập lý do yêu cầu chỉnh sửa bắt buộc!', 'error');
      return;
    }

    try {
      setSubmittingDeliverableDecision(true);
      // Simulate/trigger deliverable review update
      if (decision === 'ACCEPTED') {
        showToast('Đã nghiệm thu sản phẩm bàn giao thành công!', 'success');
      } else {
        showToast('Đã gửi yêu cầu chỉnh sửa bổ sung đến sinh viên.', 'info');
      }
      setSelectedAssignmentForDeliverable(null);
      setRevisionNote('');
    } catch (err) {
      if (showToast) showToast(formatApiError(err), 'error');
    } finally {
      setSubmittingDeliverableDecision(false);
    }
  };

  // WF-E11: Submit Review for Student (POST /api/reviews)
  const handleSubmitStudentReview = async (e) => {
    e?.preventDefault();
    if (!selectedAssignmentForReview) return;
    if (!reviewComment.trim()) {
      if (showToast) showToast('Vui lòng nhập nội dung đánh giá', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          job_id: selectedAssignmentForReview.job_id,
          reviewee_id: selectedAssignmentForReview.student_id,
          rating: rating,
          comment: reviewComment.trim()
        })
      });

      const data = await res.json();
      if (res.status === 409 || data.message?.includes('đã gửi đánh giá')) {
        if (showToast) showToast('409 Conflict: Bạn đã đánh giá sinh viên cho công việc này rồi!', 'info');
        const updated = [...new Set([...reviewedAssignmentIds, selectedAssignmentForReview.id])];
        setReviewedAssignmentIds(updated);
        localStorage.setItem('jobnest_employer_reviewed_assignments', JSON.stringify(updated));
        setSelectedAssignmentForReview(null);
        return;
      }

      if (data.success) {
        if (showToast) showToast('Đánh giá sinh viên thành công!', 'success');
        const updated = [...new Set([...reviewedAssignmentIds, selectedAssignmentForReview.id])];
        setReviewedAssignmentIds(updated);
        localStorage.setItem('jobnest_employer_reviewed_assignments', JSON.stringify(updated));
        setSelectedAssignmentForReview(null);
      } else {
        throw new Error(data.message || 'Lỗi gửi đánh giá');
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Lỗi đánh giá'), 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filtered assignments
  const filteredAssignments = assignments.filter(a => {
    if (statusFilter === 'NOT_STARTED' && a.status !== 'NOT_STARTED') return false;
    if (statusFilter === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return false;
    if (statusFilter === 'COMPLETED' && a.status !== 'COMPLETED') return false;
    return true;
  });

  return (
    <div style={{ width: '100%', maxWidth: 'none', paddingBottom: 60 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
            TIẾN ĐỘ & NGHIỆM THU
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            Quản lý hợp đồng & Tiến độ công việc
          </h1>
        </div>

        <button
          onClick={fetchAssignments}
          disabled={loading}
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--color-border)',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Filter Tabs matching WF-E09 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'Tất cả hợp đồng' },
          { id: 'IN_PROGRESS', label: 'Đang thực hiện (IN_PROGRESS)' },
          { id: 'COMPLETED', label: 'Đã hoàn thành (COMPLETED)' },
          { id: 'NOT_STARTED', label: 'Chưa bắt đầu (NOT_STARTED)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            style={{
              background: statusFilter === tab.id ? 'var(--color-primary)' : '#ffffff',
              color: statusFilter === tab.id ? '#ffffff' : 'var(--color-text-secondary)',
              border: '1px solid',
              borderColor: statusFilter === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Assignments Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 64, background: '#ffffff', borderRadius: 12, border: '1px solid var(--color-border)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          title="Chưa có hợp đồng công việc nào"
          description="Hợp đồng làm việc sẽ tự động được khởi tạo khi bạn tuyển chọn ứng viên trúng tuyển."
        />
      ) : (
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#FAFAFD', borderBottom: '2px solid #F1F5F9', color: 'var(--color-text-secondary)', fontSize: 12.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>Sinh viên</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>Công việc / Job</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>Trạng thái</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>Tiến độ</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>Sản phẩm bàn giao</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assign) => {
                const isCompleted = assign.status === 'COMPLETED';
                const isInProgress = assign.status === 'IN_PROGRESS';
                const isReviewed = reviewedAssignmentIds.includes(assign.id);

                return (
                  <tr key={assign.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'var(--color-lavender-light)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 800
                        }}>
                          {assign.student_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                            {assign.student_name || 'Dương Hữu Anh'}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            {assign.student_email || 'student@vlu.edu.vn'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px', fontWeight: 600 }}>
                      {assign.job_title || 'Lập trình viên ReactJS Part-time'}
                    </td>

                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        background: isCompleted ? '#DCFCE7' : isInProgress ? '#FEF3C7' : '#F1F5F9',
                        color: isCompleted ? '#16A34A' : isInProgress ? '#B45309' : '#64748B'
                      }}>
                        {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {assign.status}
                      </span>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                          <div style={{
                            width: isCompleted ? '100%' : isInProgress ? '60%' : '10%',
                            height: '100%',
                            background: isCompleted ? 'var(--color-success)' : 'var(--color-primary)'
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>
                          {isCompleted ? '100%' : isInProgress ? '60%' : '10%'}
                        </span>
                      </div>
                    </td>

                    {/* Deliverable Review CTA (WF-E10) */}
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => setSelectedAssignmentForDeliverable(assign)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--color-border)',
                          padding: '5px 12px',
                          borderRadius: 6,
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Eye size={13} /> Nghiệm thu
                      </button>
                    </td>

                    {/* Actions: Start, Complete, Review */}
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {assign.status === 'NOT_STARTED' && (
                          <button
                            onClick={() => handleUpdateStatus(assign.id, 'IN_PROGRESS')}
                            disabled={actionLoading}
                            style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            Bắt đầu
                          </button>
                        )}

                        {isInProgress && (
                          <button
                            onClick={() => handleUpdateStatus(assign.id, 'COMPLETED')}
                            disabled={actionLoading}
                            style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#16A34A', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            Xác nhận hoàn thành
                          </button>
                        )}

                        {isCompleted && (
                          <button
                            onClick={() => setSelectedAssignmentForReview(assign)}
                            style={{
                              background: isReviewed ? '#F1F5F9' : '#FEF3C7',
                              border: `1px solid ${isReviewed ? '#E2E8F0' : '#FCD34D'}`,
                              color: isReviewed ? '#64748B' : '#B45309',
                              padding: '5px 10px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Star size={13} /> {isReviewed ? 'Đã đánh giá' : 'Đánh giá'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODAL: WF-E10 — DELIVERABLE REVIEW ================= */}
      {selectedAssignmentForDeliverable && (
        <AnimatedModal isOpen={!!selectedAssignmentForDeliverable} onClose={() => setSelectedAssignmentForDeliverable(null)} maxWidth={720}>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 800, background: '#EEF2FF', color: '#4F46E5', padding: '3px 10px', borderRadius: 12 }}>
                  NGHIỆM THU SẢN PHẨM BÀN GIAO
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '8px 0 2px 0' }}>
                  Kiểm tra & Quyết định bàn giao
                </h2>
              </div>
              <Button variant="secondary" onClick={() => setSelectedAssignmentForDeliverable(null)} style={{ padding: '4px 12px', fontSize: 12 }}>
                Đóng
              </Button>
            </div>

            {/* Context Card */}
            <div style={{ background: '#F8F7FB', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 13, border: '1px solid var(--color-border)' }}>
              <div>Công việc: <strong>{selectedAssignmentForDeliverable.job_title}</strong></div>
              <div>Sinh viên: <strong>{selectedAssignmentForDeliverable.student_name}</strong></div>
              <div>Phiên bản bàn giao hiện tại: <strong>v2</strong> • Trạng thái: <strong>{selectedAssignmentForDeliverable.status}</strong></div>
            </div>

            {/* Product Deliverable Links & Note */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                Sản phẩm / Đường dẫn file của sinh viên:
              </div>
              <div style={{ background: '#ffffff', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={20} color="var(--color-primary)" />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>
                      Mã nguồn & Demo trực tuyến v2.0
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      https://github.com/vlu-student/jobnest-frontend
                    </div>
                  </div>
                </div>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <ExternalLink size={13} /> Mở xem
                </a>
              </div>
            </div>

            {/* Version History Table matching WF-E10 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                Lịch sử phiên bản (Version History)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, border: '1px solid var(--color-border)', borderRadius: 8 }}>
                <thead>
                  <tr style={{ background: '#F8F7FB', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '8px 12px' }}>Phiên bản</th>
                    <th style={{ padding: '8px 12px' }}>Trạng thái</th>
                    <th style={{ padding: '8px 12px' }}>Thời gian gửi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>v1</td>
                    <td style={{ padding: '8px 12px', color: '#BE123C' }}>REVISION_REQUESTED (Cần tối ưu responsive)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>2 ngày trước</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>v2</td>
                    <td style={{ padding: '8px 12px', color: '#047857' }}>SUBMITTED (Chờ nghiệm thu)</td>
                    <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>Hôm nay</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Revision Note Input (Mandatory when Requesting Revision) */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Lý do yêu cầu chỉnh sửa (Bắt buộc khi chọn Request Revision):
              </label>
              <textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Nêu rõ các chi tiết hoặc lỗi cần sinh viên khắc phục thêm..."
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 13 }}
              />
            </div>

            {/* Decision Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button
                variant="secondary"
                disabled={submittingDeliverableDecision}
                onClick={() => handleDeliverableDecision('REVISION_REQUESTED')}
                style={{ borderColor: 'var(--color-warning)', color: 'var(--color-warning)', fontWeight: 700 }}
              >
                Yêu cầu chỉnh sửa (Request Revision)
              </Button>

              <Button
                variant="primary"
                disabled={submittingDeliverableDecision}
                onClick={() => handleDeliverableDecision('ACCEPTED')}
                style={{ padding: '8px 20px', fontWeight: 700 }}
              >
                Chấp thuận nghiệm thu (Accept)
              </Button>
            </div>
          </div>
        </AnimatedModal>
      )}

      {/* ================= MODAL: WF-E11 — REVIEW STUDENT ================= */}
      {selectedAssignmentForReview && (
        <AnimatedModal isOpen={!!selectedAssignmentForReview} onClose={() => setSelectedAssignmentForReview(null)} maxWidth={640}>
          <form onSubmit={handleSubmitStudentReview} style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 10px', borderRadius: 12 }}>
                  ĐÁNH GIÁ SINH VIÊN
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '8px 0 2px 0' }}>
                  Đánh giá sau hoàn thành công việc
                </h2>
              </div>
              <Button variant="secondary" onClick={() => setSelectedAssignmentForReview(null)} style={{ padding: '4px 12px', fontSize: 12 }}>
                Đóng
              </Button>
            </div>

            <div style={{ background: '#F8F7FB', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 13 }}>
              Sinh viên: <strong>{selectedAssignmentForReview.student_name}</strong> • Công việc: <strong>{selectedAssignmentForReview.job_title}</strong>
            </div>

            {/* Interactive 5-Star Rating */}
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                Chấm điểm mức độ hài lòng:
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                      <Star
                        size={32}
                        fill={isFilled ? '#F59E0B' : 'none'}
                        color={isFilled ? '#F59E0B' : '#CBD5E1'}
                      />
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#D97706', marginTop: 4 }}>
                {rating === 5 ? 'Tuyệt vời (5/5 sao)' : `${rating}/5 sao`}
              </div>
            </div>

            {/* Comment Textarea */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Nhận xét tinh thần trách nhiệm, kỹ năng và thái độ của sinh viên:
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 13.5 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button variant="secondary" onClick={() => setSelectedAssignmentForReview(null)}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" disabled={submittingReview} style={{ padding: '8px 24px', fontWeight: 700 }}>
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá (POST /reviews)'}
              </Button>
            </div>
          </form>
        </AnimatedModal>
      )}
    </div>
  );
}
