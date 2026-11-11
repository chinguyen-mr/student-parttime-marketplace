import React, { useState } from 'react';
import { 
  User, Building2, Mail, Lock, Eye, EyeOff, 
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck,
  Calendar, Phone, MapPin, Briefcase, FileText, Upload,
  GraduationCap, Award, Globe, Plus, Trash2, Camera,
  Check, Sparkles, ArrowLeft, Info, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_BASE, formatApiError } from '../../config/api';

// Danh sách Tỉnh / Thành phố chuẩn tại Việt Nam
const VIETNAM_PROVINCES = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Bình Dương',
  'Đồng Nai',
  'Cần Thơ',
  'Hải Phòng',
  'Bà Rịa - Vũng Tàu',
  'Lâm Đồng (Đà Lạt)',
  'Khánh Hòa (Nha Trang)',
  'Thừa Thiên Huế',
  'Quảng Nam',
  'Tỉnh/Thành phố khác'
];

// Danh mục Ngành nghề quan tâm chuẩn theo dữ liệu JOBNEST
const JOB_CATEGORIES = [
  'Công nghệ thông tin / Phần mềm',
  'Thiết kế đồ họa / Multimedia',
  'Dịch vụ & F&B (Nhà hàng, Quán cafe)',
  'Marketing, Truyền thông & Sự kiện',
  'Gia sư, Trợ giảng & Đào tạo',
  'Bán hàng, Thu ngân & CSKH',
  'Hành chính, Văn phòng & Nhập liệu',
  'Giao hàng, Vận tải & Logistics',
  'Lĩnh vực khác'
];

// Danh mục Loại hình doanh nghiệp
const COMPANY_TYPES = [
  'Công ty TNHH',
  'Công ty Cổ phần',
  'Doanh nghiệp tư nhân',
  'Doanh nghiệp có vốn đầu tư nước ngoài (FDI)',
  'Cơ quan nhà nước / Tổ chức phi lợi nhuận',
  'Hộ kinh doanh cá thể',
  'Khác'
];

// Quy mô nhân sự
const COMPANY_SIZES = [
  '1 - 10 nhân viên',
  '11 - 50 nhân viên',
  '51 - 200 nhân viên',
  '201 - 500 nhân viên',
  'Trên 500 nhân viên'
];

