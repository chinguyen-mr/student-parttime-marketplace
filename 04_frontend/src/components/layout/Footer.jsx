import React from 'react';

export default function Footer({
  onSelectCategory,
  onSelectLocation,
  onNavigateTab,
  onOpenPolicy,
  onOpenSupport,
  onNavigateAbout
}) {
  const handleNav = (tab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategory = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
      if (onNavigateTab) onNavigateTab('jobs');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLocation = (loc) => {
    if (onSelectLocation) {
      onSelectLocation(loc);
      if (onNavigateTab) onNavigateTab('jobs');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer 
      style={{
        backgroundColor: '#181124',
        color: '#A99EB8',
        fontSize: '13.5px',
        lineHeight: 1.6,
        marginTop: 'auto',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* =========================================================================
          MAIN 5-COLUMN DIRECTORY MATCHING USER SCREENSHOT EXACTLY
          ========================================================================= */}
      <div style={{
        maxWidth: 1260,
        margin: '0 auto',
        padding: '48px 24px 36px 24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '28px'
        }}>
          {/* CỘT 1: JobNest */}
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>
              JobNest
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Về JobNest', action: () => onNavigateAbout ? onNavigateAbout('about') : (onOpenPolicy ? onOpenPolicy('about') : handleNav('coming_soon')) },
                { label: 'Giới thiệu nền tảng', action: () => onNavigateAbout ? onNavigateAbout('platform') : (onOpenPolicy ? onOpenPolicy('about') : handleNav('coming_soon')) },
                { label: 'Liên hệ', action: () => onNavigateAbout ? onNavigateAbout('contact') : (onOpenSupport ? onOpenSupport() : handleNav('coming_soon')) },
                { label: 'Hỏi đáp (FAQ)', action: () => onNavigateAbout ? onNavigateAbout('faq') : (onOpenSupport ? onOpenSupport() : handleNav('coming_soon')) },
                { label: 'Thỏa thuận sử dụng', action: () => onNavigateAbout ? onNavigateAbout('terms') : (onOpenPolicy ? onOpenPolicy('terms') : handleNav('coming_soon')) },
                { label: 'Quy định bảo mật', action: () => onNavigateAbout ? onNavigateAbout('privacy') : (onOpenPolicy ? onOpenPolicy('privacy') : handleNav('coming_soon')) },
                { label: 'Quy chế hoạt động sàn giao dịch', action: () => onNavigateAbout ? onNavigateAbout('regulations') : (onOpenPolicy ? onOpenPolicy('terms') : handleNav('coming_soon')) },
                { label: 'Sơ đồ trang web', action: () => onNavigateAbout ? onNavigateAbout('sitemap') : handleNav('home') }
              ].map(item => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={item.action}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#C4B5FD',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#C4B5FD'}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 2: Dành cho Nhà tuyển dụng */}
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>
              Dành cho Nhà tuyển dụng
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Đăng tuyển dụng', action: () => handleNav('create_job') },
                { label: 'Tìm kiếm hồ sơ', action: () => handleNav('jobs') },
                { label: 'Quản lý tin tuyển dụng', action: () => handleNav('employer_jobs') },
                { label: 'Báo cáo thị trường tuyển dụng', action: () => handleNav('coming_soon') },
                { label: 'Liên hệ hợp tác', action: () => onOpenSupport ? onOpenSupport() : handleNav('coming_soon') }
              ].map(item => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={item.action}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#A99EB8',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#A99EB8'}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: Việc làm theo khu vực */}
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>
              Việc làm theo khu vực
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Hồ Chí Minh', val: 'TP.HCM' },
                { label: 'Hà Nội', val: 'Hà Nội' },
                { label: 'Hải Phòng', val: 'Hải Phòng' },
                { label: 'Đà Nẵng', val: 'Đà Nẵng' },
                { label: 'Cần Thơ', val: 'Cần Thơ' }
              ].map(item => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => handleLocation(item.val)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#C4B5FD',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#C4B5FD'}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleNav('jobs')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#F48E5C',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Xem tất cả khu vực &rsaquo;
                </button>
              </li>
            </ul>
          </div>

          {/* CỘT 4: Việc làm theo ngành nghề */}
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>
              Việc làm theo ngành nghề
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Kế toán', val: 'Kế toán' },
                { label: 'Ngân hàng', val: 'Ngân hàng' },
                { label: 'Phần mềm máy tính', val: 'Công nghệ thông tin' },
                { label: 'IT Support / Help Desk', val: 'Công nghệ thông tin' },
                { label: 'Thiết kế đồ họa', val: 'Thiết kế đồ họa' }
              ].map(item => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => handleCategory(item.val)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#C4B5FD',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#C4B5FD'}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleNav('jobs')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#F48E5C',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Tìm việc làm &rsaquo;
                </button>
              </li>
            </ul>
          </div>

          {/* CỘT 5: Ứng dụng di động & Chứng nhận & Mạng xã hội */}
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>
              Ứng dụng di động
            </h3>

            {/* Badges: App Store & Google Play */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {/* App Store */}
              <div 
                style={{
                  background: '#000000',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: 'fit-content',
                  cursor: 'pointer',
                  minHeight: 44
                }}
                onClick={() => handleNav('coming_soon')}
              >
                {/* Apple icon SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.93.04-2.07.62-2.73 1.4-.58.67-1.09 1.76-.95 2.82 1.04.08 2.1-.5 2.72-1.26z"/>
                </svg>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '11px', color: '#D1D5DB', fontWeight: 500 }}>Download on the</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.2px' }}>App Store</div>
                </div>
              </div>

              {/* Google Play */}
              <div 
                style={{
                  background: '#000000',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: 'fit-content',
                  cursor: 'pointer',
                  minHeight: 44
                }}
                onClick={() => handleNav('coming_soon')}
              >
                {/* Google Play icon SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M3.61 2.05L13.89 12 3.61 21.95c-.37-.32-.61-.83-.61-1.45V3.5c0-.62.24-1.13.61-1.45z"/>
                  <path fill="#FBBC04" d="M17.39 8.56l-3.5 3.44 3.5 3.44 3.96-2.27c1.13-.65 1.13-1.7 0-2.35l-3.96-2.26z"/>
                  <path fill="#EA4335" d="M13.89 12L3.61 2.05c.2-.17.47-.28.78-.28.53 0 1.03.26 1.54.55l11.46 6.24L13.89 12z"/>
                  <path fill="#34A853" d="M13.89 12l3.5 3.44-11.46 6.24c-.51.29-1.01.55-1.54.55-.31 0-.58-.11-.78-.28L13.89 12z"/>
                </svg>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '11px', color: '#D1D5DB', fontWeight: 500 }}>GET IT ON</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.2px' }}>Google Play</div>
                </div>
              </div>
            </div>

            {/* Chứng nhận bởi */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12.5px', color: '#C4B5FD', fontWeight: 600, marginBottom: '6px' }}>
                Chứng nhận bởi
              </div>
              <img 
                src="/dadangky.png" 
                alt="Đã đăng ký Bộ Công Thương" 
                style={{
                  height: '38px',
                  width: 'auto',
                  objectFit: 'contain',
                  cursor: 'pointer',
                  display: 'block'
                }}
              />
            </div>

            {/* Theo dõi JobNest trên */}
            <div>
              <div style={{ fontSize: '12.5px', color: '#C4B5FD', fontWeight: 600, marginBottom: '8px' }}>
                Theo dõi JobNest trên
              </div>
              {/* 5 Social Circles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Facebook (Blue) */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: '#1877F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';
                  }}
                  title="Facebook"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* LinkedIn (Blue) */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: '#0A66C2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';
                  }}
                  title="LinkedIn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.93 0-1.68.75-1.68 1.68 0 .93.75 1.69 1.68 1.69s1.69-.76 1.69-1.69c0-.93-.76-1.68-1.69-1.68z"/>
                  </svg>
                </a>

                {/* TikTok (Black) */}
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: '#000000',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';
                  }}
                  title="TikTok"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.25a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.46a8.27 8.27 0 0 0 4.91 1.66v-3.43h-1z"/>
                  </svg>
                </a>

                {/* YouTube (Red) */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';
                  }}
                  title="YouTube"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Instagram (Gradient Pink-Orange-Purple) */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';
                  }}
                  title="Instagram"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MIDDLE CENTERED COPYRIGHT & CAMPUS ADDRESS
            ========================================================================= */}
        <div style={{
          textAlign: 'center',
          marginTop: '38px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '12.5px',
          color: '#8E82A3',
          lineHeight: 1.7
        }}>
          <div>
            Copyright &copy; 2026 JobNest &mdash; Nền tảng kết nối việc làm bán thời gian và toàn thời gian cho sinh viên
          </div>
          <div>
            Trường Đại học Văn Lang &mdash; 69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh, TP. Hồ Chí Minh
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM DARKEST BAR: LOGO + KHOA CNTT ĐỒ ÁN CHUYÊN ĐỀ 2 + VLU
          ========================================================================= */}
      <div style={{
        background: '#100B1A',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '14px 24px'
      }}>
        <div style={{
          maxWidth: 1260,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '12px',
          color: '#8E82A3'
        }}>
          {/* Logo & Brand bên trái */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/logo.jpg"
              alt="JobNest Logo"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                objectFit: 'cover',
                background: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>
              &copy; JobNest
            </span>
          </div>

          {/* Khoa CNTT ở giữa */}
          <div>
            Khoa Công nghệ Thông tin &mdash; Đồ Án Tốt Nghiệp Chuyên Đề 2
          </div>

          {/* VLU bên phải */}
          <div>
            Trường Đại học Văn Lang (VLU)
          </div>
        </div>
      </div>
    </footer>
  );
}
