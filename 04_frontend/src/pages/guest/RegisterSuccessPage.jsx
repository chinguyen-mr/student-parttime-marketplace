import React from 'react';
import { 
  CheckCircle2, Sparkles, User, Briefcase, 
  Clock, ShieldCheck, ArrowRight, Home, LogIn 
} from 'lucide-react';

export default function RegisterSuccessPage({
  user = null,
  role = 'STUDENT',
  onNavigateLogin,
  onNavigateHome
}) {
  const activeRole = user?.role || role;
  const fullName = user?.full_name || 'bạn';

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
          maxWidth: 620,
          background: '#ffffff',
          borderRadius: 20,
          border: '1.5px solid #000000',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          textAlign: 'center'
        }}
      >
        {/* Brand Banner Top */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #7565A8 0%, #5B4E85 100%)',
            padding: '36px 24px 28px 24px',
            color: '#ffffff',
            position: 'relative'
          }}
        >
          {/* Circular Success Badge */}
          <div 
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: '#ffffff',
              color: '#16A34A',
              margin: '0 auto 16px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
              border: '2px solid #000000'
            }}
          >
            <CheckCircle2 size={44} />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            ĐĂNG KÝ THÀNH CÔNG!
          </h1>
          <p style={{ fontSize: 14.5, opacity: 0.9, margin: 0 }}>
            Chúc mừng <strong>{fullName}</strong> đã gia nhập nền tảng JobNest
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '32px 28px' }}>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Tài khoản của bạn đã được khởi tạo thành công trên hệ thống. Dưới đây là các bước tiếp theo để bạn bắt đầu:
          </p>

          {/* Next Steps Card according to Role */}
          <div 
            style={{
              background: '#F8FAFC',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              padding: '20px',
              textAlign: 'left',
              marginBottom: 28
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Sparkles size={16} color="#7565A8" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>
                {activeRole === 'EMPLOYER' ? 'Gợi ý cho Nhà tuyển dụng' : '3 bước khởi đầu cho Sinh viên'}
              </span>
            </div>

            {activeRole === 'EMPLOYER' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#7565A8', color: '#ffffff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                  <div>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>Hoàn thiện thông tin doanh nghiệp</h4>
                    <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>Thêm logo, địa chỉ và phần giới thiệu để tăng độ uy tín với ứng viên.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#7565A8', color: '#ffffff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                  <div>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>Xác thực email và số điện thoại</h4>
                    <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>Nhận huy hiệu Đã xác thực giúp tin đăng được duyệt nhanh hơn.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#7565A8', color: '#ffffff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                  <div>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>Đăng tin tuyển dụng đầu tiên</h4>
                    <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>Tạo tin tuyển dụng ca part-time hoặc dự án freelance chỉ trong 3 phút.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#7565A8', color: '#ffffff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                  <div>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>Cập nhật hồ sơ & kỹ năng</h4>
                    <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>Thêm trường đại học, chuyên ngành và tải lên CV để sẵn sàng ứng tuyển.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#7565A8', color: '#ffffff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                  <div>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>Cài đặt lịch rảnh trong tuần</h4>
                    <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>Hệ thống tự động so khớp việc làm theo các khung giờ bạn không bận học.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#7565A8', color: '#ffffff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                  <div>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>Khám phá việc làm & Ứng tuyển</h4>
                    <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>Tìm kiếm hàng trăm công việc uy tín được doanh nghiệp tuyển dụng mỗi ngày.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={onNavigateLogin}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: '#7565A8',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(117, 101, 168, 0.3)'
              }}
            >
              <LogIn size={18} /> Đăng nhập ngay
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
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
              <Home size={16} /> Khám phá trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

