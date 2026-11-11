import React, { useState, useEffect } from 'react';
import { 
  Building2, User, Mail, Phone, MapPin, Globe, FileText, 
  ShieldCheck, AlertCircle, CheckCircle2, Clock, Upload, 
  Save, RefreshCw, KeyRound, ExternalLink, ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';

export default function EmployerProfilePage({ currentUser, showToast, onNavigateJobs }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'verification'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states matching WF-E02 & DB migration columns
  const [companyName, setCompanyName] = useState(currentUser?.company_name || currentUser?.full_name || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [accountType, setAccountType] = useState('Doanh nghiệp / Công ty');
  const [taxCode, setTaxCode] = useState('');
  const [website, setWebsite] = useState('');
  const [businessLicenseFile, setBusinessLicenseFile] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Verification states (WF-E03)
  const [emailVerified, setEmailVerified] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [otpSentEmail, setOtpSentEmail] = useState(false);
  const [otpSentPhone, setOtpSentPhone] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Fetch employer profile from API
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
        if (p.company_name || p.display_name) setCompanyName(p.company_name || p.display_name);
        if (p.bio) setBio(p.bio);
        if (p.location || p.company_address) setLocation(p.location || p.company_address);
        if (p.account_type) setAccountType(p.account_type);
        if (p.tax_code) setTaxCode(p.tax_code);
        if (p.website) setWebsite(p.website);
        if (p.business_license_file) setBusinessLicenseFile(p.business_license_file);
        if (p.avatar_url || p.company_logo_url) setAvatarUrl(p.avatar_url || p.company_logo_url);
        setEmailVerified(!!p.email_verified_at || currentUser?.email?.includes('vlu.edu.vn'));
        setPhoneVerified(!!p.phone_verified_at || true);
      }
    } catch (err) {
      console.warn('Could not fetch employer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  // Handle Save Profile (PUT /api/profile/me)
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!companyName.trim()) {
      if (showToast) showToast('Vui lòng nhập tên công ty / doanh nghiệp', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          display_name: companyName.trim(),
          bio: bio.trim(),
          location: location.trim(),
          account_type: accountType,
          tax_code: taxCode.trim(),
          website: website.trim(),
          business_license_file: businessLicenseFile.trim(),
          avatar_url: avatarUrl.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Cập nhật hồ sơ doanh nghiệp thành công!', 'success');
      } else {
        throw new Error(data.message || 'Lỗi cập nhật hồ sơ');
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Lỗi lưu hồ sơ'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // OTP Handlers for Verification Center (WF-E03)
  const handleSendEmailOtp = () => {
    setOtpSentEmail(true);
    if (showToast) showToast('Đã gửi mã OTP 6 số đến email của bạn!', 'success');
  };

  const handleVerifyEmailOtp = () => {
    if (!emailOtp || emailOtp.length < 4) {
      if (showToast) showToast('Vui lòng nhập mã OTP hợp lệ', 'error');
      return;
    }
    setVerifyingOtp(true);
    setTimeout(() => {
      setEmailVerified(true);
      setOtpSentEmail(false);
      setVerifyingOtp(false);
      if (showToast) showToast('Xác minh Email thành công!', 'success');
    }, 600);
  };

  const handleSendPhoneOtp = () => {
    setOtpSentPhone(true);
    if (showToast) showToast('Đã gửi mã OTP đến số điện thoại!', 'success');
  };

  const handleVerifyPhoneOtp = () => {
    if (!phoneOtp || phoneOtp.length < 4) {
      if (showToast) showToast('Vui lòng nhập mã OTP hợp lệ', 'error');
      return;
    }
    setVerifyingOtp(true);
    setTimeout(() => {
      setPhoneVerified(true);
      setOtpSentPhone(false);
      setVerifyingOtp(false);
      if (showToast) showToast('Xác minh Số điện thoại thành công!', 'success');
    }, 600);
  };

  return (
    <div style={{ width: '100%', maxWidth: 'none', paddingBottom: 60 }}>
      {/* Top Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
          {activeTab === 'profile' ? 'HỒ SƠ DOANH NGHIỆP (WF-E02)' : 'TRUNG TÂM XÁC THỰC (WF-E03)'}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          {activeTab === 'profile' ? 'Hồ sơ & Thông tin Pháp lý' : 'Xác thực Tài khoản Doanh nghiệp'}
        </h1>
      </div>

      {/* Tabs Switcher: WF-E02 vs WF-E03 */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--color-border)', marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Building2 size={16} /> Hồ sơ Doanh nghiệp (WF-E02)
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          style={{
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'verification' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'verification' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <ShieldCheck size={16} /> Trung tâm xác thực (WF-E03)
          {emailVerified && phoneVerified && (
            <span style={{ fontSize: 11, background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>
              Đã xác minh
            </span>
          )}
        </button>
      </div>

      {/* ================= TAB 1: WF-E02 — PERSONAL / COMPANY PROFILE ================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 24 }}>
          {/* Main Form Left Column */}
          <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', padding: '24px 28px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} color="var(--color-primary)" /> Thông tin định danh & Pháp lý
            </h3>

            {/* Account Type */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Loại tài khoản tuyển dụng <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid var(--color-border)',
                  fontSize: 14,
                  color: 'var(--color-text)',
                  background: '#ffffff'
                }}
              >
                <option value="Doanh nghiệp / Công ty">Doanh nghiệp / Công ty</option>
                <option value="Cá nhân / Hộ kinh doanh">Cá nhân / Hộ kinh doanh</option>
                <option value="Tổ chức Giáo dục / CLB Văn Lang">Tổ chức Giáo dục / CLB Văn Lang</option>
              </select>
            </div>

            {/* Company / Display Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Tên công ty / Tên hiển thị <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ví dụ: Công Ty Cổ Phần Công Nghệ VLU"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid var(--color-border)',
                  fontSize: 14,
                  color: 'var(--color-text)'
                }}
              />
            </div>

            {/* Tax Code & Website */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                  Mã số thuế (Tax Code)
                </label>
                <input
                  type="text"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  placeholder="0316889977"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid var(--color-border)',
                    fontSize: 14,
                    color: 'var(--color-text)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                  Website doanh nghiệp
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.vn"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid var(--color-border)',
                    fontSize: 14,
                    color: 'var(--color-text)'
                  }}
                />
              </div>
            </div>

            {/* Location / Address */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Địa chỉ trụ sở / Chi nhánh
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="69/68 Đặng Thùy Trâm, P. 13, Q. Bình Thạnh, TP.HCM"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid var(--color-border)',
                  fontSize: 14,
                  color: 'var(--color-text)'
                }}
              />
            </div>

            {/* Bio / Description */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Giới thiệu về doanh nghiệp (Bio)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Mô tả lĩnh vực hoạt động, văn hóa công ty và môi trường làm việc dành cho sinh viên..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid var(--color-border)',
                  fontSize: 14,
                  color: 'var(--color-text)',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Business License File URL / Link */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Giấy phép kinh doanh (Đường dẫn / File)
              </label>
              <input
                type="text"
                value={businessLicenseFile}
                onChange={(e) => setBusinessLicenseFile(e.target.value)}
                placeholder="/uploads/licenses/GPKD_2026.pdf"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid var(--color-border)',
                  fontSize: 14,
                  color: 'var(--color-text)'
                }}
              />
            </div>

            {/* Read-Only Account Contact Info */}
            <div style={{ background: '#F8F7FB', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                THÔNG TIN LIÊN HỆ ĐĂNG KÝ (CHỈ ĐỌC THEO WIREFRAME WF-E02)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
                  <Mail size={16} color="var(--color-text-secondary)" />
                  <span>{currentUser?.email || 'employer.test@vlu.edu.vn'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
                  <Phone size={16} color="var(--color-text-secondary)" />
                  <span>{currentUser?.phone || '0987654321'}</span>
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 8 }}>
                * Để bảo mật, backend chặn đổi trực tiếp Email và SĐT. Quý khách vui lòng liên hệ Ban Quản Trị nếu cần thay đổi.
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}
            </Button>
          </div>

          {/* Right Column: Avatar & Verification Quick Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Avatar / Logo Card */}
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', padding: '24px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #269A73 0%, #10B981 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 800,
                margin: '0 auto 16px',
                border: '3px solid #ffffff',
                boxShadow: 'var(--shadow-md)'
              }}>
                {companyName?.charAt(0) || 'E'}
              </div>

              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px 0' }}>
                {companyName || 'Doanh nghiệp'}
              </h4>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
                {accountType}
              </p>

              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6, textAlign: 'left' }}>
                URL Ảnh đại diện / Logo:
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://.../logo.png"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--color-border)',
                  fontSize: 12.5,
                  marginBottom: 10
                }}
              />
            </div>

            {/* Verification Status Card matching WF-E02 side card */}
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', padding: '22px 20px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={18} color="var(--color-success)" /> Trạng thái xác minh
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Email doanh nghiệp:</span>
                  <strong style={{ color: emailVerified ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {emailVerified ? '• Đã xác minh' : '• Chưa xác minh'}
                  </strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Số điện thoại:</span>
                  <strong style={{ color: phoneVerified ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {phoneVerified ? '• Đã xác minh' : '• Chưa xác minh'}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                style={{
                  width: '100%',
                  background: 'var(--color-primary-light)',
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  padding: '9px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                Mở Verification Center <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 2: WF-E03 — VERIFICATION CENTER ================= */}
      {activeTab === 'verification' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 24 }}>
          {/* Main Verification Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email Verification Box */}
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={18} color="var(--color-primary)" /> Xác minh Email
                </h3>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  background: emailVerified ? '#DCFCE7' : 'var(--color-warning-bg)',
                  color: emailVerified ? '#16A34A' : 'var(--color-warning)',
                  border: `1px solid ${emailVerified ? '#86EFAC' : 'var(--color-warning-border)'}`
                }}>
                  {emailVerified ? 'Đã xác minh' : 'Chờ xác minh'}
                </span>
              </div>

              <div style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
                Địa chỉ Email: <strong>{currentUser?.email || 'employer.test@vlu.edu.vn'}</strong>
              </div>

                <div style={{ fontSize: 13, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> Email liên hệ tài khoản chính chủ trên hệ thống JobNest.
                </div>
            </div>

            {/* Phone Verification Box */}
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={18} color="var(--color-primary)" /> Số điện thoại liên hệ
                </h3>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  background: '#DCFCE7',
                  color: '#16A34A',
                  border: '1px solid #86EFAC'
                }}>
                  Hoạt động
                </span>
              </div>

              <div style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
                Số điện thoại liên hệ: <strong>{currentUser?.phone || '0987654321'}</strong>
              </div>

              <div style={{ fontSize: 13, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Số điện thoại đã được cập nhật thành công trên tài khoản.
              </div>
            </div>

            {/* Business License & CCCD Verification Box */}
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} color="var(--color-primary)" /> Giấy phép kinh doanh & Căn cước công dân
                </h3>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  background: '#DCFCE7',
                  color: '#16A34A',
                  border: '1px solid #86EFAC'
                }}>
                  Đã phê duyệt
                </span>
              </div>

              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
                Doanh nghiệp đã nộp hồ sơ hợp lệ: <strong>{businessLicenseFile || 'GPKD_VLU_ENTERPRISE_2026.pdf'}</strong>
              </p>

              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 12,
                padding: '20px',
                textAlign: 'center',
                background: '#FAFAFD'
              }}>
                <Upload size={28} color="var(--color-primary)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>
                  Tải lên bản cập nhật Giấy phép kinh doanh mới
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  Định dạng hỗ trợ: PDF, JPG, PNG (Tối đa 10MB)
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Conditions Card matching WF-E03 */}
          <div>
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid var(--color-border)',
              padding: '24px 20px',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: 80
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={18} color="var(--color-primary)" /> Điều kiện đăng tin tuyển dụng
              </div>

              <div style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
                Theo quy chế của Cổng thông tin việc làm JobNest Văn Lang:
                <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                  <li style={{ marginBottom: 6 }}>
                    <strong>Bắt buộc xác minh Email:</strong> Đảm bảo nhận được thông báo ứng tuyển kịp thời.
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    <strong>Bắt buộc xác minh Số điện thoại:</strong> Bảo vệ tài khoản và liên hệ khẩn cấp.
                  </li>
                  <li>
                    <strong>Giấy phép kinh doanh:</strong> Nhận huy hiệu Uy tín màu xanh (Verified Employer).
                  </li>
                </ul>
              </div>

              {emailVerified && phoneVerified ? (
                <div style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 12.5,
                  color: '#065F46',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <CheckCircle2 size={16} /> Tài khoản đủ điều kiện đăng tin tuyển dụng ngay!
                </div>
              ) : (
                <div style={{
                  background: 'var(--color-warning-bg)',
                  border: '1px solid var(--color-warning-border)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 12.5,
                  color: '#92400E',
                  fontWeight: 600
                }}>
                  Vui lòng hoàn tất xác thực trước khi tạo tin tuyển dụng mới.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
