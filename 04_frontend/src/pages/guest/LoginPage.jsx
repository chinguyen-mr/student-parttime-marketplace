import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, User, Building2, Shield, 
  CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, KeyRound, Clock, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_BASE, formatApiError } from '../../config/api';

/**
 * WF-G05 — Login / Forgot / Reset Password
 * Bám sát 100% Wireframe WF-G05 từ JOBNEST_Wireframe_44.drawio:
 * - Logo tròn ở đỉnh (60x60)
 * - 3 phân hệ tương tác chuẩn:
 *   1. Đăng nhập (Email, Mật khẩu, Lỗi 401 Sai thông tin, Ghi nhớ đăng nhập, Nút Đăng nhập, Quên mật khẩu?, Đăng ký)
 *   2. Quên mật khẩu (Email, Nút Gửi yêu cầu, Quay lại đăng nhập)
 *   3. Đặt lại mật khẩu (Mã xác thực OTP, Lỗi Mã hết hạn, Mật khẩu mới, Xác nhận mật khẩu, Nút Đặt lại mật khẩu)
 */
export default function LoginPage({ 
  onLoginSuccess, 
  onCancel, 
  onNavigateRegister, 
  onNavigateHome,
  onNavigateComingSoon,
  apiBase = API_BASE 
}) {
  // Mode: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('nguyen.van.chi@vlu.edu.vn');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot / Reset states
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Messages & Errors
  const [loginError, setLoginError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');



  // 1. Submit Đăng nhập (Login)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setGeneralError('');
    setSuccessMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setGeneralError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: loginEmail.trim(), 
          password: loginPassword 
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // WF-G05 (k217): "Sai thông tin đăng nhập"
        if (res.status === 401 || (data.message && data.message.includes('không chính xác'))) {
          setLoginError('Sai thông tin đăng nhập. Vui lòng kiểm tra lại email hoặc mật khẩu.');
        } else if (res.status === 403) {
          setGeneralError('Tài khoản của bạn đã bị khóa bởi Quản trị viên.');
        } else {
          setGeneralError(data.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
        }
        return;
      }

      setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => {
        onLoginSuccess({
          ...data.data.user,
          token: data.data.token
        });
      }, 500);
    } catch (err) {
      setGeneralError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Quên mật khẩu (Forgot Password)
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setGeneralError('Vui lòng nhập địa chỉ email hợp lệ đã đăng ký.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(`Mã xác thực OTP (mặc định thử nghiệm: 123456) đã được gửi tới email ${forgotEmail}.`);
      setMode('reset');
    }, 600);
  };

  // 3. Submit Đặt lại mật khẩu (Reset Password)
  const handleResetSubmit = (e) => {
    e.preventDefault();
    setOtpError('');
    setGeneralError('');
    setSuccessMessage('');

    // WF-G05 (k233): "Mã hết hạn"
    if (!otpCode.trim() || otpCode.trim() !== '123456') {
      setOtpError('Mã hết hạn hoặc không hợp lệ. Vui lòng nhập mã thử nghiệm: 123456.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setGeneralError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setGeneralError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
      setLoginPassword(newPassword);
      if (forgotEmail) setLoginEmail(forgotEmail);
      setMode('login');
    }, 700);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      background: '#F4F6F8'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          padding: '36px 32px',
          position: 'relative'
        }}
      >
        {/* =========================================================================
            TOP LOGO TRÒN (Clickable về trang chủ)
            ========================================================================= */}
        <div 
          onClick={() => onNavigateHome ? onNavigateHome() : onCancel && onCancel()}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', cursor: 'pointer' }}
          title="Quay lại Trang chủ"
        >
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '2px solid #000000',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '8px'
          }}>
            <img 
              src="/logo.jpg" 
              alt="JobNest Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.innerText = 'Logo';
              }}
            />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
            JOBNEST
          </h2>
          <p style={{ fontSize: '15px', color: '#111827', margin: '6px 0 0 0', fontWeight: 700 }}>
            Chào mừng quay trở lại
          </p>
        </div>

        {/* =========================================================================
            BANNERS: LỖI TOÀN CỤC & THÀNH CÔNG
            ========================================================================= */}
        <AnimatePresence>
          {generalError && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px',
                lineHeight: 1.4
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>{generalError}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#047857',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px'
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <div>{successMessage}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================================
            STATE 1: ĐĂNG NHẬP (WF-G05: k211 - k222)
            ========================================================================= */}
        {mode === 'login' && (
          <motion.div
            key="login-panel"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Social Login Options (Image 1 & 2: Google, Facebook, Linkedin) */}
            <div style={{ marginBottom: '18px' }}>
              {/* 1. Google Button (Full width pill matching Image 1) */}
              <button
                type="button"
                onClick={() => {
                  if (onNavigateComingSoon) {
                    onNavigateComingSoon(
                      'Đăng nhập bằng Google',
                      'Tính năng đăng nhập nhanh bằng tài khoản Google (OAuth 2.0) đang được hoàn thiện (Coming Soon) và sẽ sớm khả dụng.'
                    );
                  } else {
                    alert('Tính năng đăng nhập bằng Google đang phát triển (Coming Soon).');
                  }
                }}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '9999px',
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1F2937',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginBottom: '10px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Đăng nhập bằng Google
              </button>

              {/* 2. Facebook & Linkedin Row (matching Image 1) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateComingSoon) {
                      onNavigateComingSoon(
                        'Đăng nhập bằng Facebook',
                        'Tính năng đăng nhập nhanh bằng Facebook đang được tích hợp (Coming Soon) và sẽ sớm khả dụng.'
                      );
                    } else {
                      alert('Tính năng đăng nhập bằng Facebook đang phát triển (Coming Soon).');
                    }
                  }}
                  style={{
                    height: '40px',
                    borderRadius: '9999px',
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#1F2937',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateComingSoon) {
                      onNavigateComingSoon(
                        'Đăng nhập bằng LinkedIn',
                        'Tính năng đăng nhập nhanh bằng LinkedIn đang được tích hợp (Coming Soon) và sẽ sớm khả dụng.'
                      );
                    } else {
                      alert('Tính năng đăng nhập bằng LinkedIn đang phát triển (Coming Soon).');
                    }
                  }}
                  style={{
                    height: '40px',
                    borderRadius: '9999px',
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#1F2937',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  Linkedin
                </button>
              </div>

              {/* 3. Divider: Hoặc đăng nhập bằng email (matching Image 1) */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0 6px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
                <span style={{ padding: '0 12px', fontSize: '12.5px', color: '#6B7280', fontWeight: 500 }}>
                  Hoặc đăng nhập bằng email
                </span>
                <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              </div>
            </div>

            {/* Quick Test Student Account Banner */}
            <div style={{
              background: '#F0FDF4',
              border: '1px dashed #22C55E',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '12.5px',
              color: '#166534',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>🎓 Tài khoản sinh viên test:</div>
                <div style={{ marginTop: '2px', color: '#15803D' }}>
                  Email: <strong>student.test@vlu.edu.vn</strong> | Pass: <strong>password123</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('student.test@vlu.edu.vn');
                  setLoginPassword('password123');
                }}
                style={{
                  background: '#22C55E',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#16A34A'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#22C55E'}
              >
                ⚡ Điền nhanh
              </button>
            </div>

            <form onSubmit={handleLoginSubmit}>
              {/* Email (k213, k214) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                  Email <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="name@sinhvien.vlu.edu.vn hoặc email doanh nghiệp"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    border: loginError ? '1.5px solid #C00000' : '1.5px solid #000000',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: loginError ? '#FFF8F8' : '#ffffff'
                  }}
                />
              </div>

              {/* Mật khẩu (k215, k216) */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                  Mật khẩu <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    placeholder="Nhập mật khẩu"
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 40px 0 12px',
                      fontSize: '13.5px',
                      border: loginError ? '1.5px solid #C00000' : '1.5px solid #000000',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: loginError ? '#FFF8F8' : '#ffffff'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6B7280',
                      padding: '4px'
                    }}
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Lỗi Sai thông tin đăng nhập (WF-G05: k217) */}
              {loginError && (
                <div style={{
                  color: '#C00000',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <AlertCircle size={14} />
                  {loginError}
                </div>
              )}

              {/* Checkbox Ghi nhớ đăng nhập & Quên mật khẩu row (k218, k219, k221) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#111827', cursor: 'pointer' }}
                  />
                  Ghi nhớ đăng nhập
                </label>

                {/* Nút Quên mật khẩu (k221) */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setGeneralError('');
                    setSuccessMessage('');
                    if (loginEmail) setForgotEmail(loginEmail);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#2563EB',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Nút Đăng nhập căn giữa (k220) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '44px',
                    background: loading ? '#9CA3AF' : '#00B14F',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(0, 177, 79, 0.25)'
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#009743'; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#00B14F'; }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: 14,
                        height: 14,
                        border: '2px solid #ffffff',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }} />
                      Đang xác thực...
                    </>
                  ) : (
                    <>Đăng nhập <span style={{ fontSize: '16px' }}>&rarr;</span></>
                  )}
                </button>

                {/* Link Đăng ký (k222 - Chuyển sang WF-G04) */}
                <div style={{ fontSize: '13.5px', color: '#4B5563', textAlign: 'center' }}>
                  Bạn chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateRegister) onNavigateRegister();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: '#00B14F',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </div>

              {/* Support Hotline Box (matching Image 2) */}
              <div style={{
                marginTop: '22px',
                padding: '12px 14px',
                background: '#F9FAFB',
                border: '1px solid #F3F4F6',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: 1.5
              }}>
                Bạn gặp khó khăn khi tạo/đăng nhập tài khoản? Vui lòng gọi tới số <strong style={{ color: '#00B14F' }}>1900 068 889</strong> | Nhánh 2 (giờ hành chính).
              </div>


            </form>
          </motion.div>
        )}

        {/* =========================================================================
            STATE 2: QUÊN MẬT KHẨU (WF-G05: k223 - k228)
            ========================================================================= */}
        {mode === 'forgot' && (
          <motion.div
            key="forgot-panel"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Quên mật khẩu
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
                Nhập email của bạn để nhận mã xác thực đặt lại mật khẩu
              </p>
            </div>

            <form onSubmit={handleForgotSubmit}>
              {/* Email (k225, k226) */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                  Email đăng ký <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@sinhvien.vlu.edu.vn"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    border: '1.5px solid #000000',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Nút Gửi yêu cầu (k227) & Quay lại đăng nhập (k228) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    maxWidth: '360px',
                    height: '42px',
                    padding: '0 24px',
                    background: loading ? '#666666' : '#222222',
                    color: '#ffffff',
                    border: '1.5px solid #000000',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setGeneralError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#111827',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* =========================================================================
            STATE 3: ĐẶT LẠI MẬT KHẨU (WF-G05: k229 - k238)
            ========================================================================= */}
        {mode === 'reset' && (
          <motion.div
            key="reset-panel"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Đặt lại mật khẩu
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
                Nhập mã xác thực đã nhận và thiết lập mật khẩu mới
              </p>
            </div>

            <form onSubmit={handleResetSubmit}>
              {/* Mã xác thực / OTP (k231, k232) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                  Mã xác thực / OTP <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    if (otpError) setOtpError('');
                  }}
                  placeholder="Nhập 6 số (Thử nghiệm: 123456)"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    border: otpError ? '1.5px solid #C00000' : '1.5px solid #000000',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    letterSpacing: '1px'
                  }}
                />
                {/* Lỗi Mã hết hạn (WF-G05: k233) */}
                {otpError && (
                  <div style={{
                    color: '#C00000',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <AlertCircle size={13} />
                    {otpError}
                  </div>
                )}
              </div>

              {/* Mật khẩu mới (k234, k235) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                  Mật khẩu mới <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 40px 0 12px',
                      fontSize: '13.5px',
                      border: '1.5px solid #000000',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6B7280',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu (k236, k237) */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                  Xác nhận mật khẩu <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 40px 0 12px',
                      fontSize: '13.5px',
                      border: '1.5px solid #000000',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6B7280',
                      padding: '4px'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Nút Đặt lại mật khẩu (k238) & Quay lại */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    maxWidth: '360px',
                    height: '42px',
                    padding: '0 24px',
                    background: loading ? '#666666' : '#222222',
                    color: '#ffffff',
                    border: '1.5px solid #000000',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setGeneralError('');
                    setOtpError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#111827',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          </motion.div>
        )}


      </motion.div>

      {/* Footer copyright outside card (matching reference image 2) */}
      <div style={{ marginTop: '28px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>
          &copy; 2026. All Rights Reserved. JobNest Platform.
        </p>
        <button
          type="button"
          onClick={() => onNavigateHome ? onNavigateHome() : onCancel && onCancel()}
          style={{
            marginTop: '10px',
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: '12.5px',
            color: '#6B7280',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          &larr; Quay lại Trang chủ
        </button>
      </div>
    </div>
  );
}
