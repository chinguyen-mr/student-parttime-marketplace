import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, RefreshCw, Calendar, 
  User, Shield, FileText, CheckCircle2, Lock, Tag
} from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';
import { describeAdminLog, TONE_STYLE, ADMIN_LOG_FILTERS } from '../../utils/adminLogDisplay';

export default function AdminLogsPage({
  currentUser,
  showToast
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);

  // Filters (WF-A08: Admin, Action type, Khoảng ngày)
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Fetch Logs
  const fetchLogs = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (actionFilter !== 'ALL') params.append('action', actionFilter);
      params.append('limit', '100');

      const headers = { Authorization: `Bearer ${currentUser?.token}` };
      const res = await fetch(`${API_BASE}/admin/logs?${params.toString()}`, { headers });
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setLogs(data.data);
      } else {
        throw new Error(data.message || 'Không thể tải nhật ký hoạt động');
      }
    } catch (err) {
      console.error('Lỗi tải nhật ký Admin Logs:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi tải nhật ký hoạt động'), 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, currentUser]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        day: '2-digit', month: '2-digit', year: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Tìm trên chính nội dung tiếng Việt đang hiển thị (không tìm theo mã nội bộ)
  const filteredLogs = logs.filter(log => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    const d = describeAdminLog(log);
    return [log.admin_name, d.label, d.target, d.detail].some(v => (v || '').toLowerCase().includes(kw));
  });

  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              NHẬT KÝ HỆ THỐNG
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Nhật ký hoạt động quản trị
          </h1>
        </div>

        <Button
          variant="secondary"
          onClick={() => fetchLogs(true)}
          disabled={refreshing}
          style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Làm mới ({filteredLogs.length})</span>
        </Button>
      </div>

      {/* Bộ lọc chuẩn Wireframe WF-A08: Admin, Action type, Khoảng ngày */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1.5px solid #000000',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <Search size={16} color="#64748B" />
          <input
            type="text"
            placeholder="Tìm theo người thực hiện, hành động, đối tượng, lý do..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 380,
              height: 38,
              borderRadius: 8,
              border: '1.5px solid #CBD5E1',
              padding: '0 12px',
              fontSize: 13
            }}
          />
        </div>

        {/* Action Type filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Loại hành động:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              height: 38,
              borderRadius: 8,
              border: '1.5px solid #000000',
              padding: '0 10px',
              fontSize: 13,
              fontWeight: 600,
              background: '#ffffff'
            }}
          >
            <option value="ALL">Tất cả hành động</option>
            {ADMIN_LOG_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>

      {/* Bảng Audit Log chuẩn Wireframe WF-A08 */}
      {/* Cột: Timestamp | Admin | Action | Target Type | Target ID | Metadata */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1.5px solid #000000',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Đang tải nhật ký kiểm duyệt và phân quyền...</div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            title="Không tìm thấy nhật ký phù hợp"
            description="Hãy thử bỏ lọc hoặc thay đổi từ khóa tìm kiếm."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #000000', fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}>
                  <th style={{ padding: '14px 16px', width: 170 }}>Thời gian</th>
                  <th style={{ padding: '14px 16px', width: 180 }}>Người thực hiện</th>
                  <th style={{ padding: '14px 16px', width: 200 }}>Hành động</th>
                  <th style={{ padding: '14px 16px', width: 220 }}>Đối tượng</th>
                  <th style={{ padding: '14px 16px' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const d = describeAdminLog(log);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {formatDate(log.created_at)}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>
                          {log.admin_name || 'Quản trị viên'}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                          {log.admin_email}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, display: 'inline-block', ...TONE_STYLE[d.tone] }}>
                          {d.label}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A', overflowWrap: 'anywhere' }}>
                        {d.target || '—'}
                      </td>

                      <td style={{ padding: '14px 16px', color: '#334155', fontSize: 13, lineHeight: 1.5, overflowWrap: 'anywhere' }}>
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

