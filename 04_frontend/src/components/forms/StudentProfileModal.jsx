import React, { useState } from 'react';
import { 
  User, Mail, Phone, Calendar, School, MapPin, 
  FileText, Plus, X, UploadCloud, CheckCircle2, Award, Camera, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedModal, Button } from '../ui';

export function StudentProfileCard({
  currentUser,
  onSave,
  onCancel,
  isModal = false,
}) {
  // Đọc dữ liệu đã lưu trong localStorage hoặc từ currentUser
  const savedProfile = (() => {
    if (!currentUser?.id) return null;
    try {
      const cached = localStorage.getItem(`jobnest_student_profile_${currentUser.id}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  })();

  const isDemoStudent = currentUser?.email === 'student.test@vlu.edu.vn' || currentUser?.id === 4 || !currentUser;

  const [fullName, setFullName] = useState(
    currentUser?.full_name || savedProfile?.fullName || (isDemoStudent ? 'Nguyễn Văn Chí' : '')
  );
  const [phone, setPhone] = useState(
    currentUser?.phone || savedProfile?.phone || (isDemoStudent ? '0912345678' : '')
  );
  const [dob, setDob] = useState(
    currentUser?.dob || savedProfile?.dob || (isDemoStudent ? '2003-05-15' : '')
  );
  const [university, setUniversity] = useState(
    currentUser?.university || currentUser?.school || savedProfile?.university || (isDemoStudent ? 'Trường Đại học Văn Lang (VLU)' : '')
  );
  const [major, setMajor] = useState(
    currentUser?.major || currentUser?.faculty || savedProfile?.major || (isDemoStudent ? 'Khoa Công nghệ Thông tin' : '')
  );
  const [address, setAddress] = useState(
    currentUser?.location || currentUser?.address || savedProfile?.address || (isDemoStudent ? 'Quận Bình Thạnh, TP. Hồ Chí Minh' : '')
  );
  const [bio, setBio] = useState(
    currentUser?.bio || savedProfile?.bio || (isDemoStudent ? 'Sinh viên năm 4 đam mê lập trình Web, tìm kiếm cơ hội thực tập và việc làm part-time để tích lũy kinh nghiệm thực tế.' : '')
  );
  
  // Default skills or existing skills
  const [skills, setSkills] = useState(() => {
    if (savedProfile?.skills && Array.isArray(savedProfile.skills) && savedProfile.skills.length > 0) return savedProfile.skills;
    if (currentUser?.skills && Array.isArray(currentUser.skills) && currentUser.skills.length > 0) return currentUser.skills;
    if (isDemoStudent) return ['Giao tiếp', 'Làm việc nhóm', 'Tin học văn phòng', 'Java', 'SQL'];
    return [];
  });
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  
  // CV file
  const [cvFileName, setCvFileName] = useState(
    savedProfile?.cvFileName || currentUser?.cv_url || (isDemoStudent ? 'CV_NguyenVanChi.pdf' : '')
  );
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Tính toán các trường còn thiếu để thông báo cho sinh viên
  const missingFields = [];
  if (!fullName?.trim()) missingFields.push('Họ và tên');
  if (!phone?.trim()) missingFields.push('Số điện thoại');
  if (!dob?.trim()) missingFields.push('Ngày sinh');
  if (!university?.trim()) missingFields.push('Trường / Khoa');
  if (!address?.trim()) missingFields.push('Địa chỉ');
  if (!bio?.trim()) missingFields.push('Giới thiệu bản thân');
  if (!skills || skills.length === 0) missingFields.push('Kỹ năng');
  if (!cvFileName) missingFields.push('File CV đính kèm');

  const totalRequired = 8;
  const completedCount = totalRequired - missingFields.length;
  const percentComplete = Math.round((completedCount / totalRequired) * 100);
  const isProfileComplete = missingFields.length === 0;

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (onSave) {
        onSave({
          fullName,
          phone,
          dob,
          university,
          major,
          address,
          bio,
          skills,
          cvFileName,
          avatarUrl,
        });
      }
    }, 350);
  };

  return (
    <form onSubmit={handleSaveSubmit} style={{ width: '100%' }}>
      {/* ================= 1. AVATAR & STUDENT HEADER ================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => document.getElementById('profile-avatar-upload')?.click()}
            style={{
              width: 92,
              height: 92,
              borderRadius: '50%',
              border: '2px solid var(--color-primary)',
              background: '#F9E5DC',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(89, 70, 117, 0.16)',
              transition: 'transform 0.15s ease',
            }}
            title="Bấm để tải ảnh đại diện lên"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <User size={36} color="var(--color-primary)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginTop: 2 }}>Avatar</span>
              </>
            )}
          </div>
          <div 
            onClick={() => document.getElementById('profile-avatar-upload')?.click()}
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            }}
            title="Đổi ảnh đại diện"
          >
            <Camera size={13} />
          </div>
          <input
            id="profile-avatar-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setAvatarUrl(URL.createObjectURL(e.target.files[0]));
              }
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 21, fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.3px' }}>
              {fullName || 'Nguyễn Văn Chí'}
            </h3>
            <span style={{
              fontSize: 11.5,
              fontWeight: 700,
              background: '#F9E5DC',
              color: 'var(--color-primary)',
              border: '1px solid #F2A184',
              padding: '2px 9px',
              borderRadius: 6,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              ✓ Sinh viên VLU
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            {university} • {major}
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('profile-avatar-upload')?.click()}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-primary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 4,
              display: 'inline-block',
              textDecoration: 'underline'
            }}
          >
            Chọn ảnh đại diện khác...
          </button>
        </div>
      </div>

      {/* ================= BANNER KIỂM TRA ĐỘ HOÀN THIỆN HỒ SƠ ================= */}
      {isProfileComplete ? (
        <div style={{
          background: '#ECFDF5',
          border: '1.5px solid #10B981',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)',
        }}>
          <CheckCircle2 size={24} color="#10B981" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#065F46' }}>
              Trạng thái: Hồ sơ đã đầy đủ thông tin (100%)
            </div>
            <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
              Thông tin của bạn đã đầy đủ. Bạn có thể ứng tuyển ngay bất kỳ công việc nào mà không cần nhập lại!
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: '#FFFBEB',
          border: '1.5px solid #F59E0B',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)',
        }}>
          <AlertTriangle size={24} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#92400E' }}>
              Trạng thái: Hồ sơ chưa đầy đủ ({percentComplete}%)
            </div>
            <div style={{ fontSize: 12.5, color: '#B45309', marginTop: 4, lineHeight: 1.5 }}>
              Còn thiếu: <strong>{missingFields.join(', ')}</strong>. Vui lòng bổ sung đầy đủ các mục trên để đủ điều kiện ứng tuyển việc làm!
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. MAIN BORDERED CARD CONTAINER (Matching Wireframe) ================= */}
      <div style={{
        border: '1px solid #cbd5e1',
        borderRadius: 12,
        padding: '24px 28px',
        background: '#ffffff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}>
        {/* ================= PHẦN 1: THÔNG TIN CÁ NHÂN ================= */}
        <div>
          <h4 style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: 'var(--color-text)',
            letterSpacing: '0.4px',
            margin: '0 0 16px 0',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            THÔNG TIN CÁ NHÂN
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px 24px',
          }}>
            {/* Họ và tên */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                Họ và tên
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A.................."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 13.5,
                  color: 'var(--color-text)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                  Email
                </label>
                <span style={{ fontSize: 11, color: '#806A9F', fontWeight: 600, fontStyle: 'italic' }}>
                  "Không thể thay đổi"
                </span>
              </div>
              <input
                type="email"
                disabled
                value={currentUser?.email || 'sinhvien@email.com'}
                placeholder="sinhvien@email.com..................."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--color-border)',
                  fontSize: 13.5,
                  background: 'var(--color-background)',
                  color: 'var(--color-text-secondary)',
                  cursor: 'not-allowed',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxx..................."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 13.5,
                  color: 'var(--color-text)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Ngày sinh */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                Ngày sinh
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                placeholder="DD/MM/YYYY..................."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 13.5,
                  color: 'var(--color-text)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Trường / Khoa */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                Trường / Khoa
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Trường Đại học Văn Lang..................."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 13.5,
                  color: 'var(--color-text)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                Địa chỉ
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Quận Bình Thạnh, TP. Hồ Chí Minh..................."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 13.5,
                  color: 'var(--color-text)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div style={{ height: 1, background: 'var(--color-border)', margin: '22px 0' }} />

        {/* ================= PHẦN 2: GIỚI THIỆU BẢN THÂN ================= */}
        <div>
          <h4 style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: 'var(--color-text)',
            letterSpacing: '0.4px',
            margin: '0 0 10px 0',
            textTransform: 'uppercase'
          }}>
            GIỚI THIỆU BẢN THÂN
          </h4>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Viết vài dòng giới thiệu về bản thân, mục tiêu và kinh nghiệm..................."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 13.5,
              lineHeight: 1.55,
              color: 'var(--color-text)',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Divider Line */}
        <div style={{ height: 1, background: 'var(--color-border)', margin: '22px 0' }} />

        {/* ================= PHẦN 3: KỸ NĂNG ================= */}
        <div>
          <h4 style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: 'var(--color-text)',
            letterSpacing: '0.4px',
            margin: '0 0 4px 0',
            textTransform: 'uppercase'
          }}>
            KỸ NĂNG
          </h4>
          <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', margin: '0 0 12px 0' }}>
            Các kỹ năng hiện có:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 8,
                  background: 'var(--color-lavender-surface)',
                  color: 'var(--color-text)',
                  fontSize: 13,
                  fontWeight: 700,
                  border: '1.5px solid var(--color-text)',
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  title={`Xóa kỹ năng ${skill}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: 2,
                  }}
                >
                  <X size={14} />
                </button>
              </span>
            ))}

            {isAddingSkill ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="text"
                  autoFocus
                  placeholder="Nhập kỹ năng mới..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    } else if (e.key === 'Escape') {
                      setIsAddingSkill(false);
                    }
                  }}
                  style={{
                    padding: '5px 12px',
                    fontSize: 12.5,
                    borderRadius: 6,
                    border: '1.5px solid var(--color-primary)',
                    width: 150,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn btn-primary"
                  style={{ padding: '5px 10px', fontSize: 12, background: 'var(--color-primary)' }}
                >
                  Thêm
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSkill(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingSkill(true)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  background: '#ffffff',
                  color: 'var(--color-text)',
                  fontSize: 13,
                  fontWeight: 800,
                  border: '2px solid var(--color-text)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                + THÊM KỸ NĂNG
              </button>
            )}
          </div>
        </div>

        {/* Divider Line */}
        <div style={{ height: 1, background: 'var(--color-border)', margin: '22px 0' }} />

        {/* ================= PHẦN 4: CV MẶC ĐỊNH (KHÔNG BẮT BUỘC) ================= */}
        <div>
          <h4 style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: 'var(--color-text)',
            letterSpacing: '0.4px',
            margin: '0 0 12px 0',
            textTransform: 'uppercase'
          }}>
            CV MẶC ĐỊNH (KHÔNG BẮT BUỘC)
          </h4>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}>
            <label style={{
              background: 'var(--color-lavender-surface)',
              border: '1.5px solid var(--color-text)',
              padding: '7px 16px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              color: 'var(--color-text)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}>
              [CHỌN TỆP...]
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setCvFileName(e.target.files[0].name);
                  }
                }}
              />
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5 }}>
              <FileText size={17} color="var(--color-primary)" />
              <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                "{cvFileName}"
              </span>
              <span style={{ fontSize: 12, color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: 4, marginLeft: 4 }}>
                Đã sẵn sàng ứng tuyển
              </span>
            </div>
          </div>
        </div>

        {/* ================= PHẦN 5: STICKY ACTIONS BAR ================= */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: '#ffffff',
          padding: '16px 0 0 0',
          borderTop: '1px solid var(--color-border)',
          marginTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          zIndex: 10
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 22px',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              background: '#ffffff',
              color: 'var(--color-text)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Hủy thay đổi
          </button>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '9px 28px',
              borderRadius: 8,
              border: 'none',
              background: isSaving ? '#9CA3AF' : '#7565A8',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(117, 101, 168, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function StudentProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) {
  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="860px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}>
        {/* Modal Window Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--color-background)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: '#F9E5DC',
              color: 'var(--color-primary)',
              fontSize: 11.5,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              border: '1px solid #F2A184'
            }}>
              Wireframe Màn 9
            </span>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              HỒ SƠ CÁ NHÂN SINH VIÊN (Profile)
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          <StudentProfileCard
            currentUser={currentUser}
            onCancel={onClose}
            onSave={(data) => {
              if (onSave) onSave(data);
              onClose();
            }}
            isModal={true}
          />
        </div>
      </div>
    </AnimatedModal>
  );
}
