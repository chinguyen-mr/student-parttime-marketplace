import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowLeft, Eye, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import ExportMenu from '../../components/common/ExportMenu';
import { API_BASE, formatApiError } from '../../config/api';
import { formatSalary, shortLocation, workTypeLabel } from '../../utils/jobDisplay';

const MODERATION_LABEL = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối' };
const STATUS_BADGE = {
  PENDING: { background: '#FEF3C7', color: '#78350F', border: '1px solid #FCD34D' },
  APPROVED: { background: '#DCFCE7', color: '#14532D', border: '1px solid #86EFAC' },
  REJECTED: { background: '#FEE2E2', color: '#7F1D1D', border: '1px solid #FCA5A5' }
};

// Tiêu chí Admin phải xác nhận trước khi phê duyệt tin
const MODERATION_CRITERIA = [
  { id: 'content', label: 'Nội dung rõ ràng, không lừa đảo hay thu phí' },
  { id: 'salary', label: 'Thù lao cụ thể (theo giờ / tháng), hợp lý' },
  { id: 'schedule', label: 'Địa điểm và ca làm việc ghi rõ' },
  { id: 'category', label: 'Đúng ngành nghề, không vi phạm pháp luật' },
  { id: 'employer', label: 'Thông tin doanh nghiệp đầy đủ' }
];

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
  const [checkedCriteria, setCheckedCriteria] = useState([]);
  const [rejectOpen, setRejectOpen] = useState(false);

  // Fetch pending jobs
  const fetchJobs = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (workTypeFilter !== 'ALL') params.append('work_type', workTypeFilter);
      params.append('moderation_status', statusFilter);
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
      // Tin vẫn khớp bộ lọc (Tất cả / đúng trạng thái mới) → cập nhật nhãn; không khớp → bỏ khỏi bảng
      setPendingJobs(prev => (statusFilter === 'ALL' || statusFilter === moderationStatus)
        ? prev.map(j => j.id === selectedJob.id ? { ...j, moderation_status: moderationStatus } : j)
        : prev.filter(j => j.id !== selectedJob.id));
      setSelectedJob(null);
      setModerationReason('');
      setCheckedCriteria([]);
      setRejectOpen(false);
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
    const allChecked = MODERATION_CRITERIA.every(c => checkedCriteria.includes(c.id));
    const isFullTime = selectedJob.work_type === 'FULL_TIME';
    const status = selectedJob.moderation_status || 'PENDING';
    const statusStyle = {
      PENDING: { bg: '#FEF3C7', color: '#78350F', border: '#FCD34D' },
      APPROVED: { bg: '#DCFCE7', color: '#14532D', border: '#86EFAC' },
      REJECTED: { bg: '#FEE2E2', color: '#7F1D1D', border: '#FCA5A5' }
    }[status] || { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' };
    const closeDetail = () => {
      setSelectedJob(null);
      setModerationReason('');
      setCheckedCriteria([]);
      setRejectOpen(false);
    };
    const toggleCriterion = (id) => setCheckedCriteria(prev => (
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    ));
    const cardStyle = {
      background: '#ffffff',
      borderRadius: 14,
      border: '1px solid var(--color-border-hover)',
      padding: 20
    };
    const metaItems = [
      ['Doanh nghiệp', selectedJob.company_name || selectedJob.employer_name || '—'],
      ['Mức thù lao', isFullTime ? formatSalary(selectedJob) : `${formatSalary(selectedJob)} · nhận lương thỏa thuận sau khi nhận`],
      ['Ngành nghề', selectedJob.category || '—'],
      ['Số lượng tuyển', selectedJob.headcount ? `${selectedJob.headcount} người` : '—'],
      ['Hạn nộp hồ sơ', selectedJob.application_deadline ? new Date(selectedJob.application_deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'],
      ['Gửi duyệt lúc', formatDate(selectedJob.updated_at || selectedJob.created_at)],
      ['Địa điểm làm việc', selectedJob.location || selectedJob.work_address || '—', true]
    ];
    const sections = [
      ['Mô tả công việc', selectedJob.description ? selectedJob.description.replace(/^•?\s*Mô tả công việc:\s*/i, '') : 'Chưa cung cấp mô tả chi tiết.'],
      ['Yêu cầu ứng viên', selectedJob.requirements || 'Chưa cung cấp yêu cầu.'],
      ...(selectedJob.benefits ? [['Quyền lợi & chế độ đãi ngộ', selectedJob.benefits]] : [])
    ];

    return (
      <div className="jn-mod-detail" style={{
        minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 16,
        // = màn hình − header − lề trên 28px của khung nội dung − lề dưới 24px; bù phần lề dưới 100px của khung (−76px)
        height: 'calc(100vh - var(--app-header-h, 74px) - 52px)',
        marginBottom: -76
      }}>
        {/* Đầu trang: tên tin + quay lại hàng đợi */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, color: '#475569', fontWeight: 700, marginBottom: 4 }}>
              Kiểm duyệt tin · Mã tin #{selectedJob.id}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              {selectedJob.title}
            </h1>
          </div>
          <Button variant="secondary" onClick={closeDetail} style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}>
            <ArrowLeft size={15} />
            <span>Quay lại hàng đợi</span>
          </Button>
        </div>

        <div className="jn-stack-md" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 360px)',
          gap: 24,
          alignItems: 'stretch',
          flex: 1,
          minHeight: 0
        }}>
          {/* CỘT TRÁI: NỘI DUNG TIN (CHỈ ĐỌC) — cuộn riêng trong khung */}
          <div className="jn-mod-scroll" style={{ ...cardStyle, overflowY: 'auto', minHeight: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                background: isFullTime ? '#FFF7ED' : '#F1EEF8',
                color: isFullTime ? '#7C2D12' : '#4C3D7A',
                border: `1px solid ${isFullTime ? '#FDBA74' : '#C4B5FD'}`
              }}>
                {workTypeLabel(selectedJob)}
              </span>
              <span style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`
              }}>
                {MODERATION_LABEL[status] || status}
              </span>
            </div>

            {/* Thông tin chính */}
            <dl style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: '14px 20px',
              padding: 16,
              margin: '0 0 18px 0',
              background: '#F8FAFC',
              borderRadius: 10,
              border: '1px solid #E2E8F0'
            }}>
              {metaItems.map(([label, value, wide]) => (
                <div key={label} style={wide ? { gridColumn: '1 / -1' } : undefined}>
                  <dt style={{ fontSize: 13, color: '#475569', fontWeight: 600, marginBottom: 2 }}>{label}</dt>
                  <dd style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{value}</dd>
                </div>
              ))}
            </dl>

            {sections.map(([title, body], i) => (
              <section key={title} style={{ marginTop: i === 0 ? 0 : 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>{title}</h2>
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.55, whiteSpace: 'pre-line', margin: 0, maxWidth: '72ch' }}>
                  {body}
                </p>
              </section>
            ))}
          </div>

          {/* CỘT PHẢI: QUYẾT ĐỊNH KIỂM DUYỆT */}
          <div className="jn-mod-scroll" style={{ ...cardStyle, alignSelf: 'start', maxHeight: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Quyết định kiểm duyệt
            </h2>
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 14px 0', lineHeight: 1.5 }}>
              Tin chỉ hiển thị với khách và sinh viên sau khi được phê duyệt.
            </p>

            {/* Tiêu chí: phải đạt đủ mới phê duyệt được */}
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
              Tiêu chí duyệt tin
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {MODERATION_CRITERIA.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: '#1E293B', lineHeight: 1.45, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checkedCriteria.includes(c.id)}
                    onChange={() => toggleCriterion(c.id)}
                    style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0, accentColor: '#047857' }}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleModerate('APPROVED')}
              disabled={actionSubmitting || !allChecked}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 8,
                border: 'none',
                background: allChecked ? '#047857' : '#E2E8F0',
                color: allChecked ? '#ffffff' : '#475569',
                fontSize: 14.5,
                fontWeight: 800,
                cursor: allChecked ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <CheckCircle2 size={18} />
              <span>Phê duyệt tin</span>
            </button>
            {!allChecked && (
              <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
                Đánh dấu đủ {MODERATION_CRITERIA.length} tiêu chí để phê duyệt.
              </div>
            )}

            <div style={{ borderTop: '1px solid #E2E8F0', margin: '16px 0 14px' }} />

            {/* Từ chối: bấm mới mở ô lý do (bắt buộc, gửi cho nhà tuyển dụng) */}
            {!rejectOpen ? (
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                disabled={actionSubmitting}
                style={{
                  width: '100%', padding: '10px 18px', borderRadius: 8,
                  border: '1px solid #B91C1C', background: '#ffffff', color: '#B91C1C',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <XCircle size={18} />
                <span>Từ chối tin…</span>
              </button>
            ) : (
              <div>
                <label htmlFor="moderation-reason" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                  Lý do từ chối <span style={{ color: '#B91C1C', fontWeight: 600 }}>(gửi tới nhà tuyển dụng)</span>
                </label>
                <textarea
                  id="moderation-reason"
                  rows={3}
                  autoFocus
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="Ví dụ: Thù lao chưa ghi rõ theo giờ hay theo tháng…"
                  style={{ width: '100%', borderRadius: 8, border: '1.5px solid #CBD5E1', padding: '10px 12px', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => { setRejectOpen(false); setModerationReason(''); }}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#ffffff', color: '#334155', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModerate('REJECTED')}
                    disabled={actionSubmitting || isRejectDisabled}
                    style={{
                      flex: 2, padding: '10px 12px', borderRadius: 8, border: 'none',
                      background: isRejectDisabled ? '#E2E8F0' : '#B91C1C',
                      color: isRejectDisabled ? '#475569' : '#ffffff',
                      fontSize: 14, fontWeight: 800, cursor: isRejectDisabled ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Xác nhận từ chối
                  </button>
                </div>
              </div>
            )}
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

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ExportMenu
            disabled={loading}
            onError={() => showToast && showToast('Xuất báo cáo thất bại', 'error')}
            getReport={async () => {
              // Lấy toàn bộ theo bộ lọc hiện tại (bảng chỉ hiển thị 50 dòng)
              const params = new URLSearchParams({ limit: '5000' });
              if (workTypeFilter !== 'ALL') params.append('work_type', workTypeFilter);
              params.append('moderation_status', statusFilter);
              const res = await fetch(`${API_BASE}/admin/jobs/pending?${params}`, { headers: { Authorization: `Bearer ${currentUser?.token}` } });
              const data = await res.json();
              if (!res.ok || !data.success) throw new Error(data.message || 'Không tải được dữ liệu');
              const rows = data.data || [];
              const count = (s) => rows.filter(j => j.moderation_status === s).length;
              return {
                title: 'Báo cáo kiểm duyệt tin tuyển dụng',
                subtitle: `Trạng thái: ${MODERATION_LABEL[statusFilter] || 'Tất cả'} · Loại tin: ${workTypeFilter === 'ALL' ? 'Tất cả' : workTypeFilter === 'PART_TIME' ? 'Part-time' : 'Full-time'}`,
                fileName: 'kiem-duyet-tin-tuyen-dung',
                author: currentUser?.full_name,
                summary: [['Tổng số tin', rows.length], ['Chờ duyệt', count('PENDING')], ['Đã duyệt', count('APPROVED')], ['Từ chối', count('REJECTED')]],
                columns: [
                  { header: 'Mã tin', value: j => `#${j.id}`, width: 9 },
                  { header: 'Tiêu đề', value: j => j.title, width: 34 },
                  { header: 'Ngành nghề', value: j => j.category, width: 20 },
                  { header: 'Nhà tuyển dụng', value: j => j.company_name || j.employer_name, width: 26 },
                  { header: 'Email liên hệ', value: j => j.employer_email, width: 26 },
                  { header: 'Mức lương', value: j => formatSalary(j), width: 18 },
                  { header: 'Kiểm duyệt', value: j => MODERATION_LABEL[j.moderation_status] || j.moderation_status, width: 12 },
                  { header: 'Lý do từ chối', value: j => j.moderation_reason, width: 30 },
                  { header: 'Ngày gửi', value: j => j.created_at, type: 'datetime', width: 16 },
                ],
                rows,
              };
            }}
          />
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
      </div>

      {/* Bộ lọc loại Job chuẩn Wireframe WF-A03 (Loại Job) */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid var(--color-border-hover)',
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
                  border: '1px solid var(--color-border-hover)',
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
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
            <option value="ALL">Tất cả trạng thái</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách Job chờ duyệt (WF-A03 Table) */}
      {/* Cột: Mã | Tiêu đề | Loại | Nhà tuyển dụng | Mức lương | Trạng thái | Gửi duyệt lúc | Thao tác */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid var(--color-border-hover)',
        overflow: 'hidden',
        padding: '4px 8px 8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Đang tải hàng đợi kiểm duyệt tin...</div>
          </div>
        ) : pendingJobs.length === 0 ? (
          <EmptyState
            title={statusFilter === 'PENDING' ? 'Hàng đợi kiểm duyệt đang trống' : 'Không có tin nào phù hợp bộ lọc'}
            description={statusFilter === 'PENDING'
              ? 'Hiện không có tin tuyển dụng nào đang chờ phê duyệt từ phía Nhà tuyển dụng.'
              : 'Thử đổi trạng thái duyệt hoặc loại tin để xem các tin khác.'}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border-hover)', fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}>
                  <th style={{ padding: '12px 12px', width: 60 }}>Mã</th>
                  <th style={{ padding: '12px 12px', minWidth: 220 }}>Tiêu đề tin tuyển dụng</th>
                  <th style={{ padding: '12px 12px', width: 130 }}>Loại</th>
                  <th style={{ padding: '12px 12px' }}>Nhà tuyển dụng</th>
                  <th style={{ padding: '12px 12px', width: 140 }}>Mức lương</th>
                  <th style={{ padding: '12px 12px', width: 110 }}>Trạng thái</th>
                  <th style={{ padding: '12px 12px', width: 110 }}>Gửi duyệt lúc</th>
                  <th style={{ padding: '12px 12px', width: 110, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pendingJobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '12px 12px', fontWeight: 800, color: '#64748B' }}>
                      #{job.id}
                    </td>

                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>
                        {job.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        {shortLocation(job)}
                      </div>
                    </td>

                    <td style={{ padding: '12px 12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 12.5,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        background: job.work_type === 'FULL_TIME' ? '#FFF7ED' : '#F1EEF8',
                        color: job.work_type === 'FULL_TIME' ? '#7C2D12' : '#4C3D7A',
                        border: `1px solid ${job.work_type === 'FULL_TIME' ? '#FDBA74' : '#C4B5FD'}`
                      }}>
                        {workTypeLabel(job)}
                      </span>
                    </td>

                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>
                        {job.company_name || job.employer_name || 'Nhà tuyển dụng'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        {job.employer_email}
                      </div>
                    </td>

                    <td style={{ padding: '12px 12px', fontWeight: 700, color: '#047857', whiteSpace: 'nowrap' }}>
                      {formatSalary(job)}
                    </td>

                    <td style={{ padding: '12px 12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 12.5,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        ...(STATUS_BADGE[job.moderation_status] || STATUS_BADGE.PENDING)
                      }}>
                        {MODERATION_LABEL[job.moderation_status] || 'Chờ duyệt'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 12px', color: '#475569', fontSize: 13, lineHeight: 1.4 }}>
                      {/* "07:59 06/11/2026" → giờ và ngày trên 2 dòng cho cột gọn */}
                      {formatDate(job.created_at).split(' ').map((part, i) => <div key={i}>{part}</div>)}
                    </td>

                    <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 6,
                          border: '1px solid var(--color-border-hover)',
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
                        <span>Xem xét</span>
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

