import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  ArrowLeft, Eye, RefreshCw, Briefcase, Calendar, 
  DollarSign, MapPin, Building2, User, Clock, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';

export default function AdminModerationPage({
  currentUser,
  showToast
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingJobs, setPendingJobs] = useState([]);

  // Queue Filters (WF-A03)
  const [workTypeFilter, setWorkTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  // Detail View (WF-A04)
  const [selectedJob, setSelectedJob] = useState(null);
  const [moderationReason, setModerationReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Fetch pending jobs
  const fetchJobs = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (workTypeFilter !== 'ALL') params.append('work_type', workTypeFilter);
      if (statusFilter !== 'ALL') params.append('moderation_status', statusFilter);
      params.append('limit', '50');

      const headers = { Authorization: `Bearer ${currentUser?.token}` };
      const res = await fetch(`${API_BASE}/admin/jobs/pending?${params.toString()}`, { headers });
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setPendingJobs(data.data);
      } else {
        throw new Error(data.message || 'Không thể tải hàng đợi duyệt tin');
      }
    } catch (err) {
      console.error('Lỗi tải hàng đợi kiểm duyệt tin:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi tải danh sách kiểm duyệt'), 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [workTypeFilter, statusFilter, currentUser]);

  // Handle Moderation Action (APPROVE or REJECT)
  const handleModerate = async (moderationStatus) => {
    if (!selectedJob) return;

    if (moderationStatus === 'REJECTED' && (!moderationReason || !moderationReason.trim())) {
      if (showToast) showToast('Bắt buộc phải nhập lý do khi từ chối tin tuyển dụng', 'error');
      return;
    }

    try {
      setActionSubmitting(true);
      const headers = { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser?.token}` 
      };

      const res = await fetch(`${API_BASE}/admin/jobs/${selectedJob.id}/moderate`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          moderation_status: moderationStatus,
          moderation_reason: moderationReason.trim()
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Kiểm duyệt tin thất bại');
      }

      if (showToast) {
        showToast(
          moderationStatus === 'APPROVED' 
            ? `Đã phê duyệt tin tuyển dụng "${selectedJob.title}"` 
            : `Đã từ chối tin tuyển dụng "${selectedJob.title}"`,
          'success'
        );
      }

      // Remove or update from local queue
      setPendingJobs(prev => prev.filter(j => j.id !== selectedJob.id));
      setSelectedJob(null);
      setModerationReason('');
    } catch (err) {
      console.error('Lỗi duyệt tin:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi xử lý kiểm duyệt'), 'error');
      }
    } finally {
      setActionSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // =========================================================================
  // VIEW 2: WF-A04 — JOB MODERATION DETAIL
  // =========================================================================
  if (selectedJob) {
    const isRejectDisabled = !moderationReason.trim();

    return (
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
        {/* Header navigation back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                CHI TIẾT KIỂM DUYỆT TIN
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Kiểm duyệt tin tuyển dụng: #{selectedJob.id}
            </h1>
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              setSelectedJob(null);
              setModerationReason('');
            }}
            style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}
          >
            <ArrowLeft size={15} />
            <span>Quay lại hàng đợi duyệt</span>
          </Button>
        </div>

        {/* 2-Column layout: Left: Readonly Job Info | Right: Decision Box */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
          gap: 24,
          alignItems: 'start'
        }}>
          {/* CỘT TRÁI: THÔNG TIN JOB (CHỈ ĐỌC) CHUẨN WIREFRAME WF-A04 */}
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '1.5px solid #000000',
            padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 800,
                background: selectedJob.work_type === 'FULL_TIME' ? '#FEF7EE' : '#F1EEF8',
                color: selectedJob.work_type === 'FULL_TIME' ? '#B45309' : '#7565A8',
                border: '1px solid #CBD5E1'
              }}>
                {selectedJob.work_type || 'PART_TIME'}
              </span>

              <span style={{
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 800,
                background: '#FEF3C7',
                color: '#D97706',
                border: '1px solid #FDE68A'
              }}>
                CHỜ DUYỆT ({selectedJob.moderation_status || 'PENDING'})
              </span>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 14px 0', lineHeight: 1.3 }}>
              {selectedJob.title}
            </h2>

            {/* Quick Meta */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              padding: '14px',
              background: '#F8FAFC',
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              marginBottom: 20,
              fontSize: 13
            }}>
              <div>
                <strong style={{ color: '#475569' }}>Doanh nghiệp:</strong>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>
                  {selectedJob.company_name || selectedJob.employer_name || 'Công ty TNHH'}
                </div>
              </div>

              <div>
                <strong style={{ color: '#475569' }}>Mức lương / Thù lao:</strong>
                <div style={{ fontWeight: 800, color: '#059669' }}>
                  {selectedJob.salary || 'Thỏa thuận'}
                </div>
              </div>

              <div>
                <strong style={{ color: '#475569' }}>Địa điểm làm việc:</strong>
                <div style={{ fontWeight: 600, color: '#0F172A' }}>
                  {selectedJob.location || selectedJob.work_address || 'TP. Hồ Chí Minh'}
                </div>
              </div>

              <div>
                <strong style={{ color: '#475569' }}>Thời gian gửi duyệt:</strong>
                <div style={{ color: '#64748B' }}>
                  {formatDate(selectedJob.created_at)}
                </div>
              </div>
            </div>

            {/* Mô tả công việc */}
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                • Mô tả công việc:
              </h4>
              <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {selectedJob.description ? selectedJob.description.replace(/^•?\s*Mô tả công việc:\s*/i, '') : 'Chưa cung cấp mô tả chi tiết.'}
              </div>
            </div>

            {/* Yêu cầu ứng viên */}
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                • Yêu cầu ứng viên:
              </h4>
              <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {selectedJob.requirements || 'Chưa cung cấp yêu cầu.'}
              </div>
            </div>

            {/* Quyền lợi */}
            {selectedJob.benefits && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  • Quyền lợi & Chế độ đãi ngộ:
                </h4>
                <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {selectedJob.benefits}
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: QUYẾT ĐỊNH KIỂM DUYỆT (DECISION BOX) CHUẨN WIREFRAME WF-A04 */}
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '2px solid #000000',
            padding: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            position: 'sticky',
            top: 90
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 14px 0' }}>
              Quyết định kiểm duyệt
            </h3>

            {/* Nút 1: Phê duyệt (APPROVED) */}
            <button
              type="button"
              onClick={() => handleModerate('APPROVED')}
              disabled={actionSubmitting}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 8,
                border: '1.5px solid #000000',
                background: '#10B981',
                color: '#ffffff',
                fontSize: 14.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 20,
                transition: 'filter 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            >
              <CheckCircle2 size={18} />
              <span>Phê duyệt tin</span>
            </button>

            <div style={{ borderTop: '1px solid #CBD5E1', margin: '16px 0' }} />

            {/* Ô nhập Lý do từ chối (BẮT BUỘC KHI TỪ CHỐI CHUẨN WIREFRAME) */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                Lý do từ chối: <span style={{ color: '#DC2626' }}>* (Bắt buộc khi từ chối)</span>
              </label>
              <textarea
                rows={4}
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="Nhập lý do chi tiết từ chối tin để gửi thông báo cho Nhà tuyển dụng..."
                style={{
                  width: '100%',
                  borderRadius: 8,
                  border: isRejectDisabled ? '1.5px solid #CBD5E1' : '1.5px solid #EF4444',
                  padding: '10px 12px',
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
              />
              {isRejectDisabled && (
                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4, fontStyle: 'italic' }}>
                  * Nhập lý do để mở khóa nút Từ chối.
                </div>
              )}
            </div>

            {/* Nút 2: Từ chối (REJECTED) - Bị disable nếu chưa nhập lý do */}
            <button
              type="button"
              onClick={() => handleModerate('REJECTED')}
              disabled={actionSubmitting || isRejectDisabled}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 8,
                border: '1.5px solid #000000',
                background: isRejectDisabled ? '#F1F5F9' : '#DC2626',
                color: isRejectDisabled ? '#94A3B8' : '#ffffff',
                fontSize: 14,
                fontWeight: 800,
                cursor: isRejectDisabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 12
              }}
            >
              <XCircle size={18} />
              <span>Từ chối tin</span>
            </button>

            {/* Nút 3: Quay lại */}
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedJob(null);
                setModerationReason('');
              }}
              style={{ width: '100%', padding: '10px', fontSize: 13 }}
            >
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: JOB MODERATION QUEUE
  // =========================================================================
  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              HÀNG ĐỢI DUYỆT TIN
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Kiểm duyệt tin tuyển dụng
          </h1>
        </div>

        <Button
          variant="secondary"
          onClick={() => fetchJobs(true)}
          disabled={refreshing}
          style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Làm mới ({pendingJobs.length})</span>
        </Button>
      </div>

      {/* Bộ lọc loại Job chuẩn Wireframe WF-A03 (Loại Job) */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1.5px solid #000000',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>Loại Job:</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'Tất cả loại tin' },
              { id: 'PART_TIME', label: 'Part-time' },
              { id: 'FULL_TIME', label: 'Full-time' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setWorkTypeFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: '1.5px solid #000000',
                  background: workTypeFilter === tab.id ? '#94A3B8' : '#ffffff',
                  color: '#000000',
                  fontSize: 13,
                  fontWeight: workTypeFilter === tab.id ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Trạng thái duyệt:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: 36,
              borderRadius: 6,
              border: '1.5px solid #CBD5E1',
              padding: '0 8px',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            <option value="PENDING">Chờ duyệt (PENDING)</option>
            <option value="ALL">Tất cả (Đã duyệt & Từ chối)</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách Job chờ duyệt (WF-A03 Table) */}
      {/* Cột: Tiêu đề | Loại | Nhà tuyển dụng | Submitted_at | Thao tác */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1.5px solid #000000',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Đang tải hàng đợi kiểm duyệt tin...</div>
          </div>
        ) : pendingJobs.length === 0 ? (
          <EmptyState
            title="Hàng đợi kiểm duyệt đang trống"
            description="Hiện không có tin tuyển dụng nào đang chờ phê duyệt từ phía Nhà tuyển dụng."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #000000', fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}>
                  <th style={{ padding: '14px 16px', width: 60 }}>ID</th>
                  <th style={{ padding: '14px 16px' }}>Tiêu đề tin tuyển dụng</th>
                  <th style={{ padding: '14px 16px', width: 130 }}>Loại</th>
                  <th style={{ padding: '14px 16px' }}>Nhà tuyển dụng</th>
                  <th style={{ padding: '14px 16px', width: 140 }}>Mức lương</th>
                  <th style={{ padding: '14px 16px', width: 150 }}>Submitted_at</th>
                  <th style={{ padding: '14px 16px', width: 140, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pendingJobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#64748B' }}>
                      #{job.id}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>
                        {job.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        {job.location || 'TP. Hồ Chí Minh'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 800,
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        border: '1px solid #C7D2FE'
                      }}>
                        {job.work_type || 'PART_TIME'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>
                        {job.company_name || job.employer_name || 'Nhà tuyển dụng'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        {job.employer_email}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#059669' }}>
                      {job.salary || 'Thỏa thuận'}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {formatDate(job.created_at)}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 6,
                          border: '1.5px solid #000000',
                          background: '#ffffff',
                          color: '#000000',
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                      >
                        <Eye size={13} />
                        <span>Xem xét → A04</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

