import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, ShieldCheck, ShieldAlert, 
  Lock, Unlock, CheckCircle2, XCircle, AlertTriangle, 
  RefreshCw, Award, Mail, Phone, Calendar
} from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';

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
        body: JSON.stringify({ status: newStatus })
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

  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* ================= HEADER BREADCRUMB ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
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

      {/* ================= BỘ LỌC CHUẨN WIREFRAME WF-A02 (Role, Status, Lọc, Search) ================= */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1.5px solid #000000',
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
              placeholder="Tìm theo email, họ tên, phone..."
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
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Role:</span>
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
              <option value="STUDENT">STUDENT (Sinh viên)</option>
              <option value="EMPLOYER">EMPLOYER (Nhà tuyển dụng)</option>
              <option value="ADMIN">ADMIN (Quản trị viên)</option>
            </select>
          </div>

          {/* Lọc Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Status:</span>
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
              <option value="ACTIVE">ACTIVE (Hoạt động)</option>
              <option value="BANNED">LOCKED / BANNED (Đã khóa)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= BẢNG DANH SÁCH USERS CHUẨN WIREFRAME WF-A02 ================= */}
      {/* Cột: ID | Email | Role | Status | Created | Thao tác */}
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
            <div>Đang tải dữ liệu người dùng...</div>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="Không tìm thấy người dùng phù hợp"
            description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc Role / Status."
          />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #000000', fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}>
                  <th style={{ padding: '14px 16px', width: 60 }}>ID</th>
                  <th style={{ padding: '14px 16px' }}>Email & Họ tên</th>
                  <th style={{ padding: '14px 16px', width: 140 }}>Vai trò</th>
                  <th style={{ padding: '14px 16px', width: 140 }}>Trạng thái</th>
                  <th style={{ padding: '14px 16px', width: 140 }}>Xác thực NTD</th>
                  <th style={{ padding: '14px 16px', width: 120 }}>Ngày tạo</th>
                  <th style={{ padding: '14px 16px', width: 160, textAlign: 'right' }}>Thao tác</th>
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
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#64748B' }}>
                        {u.id}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>
                          {u.full_name || u.display_name || 'Chưa đặt tên'}
                        </div>
                        <div style={{ fontSize: 12.5, color: '#64748B' }}>
                          {u.email}
                        </div>
                        {u.phone && (
                          <div style={{ fontSize: 11.5, color: '#94A3B8' }}>
                            {u.phone}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 800,
                          background: u.role === 'ADMIN' ? '#FEE2E2' : u.role === 'EMPLOYER' ? '#ECFDF5' : '#EEF2FF',
                          color: u.role === 'ADMIN' ? '#B91C1C' : u.role === 'EMPLOYER' ? '#059669' : '#4F46E5',
                          border: `1px solid ${u.role === 'ADMIN' ? '#FCA5A5' : u.role === 'EMPLOYER' ? '#A7F3D0' : '#C7D2FE'}`
                        }}>
                          {u.role}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          background: isLocked ? '#FEE2E2' : '#DCFCE7',
                          color: isLocked ? '#DC2626' : '#15803D',
                          border: `1px solid ${isLocked ? '#FCA5A5' : '#86EFAC'}`
                        }}>
                          {isLocked ? <Lock size={12} /> : <CheckCircle2 size={12} />}
                          {isLocked ? 'LOCKED' : 'ACTIVE'}
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
                              color: u.is_verified ? '#059669' : '#64748B',
                              border: `1.5px solid ${u.is_verified ? '#10B981' : '#CBD5E1'}`,
                              borderRadius: 14,
                              padding: '3px 8px',
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Bấm để cấp hoặc gỡ tick xanh xác thực uy tín"
                          >
                            <ShieldCheck size={13} color={u.is_verified ? '#059669' : '#94A3B8'} />
                            <span>{u.is_verified ? 'Verified' : 'Chưa duyệt'}</span>
                          </button>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: 12 }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {formatDate(u.created_at)}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {isSelf ? (
                          <span style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                            (Tài khoản của bạn)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForAction(u);
                              setActionType(isLocked ? 'UNLOCK' : 'LOCK');
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
                              border: '1.5px solid #000000',
                              background: isLocked ? '#10B981' : '#ffffff',
                              color: isLocked ? '#ffffff' : '#DC2626'
                            }}
                          >
                            {isLocked ? (
                              <>
                                <Unlock size={13} /> Mở khóa
                              </>
                            ) : (
                              <>
                                <Lock size={13} /> Khóa tài khoản
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
              <div style={{ color: '#64748B' }}>
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
                    color: currentPage === 1 ? '#94A3B8' : '#0F172A',
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
                    color: currentPage === totalPages ? '#94A3B8' : '#0F172A',
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
            border: '2px solid #000000',
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
                  border: '1.5px solid #000000',
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

