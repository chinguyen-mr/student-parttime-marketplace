import React, { useState, useEffect } from 'react';
import { 
  Briefcase, User, Calendar, DollarSign, Clock, 
  CheckCircle2, PlayCircle, Star, Eye, RefreshCw, 
  X, ShieldCheck, AlertCircle, FileText,
  MessageSquare, ChevronRight, AlertTriangle, UserX,
  UserCheck, ThumbsUp, Award, Phone, Mail, GraduationCap
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
  // Filter tabs: ALL, IN_PROGRESS, COMPLETED, TERMINATED_RESIGNED, NOT_STARTED
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal: Đánh giá sinh viên sau khi xong/kết thúc hợp đồng
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [quickTags, setQuickTags] = useState(['Đi làm đúng giờ', 'Thái độ tốt, hòa đồng', 'Trách nhiệm cao']);
  const [reviewComment, setReviewComment] = useState('Sinh viên đi làm đúng giờ, tác phong nghiêm túc, hòa đồng và hoàn thành tốt nhiệm vụ được giao.');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Modal: Cho thôi việc / Chấm dứt hợp đồng
  const [selectedAssignmentForTerminate, setSelectedAssignmentForTerminate] = useState(null);
  const [terminationType, setTerminationType] = useState('RESIGNED'); // RESIGNED (xin nghỉ) | TERMINATED (cho thôi việc)
  const [terminationReason, setTerminationReason] = useState('');
  const [submittingTerminate, setSubmittingTerminate] = useState(false);

  // Modal: Xem lại đánh giá đã gửi
  const [viewReviewAssignment, setViewReviewAssignment] = useState(null);

  // Cache danh sách ID hợp đồng đã được đánh giá
  const [reviewedAssignmentIds, setReviewedAssignmentIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobnest_employer_reviewed_assignments') || '[]');
    } catch {
      return [];
    }
  });

  // Fetch danh sách hợp đồng (GET /api/assignments/employer-assignments)
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
      if (showToast) showToast(formatApiError(err, 'Lỗi tải danh sách hợp đồng làm việc'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [currentUser]);

  // Cập nhật trạng thái hợp đồng: Bắt đầu hoặc Hoàn thành
  const handleUpdateStatus = async (assignmentId, newStatus) => {
    const isComplete = newStatus === 'COMPLETED';
    const actionLabel = newStatus === 'IN_PROGRESS' 
      ? 'xác nhận sinh viên bắt đầu làm việc' 
      : 'xác nhận hoàn thành hợp đồng';

    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel}?`)) {
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
        showToast(
          isComplete 
            ? 'Đã xác nhận hoàn thành hợp đồng thành công! Hãy đánh giá sinh viên bên dưới.' 
            : 'Đã xác nhận sinh viên bắt đầu làm việc!', 
          'success'
        );
        
        // Cập nhật state nội bộ
        setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status: newStatus } : a));

        // Nếu hoàn thành hợp đồng, TỰ ĐỘNG BẬT MODAL ĐÁNH GIÁ SINH VIÊN ngay
        if (isComplete) {
          const target = assignments.find(a => a.id === assignmentId);
          if (target) {
            setTimeout(() => {
              setSelectedAssignmentForReview(target);
            }, 300);
          }
        }
      } else {
        throw new Error(data.message || 'Lỗi cập nhật trạng thái hợp đồng');
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Lỗi cập nhật hợp đồng'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Xác nhận Cho thôi việc / Sinh viên xin nghỉ (TERMINATED / RESIGNED)
  const handleConfirmTermination = async () => {
    if (!selectedAssignmentForTerminate) return;
    const assignmentId = selectedAssignmentForTerminate.id;
    const statusToSet = terminationType; // 'RESIGNED' hoặc 'TERMINATED'

    try {
      setSubmittingTerminate(true);
      const res = await fetch(`${API_BASE}/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({ 
          status: statusToSet,
          termination_reason: terminationReason.trim()
        })
      });
      const data = await res.json();
      if (data.success || res.status === 200) {
        const label = statusToSet === 'RESIGNED' ? 'Sinh viên xin nghỉ việc' : 'Đã cho thôi việc';
        showToast(`Đã cập nhật tình trạng hợp đồng: ${label}!`, 'info');

        // Cập nhật state
        setAssignments(prev => prev.map(a => a.id === assignmentId ? { 
          ...a, 
          status: statusToSet,
          termination_reason: terminationReason.trim() 
        } : a));

        const target = selectedAssignmentForTerminate;
        setSelectedAssignmentForTerminate(null);
        setTerminationReason('');

        // Gợi ý đánh giá sinh viên sau khi cho nghỉ/nghỉ việc
        setTimeout(() => {
          if (confirm(`Bạn có muốn để lại đánh giá nhận xét cho sinh viên ${target.student_name || ''} không?`)) {
            setSelectedAssignmentForReview(target);
          }
        }, 300);
      } else {
        throw new Error(data.message || 'Lỗi cập nhật tình trạng');
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Lỗi cập nhật tình trạng thôi việc'), 'error');
    } finally {
      setSubmittingTerminate(false);
    }
  };

  // Gửi đánh giá sinh viên (POST /api/reviews)
  const handleSubmitStudentReview = async (e) => {
    e?.preventDefault();
    if (!selectedAssignmentForReview) return;
    if (!reviewComment.trim()) {
      if (showToast) showToast('Vui lòng nhập nội dung nhận xét sinh viên', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const finalComment = quickTags.length > 0 
        ? `[${quickTags.join(', ')}] - ${reviewComment.trim()}`
        : reviewComment.trim();

      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          job_id: selectedAssignmentForReview.job_id,
          work_assignment_id: selectedAssignmentForReview.id,
          reviewee_id: selectedAssignmentForReview.student_id,
          rating: rating,
          comment: finalComment
        })
      });

      const data = await res.json();
      if (res.status === 409 || data.message?.includes('đã gửi đánh giá')) {
        if (showToast) showToast('Bạn đã gửi đánh giá cho sinh viên trong hợp đồng này rồi!', 'info');
        const updated = [...new Set([...reviewedAssignmentIds, selectedAssignmentForReview.id])];
        setReviewedAssignmentIds(updated);
        localStorage.setItem('jobnest_employer_reviewed_assignments', JSON.stringify(updated));
        setSelectedAssignmentForReview(null);
        return;
      }

      if (data.success) {
        if (showToast) showToast(`Đánh giá sinh viên thành công (${rating} ⭐)!`, 'success');
        const updated = [...new Set([...reviewedAssignmentIds, selectedAssignmentForReview.id])];
        setReviewedAssignmentIds(updated);
        localStorage.setItem('jobnest_employer_reviewed_assignments', JSON.stringify(updated));
        setSelectedAssignmentForReview(null);
      } else {
        throw new Error(data.message || 'Lỗi gửi đánh giá');
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Lỗi gửi đánh giá'), 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Bật/tắt tag đánh giá nhanh
  const toggleQuickTag = (tag) => {
    if (quickTags.includes(tag)) {
      setQuickTags(quickTags.filter(t => t !== tag));
    } else {
      setQuickTags([...quickTags, tag]);
    }
  };

  // Lọc hợp đồng theo tab
  const filteredAssignments = assignments.filter(a => {
    if (statusFilter === 'NOT_STARTED') return a.status === 'NOT_STARTED';
    if (statusFilter === 'IN_PROGRESS') return a.status === 'IN_PROGRESS' || a.status === 'ACTIVE';
    if (statusFilter === 'COMPLETED') return a.status === 'COMPLETED';
    if (statusFilter === 'TERMINATED_RESIGNED') return a.status === 'TERMINATED' || a.status === 'RESIGNED';
    return true; // ALL
  });

  // Thống kê nhanh
  const totalCount = assignments.length;
  const inProgressCount = assignments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'ACTIVE').length;
  const completedCount = assignments.filter(a => a.status === 'COMPLETED').length;
  const terminatedCount = assignments.filter(a => a.status === 'TERMINATED' || a.status === 'RESIGNED').length;

  // Helper hiển thị badge tình trạng làm việc
  const renderWorkStatusBadge = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 12.5,
            fontWeight: 800,
            background: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Đang làm việc
          </span>
        );
      case 'COMPLETED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 12.5,
            fontWeight: 800,
            background: '#EFF6FF',
            color: '#2563EB',
            border: '1px solid #BFDBFE'
          }}>
            <CheckCircle2 size={13} color="#2563EB" />
            Đã hoàn thành
          </span>
        );
      case 'RESIGNED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 12.5,
            fontWeight: 800,
            background: '#FFFBEB',
            color: '#D97706',
            border: '1px solid #FDE68A'
          }}>
            <UserX size={13} color="#D97706" />
            Đã xin nghỉ việc
          </span>
        );
      case 'TERMINATED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 12.5,
            fontWeight: 800,
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA'
          }}>
            <AlertTriangle size={13} color="#DC2626" />
            Đã cho thôi việc
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 12.5,
            fontWeight: 700,
            background: '#F8FAFC',
            color: '#64748B',
            border: '1px solid #E2E8F0'
          }}>
            <Clock size={13} color="#64748B" />
            Chưa nhận việc
          </span>
        );
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 'none', paddingBottom: 60 }}>
      {/* ================= HEADER ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
            QUẢN LÝ NHÂN SỰ & HỢP ĐỒNG
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
            Quản lý hợp đồng lao động
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', margin: 0 }}>
            Theo dõi tình trạng làm việc của sinh viên (Đang làm, Đã hoàn thành, Xin nghỉ hoặc Thôi việc) và đánh giá sau khi kết thúc hợp đồng.
          </p>
        </div>

        <button
          onClick={fetchAssignments}
          disabled={loading}
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--color-border)',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--color-text)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới danh sách
        </button>
      </div>

      {/* ================= THỐNG KÊ NHANH (QUICK STAT CARDS) ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--color-lavender-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Tổng hợp đồng</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)' }}>{totalCount}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #A7F3D0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>Đang làm việc</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#065F46' }}>{inProgressCount}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#2563EB' }}>Đã hoàn thành</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1E40AF' }}>{completedCount}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
            <UserX size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626' }}>Đã nghỉ / Cho thôi việc</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#991B1B' }}>{terminatedCount}</div>
          </div>
        </div>
      </div>

      {/* ================= TABS LỌC TRẠNG THÁI ================= */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: `Tất cả (${totalCount})` },
          { id: 'IN_PROGRESS', label: `Đang làm việc (${inProgressCount})` },
          { id: 'COMPLETED', label: `Đã hoàn thành (${completedCount})` },
          { id: 'TERMINATED_RESIGNED', label: `Đã nghỉ / Cho thôi việc (${terminatedCount})` },
          { id: 'NOT_STARTED', label: 'Chưa nhận việc' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            style={{
              background: statusFilter === tab.id ? 'var(--color-primary)' : '#ffffff',
              color: statusFilter === tab.id ? '#ffffff' : 'var(--color-text)',
              border: '1.5px solid',
              borderColor: statusFilter === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
              borderRadius: 20,
              padding: '7px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= BẢNG HỢP ĐỒNG LÀM VIỆC ================= */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 68, background: '#ffffff', borderRadius: 12, border: '1px solid var(--color-border)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          title="Không tìm thấy hợp đồng nào"
          description="Hợp đồng làm việc sẽ tự động hiển thị tại đây khi bạn duyệt hồ sơ ứng viên part-time thành công."
        />
      ) : (
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#F8F7FB', borderBottom: '2px solid #F1F5F9', color: 'var(--color-text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>Sinh viên</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>Công việc / Vị trí</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>Thời gian</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>Tình trạng làm việc</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>Đánh giá sinh viên</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assign) => {
                  const isCompleted = assign.status === 'COMPLETED';
                  const isInProgress = assign.status === 'IN_PROGRESS' || assign.status === 'ACTIVE';
                  const isTerminatedOrResigned = assign.status === 'TERMINATED' || assign.status === 'RESIGNED';
                  const isEnded = isCompleted || isTerminatedOrResigned;
                  const isReviewed = reviewedAssignmentIds.includes(assign.id);

                  return (
                    <tr key={assign.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}>
                      {/* Cột 1: Sinh viên */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: 'var(--color-lavender-light)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14.5,
                            fontWeight: 800,
                            flexShrink: 0
                          }}>
                            {assign.student_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: 14 }}>
                              {assign.student_name || 'Nguyễn Văn Sinh Viên'}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Mail size={11} /> {assign.student_email || 'student@vlu.edu.vn'}
                            </div>
                            {assign.university && (
                              <div style={{ fontSize: 11.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <GraduationCap size={11} /> {assign.university} {assign.major ? `• ${assign.major}` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Công việc */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 13.5 }}>
                          {assign.job_title || 'Nhân viên Bán hàng Part-time'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 700, marginTop: 3 }}>
                          {assign.salary ? `${Number(assign.salary).toLocaleString('vi-VN')} đ` : 'Lương theo ca / Thỏa thuận'}
                        </div>
                      </td>

                      {/* Cột 3: Thời gian làm việc */}
                      <td style={{ padding: '16px 18px', color: 'var(--color-text-secondary)', fontSize: 12.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Calendar size={13} color="#94A3B8" />
                          <span>
                            {assign.started_at 
                              ? new Date(assign.started_at).toLocaleDateString('vi-VN') 
                              : (assign.created_at ? new Date(assign.created_at).toLocaleDateString('vi-VN') : 'Hôm nay')}
                          </span>
                        </div>
                        {assign.completed_at && (
                          <div style={{ fontSize: 11.5, color: '#059669', marginTop: 2 }}>
                            Xong: {new Date(assign.completed_at).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </td>

                      {/* Cột 4: Tình trạng làm việc (Đang làm / Đã hoàn thành / Đã thôi việc / Nghỉ) */}
                      <td style={{ padding: '16px 18px' }}>
                        {renderWorkStatusBadge(assign.status)}
                        {assign.termination_reason && (
                          <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4, fontStyle: 'italic', maxWidth: 160 }}>
                            Lý do: {assign.termination_reason}
                          </div>
                        )}
                      </td>

                      {/* Cột 5: Đánh giá sinh viên (Sau khi xong hợp đồng) */}
                      <td style={{ padding: '16px 18px' }}>
                        {isEnded ? (
                          isReviewed ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FEF3C7', padding: '4px 10px', borderRadius: 8, border: '1px solid #FDE68A' }}>
                              <Star size={13} fill="#F59E0B" color="#F59E0B" />
                              <span style={{ fontSize: 12, fontWeight: 800, color: '#B45309' }}>
                                Đã đánh giá (5/5 ⭐)
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedAssignmentForReview(assign)}
                              style={{
                                background: '#FEF3C7',
                                border: '1.5px solid #F59E0B',
                                color: '#92400E',
                                padding: '6px 12px',
                                borderRadius: 8,
                                fontSize: 12.5,
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 1px 2px rgba(245, 158, 11, 0.15)'
                              }}
                            >
                              <Star size={13} fill="#F59E0B" color="#F59E0B" />
                              Đánh giá sinh viên
                            </button>
                          )
                        ) : (
                          <span style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                            {isInProgress ? 'Đánh giá sau khi kết thúc' : 'Chưa đến hạn đánh giá'}
                          </span>
                        )}
                      </td>

                      {/* Cột 6: Thao tác */}
                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          {/* Chưa bắt đầu -> Bắt đầu làm việc */}
                          {assign.status === 'NOT_STARTED' && (
                            <button
                              onClick={() => handleUpdateStatus(assign.id, 'IN_PROGRESS')}
                              disabled={actionLoading}
                              style={{
                                background: '#ECFDF5',
                                border: '1px solid #A7F3D0',
                                color: '#047857',
                                padding: '6px 12px',
                                borderRadius: 8,
                                fontSize: 12.5,
                                fontWeight: 800,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Bắt đầu làm việc
                            </button>
                          )}

                          {/* Đang làm việc -> Hoàn thành hợp đồng & Cho thôi việc */}
                          {isInProgress && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(assign.id, 'COMPLETED')}
                                disabled={actionLoading}
                                title="Xác nhận sinh viên đã hoàn thành thời hạn làm việc và mở đánh giá"
                                style={{
                                  background: '#059669',
                                  border: 'none',
                                  color: '#ffffff',
                                  padding: '6px 14px',
                                  borderRadius: 8,
                                  fontSize: 12.5,
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  whiteSpace: 'nowrap',
                                  boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)'
                                }}
                              >
                                <CheckCircle2 size={13} />
                                Hoàn thành hợp đồng
                              </button>

                              <button
                                onClick={() => setSelectedAssignmentForTerminate(assign)}
                                disabled={actionLoading}
                                title="Cho thôi việc hoặc sinh viên xin nghỉ việc"
                                style={{
                                  background: '#FFF1F2',
                                  border: '1px solid #FECDD3',
                                  color: '#E11D48',
                                  padding: '6px 10px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <UserX size={12} /> Cho nghỉ / Thôi việc
                              </button>
                            </>
                          )}

                          {/* Đã kết thúc -> Đánh giá sinh viên nếu chưa đánh giá */}
                          {isEnded && !isReviewed && (
                            <button
                              onClick={() => setSelectedAssignmentForReview(assign)}
                              style={{
                                background: 'var(--color-primary-light)',
                                border: '1px solid var(--color-primary)',
                                color: 'var(--color-primary)',
                                padding: '6px 12px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Star size={12} /> Đánh giá ngay
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
        </div>
      )}

      {/* ================= MODAL: ĐÁNH GIÁ SINH VIÊN SAU KHI XONG HỢP ĐỒNG ================= */}
      {selectedAssignmentForReview && (
        <AnimatedModal 
          isOpen={!!selectedAssignmentForReview} 
          onClose={() => setSelectedAssignmentForReview(null)} 
          maxWidth={640}
        >
          <form onSubmit={handleSubmitStudentReview} style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 10px', borderRadius: 12 }}>
                  ⭐ ĐÁNH GIÁ SINH VIÊN PART-TIME
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '8px 0 2px 0' }}>
                  Nhận xét & Chấm điểm sau khi xong hợp đồng
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssignmentForReview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Thông tin sinh viên & công việc */}
            <div style={{ background: '#F8F7FB', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 13, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Sinh viên: <strong>{selectedAssignmentForReview.student_name}</strong></span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Hợp đồng #{selectedAssignmentForReview.id}</span>
              </div>
              <div>Công việc: <strong>{selectedAssignmentForReview.job_title}</strong></div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Tình trạng: {renderWorkStatusBadge(selectedAssignmentForReview.status)}
              </div>
            </div>

            {/* Chấm điểm sao tương tác */}
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>
                Mức độ hài lòng với quá trình làm việc của sinh viên:
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
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
                        size={36}
                        fill={isFilled ? '#F59E0B' : 'none'}
                        color={isFilled ? '#F59E0B' : '#CBD5E1'}
                      />
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#D97706', marginTop: 6 }}>
                {rating === 5 && '⭐⭐⭐⭐⭐ Rất xuất sắc (5/5 sao)'}
                {rating === 4 && '⭐⭐⭐⭐ Tốt, đáp ứng tốt công việc (4/5 sao)'}
                {rating === 3 && '⭐⭐⭐ Khá, hoàn thành nhiệm vụ (3/5 sao)'}
                {rating === 2 && '⭐⭐ Cần cải thiện thái độ / kỹ năng (2/5 sao)'}
                {rating === 1 && '⭐ Không hài lòng (1/5 sao)'}
              </div>
            </div>

            {/* Các tiêu chí đánh giá nhanh cho part-time */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                Chọn nhanh các ưu điểm của sinh viên:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  'Đi làm đúng giờ',
                  'Thái độ tốt, hòa đồng',
                  'Trách nhiệm cao',
                  'Lễ phép với khách',
                  'Học việc nhanh',
                  'Chăm chỉ, tích cực'
                ].map((tag) => {
                  const isSelected = quickTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleQuickTag(tag)}
                      style={{
                        background: isSelected ? 'var(--color-lavender-light)' : '#ffffff',
                        border: '1.5px solid',
                        borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                        borderRadius: 16,
                        padding: '4px 12px',
                        fontSize: 12,
                        fontWeight: isSelected ? 800 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nhận xét chi tiết */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Nhận xét chi tiết cho sinh viên:
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                required
                placeholder="Nhận xét về thái độ làm việc, kỹ năng, tinh thần trách nhiệm của sinh viên..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 13.5, resize: 'vertical' }}
              />
            </div>

            {/* Nút hành động */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button type="button" variant="secondary" onClick={() => setSelectedAssignmentForReview(null)}>
                Đóng
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={submittingReview} 
                style={{ padding: '8px 24px', fontWeight: 800, background: 'var(--color-primary)' }}
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá sinh viên'}
              </Button>
            </div>
          </form>
        </AnimatedModal>
      )}

      {/* ================= MODAL: CHO THÔI VIỆC / SINH VIÊN XIN NGHỈ (TERMINATE MODAL) ================= */}
      {selectedAssignmentForTerminate && (
        <AnimatedModal
          isOpen={!!selectedAssignmentForTerminate}
          onClose={() => setSelectedAssignmentForTerminate(null)}
          maxWidth={540}
        >
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 800, background: '#FEF2F2', color: '#DC2626', padding: '3px 10px', borderRadius: 12 }}>
                  KẾT THÚC HỢP ĐỒNG SỚM
                </span>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-text)', margin: '8px 0 2px 0' }}>
                  Xác nhận kết thúc làm việc
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssignmentForTerminate(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 13, border: '1px solid #E2E8F0' }}>
              <div>Sinh viên: <strong>{selectedAssignmentForTerminate.student_name}</strong></div>
              <div>Công việc: <strong>{selectedAssignmentForTerminate.job_title}</strong></div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                Hình thức kết thúc:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid',
                  borderColor: terminationType === 'RESIGNED' ? 'var(--color-primary)' : 'var(--color-border)',
                  background: terminationType === 'RESIGNED' ? 'var(--color-lavender-light)' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="terminationType"
                    checked={terminationType === 'RESIGNED'}
                    onChange={() => setTerminationType('RESIGNED')}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: 13.5, color: 'var(--color-text)' }}>
                      Sinh viên xin nghỉ việc (Theo nguyện vọng cá nhân)
                    </strong>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Sinh viên có việc bận, lịch học thay đổi hoặc lý do cá nhân muốn dừng công việc.
                    </span>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid',
                  borderColor: terminationType === 'TERMINATED' ? '#DC2626' : 'var(--color-border)',
                  background: terminationType === 'TERMINATED' ? '#FEF2F2' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="terminationType"
                    checked={terminationType === 'TERMINATED'}
                    onChange={() => setTerminationType('TERMINATED')}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: 13.5, color: '#DC2626' }}>
                      Doanh nghiệp cho thôi việc / Chấm dứt hợp đồng
                    </strong>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Sinh viên vi phạm quy chế, vắng ca nhiều lần hoặc không đáp ứng yêu cầu công việc.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Ghi chú / Lý do (Không bắt buộc):
              </label>
              <textarea
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                placeholder="Nhập lý do nghỉ việc hoặc ghi chú nội bộ..."
                rows={2}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button variant="secondary" onClick={() => setSelectedAssignmentForTerminate(null)}>
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                disabled={submittingTerminate}
                onClick={handleConfirmTermination}
                style={{ background: terminationType === 'TERMINATED' ? '#DC2626' : '#059669', border: 'none', fontWeight: 800 }}
              >
                {submittingTerminate ? 'Đang xử lý...' : 'Xác nhận kết thúc hợp đồng'}
              </Button>
            </div>
          </div>
        </AnimatedModal>
      )}
    </div>
  );
}
