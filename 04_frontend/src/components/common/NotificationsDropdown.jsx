import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, Eye, Clock, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { API_BASE } from '../../config/api';

export default function NotificationsDropdown({ 
  isOpen, 
  onClose, 
  currentUser, 
  onSelectNotification, 
  onViewAll 
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/notifications?limit=20`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
        setUnreadCount(data.unread_count || data.data.filter(n => !n.read_at).length);
      }
    } catch (err) {
      console.error('Lỗi tải notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, currentUser]);

  const markAllAsRead = async () => {
    if (!currentUser?.token) return;
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Lỗi markAllAsRead:', err);
    }
  };

  const handleItemClick = async (item) => {
    if (!item.read_at && currentUser?.token) {
      try {
        await fetch(`${API_BASE}/notifications/${item.id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Lỗi đánh dấu đã đọc:', err);
      }
    }
    if (onSelectNotification) onSelectNotification(item);
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 110,
        }}
      />

      {/* Dropdown Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '390px',
          maxWidth: '92vw',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.16), 0 4px 10px rgba(0,0,0,0.06)',
          zIndex: 120,
          overflow: 'hidden',
          fontFamily: 'inherit',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--color-lavender-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-background)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#F9E5DC',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bell size={16} />
            </div>
            <div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>
                THÔNG BÁO {unreadCount > 0 ? `(${unreadCount})` : ''}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  fontSize: 12,
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0,
                }}
              >
                <Check size={13} /> Đã đọc hết
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {loading && notifications.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748B', fontSize: 13 }}>
              Đang tải thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94A3B8' }}>
              <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>Bạn chưa có thông báo nào</div>
            </div>
          ) : (
            notifications.map((item) => {
              const isRead = !!item.read_at;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ background: 'var(--color-background)' }}
                  onClick={() => handleItemClick(item)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-lavender-surface)',
                    display: 'flex',
                    gap: 12,
                    cursor: 'pointer',
                    background: isRead ? '#ffffff' : '#f0fdf4',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: item.type?.includes('ACCEPTED') ? '#dcfce7' : item.type?.includes('PROPOSAL') ? '#f3e8ff' : '#e0f2fe',
                    color: item.type?.includes('ACCEPTED') ? '#15803d' : item.type?.includes('PROPOSAL') ? '#6b21a8' : '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {item.type?.includes('ACCEPTED') ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: isRead ? 600 : 700, color: 'var(--color-text)' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {formatTimeAgo(item.created_at)}
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45, margin: 0 }}>
                      {item.body || item.content}
                    </p>
                  </div>

                  {!isRead && (
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#16a34a',
                      marginTop: 6,
                      flexShrink: 0,
                    }} />
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px',
          background: 'var(--color-background)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <button
            type="button"
            onClick={() => {
              if (onViewAll) onViewAll();
              onClose();
            }}
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--color-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Xem tất cả thông báo <ExternalLink size={12} />
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 12,
              color: '#64748B',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </>
  );
}
