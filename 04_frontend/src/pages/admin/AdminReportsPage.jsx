import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, XCircle, 
  ArrowLeft, RefreshCw, Eye, User, Briefcase, Clock, 
  Send, History, Shield, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';

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
  const handleResolveReport = async () => {
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
          action: actionChoice,
          note: actionNote.trim()
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
    return (
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
        {/* Header back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                CHI TIẾT BÁO CÁO VI PHẠM
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Xử lý báo cáo vi phạm: #{selectedReportId}
            </h1>
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              setSelectedReportId(null);
              setReportDetail(null);
            }}
            style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}
          >
            <ArrowLeft size={15} />
            <span>Quay lại danh sách</span>
          </Button>
        </div>

        {loadingDetail || !reportDetail ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Đang tải chi tiết báo cáo vi phạm...</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
            gap: 24,
            alignItems: 'start'
          }}>
            {/* CỘT TRÁI: NỘI DUNG, TARGET PREVIEW, REPORTER, LỊCH SỬ XỬ LÝ (WF-A06) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Thẻ 1: Thông tin báo cáo & Người báo cáo */}
              <div style={{
                background: '#ffffff',
                borderRadius: 14,
                border: '1.5px solid #000000',
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 800,
                    background: reportDetail.report.target_type === 'JOB' ? '#EEF2FF' : '#FEF2F2',
                    color: reportDetail.report.target_type === 'JOB' ? '#4F46E5' : '#DC2626',
                    border: '1px solid #CBD5E1'
                  }}>
                    ĐỐI TƯỢNG: {reportDetail.report.target_type} #{reportDetail.report.target_id}
                  </span>

                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 800,
                    background: reportDetail.report.status === 'OPEN' ? '#FEF3C7' : '#DCFCE7',
                    color: reportDetail.report.status === 'OPEN' ? '#D97706' : '#15803D',
                    border: '1px solid #CBD5E1'
                  }}>
                    {reportDetail.report.status}
                  </span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                  Lý do: {reportDetail.report.reason}
                </h3>

                <div style={{
                  padding: '12px 14px',
                  background: '#F8FAFC',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  fontSize: 13.5,
                  color: '#334155',
                  lineHeight: 1.6,
                  marginBottom: 16
                }}>
                  <strong>• Nội dung tố cáo:</strong>
                  <p style={{ margin: '6px 0 0 0' }}>
                    {reportDetail.report.description || 'Không có mô tả chi tiết thêm.'}
                  </p>
                </div>

                <div style={{ fontSize: 12.5, color: '#64748B', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong>• Reporter:</strong> {reportDetail.report.reporter_name} ({reportDetail.report.reporter_email})
                  </div>
                  <div>
                    <strong>Thời gian gửi:</strong> {formatDate(reportDetail.report.created_at)}
                  </div>
                </div>
              </div>

              {/* Thẻ 2: Target Preview (Tin tuyển dụng hoặc Tài khoản bị tố cáo) */}
              <div style={{
                background: '#ffffff',
                borderRadius: 14,
                border: '1.5px solid #000000',
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
                  • Target Preview (Bản xem trước đối tượng bị báo cáo):
                </h4>

                {reportDetail.target_preview ? (
                  <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}>
                    {reportDetail.report.target_type === 'JOB' ? (
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                          {reportDetail.target_preview.title}
                        </div>
                        <div style={{ color: '#4F46E5', fontWeight: 700, marginBottom: 6 }}>
                          Doanh nghiệp: {reportDetail.target_preview.employer_name} ({reportDetail.target_preview.employer_email})
                        </div>
                        <div style={{ color: '#059669', fontWeight: 700, marginBottom: 8 }}>
                          Lương: {reportDetail.target_preview.salary} | Trạng thái: {reportDetail.target_preview.status}
                        </div>
                        <div style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.5, maxHeight: 90, overflow: 'hidden' }}>
                          {reportDetail.target_preview.description}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                          {reportDetail.target_preview.full_name}
                        </div>
                        <div style={{ color: '#64748B', marginBottom: 4 }}>
                          Email: {reportDetail.target_preview.email} | SĐT: {reportDetail.target_preview.phone || 'Chưa cập nhật'}
                        </div>
                        <div style={{ color: '#B91C1C', fontWeight: 700 }}>
                          Role: {reportDetail.target_preview.role} | Status: {reportDetail.target_preview.status}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#94A3B8', fontSize: 13, fontStyle: 'italic' }}>
                    Đối tượng đã bị xóa hoặc không còn tồn tại trên cơ sở dữ liệu.
                  </div>
                )}
              </div>

              {/* Thẻ 3: Lịch sử xử lý (WF-A06 Table) */}
              <div style={{
                background: '#ffffff',
                borderRadius: 14,
                border: '1.5px solid #000000',
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
                  Lịch sử xử lý (Action History):
                </h4>

                {reportDetail.history.length === 0 ? (
                  <div style={{ color: '#64748B', fontSize: 13, fontStyle: 'italic' }}>
                    Chưa có quyết định xử lý nào được thực hiện cho báo cáo này.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid #CBD5E1', color: '#64748B', fontSize: 12 }}>
                        <th style={{ padding: '8px 10px' }}>Thời gian</th>
                        <th style={{ padding: '8px 10px' }}>Admin</th>
                        <th style={{ padding: '8px 10px' }}>Hành động</th>
                        <th style={{ padding: '8px 10px' }}>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportDetail.history.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {formatDate(item.created_at)}
                          </td>
                          <td style={{ padding: '10px', fontWeight: 700 }}>
                            {item.admin_name || 'Admin'}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 11.5,
                              fontWeight: 800,
                              background: '#F1F5F9',
                              color: '#0F172A'
                            }}>
                              {item.action}
                            </span>
                          </td>
                          <td style={{ padding: '10px', color: '#334155' }}>
                            {item.note || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* CỘT PHẢI: KHUNG XỬ LÝ (RESOLUTION PANEL) CHUẨN WIREFRAME WF-A06 */}
            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '2px solid #000000',
              padding: 24,
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              position: 'sticky',
              top: 90
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
                Xử lý báo cáo (Resolution)
              </h3>

              {/* Chọn Hành động */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                  Hành động (Action):
                </label>
                <select
                  value={actionChoice}
                  onChange={(e) => setActionChoice(e.target.value)}
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 8,
                    border: '1.5px solid #000000',
                    padding: '0 10px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    background: '#ffffff'
                  }}
                >
                  <option value="WARNING">Cảnh cáo đối tượng (WARNING)</option>
                  <option value="BAN_USER">Khóa tài khoản vi phạm (BAN_USER)</option>
                  <option value="REMOVE_JOB">Gỡ tin tuyển dụng vi phạm (REMOVE_JOB)</option>
                  <option value="DISMISS">Bác bỏ báo cáo (DISMISS)</option>
                </select>
              </div>

              {/* Ghi chú */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                  Ghi chú xử lý (Note):
                </label>
                <textarea
                  rows={4}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Ghi chú kết quả điều tra và lý do đưa ra quyết định..."
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    padding: '10px 12px',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Nút 1: Lưu xử lý */}
              <button
                type="button"
                onClick={handleResolveReport}
                disabled={submittingAction}
                style={{
                  width: '100%',
                  padding: '11px 18px',
                  borderRadius: 8,
                  border: '1.5px solid #000000',
                  background: '#0F172A',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 10
                }}
              >
                <Send size={15} />
                <span>{submittingAction ? 'Đang lưu...' : 'Lưu xử lý'}</span>
              </button>

              {/* Nút 2: Đóng báo cáo */}
              <button
                type="button"
                onClick={() => {
                  setActionChoice('DISMISS');
                  setActionNote('Đã xem xét và đóng báo cáo.');
                  handleResolveReport();
                }}
                disabled={submittingAction}
                style={{
                  width: '100%',
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#334155',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 12
                }}
              >
                <CheckCircle2 size={15} color="#059669" />
                <span>Đóng báo cáo</span>
              </button>

              {/* Nút 3: Quay lại */}
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedReportId(null);
                  setReportDetail(null);
                }}
                style={{ width: '100%', padding: '10px', fontSize: 13 }}
              >
                Quay lại
              </Button>
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

      {/* Bộ lọc chuẩn Wireframe WF-A05: Status (OPEN/RESOLVED), Target type */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                height: 36,
                borderRadius: 6,
                border: '1.5px solid #000000',
                padding: '0 10px',
                fontSize: 13,
                fontWeight: 600,
                background: '#ffffff'
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OPEN">Chờ xử lý (OPEN)</option>
              <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
            </select>
          </div>

          {/* Target type filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Target type:</span>
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              style={{
                height: 36,
                borderRadius: 6,
                border: '1.5px solid #000000',
                padding: '0 10px',
                fontSize: 13,
                fontWeight: 600,
                background: '#ffffff'
              }}
            >
              <option value="ALL">Tất cả đối tượng</option>
              <option value="JOB">Tin tuyển dụng (JOB)</option>
              <option value="USER">Người dùng (USER)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bảng danh sách báo cáo vi phạm (WF-A05 Table) */}
      {/* Cột: Report ID | Reporter | Target | Reason | Status | Thao tác */}
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
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #000000', fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}>
                  <th style={{ padding: '14px 16px', width: 90 }}>Report ID</th>
                  <th style={{ padding: '14px 16px' }}>Reporter</th>
                  <th style={{ padding: '14px 16px', width: 180 }}>Target</th>
                  <th style={{ padding: '14px 16px' }}>Reason</th>
                  <th style={{ padding: '14px 16px', width: 130 }}>Status</th>
                  <th style={{ padding: '14px 16px', width: 150 }}>Thời gian</th>
                  <th style={{ padding: '14px 16px', width: 150, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#64748B' }}>
                      R-{String(rep.id).padStart(3, '0')}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>
                        {rep.reporter_name || 'Người dùng ẩn danh'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        {rep.reporter_email}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 800,
                        background: rep.target_type === 'JOB' ? '#EEF2FF' : '#FEF2F2',
                        color: rep.target_type === 'JOB' ? '#4F46E5' : '#DC2626',
                        border: '1px solid #CBD5E1',
                        display: 'inline-block',
                        marginBottom: 4
                      }}>
                        {rep.target_type} #{rep.target_id}
                      </span>
                      <div style={{ fontSize: 12, color: '#0F172A', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rep.target_title || 'Đối tượng tố cáo'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>
                        {rep.reason}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rep.description}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11.5,
                        fontWeight: 800,
                        background: rep.status === 'OPEN' ? '#FEF3C7' : '#DCFCE7',
                        color: rep.status === 'OPEN' ? '#D97706' : '#15803D',
                        border: `1px solid ${rep.status === 'OPEN' ? '#FDE68A' : '#86EFAC'}`
                      }}>
                        {rep.status === 'OPEN' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                        {rep.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {formatDate(rep.created_at)}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => openReportDetail(rep.id)}
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
                        <span>Xử lý → A06</span>
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

