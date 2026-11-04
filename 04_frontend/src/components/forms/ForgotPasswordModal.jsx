import React, { useState } from 'react';
import { Mail, Lock, KeyRound, CheckCircle2, ArrowLeft, X } from 'lucide-react';
import { AnimatedModal, Button } from '../ui';

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email đã đăng ký tài khoản.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      maxWidth="460px"
    >
      <div style={{ padding: '24px 28px' }}>
        {/* Top Header matching Screen 3 of Wireframe */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img 
              src="/logo.jpg" 
              alt="JobNest Logo" 
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                objectFit: 'contain',
                background: '#ffffff',
                border: '1px solid #EAE5F0'
              }}
            />
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#30283A', margin: 0 }}>
                Form Quên Mật Khẩu
              </h3>
              <p style={{ fontSize: 12, color: '#777080', margin: '2px 0 0 0' }}>
                Khôi phục mật khẩu tài khoản hệ thống JobNest
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Yêu cầu đặt lại mật khẩu đã được ghi nhận!
            </h4>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
              Hệ thống đã gửi liên kết xác nhận và mật khẩu mới tới hộp thư <strong>{email}</strong>. Vui lòng kiểm tra email để hoàn tất.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                handleResetAndClose();
                if (onSwitchToLogin) onSwitchToLogin();
              }}
              style={{ width: '100%', padding: '10px' }}
            >
              Quay lại Đăng nhập ngay
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 12.5,
                color: '#dc2626',
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}>
                Địa chỉ Email tài khoản *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="name@example.com hoặc email VLU"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: 34, fontSize: 13 }}
                />
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}>
                Mật khẩu mới *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: 34, fontSize: 13 }}
                />
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}>
                Xác nhận Mật khẩu mới (Confirm Password) *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: 34, fontSize: 13 }}
                />
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              style={{ width: '100%', padding: '10px', marginTop: 6, fontSize: 14 }}
            >
              Xác nhận Đặt lại Mật khẩu
            </Button>

            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <button
                type="button"
                onClick={() => {
                  handleResetAndClose();
                  if (onSwitchToLogin) onSwitchToLogin();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#594675',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ArrowLeft size={13} /> Quay lại Màn hình Đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </AnimatedModal>
  );
}
