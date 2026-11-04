import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle2, Clock, Check, RefreshCw, Filter, 
  Briefcase, Send, Star, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';

export default function NotificationsPage({ currentUser, showToast, onSelectNotification }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // ALL, UNREAD, APPLICATION, PROPOSAL, ASSIGNMENT
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/notifications?page=1&limit=50`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
        setUnreadCount(data.unread_count || data.data.filter(n => !n.read_at).length);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(formatApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const markAllAsRead = async () => {
    if (!currentUser?.token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        setUnreadCount(0);
        if (showToast) showToast('Đã đánh dấu tất cả thông báo là đã đọc!');
      }
    } catch (err) {
      console.error(err);
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
        console.error(err);
      }
    }
    if (onSelectNotification) onSelectNotification(item);
  };

  const filtered = notifications.filter(n => {
    if (filterType === 'UNREAD') return !n.read_at;
    if (filterType === 'APPLICATION') return n.type?.includes('APPLICATION');
    if (filterType === 'PROPOSAL') return n.type?.includes('PROPOSAL');
    if (filterType === 'ASSIGNMENT') return n.type?.includes('ASSIGNMENT');
    return true;
  });

  return (
    <div>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
        borderRadius: 14,
        padding: '28px 30px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>
              🔔 TRUNG TÂM THÔNG BÁO HỆ THỐNG
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
              TẤT CẢ THÔNG BÁO ({notifications.length})
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: '#CBD5E1', maxWidth: 640 }}>
              Cập nhật tức thời về tình trạng nộp đơn ứng tuyển, xét duyệt đề xuất Freelance và phân công hợp đồng công việc.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                onClick={markAllAsRead}
                style={{ background: '#ffffff', color: '#1E293B', border: 'none', padding: '8px 16px', fontSize: 13, gap: 6, fontWeight: 700 }}
              >
                <Check size={14} /> Đánh dấu đã đọc ({unreadCount})
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={fetchNotifications}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', padding: '8px 16px', fontSize: 13, gap: 6, fontWeight: 700 }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { key: 'ALL', label: `Tất cả (${notifications.length})` },
          { key: 'UNREAD', label: `Chưa đọc (${unreadCount})` },
          { key: 'APPLICATION', label: 'Ứng tuyển Part-time' },
          { key: 'PROPOSAL', label: 'Đề xuất Freelance' },
          { key: 'ASSIGNMENT', label: 'Hợp đồng công việc' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterType(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: filterType === tab.key ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: filterType === tab.key ? 'var(--color-primary)' : '#ffffff',
              color: filterType === tab.key ? '#ffffff' : 'var(--color-text)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading && notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
          Đang tải danh sách thông báo...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          padding: '48px 20px',
          textAlign: 'center',
        }}>
          <Bell size={44} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
            Không có thông báo nào trong danh mục này
          </h4>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(item => {
            const isRead = !!item.read_at;
            return (
              <motion.div
                key={item.id}
                whileHover={{ x: 2 }}
                onClick={() => handleItemClick(item)}
                style={{
                  background: isRead ? '#ffffff' : '#F0FDF4',
                  borderRadius: 10,
                  border: isRead ? '1px solid var(--color-border)' : '1.5px solid #BBF7D0',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: item.type?.includes('ACCEPTED') ? '#DCFCE7' : item.type?.includes('PROPOSAL') ? '#F3E8FF' : '#E0F2FE',
                  color: item.type?.includes('ACCEPTED') ? '#15803D' : item.type?.includes('PROPOSAL') ? '#6B21A8' : '#0369A1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {item.type?.includes('ACCEPTED') ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <h4 style={{ fontSize: 14.5, fontWeight: isRead ? 600 : 800, color: 'var(--color-text)', margin: 0 }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>
                      {new Date(item.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: '#334155', margin: 0, lineHeight: 1.5 }}>
                    {item.body || item.content}
                  </p>
                </div>

                {!isRead && (
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#16A34A',
                    flexShrink: 0,
                  }} />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
