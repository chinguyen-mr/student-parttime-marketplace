import React, { useRef, useEffect } from 'react';
import { MapPin, Heart, Sparkles, BadgeCheck, CalendarClock, Users } from 'lucide-react';
import { motion } from 'motion/react';
import CompanyLogo from './CompanyLogo';
import { salaryAmount, formatSalary, salaryCaption, workTypeLabel, shortLocation, postedLabel, deadlineInfo } from '../../utils/jobDisplay';

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
  // App có nhận yêu cầu mở xem nhanh chưa (bị từ chối nếu vừa cuộn trang) → thử lại khi chuột di chuyển trong thẻ
  const hoverAcceptedRef = useRef(false);

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


  // Thông tin hiển thị (định dạng dùng chung trong utils/jobDisplay)
  const salaryNum = salaryAmount(job);
  const locationShort = shortLocation(job) || 'Chưa cập nhật';
  const posted = postedLabel(job);
  const dl = deadlineInfo(job);
  const deadline = !dl ? null
    : dl.expired ? { text: `Đã hết hạn (${dl.date})`, color: '#991B1B' }
    : dl.urgent ? { text: `Hạn nộp: ${dl.date} · còn ${dl.daysLeft === 0 ? 'hôm nay' : `${dl.daysLeft} ngày`}`, color: '#C2410C' }
    : { text: `Hạn nộp: ${dl.date}`, color: 'var(--color-text-secondary, #64748B)' };

  const isVerified = job.employer_verification_status === 'VERIFIED';
  const experienceLabel = job.experience || null;
  const levelLabel = job.level || null;

  const tagStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
    color: 'var(--color-text-main, #374151)', background: 'var(--color-lavender-surface, #F3F4F6)',
    padding: '3px 8px', borderRadius: 6, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
  };

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
      const accepted = onHoverStart(job, {
        top: r.top,
        left: r.left,
        right: r.right,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      });
      hoverAcceptedRef.current = accepted !== false;
    }
  };

  // Trình duyệt bắn "mouseenter" trước "mousemove": nếu lúc vào thẻ App còn chặn do vừa cuộn,
  // thì thử mở lại ở lần di chuột kế tiếp thay vì bắt người dùng rê ra rồi vào lại.
  const handleMouseMove = () => {
    if (isCursorInsideRef.current && !hoverAcceptedRef.current) handleMouseEnter();
  };

  const handleMouseLeave = () => {
    isCursorInsideRef.current = false;
    hoverAcceptedRef.current = false;
    // Rule 4: Reset suppression flag khi chuột thực sự rời khỏi Card
    isSuppressedByScrollRef.current = false;

    if (onHoverEnd) {
      onHoverEnd(job);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelectJob && onSelectJob(job)}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        boxShadow: 'var(--shadow-sm)',
        height: '100%',
        boxSizing: 'border-box',
      }}
      className="job-card-hover"
    >
      {/* Đầu thẻ: logo, tên việc, doanh nghiệp, thời gian đăng, nút lưu */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
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
          <CompanyLogo src={job.company_logo_url || job.employer_avatar} alt={companyDisplayName} size={52} borderRadius={12} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: 15.5, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0', lineHeight: 1.35,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}
            title={job.title}
          >
            {job.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
            <span
              onClick={(e) => {
                if (onViewCompany) {
                  e.stopPropagation();
                  onViewCompany(job);
                }
              }}
              style={{
                fontSize: 13, color: 'var(--color-text-secondary, #475569)', fontWeight: 600,
                cursor: onViewCompany ? 'pointer' : 'default',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0
              }}
              title={companyDisplayName}
            >
              {companyDisplayName}
            </span>
            {isVerified && (
              <span title="Doanh nghiệp đã được JobNest xác minh" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#047857' }}>
                <BadgeCheck size={14} /> Đã xác minh
              </span>
            )}
          </div>
          {posted && (
            <div style={{ fontSize: 12, color: 'var(--color-text-muted, #94A3B8)', marginTop: 3 }}>{posted}</div>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave && onToggleSave(job);
          }}
          aria-label={isSaved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
          aria-pressed={Boolean(isSaved)}
          style={{
            background: isSaved ? 'var(--color-danger-bg)' : 'var(--color-background)',
            border: isSaved ? '1px solid var(--color-danger-border)' : '1px solid var(--color-border)',
            color: isSaved ? 'var(--color-danger)' : 'var(--color-text-muted)',
            width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
          }}
          title={isSaved ? 'Đã lưu việc làm này' : 'Lưu việc làm'}
        >
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
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

      {/* Mức lương */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: salaryNum ? 'var(--color-primary)' : 'var(--color-text)', letterSpacing: '-0.01em' }}>
          {formatSalary(job)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748B)', marginTop: 2 }}>{salaryCaption(job)}</div>
      </div>

      {/* Thông tin chính: địa điểm, hình thức, kinh nghiệm, cấp bậc */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 12, borderTop: '1px solid var(--color-border)', marginBottom: 12 }}>
        <span style={tagStyle} title={job.location || ''}>
          <MapPin size={12} color="var(--color-text-secondary, #4B5563)" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{locationShort}</span>
        </span>
        <span style={{ ...tagStyle, color: 'var(--color-primary-dark, #5B21B6)', background: 'var(--color-primary-light, #EDE9FE)', fontWeight: 700 }}>
          {workTypeLabel(job)}
        </span>
        {experienceLabel && <span style={tagStyle} title="Yêu cầu kinh nghiệm">{experienceLabel}</span>}
        {levelLabel && <span style={tagStyle} title="Cấp bậc">{levelLabel}</span>}
      </div>

      {/* Hạn nộp & số lượng tuyển — đẩy xuống đáy để các thẻ trong lưới thẳng hàng */}
      <div style={{ marginTop: 'auto' }}>
        {(deadline || job.headcount) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 12.5, marginBottom: 12, flexWrap: 'wrap' }}>
            {deadline ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: deadline.color, fontWeight: 600 }}>
                <CalendarClock size={13} /> {deadline.text}
              </span>
            ) : <span />}
            {Number(job.headcount) > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary, #64748B)' }}>
                <Users size={13} /> Tuyển {job.headcount} người
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectJob && onSelectJob(job);
          }}
          style={{
            width: '100%', background: 'var(--color-surface, #ffffff)', border: '1.5px solid var(--color-primary, #594675)',
            color: 'var(--color-primary, #594675)', fontSize: 13.5, fontWeight: 700, borderRadius: 10, padding: '9px 12px',
            cursor: 'pointer', transition: 'background-color 0.15s ease, color 0.15s ease',
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
          Xem chi tiết công việc
        </button>
      </div>
    </motion.div>
  );
}
