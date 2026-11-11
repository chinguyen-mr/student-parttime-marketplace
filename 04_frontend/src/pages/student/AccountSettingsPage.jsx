import React, { useState } from 'react';
import { 
  Lock, KeyRound, Mail, Phone, ShieldCheck, 
  AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, 
  Sparkles, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { API_BASE } from '../../config/api';

export default function AccountSettingsPage({
  currentUser,
  onNavigateBack,
  showToast,
  embedded = false
}) {
  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'contact'

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Update Email/Phone Form State
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Xác nhận mật khẩu mới không khớp');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      return;
    }

    if (!currentUser?.token) {
      setPasswordError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    setSubmittingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể đổi mật khẩu');
      }

      setPasswordSuccess(data.message || 'Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (showToast) {
        showToast('Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
      }
    } catch (err) {
      setPasswordError(err.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setSubmittingPassword(false);
    }
  };

  const settingsContent = (
    <div style={{ maxWidth: embedded ? '100%' : 860, margin: embedded ? '0' : '24px auto', padding: embedded ? '0' : '0 20px' }}>
      {embedded && (
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text, #0F172A)', margin: '0 0 4px 0' }}>
            Cài đặt tài khoản & Bảo mật (WF-X03)
          </h2>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 13, margin: 0 }}>
            Quản lý mật khẩu đăng nhập, bảo mật 2 lớp và cập nhật thông tin liên hệ
          </p>
        </div>
      )}

      {/* Subtabs switcher (WF-X03) */}
      <div 
        style={{
          display: 'flex',
          gap: 12,
          borderBottom: '2px solid #E2E8F0',
          marginBottom: 24
        }}
      >
          <button
            onClick={() => {
              setActiveTab('password');
              setPasswordError('');
              setPasswordSuccess('');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              fontSize: 14.5,
              fontWeight: activeTab === 'password' ? 700 : 500,
              color: activeTab === 'password' ? '#7565A8' : '#64748B',
              borderBottom: activeTab === 'password' ? '3px solid #7565A8' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: -2
            }}
          >
            <KeyRound size={17} /> Đổi mật khẩu
          </button>

          <button
            onClick={() => {
              setActiveTab('contact');
              setPasswordError('');
              setPasswordSuccess('');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              fontSize: 14.5,
              fontWeight: activeTab === 'contact' ? 700 : 500,
              color: activeTab === 'contact' ? '#7565A8' : '#64748B',
              borderBottom: activeTab === 'contact' ? '3px solid #7565A8' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: -2
            }}
          >
            <Mail size={17} /> Cập nhật Email / Số điện thoại
          </button>
        </div>

        {/* TAB 1: ĐỔI MẬT KHẨU (WF-X03) */}
        {activeTab === 'password' && (
          <div 
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1.5px solid #000000',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EDE9FE', color: '#7565A8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Đổi mật khẩu tài khoản
                </h2>
                <span style={{ fontSize: 13, color: '#64748B' }}>
                  Vui lòng đặt mật khẩu mạnh tối thiểu 6 ký tự để bảo vệ an toàn cho tài khoản
                </span>
              </div>
            </div>

            <form onSubmit={handleChangePassword} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Error Message */}
              {passwordError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, color: '#991B1B', fontSize: 13.5 }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Success Message */}
              {passwordSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, color: '#166534', fontSize: 13.5 }}>
                  <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                  Mật khẩu hiện tại <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu bạn đang sử dụng"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 42px 10px 14px',
                      borderRadius: 8,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                  Mật khẩu mới <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 42px 10px 14px',
                      borderRadius: 8,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                  Xác nhận lại mật khẩu mới <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Nhập lại chính xác mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
                <button
                  type="submit"
                  disabled={submittingPassword}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#7565A8',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: submittingPassword ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(117, 101, 168, 0.25)'
                  }}
                >
                  {submittingPassword ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      Cập nhật mật khẩu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: CẬP NHẬT EMAIL / SỐ ĐIỆN THOẠI (WF-X03 ANNOTATION TBD) */}
        {activeTab === 'contact' && (
          <div 
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1.5px solid #000000',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
              Thông tin liên lạc tài khoản
            </h2>
            <p style={{ fontSize: 13.5, color: '#64748B', marginBottom: 24 }}>
              Thông tin địa chỉ email và số điện thoại dùng để nhận thông báo công việc từ Nhà tuyển dụng và hệ thống.
            </p>

            {/* Current Badges */}
            <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 12 }}>
                Thông tin hiện tại
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 13.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={16} color="#7565A8" />
                  <span>Email: <strong>{currentUser?.email || 'chua_cap_nhat@jobnest.vn'}</strong></span>
                  <span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                    Hoạt động
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={16} color="#7565A8" />
                  <span>SĐT: <strong>{currentUser?.phone || '0987654321'}</strong></span>
                  <span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                    Hoạt động
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );

  if (embedded) {
    return (
      <div 
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid var(--color-border, #E2E8F0)',
          padding: '28px 32px',
          boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)'
        }}
      >
        {settingsContent}
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Top Navigation */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #E2E8F0', padding: '14px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Cài đặt tài khoản & Bảo mật
            </h1>
          </div>

          {onNavigateBack && (
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
              <ArrowLeft size={14} /> Quay lại
            </button>
          )}
        </div>
      </div>

      {settingsContent}
    </div>
  );
}

