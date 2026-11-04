import React, { useState } from 'react';
import { 
  User, Building2, Mail, Lock, Eye, EyeOff, 
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';

/**
 * WF-G04 — Register (Đăng ký tài khoản Sinh viên / Nhà tuyển dụng cá nhân)
 * Bám sát 100% Wireframe WF-G04 từ JOBNEST_Wireframe_44.drawio:
 * - Logo tròn ở đỉnh (60x60)
 * - Tab chọn vai trò: "Sinh viên" | "Nhà tuyển dụng cá nhân"
 * - Tab Sinh viên: Họ và tên, Email, Mật khẩu, Xác nhận mật khẩu, Nút Đăng ký, Link Đã có tài khoản? Đăng nhập
 * - Tab NTD cá nhân: Tên hiển thị, Email, Mật khẩu, Xác nhận mật khẩu, Nút Đăng ký, Link Đã có tài khoản? Đăng nhập
 * - Trạng thái: Validation từng trường, Loading spinner, Lỗi 409 "Email đã tồn tại", Thành công.
 */
export default function RegisterPage({ 
  onRegisterSuccess, 
  onNavigateLogin, 
  onCancel,
  onNavigateHome,
  onNavigateComingSoon,
  initialRole = 'STUDENT',
  apiBase = API_BASE 
}) {
  const [role, setRole] = useState(initialRole); // 'STUDENT' | 'EMPLOYER'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Field validation & errors
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Real-time validation
  const validateForm = () => {
    setEmailError('');
    setGeneralError('');

    if (!fullName.trim()) {
      setGeneralError(role === 'STUDENT' ? 'Vui lòng nhập họ và tên của bạn.' : 'Vui lòng nhập tên hiển thị (doanh nghiệp / cá nhân).');
      return false;
    }

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError('Email không được để trống.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError('Địa chỉ email không đúng định dạng.');
      return false;
    }

    if (!password) {
      setGeneralError('Mật khẩu không được để trống.');
      return false;
    }
    if (password.length < 6) {
      setGeneralError('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }

    if (password !== confirmPassword) {
      setGeneralError('Mật khẩu xác nhận không trùng khớp.');
      return false;
    }

    return true;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError('');
    setEmailError('');
    setSuccessMessage('');

    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role,
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Xử lý lỗi 409 Email đã tồn tại theo Wireframe WF-G04 (k190)
        if (res.status === 409 || (data.message && data.message.toLowerCase().includes('email'))) {
          setEmailError('Email đã tồn tại. Vui lòng chọn email khác hoặc đăng nhập.');
        } else {
          setGeneralError(data.message || (data.errors ? data.errors.join(', ') : 'Đăng ký không thành công.'));
        }
        return;
      }

      setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess({
            ...data.data.user,
            token: data.data.token
          });
        } else if (onNavigateLogin) {
          onNavigateLogin();
        }
      }, 1000);
    } catch (err) {
      setGeneralError(formatApiError(err));
    } finally {
      setLoading(false);
    }
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
          maxWidth: '520px',
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
            Đăng ký tài khoản
          </p>
        </div>

        {/* =========================================================================
            TAB CHỌN VAI TRÒ (WF-G04: k182 "Sinh viên" & k183 "Nhà tuyển dụng cá nhân")
            ========================================================================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.35fr',
          border: '1.5px solid #000000',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '28px',
          background: '#F5F5F5'
        }}>
          {/* Tab 1: Sinh viên */}
          <button
            type="button"
            onClick={() => {
              setRole('STUDENT');
              setEmailError('');
              setGeneralError('');
            }}
            style={{
              padding: '10px 12px',
              fontSize: '13.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: role === 'STUDENT' ? '#333333' : 'transparent',
              color: role === 'STUDENT' ? '#ffffff' : '#333333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={16} />
            Sinh viên
          </button>

          {/* Tab 2: Nhà tuyển dụng cá nhân */}
          <button
            type="button"
            onClick={() => {
              setRole('EMPLOYER');
              setEmailError('');
              setGeneralError('');
            }}
            style={{
              padding: '10px 12px',
              fontSize: '13.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: role === 'EMPLOYER' ? '#333333' : 'transparent',
              color: role === 'EMPLOYER' ? '#ffffff' : '#333333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={16} />
            Nhà tuyển dụng cá nhân
          </button>
        </div>

        {/* =========================================================================
            TIÊU ĐỀ KHỐI ĐĂNG KÝ (WF-G04: k185 "Đăng ký Sinh viên" / k198)
            ========================================================================= */}
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {role === 'STUDENT' ? 'Đăng ký Sinh viên' : 'Đăng ký Nhà tuyển dụng cá nhân'}
          </h3>
          <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '4px 0 0 0' }}>
            {role === 'STUDENT' 
              ? 'Tạo tài khoản để tìm việc làm thêm, thực tập và dự án tự do'
              : 'Đăng tin tuyển dụng và kết nối nhanh chóng với ứng viên sinh viên'}
          </p>
        </div>

        {/* Social Register Options (Image 1 & 2: Google, Facebook, Linkedin) */}
        <div style={{ marginBottom: '20px' }}>
          {/* 1. Google Button */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateComingSoon) {
                onNavigateComingSoon(
                  'Đăng ký bằng Google',
                  'Tính năng đăng ký nhanh qua Google OAuth đang được hoàn thiện (Coming Soon) và sẽ sớm khả dụng.'
                );
              } else {
                alert('Tính năng đăng ký bằng Google đang phát triển (Coming Soon).');
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
            Đăng ký bằng Google
          </button>

          {/* 2. Facebook & Linkedin Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                if (onNavigateComingSoon) {
                  onNavigateComingSoon(
                    'Đăng ký bằng Facebook',
                    'Tính năng đăng ký nhanh bằng Facebook đang được tích hợp (Coming Soon).'
                  );
                } else {
                  alert('Tính năng đăng ký bằng Facebook đang phát triển (Coming Soon).');
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
                    'Đăng ký bằng LinkedIn',
                    'Tính năng đăng ký nhanh bằng LinkedIn đang được tích hợp (Coming Soon).'
                  );
                } else {
                  alert('Tính năng đăng ký bằng LinkedIn đang phát triển (Coming Soon).');
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

          {/* 3. Divider: Hoặc đăng ký bằng email */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0 6px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            <span style={{ padding: '0 12px', fontSize: '12.5px', color: '#6B7280', fontWeight: 500 }}>
              Hoặc đăng ký bằng email
            </span>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          </div>
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
                marginBottom: '16px',
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
                marginBottom: '16px'
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <div>{successMessage}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================================
            FORM NHẬP LIỆU (WF-G04: Họ và tên, Email, Mật khẩu, Xác nhận mật khẩu)
            ========================================================================= */}
        <form onSubmit={handleRegisterSubmit}>
          {/* TRƯỜNG 1: Họ và tên (k186 / k199) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              {role === 'STUDENT' ? 'Họ và tên' : 'Tên hiển thị'} <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={role === 'STUDENT' ? 'Nguyễn Văn Chí' : 'Công ty TNHH TechNova / Cửa hàng ABC'}
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

          {/* TRƯỜNG 2: Email (k188 / k201) & Lỗi "Email đã tồn tại" (k190) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Email <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              placeholder={role === 'STUDENT' ? 'chi.nguyen@vlu.edu.vn hoặc email cá nhân' : 'contact@company.vn'}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px',
                fontSize: '13.5px',
                border: emailError ? '1.5px solid #C00000' : '1.5px solid #000000',
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box',
                background: emailError ? '#FFF8F8' : '#ffffff'
              }}
            />
            {/* WF-G04: k190 "Email đã tồn tại" */}
            {emailError && (
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
                {emailError}
              </div>
            )}
          </div>

          {/* TRƯỜNG 3: Mật khẩu (k191 / k203) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Mật khẩu <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* TRƯỜNG 4: Xác nhận mật khẩu (k193 / k205) */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Xác nhận mật khẩu <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại chính xác mật khẩu"
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
                title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* =========================================================================
              HÀNG NÚT BẤM (Căn giữa nút Đăng ký & Link Đăng nhập bên dưới không viền ô)
              ========================================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
            {/* Nút 1: Đăng ký căn giữa */}
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
                  Đang xử lý...
                </>
              ) : (
                <>Đăng ký <span style={{ fontSize: '16px' }}>&rarr;</span></>
              )}
            </button>

            {/* Link chuyển Đăng nhập bên dưới */}
            <div style={{ fontSize: '13.5px', color: '#4B5563', textAlign: 'center' }}>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  if (onNavigateLogin) onNavigateLogin();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#00B14F',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease'
                }}
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </form>

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
          Bạn gặp khó khăn khi tạo tài khoản? Vui lòng gọi tới số <strong style={{ color: '#00B14F' }}>1900 068 889</strong> | Nhánh 2 (giờ hành chính).
        </div>

        {/* Cam kết bảo mật & Điều khoản */}
        <div style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid #E5E7EB',
          fontSize: '12px',
          color: '#6B7280',
          lineHeight: 1.5,
          textAlign: 'center'
        }}>
          Bằng việc bấm Đăng ký, bạn đồng ý với các{' '}
          <span style={{ fontWeight: 600, color: '#111827', textDecoration: 'underline', cursor: 'pointer' }}>
            Điều khoản sử dụng
          </span>{' '}
          và{' '}
          <span style={{ fontWeight: 600, color: '#111827', textDecoration: 'underline', cursor: 'pointer' }}>
            Quy định bảo mật
          </span>{' '}
          của JobNest.
        </div>
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
