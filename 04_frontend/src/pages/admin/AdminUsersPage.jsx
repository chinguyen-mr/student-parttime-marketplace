import React, { useState, useEffect, useRef } from 'react';
import { Search, ShieldCheck, Lock, Unlock, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import ExportMenu from '../../components/common/ExportMenu';
import { API_BASE, formatApiError } from '../../config/api';

const ROLE_LABEL = { STUDENT: 'Sinh viên', EMPLOYER: 'Nhà tuyển dụng', ADMIN: 'Quản trị viên' };
const ROLE_BADGE = {
  STUDENT: { background: '#F1EEF8', color: '#4C3D7A', border: '1px solid #C4B5FD' },
  EMPLOYER: { background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7' },
  ADMIN: { background: '#FEF2F2', color: '#7F1D1D', border: '1px solid #FCA5A5' }
};

export default function AdminUsersPage({
  currentUser,
  showToast
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);

  // Filters
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const totalPages = Math.ceil(users.length / pageSize) || 1;
  const paginatedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Modal Khóa / Mở khóa
  const [selectedUserForAction, setSelectedUserForAction] = useState(null);
  const [actionType, setActionType] = useState('LOCK'); // 'LOCK' | 'UNLOCK'
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [lockReason, setLockReason] = useState('');

  // Fetch Users
  const fetchUsers = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchKeyword.trim()) params.append('search', searchKeyword.trim());
      params.append('limit', '100');

      const headers = { Authorization: `Bearer ${currentUser?.token}` };
      const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, { headers });
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        throw new Error(data.message || 'Không thể tải danh sách người dùng');
      }
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi tải danh sách người dùng'), 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers();
  }, [roleFilter, statusFilter, currentUser]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(true);
  };

  // Xác nhận Khóa / Mở khóa tài khoản (Quy tắc Wireframe WF-A02)
  const handleConfirmStatusChange = async () => {
    if (!selectedUserForAction) return;
    if (actionType === 'LOCK' && !lockReason.trim()) {
      if (showToast) showToast('Vui lòng nhập lý do khóa tài khoản.', 'error');
      return;
    }
    try {
      setActionSubmitting(true);
      const newStatus = actionType === 'LOCK' ? 'BANNED' : 'ACTIVE';

      const headers = { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser?.token}` 
      };

      const res = await fetch(`${API_BASE}/admin/users/${selectedUserForAction.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus, reason: newStatus === 'BANNED' ? lockReason.trim() : undefined })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Thao tác cập nhật trạng thái thất bại');
      }

      if (showToast) {
        showToast(
          actionType === 'LOCK' 
            ? `Đã khóa tài khoản: ${selectedUserForAction.email}` 
            : `Đã mở khóa tài khoản: ${selectedUserForAction.email}`,
          'success'
        );
      }

      // Cập nhật state nội bộ
      setUsers(prev => prev.map(u => u.id === selectedUserForAction.id ? { ...u, status: newStatus } : u));
      setSelectedUserForAction(null);
    } catch (err) {
      console.error('Lỗi đổi trạng thái user:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi thao tác'), 'error');
      }
    } finally {
      setActionSubmitting(false);
    }
  };

  // Cấp / Hủy tick xanh xác thực uy tín cho Employer
  const handleToggleVerify = async (user) => {
    try {
      const newVerified = !user.is_verified;
      const headers = { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser?.token}` 
      };

      const res = await fetch(`${API_BASE}/admin/users/${user.id}/verify`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_verified: newVerified })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Cập nhật xác thực thất bại');
      }

      if (showToast) {
        showToast(
          newVerified 
            ? `Đã cấp xác thực uy tín cho Nhà tuyển dụng ${user.email}` 
            : `Đã thu hồi xác thực của ${user.email}`,
          'success'
        );
      }

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_verified: newVerified } : u));
    } catch (err) {
      console.error('Lỗi cấp xác thực:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi xác thực'), 'error');
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch (e) {
      return dateStr;
    }
  };

  // Chiều cao phần đầu trang (đang ghim) → dòng tiêu đề cột của bảng ghim ngay bên dưới
  const pageHeadRef = useRef(null);
  const [pageHeadH, setPageHeadH] = useState(0);
  useEffect(() => {
    const el = pageHeadRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => setPageHeadH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const stickyTh = {
    position: 'sticky',
    top: `calc(var(--app-header-h, 74px) + ${pageHeadH}px)`,
    zIndex: 4,
    background: '#F8FAFC',
    boxShadow: 'inset 0 -1px 0 var(--color-border-hover)'
  };

  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* ================= HEADER: ghim dưới thanh trên cùng ================= */}
      <div ref={pageHeadRef} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14,
        position: 'sticky', top: 'var(--app-header-h, 74px)', zIndex: 6,
        background: 'var(--color-background)', margin: '-28px 0 0', padding: '28px 0 14px',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              QUẢN TRỊ NGƯỜI DÙNG
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Quản lý người dùng
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ExportMenu
            disabled={loading}
            onError={() => showToast && showToast('Xuất báo cáo thất bại', 'error')}
            getReport={async () => {
              const params = new URLSearchParams({ limit: '10000' });
              if (roleFilter !== 'ALL') params.append('role', roleFilter);
              if (statusFilter !== 'ALL') params.append('status', statusFilter);
              if (searchKeyword.trim()) params.append('search', searchKeyword.trim());
              const res = await fetch(`${API_BASE}/admin/users?${params}`, { headers: { Authorization: `Bearer ${currentUser?.token}` } });
              const data = await res.json();
              if (!res.ok || !data.success) throw new Error(data.message || 'Không tải được dữ liệu');
              const rows = data.data || [];
              const ROLE = { STUDENT: 'Sinh viên', EMPLOYER: 'Nhà tuyển dụng', ADMIN: 'Quản trị viên' };
              const STATUS = { ACTIVE: 'Hoạt động', BANNED: 'Đã khóa', PENDING: 'Chờ kích hoạt' };
              return {
                title: 'Báo cáo danh sách người dùng',
                subtitle: `Vai trò: ${ROLE[roleFilter] || 'Tất cả'} · Trạng thái: ${STATUS[statusFilter] || 'Tất cả'}${searchKeyword.trim() ? ` · Từ khóa: "${searchKeyword.trim()}"` : ''}`,
                fileName: 'danh-sach-nguoi-dung',
                author: currentUser?.full_name,
                summary: [['Tổng người dùng', rows.length], ['Sinh viên', rows.filter(u => u.role === 'STUDENT').length],
                  ['Nhà tuyển dụng', rows.filter(u => u.role === 'EMPLOYER').length], ['Đang bị khóa', rows.filter(u => u.status === 'BANNED').length]],
                columns: [
                  { header: 'ID', value: u => `#${u.id}`, width: 8 },
                  { header: 'Họ tên / Tên hiển thị', value: u => u.display_name || u.full_name, width: 30 },
                  { header: 'Email', value: u => u.email, width: 32 },
                  { header: 'Số điện thoại', value: u => u.phone, width: 14 },
                  { header: 'Vai trò', value: u => ROLE[u.role] || u.role, width: 16 },
                  { header: 'Trạng thái', value: u => STATUS[u.status] || u.status, width: 14 },
                  { header: 'Ngày đăng ký', value: u => u.created_at, type: 'date', width: 13 },
                ],
                rows,
              };
            }}
          />
          <Button
            variant="secondary"
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới danh sách</span>
          </Button>
        </div>
      </div>

      {/* ================= BỘ LỌC CHUẨN WIREFRAME WF-A02 (Role, Status, Lọc, Search) ================= */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid var(--color-border-hover)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
      }}>
        {/* Form tìm kiếm */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} color="#64748B" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Tìm theo email, họ tên, số điện thoại..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 36,
                paddingRight: 12,
                height: 38,
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                fontSize: 13.5
              }}
            />
          </div>
          <Button type="submit" variant="secondary" style={{ padding: '0 14px', height: 38, fontSize: 13 }}>
            Lọc
          </Button>
        </form>

        {/* Dropdowns lọc Role & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Lọc Role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Vai trò:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                height: 38,
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                padding: '0 10px',
                fontSize: 13,
                fontWeight: 600,
                background: '#ffffff'
              }}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="STUDENT">Sinh viên</option>
              <option value="EMPLOYER">Nhà tuyển dụng</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>

          {/* Lọc Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                height: 38,
                borderRadius: 8,
                border: '1.5px solid #CBD5E1',
                padding: '0 10px',
                fontSize: 13,
                fontWeight: 600,
                background: '#ffffff'
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="BANNED">Đã khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= BẢNG DANH SÁCH USERS CHUẨN WIREFRAME WF-A02 ================= */}
      {/* Cột: ID | Email | Role | Status | Created | Thao tác */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid var(--color-border-hover)',
        overflow: 'clip',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Đang tải dữ liệu người dùng...</div>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="Không tìm thấy người dùng phù hợp"
            description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc vai trò / trạng thái."
          />
        ) : (
          <>
            <div className="jn-table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                  <th style={{ ...stickyTh, padding: '12px 16px', width: 60 }}>Mã</th>
                  <th style={{ ...stickyTh, padding: '12px 16px' }}>Họ tên & liên hệ</th>
                  <th style={{ ...stickyTh, padding: '12px 16px', width: 140 }}>Vai trò</th>
                  <th style={{ ...stickyTh, padding: '12px 16px', width: 150 }}>Trạng thái</th>
                  <th style={{ ...stickyTh, padding: '12px 16px', width: 140 }}>Xác thực NTD</th>
                  <th style={{ ...stickyTh, padding: '12px 16px', width: 110 }}>Ngày tạo</th>
                  <th style={{ ...stickyTh, padding: '12px 16px', width: 120, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => {
                  const isLocked = u.status === 'BANNED' || u.status === 'LOCKED';
                  const isSelf = currentUser?.id === u.id;
                  const isEmployer = u.role === 'EMPLOYER';

                  return (
                    <tr 
                      key={u.id} 
                      style={{ 
                        borderBottom: '1px solid #E2E8F0',
                        background: isLocked ? '#FFF1F2' : '#ffffff',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#475569' }}>
                        {u.id}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>
                          {u.full_name || u.display_name || 'Chưa đặt tên'}
                        </div>
                        <div style={{ fontSize: 13, color: '#475569', overflowWrap: 'anywhere' }}>
                          {u.email}
                        </div>
                        {u.phone && (
                          <div style={{ fontSize: 13, color: '#475569' }}>
                            {u.phone}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12.5,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          ...(ROLE_BADGE[u.role] || ROLE_BADGE.STUDENT)
                        }}>
                          {ROLE_LABEL[u.role] || u.role}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12.5,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          background: isLocked ? '#FEE2E2' : '#DCFCE7',
                          color: isLocked ? '#7F1D1D' : '#14532D',
                          border: `1px solid ${isLocked ? '#FCA5A5' : '#86EFAC'}`
                        }}>
                          {isLocked ? <Lock size={12} /> : <CheckCircle2 size={12} />}
                          {isLocked ? 'Đã khóa' : 'Đang hoạt động'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {isEmployer ? (
                          <button
                            type="button"
                            onClick={() => handleToggleVerify(u)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: u.is_verified ? '#ECFDF5' : '#F8FAFC',
                              color: u.is_verified ? '#065F46' : '#334155',
                              border: `1.5px solid ${u.is_verified ? '#10B981' : '#CBD5E1'}`,
                              borderRadius: 14,
                              padding: '3px 8px',
                              fontSize: 12.5,
                              whiteSpace: 'nowrap',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Bấm để cấp hoặc gỡ tick xanh xác thực uy tín"
                          >
                            <ShieldCheck size={13} color={u.is_verified ? '#059669' : '#64748B'} />
                            <span>{u.is_verified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
                          </button>
                        ) : (
                          null
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {formatDate(u.created_at)}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {isSelf ? (
                          <span style={{ fontSize: 13, color: '#475569' }}>
                            Tài khoản của bạn
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForAction(u);
                              setActionType(isLocked ? 'UNLOCK' : 'LOCK');
                              setLockReason('');
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              fontSize: 12.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              whiteSpace: 'nowrap',
                              border: isLocked ? '1px solid #047857' : '1px solid #FCA5A5',
                              background: isLocked ? '#047857' : '#ffffff',
                              color: isLocked ? '#ffffff' : '#B91C1C'
                            }}
                          >
                            {isLocked ? (
                              <>
                                <Unlock size={13} /> Mở khóa
                              </>
                            ) : (
                              <>
                                <Lock size={13} /> Khóa
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {users.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: 13
            }}>
              <div style={{ color: '#475569' }}>
                Hiển thị <strong>{Math.min((currentPage - 1) * pageSize + 1, users.length)}</strong> - <strong>{Math.min(currentPage * pageSize, users.length)}</strong> trên tổng số <strong>{users.length}</strong> tài khoản
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    background: currentPage === 1 ? '#F1F5F9' : '#ffffff',
                    color: currentPage === 1 ? '#475569' : '#0F172A',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  ← Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: currentPage === page ? '#7565A8' : '#CBD5E1',
                      background: currentPage === page ? '#7565A8' : '#ffffff',
                      color: currentPage === page ? '#ffffff' : '#0F172A',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 700
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    background: currentPage === totalPages ? '#F1F5F9' : '#ffffff',
                    color: currentPage === totalPages ? '#475569' : '#0F172A',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>

      {/* ================= MODAL XÁC NHẬN KHÓA TÀI KHOẢN (CHUẨN WIREFRAME WF-A02) ================= */}
      {selectedUserForAction && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid var(--color-border-hover)',
            maxWidth: 460,
            width: '100%',
            padding: 24,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: actionType === 'LOCK' ? '#FEE2E2' : '#DCFCE7',
                color: actionType === 'LOCK' ? '#DC2626' : '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {actionType === 'LOCK' ? <Lock size={22} /> : <Unlock size={22} />}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                {actionType === 'LOCK' ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
              </h3>
            </div>

            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 14 }}>
              Bạn đang thực hiện {actionType === 'LOCK' ? 'khóa' : 'mở khóa'} quyền truy cập của người dùng:
              <br />
              <strong style={{ color: '#0F172A' }}>{selectedUserForAction.email}</strong> ({selectedUserForAction.role})
            </p>

            {actionType === 'LOCK' && (
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
                  Lý do khóa <span style={{ color: '#DC2626' }}>*</span>
                </span>
                <textarea
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="VD: Đăng tin sai sự thật nhiều lần. Người dùng sẽ thấy lý do này trong thông báo."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </label>
            )}

            {/* Cảnh báo đặc biệt từ Wireframe: Không thể khóa Admin cuối cùng */}
            {selectedUserForAction.role === 'ADMIN' && actionType === 'LOCK' && (
              <div style={{
                background: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: '#B91C1C',
                fontWeight: 700,
                marginBottom: 16
              }}>
                ⚠️ Lưu ý: Hệ thống bắt buộc phải duy trì tối thiểu 1 Quản trị viên ACTIVE. Không thể khóa Admin cuối cùng.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button
                variant="secondary"
                onClick={() => setSelectedUserForAction(null)}
                disabled={actionSubmitting}
                style={{ padding: '8px 18px', fontSize: 13.5 }}
              >
                Hủy
              </Button>

              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={actionSubmitting}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: '1px solid var(--color-border-hover)',
                  background: actionType === 'LOCK' ? '#DC2626' : '#10B981',
                  color: '#ffffff'
                }}
              >
                {actionSubmitting ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

