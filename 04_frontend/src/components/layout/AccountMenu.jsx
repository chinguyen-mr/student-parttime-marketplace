import React, { useEffect, useRef, useState } from 'react';
import { resolveFileUrl } from '../../config/api';
import {
  LayoutDashboard, User, Calendar, Bookmark, Clock, Star, Settings, LogOut, ChevronDown
} from 'lucide-react';

// Mục menu theo vai trò. `tab` là tab con trong trang quản lý tương ứng.
const MENU_BY_ROLE = {
  STUDENT: [
    { tab: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { tab: 'profile', label: 'Hồ sơ & CV', icon: User },
    { tab: 'availability', label: 'Lịch rảnh & Gợi ý', icon: Calendar },
    { tab: 'saved_jobs', label: 'Việc làm đã lưu', icon: Bookmark },
    { tab: 'applications', label: 'Lịch sử ứng tuyển', icon: Clock },
    { tab: 'reviews', label: 'Đánh giá & Phản hồi', icon: Star },
    { tab: 'settings', label: 'Cài đặt tài khoản', icon: Settings },
  ],
  EMPLOYER: [
    { tab: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
  ],
  ADMIN: [
    { tab: 'dashboard', label: 'Trang quản trị', icon: LayoutDashboard },
  ],
};

const ROLE_LABEL = { STUDENT: 'Sinh viên', EMPLOYER: 'Nhà tuyển dụng', ADMIN: 'Quản trị viên' };

/**
 * Avatar tài khoản trên header: rê chuột (hoặc bấm trên điện thoại) để mở menu,
 * nút Đăng xuất nằm cuối menu.
 */
export default function AccountMenu({ currentUser, onNavigate, onLogout }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const rootRef = useRef(null);
  const role = currentUser?.role || 'STUDENT';
  const items = MENU_BY_ROLE[role] || [];
  const initial = currentUser?.full_name?.charAt(0) || 'U';

  const openNow = () => { clearTimeout(closeTimer.current); setOpen(true); };
  // Trễ nhẹ để di chuột từ avatar xuống menu không bị đóng giữa chừng
  const closeSoon = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setOpen(false), 180); };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onClickOutside = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const go = (tab) => { setOpen(false); onNavigate && onNavigate(tab); };

  return (
    <div ref={rootRef} style={{ position: 'relative' }} onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={currentUser?.full_name || 'Tài khoản'}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: 0,
          background: 'none', border: 'none', cursor: 'pointer'
        }}
      >
        <span style={{
          width: 42, height: 42, borderRadius: '50%', overflow: 'hidden',
          background: role === 'STUDENT' ? '#7565A8' : '#000000', color: '#ffffff',
          border: '1.5px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {currentUser?.avatar_url
            ? <img src={resolveFileUrl(currentUser.avatar_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initial}
        </span>
        <ChevronDown size={14} color="#475569" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 260, zIndex: 1000,
            background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 12,
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.14)', overflow: 'hidden'
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: '#FAF8FF' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.full_name || 'Người dùng'}
            </div>
            {currentUser?.email && (
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.email}
              </div>
            )}
            <span style={{
              display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, color: '#594675',
              background: '#EDE9FE', borderRadius: 999, padding: '2px 10px'
            }}>
              {ROLE_LABEL[role] || role}
            </span>
          </div>

          <div style={{ padding: 6 }}>
            {items.map(({ tab, label, icon: Icon }) => (
              <button
                key={tab}
                type="button"
                role="menuitem"
                onClick={() => go(tab)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                  border: 'none', borderRadius: 8, background: 'transparent', cursor: 'pointer',
                  fontSize: 13.5, fontWeight: 600, color: '#334155', textAlign: 'left'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F1EEF8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={16} color="#7565A8" /> {label}
              </button>
            ))}
          </div>

          <div style={{ padding: 6, borderTop: '1px solid #F1F5F9' }}>
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); onLogout && onLogout(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                border: 'none', borderRadius: 8, background: 'transparent', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 700, color: '#B91C1C', textAlign: 'left'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
