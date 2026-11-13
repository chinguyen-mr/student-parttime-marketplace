import React, { useState, useEffect } from 'react';
import { Flag, X, AlertCircle, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import { API_BASE } from '../../config/api';
import { REPORT_REASONS } from '../../utils/reviewDisplay';

export default function ReportViolationModal({
  isOpen,
  onClose,
  targetType = 'JOB', // 'JOB' | 'USER' | 'COMPANY_REVIEW' | 'JOB_REVIEW'
  targetId,
  targetTitle = '',
  currentUser,
  showToast,
  onOpenAuth,
  onSubmitted, // tùy chọn: gọi sau khi gửi thành công
}) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDescription('');
      setErrorMsg('');
      setSubmitting(false);
    }
  }, [isOpen, targetId, targetType]);

  if (!isOpen) return null;

  const jobReasons = [
    'Thông tin tuyển dụng lừa đảo / giả mạo',
    'Yêu cầu đặt cọc tiền trái quy định',
    'Mô tả công việc không đúng thực tế',
    'Mức lương hoặc chế độ đãi ngộ gian lận',
    'Nội dung phản cảm / vi phạm pháp luật',
    'Khác'
  ];

  const userReasons = [
    'Hành vi quấy rối / đe dọa hoặc ngôn từ thù địch',
    'Thông tin liên hệ hoặc danh tính giả mạo',
    'Không thanh toán tiền lương như thỏa thuận',
    'Hành vi lừa đảo hoặc chiếm đoạt tài sản',
    'Spam / Gửi tin nhắn quảng cáo trái phép',
    'Khác'
  ];

  // Đánh giá: gửi mã lý do (value) tới API /reviews/:type/:id/reports
  const isReview = targetType === 'COMPANY_REVIEW' || targetType === 'JOB_REVIEW';
  const reasonOptions = isReview
    ? REPORT_REASONS.map(([value, label]) => ({ value, label }))
    : (targetType === 'JOB' ? jobReasons : userReasons).map(r => ({ value: r, label: r }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser?.token) {
      if (showToast) showToast('Vui lòng đăng nhập để gửi báo cáo vi phạm', 'error');
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    if (!reason) {
      setErrorMsg('Vui lòng chọn lý do báo cáo vi phạm');
      return;
    }

    if (description.trim().length > 0 && description.trim().length < 10) {
      setErrorMsg('Mô tả chi tiết phải có ít nhất 10 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      const url = isReview
        ? `${API_BASE}/reviews/${targetType === 'JOB_REVIEW' ? 'job' : 'company'}/${targetId}/reports`
        : `${API_BASE}/reports`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(isReview ? { reason, description: description.trim() } : {
          target_type: targetType,
          target_id: targetId,
          reason,
          description: description.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể gửi báo cáo vi phạm');
      }

      if (showToast) {
        showToast(data.message || 'Báo cáo vi phạm đã được gửi tới Quản trị viên xử lý', 'success');
      }
      onSubmitted?.();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi gửi báo cáo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.55)', 
        backdropFilter: 'blur(4px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div 
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Flag size={18} />
            </div>
            <div>
              <h2 id="report-modal-title" style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Báo cáo vi phạm
              </h2>
              <span style={{ fontSize: 12, color: '#64748B' }}>
                {isReview ? 'Đánh giá: ' : targetType === 'JOB' ? 'Tin tuyển dụng: ' : 'Người dùng / Nhà tuyển dụng: '}
                <strong style={{ color: '#334155' }}>{targetTitle || `#${targetId}`}</strong>
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {errorMsg && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '12px 14px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 8,
                marginBottom: 16,
                color: '#991B1B',
                fontSize: 13.5
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
              Lý do báo cáo vi phạm <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                fontSize: 14,
                color: '#0F172A',
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="">-- Chọn lý do phù hợp --</option>
              {reasonOptions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: '#1E293B', margin: 0 }}>
                Mô tả chi tiết bằng chứng vi phạm
              </label>
              <span style={{ fontSize: 12, color: description.length > 500 ? '#DC2626' : '#94A3B8' }}>
                {description.length}/500 ký tự
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              placeholder="Vui lòng cung cấp thêm thông tin chi tiết hoặc liên kết/nội dung trao đổi để Quản trị viên dễ dàng xác minh..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                fontSize: 13.5,
                color: '#0F172A',
                background: '#ffffff',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#64748B' }}>
              Báo cáo của bạn sẽ được giữ bí mật danh tính tuyệt đối với bên bị báo cáo.
            </p>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                background: '#ffffff',
                color: '#475569',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 22px',
                borderRadius: 8,
                border: 'none',
                background: '#DC2626',
                color: '#ffffff',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: submitting ? 0.75 : 1
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang gửi báo cáo...
                </>
              ) : (
                <>
                  <Flag size={15} />
                  Gửi báo cáo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

