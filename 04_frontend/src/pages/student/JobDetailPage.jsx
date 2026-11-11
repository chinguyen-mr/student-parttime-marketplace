import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, DollarSign, Clock, Calendar, 
  ArrowLeft, Send, Bookmark, CheckCircle2, Award, Briefcase, 
  GraduationCap, Users, ExternalLink, Share2, ShieldCheck, 
  ChevronRight, Sparkles, AlertCircle, FileText, Globe, Check, Edit3, Flag
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui';
import CompanyLogo from '../../components/CompanyLogo';
import { getJobBannerUrl } from '../../utils/bannerHelper';
import JobLocationMap from '../../components/JobLocationMap';
import ProposalModal from '../../components/forms/ProposalModal';
import { API_BASE } from '../../config/api';
import { updateSEO, cleanupSEO } from '../../utils/seoHelper';

export default function JobDetailPage({
  jobId,
  initialJob,
  fallbackJob,
  onBack,
  onBackToList,
  onApply,
  onEditJob,
  isSaved: propIsSaved,
  onToggleSave,
  onSelectJob,
  onSelectRelatedJob,
  onViewEmployerProfile,
  onViewCompany,
  onReportViolation,
  currentUser,
  onOpenAuth,
  showToast
}) {
  const handleBack = onBack || onBackToList;
  const handleSelectJob = onSelectJob || onSelectRelatedJob;
  const handleViewEmployerProfile = onViewEmployerProfile || onViewCompany;
  const [job, setJob] = useState(initialJob || fallbackJob || null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(!initialJob && !fallbackJob);
  const [copiedLink, setCopiedLink] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  // Fallback to initialJob if job state is empty
  const currentJob = job || initialJob || fallbackJob;

  // LocalStorage bookmark state (Requirement: Nút "Lưu việc làm" icon Bookmark & LocalStorage)
  const [isSaved, setIsSaved] = useState(() => {
    if (typeof propIsSaved === 'boolean') return propIsSaved;
    try {
      const saved = JSON.parse(localStorage.getItem('jobnest_saved_jobs') || '[]');
      return Array.isArray(saved) && currentJob?.id && saved.includes(currentJob.id);
    } catch {
      return false;
    }
  });

  // Sync prop changes
  useEffect(() => {
    if (typeof propIsSaved === 'boolean') {
      setIsSaved(propIsSaved);
    }
  }, [propIsSaved]);

  // WP-03: Dynamic SEO Metadata (Title, Meta Description, Canonical URL, Robots)
  useEffect(() => {
    if (!loading) {
      updateSEO('job_detail', currentJob);
    }
    return () => {
      cleanupSEO('jobs');
    };
  }, [currentJob, loading]);

  // Fetch full job detail and related jobs from API if needed
  useEffect(() => {
    let isMounted = true;
    const fetchJobDetail = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        // 1. Fetch full job
        const res = await fetch(`${API_BASE}/jobs/${jobId}`);
        const data = await res.json();
        if (data.success && isMounted) {
          setJob(data.data);
        }

        // 2. Fetch related jobs
        const resRelated = await fetch(`${API_BASE}/jobs/${jobId}/related`);
        const dataRelated = await resRelated.json();
        if (dataRelated.success && Array.isArray(dataRelated.data) && isMounted) {
          setRelatedJobs(dataRelated.data);
        }
      } catch (err) {
        console.error('Failed to fetch job detail from API, using fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchJobDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  if (loading && !currentJob) {
    return (
      <div style={{ maxWidth: 1140, margin: '40px auto', padding: '0 20px' }}>
        <div style={{ height: 200, background: '#f1f5f9', borderRadius: 12, marginBottom: 24, animation: 'pulse 1.5s infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div style={{ height: 400, background: '#f8fafc', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 300, background: '#f8fafc', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>
        <AlertCircle size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
          Không tìm thấy thông tin công việc
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>
          Công việc này có thể đã hết hạn hoặc tạm thời ngừng nhận hồ sơ.
        </p>
        <Button variant="primary" onClick={handleBack}>
          <ArrowLeft size={14} /> Quay lại danh sách việc làm
        </Button>
      </div>
    );
  }

  const companyDisplayName = currentJob.company_name || currentJob.employer_name || 'Doanh nghiệp đối tác JobNest';
  const initial = companyDisplayName.charAt(0).toUpperCase();

  // =========================================================================
  // LOGIC 1: XỬ LÝ DEADLINE (application_deadline từ API)
  // =========================================================================
  const deadlineValue = currentJob.application_deadline || currentJob.deadline;
  const now = new Date();
  const deadlineDate = deadlineValue ? new Date(deadlineValue) : null;
  const isExpired = deadlineDate ? deadlineDate < now : false;

  // Số ngày còn lại
  const diffDays = deadlineDate ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = !isExpired && diffDays !== null && diffDays <= 3 && diffDays >= 0;

  // =========================================================================
  // LOGIC 2: ĐỊNH DẠNG MỨC LƯƠNG
  // =========================================================================
  const formatSalary = () => {
    const num = Number(currentJob.salary || 0);
    if (!num) return 'Thỏa thuận';
    if (currentJob.salary_type === 'HOURLY') {
      return `${num.toLocaleString('vi-VN')} đ/giờ`;
    }
    if (currentJob.salary_type === 'MONTHLY' || num >= 10000000) {
      const millions = (num / 1000000).toFixed(0);
      return `${millions} - ${(Number(millions) + 5)} triệu/tháng`;
    }
    if (currentJob.salary_type === 'DAILY') {
      return `${num.toLocaleString('vi-VN')} đ/ngày`;
    }
    return `${num.toLocaleString('vi-VN')} đ/dự án`;
  };

  // Work type label
  const getWorkTypeLabel = () => {
    switch (currentJob.work_type) {
      case 'PART_TIME':
        return 'Bán thời gian (Part-time)';
      case 'FREELANCE':
        return 'Freelance / Dự án';
      case 'FULL_TIME':
        return 'Toàn thời gian (Full-time)';
      case 'SEASONAL':
        return 'Thời vụ / Sự kiện';
      default:
        return 'Linh hoạt ca';
    }
  };

  // Company account type label
  const getAccountTypeLabel = () => {
    const accType = currentJob.account_type || currentJob.employer_account_type;
    switch (accType) {
      case 'ENTERPRISE':
      case 'COMPANY':
        return 'Doanh nghiệp / Công ty';
      case 'INDIVIDUAL':
        return 'Cá nhân tuyển dụng';
      case 'STORE':
      case 'SHOP':
        return 'Cửa hàng / Hộ kinh doanh';
      default:
        return 'Doanh nghiệp đối tác';
    }
  };

  // Website link
  const companyWebsite = currentJob.website || currentJob.company_website;

  // NTD role & ownership check
  const isEmployerRole = currentUser?.role === 'EMPLOYER';
  const isMyJob = Boolean(
    isEmployerRole && (
      (currentJob?.employer_id && String(currentJob.employer_id) === String(currentUser?.id)) ||
      (currentJob?.user_id && String(currentJob.user_id) === String(currentUser?.id)) ||
      (currentJob?.employer_email && currentUser?.email && currentJob.employer_email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentJob?.employer_name && currentUser?.full_name && currentJob.employer_name.trim().toLowerCase() === currentUser.full_name.trim().toLowerCase())
    )
  );

  // =========================================================================
  // LOGIC 3: NÚT LƯU VIỆC LÀM (BOOKMARK + LOCALSTORAGE)
  // =========================================================================
  const handleBookmarkToggle = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      let saved = JSON.parse(localStorage.getItem('jobnest_saved_jobs') || '[]');
      if (!Array.isArray(saved)) saved = [];
      if (nextSaved) {
        if (!saved.includes(currentJob.id)) saved.push(currentJob.id);
      } else {
        saved = saved.filter(id => id !== currentJob.id);
      }
      localStorage.setItem('jobnest_saved_jobs', JSON.stringify(saved));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    if (onToggleSave) onToggleSave(currentJob);
    if (showToast) {
      showToast(nextSaved ? 'Đã lưu việc làm vào danh sách yêu thích' : 'Đã bỏ lưu việc làm');
    }
  };

  // =========================================================================
  // LOGIC 4: NÚT ỨNG TUYỂN (PHÂN QUYỀN GUEST, STUDENT, EMPLOYER)
  // =========================================================================
  const handleApplyClick = () => {
    // 1. Nếu chưa đăng nhập -> Chuyển hướng qua trang Login và ghi nhớ job này (không mở popup)
    if (!currentUser?.token) {
      if (onApply) {
        onApply(currentJob);
      } else if (onOpenAuth) {
        onOpenAuth('login', currentJob);
      }
      return;
    }

    // 2. Nếu là EMPLOYER
    if (currentUser?.role === 'EMPLOYER') {
      if (showToast) {
        showToast('Chỉ sinh viên mới có thể ứng tuyển vào công việc này!', 'error');
      } else {
        alert('Chỉ sinh viên mới có thể ứng tuyển vào công việc này!');
      }
      return;
    }

    // 3. Nếu là STUDENT -> Điều hướng qua handleOpenApplyModal để kiểm tra hồ sơ
    if (onApply) {
      onApply(currentJob);
    } else if (currentJob.work_type === 'FREELANCE' || currentJob.job_type === 'FREELANCE') {
      setProposalModalOpen(true);
    }
  };

  // Share link handler
  const handleShareLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      if (showToast) showToast('Đã sao chép liên kết vào bộ nhớ tạm');
    }
  };

  return (
    <div className="job-detail-page-container" style={{ maxWidth: 1240, margin: '0 auto', padding: '16px 20px 60px' }}>
      {/* =========================================================================
          BREADCRUMB & BACK BUTTON
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          <span
            style={{ cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600 }}
            onClick={handleBack}
          >
            Trang chủ
          </span>
          <ChevronRight size={13} color="#CBD5E1" />
          <span
            style={{ cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600 }}
            onClick={handleBack}
          >
            Danh sách việc làm
          </span>
          <ChevronRight size={13} color="#CBD5E1" />
          <span style={{ color: 'var(--color-text)', fontWeight: 700, maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentJob.title}
          </span>
        </div>

        <button
          type="button"
          onClick={handleBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#ffffff',
            border: '1.5px solid var(--color-border)',
            color: 'var(--color-primary)',
            padding: '7px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
            e.currentTarget.style.borderColor = '#A997C5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <ArrowLeft size={14} /> Quay lại danh sách việc làm
        </button>
      </div>

      {/* =========================================================================
          WF-G03: KHỐI TIÊU ĐỀ JOB & HERO BANNER (k162, k163)
          "Tiêu đề Job: Tên Job — Nhà tuyển dụng — Mức lương — Địa điểm — Hạn ứng tuyển"
          ========================================================================= */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          padding: '24px 28px',
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(89, 70, 117, 0.04)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Banner Ảnh bìa (job_banner_url) với fallback tự động */}
        <div
          style={{
            width: 'calc(100% + 56px)',
            height: 140,
            margin: '-24px -28px 18px -28px',
            overflow: 'hidden',
            position: 'relative',
            background: '#F4F1F8',
          }}
        >
          <img
            src={getJobBannerUrl(currentJob.job_banner_url || currentJob.banner_url, currentJob.category)}
            alt={currentJob.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.92)',
            }}
            onError={(e) => {
              e.currentTarget.src = getJobBannerUrl('', currentJob.category);
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 60%, transparent 100%)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Logo Nhà tuyển dụng 56x56 */}
          <CompanyLogo
            src={currentJob.company_logo_url || currentJob.employer_avatar}
            alt={companyDisplayName}
            size={64}
            borderRadius={12}
            style={{ boxShadow: '0 4px 12px rgba(89, 70, 117, 0.12)' }}
          />

          {/* Tiêu đề & Tóm tắt nhanh */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  background: 'var(--color-primary-light)',
                  padding: '3px 10px',
                  borderRadius: 6,
                  border: '1px solid #EDE9FE',
                }}
              >
                {currentJob.category || 'Việc làm sinh viên'}
              </span>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#047857',
                  background: '#ECFDF5',
                  padding: '3px 10px',
                  borderRadius: 6,
                  border: '1px solid #A7F3D0',
                }}
              >
                {getWorkTypeLabel()}
              </span>

              {/* Deadline Status Badge */}
              {isExpired ? (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#DC2626',
                    background: '#FEE2E2',
                    padding: '3px 10px',
                    borderRadius: 6,
                    border: '1px solid #FECACA',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Clock size={12} /> Đã hết hạn ứng tuyển
                </span>
              ) : isUrgent ? (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#D97706',
                    background: '#FEF3C7',
                    padding: '3px 10px',
                    borderRadius: 6,
                    border: '1px solid #FDE68A',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  ⏳ Sắp hết hạn ({diffDays === 0 ? 'Hôm nay' : `Còn ${diffDays} ngày`})
                </span>
              ) : diffDays !== null ? (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#2563EB',
                    background: '#EFF6FF',
                    padding: '3px 10px',
                    borderRadius: 6,
                    border: '1px solid #BFDBFE',
                  }}
                >
                  Còn {diffDays} ngày nộp hồ sơ
                </span>
              ) : null}
            </div>

            {/* Tiêu đề Job (k162) */}
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: '0 0 8px 0',
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
              }}
            >
              {currentJob.title}
            </h1>

            {/* Tóm tắt nhanh: Nhà tuyển dụng — Địa điểm — Hình thức làm việc */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap', color: 'var(--color-text-secondary)', fontSize: 14 }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                🏢 {companyDisplayName}
              </span>
              <span>•</span>
              <span>📍 {currentJob.location || 'TP. Hồ Chí Minh'}</span>
              <span>•</span>
              <span>💼 {getWorkTypeLabel()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          WF-G03: BỐ CỤC 2 CỘT CHUẨN WIREFRAME
          Cột trái (w=736 / 68%): Mô tả, Yêu cầu, Quyền lợi
          Cột phải (w=369 / 32%): Thông tin tóm tắt, Mức lương, Hạn chót, Nút Ứng tuyển & Nhà tuyển dụng
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 24, alignItems: 'flex-start' }} className="job-detail-grid">
        
        {/* =====================================================================
            CỘT TRÁI: NỘI DUNG JOB (WF-G03: k165)
            ===================================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* MÔ TẢ CÔNG VIỆC (k166) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              padding: '24px 28px',
              boxShadow: '0 1px 3px rgba(89, 70, 117, 0.03)',
            }}
          >
            <h3
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: 16,
                paddingBottom: 10,
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FileText size={18} color="var(--color-primary)" /> Mô tả công việc
            </h3>

            <div style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
              {currentJob.description || 'Chưa có thông tin mô tả chi tiết cho công việc này.'}
            </div>
          </div>

          {/* YÊU CẦU ỨNG VIÊN (k167) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              padding: '24px 28px',
              boxShadow: '0 1px 3px rgba(89, 70, 117, 0.03)',
            }}
          >
            <h3
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: 16,
                paddingBottom: 10,
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Award size={18} color="var(--color-primary)" /> Yêu cầu công việc
            </h3>

            <div style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
              {currentJob.requirements || '• Sinh viên đang theo học tại các trường Đại học/Cao đẳng tại TP.HCM.\n• Chăm chỉ, đúng giờ, có tinh thần trách nhiệm trong công việc.\n• Giao tiếp tốt, hòa đồng và ham học hỏi.'}
            </div>
          </div>

          {/* QUYỀN LỢI ĐƯỢC HƯỞNG (k168) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              padding: '24px 28px',
              boxShadow: '0 1px 3px rgba(89, 70, 117, 0.03)',
            }}
          >
            <h3
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: 16,
                paddingBottom: 10,
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Sparkles size={18} color="#F2A184" /> Quyền lợi được hưởng
            </h3>

            <div style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
              {currentJob.benefits || '• Mức thù lao hấp dẫn, cam kết thanh toán sòng phẳng và đúng hạn.\n• Được hỗ trợ dấu thực tập và giấy xác nhận công việc từ doanh nghiệp.\n• Cơ hội trau dồi kinh nghiệm thực chiến và mở rộng mạng lưới quan hệ nghề nghiệp.'}
            </div>
          </div>

          {/* THÔNG TIN CHI TIẾT THEO LOẠI VIỆC (k169: Part-time / k170: Seasonal / k171: Freelance) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              padding: '24px 28px',
              boxShadow: '0 1px 3px rgba(89, 70, 117, 0.03)',
            }}
          >
            <h3
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: 16,
                paddingBottom: 10,
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Clock size={18} color="var(--color-primary)" /> 
              {currentJob.work_type === 'FREELANCE' 
                ? 'Quy cách & Sản phẩm bàn giao (Freelance)'
                : currentJob.work_type === 'SEASONAL'
                ? 'Thời gian & Lịch trình làm việc (Thời vụ)'
                : 'Thời gian & Lịch làm việc (Part-time)'}
            </h3>

            {currentJob.work_type === 'FREELANCE' ? (
              /* Freelance details (k171: phạm vi, sản phẩm bàn giao, deadline, ngân sách) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: '#475569' }}>
                <div>
                  <strong style={{ color: 'var(--color-text)' }}>Phạm vi công việc:</strong> Thực hiện theo đề cương dự án đã thỏa thuận.
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text)' }}>Sản phẩm bàn giao:</strong> Source code / File thiết kế gốc / Báo cáo hoàn thành.
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text)' }}>Thời hạn hoàn thành:</strong> {deadlineDate ? deadlineDate.toLocaleDateString('vi-VN') : 'Theo thỏa thuận'}
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text)' }}>Ngân sách dự kiến:</strong> <span style={{ color: '#047857', fontWeight: 700 }}>{formatSalary()}</span>
                </div>
              </div>
            ) : currentJob.work_type === 'SEASONAL' ? (
              /* Seasonal details (k170: ngày bắt đầu, kết thúc, lịch làm) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: '#475569' }}>
                <div>
                  <strong style={{ color: 'var(--color-text)' }}>Đợt làm việc:</strong> Thời vụ cao điểm / Sự kiện ngắn hạn
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text)' }}>Thời hạn kết thúc đợt:</strong> {deadlineDate ? deadlineDate.toLocaleDateString('vi-VN') : 'Khi đủ số lượng ứng viên'}
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text)' }}>Ca làm việc:</strong> {currentJob.work_shift || currentJob.work_schedule || 'Linh hoạt ca theo ngày (Sáng / Chiều / Tối)'}
                </div>
              </div>
            ) : (
              /* Part-time details (k169: lịch làm việc, số giờ/tuần) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: '#475569' }}>
                <div>
                  <strong style={{ color: 'var(--color-text)' }}>Lịch làm việc trong tuần:</strong> {currentJob.work_days || currentJob.work_schedule || 'Thứ 2 đến Thứ 7 (Linh hoạt chọn ca)'}
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text)' }}>Số giờ yêu cầu:</strong> Tối thiểu 16 - 24 giờ / tuần, phù hợp thời khóa biểu sinh viên.
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text)' }}>Ca làm:</strong> {currentJob.work_shift || 'Ca sáng (08:00 - 12:00) hoặc Ca chiều (13:30 - 17:30)'}
                </div>
              </div>
            )}
          </div>

          {/* VỊ TRÍ BẢN ĐỒ LÀM VIỆC (LEAFLET / OPENSTREETMAP) */}
          <JobLocationMap job={currentJob} />
        </div>

        {/* =====================================================================
            CỘT PHẢI: THÔNG TIN TÓM TẮT, NÚT ỨNG TUYỂN & NHÀ TUYỂN DỤNG (WF-G03: k173)
            ===================================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* KHỐI HÀNH ĐỘNG ỨNG TUYỂN & MỨC LƯƠNG & DEADLINE (k176, k177, k178) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1.5px solid #29263A',
              padding: '24px',
              boxShadow: '0 4px 16px rgba(41, 38, 58, 0.08)'
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 4 }}>
              Mức thù lao
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 14 }}>
              {formatSalary()}
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 14, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hình thức:</span>
                <strong style={{ color: 'var(--color-text)' }}>{getWorkTypeLabel()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hạn ứng tuyển:</span>
                <strong style={{ color: isExpired ? '#DC2626' : 'var(--color-text)' }}>
                  {deadlineDate ? deadlineDate.toLocaleDateString('vi-VN') : 'Thường xuyên'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Trạng thái:</span>
                {isExpired ? (
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>Đã hết hạn</span>
                ) : isUrgent ? (
                  <span style={{ color: '#D97706', fontWeight: 700 }}>⏳ Sắp hết hạn</span>
                ) : (
                  <span style={{ color: '#047857', fontWeight: 700 }}>Đang nhận hồ sơ</span>
                )}
              </div>
            </div>

            {/* NÚT ỨNG TUYỂN / NỘP ĐỀ XUẤT / ĐIỀU KIỆN TRƯỜNG 2 NHÀ TUYỂN DỤNG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isEmployerRole ? (
                isMyJob ? (
                  /* Trường 2: Tin của chính NTD -> Hiện nút Chỉnh sửa tin này (dẫn về Workspace) */
                  (() => {
                    const isJobLocked = currentJob.status === 'FILLED' || currentJob.status === 'COMPLETED';
                    return (
                      <button
                        type="button"
                        disabled={isJobLocked}
                        title={isJobLocked ? 'Tin đã nhận người hoặc hoàn thành không thể chỉnh sửa (AC5)' : 'Chỉnh sửa tin này'}
                        onClick={() => {
                          if (!isJobLocked) {
                            if (onEditJob) onEditJob(currentJob);
                            else if (handleBack) handleBack();
                          }
                        }}
                        style={{
                          width: '100%',
                          background: isJobLocked ? '#94A3B8' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 10,
                          padding: '12px 20px',
                          fontSize: 14.5,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          cursor: isJobLocked ? 'not-allowed' : 'pointer',
                          opacity: isJobLocked ? 0.6 : 1,
                          boxShadow: isJobLocked ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Edit3 size={16} /> {isJobLocked ? 'Tin đã hoàn tất (Không thể sửa)' : 'Chỉnh sửa tin này (Quản lý)'}
                      </button>
                    );
                  })()
                ) : (
                  /* Trường 2: Tin của NTD khác -> Ẩn nút Ứng tuyển, chỉ hiện nút Xem thông tin công ty */
                  <button
                    type="button"
                    onClick={() => handleViewEmployerProfile && handleViewEmployerProfile(currentJob)}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      color: '#1E293B',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      padding: '12px 20px',
                      fontSize: 14.5,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                  >
                    <Building2 size={16} color="#059669" /> Xem thông tin công ty
                  </button>
                )
              ) : isExpired ? (
                /* Nút khi đã hết hạn: màu xám, disabled, chữ "Đã hết hạn" */
                <button
                  type="button"
                  disabled
                  style={{
                    width: '100%',
                    background: '#94a3b8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 20px',
                    fontSize: 14.5,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'not-allowed',
                  }}
                >
                  <Clock size={16} /> Đã hết hạn ứng tuyển
                </button>
              ) : currentJob.work_type === 'FREELANCE' || currentJob.job_type === 'FREELANCE' ? (
                /* Nút Gửi Proposal cho Freelance (k177) */
                <button
                  type="button"
                  onClick={handleApplyClick}
                  style={{
                    width: '100%',
                    background: '#047857',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 20px',
                    fontSize: 14.5,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#065F46'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#047857'}
                >
                  <Send size={16} /> Gửi Proposal ngay
                </button>
              ) : (
                /* Nút Ứng tuyển ngay cho Part-time / Seasonal (k176) */
                <button
                  type="button"
                  onClick={handleApplyClick}
                  style={{
                    width: '100%',
                    background: '#7565A8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 20px',
                    fontSize: 14.5,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(117, 101, 168, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#635394'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#7565A8'}
                >
                  <Send size={16} /> Ứng tuyển ngay
                </button>
              )}

              {/* NÚT LƯU VIỆC LÀM (k178: icon Bookmark, đổi màu, lưu LocalStorage) */}
              <button
                type="button"
                onClick={handleBookmarkToggle}
                style={{
                  width: '100%',
                  background: isSaved ? '#EEEAF7' : '#ffffff',
                  color: isSaved ? '#7565A8' : '#29263A',
                  border: isSaved ? '1.5px solid #7565A8' : '1.5px solid #29263A',
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSaved) e.currentTarget.style.background = '#F8F7FB';
                }}
                onMouseLeave={(e) => {
                  if (!isSaved) e.currentTarget.style.background = '#ffffff';
                }}
              >
                <Bookmark size={16} fill={isSaved ? '#7565A8' : 'none'} color={isSaved ? '#7565A8' : '#29263A'} />
                {isSaved ? 'Đã lưu việc làm' : 'Lưu việc làm'}
              </button>

              <button
                type="button"
                onClick={handleShareLink}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#64748B',
                  border: 'none',
                  padding: '6px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Share2 size={14} />
                {copiedLink ? 'Đã sao chép link!' : 'Chia sẻ việc làm'}
              </button>
            </div>
          </div>

          {/* KHỐI NHÀ TUYỂN DỤNG (WF-G03: k173, k174, k175) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              padding: '22px 24px',
              boxShadow: '0 1px 3px rgba(89, 70, 117, 0.03)',
            }}
          >
            <h4
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Nhà tuyển dụng
            </h4>

            {/* Logo & Tên hiển thị (k174) */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <CompanyLogo
                src={currentJob.company_logo_url || currentJob.employer_avatar}
                alt={companyDisplayName}
                size={48}
                borderRadius={10}
              />

              <div style={{ minWidth: 0, flex: 1 }}>
                <h5 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {companyDisplayName}
                </h5>
                {/* Trạng thái xác minh (k175) */}
                <span style={{ fontSize: 12, color: '#047857', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={14} /> Đã xác thực uy tín
                </span>
              </div>
            </div>

            {/* Thông tin mở rộng: account_type, website */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#475569', marginBottom: 16, borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Hình thức:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{getAccountTypeLabel()}</span>
              </div>

              {companyWebsite && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Website:</span>
                  <a
                    href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'underline' }}
                  >
                    Truy cập web <ExternalLink size={12} />
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Địa chỉ:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text)', maxWidth: 180, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentJob.location || 'TP. Hồ Chí Minh'}
                </span>
              </div>
            </div>

            {/* Button Xem trang công ty */}
            <button
              type="button"
              onClick={() => handleViewEmployerProfile && handleViewEmployerProfile(currentJob)}
              style={{
                width: '100%',
                padding: '9px 16px',
                borderRadius: 8,
                border: '1.5px solid var(--color-primary)',
                background: '#ffffff',
                color: 'var(--color-primary)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
            >
              <Building2 size={14} /> Xem hồ sơ công ty
            </button>

            {/* Nút Báo cáo tin tuyển dụng vi phạm (WF-X01) */}
            <button
              type="button"
              onClick={() => onReportViolation && onReportViolation(currentJob)}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px dashed #CBD5E1',
                background: 'transparent',
                color: '#64748B',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FCA5A5';
                e.currentTarget.style.color = '#DC2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <Flag size={13} /> Báo cáo tin này
            </button>
          </div>

          {/* DANH MỤC & TAGS LIÊN QUAN */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(89, 70, 117, 0.03)',
            }}
          >
            <h4
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Thẻ liên quan
            </h4>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                currentJob.category,
                currentJob.work_type === 'PART_TIME' ? 'Part-time' : currentJob.work_type === 'SEASONAL' ? 'Thời vụ' : 'Freelance',
                'Sinh viên',
                'Linh hoạt ca',
                currentJob.location?.split(',')[0],
              ].filter(Boolean).map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 11.5,
                    color: 'var(--color-primary)',
                    background: 'var(--color-primary-light)',
                    padding: '3px 9px',
                    borderRadius: 999,
                    border: '1px solid #EDE9FE',
                    fontWeight: 600,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          CÔNG VIỆC TƯƠNG TỰ (RELATED JOBS)
          ========================================================================= */}
      {relatedJobs && relatedJobs.length > 0 && (
        <div style={{ marginTop: 40, borderTop: '1px solid var(--color-border)', paddingTop: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                Việc làm tương tự
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: 0 }}>
                Các vị trí cùng ngành nghề hoặc khu vực có thể phù hợp với bạn
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {relatedJobs.map((relJob) => {
              const relCompany = relJob.company_name || relJob.employer_name || 'Doanh nghiệp JobNest';
              const relSalary = Number(relJob.salary || 0);
              const salaryFormatted = relSalary
                ? relJob.salary_type === 'HOURLY'
                  ? `${relSalary.toLocaleString('vi-VN')} đ/giờ`
                  : `${(relSalary / 1000000).toFixed(0)} triệu/tháng`
                : 'Thỏa thuận';

              return (
                <div
                  key={relJob.id}
                  onClick={() => handleSelectJob && handleSelectJob(relJob)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 3px rgba(89,70,117,0.03)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#A997C5';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(89,70,117,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(89,70,117,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <CompanyLogo
                      src={relJob.company_logo_url || relJob.employer_avatar}
                      alt={relCompany}
                      size={32}
                      borderRadius={6}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {relJob.title}
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {relCompany}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <strong style={{ color: 'var(--color-primary)' }}>{salaryFormatted}</strong>
                    <span style={{ color: '#64748B' }}>📍 {relJob.location?.split(',')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Proposal Modal for Freelance Jobs */}
      <ProposalModal
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        job={currentJob}
        currentUser={currentUser}
        onSuccess={() => {
          if (showToast) showToast('Đã nộp đề xuất Freelance thành công (WF-S07)!');
        }}
        showToast={showToast}
      />
    </div>
  );
}
