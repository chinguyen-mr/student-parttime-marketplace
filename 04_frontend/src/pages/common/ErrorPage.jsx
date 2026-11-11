import React, { useState } from 'react';
import { 
  AlertTriangle, Lock, Clock, Home, Search, 
  ArrowLeft, LogIn, RefreshCw, HelpCircle, ChevronRight 
} from 'lucide-react';

export default function ErrorPage({
  type = '404', // '404' | '403' | 'expired'
  customMessage = '',
  onNavigateHome,
  onNavigateJobs,
  onOpenAuth
}) {
  const [activeType, setActiveType] = useState(type);

  const errorConfigs = {
    '404': {
      code: '404',
      icon: AlertTriangle,
      iconColor: '#DC2626',
      bgColor: '#FEF2F2',
      borderColor: '#FCA5A5',
      title: 'Không tìm thấy trang yêu cầu',
      description: customMessage || 'Trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc đường dẫn đã thay đổi.',
      primaryBtnText: 'Về trang chủ',
      primaryAction: onNavigateHome,
      secondaryBtnText: 'Tìm kiếm việc làm',
      secondaryAction: onNavigateJobs
    },
    '403': {
      code: '403',
      icon: Lock,
      iconColor: '#7565A8',
      bgColor: '#EDE9FE',
      borderColor: '#C4B5FD',
      title: 'Truy cập bị từ chối',
      description: customMessage || 'Bạn không có quyền truy cập vào tài nguyên hoặc khu vực quản trị này. Vui lòng đăng nhập với tài khoản có thẩm quyền.',
      primaryBtnText: 'Về trang chủ',
      primaryAction: onNavigateHome,
      secondaryBtnText: 'Đăng nhập tài khoản khác',
      secondaryAction: () => onOpenAuth && onOpenAuth('login')
    },
    'expired': {
      code: 'HẾT HẠN',
      icon: Clock,
      iconColor: '#D97706',
      bgColor: '#FEF3C7',
      borderColor: '#FCD34D',
      title: 'Tin tuyển dụng đã đóng hoặc hết hạn',
      description: customMessage || 'Tin tuyển dụng này đã đủ số lượng ứng viên hoặc đã qua thời hạn nhận hồ sơ quy định.',
      primaryBtnText: 'Khám phá việc làm tương tự',
      primaryAction: onNavigateJobs,
      secondaryBtnText: 'Về trang chủ',
      secondaryAction: onNavigateHome
    }
  };

  const currentConfig = errorConfigs[activeType] || errorConfigs['404'];
  const IconComponent = currentConfig.icon;

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: 580,
          background: '#ffffff',
          borderRadius: 20,
          border: '1.5px solid #000000',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          textAlign: 'center'
        }}
      >
        {/* Variant Selector (Matching Draw.io WF-X02 annotation) */}
        <div 
          style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            background: '#F1F5F9',
            padding: 4
          }}
        >
          <button
            onClick={() => setActiveType('404')}
            style={{
              flex: 1,
              padding: '8px 10px',
              border: 'none',
              borderRadius: 8,
              background: activeType === '404' ? '#ffffff' : 'transparent',
              fontWeight: activeType === '404' ? 700 : 500,
              fontSize: 12.5,
              color: activeType === '404' ? '#DC2626' : '#64748B',
              cursor: 'pointer',
              boxShadow: activeType === '404' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            404 Không tìm thấy
          </button>
          <button
            onClick={() => setActiveType('403')}
            style={{
              flex: 1,
              padding: '8px 10px',
              border: 'none',
              borderRadius: 8,
              background: activeType === '403' ? '#ffffff' : 'transparent',
              fontWeight: activeType === '403' ? 700 : 500,
              fontSize: 12.5,
              color: activeType === '403' ? '#7565A8' : '#64748B',
              cursor: 'pointer',
              boxShadow: activeType === '403' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            403 Không có quyền
          </button>
          <button
            onClick={() => setActiveType('expired')}
            style={{
              flex: 1,
              padding: '8px 10px',
              border: 'none',
              borderRadius: 8,
              background: activeType === 'expired' ? '#ffffff' : 'transparent',
              fontWeight: activeType === 'expired' ? 700 : 500,
              fontSize: 12.5,
              color: activeType === 'expired' ? '#D97706' : '#64748B',
              cursor: 'pointer',
              boxShadow: activeType === 'expired' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Tin hết hạn / Đóng
          </button>
        </div>

        {/* Card Body */}
        <div style={{ padding: '40px 32px' }}>
          {/* Large Code & Icon */}
          <div 
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: currentConfig.bgColor,
              border: `2px solid ${currentConfig.borderColor}`,
              color: currentConfig.iconColor,
              margin: '0 auto 20px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconComponent size={44} />
          </div>

          <span 
            style={{
              display: 'inline-block',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: currentConfig.iconColor,
              marginBottom: 8
            }}
          >
            Mã thông báo: {currentConfig.code}
          </span>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
            {currentConfig.title}
          </h1>

          <p style={{ fontSize: 14.5, color: '#64748B', lineHeight: 1.6, maxWidth: 460, margin: '0 auto 28px auto' }}>
            {currentConfig.description}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={currentConfig.primaryAction}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: '#7565A8',
                color: '#ffffff',
                fontSize: 14.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(117, 101, 168, 0.25)'
              }}
            >
              <Home size={17} /> {currentConfig.primaryBtnText}
            </button>

            {currentConfig.secondaryBtnText && (
              <button
                type="button"
                onClick={currentConfig.secondaryAction}
                style={{
                  width: '100%',
                  padding: '11px 20px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Search size={16} /> {currentConfig.secondaryBtnText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

