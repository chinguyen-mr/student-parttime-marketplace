import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, User, Building2, 
  CheckCircle2, AlertCircle, ArrowRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import AnimatedModal from '../ui/AnimatedModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { API_BASE, formatApiError } from '../../config/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialMode = 'login', apiBase = API_BASE }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [registerRole, setRegisterRole] = useState('STUDENT'); // 'STUDENT' | 'EMPLOYER'
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
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
        setErrorMessage(data.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
        return;
      }

      setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => {
        onLoginSuccess({
          ...data.data.user,
          token: data.data.token
        });
        onClose();
      }, 600);
    } catch (err) {
      setErrorMessage(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!registerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail.trim())) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (registerPassword.length < 6) {
      setErrorMessage('Mật khẩu bắt buộc phải có ít nhất 6 ký tự.');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail.trim(),
          password: registerPassword,
          full_name: fullName.trim(),
          role: registerRole,
          phone: registerPhone.trim() || null
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 409 || (data.message && data.message.toLowerCase().includes('email'))) {
          setErrorMessage('Email đã tồn tại. Vui lòng chọn email khác hoặc đăng nhập.');
        } else {
          setErrorMessage(data.message || (data.errors ? data.errors.join(', ') : 'Đăng ký tài khoản không thành công.'));
        }
        return;
      }

      setSuccessMessage('Đăng ký tài khoản thành công! Đang tự động đăng nhập...');
      setTimeout(() => {
        onLoginSuccess({
          ...data.data.user,
          token: data.data.token
        });
        onClose();
      }, 800);
    } catch (err) {
      setErrorMessage(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={mode === 'login' ? '460px' : '520px'}
    >
      {/* Modal Top Bar */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/logo.jpg" 
            alt="JobNest Logo" 
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              objectFit: 'contain',
              background: '#ffffff',
              border: '1px solid #EAE5F0'
            }}
          />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#30283A', margin: 0 }}>
              {mode === 'login' ? 'Đăng Nhập JobNest' : 'Tạo Tài Khoản Mới'}
            </h3>
            <p style={{ fontSize: '12px', color: '#777080', margin: 0 }}>
              JobNest • Nền tảng Việc làm Part-time & Full-time
            </p>
          </div>
        </div>
        <motion.button 
          onClick={onClose}
          whileHover={{ scale: 1.05, backgroundColor: '#f1f5f9', color: '#0f172a' }}
          whileTap={{ scale: 0.95 }}
          aria-label="Đóng cửa sổ"
          style={{
            padding: '6px',
            borderRadius: '6px',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent'
          }}
        >
          <X size={18} />
        </motion.button>
      </div>

      {/* Tab Switcher: Đăng nhập vs Đăng ký */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #EAE5F0',
        background: '#FBFAFD',
        position: 'relative'
      }}>
        <motion.button 
          type="button"
          onClick={() => { setMode('login'); setErrorMessage(''); }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: mode === 'login' ? '#7565A8' : '#777080',
            background: mode === 'login' ? '#ffffff' : 'transparent',
            borderBottom: mode === 'login' ? '2px solid #7565A8' : '2px solid transparent',
            cursor: 'pointer',
            textAlign: 'center',
            border: 'none',
            transition: 'color 0.15s ease'
          }}
        >
          Đăng Nhập
        </motion.button>
        <motion.button 
          type="button"
          onClick={() => { setMode('register'); setErrorMessage(''); }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: mode === 'register' ? '#7565A8' : '#777080',
            background: mode === 'register' ? '#ffffff' : 'transparent',
            borderBottom: mode === 'register' ? '2px solid #7565A8' : '2px solid transparent',
            cursor: 'pointer',
            textAlign: 'center',
            border: 'none',
            transition: 'color 0.15s ease'
          }}
        >
          Đăng Ký Tài Khoản
        </motion.button>
      </div>

      {/* Modal Body with Animated Mode Transition */}
      <div style={{ padding: '24px' }}>
        
        {/* Animated Error Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#b91c1c',
                fontSize: '13px',
                lineHeight: 1.4,
                overflow: 'hidden'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>{errorMessage}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Success Banner */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#15803d',
                fontSize: '13px',
                overflow: 'hidden'
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>{successMessage}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= FORM ĐĂNG NHẬP (LOGIN) ================= */}
        {mode === 'login' && (
          <motion.div
            key="login-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >

            <form onSubmit={handleLoginSubmit}>
              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Địa chỉ Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input 
                    type="email"
                    required
                    placeholder="name@example.com hoặc email Văn Lang"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Mật khẩu <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setForgotPasswordOpen(true)}
                    style={{ fontSize: '12px', color: '#594675', fontWeight: 600, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu của bạn"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Ẩn hiện mật khẩu"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '11px',
                      background: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Ghi nhớ đăng nhập */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input 
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#594675' }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '13px', color: '#777080', cursor: 'pointer' }}>
                  Ghi nhớ phiên đăng nhập trên thiết bị này
                </label>
              </div>

              {/* Animated Submit Button using Animate UI */}
              <Button 
                type="submit"
                variant="primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  background: loading ? '#A997C5' : '#7565A8',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '14px',
                  gap: '8px'
                }}
              >
                {loading ? 'Đang xác thực thông tin...' : (
                  <>
                    <span>Đăng Nhập Vào JobNest</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* ================= FORM ĐĂNG KÝ (REGISTER) ================= */}
        {mode === 'register' && (
          <motion.div
            key="register-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <form onSubmit={handleRegisterSubmit}>
              {/* Chọn vai trò đăng ký with Motion Cards */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Bạn tham gia hệ thống với tư cách là: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <motion.button 
                    type="button"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRegisterRole('STUDENT')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: registerRole === 'STUDENT' ? '2px solid #7565A8' : '1px solid #EAE5F0',
                      background: registerRole === 'STUDENT' ? '#F9E5DC' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <User size={18} color={registerRole === 'STUDENT' ? '#7565A8' : '#777080'} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: registerRole === 'STUDENT' ? '#30283A' : '#777080' }}>
                        Sinh viên
                      </div>
                      <div style={{ fontSize: '11px', color: '#777080' }}>Tìm việc làm thêm</div>
                    </div>
                  </motion.button>

                  <motion.button 
                    type="button"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRegisterRole('EMPLOYER')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: registerRole === 'EMPLOYER' ? '2px solid #7565A8' : '1px solid #EAE5F0',
                      background: registerRole === 'EMPLOYER' ? '#F9E5DC' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Building2 size={18} color={registerRole === 'EMPLOYER' ? '#7565A8' : '#777080'} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: registerRole === 'EMPLOYER' ? '#30283A' : '#777080' }}>
                        Nhà tuyển dụng
                      </div>
                      <div style={{ fontSize: '11px', color: '#777080' }}>Đăng tin tuyển dụng</div>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Họ và tên */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  {registerRole === 'STUDENT' ? 'Họ và tên sinh viên' : 'Tên doanh nghiệp / Người đại diện'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder={registerRole === 'STUDENT' ? 'Nguyễn Văn A' : 'Công ty Cổ phần / Cửa hàng ABC'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Email & Phone grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Số điện thoại
                  </label>
                  <input 
                    type="tel"
                    placeholder="0912xxxxxx"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Mật khẩu <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="password"
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Xác nhận mật khẩu <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Animated Submit Register Button using Animate UI */}
              <Button 
                type="submit"
                variant="primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  background: loading ? '#A997C5' : '#7565A8',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '14px',
                  gap: '8px'
                }}
              >
                {loading ? 'Đang tạo tài khoản...' : (
                  <>
                    <span>Đăng Ký Tài Khoản JobNest</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        )}

      </div>

      {/* Modal Footer Note */}
      <div style={{
        padding: '12px 24px',
        background: '#f8fafc',
        borderTop: '1px solid #f1f5f9',
        textAlign: 'center',
        fontSize: '12px',
        color: '#64748b'
      }}>
        Nền tảng bảo vệ thông tin sinh viên • Mã hóa bcrypt & Xác thực JWT
      </div>
    </AnimatedModal>

    {/* Forgot Password Modal (Screen 3) */}
    <ForgotPasswordModal
      isOpen={forgotPasswordOpen}
      onClose={() => setForgotPasswordOpen(false)}
      onSwitchToLogin={() => {
        setForgotPasswordOpen(false);
        setMode('login');
      }}
    />
    </>
  );
}
