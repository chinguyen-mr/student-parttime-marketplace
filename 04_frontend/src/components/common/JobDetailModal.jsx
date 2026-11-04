import React, { useState } from 'react';
import { 
  Building2, MapPin, DollarSign, Clock, Calendar, 
  FileText, CheckCircle2, Award, Send, X, Briefcase, Paperclip, ChevronRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedModal, Button, CustomDropdown } from '../ui';

export default function JobDetailModal({ 
  isOpen, 
  onClose, 
  job, 
  onApply, 
  currentUser,
  onUpdateJob,
  onViewApplicants,
  onViewCompany,
  onViewEmployerProfile
}) {
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFileName, setCvFileName] = useState('CV_Nguyen_Van_Chi_VLU.pdf');
  const [isApplying, setIsApplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    salary: 0,
    salary_type: 'HOURLY',
    work_type: 'PART_TIME',
    location: '',
    work_days: 'Thứ 2 - Thứ 6',
    work_shift: '08:00 - 12:00',
    deadline: '',
    headcount: 2,
    description: '',
    requirements: '',
    status: 'OPEN',
  });

  // Sync form data when job changes or when opening edit mode
  React.useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        category: job.category || 'Tài chính / Kế toán',
        salary: job.salary || 40000,
        salary_type: job.salary_type || 'HOURLY',
        work_type: job.work_type || 'PART_TIME',
        location: job.location || 'Quận 1, TP.HCM',
        work_days: job.work_days || 'Thứ 2 - Thứ 6 (Linh hoạt chọn ca)',
        work_shift: job.work_shift || '08:00 - 12:00',
        deadline: job.deadline || '2026-11-30',
        headcount: job.headcount || 2,
        description: job.description || '',
        requirements: job.requirements || '',
        status: job.status || 'OPEN',
      });
      setIsEditing(false);
    }
  }, [job, isOpen]);

  if (!job) return null;

  const isEmployerRole = currentUser?.role === 'EMPLOYER';
  const isJobOwner = Boolean(
    isEmployerRole && (
      (job?.employer_id && String(job.employer_id) === String(currentUser?.id)) ||
      (job?.user_id && String(job.user_id) === String(currentUser?.id)) ||
      (job?.employer_email && currentUser?.email && job.employer_email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (job?.employer_name && currentUser?.full_name && job.employer_name.trim().toLowerCase() === currentUser.full_name.trim().toLowerCase()) ||
      (job.applicant_count !== undefined && !currentUser)
    )
  );
  const isEmployer = isJobOwner;

  const handleSubmitApply = async () => {
    setIsApplying(true);
    await onApply({
      jobId: job.id,
      coverLetter,
      cvUrl: 'https://cv.vanlanguni.vn/sample-student.pdf',
    });
    setIsApplying(false);
  };

  const handleSaveEdit = (e) => {
    e?.preventDefault();
    if (onUpdateJob) {
      onUpdateJob({
        ...job,
        ...formData,
        salary: Number(formData.salary),
        headcount: Number(formData.headcount),
      });
    }
    setIsEditing(false);
  };

  const applicantCount = job.applicant_count ?? job.total_applicants ?? 10;
  const companyDisplayName = job.company_name || job.employer_name || (job.title === 'Kế toán' ? 'Doanh nghiệp ABC' : 'TechCorp Vietnam');

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="800px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}>
        {/* Modal Top Header */}
        <div style={{
          padding: '22px 28px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 16, right: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            {isEmployer && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#594675',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                title="Chỉnh sửa thông tin bài đăng tuyển dụng"
              >
                ✏️ Chỉnh sửa thông tin
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                transition: 'all 0.15s ease',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {/* Logo công ty */}
            <div style={{
              width: 58,
              height: 58,
              borderRadius: 12,
              background: '#594675',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 20,
              boxShadow: '0 3px 8px rgba(89, 70, 117, 0.2)',
              flexShrink: 0,
            }}>
              {companyDisplayName.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1, paddingRight: isEmployer ? 140 : 40 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{formData.category || job.category || 'Công nghệ thông tin'}</span>
                <span className="badge badge-success">
                  {formData.work_type === 'PART_TIME' ? 'Bán thời gian (Part-time)' : 'Freelance theo dự án'}
                </span>
                <span className={`badge ${formData.status === 'OPEN' ? 'badge-warning' : 'badge-secondary'}`}>
                  {formData.status === 'OPEN' ? 'Đang tuyển' : 'Đã đóng'}
                </span>
                {isEditing && (
                  <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                    Đang chỉnh sửa
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                {isEditing ? formData.title : (job.title || formData.title)}
              </h2>

              <p style={{ fontSize: 13.5, color: '#594675', fontWeight: 600, margin: '0 0 8px 0' }}>
                🏢 {companyDisplayName}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12.5, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <DollarSign size={15} color="#10b981" />
                  <strong style={{ color: '#0f172a' }}>{Number(formData.salary || 0).toLocaleString('vi-VN')} VNĐ</strong>
                  <span>/{formData.salary_type === 'HOURLY' ? 'giờ' : 'dự án'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={15} color="#64748b" />
                  <span>{formData.location || 'TP. Hồ Chí Minh'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={15} color="#64748b" />
                  <span>Đăng ngày: {new Date(job.created_at || Date.now()).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body: Scrollable Content sections */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {isEditing ? (
            /* ================= EDIT MODE FORM ================= */
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>✏️</span>
                <span><strong>Chỉnh sửa thông tin tin tuyển dụng</strong> — Thay đổi bên dưới sẽ được cập nhật trực tiếp vào hệ thống.</span>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Tiêu đề vị trí tuyển dụng (*)
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              {/* Category & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    Ngành nghề / Danh mục
                  </label>
                  <CustomDropdown
                    value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    options={[
                      { value: 'Tài chính / Kế toán', label: 'Tài chính / Kế toán' },
                      { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin' },
                      { value: 'Nhà hàng / F&B', label: 'Nhà hàng / F&B' },
                      { value: 'Marketing / Truyền thông', label: 'Marketing / Truyền thông' },
                      { value: 'Tổ chức sự kiện', label: 'Tổ chức sự kiện' },
                      { value: 'Hành chính / Văn phòng', label: 'Hành chính / Văn phòng' },
                      { value: 'Gia sư / Giáo dục', label: 'Gia sư / Giáo dục' },
                    ]}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    Trạng thái tin tuyển dụng
                  </label>
                  <CustomDropdown
                    value={formData.status}
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                    options={[
                      { value: 'OPEN', label: 'Đang tuyển (OPEN)' },
                      { value: 'CLOSED', label: 'Đã đóng (CLOSED)' },
                    ]}
                  />
                </div>
              </div>

              {/* Salary, Type, Headcount */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    Mức lương (VNĐ) (*)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData(p => ({ ...p, salary: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    Đơn vị lương
                  </label>
                  <CustomDropdown
                    value={formData.salary_type}
                    onChange={(e) => setFormData(p => ({ ...p, salary_type: e.target.value }))}
                    options={[
                      { value: 'HOURLY', label: 'Theo giờ' },
                      { value: 'DAILY', label: 'Theo ngày' },
                      { value: 'PROJECT', label: 'Theo dự án' },
                    ]}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    Cần tuyển
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.headcount}
                    onChange={(e) => setFormData(p => ({ ...p, headcount: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>
              </div>

              {/* Location & Deadline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    Địa điểm làm việc (*)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    Hạn nộp hồ sơ
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(p => ({ ...p, deadline: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>
              </div>

              {/* Work Days & Shift */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    Ngày làm việc
                  </label>
                  <input
                    type="text"
                    value={formData.work_days}
                    onChange={(e) => setFormData(p => ({ ...p, work_days: e.target.value }))}
                    placeholder="Ví dụ: Thứ 2 - Thứ 6"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    Ca làm việc
                  </label>
                  <input
                    type="text"
                    value={formData.work_shift}
                    onChange={(e) => setFormData(p => ({ ...p, work_shift: e.target.value }))}
                    placeholder="Ví dụ: 08:00 - 12:00"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Mô tả công việc chi tiết (*)
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              {/* Requirements */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Yêu cầu ứng viên & Kỹ năng (*)
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.requirements}
                  onChange={(e) => setFormData(p => ({ ...p, requirements: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>
            </form>
          ) : (
            /* ================= VIEW MODE ================= */
            <>
              {/* 1. Thông tin doanh nghiệp */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={16} color="#594675" /> Thông tin doanh nghiệp tuyển dụng
                </h4>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>
                  {job.company_description || 'Doanh nghiệp uy tín đã được xác thực thông tin bởi Ban Quản lý Nền tảng JobNest. Cam kết thanh toán đúng hạn và đảm bảo môi trường làm việc an toàn, tôn trọng quyền lợi sinh viên.'}
                </div>
              </div>

              {/* 2. Mô tả công việc chi tiết */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} color="#594675" /> Mô tả công việc (Job Description)
                </h4>
                <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line', background: '#ffffff', padding: '12px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  {formData.description || job.description || 'Chưa có thông tin mô tả chi tiết.'}
                </div>
              </div>

              {/* 3. Yêu cầu ứng viên */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Award size={16} color="#594675" /> Yêu cầu ứng viên & Kỹ năng cần có
                </h4>
                <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line', background: '#ffffff', padding: '12px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  {formData.requirements || job.requirements || '• Sinh viên đang theo học tại các trường Đại học/Cao đẳng.\n• Cẩn thận, nhanh nhẹn, có tinh thần trách nhiệm và đúng giờ.'}
                </div>
              </div>

              {/* 4. Địa điểm và Thời gian làm việc */}
              <div style={{ marginBottom: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>📍 Địa điểm làm việc</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{formData.location || job.location || 'Theo thỏa thuận'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>⏰ Thời gian làm việc</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{formData.work_days || 'Thứ 2 - Thứ 6'} ({formData.work_shift || '08:00 - 12:00'})</div>
                </div>
              </div>

              {/* 5. Khối thao tác dành cho Nhà tuyển dụng HOẶC Sinh viên nộp đơn */}
              {isEmployer ? (
                /* EMPLOYER MANAGEMENT BOX */
                <div style={{
                  background: 'linear-gradient(to right, #fcfaff, #f8f6fb)',
                  borderRadius: 12,
                  padding: '18px 20px',
                  border: '1px solid #ede9fe',
                  boxShadow: '0 1px 3px rgba(89,70,117,0.06)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#30283A', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      🏢 Quản lý tin tuyển dụng này
                    </h4>
                    <span style={{ fontSize: 12, color: '#6d28d9', fontWeight: 700, background: '#f5f3ff', padding: '3px 10px', borderRadius: 999, border: '1px solid #ede9fe' }}>
                      {applicantCount} ứng viên đã nộp
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
                    <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>Hạn nhận hồ sơ</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{formData.deadline || '30/11/2026'}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>Chỉ tiêu cần tuyển</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{formData.headcount || 2} nhân sự</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>Trạng thái</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: formData.status === 'OPEN' ? '#047857' : '#64748b' }}>
                        {formData.status === 'OPEN' ? '● Đang nhận hồ sơ' : '○ Đã đóng tin'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (onViewApplicants) {
                          onViewApplicants(job);
                        }
                      }}
                      style={{ padding: '8px 18px', fontSize: 13, gap: 6 }}
                    >
                      👥 Quản lý danh sách ứng viên ({applicantCount})
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(true)}
                      style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}
                    >
                      ✏️ Chỉnh sửa thông tin tin đăng
                    </Button>
                  </div>
                </div>
              ) : isEmployerRole && !isJobOwner ? (
                /* EMPLOYER VIEWING OTHER EMPLOYER'S JOB (TRUONG 2) */
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 12,
                  padding: 18,
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building2 size={16} color="#059669" /> Thông tin đơn vị tuyển dụng
                    </h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                      Bạn đang xem tin tuyển dụng của đối tác <strong>{job.employer_name || job.company_name || 'Doanh nghiệp'}</strong> trong Không gian nghiên cứu thị trường (Trường 2).
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onViewEmployerProfile) onViewEmployerProfile(job);
                      else if (onViewCompany) onViewCompany(job.employer_name || job.company_name);
                    }}
                    style={{ padding: '8px 18px', fontSize: 13, gap: 6 }}
                  >
                    <Building2 size={15} /> Xem thông tin công ty
                  </Button>
                </div>
              ) : (
                /* STUDENT APPLICATION BOX */
                <div style={{
                  background: '#f1f5f9',
                  borderRadius: 12,
                  padding: 18,
                  border: '1px solid #cbd5e1',
                }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Send size={16} color="#4f46e5" /> Nộp hồ sơ ứng tuyển vị trí này
                  </h4>

                  {currentUser?.role === 'STUDENT' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#0f172a' }}>
                          Thư giới thiệu bản thân / Lời nhắn tới nhà tuyển dụng (Cover Letter)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Giới thiệu nhanh về kỹ năng, kinh nghiệm và khung giờ bạn có thể làm việc..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          style={{ width: '100%', fontSize: 13 }}
                        />
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <Paperclip size={16} color="#4f46e5" />
                          <span>Hồ sơ CV đính kèm: <strong>{cvFileName}</strong></span>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: 11 }}>Đã tải lên</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '12px 14px', background: '#fef3c7', borderRadius: 8, color: '#92400e', fontSize: 13 }}>
                      ℹ️ Bạn cần đăng nhập tài khoản Sinh viên để nộp hồ sơ ứng tuyển vào công việc này.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
        }}>
          {isEditing ? (
            <>
              <Button 
                variant="secondary" 
                type="button" 
                onClick={() => setIsEditing(false)} 
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                Hủy bỏ
              </Button>
              <Button 
                variant="primary" 
                type="button" 
                onClick={handleSaveEdit} 
                style={{ padding: '8px 22px', fontSize: 13, gap: 6 }}
              >
                💾 Lưu thay đổi thông tin
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={onClose} style={{ padding: '8px 18px', fontSize: 13 }}>
                Đóng cửa sổ
              </Button>

              {currentUser?.role === 'STUDENT' && (
                <Button
                  variant="primary"
                  disabled={isApplying || job.status !== 'OPEN'}
                  onClick={handleSubmitApply}
                  style={{ padding: '8px 24px', fontSize: 13 }}
                >
                  <Send size={15} /> {isApplying ? 'Đang gửi hồ sơ...' : 'Xác nhận Ứng tuyển'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
}

