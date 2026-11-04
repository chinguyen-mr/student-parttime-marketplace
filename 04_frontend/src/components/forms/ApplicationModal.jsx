import React, { useState } from 'react';
import { 
  Building2, MapPin, DollarSign, Clock, Calendar, 
  FileText, CheckCircle2, Award, Send, X, AlertCircle, ChevronDown, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedModal, Button, CustomDropdown } from '../ui';
import { API_BASE, formatApiError } from '../../config/api';

/**
 * WF-S06 — Application Form (PT/SV)
 * Dành riêng cho công việc PART_TIME và SEASONAL.
 * Bao gồm:
 * - Thông tin Job (Tên Job — Part-time / Seasonal)
 * - Chọn CV từ danh sách CV của sinh viên
 * - Thư giới thiệu (Cover Letter)
 * - Nút "Gửi ứng tuyển" & "Hủy"
 * - Dialog "Xác nhận gửi đơn": "Bạn chắc chắn muốn gửi đơn?" -> "Xác nhận" / "Hủy"
 * - Thành công -> Chuyển sang WF-S05 (Application History)
 */
export default function ApplicationModal({
  isOpen,
  onClose,
  job,
  currentUser,
  onSuccess,
  showToast
}) {
  const [selectedCv, setSelectedCv] = useState('CV_Nguyen_Van_Chi_Default.pdf');
  const [coverLetter, setCoverLetter] = useState('Em đã có kinh nghiệm phù hợp và có thể sắp xếp lịch học để hoàn thành tốt công việc.');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !job) return null;

  const cvOptions = [
    { value: 'CV_Nguyen_Van_Chi_Default.pdf', label: 'CV Mặc định: CV_Nguyen_Van_Chi_Default.pdf (Cập nhật 2026)' },
    { value: 'CV_PartTime_BanHang_Kho.pdf', label: 'CV Part-time Bán hàng & Dịch vụ: CV_PartTime_BanHang_Kho.pdf' },
    { value: 'CV_Ky_Thuat_CNTT.pdf', label: 'CV Chuyên ngành CNTT: CV_Ky_Thuat_CNTT.pdf' }
  ];

  const handleOpenConfirm = (e) => {
    e?.preventDefault();
    if (!coverLetter.trim() || coverLetter.trim().length < 10) {
      setErrorMsg('Vui lòng nhập thư giới thiệu tối thiểu 10 ký tự.');
      return;
    }
    setErrorMsg('');
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!currentUser?.token) {
      if (showToast) showToast('Vui lòng đăng nhập với tài khoản Sinh viên', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          job_id: job.id,
          cover_letter: coverLetter.trim(),
          cv_url: `https://jobnest.vn/uploads/cv/${selectedCv}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) {
          showToast('Nộp hồ sơ ứng tuyển thành công! Đang chuyển đến Lịch sử ứng tuyển (WF-S05)...', 'success');
        }
        setShowConfirmDialog(false);
        onClose();
        if (onSuccess) {
          onSuccess(data.data);
        }
      } else {
        const err = data.errors ? data.errors.join('; ') : data.message || 'Lỗi nộp đơn ứng tuyển';
        setErrorMsg(err);
        if (showToast) showToast(err, 'error');
      }
    } catch (err) {
      const errTxt = formatApiError(err, 'Lỗi kết nối máy chủ');
      setErrorMsg(errTxt);
      if (showToast) showToast(errTxt, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const jobTypeBadge = job.work_type === 'SEASONAL' ? 'Thời vụ / Tết (SEASONAL)' : 'Part-time Bán thời gian (PART_TIME)';

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="600px">
      <div style={{ padding: '26px 28px', position: 'relative' }}>
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{
                background: '#F1EEF8',
                color: '#7565A8',
                border: '1px solid #D8B4FE',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 700
              }}>
                WF-S06 — APPLICATION FORM
              </span>
              <span style={{
                background: '#FEF3C7',
                color: '#B45309',
                border: '1px solid #FDE68A',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 700
              }}>
                {jobTypeBadge}
              </span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0 0' }}>
              Đơn ứng tuyển công việc
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Job Info Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FAF8FD 0%, #FFFFFF 100%)',
          border: '1.5px solid #EDE9FE',
          borderRadius: 10,
          padding: '14px 16px',
          marginBottom: 20
        }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 2 }}>
            Công việc ứng tuyển
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', marginBottom: 6 }}>
            {job.title}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12.5, color: '#475569' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Building2 size={13} color="#7565A8" /> {job.company_name || job.employer_name || 'Doanh nghiệp đối tác'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <DollarSign size={13} color="#059669" />
              <strong style={{ color: '#059669' }}>
                {job.salary ? `${Number(job.salary).toLocaleString('vi-VN')} đ` : 'Thỏa thuận'}
              </strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} color="#64748B" /> {job.location || 'TP.HCM'}
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleOpenConfirm}>
          {/* Field 1: Chọn CV */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              Chọn CV đính kèm <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedCv}
                onChange={(e) => setSelectedCv(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid var(--color-border)',
                  fontSize: 13.5,
                  background: '#ffffff',
                  color: 'var(--color-text)',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {cvOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={16} color="#64748B" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: 11.5, color: 'var(--color-text-secondary)' }}>
              Được tải lên từ mục Quản lý CV (WF-S03). Doanh nghiệp sẽ nhận liên kết tệp PDF này.
            </p>
          </div>

          {/* Field 2: Thư giới thiệu (Cover Letter) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              Thư giới thiệu (Cover Letter) <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Giới thiệu về kỹ năng, kinh nghiệm và thời gian bạn có thể làm việc..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                fontSize: 13.5,
                background: '#ffffff',
                color: 'var(--color-text)',
                boxSizing: 'border-box',
                resize: 'vertical',
                outline: 'none',
                lineHeight: 1.5
              }}
            />
          </div>

          {errorMsg && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 12.5,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
              style={{ padding: '9px 18px', fontSize: 13 }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              style={{ padding: '9px 22px', fontSize: 13, gap: 6 }}
            >
              <Send size={14} /> Gửi ứng tuyển
            </Button>
          </div>
        </form>

        {/* =========================================================================
            CONFIRMATION DIALOG: "Xác nhận gửi đơn" theo wireframe WF-S06
            ========================================================================= */}
        {showConfirmDialog && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 50
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '24px 26px',
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              textAlign: 'center'
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#F1EEF8',
                color: '#7565A8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto'
              }}>
                <Send size={22} />
              </div>

              <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px 0' }}>
                Xác nhận gửi đơn
              </h4>
              <p style={{ fontSize: 13.5, color: '#475569', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                Bạn chắc chắn muốn gửi đơn ứng tuyển cho công việc <strong>"{job.title}"</strong>?
              </p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={submitting}
                  style={{ padding: '8px 18px', fontSize: 13 }}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                  style={{ padding: '8px 24px', fontSize: 13, gap: 6 }}
                >
                  {submitting ? 'Đang gửi...' : 'Xác nhận'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedModal>
  );
}
