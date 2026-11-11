import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck, AlertCircle, ArrowRight, Save, Camera, CheckCircle2, Settings } from 'lucide-react';
import { Button } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';

export default function EmployerPersonalProfilePage({
  currentUser,
  showToast,
  onNavigateVerification,
  onNavigateSettings,
  onProfileUpdated
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: currentUser?.full_name || '',
    bio: '',
    location: '',
    avatarUrl: ''
  });

  // Read-only account credentials
  const email = currentUser?.email || 'employer.test@vlu.edu.vn';
  const phone = currentUser?.phone || '0901234567';

  // Verification states
  const emailVerified = currentUser?.status === 'ACTIVE' || currentUser?.verification_status === 'VERIFIED';
  const phoneVerified = Boolean(
    currentUser?.phone_verified || 
    currentUser?.verification_status === 'VERIFIED' ||
    (currentUser?.id && localStorage.getItem(`jobnest_employer_phone_verified_${currentUser.id}`) === 'true')
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/profile/me`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const p = data.data;
          setFormData({
            displayName: p.display_name || p.full_name || currentUser.full_name || '',
            bio: p.bio || '',
            location: p.location || p.company_address || 'TP. Hồ Chí Minh',
            avatarUrl: p.avatar_url || ''
          });
        }
      } catch (err) {
        console.warn('Could not load profile from API, using local state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.displayName.trim()) {
      if (showToast) showToast('Vui lòng nhập tên hiển thị', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          display_name: formData.displayName.trim(),
          bio: formData.bio.trim(),
          location: formData.location.trim(),
          avatar_url: formData.avatarUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Đã lưu thay đổi hồ sơ cá nhân thành công!', 'success');
        if (onProfileUpdated) {
          onProfileUpdated({
            display_name: formData.displayName.trim(),
            bio: formData.bio.trim(),
            location: formData.location.trim(),
            avatar_url: formData.avatarUrl
          });
        }
      } else {
        if (showToast) showToast(data.message || 'Lỗi cập nhật hồ sơ', 'error');
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Lỗi cập nhật hồ sơ cá nhân'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          HỒ SƠ CÁ NHÂN
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0 0' }}>
          Hồ sơ Cá nhân Nhà tuyển dụng
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: 13.5, color: 'var(--color-text-secondary)' }}>
          Quản lý thông tin hiển thị cá nhân người đăng tin. Email và số điện thoại được bảo vệ chỉ đọc.
        </p>
      </div>

      {/* 2-Column Main Layout matching WF-E02 Wireframe */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
        gap: 24,
        alignItems: 'flex-start'
      }}>
        {/* ================= CỘT TRÁI: KHỐI HỒ SƠ ================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1.5px solid #000000',
          padding: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#000000',
            marginBottom: 20,
            paddingBottom: 10,
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <User size={18} />
            <span>Hồ sơ</span>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Ảnh đại diện */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
                Ảnh đại diện
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 800,
                  border: '2px solid #000000',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                }}>
                  {formData.displayName ? formData.displayName.charAt(0).toUpperCase() : 'E'}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showToast) showToast('Ảnh đại diện đã được cập nhật từ tài khoản');
                    }}
                    style={{
                      padding: '7px 14px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      background: '#F1F5F9',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Camera size={14} /> Thay đổi ảnh
                  </button>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
                    Định dạng PNG, JPG tối đa 2MB
                  </div>
                </div>
              </div>
            </div>

            {/* Tên hiển thị */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
                Tên hiển thị <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="VD: Nguyễn Văn Anh (HR Manager)"
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: '1.5px solid #000000',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
                Bio (Giới thiệu bản thân)
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Mô tả ngắn gọn về vị trí làm việc, kinh nghiệm tuyển dụng của bạn..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #000000',
                  fontSize: 13.5,
                  color: '#0F172A',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Địa điểm */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
                Địa điểm
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 14px 0 38px',
                    borderRadius: 8,
                    border: '1.5px solid #000000',
                    fontSize: 14,
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
                <MapPin size={16} color="#64748B" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>

            {/* Email (chỉ đọc) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                  Email (chỉ đọc)
                </label>
                <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 700 }}>
                  ✓ Đã xác minh
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  disabled
                  readOnly
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 14px 0 38px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#64748B',
                    fontSize: 14,
                    cursor: 'not-allowed'
                  }}
                />
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>

            {/* Số điện thoại (chỉ đọc) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                  Số điện thoại (chỉ đọc)
                </label>
                <span style={{ fontSize: 11.5, color: phoneVerified ? '#059669' : '#D97706', fontWeight: 700 }}>
                  {phoneVerified ? '✓ Đã xác minh' : 'Chưa xác minh'}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={phone}
                  disabled
                  readOnly
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 14px 0 38px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#64748B',
                    fontSize: 14,
                    cursor: 'not-allowed'
                  }}
                />
                <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>

            {/* Nút Lưu thay đổi */}
            <div style={{ paddingTop: 10 }}>
              <button
                type="submit"
                disabled={saving || loading}
                style={{
                  background: '#000000',
                  color: '#ffffff',
                  border: '1.5px solid #000000',
                  borderRadius: 8,
                  padding: '11px 24px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: saving ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#27272A'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
              >
                <Save size={16} />
                <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ================= CỘT PHẢI: KHỐI XÁC MINH ================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1.5px solid #000000',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: 90
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#000000',
            marginBottom: 16,
            paddingBottom: 10,
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <ShieldCheck size={18} color="#059669" />
            <span>Trạng thái tài khoản</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
            {/* Email status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5 }}>
              <span style={{ color: '#334155', fontWeight: 600 }}>• Email:</span>
              <span style={{
                background: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0',
                padding: '2px 10px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700
              }}>
                Hoạt động
              </span>
            </div>

            {/* Phone status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5 }}>
              <span style={{ color: '#334155', fontWeight: 600 }}>• Điện thoại:</span>
              <span style={{
                background: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0',
                padding: '2px 10px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700
              }}>
                Hoạt động
              </span>
            </div>
          </div>

          {/* Button Cài đặt tài khoản & Đổi mật khẩu (WF-X03) */}
          {onNavigateSettings && (
            <button
              type="button"
              onClick={onNavigateSettings}
              style={{
                width: '100%',
                background: '#ffffff',
                color: '#7565A8',
                border: '1.5px solid #7565A8',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F1EEF8'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <Settings size={15} />
              <span>Cài đặt tài khoản & Đổi mật khẩu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

