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
  onViewCompany,
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
      return { text: 'Đã hết hạn', isExpired: true, isUrgent: false, color: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5' };
    }
    if (diffDays <= 3) {
      return { text: diffDays === 0 ? 'Hết hạn hôm nay' : `Sắp hết hạn (${diffDays} ngày)`, isExpired: false, isUrgent: true, color: '#9A3412', bg: '#FFF7ED', border: '#FDBA74' };
    }
    if (diffDays <= 14) {
      return { text: `Còn ${diffDays} ngày`, isExpired: false, isUrgent: false, color: '#0369A1', bg: '#F0F9FF', border: '#7DD3FC' };
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
          <div
            onClick={(e) => {
              if (onViewCompany) {
                e.stopPropagation();
                onViewCompany(job);
              }
            }}
            style={{ cursor: onViewCompany ? 'pointer' : 'default', flexShrink: 0 }}
            title={onViewCompany ? `Xem trang công khai của ${companyDisplayName}` : companyDisplayName}
          >
            <CompanyLogo
              src={job.company_logo_url || job.employer_avatar}
              alt={companyDisplayName}
              size={44}
              borderRadius={10}
            />
          </div>

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
              onClick={(e) => {
                if (onViewCompany) {
                  e.stopPropagation();
                  onViewCompany(job);
                }
              }}
              style={{
                fontSize: 12.5,
                color: onViewCompany ? 'var(--color-primary, #7565A8)' : 'var(--color-text-secondary)',
                cursor: onViewCompany ? 'pointer' : 'default',
                margin: 0,
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                fontWeight: onViewCompany ? 600 : 400,
              }}
              title={onViewCompany ? `Xem trang công khai của ${companyDisplayName} (WF-G06)` : companyDisplayName}
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
              transition: 'color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
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

        {/* AI Schedule Matching Score Banner & Explainable Reasons (P0-03 & P0-05) */}
        {job.matching_score !== undefined && job.matching_score !== null && (
          <div
            style={{
              background: job.matching_score >= 85 ? 'rgba(34, 197, 94, 0.08)' : job.matching_score >= 60 ? 'rgba(117, 101, 168, 0.08)' : 'rgba(234, 88, 12, 0.08)',
              border: `1px solid ${job.matching_score >= 85 ? '#86efac' : job.matching_score >= 60 ? '#c4b5fd' : '#fed7aa'}`,
              borderRadius: 8,
              padding: '8px 10px',
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 800,
                  color: job.matching_score >= 85 ? '#15803d' : job.matching_score >= 60 ? '#6b21a8' : '#c2410c',
                }}
              >
                <Sparkles size={13} />
                {job.badge_label || `Độ phù hợp: ${job.matching_score}%`}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: job.matching_score >= 85 ? '#15803d' : job.matching_score >= 60 ? '#6b21a8' : '#c2410c',
                  background: '#ffffff',
                  padding: '1px 7px',
                  borderRadius: 10,
                  border: `1px solid ${job.matching_score >= 85 ? '#bbf7d0' : '#e9d5ff'}`,
                }}
              >
                {job.matching_score}%
              </span>
            </div>
            {Array.isArray(job.match_reasons) && job.match_reasons.length > 0 && (
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {job.match_reasons.slice(0, 2).map((reason, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-main, #374151)',
                      lineHeight: 1.4,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 4,
                    }}
                  >
                    <span style={{ color: '#15803d', flexShrink: 0, fontWeight: 700 }}>✓</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
              <span style={{ fontSize: 12, color: 'var(--color-primary-dark, #5B21B6)', background: 'var(--color-primary-light, #EDE9FE)', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
                Lương theo giờ
              </span>
            )}
          </div>

          {deadlineBadge && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: deadlineBadge.color,
                background: deadlineBadge.bg,
                border: `1px solid ${deadlineBadge.border}`,
                padding: '2.5px 8px',
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
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-text-main, #374151)',
              background: 'var(--color-lavender-surface, #F3F4F6)',
              padding: '3px 8px',
              borderRadius: 6,
            }}
          >
            <MapPin size={12} color="var(--color-text-secondary, #4B5563)" />
            {locationShort}
          </span>

          {/* Work Type Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-primary-dark, #5B21B6)',
              background: 'var(--color-primary-light, #EDE9FE)',
              padding: '3px 8px',
              borderRadius: 6,
              border: '1px solid #DDD6FE',
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
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text-secondary, #4B5563)',
                background: 'var(--color-surface, #ffffff)',
                border: '1px solid var(--color-border)',
                padding: '2.5px 7px',
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
            fontSize: 12.5,
            fontWeight: 700,
            borderRadius: 6,
            padding: '5px 12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            transition: 'background-color 0.15s ease, color 0.15s ease',
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
