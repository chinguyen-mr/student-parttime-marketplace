import React, { useEffect } from 'react';
import { 
  Building2, MapPin, DollarSign, Clock, Calendar, 
  ArrowRight, Send, CheckCircle2, Award, Briefcase, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CompanyLogo from './CompanyLogo';
import { getJobBannerUrl } from '../../utils/bannerHelper';

export default function JobQuickPreview({
  job,
  anchorRect,
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onSelectJob,
  onApply,
}) {
  // Defensive self-dismissal on any scroll/wheel/touch/Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleDismiss = () => {
      if (onClose) onClose();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };

    // Capture phase catches scroll in window as well as any container with overflow-y: auto/scroll
    window.addEventListener('scroll', handleDismiss, { capture: true, passive: true });
    window.addEventListener('wheel', handleDismiss, { passive: true });
    window.addEventListener('touchmove', handleDismiss, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleDismiss, { capture: true });
      window.removeEventListener('wheel', handleDismiss);
      window.removeEventListener('touchmove', handleDismiss);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Viewport bounds
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Rule 6: Không hiển thị popup nếu Card đã rời khỏi viewport (bị cuộn lên trên hoặc cuộn xuống dưới)
  if (typeof window !== 'undefined') {
    window.__quickPreviewRenderState = { isOpen: !!isOpen, jobId: job?.id, hasAnchor: !!anchorRect };
  }
  if (!isOpen || !job || !anchorRect) return null;
  if (anchorRect.bottom < 80 || anchorRect.top > viewportHeight - 40) {
    return null;
  }

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

  // Smart viewport positioning
  const previewWidth = 420;

  // Horizontal position: right of card if space available, otherwise left
  let leftPos = anchorRect.right + 12;
  if (leftPos + previewWidth > viewportWidth - 20) {
    leftPos = Math.max(16, anchorRect.left - previewWidth - 12);
  }

  // Vertical position: clamp to viewport height
  const topPos = Math.max(70, Math.min(anchorRect.top, viewportHeight - 480));

  // Extract short description & requirements
  const shortDescription = job.description
    ? job.description.split('\n')[0].replace(/^[•\-\*]\s*/, '')
    : 'Hỗ trợ công việc theo phân công của nhà tuyển dụng, cam kết môi trường làm việc minh bạch và an toàn.';

  const requirementsList = job.requirements
    ? job.requirements
        .split('\n')
        .map((r) => r.replace(/^[•\-\*]\s*/, '').trim())
        .filter((r) => r.length > 0)
        .slice(0, 3)
    : ['Tinh thần trách nhiệm, đúng giờ', 'Chủ động trong công việc'];

  return (
    <div
      id="job-quick-preview-popup"
      data-testid="job-quick-preview-popup"
      style={{
        position: 'fixed',
        left: leftPos,
        top: topPos,
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        style={{
          width: previewWidth,
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid var(--color-border)',
          boxShadow: '0 16px 36px -4px rgba(48, 40, 58, 0.16), 0 0 1px 1px rgba(89, 70, 117, 0.08)',
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          position: 'relative',
        }}
      >
        {/* Nút đóng nhanh (X) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
          aria-label="Đóng xem nhanh"
          title="Đóng (Esc)"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 30,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#0F172A';
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748B';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={14} />
        </button>

        {/* Top Banner Image (Unsplash) */}
        {job.banner_url && (
          <div
            style={{
              width: 'calc(100% + 44px)',
              height: 70,
              margin: '-20px -22px 4px -22px',
              borderTopLeftRadius: 13,
              borderTopRightRadius: 13,
              overflow: 'hidden',
              position: 'relative',
              background: '#F4F1F8',
            }}
          >
            <img
              src={getJobBannerUrl(job.banner_url, job.category)}
              alt={job.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.92)',
              }}
              onError={(e) => {
                e.currentTarget.src = getJobBannerUrl('', job.category);
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(255,255,255,0.7) 0%, transparent 60%)',
              }}
            />
          </div>
        )}

        {/* Header: Company Logo, Title & Verified */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <CompanyLogo
            src={job.company_logo_url || job.employer_avatar}
            alt={companyDisplayName}
            size={48}
            borderRadius={10}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 240,
                }}
              >
                {companyDisplayName}
              </span>
              <CheckCircle2 size={13} color="#10b981" title="Doanh nghiệp đã xác thực" />
            </div>

            <h4
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: 0,
                lineHeight: 1.35,
              }}
            >
              {job.title}
            </h4>
          </div>
        </div>

        {/* Key Metrics Strip (Salary, Location, Exp, Deadline) */}
        <div
          style={{
            background: '#FBFAFD',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            fontSize: 12.5,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Mức lương</div>
            <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 13.5 }}>{formatSalary()}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Địa điểm</div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {job.location || 'TP. Hồ Chí Minh'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Kinh nghiệm</div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
              {job.experience || 'Không yêu cầu kinh nghiệm'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Hạn ứng tuyển</div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
              {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : '30/11/2026'}
            </div>
          </div>
        </div>

        {/* Short Summary Description */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Mô tả tóm tắt
          </div>
          <p
            style={{
              fontSize: 12.5,
              color: '#475569',
              lineHeight: 1.5,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {shortDescription}
          </p>
        </div>

        {/* Key Highlighted Requirements */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Yêu cầu nổi bật
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {requirementsList.map((req, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: '#334155', lineHeight: 1.4 }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>•</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions: Ứng tuyển & Xem chi tiết */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingTop: 8,
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <button
            type="button"
            onClick={() => onApply && onApply(job)}
            style={{
              flex: 1,
              padding: '9px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--color-primary)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(89, 70, 117, 0.2)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#49375F')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
          >
            <Send size={13} /> Ứng tuyển ngay
          </button>

          <button
            type="button"
            onClick={() => onSelectJob && onSelectJob(job)}
            style={{
              flex: 1,
              padding: '9px 16px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: 'var(--color-text)',
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
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.color = 'var(--color-primary)';
              e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.color = 'var(--color-text)';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            Xem chi tiết <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
