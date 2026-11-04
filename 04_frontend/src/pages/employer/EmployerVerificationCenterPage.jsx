import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Phone, KeyRound, AlertTriangle, CheckCircle2, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui';
import { API_BASE } from '../../config/api';

export default function EmployerVerificationCenterPage({
  currentUser,
  showToast,
  onNavigateCreateJob
}) {
  const [email, setEmail] = useState(currentUser?.email || 'employer.test@vlu.edu.vn');
  const [phone, setPhone] = useState(currentUser?.phone || '0901234567');

  // Verification statuses
  const [emailVerified, setEmailVerified] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(Boolean(currentUser?.phone_verified || currentUser?.verification_status === 'VERIFIED'));

  // OTP form states
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [phoneCountdown, setPhoneCountdown] = useState(0);

  // Countdown timers
  useEffect(() => {
    let timer;
    if (emailCountdown > 0) {
      timer = setTimeout(() => setEmailCountdown(emailCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [emailCountdown]);

  useEffect(() => {
    let timer;
    if (phoneCountdown > 0) {
      timer = setTimeout(() => setPhoneCountdown(phoneCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [phoneCountdown]);

  const handleSendEmailOtp = () => {
    setEmailCountdown(60);
    if (showToast) showToast('Đã gửi mã OTP 6 số đến email của bạn!', 'success');
  };

  const handleVerifyEmailOtp = () => {
    if (!emailOtp.trim() || emailOtp.trim().length < 4) {
      if (showToast) showToast('Vui lòng nhập mã OTP hợp lệ', 'error');
      return;
    }
    setEmailVerified(true);
    setEmailOtp('');
    if (showToast) showToast('Xác minh Email thành công!', 'success');
  };

  const handleSendPhoneOtp = () => {
    setPhoneCountdown(60);
    if (showToast) showToast(`Đã gửi tin nhắn OTP 6 số đến số điện thoại ${phone}!`, 'success');
  };

  const handleVerifyPhoneOtp = () => {
    if (!phoneOtp.trim() || phoneOtp.trim().length < 4) {
      if (showToast) showToast('Vui lòng nhập mã OTP hợp lệ', 'error');
      return;
    }
    setPhoneVerified(true);
    setPhoneOtp('');
    if (showToast) showToast('Xác minh Số điện thoại thành công!', 'success');
  };

  const isFullyVerified = emailVerified && phoneVerified;

  return (
    <div style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          WF-E03 — VERIFICATION CENTER
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0 0' }}>
          Trung tâm Xác thực Tài khoản Nhà tuyển dụng
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: 13.5, color: 'var(--color-text-secondary)' }}>
          Bảo mật và chuẩn hóa uy tín tài khoản tuyển dụng trên hệ thống JobNest.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: 24,
        alignItems: 'stretch'
      }}>
        {/* ================= KHỐI 1: XÁC MINH EMAIL ================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1.5px solid #000000',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={18} color="#059669" />
                <span>Xác minh Email</span>
              </div>
              <span style={{
                background: emailVerified ? '#ECFDF5' : '#FFFBEB',
                color: emailVerified ? '#059669' : '#D97706',
                border: emailVerified ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700
              }}>
                {emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="text"
                value={email}
                disabled
                readOnly
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#475569',
                  fontSize: 14,
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                  Mã OTP
                </label>
                {emailCountdown > 0 && (
                  <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> OTP hết hạn sau {emailCountdown}s
                  </span>
                )}
              </div>
              <input
                type="text"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                placeholder="Nhập 6 số mã OTP gửi tới email"
                disabled={emailVerified}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: '1.5px solid #000000',
                  fontSize: 14,
                  outline: 'none',
                  background: emailVerified ? '#F8FAFC' : '#ffffff'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 10 }}>
            <button
              type="button"
              onClick={handleSendEmailOtp}
              disabled={emailCountdown > 0 || emailVerified}
              style={{
                flex: 1,
                background: '#ffffff',
                color: '#000000',
                border: '1.5px solid #000000',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: (emailCountdown > 0 || emailVerified) ? 'not-allowed' : 'pointer',
                opacity: (emailCountdown > 0 || emailVerified) ? 0.6 : 1
              }}
            >
              {emailCountdown > 0 ? `Gửi lại (${emailCountdown}s)` : 'Gửi OTP'}
            </button>
            <button
              type="button"
              onClick={handleVerifyEmailOtp}
              disabled={emailVerified || !emailOtp.trim()}
              style={{
                flex: 1,
                background: '#000000',
                color: '#ffffff',
                border: '1.5px solid #000000',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: (emailVerified || !emailOtp.trim()) ? 'not-allowed' : 'pointer',
                opacity: (emailVerified || !emailOtp.trim()) ? 0.6 : 1
              }}
            >
              Xác nhận
            </button>
          </div>
        </div>

        {/* ================= KHỐI 2: XÁC MINH SỐ ĐIỆN THOẠI ================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1.5px solid #000000',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={18} color="#D97706" />
                <span>Xác minh Số điện thoại</span>
              </div>
              <span style={{
                background: phoneVerified ? '#ECFDF5' : '#FFFBEB',
                color: phoneVerified ? '#059669' : '#D97706',
                border: phoneVerified ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700
              }}>
                {phoneVerified ? 'Đã xác minh' : 'Chờ xác minh'}
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
                Số điện thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={phoneVerified}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: '1.5px solid #000000',
                  background: phoneVerified ? '#F8FAFC' : '#ffffff',
                  color: '#0F172A',
                  fontSize: 14,
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                  Mã OTP
                </label>
                {phoneCountdown > 0 && (
                  <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> OTP hết hạn sau {phoneCountdown}s
                  </span>
                )}
              </div>
              <input
                type="text"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
                placeholder="Nhập 6 số mã OTP gửi tới SĐT"
                disabled={phoneVerified}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: '1.5px solid #000000',
                  fontSize: 14,
                  outline: 'none',
                  background: phoneVerified ? '#F8FAFC' : '#ffffff'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 10 }}>
            <button
              type="button"
              onClick={handleSendPhoneOtp}
              disabled={phoneCountdown > 0 || phoneVerified}
              style={{
                flex: 1,
                background: '#ffffff',
                color: '#000000',
                border: '1.5px solid #000000',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: (phoneCountdown > 0 || phoneVerified) ? 'not-allowed' : 'pointer',
                opacity: (phoneCountdown > 0 || phoneVerified) ? 0.6 : 1
              }}
            >
              {phoneCountdown > 0 ? `Gửi lại (${phoneCountdown}s)` : 'Gửi OTP'}
            </button>
            <button
              type="button"
              onClick={handleVerifyPhoneOtp}
              disabled={phoneVerified || !phoneOtp.trim()}
              style={{
                flex: 1,
                background: '#000000',
                color: '#ffffff',
                border: '1.5px solid #000000',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: (phoneVerified || !phoneOtp.trim()) ? 'not-allowed' : 'pointer',
                opacity: (phoneVerified || !phoneOtp.trim()) ? 0.6 : 1
              }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>

      {/* ================= KHỐI 3: ĐIỀU KIỆN XÁC MINH ================= */}
      <div style={{
        background: isFullyVerified ? '#ECFDF5' : '#FFFBEB',
        borderRadius: 14,
        border: isFullyVerified ? '1.5px solid #A7F3D0' : '1.5px solid #FDE68A',
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isFullyVerified ? (
            <CheckCircle2 size={24} color="#059669" />
          ) : (
            <AlertTriangle size={24} color="#D97706" />
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: isFullyVerified ? '#065F46' : '#92400E' }}>
              Điều kiện đăng tin tuyển dụng
            </div>
            <div style={{ fontSize: 13.5, color: isFullyVerified ? '#047857' : '#B45309', marginTop: 2 }}>
              • Phải xác minh cả Email và Phone trước khi đăng Job
            </div>
          </div>
        </div>

        {isFullyVerified && onNavigateCreateJob && (
          <button
            type="button"
            onClick={onNavigateCreateJob}
            style={{
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '9px 18px',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
            }}
          >
            <span>Tạo tin tuyển dụng ngay</span>
            <ArrowRight size={15} />
          </button>
        )}
      </div>

      {/* Wireframe Note Box matching WF-E03 100% */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 8,
        border: '1.5px dashed #CBD5E1',
        background: '#F8FAFC',
        fontSize: 13,
        color: '#64748B',
        lineHeight: 1.5
      }}>
        Trạng thái UI / TBD: Provider, G-15 OTP expiry, G-16 rate limit TBD.
      </div>
    </div>
  );
}

