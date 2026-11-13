import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Send, X, BadgeCheck, Clock3, Users, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import CompanyLogo from './CompanyLogo';
import { getJobBannerUrl } from '../../utils/bannerHelper';
import { API_BASE } from '../../config/api';
import {
  formatSalary, salaryCaption, workTypeLabel, postedLabel, deadlineInfo, applyBlockReason, formatSchedules
} from '../../utils/jobDisplay';

// Ca làm việc chỉ có ở API chi tiết → lưu tạm theo Job ID để không gọi lại
const scheduleCache = new Map();

const label = { fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 };
const value = { fontWeight: 700, color: 'var(--color-text)', fontSize: 13, lineHeight: 1.35 };
const sectionTitle = { fontSize: 11.5, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' };

function Metric({ title, children, full }) {
  return (
    <div style={{ minWidth: 0, gridColumn: full ? '1 / -1' : undefined }}>
      <div style={label}>{title}</div>
      {children}
    </div>
  );
}

/**
 * Popup xem nhanh tin tuyển dụng khi rê chuột vào thẻ việc làm (desktop/tablet).
 * Chỉ hiển thị dữ liệu thật của tin; mục nào tin không có thì ẩn.
 */
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
  const panelRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const [schedules, setSchedules] = useState(null); // null = đang tải

  // Tự đóng khi cuộn trang hoặc bấm ESC
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleDismiss = () => onClose && onClose();
    const handleKeyDown = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
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

  // Lấy ca làm việc từ API chi tiết tin (API danh sách không trả về)
  useEffect(() => {
    if (!isOpen || !job?.id) return undefined;
    if (Array.isArray(job.work_schedules)) { setSchedules(job.work_schedules); return undefined; }
    if (scheduleCache.has(job.id)) { setSchedules(scheduleCache.get(job.id)); return undefined; }
    setSchedules(null);
    let alive = true;
    fetch(`${API_BASE}/jobs/${job.id}`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data?.data?.work_schedules) ? data.data.work_schedules : [];
        scheduleCache.set(job.id, list);
        if (alive) setSchedules(list);
      })
      .catch(() => { if (alive) setSchedules([]); });
    return () => { alive = false; };
  }, [isOpen, job?.id, job?.work_schedules]);

  // Đo chiều cao thật để đặt popup vừa khung nhìn
  useLayoutEffect(() => {
    if (panelRef.current) setPanelHeight(panelRef.current.offsetHeight);
  });

  if (typeof window !== 'undefined') {
    window.__quickPreviewRenderState = { isOpen: !!isOpen, jobId: job?.id, hasAnchor: !!anchorRect };
  }
  if (!isOpen || !job || !anchorRect) return null;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--app-header-h'), 10) || 84;

  // Thẻ đã khuất dưới header hoặc đáy màn hình → không hiện
  if (anchorRect.bottom < headerH + 8 || anchorRect.top > viewportHeight - 40) return null;

  // Vị trí: bên phải thẻ nếu đủ chỗ, không thì bên trái; luôn nằm dưới header và trong màn hình
  const width = Math.min(420, viewportWidth - 32);
  let left = anchorRect.right + 12;
  if (left + width > viewportWidth - 16) left = anchorRect.left - width - 12;
  left = Math.max(16, Math.min(left, viewportWidth - width - 16));
  const maxHeight = viewportHeight - headerH - 24;
  const h = Math.min(panelHeight || 480, maxHeight);
  const top = Math.max(headerH + 12, Math.min(anchorRect.top, viewportHeight - h - 12));

  const companyDisplayName = job.company_name || job.employer_name || 'Doanh nghiệp';
  const isVerified = job.employer_verification_status === 'VERIFIED';
  const posted = postedLabel(job);
  const deadline = deadlineInfo(job);
  const blockReason = applyBlockReason(job);
  const scheduleLines = formatSchedules(schedules);
  const workHoursText = job.work_schedule || null;

  const shortDescription = job.description
    ? job.description.split('\n').map(s => s.replace(/^[•\-*]\s*/, '').trim()).find(Boolean)
    : null;
  const requirementsList = job.requirements
    ? job.requirements.split('\n').map(r => r.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean).slice(0, 3)
    : [];

  const titleId = `quick-preview-title-${job.id}`;

  return (
    <div
      id="job-quick-preview-popup"
      data-testid="job-quick-preview-popup"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      style={{ position: 'fixed', left, top, zIndex: 9999, pointerEvents: 'auto' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.97, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        style={{
          width,
          maxHeight,
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid var(--color-border)',
          boxShadow: '0 16px 36px -4px rgba(48, 40, 58, 0.16), 0 0 1px 1px rgba(89, 70, 117, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); if (onClose) onClose(); }}
          aria-label="Đóng xem nhanh"
          title="Đóng (Esc)"
          style={{
            position: 'absolute', top: 10, right: 10, zIndex: 30, width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(0,0,0,0.08)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
          }}
        >
          <X size={15} />
        </button>

        {/* Nội dung cuộn được nếu màn hình thấp; nút hành động luôn ở đáy */}
        <div style={{ overflowY: 'auto', padding: '18px 20px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {job.banner_url && (
            <div style={{ height: 64, margin: '-18px -20px 0', overflow: 'hidden', position: 'relative', background: '#F4F1F8', flexShrink: 0 }}>
              <img
                src={getJobBannerUrl(job.banner_url, job.category)}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.92)' }}
                onError={(e) => { e.currentTarget.src = getJobBannerUrl('', job.category); }}
              />
            </div>
          )}

          {/* Doanh nghiệp, tên việc, ngày đăng, số lượng */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingRight: 28 }}>
            <CompanyLogo src={job.company_logo_url || job.employer_avatar} alt={companyDisplayName} size={48} borderRadius={10} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2, minWidth: 0 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {companyDisplayName}
                </span>
                {isVerified && (
                  <span title="Doanh nghiệp đã được JobNest xác minh" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: '#047857', flexShrink: 0 }}>
                    <BadgeCheck size={13} /> Đã xác minh
                  </span>
                )}
              </div>
              <h4 id={titleId} style={{
                fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1.35,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
              }} title={job.title}>
                {job.title}
              </h4>
              {(posted || Number(job.headcount) > 0) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-muted, #94A3B8)', marginTop: 4 }}>
                  {posted && <span>{posted}</span>}
                  {Number(job.headcount) > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Users size={12} /> Tuyển {job.headcount} người</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {blockReason && (
            <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 12.5, fontWeight: 600 }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} /> {blockReason}
            </div>
          )}

          {/* Thông tin chính: lương, địa điểm, hình thức, kinh nghiệm, cấp bậc, hạn nộp */}
          <div style={{
            background: '#FBFAFD', border: '1px solid var(--color-border)', borderRadius: 10, padding: '12px 14px',
            display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px 14px'
          }}>
            <Metric title="Mức lương">
              <div style={{ ...value, color: 'var(--color-primary)', fontSize: 14 }}>{formatSalary(job)}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{salaryCaption(job)}</div>
            </Metric>
            <Metric title="Địa điểm">
              <div style={{ ...value, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={job.location || ''}>
                {job.location || 'Chưa cập nhật'}
              </div>
            </Metric>
            <Metric title="Hình thức">
              <div style={value}>{workTypeLabel(job)}</div>
            </Metric>
            {job.experience && (
              <Metric title="Kinh nghiệm"><div style={value}>{job.experience}</div></Metric>
            )}
            {job.level && (
              <Metric title="Cấp bậc"><div style={value}>{job.level}</div></Metric>
            )}
            {deadline && (
              <Metric title="Hạn ứng tuyển">
                <div style={{ ...value, color: deadline.expired ? '#991B1B' : deadline.urgent ? '#C2410C' : value.color }}>
                  {deadline.date}
                  {!deadline.expired && deadline.urgent && (
                    <span style={{ fontWeight: 600, fontSize: 11.5 }}> · {deadline.daysLeft === 0 ? 'hết hạn hôm nay' : `còn ${deadline.daysLeft} ngày`}</span>
                  )}
                </div>
              </Metric>
            )}
          </div>

          {/* Ca làm việc (từ bảng ca làm) hoặc thời gian làm việc (mô tả của nhà tuyển dụng) */}
          {(scheduleLines.length > 0 || workHoursText) && (
            <div>
              <div style={sectionTitle}>{scheduleLines.length > 0 ? 'Ca làm việc' : 'Thời gian làm việc'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {(scheduleLines.length > 0 ? scheduleLines : [workHoursText]).map((line) => (
                  <div key={line} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, color: '#334155', lineHeight: 1.45 }}>
                    <Clock3 size={13} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {schedules === null && !workHoursText && (
            <div style={{ fontSize: 12, color: 'var(--color-text-muted, #94A3B8)' }}>Đang tải ca làm việc…</div>
          )}

          {shortDescription && (
            <div>
              <div style={sectionTitle}>Mô tả tóm tắt</div>
              <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {shortDescription}
              </p>
            </div>
          )}

          {requirementsList.length > 0 && (
            <div>
              <div style={sectionTitle}>Yêu cầu nổi bật</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {requirementsList.map((req, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, color: '#334155', lineHeight: 1.45 }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>•</span>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hành động */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 20px 16px', borderTop: '1px solid #F1F5F9', background: '#ffffff', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => { if (!blockReason && onApply) onApply(job); }}
            disabled={Boolean(blockReason)}
            title={blockReason || 'Ứng tuyển công việc này'}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none',
              background: blockReason ? '#E2E8F0' : 'var(--color-primary)', color: blockReason ? '#64748B' : '#ffffff',
              fontSize: 13, fontWeight: 700, cursor: blockReason ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {blockReason ? 'Đã ngừng nhận hồ sơ' : <><Send size={13} /> Ứng tuyển ngay</>}
          </button>
          <button
            type="button"
            onClick={() => onSelectJob && onSelectJob(job)}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF',
              color: 'var(--color-text)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            Xem chi tiết <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
