import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, RefreshCw, Calendar, 
  User, Shield, FileText, CheckCircle2, Lock, Tag
} from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';

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

  const filteredLogs = logs.filter(log => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    const adminMatch = (log.admin_name || '').toLowerCase().includes(kw);
    const actionMatch = (log.action || '').toLowerCase().includes(kw);
    const targetMatch = (log.target_type || '').toLowerCase().includes(kw);
    const metaMatch = JSON.stringify(log.metadata || '').toLowerCase().includes(kw);
    return adminMatch || actionMatch || targetMatch || metaMatch;
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
            placeholder="Tìm theo Admin, hành động, ID đối tượng, metadata..."
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
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Action type:</span>
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
            <option value="APPROVE_JOB">APPROVE_JOB (Duyệt tin)</option>
            <option value="REJECT_JOB">REJECT_JOB (Từ chối tin)</option>
            <option value="BAN_USER">BAN_USER (Khóa tài khoản)</option>
            <option value="UNBAN_USER">UNBAN_USER (Mở khóa tài khoản)</option>
            <option value="VERIFY_EMPLOYER">VERIFY_EMPLOYER (Cấp tick xanh)</option>
            <option value="RESOLVE_REPORT">RESOLVE_REPORT (Xử lý báo cáo)</option>
            <option value="CREATE_CATEGORY">CREATE_CATEGORY (Thêm ngành nghề)</option>
            <option value="SYSTEM_INIT">SYSTEM_INIT (Khởi tạo hệ thống)</option>
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
                  <th style={{ padding: '14px 16px', width: 170 }}>Timestamp</th>
                  <th style={{ padding: '14px 16px', width: 180 }}>Admin</th>
                  <th style={{ padding: '14px 16px', width: 160 }}>Action</th>
                  <th style={{ padding: '14px 16px', width: 140 }}>Target</th>
                  <th style={{ padding: '14px 16px' }}>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
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
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 800,
                          background: log.action.includes('APPROVE') || log.action.includes('VERIFY') ? '#DCFCE7' :
                                      log.action.includes('REJECT') || log.action.includes('BAN') ? '#FEE2E2' : '#F1F5F9',
                          color: log.action.includes('APPROVE') || log.action.includes('VERIFY') ? '#15803D' :
                                 log.action.includes('REJECT') || log.action.includes('BAN') ? '#B91C1C' : '#0F172A',
                          border: `1px solid ${
                            log.action.includes('APPROVE') || log.action.includes('VERIFY') ? '#86EFAC' :
                            log.action.includes('REJECT') || log.action.includes('BAN') ? '#FCA5A5' : '#CBD5E1'
                          }`
                        }}>
                          {log.action}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>
                          {log.target_type} #{log.target_id}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: '#334155', fontSize: 13, lineHeight: 1.5 }}>
                        {(() => {
                          if (!log.metadata) return '—';
                          if (typeof log.metadata === 'string') return log.metadata;
                          const meta = log.metadata;
                          if (meta.reason) return `Lý do: ${meta.reason}`;
                          if (meta.note) return `Ghi chú: ${meta.note}`;
                          if (meta.title) return `Tiêu đề: ${meta.title}`;
                          if (meta.role) return `Vai trò: ${meta.role}`;
                          if (meta.status) return `Trạng thái: ${meta.status}`;
                          return Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join(', ');
                        })()}
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

