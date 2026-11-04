import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Plus, Search, Filter, Eye, Edit3, XCircle, 
  CheckCircle2, Clock, AlertCircle, RefreshCw, Calendar, Users,
  ChevronRight, AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';

export default function EmployerJobsPage({
  currentUser,
  onNavigateCreateJob,
  onEditJob,
  onViewApplicants,
  showToast
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, DRAFT, PENDING, PUBLISHED, CLOSED, REJECTED
  const [searchKeyword, setSearchKeyword] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch employer's jobs from API
  const fetchJobs = async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setJobs(data.data);
      }
    } catch (err) {
      console.warn('Lỗi fetch jobs:', err);
      if (showToast) showToast(formatApiError(err, 'Lỗi tải danh sách tin'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [currentUser]);

  // Handle Close / Reopen Job (PATCH /api/jobs/:id/status)
  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'OPEN' || currentStatus === 'RECRUITING' ? 'CLOSED' : 'OPEN';
    const actionLabel = newStatus === 'CLOSED' ? 'đóng nhận hồ sơ' : 'mở lại tin tuyển dụng';

    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} cho tin tuyển dụng #${jobId}?`)) {
      return;
    }

    try {
      setActionLoadingId(jobId);
      const res = await fetch(`${API_BASE}/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(`Đã cập nhật trạng thái tin thành công: ${newStatus}`, 'success');
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      } else {
        throw new Error(data.message || 'Lỗi cập nhật trạng thái');
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Lỗi cập nhật trạng thái'), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Status filter
      if (statusFilter === 'DRAFT' && job.status !== 'DRAFT') return false;
      if (statusFilter === 'PENDING' && (job.status !== 'PENDING' && job.moderation_status !== 'PENDING')) return false;
      if (statusFilter === 'PUBLISHED' && (job.status !== 'OPEN' && job.status !== 'RECRUITING' && job.status !== 'PUBLISHED')) return false;
      if (statusFilter === 'CLOSED' && job.status !== 'CLOSED') return false;
      if (statusFilter === 'EXPIRED') {
        const isPastDeadline = job.application_deadline && new Date(job.application_deadline) < new Date();
        if (job.status !== 'EXPIRED' && !isPastDeadline) return false;
      }
      if (statusFilter === 'REJECTED' && (job.status !== 'REJECTED' && job.moderation_status !== 'REJECTED')) return false;

      // Keyword filter
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchTitle = (job.title || '').toLowerCase().includes(kw);
        const matchCat = (job.category || '').toLowerCase().includes(kw);
        return matchTitle || matchCat;
      }
      return true;
    });
  }, [jobs, statusFilter, searchKeyword]);

  // Format date helper
  const formatDate = (iso) => {
    if (!iso) return '--/--/----';
    try {
      return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  // Render Status Badge
  const renderStatus = (job) => {
    const isRejected = job.status === 'REJECTED' || job.moderation_status === 'REJECTED';
    const isOpen = job.status === 'OPEN' || job.status === 'RECRUITING' || job.status === 'PUBLISHED';
    const isPending = job.status === 'PENDING' || job.moderation_status === 'PENDING';

    if (isRejected) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FEE2E2', color: '#B91C1C', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
          <XCircle size={12} /> Bị từ chối
        </span>
      );
    }
    if (isOpen) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ECFDF5', color: '#047857', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
          <CheckCircle2 size={12} /> Đang mở (PUBLISHED)
        </span>
      );
    }
    if (isPending) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
          <Clock size={12} /> Chờ duyệt
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F1F5F9', color: '#64748B', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
        Đã đóng
      </span>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: 'none', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
            QUẢN LÝ TIN TUYỂN DỤNG (WF-E04)
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            Danh sách tin đăng của doanh nghiệp
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={fetchJobs}
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

          <Button
            variant="primary"
            onClick={onNavigateCreateJob}
            style={{ padding: '8px 18px', fontSize: 13.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> + Đăng tin mới
          </Button>
        </div>
      </div>

      {/* Filter Tabs matching Wireframe WF-E04: All | Draft | Pending | Published | Closed | Rejected */}
      <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid var(--color-border)', padding: '16px 20px', marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          {/* Status Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'Tất cả (All)' },
              { id: 'DRAFT', label: 'Bản nháp (Draft)' },
              { id: 'PENDING', label: 'Chờ duyệt (Pending)' },
              { id: 'PUBLISHED', label: 'Đang mở (Published)' },
              { id: 'CLOSED', label: 'Đã đóng (Closed)' },
              { id: 'EXPIRED', label: 'Hết hạn (Expired)' },
              { id: 'REJECTED', label: 'Bị từ chối (Rejected)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  background: statusFilter === tab.id ? 'var(--color-primary)' : '#F8F7FB',
                  color: statusFilter === tab.id ? '#ffffff' : 'var(--color-text-secondary)',
                  border: '1px solid',
                  borderColor: statusFilter === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
                  borderRadius: 20,
                  padding: '5px 14px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 240 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-text-secondary)' }} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tiêu đề hoặc ngành nghề..."
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} style={{ height: 64, background: '#ffffff', borderRadius: 12, border: '1px solid var(--color-border)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title="Không tìm thấy tin tuyển dụng nào"
          description={
            jobs.length === 0 
              ? "Bạn chưa đăng tin tuyển dụng nào trên JobNest. Hãy tạo tin đầu tiên để tiếp cận sinh viên Văn Lang!"
              : "Không có tin tuyển dụng nào khớp với bộ lọc trạng thái hoặc từ khóa tìm kiếm."
          }
          actionLabel={jobs.length === 0 ? "+ Tạo tin tuyển dụng ngay" : undefined}
          onAction={jobs.length === 0 ? onNavigateCreateJob : undefined}
        />
      ) : (
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#FAFAFD', borderBottom: '2px solid #F1F5F9', color: 'var(--color-text-secondary)', fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>Tiêu đề công việc</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>Loại</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>SL tuyển</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>Trạng thái</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>Số hồ sơ</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>Hạn nộp</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => {
                  const applicantCount = job.applicant_count ?? job.total_applicants ?? (job.applications_count || 0);
                  const isRejected = job.status === 'REJECTED' || job.moderation_status === 'REJECTED';
                  const isOpen = job.status === 'OPEN' || job.status === 'RECRUITING' || job.status === 'PUBLISHED';

                  return (
                    <React.Fragment key={job.id}>
                      <tr 
                        style={{ borderBottom: isRejected ? 'none' : '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FBFBFE'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Title */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--color-text)', marginBottom: 2 }}>
                            {job.title}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>
                            {job.salary ? `${job.salary.toLocaleString()} VNĐ` : 'Thỏa thuận'} • {job.category || 'Việc làm'}
                          </div>
                        </td>

                        {/* Type */}
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 700,
                            background: job.work_type === 'FREELANCE' ? '#EEF2FF' : 'var(--color-primary-light)',
                            color: job.work_type === 'FREELANCE' ? '#4F46E5' : 'var(--color-primary)'
                          }}>
                            {job.work_type === 'FREELANCE' ? 'FL' : job.work_type === 'SEASONAL' ? 'SS' : 'PT'}
                          </span>
                        </td>

                        {/* Slots */}
                        <td style={{ padding: '16px', fontWeight: 600 }}>
                          {job.quantity_required || job.slots || 1}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px' }}>
                          {renderStatus(job)}
                        </td>

                        {/* Applications count */}
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => onViewApplicants && onViewApplicants(job)}
                            style={{
                              background: '#F1F5F9',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: 12,
                              fontSize: 12.5,
                              fontWeight: 800,
                              color: 'var(--color-primary)',
                              cursor: 'pointer'
                            }}
                          >
                            {applicantCount} ứng viên
                          </button>
                        </td>

                        {/* Deadline */}
                        <td style={{ padding: '16px', color: 'var(--color-text-secondary)', fontSize: 12.5 }}>
                          {formatDate(job.application_deadline || job.deadline)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <button
                              onClick={() => onViewApplicants && onViewApplicants(job)}
                              title="Xem ứng viên"
                              style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: 'var(--color-primary)' }}
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              onClick={() => onEditJob && onEditJob(job)}
                              title="Chỉnh sửa tin"
                              style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#475569' }}
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              onClick={() => handleToggleJobStatus(job.id, job.status)}
                              disabled={actionLoadingId === job.id}
                              style={{
                                background: isOpen ? '#FFF1F2' : '#F0FDF4',
                                border: `1px solid ${isOpen ? '#FECDD3' : '#BBF7D0'}`,
                                color: isOpen ? '#BE123C' : '#15803D',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {isOpen ? 'Đóng' : 'Mở lại'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Wireframe requirement: REJECTED phải hiện moderation_reason */}
                      {isRejected && (
                        <tr style={{ background: '#FFF7F7', borderBottom: '1px solid #FEE2E2' }}>
                          <td colSpan={7} style={{ padding: '10px 16px', fontSize: 12.5, color: '#991B1B' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <AlertTriangle size={15} color="#DC2626" style={{ flexShrink: 0 }} />
                              <div>
                                <strong>Lý do từ chối kiểm duyệt (moderation_reason):</strong>{' '}
                                {job.moderation_reason || 'Nội dung tin tuyển dụng chưa đầy đủ thông tin hoặc mức thù lao không phù hợp quy định bảo vệ sinh viên.'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
