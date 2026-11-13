import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, ShieldCheck, AlertTriangle, 
  Tag, History, Search, Shield, LogOut, ArrowRight, Star
} from 'lucide-react';
import { Button } from '../../components/ui';

// Import all Admin Sub-pages (WF-A01 to WF-A08)
import AdminDashboardPage from './AdminDashboardPage';   // WF-A01
import AdminUsersPage from './AdminUsersPage';           // WF-A02
import AdminModerationPage from './AdminModerationPage'; // WF-A03 & WF-A04
import AdminReportsPage from './AdminReportsPage';       // WF-A05 & WF-A06
import AdminCategoriesPage from './AdminCategoriesPage'; // WF-A07
import AdminLogsPage from './AdminLogsPage';             // WF-A08
import AdminReviewsPage from './AdminReviewsPage';       // Kiểm duyệt đánh giá doanh nghiệp / công việc

export default function AdminPortal({
  currentUser,
  initialTab = 'dashboard',
  onNavigateHome,
  onNavigateLogin,
  onNavigateMarketplace,
  showToast
}) {
  // Navigation State inside Admin Workspace:
  // 'dashboard' (WF-A01)
  // 'users' (WF-A02)
  // 'moderation' (WF-A03 & WF-A04)
  // 'reports' (WF-A05 & WF-A06)
  // 'categories' (WF-A07)
  // 'logs' (WF-A08)
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // =========================================================================
  // 1. STRICT ROLE GUARD (NHIỆM VỤ 3)
  // Chặn tuyệt đối STUDENT, EMPLOYER và GUEST vào phân hệ ADMIN
  // =========================================================================
  const isAdmin = currentUser?.token && currentUser?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div style={{
        maxWidth: 720,
        margin: '60px auto',
        padding: '48px 36px',
        background: '#ffffff',
        borderRadius: 24,
        border: '1.5px solid #FEE2E2',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#FEF2F2',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          border: '2px solid #FCA5A5'
        }}>
          <AlertTriangle size={40} />
        </div>

        <span style={{
          display: 'inline-block',
          background: '#FEE2E2',
          color: '#B91C1C',
          fontSize: 12.5,
          fontWeight: 800,
          padding: '4px 14px',
          borderRadius: 20,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: 14
        }}>
          403 FORBIDDEN — TRUY CẬP BỊ TỪ CHỐI
        </span>

        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1E293B', margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>
          Khu vực bảo mật dành riêng cho Quản trị viên (ADMIN)
        </h2>

        <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.6, marginBottom: 32, maxWidth: 540, margin: '0 auto 32px' }}>
          {currentUser?.token ? (
            <>
              Bạn hiện đang đăng nhập với vai trò <strong style={{ color: '#0F172A' }}>{currentUser.role}</strong>. 
              Toàn bộ các phân hệ giám sát kiểm duyệt của hệ thống quản trị chỉ cấp quyền cho tài khoản <code>ADMIN</code>.
            </>
          ) : (
            <>
              Bạn đang ở chế độ Khách vãng lai (chưa đăng nhập). 
              Vui lòng đăng nhập với tài khoản <strong>Quản trị viên</strong> để tiếp tục truy cập.
            </>
          )}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={onNavigateHome}
            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700 }}
          >
            Quay lại Trang chủ
          </Button>

          <Button
            variant="primary"
            onClick={onNavigateLogin}
            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700 }}
          >
            Đăng nhập tài khoản Quản trị viên
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN UNIFIED ADMIN PORTAL LAYOUT (FULL-WIDTH 100vw)
  // Sidebar sát mép trái (260px) + Main Content chiếm toàn bộ phần còn lại
  // =========================================================================
  return (
    <div className="admin-portal-container" style={{
      width: '100%',
      minHeight: 'calc(100vh - 116px)',
      background: '#F8FAFC',
      boxSizing: 'border-box'
    }}>
      {/* Nút bật/tắt Menu trên màn hình nhỏ (Tablet & Mobile < 1024px) */}
      <div className="admin-mobile-menu-bar" style={{
        display: 'none',
        padding: '10px 16px',
        background: '#ffffff',
        borderBottom: '1.5px solid #000000',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} color="#B91C1C" />
          <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
            Menu Quản trị ({activeTab.toUpperCase()})
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            border: '1.5px solid #000000',
            background: mobileMenuOpen ? '#0F172A' : '#ffffff',
            color: mobileMenuOpen ? '#ffffff' : '#0F172A',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {mobileMenuOpen ? '✕ Đóng Menu' : '☰ Chọn mục'}
        </button>
      </div>

      {/* 2-COLUMN FULL-WIDTH LAYOUT: SIDEBAR SÁT MÉP TRÁI (260px) + MAIN CONTENT CHIẾM TOÀN BỘ PHẦN CÒN LẠI */}
      <div className="employer-grid-layout" style={{
        display: 'grid',
        gridTemplateColumns: '260px minmax(0, 1fr)',
        minHeight: 'calc(100vh - 116px)',
        alignItems: 'stretch',
        width: '100%'
      }}>
        {/* ================= REUSABLE LEFT SIDEBAR (SÁT MÉP TRÁI VIEWPORT 260px) ================= */}
        <aside 
          className={`employer-sidebar-aside ${mobileMenuOpen ? 'mobile-open' : ''}`} 
          style={{
            width: 260,
            background: '#ffffff',
            borderRight: '1.5px solid #000000',
            padding: '24px 16px',
            boxSizing: 'border-box',
            position: 'sticky',
            top: 116,
            height: 'calc(100vh - 116px)',
            overflowY: 'auto'
          }}
        >
          {/* PHẦN THÔNG TIN TÀI KHOẢN QUẢN TRỊ */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingBottom: 16,
            marginBottom: 16,
            borderBottom: '1.5px solid #E2E8F0'
          }}>
            <div style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: '#7565A8',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 10,
              boxShadow: '0 4px 12px rgba(117, 101, 168, 0.25)',
              border: '2px solid #D8B4FE'
            }}>
              {currentUser?.full_name ? currentUser.full_name.trim().charAt(0).toUpperCase() : 'Q'}
            </div>

            <h3 style={{
              fontSize: 14.5,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 4px 0',
              lineHeight: 1.3
            }}>
              {currentUser?.full_name || 'Quản trị viên Hệ thống'}
            </h3>

            <div style={{
              fontSize: 12,
              color: '#64748B',
              marginBottom: 8,
              wordBreak: 'break-all'
            }}>
              {currentUser?.email || 'admin.test@vlu.edu.vn'}
            </div>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: '#FEE2E2',
              color: '#B91C1C',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 12,
              border: '1.5px solid #FCA5A5'
            }}>
              <Shield size={12} /> HỆ THỐNG / ADMIN
            </span>
          </div>

          {/* Sidebar Menu Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
              { id: 'users', label: 'Người dùng', icon: Users },
              { id: 'moderation', label: 'Kiểm duyệt tin', icon: ShieldCheck },
              { id: 'reports', label: 'Báo cáo', icon: AlertTriangle },
              { id: 'reviews', label: 'Kiểm duyệt đánh giá', icon: Star },
              { id: 'categories', label: 'Danh mục', icon: Tag },
              { id: 'logs', label: 'Nhật ký hệ thống', icon: History },
            ].map(item => {
              const isActive = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: isActive ? '1px solid #D8B4FE' : '1px solid transparent',
                    background: isActive ? '#F1EEF8' : 'transparent',
                    color: isActive ? '#7565A8' : '#334155',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#F8F7FB';
                      e.currentTarget.style.color = '#7565A8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#334155';
                    }
                  }}
                >
                  <IconComp size={18} color={isActive ? '#7565A8' : '#64748B'} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Switch to Marketplace */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={() => {
                if (onNavigateMarketplace) onNavigateMarketplace();
                else if (onNavigateHome) onNavigateHome();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1.5px dashed #64748B',
                background: '#F8FAFC',
                color: '#334155',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F1F5F9';
                e.currentTarget.style.borderColor = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.borderColor = '#64748B';
              }}
              title="Chuyển sang xem Thị trường việc làm công khai"
            >
              <Search size={14} color="#4F46E5" />
              <span>Khám phá thị trường</span>
            </button>
          </div>
        </aside>

        {/* ================= RIGHT MAIN CONTENT AREA (FULL REMAINING WIDTH) ================= */}
        <main style={{
          minWidth: 0,
          width: '100%',
          maxWidth: 'none',
          padding: '28px 36px 100px 36px',
          boxSizing: 'border-box'
        }}>
          {/* WF-A01: Admin Dashboard */}
          {activeTab === 'dashboard' && (
            <AdminDashboardPage
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab)}
              showToast={showToast}
            />
          )}

          {/* WF-A02: User Management */}
          {activeTab === 'users' && (
            <AdminUsersPage
              currentUser={currentUser}
              showToast={showToast}
            />
          )}

          {/* WF-A03 & WF-A04: Job Moderation Queue & Detail */}
          {activeTab === 'moderation' && (
            <AdminModerationPage
              currentUser={currentUser}
              showToast={showToast}
            />
          )}

          {/* WF-A05 & WF-A06: Reports Management & Detail */}
          {activeTab === 'reports' && (
            <AdminReportsPage
              currentUser={currentUser}
              showToast={showToast}
            />
          )}

          {/* WF-A07: Category Management */}
          {activeTab === 'categories' && (
            <AdminCategoriesPage
              currentUser={currentUser}
              showToast={showToast}
            />
          )}

          {/* Kiểm duyệt đánh giá doanh nghiệp / công việc */}
          {activeTab === 'reviews' && (
            <AdminReviewsPage currentUser={currentUser} showToast={showToast} />
          )}

          {/* WF-A08: Admin System Logs */}
          {activeTab === 'logs' && (
            <AdminLogsPage
              currentUser={currentUser}
              showToast={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}

