import React, { useState, useEffect } from 'react';
import { 
  FileText, Briefcase, Calendar, MapPin, DollarSign, 
  Building2, ArrowLeft, Download, ExternalLink, CheckCircle2, 
  Clock, XCircle, AlertCircle, RefreshCw, ChevronRight, User, AlertTriangle, X
} from 'lucide-react';
import { Button, AnimatedModal } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';
import ProfileSnapshotView from '../../components/student/ProfileSnapshotView';

export default function ApplicationDetailPage({
  applicationId,
  currentUser,
  onNavigateBack,
  onSelectJob,
  showToast
}) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReasonPreset, setCancelReasonPreset] = useState('Đã tìm được việc làm khác phù hợp hơn');
  const [cancelReasonCustom, setCancelReasonCustom] = useState('');

  const handleOpenCancelModal = () => {
    setCancelReasonPreset('Đã tìm được việc làm khác phù hợp hơn');
    setCancelReasonCustom('');
    setCancelModalOpen(true);
  };

  const handleConfirmWithdraw = async (e) => {
    e?.preventDefault();
    const finalReason = cancelReasonPreset === 'Khác'
      ? cancelReasonCustom.trim()
      : (cancelReasonCustom.trim() ? `${cancelReasonPreset}: ${cancelReasonCustom.trim()}` : cancelReasonPreset);

    if (!finalReason) {
      if (showToast) showToast('Vui lòng chọn hoặc nhập lý do hủy ứng tuyển', 'error');
      return;
    }

    setWithdrawing(true);
    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}/withdraw`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}` 
        },
        body: JSON.stringify({ reason: finalReason })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Không hủy được đơn ứng tuyển.');
      if (showToast) showToast('Đã hủy đơn ứng tuyển và gửi thông báo lý do đến Nhà tuyển dụng!', 'success');
      setCancelModalOpen(false);
      await fetchApplicationDetail();
    } catch (err) {
      if (showToast) showToast(err.message || 'Không hủy được đơn ứng tuyển.', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const fetchApplicationDetail = async () => {
    if (!applicationId) {
      setError('Thiếu mã đơn ứng tuyển');
      setLoading(false);
      return;
    }

    if (!currentUser?.token) {
      setError('Vui lòng đăng nhập để xem chi tiết đơn ứng tuyển');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Bạn không có quyền truy cập vào hồ sơ ứng tuyển này');
        }
        if (res.status === 404) {
          throw new Error('Không tìm thấy thông tin đơn ứng tuyển');
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Lỗi khi tải chi tiết đơn ứng tuyển');
      }

      const data = await res.json();
      setApplication(data.data || data);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId, currentUser]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const formatSalary = (amount, type) => {
    if (!amount) return 'Thỏa thuận';
    const num = Number(amount).toLocaleString('vi-VN');
    if (type === 'HOURLY') return `${num} đ/giờ`;
    if (type === 'DAILY') return `${num} đ/ngày`;
    if (type === 'MONTHLY') return `${num} đ/tháng`;
    return `${num} đ/dự án`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WITHDRAWN':
        return { label: 'ĐÃ RÚT ĐƠN', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', icon: XCircle };
      case 'ACCEPTED':
        return { label: 'ĐÃ TIẾP NHẬN / TRÚNG TUYỂN', bg: '#DCFCE7', color: '#166534', border: '#86EFAC', icon: CheckCircle2 };
      case 'SHORTLISTED':
        return { label: 'DANH SÁCH RÚT GỌN', bg: '#EDE9FE', color: '#6B21A8', border: '#C4B5FD', icon: Clock };
      case 'REJECTED':
        return { label: 'CHƯA PHÙ HỢP', bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', icon: XCircle };
      case 'PENDING':
      default:
        return { label: 'ĐANG XEM XÉT', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', icon: Clock };
    }
  };

  const badge = getStatusBadge(application?.status);
  const StatusIcon = badge.icon;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Top Breadcrumbs */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #E2E8F0', padding: '14px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#64748B' }}>
            <button 
              onClick={onNavigateBack}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
            >
              Lịch sử ứng tuyển
            </button>
            <ChevronRight size={14} />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Chi tiết đơn #{applicationId}</span>
          </div>

          <button
            onClick={onNavigateBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} /> Quay lại danh sách
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '24px auto', padding: '0 20px' }}>
        {/* ================= STATE 1: LOADING ================= */}
        {loading && (
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 36, border: '1px solid #E2E8F0' }}>
            <div style={{ height: 28, width: '40%', background: '#E2E8F0', borderRadius: 6, marginBottom: 16 }} className="animate-pulse" />
            <div style={{ height: 18, width: '60%', background: '#E2E8F0', borderRadius: 4, marginBottom: 24 }} className="animate-pulse" />
            <div style={{ height: 120, background: '#F8FAFC', borderRadius: 12 }} className="animate-pulse" />
          </div>
        )}

        {/* ================= STATE 2: ERROR ================= */}
        {!loading && error && (
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '48px 24px', textAlign: 'center', border: '1px solid #FCA5A5' }}>
            <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>{error}</h3>
            <p style={{ color: '#64748B', fontSize: 14, margin: '0 auto 20px auto' }}>
              Vui lòng kiểm tra lại tài khoản hoặc quyền truy cập của bạn.
            </p>
            <button
              onClick={fetchApplicationDetail}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 8,
                background: '#7565A8',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} /> Thử lại
            </button>
          </div>
        )}

        {/* ================= STATE 3: SUCCESS & CONTENT (WF-S12) ================= */}
        {!loading && !error && application && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top Job Summary Card */}
            <div 
              style={{
                background: '#ffffff',
                borderRadius: 16,
                border: '1.5px solid #000000',
                padding: '24px 28px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span 
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <StatusIcon size={14} /> {badge.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: '#F1F5F9', color: '#475569' }}>
                      {application.work_type === 'FULL_TIME' ? 'VIỆC TOÀN THỜI GIAN' : 'VIỆC BÁN THỜI GIAN'}
                    </span>
                  </div>

                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                    {application.job_title}
                  </h1>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13.5, color: '#475569' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Building2 size={15} color="#7565A8" />
                      {application.employer_name || 'Nhà tuyển dụng'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={15} color="#64748B" />
                      {application.location || 'TP. Hồ Chí Minh'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <DollarSign size={15} color="#16A34A" />
                      <strong style={{ color: '#16A34A' }}>{formatSalary(application.salary, application.salary_type)}</strong>
                    </span>
                  </div>
                </div>

                {onSelectJob && (
                  <button
                    onClick={() => onSelectJob({ id: application.job_id, title: application.job_title })}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      color: '#334155',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Xem tin gốc <ExternalLink size={13} />
                  </button>
                )}
              </div>

              {/* Status Timeline / Stepper (WF-S12) */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #F1F5F9' }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 16 }}>
                  Tiến trình xét duyệt hồ sơ
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div style={{ padding: 14, borderRadius: 10, background: '#DCFCE7', border: '1px solid #86EFAC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>
                      <CheckCircle2 size={16} /> 1. Đã nộp đơn
                    </div>
                    <span style={{ fontSize: 12, color: '#15803D' }}>{formatDate(application.applied_at)}</span>
                  </div>

                  <div style={{ 
                    padding: 14, 
                    borderRadius: 10, 
                    background: ['ACCEPTED', 'REJECTED'].includes(application.status) ? '#DCFCE7' : '#FEF3C7', 
                    border: ['ACCEPTED', 'REJECTED'].includes(application.status) ? '1px solid #86EFAC' : '1px solid #FCD34D' 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6, 
                      color: ['ACCEPTED', 'REJECTED'].includes(application.status) ? '#166534' : '#92400E', 
                      fontWeight: 700, 
                      fontSize: 13.5, 
                      marginBottom: 4 
                    }}>
                      <Clock size={16} /> 2. Đang xem xét
                    </div>
                    <span style={{ fontSize: 12, color: ['ACCEPTED', 'REJECTED'].includes(application.status) ? '#15803D' : '#B45309' }}>
                      {application.status === 'SHORTLISTED' ? 'Đã vào vòng rút gọn' : 'Nhà tuyển dụng đã nhận'}
                    </span>
                  </div>

                  <div style={{ 
                    padding: 14, 
                    borderRadius: 10, 
                    background: application.status === 'ACCEPTED' ? '#DCFCE7' : application.status === 'REJECTED' ? '#FEE2E2' : '#F1F5F9',
                    border: application.status === 'ACCEPTED' ? '1px solid #86EFAC' : application.status === 'REJECTED' ? '1px solid #FCA5A5' : '1px solid #E2E8F0'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6, 
                      color: application.status === 'ACCEPTED' ? '#166534' : application.status === 'REJECTED' ? '#991B1B' : '#64748B', 
                      fontWeight: 700, 
                      fontSize: 13.5, 
                      marginBottom: 4 
                    }}>
                      {application.status === 'ACCEPTED' ? <CheckCircle2 size={16} /> : application.status === 'REJECTED' ? <XCircle size={16} /> : <Clock size={16} />}
                      3. Kết quả tuyển dụng
                    </div>
                    <span style={{ fontSize: 12, color: application.status === 'ACCEPTED' ? '#15803D' : application.status === 'REJECTED' ? '#B91C1C' : '#94A3B8' }}>
                      {application.status === 'ACCEPTED' ? 'Trúng tuyển nhận việc' : application.status === 'REJECTED' ? 'Chưa phù hợp' : application.status === 'WITHDRAWN' ? 'Bạn đã rút đơn' : 'Đang chờ quyết định'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rejection Alert if REJECTED */}
              {application.status === 'REJECTED' && (
                <div 
                  style={{
                    marginTop: 16,
                    padding: '14px 18px',
                    borderRadius: 10,
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                  }}
                >
                  <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h5 style={{ fontSize: 14, fontWeight: 700, color: '#991B1B', margin: '0 0 4px 0' }}>
                      Lý do từ chối từ Nhà tuyển dụng:
                    </h5>
                    <p style={{ fontSize: 13.5, color: '#7F1D1D', margin: 0 }}>
                      {application.rejection_reason || 'Rất tiếc đợt tuyển này đã đủ số lượng ứng viên hoặc chưa phù hợp với tiêu chí hiện tại.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submitted Application Details (WF-S12) */}
            <div 
              style={{
                background: '#ffffff',
                borderRadius: 16,
                border: '1.5px solid #000000',
                padding: '24px 28px'
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                Nội dung hồ sơ bạn đã gửi
              </h2>
              <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 12px 0' }}>
                {application.profile_snapshot_is_current
                  ? 'Đơn này được nộp trước khi JobNest lưu bản chụp hồ sơ, nên đang hiển thị hồ sơ hiện tại của bạn.'
                  : application.profile_snapshot?.captured_at
                    ? `Hồ sơ tại thời điểm nộp đơn (${formatDate(application.profile_snapshot.captured_at)}). Nhà tuyển dụng xem đúng nội dung này.`
                    : 'Thông tin hồ sơ gửi kèm đơn ứng tuyển.'}
              </p>

              <ProfileSnapshotView profile={application.profile_snapshot} />

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16 }} />

              {/* CV File */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  File CV đính kèm
                </label>
                {application.cv_url ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', maxWidth: 460 }}>
                    <FileText size={24} color="#7565A8" />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {application.cv_url.split('/').pop() || 'Curriculum_Vitae.pdf'}
                      </span>
                      <span style={{ fontSize: 11.5, color: '#64748B' }}>Định dạng PDF đã tải lên</span>
                    </div>
                    <a
                      href={application.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: '#7565A8',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <Download size={13} /> Xem CV
                    </a>
                  </div>
                ) : (
                  <p style={{ fontSize: 13.5, color: '#64748B', fontStyle: 'italic', margin: 0 }}>
                    Ứng tuyển bằng hồ sơ trực tuyến JobNest (không đính kèm file riêng).
                  </p>
                )}
              </div>

              {/* Cover Letter */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  Thư giới thiệu / Lời nhắn tới Nhà tuyển dụng
                </label>
                <div style={{ padding: '14px 18px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13.5, color: '#334155', lineHeight: 1.6, minHeight: 80 }}>
                  {application.cover_letter || 'Không có thư giới thiệu.'}
                </div>
              </div>

              {/* Thao tác: rút đơn khi còn chờ duyệt */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, paddingTop: 18, borderTop: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#64748B' }}>
                  {application.status === 'PENDING' ? (
                    <button
                      type="button"
                      onClick={handleOpenCancelModal}
                      disabled={withdrawing}
                      style={{
                        padding: '9px 18px',
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1.5px solid #FCA5A5',
                        color: '#B91C1C',
                        fontSize: 13.5,
                        fontWeight: 600,
                        cursor: withdrawing ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <XCircle size={15} /> {withdrawing ? 'Đang hủy đơn...' : 'Hủy đơn ứng tuyển'}
                    </button>
                  ) : application.status === 'WITHDRAWN' ? (
                    <div>
                      <span style={{ color: '#DC2626', fontWeight: 600 }}>
                        Bạn đã hủy đơn này{application.withdrawn_at ? ` ngày ${formatDate(application.withdrawn_at)}` : ''}.
                      </span>
                      {application.withdraw_reason && (
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                          Lý do đã gửi: "{application.withdraw_reason}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>Đơn đã có kết quả nên không thể rút.</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onNavigateBack}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    background: '#7565A8',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL NHẬP LÝ DO HỦY ỨNG TUYỂN */}
        {cancelModalOpen && (
          <AnimatedModal
            isOpen={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            maxWidth={540}
          >
            <form onSubmit={handleConfirmWithdraw} style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11.5, fontWeight: 800, background: '#FEF2F2', color: '#DC2626', padding: '3px 10px', borderRadius: 12 }}>
                    HỦY ĐƠN ỨNG TUYỂN
                  </span>
                  <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-text)', margin: '8px 0 2px 0' }}>
                    Xác nhận rút đơn ứng tuyển
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ background: '#F8F7FB', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 13, border: '1px solid var(--color-border)' }}>
                <div>Vị trí: <strong>{application?.job_title}</strong></div>
                <div>Doanh nghiệp: <strong>{application?.employer_name || application?.company_name || 'Nhà tuyển dụng'}</strong></div>
              </div>

              {/* Chọn lý do mẫu */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                  Vui lòng chọn lý do vì sao bạn hủy ứng tuyển:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Đã tìm được việc làm khác phù hợp hơn',
                    'Bị trùng lịch học / Lịch thi của trường',
                    'Khoảng cách đi lại quá xa, không thuận tiện',
                    'Thời gian hoặc ca làm việc chưa phù hợp',
                    'Khác'
                  ].map((reason) => (
                    <label
                      key={reason}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 14px',
                        borderRadius: 8,
                        border: '1.5px solid',
                        borderColor: cancelReasonPreset === reason ? 'var(--color-primary)' : 'var(--color-border)',
                        background: cancelReasonPreset === reason ? 'var(--color-lavender-light)' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: cancelReasonPreset === reason ? 700 : 500,
                        color: cancelReasonPreset === reason ? 'var(--color-primary)' : 'var(--color-text)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name="detailCancelPreset"
                        checked={cancelReasonPreset === reason}
                        onChange={() => setCancelReasonPreset(reason)}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Textarea nhập chi tiết lý do */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                  {cancelReasonPreset === 'Khác' ? 'Nhập chi tiết lý do (Bắt buộc):' : 'Ghi chú thêm gửi đến Nhà tuyển dụng (Không bắt buộc):'}
                </label>
                <textarea
                  value={cancelReasonCustom}
                  onChange={(e) => setCancelReasonCustom(e.target.value)}
                  required={cancelReasonPreset === 'Khác'}
                  placeholder="Nêu rõ lý do vì sao bạn muốn hủy đơn ứng tuyển này..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', fontSize: 13.5, resize: 'vertical' }}
                />
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  ℹ️ Lý do này sẽ được gửi trực tiếp đến Nhà tuyển dụng để họ nắm thông tin.
                </div>
              </div>

              {/* Nút hành động */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button type="button" variant="secondary" onClick={() => setCancelModalOpen(false)}>
                  Giữ lại đơn
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={withdrawing}
                  style={{ background: '#DC2626', border: 'none', fontWeight: 800, padding: '9px 20px' }}
                >
                  {withdrawing ? 'Đang gửi...' : 'Xác nhận hủy ứng tuyển'}
                </Button>
              </div>
            </form>
          </AnimatedModal>
        )}
      </div>
    </div>
  );
}

