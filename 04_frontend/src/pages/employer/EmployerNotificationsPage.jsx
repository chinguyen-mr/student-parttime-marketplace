import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle2, Clock, FileText, Users, 
  Briefcase, CheckCheck, RefreshCw, ChevronRight, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';

export default function EmployerNotificationsPage({
  currentUser,
  showToast,
  onNavigateTab
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  // Fetch Employer Notifications (GET /api/notifications)
  const fetchNotifications = async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.warn('Lỗi fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  // Mark all notifications as read (PATCH /api/notifications/read-all)
  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
        setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err), 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  // Click single notification
  const handleClickNotification = async (item) => {
    // If unread, mark it as read
    if (!item.read_at) {
      try {
        await fetch(`${API_BASE}/notifications/${item.id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n));
      } catch (e) {
        // ignore
      }
    }

    // Navigate according to type
    if (onNavigateTab) {
      if (item.type === 'APPLICATION' || item.title?.includes('ứng tuyển') || item.body?.includes('ứng tuyển')) {
        onNavigateTab('applicants');
      } else if (item.type === 'PROPOSAL' || item.title?.includes('đề xuất') || item.body?.includes('chào giá')) {
        onNavigateTab('employer_proposals');
      } else if (item.type === 'ASSIGNMENT' || item.type === 'DELIVERABLE' || item.title?.includes('bàn giao')) {
        onNavigateTab('employer_assignments');
      } else {
        onNavigateTab('employer_jobs');
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const filteredNotifications = notifications.filter(item => {
    if (filterType === 'UNREAD') return !item.read_at;
    if (filterType === 'READ') return !!item.read_at;
    if (filterType === 'APPLICATION') return item.type === 'APPLICATION' || item.title?.includes('ứng tuyển') || item.body?.includes('ứng tuyển');
    if (filterType === 'PROPOSAL') return item.type === 'PROPOSAL' || item.title?.includes('đề xuất') || item.body?.includes('chào giá') || item.body?.includes('báo giá');
    if (filterType === 'JOB') return item.type === 'JOB' || item.title?.includes('tin tuyển dụng') || item.body?.includes('kiểm duyệt');
    if (filterType === 'ASSIGNMENT') return item.type?.includes('ASSIGNMENT') || item.title?.includes('công việc') || item.body?.includes('hợp đồng');
    if (filterType === 'DELIVERABLE') return item.type === 'DELIVERABLE' || item.title?.includes('bàn giao') || item.body?.includes('sản phẩm');
    if (filterType === 'VERIFICATION') return item.type === 'VERIFICATION' || item.title?.includes('xác thực') || item.body?.includes('xác minh');
    if (filterType === 'SYSTEM') return item.type === 'SYSTEM' || item.title?.includes('hệ thống') || item.body?.includes('chính sách');
    return true;
  });

  return (
    <div style={{ width: '100%', maxWidth: 'none', paddingBottom: 60 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
            THÔNG BÁO DOANH NGHIỆP (WF-E12)
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            Thông báo hoạt động tuyển dụng
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={fetchNotifications}
            disabled={loading}
            style={{
              background: '#ffffff',
              border: '1.5px solid var(--color-border)',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <CheckCheck size={16} /> Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs matching WF-E12: All, Unread, Read, Application, Proposal, Job, Assignment, Deliverable, Verification, System */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {[
          { id: 'ALL', label: 'Tất cả' },
          { id: 'UNREAD', label: `Chưa đọc (${unreadCount})` },
          { id: 'READ', label: 'Đã đọc' },
          { id: 'APPLICATION', label: 'Ứng tuyển' },
          { id: 'PROPOSAL', label: 'Đề xuất Freelance' },
          { id: 'JOB', label: 'Tin đăng' },
          { id: 'ASSIGNMENT', label: 'Hợp đồng' },
          { id: 'DELIVERABLE', label: 'Nghiệm thu' },
          { id: 'VERIFICATION', label: 'Xác thực' },
          { id: 'SYSTEM', label: 'Hệ thống' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            style={{
              background: filterType === tab.id ? 'var(--color-primary)' : '#ffffff',
              color: filterType === tab.id ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: filterType === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
              borderRadius: 20,
              padding: '5px 12px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Table matching WF-E12 */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 60, background: '#ffffff', borderRadius: 12, border: '1px solid var(--color-border)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title="Không tìm thấy thông báo phù hợp"
          description={
            notifications.length === 0
              ? "Các cập nhật hồ sơ ứng tuyển, đề xuất freelance và tiến độ công việc sẽ xuất hiện ở đây."
              : "Không có thông báo nào trong bộ lọc này."
          }
        />
      ) : (
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#FAFAFD', borderBottom: '2px solid #F1F5F9', color: 'var(--color-text-secondary)', fontSize: 12.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Nội dung thông báo</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, width: 140 }}>Thời gian</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, width: 130 }}>Trạng thái</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right', width: 90 }}>Xem</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map((n) => {
                const isUnread = !n.read_at;
                return (
                  <tr
                    key={n.id}
                    onClick={() => handleClickNotification(n)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: isUnread ? '#FDFBF7' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8F7FB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isUnread ? '#FDFBF7' : 'transparent'}
                  >
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: isUnread ? 'var(--color-primary-light)' : '#F1F5F9',
                          color: isUnread ? 'var(--color-primary)' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Bell size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: isUnread ? 800 : 600, color: 'var(--color-text)', marginBottom: 2 }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            {n.body || n.message}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px 18px', color: 'var(--color-text-secondary)', fontSize: 12.5 }}>
                      {n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN') : 'Hôm nay'}
                    </td>

                    <td style={{ padding: '16px 18px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 14,
                        fontSize: 11.5,
                        fontWeight: 700,
                        background: isUnread ? '#FEF3C7' : '#F1F5F9',
                        color: isUnread ? '#B45309' : '#64748B'
                      }}>
                        {isUnread ? 'Chưa đọc' : 'Đã đọc'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                      <ChevronRight size={16} color="var(--color-text-secondary)" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
