import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, RefreshCw, Eye, Clock, Send } from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import ExportMenu from '../../components/common/ExportMenu';
import { API_BASE, formatApiError } from '../../config/api';
import { formatSalary } from '../../utils/jobDisplay';

const STATUS_LABEL = { OPEN: 'Chờ xử lý', PENDING: 'Chờ xử lý', RESOLVED: 'Đã xử lý' };
const STATUS_BADGE = {
  OPEN: { background: '#FEF3C7', color: '#78350F', border: '1px solid #FCD34D' },
  PENDING: { background: '#FEF3C7', color: '#78350F', border: '1px solid #FCD34D' },
  RESOLVED: { background: '#DCFCE7', color: '#14532D', border: '1px solid #86EFAC' }
};
const TARGET_BADGE = {
  JOB: { background: '#F1EEF8', color: '#4C3D7A', border: '1px solid #C4B5FD' },
  USER: { background: '#FFF1F2', color: '#881337', border: '1px solid #FDA4AF' }
};
// Gồm cả mã hành động cũ còn trong dữ liệu (WARN_USER, CLOSE_JOB, NO_VIOLATION)
const ACTION_LABEL = {
  WARNING: 'Cảnh cáo', WARN_USER: 'Cảnh cáo',
  BAN_USER: 'Khóa tài khoản vi phạm',
  REMOVE_JOB: 'Gỡ tin tuyển dụng', CLOSE_JOB: 'Gỡ tin tuyển dụng',
  DISMISS: 'Bác bỏ – không vi phạm', NO_VIOLATION: 'Bác bỏ – không vi phạm'
};
const ACTION_HINT = {
  WARNING: 'Ghi nhận cảnh cáo, đóng báo cáo; đối tượng vẫn hoạt động bình thường.',
  BAN_USER: 'Khóa tài khoản bị báo cáo (với tin tuyển dụng: khóa tài khoản nhà tuyển dụng đăng tin).',
  REMOVE_JOB: 'Gỡ tin khỏi trang công khai (chuyển sang trạng thái Từ chối).',
  DISMISS: 'Báo cáo không có cơ sở; đóng báo cáo, không xử lý đối tượng.'
};
const JOB_STATUS_LABEL = { OPEN: 'Đang tuyển', FILLED: 'Đã đủ người', CLOSED: 'Đã đóng', COMPLETED: 'Hoàn thành', REJECTED: 'Bị gỡ / từ chối', DRAFT: 'Nháp' };
const ROLE_LABEL = { STUDENT: 'Sinh viên', EMPLOYER: 'Nhà tuyển dụng', ADMIN: 'Quản trị viên' };
const USER_STATUS_LABEL = { ACTIVE: 'Đang hoạt động', SUSPENDED: 'Tạm ngưng', BANNED: 'Đã khóa', PENDING: 'Chờ xác minh' };
const reportCode = (id) => `R-${String(id).padStart(3, '0')}`;
const targetLabel = (r) => `${r?.target_type === 'JOB' ? 'Tin' : 'Người dùng'} #${r?.target_id}`;
const badgeBase = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' };
const metaLabel = { fontSize: 13, color: '#475569', fontWeight: 600, marginBottom: 2 };
const metaValue = { margin: 0, fontSize: 14, fontWeight: 700, color: '#0F172A', overflowWrap: 'anywhere' };

