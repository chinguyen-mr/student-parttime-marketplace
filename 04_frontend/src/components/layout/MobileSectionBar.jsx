import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Thanh "Mục đang xem ▾" cho trang Sinh viên / Nhà tuyển dụng / Admin trên điện thoại & tablet (≤ 860px).
 * Bấm để mở/đóng danh sách mục (sidebar có class mobile-open). Trên màn rộng thanh này ẩn bằng CSS.
 */
export default function MobileSectionBar({ icon: Icon, label, count, open, onToggle, controlsId, hint = 'Chọn mục' }) {
  return (
    <button
      type="button"
      className="jn-section-bar"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controlsId}
    >
      <span className="jn-section-bar-icon" aria-hidden="true">{Icon && <Icon size={18} />}</span>
      <span className="jn-section-bar-text">
        <span className="jn-section-bar-hint">{hint}</span>
        <span className="jn-section-bar-label">{label}</span>
      </span>
      {count ? <span className="jn-section-bar-count">{count}</span> : null}
      <ChevronDown size={20} className="jn-section-bar-chevron" aria-hidden="true" />
    </button>
  );
}
