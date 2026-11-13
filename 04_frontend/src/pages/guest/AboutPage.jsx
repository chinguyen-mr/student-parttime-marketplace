import React, { useState, useEffect } from 'react';
import { 
  Building2, Cpu, BookOpen, Mail, HelpCircle, 
  FileText, ShieldCheck, Lock, Map, ArrowLeft, 
  CheckCircle2, Send, Phone, MapPin, Clock, 
  Sparkles, ExternalLink, ChevronDown, ChevronRight,
  Shield, Check, AlertCircle, Info, Calendar
} from 'lucide-react';

export default function AboutPage({
  initialSection = 'about',
  currentUser = null,
  onNavigateHome,
  onNavigateJobs,
  onOpenAuth,
  showToast
}) {
  const [activeSection, setActiveSection] = useState(initialSection);

  // Sync when initialSection prop changes
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // Contact Form State
  const [contactName, setContactName] = useState(currentUser?.full_name || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [contactRole, setContactRole] = useState(currentUser?.role || 'STUDENT');
  const [contactSubject, setContactSubject] = useState('Hỗ trợ tìm việc làm theo lịch');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSending, setContactSending] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const sections = [
    { id: 'guide', label: 'Hướng dẫn sử dụng', icon: BookOpen, desc: 'Quy trình 5 bước tìm việc dễ dàng' },
    { id: 'about', label: 'Về JobNest', icon: Building2, desc: 'Sứ mệnh & giá trị cốt lõi' },
    { id: 'platform', label: 'Giới thiệu nền tảng', icon: Cpu, desc: 'Công nghệ & so khớp 2 tầng' },
    { id: 'contact', label: 'Liên hệ & Hỗ trợ', icon: Mail, desc: 'Kênh hỗ trợ sinh viên & đối tác' },
    { id: 'faq', label: 'Hỏi đáp (FAQ)', icon: HelpCircle, desc: 'Câu hỏi thường gặp' },
    { id: 'terms', label: 'Thỏa thuận sử dụng', icon: FileText, desc: 'Điều khoản dịch vụ' },
    { id: 'privacy', label: 'Quy định bảo mật', icon: Lock, desc: 'Bảo vệ dữ liệu cá nhân' },
    { id: 'regulations', label: 'Quy chế sàn giao dịch', icon: ShieldCheck, desc: 'Giải quyết tranh chấp' },
    { id: 'sitemap', label: 'Sơ đồ website', icon: Map, desc: 'Bản đồ tính năng nền tảng' },
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) {
      if (showToast) showToast('Vui lòng nhập nội dung tin nhắn cần hỗ trợ', 'error');
      return;
    }
    setContactSending(true);
    setTimeout(() => {
      setContactSending(false);
      setContactMessage('');
      if (showToast) {
        showToast('Cảm ơn bạn! Yêu cầu hỗ trợ đã được gửi thành công. Đội ngũ JobNest sẽ phản hồi trong 24 giờ.');
      }
    }, 600);
  };

  const currentSectionMeta = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 64 }}>
      {/* Top Breadcrumb & Header Banner */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1.5px solid #000000',
        padding: '24px 36px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                color: '#6B7280',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary, #7565A8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              <ArrowLeft size={16} />
              <span>Trang chủ</span>
            </button>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary, #7565A8)' }}>
              Giới thiệu & Quy chế
            </span>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
              {currentSectionMeta.label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
                Trung tâm Thông tin & Quy chuẩn JobNest
              </h1>
              <p style={{ fontSize: 14.5, color: '#4B5563', margin: '6px 0 0 0', maxWidth: '65ch' }}>
                Minh bạch pháp lý, hướng dẫn vận hành và cam kết bảo vệ tối đa quyền lợi cho học tập và việc làm sinh viên.
              </p>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(117, 101, 168, 0.08)',
              border: '1.5px solid rgba(117, 101, 168, 0.3)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 700,
              color: '#7565A8'
            }}>
              <ShieldCheck size={16} />
              <span>Cập nhật: Tháng 11/2026 (v2.4)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Container */}
      <div style={{ maxWidth: 1200, margin: '32px auto 0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '290px 1fr',
          gap: 28,
          alignItems: 'start'
        }}>
          {/* Left Navigation Sidebar */}
          <aside style={{
            background: '#ffffff',
            border: '1.5px solid #000000',
            borderRadius: 12,
            padding: '12px 8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            position: 'sticky',
            top: 90
          }}>
            <div style={{ padding: '8px 12px 12px 12px', borderBottom: '1px solid #E5E7EB', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Danh mục nội dung
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {sections.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    style={{
                      background: isActive ? '#F3EFF9' : 'transparent',
                      color: isActive ? '#7565A8' : '#374151',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease, color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={17} color={isActive ? '#7565A8' : '#6B7280'} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: isActive ? 800 : 600 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 1 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <ChevronRight size={16} color="#7565A8" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Main Content Card */}
          <main style={{
            background: '#ffffff',
            border: '1.5px solid #000000',
            borderRadius: 14,
            padding: '36px 40px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            minHeight: 600
          }}>

            {/* =========================================================================
                SECTION 1: VỀ JOBNEST
                ========================================================================= */}
            {activeSection === 'about' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    background: 'rgba(117, 101, 168, 0.1)',
                    color: '#7565A8',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 800
                  }}>
                    Mục 01
                  </span>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Giới thiệu chung</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
                  Về Nền Tảng JobNest — Việc Làm Sinh Viên Theo Lịch Rảnh
                </h2>

                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 20 }}>
                  <strong>JOBNEST</strong> là sàn thương mại dịch vụ việc làm bán thời gian (Part-time) và toàn thời gian (Full-time) tiên phong tại Việt Nam, ra đời từ đề tài tốt nghiệp chuyên sâu nhằm giải quyết triệt để bài toán: <em>Làm sao để sinh viên có thu nhập trang trải cuộc sống mà không bị xung đột, gián đoạn hay trễ nải việc học trên giảng đường?</em>
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 28 }}>
                  <div style={{ background: '#FAF8FC', border: '1.5px solid #EAE5F0', borderRadius: 12, padding: 18 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#7565A8', marginBottom: 8 }}>
                      🎯 Sứ mệnh của chúng tôi
                    </div>
                    <div style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.6 }}>
                      Tạo dựng một cầu nối minh bạch, an toàn và tự động hóa cao nhất giữa hàng nghìn sinh viên năng động và cộng đồng doanh nghiệp uy tín, bảo đảm tiêu chí "Học không gián đoạn, làm có thù lao xứng đáng".
                    </div>
                  </div>

                  <div style={{ background: '#FFF9F6', border: '1.5px solid #F5DCD0', borderRadius: 12, padding: 18 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#C86B43', marginBottom: 8 }}>
                      🌟 Tầm nhìn chiến lược
                    </div>
                    <div style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.6 }}>
                      Trở thành giải pháp hướng nghiệp và việc làm part-time số 1 tại các trường đại học, số hóa hoàn toàn từ khâu khai báo thời khóa biểu, đối chiếu ca làm việc đến ký kết thỏa thuận điện tử và nhận xét 2 chiều.
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '24px 0 14px 0' }}>
                  4 Giá Trị Cốt Lõi Khác Biệt
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 24 }}>
                  {[
                    { title: '1. Lịch học là ưu tiên số 1', desc: 'Không cần dò tìm thủ công. Hệ thống tự loại bỏ mọi công việc trùng khung giờ lên lớp hay lịch thi học kỳ.' },
                    { title: '2. 100% Không thu phí sinh viên', desc: 'Sinh viên tìm việc, nhận gợi ý AI và ứng tuyển hoàn toàn miễn phí, tuyệt đối không có phí cọc hay phí môi giới.' },
                    { title: '3. Doanh nghiệp & Tin tuyển dụng kiểm duyệt', desc: 'Mọi bài đăng đều phải công khai mức thù lao rõ ràng theo giờ hoặc theo dự án, có địa chỉ và mã số thuế xác thực.' },
                    { title: '4. Tích lũy uy tín & Hồ sơ năng lực', desc: 'Mỗi công việc hoàn thành đều được nhà tuyển dụng xác nhận và đánh giá sao, tạo thành CV thực tế giá trị cho hồ sơ xin việc tương lai.' }
                  ].map((v, i) => (
                    <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: 14, marginBottom: 4 }}>{v.title}</div>
                      <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55 }}>{v.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: '#F0FDF4',
                  border: '1.5px solid #BBF7D0',
                  borderRadius: 10,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14
                }}>
                  <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: 13.5, color: '#166534', lineHeight: 1.55 }}>
                    <strong>Cam kết trách nhiệm:</strong> Mọi khiếu nại về thù lao, tranh chấp ca làm hoặc tin tuyển dụng không đúng sự thật đều được Đội ngũ Hỗ trợ giải quyết dứt điểm trong vòng 24 giờ làm việc.
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                SECTION 2: GIỚI THIỆU NỀN TẢNG & THUẬT TOÁN SO KHỚP 2 TẦNG
                ========================================================================= */}
            {activeSection === 'platform' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: 'rgba(117, 101, 168, 0.1)', color: '#7565A8', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
                    Mục 02
                  </span>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Công nghệ lõi</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
                  Kiến Trúc Kỹ Thuật & Thuật Toán So Khớp Lịch 2 Tầng
                </h2>

                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 20 }}>
                  Khác với các website tuyển dụng thông thường chỉ lọc theo từ khóa đơn giản, <strong>JobNest</strong> đối chiếu lịch rảnh của bạn với ca làm của từng công việc: trước tiên loại bỏ mọi việc trùng giờ học, sau đó chấm điểm mức độ phù hợp theo thời gian, chuyên ngành, khu vực và mức lương.
                </p>

                {/* Diagram Box */}
                <div style={{ background: '#FAF8FC', border: '1.5px solid #7565A8', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#7565A8', margin: '0 0 14px 0' }}>
                    Quy Trình Hoạt Động Của Thuật Toán Đối Chiếu:
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 800, color: '#DC2626', fontSize: 14, marginBottom: 4 }}>
                        TẦNG 1: HARD FILTER (BỘ LỌC CỨNG — BẢO VỆ LỊCH HỌC 100%)
                      </div>
                      <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.55 }}>
                        Hệ thống so sánh ma trận thời gian giữa lịch học đã khai báo của sinh viên và ca làm việc của doanh nghiệp. Nếu phát hiện <strong>bất kỳ sự trùng lặp nào</strong> về thứ trong tuần hoặc khung giờ (kể cả thời gian di chuyển), tin tuyển dụng sẽ bị loại bỏ ngay lập tức và không bao giờ xuất hiện trong danh sách gợi ý.
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 800, color: '#16A34A', fontSize: 14, marginBottom: 4 }}>
                        TẦNG 2: SOFT COMPOSITE SCORING (CHẤM ĐIỂM TƯƠNG THÍCH ĐA TIÊU CHÍ)
                      </div>
                      <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.55, marginBottom: 8 }}>
                        Các công việc vượt qua Tầng 1 sẽ được tính điểm mức độ phù hợp (tối đa 100%) theo công thức trọng số tiêu chuẩn:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, color: '#166534', fontSize: 15 }}>50%</div>
                          <div style={{ fontSize: 11.5, color: '#15803D' }}>Khớp thời gian rảnh</div>
                        </div>
                        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, color: '#1E40AF', fontSize: 15 }}>20%</div>
                          <div style={{ fontSize: 11.5, color: '#1D4ED8' }}>Đúng chuyên ngành</div>
                        </div>
                        <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, color: '#6B21A8', fontSize: 15 }}>15%</div>
                          <div style={{ fontSize: 11.5, color: '#7E22CE' }}>Khoảng cách địa lý</div>
                        </div>
                        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, color: '#9A3412', fontSize: 15 }}>15%</div>
                          <div style={{ fontSize: 11.5, color: '#C2410C' }}>Mức thù lao mong đợi</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '24px 0 14px 0' }}>
                  An Toàn & Bảo Mật Thông Tin
                </h3>

                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                  <li><strong>Mật khẩu được mã hóa:</strong> JobNest không lưu mật khẩu của bạn ở dạng có thể đọc được, kể cả quản trị viên cũng không xem được.</li>
                  <li><strong>Phân quyền rõ ràng:</strong> Sinh viên, nhà tuyển dụng và quản trị viên chỉ xem được những thông tin thuộc quyền của mình.</li>
                  <li><strong>Kiểm duyệt tin tuyển dụng:</strong> Mọi tin đăng đều được kiểm duyệt trước khi hiển thị để hạn chế tin giả, lừa đảo.</li>
                </ul>
              </div>
            )}

            {/* =========================================================================
                SECTION 3: HƯỚNG DẪN SỬ DỤNG
                ========================================================================= */}
            {activeSection === 'guide' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: 'rgba(117, 101, 168, 0.1)', color: '#7565A8', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
                    Mục 03
                  </span>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Cẩm nang thao tác</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
                  Hướng Dẫn Sử Dụng Nền Tảng JobNest
                </h2>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#7565A8', margin: '20px 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎓 Dành Cho Sinh Viên Tìm Việc (Quy trình 5 bước)</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {[
                    { step: 'Bước 1', title: 'Đăng ký tài khoản sinh viên', desc: 'Sử dụng email cá nhân hoặc email trường (.edu.vn) để xác thực danh tính sinh viên.' },
                    { step: 'Bước 2', title: 'Cài đặt thời khóa biểu & lịch rảnh', desc: 'Vào mục "Lịch rảnh", chọn các buổi sáng/chiều/tối bạn có thể đi làm từ Thứ 2 đến Chủ nhật.' },
                    { step: 'Bước 3', title: 'Xem danh sách việc làm gợi ý thông minh', desc: 'Hệ thống tự động sắp xếp các công việc có điểm phù hợp từ cao xuống thấp (Top 1: 95% - 98%).' },
                    { step: 'Bước 4', title: 'Ứng tuyển 1-chạm', desc: 'Nộp hồ sơ ứng tuyển bằng CV mặc định cho việc làm Part-time hoặc Full-time chỉ với một lần bấm.' },
                    { step: 'Bước 5', title: 'Nhận việc, làm việc an toàn & tích lũy uy tín', desc: 'Ký kết hợp đồng phân công công việc điện tử, nhận thù lao đầy đủ và nhận đánh giá sao từ NTD.' }
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#7565A8',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                        flexShrink: 0
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#111827', fontSize: 14.5 }}>{s.title}</div>
                        <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#C86B43', margin: '24px 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🏢 Dành Cho Nhà Tuyển Dụng (Quy trình 4 bước)</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { step: 'Bước 1', title: 'Đăng ký hồ sơ doanh nghiệp', desc: 'Cung cấp tên công ty, mã số thuế, địa chỉ trụ sở và số điện thoại liên hệ đại diện.' },
                    { step: 'Bước 2', title: 'Tạo tin tuyển dụng ghi rõ ca làm việc', desc: 'Bắt buộc ghi rõ ngày làm trong tuần, khung giờ bắt đầu - kết thúc, mức thù lao minh bạch.' },
                    { step: 'Bước 3', title: 'Tiếp nhận hồ sơ & Duyệt ứng viên', desc: 'Xem hồ sơ ứng viên, kỹ năng và lịch rảnh, sau đó chấp nhận hoặc từ chối kèm lý do.' },
                    { step: 'Bước 4', title: 'Nghiệm thu sản phẩm & Đánh giá sinh viên', desc: 'Kiểm tra chất lượng công việc, thanh toán thù lao và gửi đánh giá năng lực cho sinh viên.' }
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, background: '#FFF9F6', border: '1px solid #F5DCD0', borderRadius: 10, padding: 14 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#F4B99D',
                        color: '#29263A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                        flexShrink: 0
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#111827', fontSize: 14.5 }}>{s.title}</div>
                        <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                SECTION 4: LIÊN HỆ & HỖ TRỢ
                ========================================================================= */}
            {activeSection === 'contact' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: 'rgba(117, 101, 168, 0.1)', color: '#7565A8', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
                    Mục 04
                  </span>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Kênh kết nối trực tiếp</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
                  Liên Hệ Ban Quản Trị & Hỗ Trợ Kỹ Thuật
                </h2>

                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 24 }}>
                  Nếu bạn gặp khó khăn trong quá trình cài đặt lịch học, ứng tuyển, đăng tin tuyển dụng hoặc cần phản ánh vi phạm, vui lòng liên hệ với chúng tôi qua các kênh dưới đây hoặc điền trực tiếp vào biểu mẫu:
                </p>

                {/* Contact Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16 }}>
                    <MapPin size={22} color="#7565A8" style={{ marginBottom: 8 }} />
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>Địa chỉ văn phòng</div>
                    <div style={{ fontSize: 13, color: '#4B5563', marginTop: 4, lineHeight: 1.5 }}>
                      69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh, TP. Hồ Chí Minh
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16 }}>
                    <Phone size={22} color="#7565A8" style={{ marginBottom: 8 }} />
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>Hotline hỗ trợ</div>
                    <div style={{ fontSize: 13, color: '#4B5563', marginTop: 4, lineHeight: 1.5 }}>
                      <strong>1900 6868</strong> (08:00 - 18:00, Thứ 2 - Thứ 7)
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16 }}>
                    <Mail size={22} color="#7565A8" style={{ marginBottom: 8 }} />
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>Email liên hệ</div>
                    <div style={{ fontSize: 13, color: '#4B5563', marginTop: 4, lineHeight: 1.5 }}>
                      support@jobnest.vn<br />hotro.sinhvien@vlu.edu.vn
                    </div>
                  </div>
                </div>

                {/* Direct Contact Form */}
                <div style={{ background: '#FAF8FC', border: '1.5px solid #000000', borderRadius: 12, padding: 24 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Send size={18} color="#7565A8" />
                    <span>Gửi Yêu Cầu Hỗ Trợ Trực Tuyến</span>
                  </h3>

                  <form onSubmit={handleContactSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          Họ và tên của bạn *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn An"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1.5px solid #CBD5E1',
                            borderRadius: 8,
                            fontSize: 14,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          Địa chỉ Email liên hệ *
                        </label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="an.nguyen@vlu.edu.vn"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1.5px solid #CBD5E1',
                            borderRadius: 8,
                            fontSize: 14,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          Bạn là ai?
                        </label>
                        <select
                          value={contactRole}
                          onChange={(e) => setContactRole(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1.5px solid #CBD5E1',
                            borderRadius: 8,
                            fontSize: 14,
                            background: '#ffffff',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="STUDENT">Sinh viên tìm việc</option>
                          <option value="EMPLOYER">Nhà tuyển dụng / Doanh nghiệp</option>
                          <option value="PARTNER">Đối tác đào tạo / Trường học</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          Chủ đề yêu cầu
                        </label>
                        <input
                          type="text"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          placeholder="Ví dụ: Báo cáo tin đăng sai thông tin"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1.5px solid #CBD5E1',
                            borderRadius: 8,
                            fontSize: 14,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                        Chi tiết nội dung cần hỗ trợ *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải để chúng tôi hỗ trợ nhanh nhất..."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: 8,
                          fontSize: 14,
                          lineHeight: 1.5,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactSending}
                      style={{
                        background: '#7565A8',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '12px 28px',
                        fontSize: 14.5,
                        fontWeight: 700,
                        cursor: contactSending ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 2px 6px rgba(117, 101, 168, 0.3)'
                      }}
                    >
                      <Send size={16} />
                      <span>{contactSending ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ ngay'}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* =========================================================================
                SECTION 5: HỎI ĐÁP FAQ
                ========================================================================= */}
            {activeSection === 'faq' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: 'rgba(117, 101, 168, 0.1)', color: '#7565A8', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
                    Mục 05
                  </span>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Giải đáp thắc mắc</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
                  Câu Hỏi Thường Gặp (FAQ)
                </h2>

                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 20 }}>
                  Dưới đây là các câu hỏi phổ biến nhất của sinh viên và nhà tuyển dụng khi tham gia hệ sinh thái việc làm JobNest:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    {
                      q: '1. Sinh viên có phải đóng bất kỳ khoản phí nào khi tìm việc trên JobNest không?',
                      a: 'Tuyệt đối KHÔNG. JobNest cam kết 100% miễn phí trọn đời cho sinh viên. Mọi hành vi thu tiền đặt cọc, phí hồ sơ, phí đào tạo hay phí giữ chỗ từ phía nhà tuyển dụng đều là vi phạm nghiêm trọng và sẽ bị khóa tài khoản vĩnh viễn.'
                    },
                    {
                      q: '2. Cơ chế so khớp lịch học của JobNest hoạt động như thế nào?',
                      a: 'Khi bạn cập nhật các buổi rảnh trong tuần vào mục "Lịch rảnh", JobNest sẽ loại bỏ toàn bộ công việc có ca làm trùng với giờ học. Sau đó hệ thống chấm điểm mức độ phù hợp dựa trên thời gian, chuyên ngành, khu vực và mức lương để đưa công việc phù hợp nhất lên đầu.'
                    },
                    {
                      q: '3. Làm sao tôi biết công việc nào là an toàn và đáng tin cậy?',
                      a: 'Tất cả các tin đăng trên JobNest đều trải qua quy trình kiểm duyệt tự động và thủ công của Ban quản trị. Những nhà tuyển dụng đã xác minh giấy phép kinh doanh/mã số thuế sẽ có huy hiệu kiểm duyệt màu xanh. Ngoài ra, bạn có thể xem điểm đánh giá sao từ các sinh viên đã từng làm việc trước đó.'
                    },
                    {
                      q: '4. Sự khác biệt giữa việc làm Part-time và Full-time là gì?',
                      a: 'Việc làm Part-time là các ca làm theo giờ, linh hoạt theo thời khóa biểu (như phục vụ cafe, thu ngân, trợ lý văn phòng), thường tính lương theo giờ (HOURLY). Việc làm Full-time là làm việc giờ hành chính cả tuần, tính lương theo tháng (MONTHLY), phù hợp sinh viên năm cuối hoặc đã tốt nghiệp.'
                    },
                    {
                      q: '5. Nếu nhà tuyển dụng không thanh toán thù lao đúng hẹn thì xử lý như thế nào?',
                      a: 'JobNest cung cấp quy trình phân công công việc điện tử (Work Assignment) ghi nhận rõ thỏa thuận. Nếu xảy ra tranh chấp thù lao, bạn chỉ cần bấm "Báo cáo vi phạm" hoặc gửi yêu cầu tại mục Liên hệ, Ban quản trị sẽ đối chiếu bằng chứng và xử lý kỷ luật doanh nghiệp, đồng thời hỗ trợ bảo vệ quyền lợi sinh viên.'
                    }
                  ].map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        style={{
                          border: isOpen ? '1.5px solid #7565A8' : '1px solid #E5E7EB',
                          borderRadius: 10,
                          background: isOpen ? '#FAF8FC' : '#ffffff',
                          overflow: 'hidden',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          <span style={{ fontSize: 15, fontWeight: 700, color: isOpen ? '#7565A8' : '#111827' }}>
                            {faq.q}
                          </span>
                          <ChevronDown
                            size={18}
                            color={isOpen ? '#7565A8' : '#9CA3AF'}
                            style={{
                              transform: isOpen ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s ease',
                              flexShrink: 0
                            }}
                          />
                        </button>
                        {isOpen && (
                          <div style={{
                            padding: '0 20px 18px 20px',
                            fontSize: 14,
                            lineHeight: 1.65,
                            color: '#4B5563',
                            borderTop: '1px solid #F3F4F6'
                          }}>
                            <div style={{ paddingTop: 12 }}>{faq.a}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================================
                SECTION 6: THỎA THUẬN SỬ DỤNG
                ========================================================================= */}
            {activeSection === 'terms' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: 'rgba(117, 101, 168, 0.1)', color: '#7565A8', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
                    Mục 06
                  </span>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Pháp lý & Quy ước</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
                  Thỏa Thuận Sử Dụng Dịch Vụ JobNest
                </h2>

                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#374151', marginBottom: 16 }}>
                  Chào mừng bạn đến với JobNest. Khi truy cập hoặc đăng ký tài khoản trên nền tảng, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản ràng buộc sau đây:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 14, color: '#374151', lineHeight: 1.65 }}>
                  <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#111827', marginBottom: 6 }}>1. Trách nhiệm của Sinh viên</div>
                    <div>• Cung cấp thông tin trung thực về học vấn, kỹ năng và lịch rảnh biểu mẫu.</div>
                    <div>• Tuân thủ đúng ca làm việc đã được phân công; trường hợp nghỉ đột xuất phải thông báo trước tối thiểu 12 giờ cho nhà tuyển dụng.</div>
                    <div>• Không sử dụng tài khoản để nhận công việc thay cho bên thứ ba.</div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#111827', marginBottom: 6 }}>2. Trách nhiệm của Nhà tuyển dụng</div>
                    <div>• Đăng tải nội dung việc làm lành mạnh, phù hợp lứa tuổi sinh viên, tuân thủ Bộ luật Lao động Việt Nam.</div>
                    <div>• Công khai mức thù lao, ca làm việc cụ thể và thanh toán đầy đủ, đúng hạn như đã thỏa thuận trong hợp đồng.</div>
                    <div>• Tuyệt đối không thu bất kỳ khoản chi phí nào dưới danh nghĩa đồng phục, hồ sơ, thẻ nhân viên.</div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#111827', marginBottom: 6 }}>3. Quyền của Ban Quản Trị JobNest</div>
                    <div>• Có quyền tạm dừng hoặc khóa tài khoản vĩnh viễn đối với bất kỳ cá nhân hay tổ chức nào vi phạm đạo đức, quấy rối hoặc gian lận tài chính.</div>
                    <div>• Cung cấp dữ liệu lịch sử ứng tuyển cho cơ quan có thẩm quyền khi có yêu cầu điều tra theo quy định của pháp luật.</div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                SECTION 7: QUY ĐỊNH BẢO MẬT
                ========================================================================= */}
            {activeSection === 'privacy' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: 'rgba(117, 101, 168, 0.1)', color: '#7565A8', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
                    Mục 07
                  </span>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>An toàn thông tin</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
                  Chính Sách Bảo Mật Dữ Liệu Cá Nhân
                </h2>

                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#374151', marginBottom: 16 }}>
                  JobNest cam kết thực hiện nghiêm túc các quy định bảo vệ dữ liệu cá nhân theo <strong>Nghị định 13/2023/NĐ-CP</strong> của Chính phủ Việt Nam và tiêu chuẩn quốc tế GDPR:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontWeight: 800, color: '#7565A8', marginBottom: 4 }}>🔐 Mã hóa dữ liệu</div>
                    <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.55 }}>
                      Mật khẩu và thông tin đăng nhập được mã hóa bất đối xứng qua thuật toán băm <code>bcrypt</code> với độ an toàn cao.
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontWeight: 800, color: '#7565A8', marginBottom: 4 }}>🛡️ Ẩn thông tin nhạy cảm</div>
                    <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.55 }}>
                      Số điện thoại và email cá nhân của sinh viên được bảo vệ và chỉ chia sẻ cho NTD sau khi đơn ứng tuyển được chấp nhận hợp lệ.
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontWeight: 800, color: '#7565A8', marginBottom: 4 }}>🚫 Không thương mại hóa dữ liệu</div>
                    <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.55 }}>
                      JobNest tuyệt đối không chia sẻ, mua bán hay chuyển giao hồ sơ người dùng cho các bên quảng cáo hoặc dịch vụ spam thứ ba.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                SECTION 8: QUY CHẾ HOẠT ĐỘNG SÀN GIAO DỊCH
                ========================================================================= */}
            {activeSection === 'regulations' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: 'rgba(117, 101, 168, 0.1)', color: '#7565A8', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
                    Mục 08
                  </span>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Chuẩn mực sàn</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
                  Quy Chế Hoạt Động & Cơ Chế Xử Lý Tranh Chấp (UC-09 & UC-10)
                </h2>

                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#374151', marginBottom: 16 }}>
                  Quy chế sàn thương mại dịch vụ việc làm sinh viên JobNest được xây dựng nhằm thiết lập môi trường tuyển dụng văn minh, đúng quy định pháp luật thương mại điện tử:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5, color: '#374151', lineHeight: 1.6 }}>
                  <div style={{ background: '#FAF8FC', border: '1px solid #EAE5F0', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontWeight: 800, color: '#7565A8', marginBottom: 4 }}>1. Tiêu chuẩn đăng tin tuyển dụng</div>
                    <div>Mỗi bài đăng bắt buộc công khai rõ ràng: Tên vị trí, địa chỉ làm việc thực tế, thời gian bắt đầu - kết thúc ca làm, mức lương tối thiểu và yêu cầu kỹ năng cụ thể. Cấm triệt để các tin tuyển dụng đa cấp, tài chính mờ ám hoặc cá cược trực tuyến.</div>
                  </div>

                  <div style={{ background: '#FAF8FC', border: '1px solid #EAE5F0', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontWeight: 800, color: '#7565A8', marginBottom: 4 }}>2. Quy trình xử lý tranh chấp 3 bước</div>
                    <div><strong>Bước 1 (Tiếp nhận):</strong> Bên khiếu nại gửi báo cáo vi phạm kèm hình ảnh/bằng chứng tin nhắn qua hệ thống.<br />
                    <strong>Bước 2 (Xác minh):</strong> Ban quản trị đối chiếu nhật ký ca làm, hợp đồng điện tử và liên hệ giải trình cả 2 phía trong 12 giờ.<br />
                    <strong>Bước 3 (Chế tài):</strong> Nếu doanh nghiệp vi phạm thù lao, hệ thống đóng băng quyền đăng tin và yêu cầu bồi hoàn cho sinh viên.</div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                SECTION 9: SƠ ĐỒ TRANG WEB
                ========================================================================= */}
            {activeSection === 'sitemap' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: 'rgba(117, 101, 168, 0.1)', color: '#7565A8', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>
                    Mục 09
                  </span>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Cấu trúc hệ thống</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
                  Sơ Đồ Trang Web & Bản Đồ Tính Năng Nền Tảng
                </h2>

                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#374151', marginBottom: 20 }}>
                  Tổng hợp cấu trúc phân hệ chức năng trên hệ thống JobNest:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div style={{ background: '#F8FAFC', border: '1.5px solid #000000', borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: 800, color: '#111827', fontSize: 15, marginBottom: 8 }}>
                      🌐 Công khai (Khách vãng lai)
                    </div>
                    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: '#4B5563', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <li>Trang chủ & Banner tìm việc</li>
                      <li>Khám phá việc làm theo ngành</li>
                      <li>Bộ lọc tìm kiếm đa tiêu chí</li>
                      <li>Trung tâm giới thiệu & quy chế</li>
                      <li>Cổng đăng nhập / Đăng ký</li>
                    </ul>
                  </div>

                  <div style={{ background: '#FAF8FC', border: '1.5px solid #7565A8', borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: 800, color: '#7565A8', fontSize: 15, marginBottom: 8 }}>
                      🎓 Không gian Sinh viên
                    </div>
                    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: '#4B5563', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <li>Quản lý lịch học & lịch rảnh</li>
                      <li>Gợi ý việc làm theo điểm so khớp</li>
                      <li>Theo dõi hồ sơ ứng tuyển</li>
                      <li>Hồ sơ năng lực & CV cá nhân</li>
                      <li>Đánh giá doanh nghiệp & hợp đồng</li>
                    </ul>
                  </div>

                  <div style={{ background: '#FFF9F6', border: '1.5px solid #F4B99D', borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: 800, color: '#C86B43', fontSize: 15, marginBottom: 8 }}>
                      🏢 Không gian Doanh nghiệp
                    </div>
                    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: '#4B5563', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <li>Đăng tin tuyển dụng ca làm</li>
                      <li>Quản lý danh sách tin đăng</li>
                      <li>Duyệt hồ sơ & chọn ứng viên</li>
                      <li>Đánh giá sinh viên sau dự án</li>
                    </ul>
                  </div>

                  <div style={{ background: '#FEF2F2', border: '1.5px solid #F87171', borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: 800, color: '#B91C1C', fontSize: 15, marginBottom: 8 }}>
                      🛡️ Quản trị hệ thống (Admin)
                    </div>
                    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: '#4B5563', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <li>Quản trị người dùng & phân quyền</li>
                      <li>Phê duyệt & kiểm duyệt tin đăng</li>
                      <li>Xử lý báo cáo tranh chấp</li>
                      <li>Báo cáo thống kê cơ sở dữ liệu</li>
                      <li>Nhật ký hệ thống (Audit Logs)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

