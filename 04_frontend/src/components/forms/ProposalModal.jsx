import React, { useState } from 'react';
import { Send, DollarSign, Clock, FileText, X, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedModal, Button } from '../ui';
import { API_BASE } from '../../config/api';

export default function ProposalModal({
  isOpen,
  onClose,
  job,
  currentUser,
  onSuccess,
  showToast
}) {
  const [proposalText, setProposalText] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen || !job) return null;

  const validate = () => {
    const errs = {};
    if (!proposalText.trim() || proposalText.trim().length < 20) {
      errs.proposalText = 'Nội dung đề xuất phải có tối thiểu 20 ký tự mô tả kế hoạch và năng lực của bạn';
    }
    if (proposedPrice) {
      const cleanPrice = String(proposedPrice).replace(/\D/g, '');
      if (!cleanPrice || parseInt(cleanPrice, 10) <= 0) {
        errs.proposedPrice = 'Mức thù lao đề xuất phải lớn hơn 0';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePriceChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      setProposedPrice('');
    } else {
      setProposedPrice(parseInt(val, 10).toLocaleString('vi-VN'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!currentUser?.token) {
      if (showToast) showToast('Vui lòng đăng nhập với tài khoản Sinh viên để nộp đề xuất', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const rawPrice = proposedPrice ? parseInt(String(proposedPrice).replace(/\D/g, ''), 10) : null;

      const res = await fetch(`${API_BASE}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          job_id: job.id,
          proposal_text: proposalText.trim(),
          estimated_duration: estimatedDuration.trim() || undefined,
          proposed_price: rawPrice || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Đề xuất đã được gửi thành công!', 'success');
        if (onSuccess) onSuccess(data.data);
        onClose();
      } else {
        const errorMsg = data.errors ? data.errors.join('; ') : data.message || 'Gửi đề xuất thất bại';
        setErrors({ general: errorMsg });
        if (showToast) showToast(errorMsg, 'error');
      }
    } catch (err) {
      setErrors({ general: err.message || 'Lỗi kết nối máy chủ' });
      if (showToast) showToast(err.message || 'Lỗi gửi đề xuất', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="600px">
      <div style={{ padding: '26px 28px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="badge badge-success" style={{ fontSize: 11 }}>Dự án Freelance</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
              Nộp đề xuất dự án (Proposal)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
              Gửi phương án thực hiện, thời gian dự kiến và mức thù lao đề xuất cho Nhà tuyển dụng
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-lavender-surface)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Thông tin Job tóm tắt */}
        <div style={{
          background: 'var(--color-background)',
          borderRadius: 10,
          border: '1px solid var(--color-border)',
          padding: '14px 16px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 4 }}>
            DỰ ÁN ĐANG ĐỀ XUẤT
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>
            {job.title}
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
            <span>🏢 {job.company_name || job.employer_name || 'Doanh nghiệp tuyển dụng'}</span>
            <span>💰 Ngân sách: <strong>{job.salary ? `${Number(job.salary).toLocaleString('vi-VN')} đ` : 'Thỏa thuận'}</strong></span>
          </div>
        </div>

        {errors.general && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Form Field 1: Proposal Text */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              Kế hoạch thực hiện & Giới thiệu năng lực (*)
            </label>
            <textarea
              rows={5}
              required
              placeholder="Trình bày giải pháp thực hiện, công nghệ sử dụng, kinh nghiệm liên quan và cam kết tiến độ hoàn thành (tối thiểu 20 ký tự)..."
              value={proposalText}
              onChange={(e) => {
                setProposalText(e.target.value);
                if (errors.proposalText) setErrors({ ...errors, proposalText: null });
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: errors.proposalText ? '1.5px solid #DC2626' : '1px solid var(--color-border)',
                fontSize: 13.5,
                lineHeight: 1.5,
                outline: 'none',
              }}
            />
            {errors.proposalText ? (
              <span style={{ fontSize: 12, color: '#DC2626', marginTop: 4, display: 'block' }}>
                {errors.proposalText}
              </span>
            ) : (
              <span style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 4, display: 'block' }}>
                {proposalText.trim().length} / 20 ký tự tối thiểu
              </span>
            )}
          </div>

          {/* Form Field 2: Estimated Duration */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              <Clock size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Thời gian dự kiến hoàn thành
            </label>
            <input
              type="text"
              placeholder="VD: 5 ngày, 2 tuần, 1 tháng..."
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                fontSize: 13.5,
                outline: 'none',
              }}
            />
          </div>

          {/* Form Field 3: Proposed Price */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              <DollarSign size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Mức thù lao mong muốn (VNĐ)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="VD: 2,500,000 (để trống nếu thỏa thuận)"
                value={proposedPrice}
                onChange={handlePriceChange}
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: 8,
                  border: errors.proposedPrice ? '1.5px solid #DC2626' : '1px solid var(--color-border)',
                  fontSize: 13.5,
                  outline: 'none',
                }}
              />
              <span style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
              }}>
                VNĐ
              </span>
            </div>
            {errors.proposedPrice && (
              <span style={{ fontSize: 12, color: '#DC2626', marginTop: 4, display: 'block' }}>
                {errors.proposedPrice}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
            <Button variant="secondary" type="button" onClick={onClose} style={{ padding: '9px 20px', fontSize: 13.5 }}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={submitting} style={{ padding: '9px 24px', fontSize: 13.5, gap: 6 }}>
              <Send size={15} />
              {submitting ? 'Đang gửi đề xuất...' : 'Gửi đề xuất'}
            </Button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
