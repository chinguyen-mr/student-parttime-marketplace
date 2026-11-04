import React, { useState } from 'react';
import { 
  Building2, Mail, Phone, MapPin, Globe, ShieldCheck, 
  FileCheck, Upload, Trash2, KeyRound, X, CheckCircle 
} from 'lucide-react';
import { AnimatedModal, Button } from '../ui';

export default function EmployerProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) {
  const [accountType, setAccountType] = useState('ENTERPRISE'); // 'ENTERPRISE' | 'INDIVIDUAL'
  const [companyName, setCompanyName] = useState('TechCorp Vietnam / ABC Retail');
  const [taxCode, setTaxCode] = useState('0312345678');
  const [contactPerson, setContactPerson] = useState(currentUser?.full_name || 'Nguyễn Tuyển Dụng');
  const [phone, setPhone] = useState('0909123456');
  const [email, setEmail] = useState(currentUser?.email || 'techcorp@gmail.com');
  const [address, setAddress] = useState('Tầng 8, Tòa nhà Landmark, Quận 1, TP. Hồ Chí Minh');
  const [website, setWebsite] = useState('https://techcorp.vn');
  const [description, setDescription] = useState('Tập đoàn công nghệ và bán lẻ hàng đầu với hệ thống chi nhánh phủ rộng TP.HCM, thường xuyên tạo điều kiện việc làm thực tế cho sinh viên Văn Lang.');
  const [licenseFileName, setLicenseFileName] = useState('Giay_Phep_Kinh_Doanh_TechCorp.pdf');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (onSave) {
        onSave({
          companyName,
          taxCode,
          contactPerson,
          phone,
          email,
          address,
          website,
          description,
        });
      }
      onClose();
    }, 400);
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="760px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}>
        {/* Header (Wireframe Screen 14) */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--color-background)',
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              HỒ SƠ NHÀ TUYỂN DỤNG (Profile Doanh nghiệp)
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
              Quản lý thông tin cá nhân hoặc doanh nghiệp dùng để tuyển dụng sinh viên
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* Logo & Account Status Top Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 20,
            alignItems: 'center',
            background: 'var(--color-background)',
            padding: 16,
            borderRadius: 10,
            border: '1px solid var(--color-border)',
            marginBottom: 20,
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              background: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 24,
              boxShadow: '0 4px 10px rgba(89, 70, 117, 0.2)',
            }}>
              <Building2 size={36} />
            </div>

            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <button
                  type="button"
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Upload size={13} /> THAY ẢNH LOGO
                </button>
                <button
                  type="button"
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid #fecaca',
                    background: '#fff1f2',
                    color: '#e11d48',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Trash2 size={13} /> XÓA ẢNH
                </button>
              </div>

              <div style={{ fontSize: 13, color: '#475569', display: 'flex', gap: 16, alignItems: 'center' }}>
                <span>Email đăng nhập: <strong>{email}</strong></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 700 }}>
                  <ShieldCheck size={16} /> Đã xác thực doanh nghiệp
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields matching Wireframe Screen 14 */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>
              THÔNG TIN NHÀ TUYỂN DỤNG
            </h4>

            {/* Loại tài khoản radio */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                Loại tài khoản (*)
              </label>
              <div style={{ display: 'flex', gap: 18 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="accountType"
                    checked={accountType === 'ENTERPRISE'}
                    onChange={() => setAccountType('ENTERPRISE')}
                  />
                  🏢 Doanh nghiệp / Công ty
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="accountType"
                    checked={accountType === 'INDIVIDUAL'}
                    onChange={() => setAccountType('INDIVIDUAL')}
                  />
                  👤 Hộ kinh doanh / Cá nhân
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}>
                  Tên doanh nghiệp / Họ và tên đại diện (*)
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: '100%', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}>
                  Mã số thuế (nếu có)
                </label>
                <input
                  type="text"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  style={{ width: '100%', fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}>
                  Người liên hệ trực tiếp (*)
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  style={{ width: '100%', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}>
                  Số điện thoại liên hệ (*)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}>
                  Email liên hệ tuyển dụng (*)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}>
                  Website công ty (không bắt buộc)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  style={{ width: '100%', fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}>
                Địa chỉ văn phòng / Địa điểm làm việc (*)
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', fontSize: 13 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}>
                Giới thiệu nhà tuyển dụng
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', fontSize: 13 }}
              />
            </div>

            {/* Tài liệu xác thực (Giấy phép kinh doanh) */}
            <div style={{
              background: 'var(--color-background)',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <FileCheck size={20} color="#16a34a" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{licenseFileName}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Giấy phép kinh doanh đã được Admin phê duyệt</div>
                </div>
              </div>
              <label style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                [CHỌN TỆP]
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) setLicenseFileName(e.target.files[0].name);
                  }}
                />
              </label>
            </div>

            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic', margin: '0 0 16px 0' }}>
              (*) Thông tin bắt buộc. Thông tin hiển thị trên các tin tuyển dụng sẽ lấy từ hồ sơ này.
            </p>
          </div>

          {/* Footer Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            borderTop: '1px solid var(--color-border)',
            paddingTop: 16,
          }}>
            <Button variant="secondary" type="button" onClick={onClose} style={{ padding: '8px 18px', fontSize: 13 }}>
              HỦY THAY ĐỔI
            </Button>
            <Button variant="primary" type="submit" disabled={isSaving} style={{ padding: '8px 24px', fontSize: 13 }}>
              {isSaving ? 'ĐANG LƯU...' : 'CẬP NHẬT HỒ SƠ'}
            </Button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
