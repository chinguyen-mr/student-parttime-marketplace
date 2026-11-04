import React, { useRef, useEffect } from 'react';
import { MapPin, DollarSign, Heart, Bookmark, Building2, Sparkles, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import CompanyLogo from './CompanyLogo';

export default function JobCard({
  job,
  isSaved,
  onToggleSave,
  onSelectJob,
  onApply,
  onHoverStart,
  onHoverEnd,
}) {
  const cardRef = useRef(null);
  const onHoverEndRef = useRef(onHoverEnd);
  onHoverEndRef.current = onHoverEnd;
  const jobRef = useRef(job);
  jobRef.current = job;

  // Cleanup on unmount only (Rule 2: Component Card bị unmount phải dọn dẹp)
  useEffect(() => {
    return () => {
      if (onHoverEndRef.current && jobRef.current) {
        onHoverEndRef.current(jobRef.current);
      }
    };
  }, []);

  if (!job) return null;

  const companyDisplayName = job.company_name || job.employer_name || 'Doanh nghiệp JobNest';
  const initial = companyDisplayName.charAt(0).toUpperCase();

  // Salary format
  const formatSalary = () => {
    const num = Number(job.salary || 0);
    if (!num) return 'Thỏa thuận';
    if (job.salary_type === 'HOURLY') {
      return `${num.toLocaleString('vi-VN')} đ/giờ`;
    }
    if (job.salary_type === 'MONTHLY' || num >= 10000000) {
      const millions = (num / 1000000).toFixed(0);
      return `${millions} - ${(Number(millions) + 5)} triệu/tháng`;
    }
    if (job.salary_type === 'DAILY') {
      return `${num.toLocaleString('vi-VN')} đ/ngày`;
    }
    return `${num.toLocaleString('vi-VN')} đ/dự án`;
  };

  // Work type label
  const getWorkTypeLabel = () => {
    switch (job.work_type) {
      case 'PART_TIME':
        return 'Part-time';
      case 'FREELANCE':
        return 'Freelance';
      case 'FULL_TIME':
        return 'Toàn thời gian';
      case 'SEASONAL':
        return 'Thời vụ';
      default:
        return 'Bán thời gian';
    }
  };

  // Location display
  const locationShort = job.location ? job.location.split(',')[0].trim() : 'TP.HCM';

  const isSuppressedByScrollRef = useRef(false);
  const isCursorInsideRef = useRef(false);

  // Rule 2 & 3: Khi có sự kiện cuộn xảy ra trong lúc chuột đang ở trên Card này:
  // Đánh dấu Card bị suppress cho đến khi người dùng THỰC SỰ di chuyển chuột ra khỏi Card (mouseLeave)
  useEffect(() => {
    const handleScroll = () => {
      if (isCursorInsideRef.current) {
        isSuppressedByScrollRef.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('wheel', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
  }, []);

  const handleMouseEnter = () => {
    isCursorInsideRef.current = true;

    // Rule 8: Trên màn hình di động/tablet nhỏ (< 768px), không kích hoạt hover preview
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;

    // Rule 3: Tuyệt đối không mở lại nếu vừa cuộn hoặc Card này đang bị suppress do cuộn
    if (isSuppressedByScrollRef.current) return;
    if (typeof window !== 'undefined' && window.__isJobNestScrolling) return;
    if (typeof window !== 'undefined' && window.__jobNestLastScrollTime && (Date.now() - window.__jobNestLastScrollTime < 350)) return;

    if (onHoverStart && cardRef.current) {
      const r = cardRef.current.getBoundingClientRect();
      onHoverStart(job, {
        top: r.top,
        left: r.left,
        right: r.right,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      });
    }
  };

  const handleMouseLeave = () => {
    isCursorInsideRef.current = false;
    // Rule 4: Reset suppression flag khi chuột thực sự rời khỏi Card
    isSuppressedByScrollRef.current = false;

    if (onHoverEnd) {
      onHoverEnd(job);
    }
  };

  // Deadline status badge calculation
  const getDeadlineBadge = () => {
    if (!job.application_deadline) return null;
    const deadline = new Date(job.application_deadline);
    if (isNaN(deadline.getTime())) return null;
    const now = new Date();
    const diffMs = deadline - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Đã hết hạn', isExpired: true, isUrgent: false, color: '#ef4444', bg: '#fef2f2', border: '#fecaca' };
    }
    if (diffDays <= 3) {
      return { text: diffDays === 0 ? 'Hết hạn hôm nay' : `Sắp hết hạn (${diffDays} ngày)`, isExpired: false, isUrgent: true, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' };
    }
    if (diffDays <= 14) {
      return { text: `Còn ${diffDays} ngày`, isExpired: false, isUrgent: false, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' };
    }
    return null;
  };
  const deadlineBadge = getDeadlineBadge();

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelectJob && onSelectJob(job)}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        boxShadow: 'var(--shadow-sm)',
        minHeight: 180,
      }}
      className="job-card-hover"
    >
      <div>
        {/* Top Header: Logo, Company & Save Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          {/* Real Company Logo with smart fallbacks */}
          <CompanyLogo
            src={job.company_logo_url || job.employer_avatar}
            alt={companyDisplayName}
            size={44}
            borderRadius={10}
          />

          {/* Title & Company Name */}
          <div style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: '0 0 3px 0',
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                transition: 'color 0.15s ease',
              }}
              title={job.title}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
            >
              {job.title}
            </h3>

            <p
              style={{
                fontSize: 12.5,
                color: 'var(--color-text-secondary)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={companyDisplayName}
            >
              {companyDisplayName}
            </p>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave && onToggleSave(job);
            }}
            style={{
              background: isSaved ? 'var(--color-danger-bg)' : 'var(--color-background)',
              border: isSaved ? '1px solid var(--color-danger-border)' : '1px solid var(--color-border)',
              color: isSaved ? 'var(--color-danger)' : 'var(--color-text-muted)',
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSaved) {
                e.currentTarget.style.color = 'var(--color-danger)';
                e.currentTarget.style.borderColor = 'var(--color-danger-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaved) {
                e.currentTarget.style.color = 'var(--color-text-muted)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-background)';
              }
            }}
            title={isSaved ? 'Đã lưu việc làm này' : 'Lưu việc làm yêu thích'}
          >
            <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Salary: Prominent & Clean with Deadline Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 14.5,
                fontWeight: 800,
                color: 'var(--color-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {formatSalary()}
            </span>
            {job.salary_type === 'HOURLY' && (
              <span style={{ fontSize: 11.5, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                Lương theo giờ
              </span>
            )}
          </div>

          {deadlineBadge && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: deadlineBadge.color,
                background: deadlineBadge.bg,
                border: `1px solid ${deadlineBadge.border}`,
                padding: '2px 8px',
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              {deadlineBadge.isUrgent && <span>⏳</span>}
              {deadlineBadge.text}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Location & Work type badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          paddingTop: 10,
          borderTop: '1px solid var(--color-border)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Location Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 11.5,
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              background: 'var(--color-lavender-surface)',
              padding: '2.5px 8px',
              borderRadius: 6,
            }}
          >
            <MapPin size={11} color="var(--color-text-secondary)" />
            {locationShort}
          </span>

          {/* Work Type Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: 11.5,
              fontWeight: 600,
              color: 'var(--color-primary)',
              background: 'var(--color-primary-light)',
              padding: '2.5px 8px',
              borderRadius: 6,
              border: '1px solid var(--color-border)',
            }}
          >
            {getWorkTypeLabel()}
          </span>

          {/* Experience tag if short */}
          {job.experience && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: 11,
                color: 'var(--color-text-secondary)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                padding: '2px 7px',
                borderRadius: 6,
              }}
            >
              {job.experience.includes('Không') ? 'Không cần kn' : job.experience}
            </span>
          )}
        </div>

        {/* Xem chi tiết CTA Button according to Wireframe WF-G02 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectJob && onSelectJob(job);
          }}
          style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-primary, #594675)',
            color: 'var(--color-primary, #594675)',
            fontSize: 11.5,
            fontWeight: 700,
            borderRadius: 6,
            padding: '4px 10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary, #594675)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface, #ffffff)';
            e.currentTarget.style.color = 'var(--color-primary, #594675)';
          }}
        >
          Xem chi tiết
        </button>
      </div>
    </motion.div>
  );
}