export default function RegisterPage({ 
  onRegisterSuccess, 
  onNavigateLogin, 
  onCancel, 
  onNavigateHome,
  onNavigateComingSoon,
  initialRole = 'STUDENT',
  apiBase = API_BASE 
}) {
  // Current Workflow Step: 1 = Đăng ký tài khoản, 2 = Hoàn thiện hồ sơ
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState(initialRole); // 'STUDENT' (Candidate) | 'EMPLOYER'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Registered User data after Step 1 completion
  const [registeredUser, setRegisteredUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Field validation errors
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // =========================================================================
  // BƯỚC 1: DỮ LIỆU ĐĂNG KÝ TỐI GIẢN (CHỈ THÔNG TIN THỰC SỰ CẦN THIẾT)
  // =========================================================================
  const [candidateForm, setCandidateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [employerForm, setEmployerForm] = useState({
    representativeName: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  // =========================================================================
  // BƯỚC 2: HOÀN THIỆN HỒ SƠ ỨNG VIÊN (CANDIDATE ONBOARDING)
  // =========================================================================
  const [candidateProfile, setCandidateProfile] = useState({
    dateOfBirth: '',
    gender: 'PREFER_NOT_TO_SAY',
    province: 'TP. Hồ Chí Minh',
    detailedAddress: '',
    avatarUrl: '',
    interestedCategory: 'Công nghệ thông tin / Phần mềm',
    desiredPosition: '',
    desiredSalary: '35.000đ - 50.000đ/giờ',
    desiredWorkType: 'Bán thời gian (Part-time)',
    cvFileName: '',
    cvUrl: '',
    school: 'Đại học Văn Lang (VLU)',
    major: 'Công nghệ Thông tin',
    degree: 'Đại học',
    educationPeriod: '2022 - 2026',
    experienceCompany: '',
    experienceTitle: '',
    experienceDesc: '',
    experiencePeriod: '',
    technicalSkills: ['Giao tiếp', 'Làm việc nhóm', 'Tin học văn phòng'],
    softSkills: ['Thích nghi nhanh', 'Có trách nhiệm'],
    newSkillInput: '',
    languages: [{ language: 'Tiếng Anh', level: 'Giao tiếp tốt' }]
  });

  // =========================================================================
  // BƯỚC 2: HOÀN THIỆN HỒ SƠ NHÀ TUYỂN DỤNG (EMPLOYER ONBOARDING)
  // =========================================================================
  const [employerProfile, setEmployerProfile] = useState({
    representativeTitle: '',
    companyType: 'Công ty TNHH',
    industry: 'Công nghệ thông tin / Phần mềm',
    companySize: '11 - 50 nhân viên',
    province: 'TP. Hồ Chí Minh',
    detailedAddress: '',
    website: '',
    bio: '',
    logoUrl: '',
    coverUrl: '',
    taxCode: '',
    businessLicenseFile: '',
    recruiterName: '',
    recruiterEmail: '',
    workEnvironmentDesc: 'Môi trường làm việc năng động, trẻ trung, tạo điều kiện linh hoạt tối đa cho sinh viên vừa học vừa làm.',
    officeImages: []
  });

  // Helper tính độ mạnh mật khẩu
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: '#CBD5E1' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, text: 'Yếu', color: '#EF4444' };
    if (score <= 3) return { score, text: 'Trung bình', color: '#F59E0B' };
    return { score, text: 'Mạnh', color: '#10B981' };
  };

  // Helper tính tỷ lệ hoàn thiện hồ sơ Bước 2
  const calculateCompletionRate = () => {
    if (role === 'STUDENT') {
      let filled = 20;
      if (candidateProfile.dateOfBirth) filled += 10;
      if (candidateProfile.detailedAddress) filled += 10;
      if (candidateProfile.school && candidateProfile.major) filled += 15;
      if (candidateProfile.cvFileName || candidateProfile.cvUrl) filled += 15;
      if (candidateProfile.technicalSkills && candidateProfile.technicalSkills.length > 0) filled += 15;
      if (candidateProfile.languages && candidateProfile.languages.length > 0) filled += 15;
      return Math.min(filled, 100);
    } else {
      let filled = 20;
      if (employerProfile.representativeTitle) filled += 10;
      if (employerProfile.website) filled += 10;
      if (employerProfile.bio) filled += 15;
      if (employerProfile.detailedAddress) filled += 15;
      if (employerProfile.taxCode) filled += 15;
      if (employerProfile.businessLicenseFile) filled += 15;
      return Math.min(filled, 100);
    }
  };

  // Validation Bước 1
  const validateStep1 = () => {
    const errs = {};
    setGeneralError('');

    if (role === 'STUDENT') {
      if (!candidateForm.fullName.trim()) errs.fullName = 'Họ và tên là bắt buộc';
      if (!candidateForm.email.trim()) {
        errs.email = 'Email là bắt buộc';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateForm.email.trim())) {
        errs.email = 'Email không đúng định dạng';
      }
      if (!candidateForm.phone.trim()) {
        errs.phone = 'Số điện thoại là bắt buộc';
      } else if (!/^[0-9+() -]{8,15}$/.test(candidateForm.phone.trim())) {
        errs.phone = 'Số điện thoại không hợp lệ (8 - 15 chữ số)';
      }
      if (!candidateForm.password) {
        errs.password = 'Mật khẩu là bắt buộc';
      } else if (candidateForm.password.length < 6) {
        errs.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      if (candidateForm.password !== candidateForm.confirmPassword) {
        errs.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
      }
      if (!candidateForm.termsAccepted) {
        errs.termsAccepted = 'Bạn cần đồng ý với Điều khoản và Chính sách';
      }
    } else {
      if (!employerForm.companyName.trim()) errs.companyName = 'Tên doanh nghiệp là bắt buộc';
      if (!employerForm.representativeName.trim()) errs.representativeName = 'Họ tên người đại diện là bắt buộc';
      if (!employerForm.email.trim()) {
        errs.email = 'Email công việc là bắt buộc';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employerForm.email.trim())) {
        errs.email = 'Email không đúng định dạng';
      }
      if (!employerForm.phone.trim()) {
        errs.phone = 'Số điện thoại là bắt buộc';
      } else if (!/^[0-9+() -]{8,15}$/.test(employerForm.phone.trim())) {
        errs.phone = 'Số điện thoại không hợp lệ (8 - 15 chữ số)';
      }
      if (!employerForm.password) {
        errs.password = 'Mật khẩu là bắt buộc';
      } else if (employerForm.password.length < 6) {
        errs.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      if (employerForm.password !== employerForm.confirmPassword) {
        errs.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
      }
      if (!employerForm.termsAccepted) {
        errs.termsAccepted = 'Bạn cần đồng ý với Điều khoản và Chính sách';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Xử lý Submit Bước 1
  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      setGeneralError('Vui lòng kiểm tra lại các trường thông tin bắt buộc.');
      return;
    }

    setLoading(true);
    setGeneralError('');
    setSuccessMessage('');

    let payload = {};
    if (role === 'STUDENT') {
      payload = {
        role: 'STUDENT',
        email: candidateForm.email.trim(),
        password: candidateForm.password,
        full_name: candidateForm.fullName.trim(),
        phone: candidateForm.phone.trim()
      };
    } else {
      payload = {
        role: 'EMPLOYER',
        email: employerForm.email.trim(),
        password: employerForm.password,
        representative_name: employerForm.representativeName.trim(),
        full_name: employerForm.representativeName.trim(),
        company_name: employerForm.companyName.trim(),
        phone: employerForm.phone.trim()
      };
    }

    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 409 || (data.message && data.message.includes('Email'))) {
          setErrors(prev => ({ ...prev, email: 'Email này đã tồn tại trong hệ thống. Vui lòng chọn email khác.' }));
        } else if (data.message && data.message.includes('Số điện thoại')) {
          setErrors(prev => ({ ...prev, phone: 'Số điện thoại này đã được đăng ký tài khoản.' }));
        } else {
          setGeneralError(data.message || 'Đăng ký không thành công. Vui lòng thử lại.');
        }
        return;
      }

      const user = data.data.user;
      const token = data.data.token;
      setRegisteredUser(user);
      setAuthToken(token);

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify({ ...user, token }));
      }

      setSuccessMessage('Đăng ký tài khoản thành công!');
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess({ ...user, token });
        } else if (onNavigateHome) {
          onNavigateHome();
        }
      }, 400);
    } catch (err) {
      setGeneralError(formatApiError(err, 'Lỗi kết nối máy chủ'));
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Submit Bước 2
  const handleSubmitStep2 = async (isSkipping = false) => {
    setLoading(true);
    setGeneralError('');

    try {
      const token = authToken || localStorage.getItem('token');
      const completionRate = calculateCompletionRate();

      let updatePayload = {};
      if (role === 'STUDENT') {
        updatePayload = {
          full_name: candidateForm.fullName || registeredUser?.full_name,
          phone: candidateForm.phone || registeredUser?.phone,
          date_of_birth: candidateProfile.dateOfBirth || null,
          gender: candidateProfile.gender || 'PREFER_NOT_TO_SAY',
          province: candidateProfile.province || 'TP. Hồ Chí Minh',
          location: candidateProfile.province || 'TP. Hồ Chí Minh',
          detailed_address: candidateProfile.detailedAddress || null,
          avatar_url: candidateProfile.avatarUrl || null,
          interested_category: candidateProfile.interestedCategory || null,
          desired_position: candidateProfile.desiredPosition || null,
          desired_salary: candidateProfile.desiredSalary || null,
          desired_work_type: candidateProfile.desiredWorkType || null,
          school: candidateProfile.school || null,
          university: candidateProfile.school || null,
          major: candidateProfile.major || null,
          degree: candidateProfile.degree || null,
          education_period: candidateProfile.educationPeriod || null,
          experience_company: candidateProfile.experienceCompany || null,
          experience_title: candidateProfile.experienceTitle || null,
          experience_desc: candidateProfile.experienceDesc || null,
          experience_period: candidateProfile.experiencePeriod || null,
          skills: candidateProfile.technicalSkills || [],
          technical_skills: candidateProfile.technicalSkills || [],
          soft_skills: candidateProfile.softSkills || [],
          languages: candidateProfile.languages || [],
          cv_file_name: candidateProfile.cvFileName || null,
          cv_url: candidateProfile.cvUrl || null,
          profile_completion_rate: completionRate,
          is_profile_completed: !isSkipping
        };
      } else {
        updatePayload = {
          company_name: employerForm.companyName || registeredUser?.company_name,
          display_name: employerForm.companyName || registeredUser?.company_name,
          representative_name: employerForm.representativeName || registeredUser?.representative_name,
          representative_title: employerProfile.representativeTitle || null,
          company_type: employerProfile.companyType || 'Công ty TNHH',
          account_type: employerProfile.companyType || 'Công ty TNHH',
          industry: employerProfile.industry || 'Công nghệ thông tin / Phần mềm',
          company_size: employerProfile.companySize || '11 - 50 nhân viên',
          province: employerProfile.province || 'TP. Hồ Chí Minh',
          location: employerProfile.province || 'TP. Hồ Chí Minh',
          detailed_address: employerProfile.detailedAddress || null,
          website: employerProfile.website || null,
          bio: employerProfile.bio || null,
          description: employerProfile.bio || null,
          logo_url: employerProfile.logoUrl || null,
          cover_url: employerProfile.coverUrl || null,
          tax_code: employerProfile.taxCode || null,
          business_license_file: employerProfile.businessLicenseFile || null,
          recruiter_name: employerProfile.recruiterName || null,
          recruiter_email: employerProfile.recruiterEmail || null,
          phone: employerForm.phone || registeredUser?.phone,
          verification_status: 'PENDING_VERIFICATION',
          profile_completion_rate: completionRate,
          is_profile_completed: !isSkipping
        };
      }

      if (token && !isSkipping) {
        await fetch(`${apiBase}/profile/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatePayload)
        });
      }

      const finalUser = {
        ...(registeredUser || {}),
        token,
        is_profile_completed: !isSkipping
      };

      if (onRegisterSuccess) {
        onRegisterSuccess(finalUser);
      } else if (onNavigateHome) {
        onNavigateHome();
      }
    } catch (err) {
      console.warn('[Profile Save Warning]', err);
      if (onRegisterSuccess && registeredUser) {
        onRegisterSuccess({ ...registeredUser, token: authToken });
      } else if (onNavigateHome) {
        onNavigateHome();
      }
    } finally {
      setLoading(false);
    }
  };

  const candidatePwdStrength = calculatePasswordStrength(candidateForm.password);
  const employerPwdStrength = calculatePasswordStrength(employerForm.password);
  const currentStrength = role === 'STUDENT' ? candidatePwdStrength : employerPwdStrength;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      background: '#F4F6F8',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          width: '100%',
          maxWidth: currentStep === 1 ? '480px' : '680px',
          background: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          padding: '36px 32px',
          position: 'relative',
          transition: 'max-width 0.25s ease'
        }}
      >
        {/* =========================================================================
            TOP LOGO TRÒN (ĐỒNG BỘ 100% VỚI TRANG ĐĂNG NHẬP)
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
            {currentStep === 1 ? 'Tạo tài khoản mới' : 'Hoàn thiện hồ sơ (Bước 2/2)'}
          </p>
        </div>

        {/* Thanh tiến trình Bước 2 */}
        {currentStep === 2 && (
          <div style={{
            background: '#F8FAFC',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#7565A8',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 800
              }}>
                2
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                Độ hoàn thiện hồ sơ:
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 200 }}>
              <div style={{ flex: 1, height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${calculateCompletionRate()}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #7565A8, #10B981)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#7565A8' }}>
                {calculateCompletionRate()}%
              </span>
            </div>
          </div>
        )}

        {/* BANNERS: LỖI TOÀN CỤC & THÀNH CÔNG */}
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
            BƯỚC 1: ĐĂNG KÝ TỐI GIẢN (CHỈ CÁC TRƯỜNG CỐT LÕI)
            ========================================================================= */}
        {currentStep === 1 && (
          <div>
            {/* Chọn vai trò (Tabs gọn gàng) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              background: '#F3F4F6',
              padding: '4px',
              borderRadius: '10px',
              marginBottom: '18px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setRole('STUDENT');
                  setErrors({});
                  setGeneralError('');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: role === 'STUDENT' ? '#ffffff' : 'transparent',
                  color: role === 'STUDENT' ? '#7565A8' : '#6B7280',
                  fontWeight: role === 'STUDENT' ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: role === 'STUDENT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <User size={15} />
                <span>Ứng viên</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('EMPLOYER');
                  setErrors({});
                  setGeneralError('');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: role === 'EMPLOYER' ? '#ffffff' : 'transparent',
                  color: role === 'EMPLOYER' ? '#7565A8' : '#6B7280',
                  fontWeight: role === 'EMPLOYER' ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: role === 'EMPLOYER' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Building2 size={15} />
                <span>Nhà tuyển dụng</span>
              </button>
            </div>

            {/* Form đăng ký */}
            <form onSubmit={handleSubmitStep1}>
              {/* ================= CANDIDATE FIELDS ================= */}
              {role === 'STUDENT' && (
                <>
                  {/* Họ và tên */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                      Họ và tên <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={candidateForm.fullName}
                      onChange={(e) => setCandidateForm({ ...candidateForm, fullName: e.target.value })}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        fontSize: '13.5px',
                        border: errors.fullName ? '1.5px solid #C00000' : '1.5px solid #000000',
                        borderRadius: '6px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: errors.fullName ? '#FFF8F8' : '#ffffff'
                      }}
                    />
                    {errors.fullName && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.fullName}</div>}
                  </div>

                  {/* Email & Số điện thoại */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                        Email <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="name@sinhvien.vlu.edu.vn"
                        value={candidateForm.email}
                        onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          height: '38px',
                          padding: '0 12px',
                          fontSize: '13.5px',
                          border: errors.email ? '1.5px solid #C00000' : '1.5px solid #000000',
                          borderRadius: '6px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: errors.email ? '#FFF8F8' : '#ffffff'
                        }}
                      />
                      {errors.email && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.email}</div>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                        Số điện thoại <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="0912345678"
                        value={candidateForm.phone}
                        onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                        style={{
                          width: '100%',
                          height: '38px',
                          padding: '0 12px',
                          fontSize: '13.5px',
                          border: errors.phone ? '1.5px solid #C00000' : '1.5px solid #000000',
                          borderRadius: '6px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: errors.phone ? '#FFF8F8' : '#ffffff'
                        }}
                      />
                      {errors.phone && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.phone}</div>}
                    </div>
                  </div>
                </>
              )}

              {/* ================= EMPLOYER FIELDS ================= */}
              {role === 'EMPLOYER' && (
                <>
                  {/* Tên doanh nghiệp */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                      Tên doanh nghiệp <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Công ty TNHH Giải Pháp Công Nghệ Văn Lang"
                      value={employerForm.companyName}
                      onChange={(e) => setEmployerForm({ ...employerForm, companyName: e.target.value })}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        fontSize: '13.5px',
                        border: errors.companyName ? '1.5px solid #C00000' : '1.5px solid #000000',
                        borderRadius: '6px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: errors.companyName ? '#FFF8F8' : '#ffffff'
                      }}
                    />
                    {errors.companyName && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.companyName}</div>}
                  </div>

                  {/* Họ và tên người đại diện */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                      Họ và tên người đại diện <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn B"
                      value={employerForm.representativeName}
                      onChange={(e) => setEmployerForm({ ...employerForm, representativeName: e.target.value })}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        fontSize: '13.5px',
                        border: errors.representativeName ? '1.5px solid #C00000' : '1.5px solid #000000',
                        borderRadius: '6px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: errors.representativeName ? '#FFF8F8' : '#ffffff'
                      }}
                    />
                    {errors.representativeName && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.representativeName}</div>}
                  </div>

                  {/* Email công việc & Số điện thoại */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                        Email công việc <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="hr@company.com"
                        value={employerForm.email}
                        onChange={(e) => setEmployerForm({ ...employerForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          height: '38px',
                          padding: '0 12px',
                          fontSize: '13.5px',
                          border: errors.email ? '1.5px solid #C00000' : '1.5px solid #000000',
                          borderRadius: '6px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: errors.email ? '#FFF8F8' : '#ffffff'
                        }}
                      />
                      {errors.email && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.email}</div>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                        Số điện thoại <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="0987654321"
                        value={employerForm.phone}
                        onChange={(e) => setEmployerForm({ ...employerForm, phone: e.target.value })}
                        style={{
                          width: '100%',
                          height: '38px',
                          padding: '0 12px',
                          fontSize: '13.5px',
                          border: errors.phone ? '1.5px solid #C00000' : '1.5px solid #000000',
                          borderRadius: '6px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: errors.phone ? '#FFF8F8' : '#ffffff'
                        }}
                      />
                      {errors.phone && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.phone}</div>}
                    </div>
                  </div>
                </>
              )}

              {/* ================= MẬT KHẨU & XÁC NHẬN ================= */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                      Mật khẩu <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    {currentStrength.text && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: currentStrength.color }}>
                        {currentStrength.text}
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ít nhất 6 ký tự"
                      value={role === 'STUDENT' ? candidateForm.password : employerForm.password}
                      onChange={(e) => {
                        if (role === 'STUDENT') setCandidateForm({ ...candidateForm, password: e.target.value });
                        else setEmployerForm({ ...employerForm, password: e.target.value });
                      }}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 38px 0 12px',
                        fontSize: '13.5px',
                        border: errors.password ? '1.5px solid #C00000' : '1.5px solid #000000',
                        borderRadius: '6px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: errors.password ? '#FFF8F8' : '#ffffff'
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
                  {errors.password && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.password}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                    Xác nhận mật khẩu <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu"
                      value={role === 'STUDENT' ? candidateForm.confirmPassword : employerForm.confirmPassword}
                      onChange={(e) => {
                        if (role === 'STUDENT') setCandidateForm({ ...candidateForm, confirmPassword: e.target.value });
                        else setEmployerForm({ ...employerForm, confirmPassword: e.target.value });
                      }}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 38px 0 12px',
                        fontSize: '13.5px',
                        border: errors.confirmPassword ? '1.5px solid #C00000' : '1.5px solid #000000',
                        borderRadius: '6px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: errors.confirmPassword ? '#FFF8F8' : '#ffffff'
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
                  {errors.confirmPassword && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.confirmPassword}</div>}
                </div>
              </div>

              {/* Checkbox Điều khoản */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={role === 'STUDENT' ? candidateForm.termsAccepted : employerForm.termsAccepted}
                    onChange={(e) => {
                      if (role === 'STUDENT') setCandidateForm({ ...candidateForm, termsAccepted: e.target.checked });
                      else setEmployerForm({ ...employerForm, termsAccepted: e.target.checked });
                    }}
                    style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#111827', cursor: 'pointer' }}
                  />
                  <span>
                    Tôi đồng ý với <a href="#" style={{ color: '#7565A8', fontWeight: 600, textDecoration: 'underline' }}>Điều khoản</a> & <a href="#" style={{ color: '#7565A8', fontWeight: 600, textDecoration: 'underline' }}>Chính sách bảo mật</a>
                  </span>
                </label>
                {errors.termsAccepted && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.termsAccepted}</div>}
              </div>

              {/* Nút Đăng ký (Pill button giống hệt trang Đăng nhập) */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '44px',
                  background: loading ? '#9CA3AF' : '#7565A8',
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
                  boxShadow: '0 2px 8px rgba(117, 101, 168, 0.25)'
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#635394'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#7565A8'; }}
              >
                {loading ? 'Đang xử lý...' : (
                  <>
                    <span>Đăng ký</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Đường kẻ phân cách */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0 16px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
                <span style={{ padding: '0 12px', fontSize: '12.5px', color: '#6B7280', fontWeight: 500 }}>
                  Hoặc đăng ký bằng phương thức khác
                </span>
                <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              </div>

              {/* Social Registration Options (Google, Facebook, LinkedIn) */}
              <div style={{ marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateComingSoon) {
                      onNavigateComingSoon(
                        'Đăng ký bằng Google',
                        'Tính năng đăng ký nhanh bằng tài khoản Google (OAuth 2.0) đang được hoàn thiện (Coming Soon) và sẽ sớm khả dụng.'
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
                  Tiếp tục với Google
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateComingSoon) {
                        onNavigateComingSoon('Đăng ký bằng Facebook', 'Tính năng đang phát triển (Coming Soon).');
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
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Tiếp tục với Facebook
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateComingSoon) {
                        onNavigateComingSoon('Đăng ký bằng LinkedIn', 'Tính năng đang phát triển (Coming Soon).');
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
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    Tiếp tục với LinkedIn
                  </button>
                </div>
              </div>

              {/* Chuyển sang Đăng nhập */}
              <div style={{ textAlign: 'center', fontSize: '13.5px', color: '#6B7280', marginTop: '16px' }}>
                Bạn đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7565A8',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Đăng nhập ngay
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            BƯỚC 2: HOÀN THIỆN HỒ SƠ (ONBOARDING)
            ========================================================================= */}
        {currentStep === 2 && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {role === 'STUDENT' ? 'Hồ sơ Ứng viên Sinh viên' : 'Hồ sơ Doanh nghiệp'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#6B7280' }}>
                  Có thể lưu từng phần hoặc bấm <strong>"Bỏ qua"</strong> để trải nghiệm ngay.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSubmitStep2(true)}
                style={{
                  background: 'none',
                  border: '1px solid #D1D5DB',
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#4B5563',
                  cursor: 'pointer'
                }}
              >
                Bỏ qua và hoàn thiện sau &rarr;
              </button>
            </div>

            {/* Candidate Bước 2 */}
            {role === 'STUDENT' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Nhóm A: Thông tin cá nhân & Địa chỉ */}
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13.5px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>
                    <User size={16} color="#7565A8" />
                    <span>A. Thông tin cá nhân & Cư trú</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Ngày sinh</label>
                      <input
                        type="date"
                        value={candidateProfile.dateOfBirth}
                        onChange={(e) => setCandidateProfile({ ...candidateProfile, dateOfBirth: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Giới tính</label>
                      <select
                        value={candidateProfile.gender}
                        onChange={(e) => setCandidateProfile({ ...candidateProfile, gender: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      >
                        <option value="PREFER_NOT_TO_SAY">Không khai báo</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Tỉnh / Thành phố</label>
                      <select
                        value={candidateProfile.province}
                        onChange={(e) => setCandidateProfile({ ...candidateProfile, province: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      >
                        {VIETNAM_PROVINCES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Địa chỉ chi tiết</label>
                      <input
                        type="text"
                        placeholder="Số nhà, đường, phường/xã..."
                        value={candidateProfile.detailedAddress}
                        onChange={(e) => setCandidateProfile({ ...candidateProfile, detailedAddress: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Link Avatar</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={candidateProfile.avatarUrl}
                        onChange={(e) => setCandidateProfile({ ...candidateProfile, avatarUrl: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Nhóm B: CV */}
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13.5px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>
                    <FileText size={16} color="#7565A8" />
                    <span>B. Hồ sơ năng lực & CV</span>
                  </div>
                  <div style={{ border: '1.5px dashed #7565A8', borderRadius: '8px', padding: '16px', textAlign: 'center', background: '#ffffff' }}>
                    <Upload size={24} color="#7565A8" style={{ margin: '0 auto 6px auto' }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                      {candidateProfile.cvFileName ? `Đã chọn: ${candidateProfile.cvFileName}` : 'Tải lên CV của bạn (.PDF, .DOC, .DOCX)'}
                    </div>
                    <label style={{ display: 'inline-block', marginTop: '10px', background: '#7565A8', color: '#ffffff', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      <span>Chọn file từ máy</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setCandidateProfile({
                              ...candidateProfile,
                              cvFileName: file.name,
                              cvUrl: URL.createObjectURL(file)
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Nhóm C: Học vấn */}
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13.5px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>
                    <GraduationCap size={16} color="#7565A8" />
                    <span>C. Học vấn</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Trường</label>
                      <input
                        type="text"
                        value={candidateProfile.school}
                        onChange={(e) => setCandidateProfile({ ...candidateProfile, school: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Chuyên ngành</label>
                      <input
                        type="text"
                        value={candidateProfile.major}
                        onChange={(e) => setCandidateProfile({ ...candidateProfile, major: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Nhóm G: Mong muốn nghề nghiệp */}
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13.5px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>
                    <Briefcase size={16} color="#7565A8" />
                    <span>G. Định hướng & Mong muốn nghề nghiệp</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Ngành nghề quan tâm</label>
                      <select
                        value={candidateProfile.interestedCategory}
                        onChange={(e) => setCandidateProfile({ ...candidateProfile, interestedCategory: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      >
                        {JOB_CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Vị trí mong muốn</label>
                      <input
                        type="text"
                        placeholder="VD: Phục vụ cafe, Thực tập sinh..."
                        value={candidateProfile.desiredPosition}
                        onChange={(e) => setCandidateProfile({ ...candidateProfile, desiredPosition: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Employer Bước 2 */}
            {role === 'EMPLOYER' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={20} color="#D97706" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '12.5px', color: '#92400E' }}>
                    <strong>Trạng thái hồ sơ: Chờ cập nhật thông tin & Xác minh</strong>. Tin tuyển dụng sẽ được kiểm duyệt an toàn trước khi công khai.
                  </div>
                </div>

                {/* Nhóm A: Nhận diện */}
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13.5px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>
                    <Building2 size={16} color="#7565A8" />
                    <span>A. Nhận diện & Giới thiệu</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Website</label>
                      <input
                        type="url"
                        placeholder="https://congty.com"
                        value={employerProfile.website}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, website: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Link Logo</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={employerProfile.logoUrl}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, logoUrl: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Mô tả ngắn về doanh nghiệp</label>
                    <textarea
                      rows={2}
                      placeholder="Sứ mệnh, cơ hội cho sinh viên..."
                      value={employerProfile.bio}
                      onChange={(e) => setEmployerProfile({ ...employerProfile, bio: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Nhóm B: Tổ chức */}
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13.5px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>
                    <MapPin size={16} color="#7565A8" />
                    <span>B. Tổ chức & Trụ sở</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Chức vụ</label>
                      <input
                        type="text"
                        placeholder="VD: HR Manager"
                        value={employerProfile.representativeTitle}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, representativeTitle: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Loại hình</label>
                      <select
                        value={employerProfile.companyType}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, companyType: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      >
                        {COMPANY_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Quy mô</label>
                      <select
                        value={employerProfile.companySize}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, companySize: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      >
                        {COMPANY_SIZES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Tỉnh/Thành phố trụ sở</label>
                      <select
                        value={employerProfile.province}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, province: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      >
                        {VIETNAM_PROVINCES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Địa chỉ chi tiết</label>
                      <input
                        type="text"
                        placeholder="Số nhà, đường..."
                        value={employerProfile.detailedAddress}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, detailedAddress: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Nhóm C: Pháp lý */}
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13.5px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>
                    <ShieldCheck size={16} color="#7565A8" />
                    <span>C. Pháp lý & Mã số thuế</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Mã số thuế</label>
                      <input
                        type="text"
                        placeholder="0312345678"
                        value={employerProfile.taxCode}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, taxCode: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Giấy phép kinh doanh</label>
                      <input
                        type="text"
                        placeholder="GPKD_2026.pdf"
                        value={employerProfile.businessLicenseFile}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, businessLicenseFile: e.target.value })}
                        style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12.5px', background: '#ffffff', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions for Step 2 */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmitStep2(false)}
                style={{
                  flex: 1,
                  height: '44px',
                  background: loading ? '#9CA3AF' : '#7565A8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(117, 101, 168, 0.25)'
                }}
              >
                <span>Lưu hồ sơ & Bắt đầu trải nghiệm</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => handleSubmitStep2(true)}
                style={{
                  padding: '0 20px',
                  height: '44px',
                  borderRadius: '9999px',
                  border: '1px solid #D1D5DB',
                  background: '#ffffff',
                  color: '#374151',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Bỏ qua
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
