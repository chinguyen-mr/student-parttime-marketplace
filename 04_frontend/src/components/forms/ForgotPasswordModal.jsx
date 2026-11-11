import React, { useState, useEffect } from 'react';
import { Mail, Lock, CheckCircle2, ArrowLeft, X, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { AnimatedModal, Button } from '../ui';
import { API_BASE, formatApiError } from '../../config/api';

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  initialEmail = '',
  apiBase = API_BASE,
}) {
  const [step, setStep] = useState('form'); // 'form' | 'completed'
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
    if (isOpen) {
      setStep('form');
      setError('');
    }
  }, [initialEmail, isOpen]);

  const handleResetAndClose = () => {
    setStep('form');
    setEmail(initialEmail);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setLoading(false);
    onClose();
  };

  const handleDirectResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Định dạng email không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          new_password: newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || 'Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại email.');
        return;
      }

      setStep('completed');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      maxWidth="460px"
    >
      <div style={{ padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#F1EEF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7565A8'
            }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#30283A', margin: 0 }}>
                {step === 'completed' ? 'Đặt Lại Mật Khẩu Thành Công' : 'Đặt Lại Mật Khẩu Nhanh'}
              </h3>
              <p style={{ fontSize: 12, color: '#777080', margin: '2px 0 0 0' }}>
                {step === 'completed' 
                  ? 'Tài khoản của bạn đã được cập nhật mật khẩu mới' 
                  : 'Nhập email và thiết lập mật khẩu mới ngay'}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ================= BƯỚC 1: FORM ĐẶT LẠI MẬT KHẨU (KHÔNG CẦN OTP) ================= */}
        {step === 'form' && (
          <form onSubmit={handleDirectResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Input Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Địa chỉ Email tài khoản <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  placeholder="ví dụ: student.test@vlu.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 14px 0 38px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    background: '#ffffff'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7565A8'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            {/* Input Mật khẩu mới */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Mật khẩu mới <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 40px 0 38px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    background: '#ffffff'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7565A8'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 10,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Input Xác nhận mật khẩu mới */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Xác nhận mật khẩu mới <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 14px 0 38px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    background: '#ffffff'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7565A8'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{
                width: '100%',
                marginTop: 6,
                fontWeight: 700,
                background: '#7565A8',
                borderColor: '#7565A8'
              }}
            >
              Đặt lại mật khẩu
            </Button>

            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSwitchToLogin) onSwitchToLogin();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7565A8',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <ArrowLeft size={14} /> Quay lại Đăng nhập
              </button>
            </div>
          </form>
        )}

        {/* ================= BƯỚC 2: HOÀN TẤT THÀNH CÔNG ================= */}
        {step === 'completed' && (
          <div style={{ textAlign: 'center', padding: '16px 8px 8px' }}>
            <div style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: '#ECFDF5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              marginBottom: 14
            }}>
              <CheckCircle2 size={34} />
            </div>

            <h4 style={{ fontSize: 17, fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>
              Đổi mật khẩu thành công!
            </h4>
            <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Mật khẩu tài khoản của bạn đã được cập nhật thành công trên hệ thống. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới vừa tạo.
            </p>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => {
                handleResetAndClose();
                if (onSwitchToLogin) onSwitchToLogin();
              }}
              style={{
                width: '100%',
                fontWeight: 700,
                background: '#7565A8',
                borderColor: '#7565A8'
              }}
            >
              Đăng nhập ngay
            </Button>
          </div>
        )}
      </div>
    </AnimatedModal>
  );
}
