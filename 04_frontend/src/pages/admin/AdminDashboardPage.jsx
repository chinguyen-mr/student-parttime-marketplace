import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, FileText, AlertTriangle, ShieldCheck, 
  Clock, CheckCircle2, XCircle, ArrowRight, RefreshCw, 
  TrendingUp, BarChart2, Shield, Eye, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';
import { describeAdminLog, TONE_STYLE } from '../../utils/adminLogDisplay';

export default function AdminDashboardPage({
  currentUser,
  onNavigateTab,
  showToast
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [statsData, setStatsData] = useState({
    users: [],
    jobs: [],
    applications: [],
    reports: [],
    jobs_by_type: [],
    recent_activities: []
  });

  const fetchStats = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setApiError(null);

      const headers = { Authorization: `Bearer ${currentUser?.token}` };
      const res = await fetch(`${API_BASE}/admin/stats`, { headers });
      const data = await res.json();

      if (data.success && data.data) {
        setStatsData(data.data);
      } else {
        throw new Error(data.message || 'Không thể tải thống kê quản trị');
      }
    } catch (err) {
      console.error('Lỗi tải thống kê Admin Dashboard:', err);
      setApiError('Không thể kết nối đến máy chủ quản trị. Hiển thị dữ liệu lưu tạm.');
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi tải thống kê hệ thống'), 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentUser]);

  // Tính toán KPI số liệu chuẩn xác
  const studentCount = statsData.users.filter(u => u.role === 'STUDENT').reduce((acc, cur) => acc + parseInt(cur.count, 10), 0);
  const employerCount = statsData.users.filter(u => u.role === 'EMPLOYER').reduce((acc, cur) => acc + parseInt(cur.count, 10), 0);
  const totalJobsCount = statsData.jobs.reduce((acc, cur) => acc + parseInt(cur.count, 10), 0);
  const pendingJobsCount = statsData.jobs.filter(j => j.moderation_status === 'PENDING').reduce((acc, cur) => acc + parseInt(cur.count, 10), 0);
  const totalAppsCount = statsData.applications.reduce((acc, cur) => acc + parseInt(cur.count, 10), 0);
  const openReportsCount = statsData.reports.filter(r => r.status === 'OPEN').reduce((acc, cur) => acc + parseInt(cur.count, 10), 0);

  const formatTime = (ts) => {
    if (!ts) return 'Vừa xong';
    try {
      const d = new Date(ts);
      return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    } catch (e) {
      return ts;
    }
  };

  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* ================= TOP HEADER BREADCRUMB ================= */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              CỔNG QUẢN TRỊ VIÊN HỆ THỐNG
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Tổng quan quản trị
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="secondary"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Đang cập nhật...' : 'Làm mới'}</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => onNavigateTab && onNavigateTab('moderation')}
            style={{ padding: '8px 18px', fontSize: 13, gap: 6 }}
          >
            <ShieldCheck size={15} />
            <span>Duyệt tin ({pendingJobsCount})</span>
          </Button>
        </div>
      </div>

      {apiError && (
        <div style={{
          background: '#FEF2F2',
          border: '1.5px solid #FCA5A5',
          borderRadius: 12,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#B91C1C',
          fontSize: 13.5
        }}>
          <AlertCircle size={18} />
          <span>{apiError}</span>
        </div>
      )}

      {/* ================= 1. 6 THẺ KPI STATS (CHUẨN WIREFRAME WF-A01) ================= */}
      <div className="admin-kpi-grid">
        {/* KPI 1: Student */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          border: '1.5px solid #000000',
          padding: '16px 18px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 126,
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Student</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={17} color="#4F46E5" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, marginBottom: 4 }}>
              {loading ? '...' : studentCount}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Tài khoản sinh viên
          </div>
        </div>

        {/* KPI 2: Employer */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          border: '1.5px solid #000000',
          padding: '16px 18px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 126,
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Employer</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={17} color="#059669" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, marginBottom: 4 }}>
              {loading ? '...' : employerCount}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Doanh nghiệp & NTD
          </div>
        </div>

        {/* KPI 3: Tổng Job */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          border: '1.5px solid #000000',
          padding: '16px 18px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 126,
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Tổng Job</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F4F1F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={17} color="#7565A8" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, marginBottom: 4 }}>
              {loading ? '...' : totalJobsCount}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Tin đã tạo trên hệ thống
          </div>
        </div>

        {/* KPI 4: Tổng Application */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          border: '1.5px solid #000000',
          padding: '16px 18px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 126,
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Tổng Application</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={17} color="#0284C7" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, marginBottom: 4 }}>
              {loading ? '...' : totalAppsCount}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Hồ sơ đã tiếp nhận
          </div>
        </div>

        {/* KPI 5: Job chờ duyệt */}
        <div 
          style={{
            background: pendingJobsCount > 0 ? '#FEF2F2' : '#ffffff',
            borderRadius: 12,
            border: pendingJobsCount > 0 ? '1.5px solid #EF4444' : '1.5px solid #000000',
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 126,
            boxSizing: 'border-box',
            cursor: 'pointer'
          }}
          onClick={() => onNavigateTab && onNavigateTab('moderation')}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: pendingJobsCount > 0 ? '#DC2626' : '#475569', whiteSpace: 'nowrap' }}>Job chờ duyệt</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={17} color="#DC2626" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: pendingJobsCount > 0 ? '#DC2626' : '#0F172A', lineHeight: 1.15, marginBottom: 4 }}>
              {loading ? '...' : pendingJobsCount}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: pendingJobsCount > 0 ? '#B91C1C' : '#64748B', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {pendingJobsCount > 0 ? 'Cần duyệt ngay →' : 'Không có tin chờ duyệt'}
          </div>
        </div>

        {/* KPI 6: Report chờ xử lý */}
        <div 
          style={{
            background: openReportsCount > 0 ? '#FFFBEB' : '#ffffff',
            borderRadius: 12,
            border: openReportsCount > 0 ? '1.5px solid #F59E0B' : '1.5px solid #000000',
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 126,
            boxSizing: 'border-box',
            cursor: 'pointer'
          }}
          onClick={() => onNavigateTab && onNavigateTab('reports')}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: openReportsCount > 0 ? '#D97706' : '#475569', whiteSpace: 'nowrap' }}>Report chờ xử lý</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={17} color="#D97706" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: openReportsCount > 0 ? '#D97706' : '#0F172A', lineHeight: 1.15, marginBottom: 4 }}>
              {loading ? '...' : openReportsCount}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: openReportsCount > 0 ? '#B45309' : '#64748B', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {openReportsCount > 0 ? 'Cần giải quyết →' : 'Đã xử lý tất cả'}
          </div>
        </div>
      </div>

      {/* ================= 2. 2 KHỐI PHÂN PHỐI CHUẨN WIREFRAME WF-A01 ================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 20,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Khối 1: Người dùng */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1.5px solid #000000',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Phân bố người dùng
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('users')}
                style={{ fontSize: 12.5, fontWeight: 700, color: '#7565A8', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                Quản lý người dùng →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Sinh viên', count: studentCount, color: '#7565A8', bg: '#F1EEF8' },
                { label: 'Nhà tuyển dụng', count: employerCount, color: '#059669', bg: '#ECFDF5' },
                { label: 'Quản trị viên', count: statsData.users.filter(u => u.role === 'ADMIN').reduce((acc, cur) => acc + parseInt(cur.count, 10), 0), color: '#DC2626', bg: '#FEF2F2' }
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: 48,
                  padding: '12px 16px',
                  background: item.bg,
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  boxSizing: 'border-box'
                }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>{item.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: item.color }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Khối 2: Job theo loại */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1.5px solid #000000',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Tin tuyển dụng theo loại
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('moderation')}
                style={{ fontSize: 12.5, fontWeight: 700, color: '#7565A8', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                Hàng đợi duyệt →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { type: 'PART_TIME', label: 'Bán thời gian (Part-time)', count: statsData.jobs_by_type.find(j => j.work_type === 'PART_TIME')?.count || 0, color: '#7565A8' },
                { type: 'FULL_TIME', label: 'Toàn thời gian (Full-time)', count: statsData.jobs_by_type.find(j => j.work_type === 'FULL_TIME')?.count || 0, color: '#E5A34C' }
              ].map(item => (
                <div key={item.type} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: 48,
                  padding: '12px 16px',
                  background: '#F8FAFC',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  boxSizing: 'border-box'
                }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>{item.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: item.color }}>{item.count} tin</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. HOẠT ĐỘNG GẦN ĐÂY ================= */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1.5px solid #000000',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Hoạt động quản trị gần đây
          </h3>
          <button
            onClick={() => onNavigateTab && onNavigateTab('logs')}
            style={{ fontSize: 12.5, fontWeight: 700, color: '#4F46E5', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            Xem toàn bộ nhật ký →
          </button>
        </div>

        {statsData.recent_activities.length === 0 ? (
          <EmptyState
            title="Chưa có nhật ký hoạt động nào"
            description="Các thao tác duyệt tin, khóa tài khoản hoặc xử lý báo cáo sẽ xuất hiện tại đây."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #CBD5E1', color: '#64748B', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px' }}>Thời gian</th>
                  <th style={{ padding: '8px 12px' }}>Người thực hiện</th>
                  <th style={{ padding: '8px 12px' }}>Hành động</th>
                  <th style={{ padding: '8px 12px' }}>Đối tượng</th>
                  <th style={{ padding: '8px 12px' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {statsData.recent_activities.map(log => {
                  const d = describeAdminLog(log); // câu tiếng Việt thay cho mã nội bộ / JSON thô
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {formatTime(log.created_at)}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#0F172A' }}>
                        {log.admin_name}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, display: 'inline-block', ...TONE_STYLE[d.tone] }}>
                          {d.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#334155', fontWeight: 600 }}>
                        {d.target || '—'}
                      </td>
                      <td title={d.detail} style={{ padding: '12px', color: '#64748B', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.detail || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

