import React, { useState, useEffect } from 'react';
import { 
  Building2, Mail, FileText, Phone, MapPin, Clock, 
  Send, CheckCircle2, ShieldAlert, Sparkles, ChevronRight,
  ArrowLeft, ExternalLink, HelpCircle, AlertCircle, ShieldCheck
} from 'lucide-react';

export default function StaticContentPage({
  initialTab = 'about', // 'about' | 'contact' | 'terms'
  currentUser = null,
  onNavigateHome,
  onNavigateJobs,
  onOpenAuth,
  showToast
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Form states for Contact tab
  const [name, setName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [subject, setSubject] = useState('Hỗ trợ tìm kiếm việc làm');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      if (showToast) showToast('Vui lòng điền đầy đủ họ tên, email và nội dung tin nhắn', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setMessage('');
      if (showToast) {
        showToast('Cảm ơn bạn! Thông tin liên hệ đã được gửi thành công. Đội ngũ JobNest sẽ phản hồi sớm nhất.', 'success');
      }
    }, 600);
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 64 }}>
      {/* Top Breadcrumb & Navigation */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #E2E8F0', padding: '14px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#64748B' }}>
            <button 
              onClick={onNavigateHome}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
            >
              Trang chủ
            </button>
            <ChevronRight size={14} />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>
              {activeTab === 'about' ? 'Giới thiệu' : activeTab === 'contact' ? 'Liên hệ' : 'Điều khoản & Chính sách'}
            </span>
          </div>

          <button
            onClick={onNavigateHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} /> Về trang chủ
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: '24px auto', padding: '0 20px' }}>
        {/* Banner Title (WF-G07) */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #7565A8 0%, #5B4E85 100%)',
            color: '#ffffff',
            borderRadius: 16,
            padding: '36px 32px',
            marginBottom: 24,
            boxShadow: '0 10px 25px -5px rgba(117, 101, 168, 0.25)'
          }}
        >
          <span 
            style={{
              display: 'inline-block',
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.2)',
              marginBottom: 12,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Nền tảng việc làm sinh viên
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            VỀ JOBNEST
          </h1>
          <p style={{ fontSize: 15, opacity: 0.92, maxWidth: 720, lineHeight: 1.6, margin: 0 }}>
            Hệ sinh thái kết nối việc làm bán thời gian, ca linh hoạt và dự án ngắn hạn dành riêng cho sinh viên Việt Nam, cam kết minh bạch, an toàn và đúng năng lực.
          </p>
        </div>

        {/* 3 Main Tabs Switcher (WF-G07 Layout) */}
        <div 
          style={{
            display: 'flex',
            gap: 12,
            borderBottom: '2px solid #E2E8F0',
            marginBottom: 28,
            overflowX: 'auto',
            paddingBottom: 2
          }}
        >
          <button
            onClick={() => setActiveTab('about')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              fontSize: 15,
              fontWeight: activeTab === 'about' ? 700 : 500,
              color: activeTab === 'about' ? '#7565A8' : '#64748B',
              borderBottom: activeTab === 'about' ? '3px solid #7565A8' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: -2,
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={18} /> Giới thiệu
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              fontSize: 15,
              fontWeight: activeTab === 'contact' ? 700 : 500,
              color: activeTab === 'contact' ? '#7565A8' : '#64748B',
              borderBottom: activeTab === 'contact' ? '3px solid #7565A8' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: -2,
              transition: 'all 0.15s ease'
            }}
          >
            <Mail size={18} /> Liên hệ
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              fontSize: 15,
              fontWeight: activeTab === 'terms' ? 700 : 500,
              color: activeTab === 'terms' ? '#7565A8' : '#64748B',
              borderBottom: activeTab === 'terms' ? '3px solid #7565A8' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: -2,
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={18} /> Điều khoản & Chính sách
          </button>
        </div>

        {/* TAB 1: GIỚI THIỆU (ABOUT) */}
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #000000', padding: '32px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                1. Sứ mệnh và Tầm nhìn
              </h2>
              <p style={{ color: '#475569', fontSize: 14.5, lineHeight: 1.7, marginBottom: 16 }}>
                JobNest ra đời nhằm giải quyết bài toán lớn nhất của sinh viên khi tìm việc làm thêm: <strong>xung đột lịch học</strong> và <strong>nguy cơ lừa đảo việc làm</strong>. Nền tảng ứng dụng thuật toán so khớp 2 tầng kết hợp đối soát lịch rảnh (availability matching), giúp sinh viên dễ dàng chọn ca làm việc phù hợp 100% với thời khóa biểu trường học.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 24 }}>
                <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#EDE9FE', color: '#7565A8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Sparkles size={20} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: '#0F172A' }}>So khớp thông minh</h3>
                  <p style={{ fontSize: 13.5, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                    Tìm kiếm việc làm bán thời gian và dự án freelance theo đúng khung giờ rảnh và chuyên ngành sinh viên.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <ShieldCheck size={20} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: '#0F172A' }}>Tin tuyển dụng xác thực</h3>
                  <p style={{ fontSize: 13.5, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                    100% tin tuyển dụng được kiểm duyệt bởi quản trị viên, xác minh giấy phép doanh nghiệp và thông tin pháp lý.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Building2 size={20} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: '#0F172A' }}>Doanh nghiệp uy tín</h3>
                  <p style={{ fontSize: 13.5, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                    Kết nối hơn 500+ doanh nghiệp vừa và nhỏ, chuỗi F&B, Agency truyền thông và công ty công nghệ tại Việt Nam.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #000000', padding: '32px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                2. Quy trình 4 bước đơn giản
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {[
                  { step: '01', title: 'Tạo hồ sơ sinh viên', desc: 'Cập nhật trường học, kỹ năng và thời khóa biểu rảnh trong tuần' },
                  { step: '02', title: 'Khám phá việc làm', desc: 'Hệ thống gợi ý việc làm bán thời gian khớp với lịch học' },
                  { step: '03', title: 'Ứng tuyển 1 chạm', desc: 'Gửi CV và đề xuất làm việc trực tiếp tới Nhà tuyển dụng' },
                  { step: '04', title: 'Nhận việc & Đánh giá', desc: 'Ký hợp đồng nhận việc và xây dựng uy tín kinh nghiệm làm việc' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: 18, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#7565A8', display: 'block', marginBottom: 6 }}>
                      {item.step}
                    </span>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>{item.title}</h4>
                    <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIÊN HỆ (CONTACT) */}
        {activeTab === 'contact' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Contact Information */}
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #000000', padding: '32px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 20 }}>
                Thông tin liên hệ & Văn phòng
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EDE9FE', color: '#7565A8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>Trụ sở chính</h4>
                    <p style={{ fontSize: 13.5, color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      Khu Công nghệ cao (SHTP), Xa lộ Hà Nội, Phường Hiệp Phú, TP. Thủ Đức, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EDE9FE', color: '#7565A8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>Email hỗ trợ</h4>
                    <p style={{ fontSize: 13.5, color: '#475569', margin: 0 }}>
                      support@jobnest.vn | partner@jobnest.vn
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EDE9FE', color: '#7565A8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>Tổng đài hỗ trợ</h4>
                    <p style={{ fontSize: 13.5, color: '#475569', margin: 0 }}>
                      1900 8888 (8:00 - 18:00 từ Thứ 2 đến Thứ 7)
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EDE9FE', color: '#7565A8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>Thời gian phản hồi</h4>
                    <p style={{ fontSize: 13.5, color: '#475569', margin: 0 }}>
                      Trong vòng 24 giờ làm việc
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Inquiry Form */}
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #000000', padding: '32px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                Gửi phản hồi hoặc yêu cầu
              </h2>
              <p style={{ fontSize: 13.5, color: '#64748B', marginBottom: 20 }}>
                Bạn có câu hỏi hoặc cần hỗ trợ về tài khoản, vui lòng điền mẫu bên dưới.
              </p>

              {submitted ? (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                  <CheckCircle2 size={40} color="#16A34A" style={{ margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#166534', margin: '0 0 6px 0' }}>
                    Gửi yêu cầu thành công!
                  </h4>
                  <p style={{ fontSize: 13.5, color: '#15803D', margin: '0 0 16px 0' }}>
                    Đội ngũ Chăm sóc khách hàng JobNest sẽ liên hệ lại bạn qua email trong thời gian sớm nhất.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: '#16A34A',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>
                      Họ và tên <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1.5px solid #CBD5E1',
                        fontSize: 13.5,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>
                      Email liên hệ <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input 
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1.5px solid #CBD5E1',
                        fontSize: 13.5,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>
                      Chủ đề yêu cầu
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1.5px solid #CBD5E1',
                        fontSize: 13.5,
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Hỗ trợ tìm kiếm việc làm">Hỗ trợ tìm kiếm việc làm</option>
                      <option value="Hỗ trợ Nhà tuyển dụng đăng tin">Hỗ trợ Nhà tuyển dụng đăng tin</option>
                      <option value="Báo cáo lỗi kỹ thuật">Báo cáo lỗi kỹ thuật</option>
                      <option value="Hợp tác doanh nghiệp / trường học">Hợp tác doanh nghiệp / trường học</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>
                      Nội dung tin nhắn <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <textarea 
                      rows={4}
                      required
                      placeholder="Vui lòng mô tả chi tiết yêu cầu của bạn..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1.5px solid #CBD5E1',
                        fontSize: 13.5,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '11px 20px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#7565A8',
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginTop: 4
                    }}
                  >
                    <Send size={16} /> {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ĐIỀU KHOẢN & CHÍNH SÁCH (TERMS & POLICIES) */}
        {activeTab === 'terms' && (
          <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #000000', padding: '36px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
              QUY CHẾ HOẠT ĐỘNG & THỎA THUẬN DỊCH VỤ JOBNEST
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>
              Cập nhật lần cuối: Tháng 11/2026. Áp dụng cho tất cả thành viên (Sinh viên & Nhà tuyển dụng) tham gia hệ thống.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
              <section>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                  1. Quy định đối với Nhà tuyển dụng
                </h3>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Nghiêm cấm tuyệt đối việc yêu cầu người tìm việc đặt cọc, nộp tiền thế chân, mua tài liệu hoặc trả phí phỏng vấn dưới mọi hình thức.</li>
                  <li>Mọi tin tuyển dụng phải nêu rõ mô tả công việc, mức thù lao (theo giờ hoặc theo dự án) và địa điểm làm việc cụ thể.</li>
                  <li>Không đăng tải nội dung tuyển dụng trái pháp luật, vi phạm thuần phong mỹ tục hoặc kinh doanh đa cấp trái phép.</li>
                  <li>Thanh toán thù lao đúng hạn và đầy đủ cho sinh viên sau khi hoàn thành nhiệm vụ theo thỏa thuận.</li>
                </ul>
              </section>

              <section>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                  2. Trách nhiệm của Sinh viên / Người tìm việc
                </h3>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Cung cấp thông tin hồ sơ trung thực về trình độ học vấn, kỹ năng chuyên môn và lịch rảnh.</li>
                  <li>Đảm bảo tuân thủ giờ giấc ca làm việc và hoàn thành đúng trách nhiệm đã cam kết với Nhà tuyển dụng.</li>
                  <li>Nếu có sự cố đột xuất không thể tham gia ca làm việc, phải thông báo trước tối thiểu 12 giờ cho Nhà tuyển dụng.</li>
                  <li>Báo cáo kịp thời các hành vi có dấu hiệu lừa đảo thông qua nút "Báo cáo vi phạm" trên hệ thống.</li>
                </ul>
              </section>

              <section>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                  3. Cơ chế giải quyết tranh chấp & Báo cáo vi phạm
                </h3>
                <p style={{ margin: 0 }}>
                  JobNest đóng vai trò trung gian xác thực và bảo vệ quyền lợi hợp pháp của đôi bên. Khi phát sinh khiếu nại hoặc tranh chấp về tiền lương/kết quả công việc, Quản trị viên JobNest sẽ can thiệp thẩm tra nhật ký làm việc (Work Assignment Logs) và đưa ra quyết định xử lý trong vòng 48 giờ.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                  4. Chính sách bảo mật dữ liệu cá nhân
                </h3>
                <p style={{ margin: 0 }}>
                  JobNest cam kết bảo mật tuyệt đối số điện thoại, email và hồ sơ cá nhân của người dùng theo quy định của Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân. Dữ liệu chỉ được chia sẻ cho Nhà tuyển dụng khi sinh viên chủ động nộp đơn ứng tuyển.
                </p>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