export default function AdminReportsPage({
  currentUser,
  showToast
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState([]);

  // Filters (WF-A05)
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL');

  // Detail View (WF-A06)
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Resolution Form
  const [actionChoice, setActionChoice] = useState('WARNING'); // 'WARNING' | 'BAN_USER' | 'REMOVE_JOB' | 'DISMISS'
  const [actionNote, setActionNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Fetch Reports list
  const fetchReports = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (targetTypeFilter !== 'ALL') params.append('target_type', targetTypeFilter);
      params.append('limit', '50');

      const headers = { Authorization: `Bearer ${currentUser?.token}` };
      const res = await fetch(`${API_BASE}/admin/reports?${params.toString()}`, { headers });
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setReports(data.data);
      } else {
        throw new Error(data.message || 'Không thể tải danh sách báo cáo');
      }
    } catch (err) {
      console.error('Lỗi tải báo cáo vi phạm:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi tải danh sách báo cáo'), 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, targetTypeFilter, currentUser]);

  // Fetch Report Detail (WF-A06)
  const openReportDetail = async (reportId) => {
    try {
      setSelectedReportId(reportId);
      setLoadingDetail(true);
      const headers = { Authorization: `Bearer ${currentUser?.token}` };
      const res = await fetch(`${API_BASE}/admin/reports/${reportId}`, { headers });
      const data = await res.json();

      if (data.success && data.data) {
        setReportDetail(data.data);
        setActionChoice('WARNING');
        setActionNote('');
      } else {
        throw new Error(data.message || 'Không thể tải chi tiết báo cáo');
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết báo cáo:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi tải chi tiết báo cáo'), 'error');
      }
      setSelectedReportId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit Resolution
  const handleResolveReport = async (action = actionChoice, note = actionNote) => {
    if (!selectedReportId) return;
    try {
      setSubmittingAction(true);
      const headers = { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser?.token}` 
      };

      const res = await fetch(`${API_BASE}/admin/reports/${selectedReportId}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action,
          note: note.trim()
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Xử lý báo cáo thất bại');
      }

      if (showToast) {
        showToast('Đã lưu xử lý báo cáo vi phạm thành công', 'success');
      }

      // Refresh detail and list
      await openReportDetail(selectedReportId);
      fetchReports();
    } catch (err) {
      console.error('Lỗi xử lý báo cáo:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi lưu xử lý'), 'error');
      }
    } finally {
      setSubmittingAction(false);
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
  // VIEW 2: WF-A06 — REPORT DETAIL
  // =========================================================================
  if (selectedReportId) {
    const closeDetail = () => {
      setSelectedReportId(null);
      setReportDetail(null);
    };
    const cardStyle = { background: '#ffffff', borderRadius: 14, border: '1px solid var(--color-border-hover)', padding: 20 };
    const report = reportDetail?.report;
    const preview = reportDetail?.target_preview;
    const isJob = report?.target_type === 'JOB';
    const isResolved = report?.status === 'RESOLVED';
    const actionOptions = ['WARNING', 'BAN_USER', ...(isJob ? ['REMOVE_JOB'] : []), 'DISMISS'];

    return (
      <div className="jn-mod-detail" style={{
        minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 16,
        // Cao đúng màn hình: trang không cuộn, chỉ cột nội dung bên trái cuộn
        height: 'calc(100vh - var(--app-header-h, 74px) - 52px)',
        marginBottom: -76
      }}>
        {/* Đầu trang */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, color: '#475569', fontWeight: 700, marginBottom: 4 }}>
              Báo cáo vi phạm · Mã {reportCode(selectedReportId)}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              {report ? report.reason : 'Chi tiết báo cáo'}
            </h1>
          </div>
          <Button variant="secondary" onClick={closeDetail} style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}>
            <ArrowLeft size={15} />
            <span>Quay lại danh sách</span>
          </Button>
        </div>

        {loadingDetail || !reportDetail ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Đang tải chi tiết báo cáo vi phạm...</div>
          </div>
        ) : (
          <div className="jn-stack-md" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 360px)',
            gap: 24,
            alignItems: 'stretch',
            flex: 1,
            minHeight: 0
          }}>
            {/* CỘT TRÁI: nội dung báo cáo, đối tượng, lịch sử — cuộn riêng */}
            <div className="jn-mod-scroll" style={{ overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Nội dung báo cáo */}
              <section style={cardStyle}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  <span style={{ ...badgeBase, ...(isJob ? TARGET_BADGE.JOB : TARGET_BADGE.USER) }}>
                    {targetLabel(report)}
                  </span>
                  <span style={{ ...badgeBase, ...(STATUS_BADGE[report.status] || STATUS_BADGE.OPEN) }}>
                    {STATUS_LABEL[report.status] || 'Chờ xử lý'}
                  </span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Nội dung báo cáo</h2>
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: '0 0 14px 0', maxWidth: '72ch', whiteSpace: 'pre-line' }}>
                  {report.description || 'Người báo cáo không ghi thêm mô tả.'}
                </p>
                <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '10px 20px', margin: 0, padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div>
                    <dt style={metaLabel}>Người báo cáo</dt>
                    <dd style={metaValue}>{report.reporter_name || 'Người dùng ẩn danh'}</dd>
                    <dd style={{ ...metaValue, fontWeight: 500, color: '#475569', fontSize: 13 }}>{report.reporter_email}</dd>
                  </div>
                  <div>
                    <dt style={metaLabel}>Gửi lúc</dt>
                    <dd style={metaValue}>{formatDate(report.created_at)}</dd>
                  </div>
                </dl>
              </section>

              {/* Đối tượng bị báo cáo */}
              <section style={cardStyle}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                  {isJob ? 'Tin tuyển dụng bị báo cáo' : 'Tài khoản bị báo cáo'}
                </h2>
                {preview ? (
                  isJob ? (
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>{preview.title}</h3>
                      <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px 20px', margin: '0 0 10px 0' }}>
                        <div><dt style={metaLabel}>Doanh nghiệp</dt><dd style={metaValue}>{preview.employer_name}</dd><dd style={{ ...metaValue, fontWeight: 500, color: '#475569', fontSize: 13 }}>{preview.employer_email}</dd></div>
                        <div><dt style={metaLabel}>Mức thù lao</dt><dd style={metaValue}>{formatSalary(preview)}</dd></div>
                        <div><dt style={metaLabel}>Trạng thái tin</dt><dd style={metaValue}>{JOB_STATUS_LABEL[preview.status] || preview.status}</dd></div>
                      </dl>
                      {preview.description && (
                        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: 0, maxWidth: '72ch', whiteSpace: 'pre-line' }}>{preview.description}</p>
                      )}
                    </div>
                  ) : (
                    <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px 20px', margin: 0 }}>
                      <div><dt style={metaLabel}>Họ tên</dt><dd style={metaValue}>{preview.full_name}</dd></div>
                      <div><dt style={metaLabel}>Liên hệ</dt><dd style={metaValue}>{preview.email}</dd><dd style={{ ...metaValue, fontWeight: 500, color: '#475569', fontSize: 13 }}>{preview.phone || 'Chưa cập nhật SĐT'}</dd></div>
                      <div><dt style={metaLabel}>Vai trò</dt><dd style={metaValue}>{ROLE_LABEL[preview.role] || preview.role}</dd></div>
                      <div><dt style={metaLabel}>Trạng thái tài khoản</dt><dd style={metaValue}>{USER_STATUS_LABEL[preview.status] || preview.status}</dd></div>
                    </dl>
                  )
                ) : (
                  <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>Đối tượng đã bị xóa hoặc không còn tồn tại.</p>
                )}
              </section>

              {/* Lịch sử xử lý */}
              <section style={cardStyle}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>Lịch sử xử lý</h2>
                {reportDetail.history.length === 0 ? (
                  <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>Chưa có quyết định xử lý nào cho báo cáo này.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #CBD5E1', color: '#475569', fontSize: 13 }}>
                        <th style={{ padding: '8px 10px' }}>Thời gian</th>
                        <th style={{ padding: '8px 10px' }}>Quản trị viên</th>
                        <th style={{ padding: '8px 10px' }}>Hành động</th>
                        <th style={{ padding: '8px 10px' }}>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportDetail.history.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px', color: '#475569', whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</td>
                          <td style={{ padding: '10px', fontWeight: 700 }}>{item.admin_name || 'Quản trị viên'}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ ...badgeBase, background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1' }}>
                              {ACTION_LABEL[item.action] || item.action}
                            </span>
                          </td>
                          <td style={{ padding: '10px', color: '#334155' }}>{item.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </div>

            {/* CỘT PHẢI: KHUNG XỬ LÝ — đứng yên */}
            <div className="jn-mod-scroll" style={{ ...cardStyle, alignSelf: 'start', maxHeight: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Xử lý báo cáo</h2>
              <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                {isResolved ? 'Báo cáo đã được xử lý. Bạn vẫn có thể bổ sung quyết định mới.' : 'Chọn hành động phù hợp sau khi xem xét nội dung báo cáo.'}
              </p>

              <label htmlFor="report-action" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                Hành động
              </label>
              <select
                id="report-action"
                value={actionOptions.includes(actionChoice) ? actionChoice : 'WARNING'}
                onChange={(e) => setActionChoice(e.target.value)}
                style={{ width: '100%', height: 40, borderRadius: 8, border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: 14, fontWeight: 600, background: '#ffffff', marginBottom: 6 }}
              >
                {actionOptions.map(a => <option key={a} value={a}>{ACTION_LABEL[a]}</option>)}
              </select>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 14, lineHeight: 1.5 }}>
                {ACTION_HINT[actionOptions.includes(actionChoice) ? actionChoice : 'WARNING']}
              </div>

              <label htmlFor="report-note" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                Ghi chú xử lý
              </label>
              <textarea
                id="report-note"
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Kết quả xem xét và lý do đưa ra quyết định…"
                style={{ width: '100%', borderRadius: 8, border: '1.5px solid #CBD5E1', padding: '10px 12px', fontSize: 14, boxSizing: 'border-box', resize: 'vertical', marginBottom: 14 }}
              />

              <button
                type="button"
                onClick={() => handleResolveReport()}
                disabled={submittingAction}
                style={{ width: '100%', padding: '11px 18px', borderRadius: 8, border: 'none', background: '#0F172A', color: '#ffffff', fontSize: 14.5, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}
              >
                <Send size={15} />
                <span>{submittingAction ? 'Đang lưu...' : 'Lưu quyết định'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleResolveReport('DISMISS', actionNote.trim() || 'Đã xem xét, không phát hiện vi phạm.')}
                disabled={submittingAction}
                style={{ width: '100%', padding: '10px 18px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#ffffff', color: '#334155', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <CheckCircle2 size={15} color="#047857" />
                <span>Không vi phạm — đóng báo cáo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: REPORTS LIST
  // =========================================================================
  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              QUẢN LÝ BÁO CÁO VI PHẠM
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Báo cáo vi phạm
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ExportMenu
            disabled={loading}
            onError={() => showToast && showToast('Xuất báo cáo thất bại', 'error')}
            getReport={async () => {
              const params = new URLSearchParams({ limit: '5000' });
              if (statusFilter !== 'ALL') params.append('status', statusFilter);
              if (targetTypeFilter !== 'ALL') params.append('target_type', targetTypeFilter);
              const res = await fetch(`${API_BASE}/admin/reports?${params}`, { headers: { Authorization: `Bearer ${currentUser?.token}` } });
              const data = await res.json();
              if (!res.ok || !data.success) throw new Error(data.message || 'Không tải được dữ liệu');
              const rows = data.data || [];
              return {
                title: 'Báo cáo xử lý vi phạm',
                subtitle: `Trạng thái: ${{ ALL: 'Tất cả', OPEN: 'Chờ xử lý', RESOLVED: 'Đã xử lý' }[statusFilter]} · Đối tượng: ${{ ALL: 'Tất cả', JOB: 'Tin tuyển dụng', USER: 'Người dùng' }[targetTypeFilter]}`,
                fileName: 'bao-cao-vi-pham',
                author: currentUser?.full_name,
                summary: [
                  ['Tổng báo cáo', rows.length],
                  ['Chờ xử lý', rows.filter(r => r.status === 'OPEN' || r.status === 'PENDING').length],
                  ['Đã xử lý', rows.filter(r => r.status === 'RESOLVED').length],
                  ['Về tin tuyển dụng', rows.filter(r => r.target_type === 'JOB').length],
                  ['Về người dùng', rows.filter(r => r.target_type === 'USER').length],
                ],
                columns: [
                  { header: 'Mã', value: r => `R-${String(r.id).padStart(3, '0')}`, width: 9 },
                  { header: 'Người báo cáo', value: r => r.reporter_name || 'Ẩn danh', width: 22 },
                  { header: 'Email', value: r => r.reporter_email, width: 26 },
                  { header: 'Đối tượng', value: r => `${r.target_type === 'JOB' ? 'Tin' : 'Người dùng'} #${r.target_id}`, width: 15 },
                  { header: 'Tên đối tượng', value: r => r.target_title, width: 28 },
                  { header: 'Lý do', value: r => r.reason, width: 26 },
                  { header: 'Mô tả', value: r => r.description, width: 40 },
                  { header: 'Trạng thái', value: r => STATUS_LABEL[r.status] || 'Chờ xử lý', width: 14 },
                  { header: 'Thời gian', value: r => r.created_at, type: 'datetime', width: 16 },
                ],
                rows,
              };
            }}
          />
          <Button
            variant="secondary"
            onClick={() => fetchReports(true)}
            disabled={refreshing}
            style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới ({reports.length})</span>
          </Button>
        </div>
      </div>

      {/* Bộ lọc: Trạng thái, Đối tượng */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                height: 36,
                borderRadius: 6,
                border: '1px solid var(--color-border-hover)',
                padding: '0 10px',
                fontSize: 13,
                fontWeight: 600,
                background: '#ffffff'
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OPEN">Chờ xử lý</option>
              <option value="RESOLVED">Đã xử lý</option>
            </select>
          </div>

          {/* Target type filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Đối tượng:</span>
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              style={{
                height: 36,
                borderRadius: 6,
                border: '1px solid var(--color-border-hover)',
                padding: '0 10px',
                fontSize: 13,
                fontWeight: 600,
                background: '#ffffff'
              }}
            >
              <option value="ALL">Tất cả đối tượng</option>
              <option value="JOB">Tin tuyển dụng</option>
              <option value="USER">Người dùng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bảng danh sách báo cáo vi phạm (WF-A05 Table) */}
      {/* Cột: Mã | Người báo cáo | Đối tượng | Lý do | Trạng thái | Thời gian | Thao tác */}
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
            <div>Đang tải danh sách báo cáo...</div>
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            title="Không có báo cáo vi phạm nào"
            description="Tuyệt vời! Hiện tại không có tố cáo vi phạm nào từ người dùng hoặc tin đăng."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border-hover)', fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}>
                  <th style={{ padding: '12px 12px', width: 70 }}>Mã</th>
                  <th style={{ padding: '12px 12px' }}>Người báo cáo</th>
                  <th style={{ padding: '12px 12px', width: 190 }}>Đối tượng</th>
                  <th style={{ padding: '12px 12px' }}>Lý do</th>
                  <th style={{ padding: '12px 12px', width: 110 }}>Trạng thái</th>
                  <th style={{ padding: '12px 12px', width: 100 }}>Thời gian</th>
                  <th style={{ padding: '12px 12px', width: 100, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '12px 12px', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>
                      {reportCode(rep.id)}
                    </td>

                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>
                        {rep.reporter_name || 'Người dùng ẩn danh'}
                      </div>
                      <div style={{ fontSize: 13, color: '#475569', overflowWrap: 'anywhere' }}>
                        {rep.reporter_email}
                      </div>
                    </td>

                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ ...badgeBase, ...(TARGET_BADGE[rep.target_type] || TARGET_BADGE.USER), marginBottom: 4 }}>
                        {targetLabel(rep)}
                      </span>
                      <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rep.target_title || 'Đối tượng tố cáo'}
                      </div>
                    </td>

                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>
                        {rep.reason}
                      </div>
                      <div style={{ fontSize: 13, color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rep.description}
                      </div>
                    </td>

                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ ...badgeBase, ...(STATUS_BADGE[rep.status] || STATUS_BADGE.OPEN) }}>
                        {rep.status === 'RESOLVED' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {STATUS_LABEL[rep.status] || 'Chờ xử lý'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 12px', color: '#475569', fontSize: 13, lineHeight: 1.4 }}>
                      {formatDate(rep.created_at).split(' ').map((part, i) => <div key={i}>{part}</div>)}
                    </td>

                    <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => openReportDetail(rep.id)}
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
                        <span>Xử lý</span>
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

