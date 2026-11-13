import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, Lock, HelpCircle, 
  CheckCircle2, X, ChevronRight, ExternalLink, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedModal, Button } from '../ui';

export default function PolicyModal({
  isOpen,
  onClose,
  initialTab = 'about' // 'about' | 'terms' | 'privacy' | 'regulations' | 'sitemap'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const tabs = [
    { id: 'about', label: 'Về JobNest & Nền tảng', icon: Info },
    { id: 'terms', label: 'Điều khoản sử dụng', icon: FileText },
    { id: 'privacy', label: 'Chính sách bảo mật', icon: Lock },
    { id: 'regulations', label: 'Quy chế & Giải quyết tranh chấp', icon: ShieldCheck },
    { id: 'sitemap', label: 'Sơ đồ website', icon: HelpCircle },
  ];

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="840px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}>
        {/* Modal Top Bar */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #EAE5F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FBFAFD'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img 
              src="/logo.jpg" 
              alt="JobNest Logo" 
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                objectFit: 'contain',
                background: '#ffffff',
                border: '1px solid #EAE5F0'
              }}
            />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#30283A', margin: 0 }}>
                Chính Sách & Quy Định Nền Tảng JobNest
              </h3>
              <p style={{ fontSize: 12, color: '#777080', margin: '2px 0 0 0' }}>
                Tuân thủ pháp luật Việt Nam & Bảo vệ tối đa quyền lợi sinh viên
              </p>
            </div>
          </div>

          <motion.button 
            onClick={onClose}
            whileHover={{ scale: 1.05, backgroundColor: '#EFEAF5' }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: 6,
              borderRadius: 6,
              color: '#777080',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent'
            }}
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Tab Selection Bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #EAE5F0',
          background: '#FFFFFF',
          overflowX: 'auto'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 18px',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#594675' : '#777080',
                  background: isActive ? '#F9E5DC' : 'transparent',
                  borderBottom: isActive ? '2px solid #594675' : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} color={isActive ? '#594675' : '#806A9F'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, fontSize: 13.5, color: '#30283A', lineHeight: 1.65 }}>
          {activeTab === 'about' && (
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#594675', marginBottom: 10 }}>
                VỀ JOBNEST — NỀN TẢNG VIỆC LÀM SINH VIÊN THEO LỊCH RẢNH
              </h4>
              <p style={{ marginBottom: 14 }}>
                <strong>JOBNEST</strong> là nền tảng công nghệ kết nối việc làm bán thời gian (Part-time) và toàn thời gian (Full-time) được thiết kế chuyên biệt dành riêng cho sinh viên tại Việt Nam.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 18 }}>
                <div style={{ background: '#FAF8FC', border: '1px solid #EAE5F0', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, color: '#594675', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🎯 Sứ mệnh cốt lõi
                  </div>
                  <div style={{ fontSize: 13, color: '#554E60', lineHeight: 1.6 }}>
                    Giúp sinh viên tự chủ tài chính và tích lũy kinh nghiệm thực tế mà không phải đánh đổi hay làm gián đoạn lịch học tập trên giảng đường.
                  </div>
                </div>

                <div style={{ background: '#FAF8FC', border: '1px solid #EAE5F0', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, color: '#594675', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⚙️ Thuật toán đối chiếu 2 tầng
                  </div>
                  <div style={{ fontSize: 13, color: '#554E60', lineHeight: 1.6 }}>
                    Tự động loại bỏ các ca làm trùng lịch học, rồi gợi ý việc làm gần trường, đúng chuyên ngành và mức thù lao phù hợp.
                  </div>
                </div>

                <div style={{ background: '#FAF8FC', border: '1px solid #EAE5F0', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, color: '#594675', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🛡️ Minh bạch & Bảo vệ sinh viên
                  </div>
                  <div style={{ fontSize: 13, color: '#554E60', lineHeight: 1.6 }}>
                    100% doanh nghiệp được xác thực thông tin; kiểm duyệt tin đăng nghiêm ngặt; không thu bất kỳ khoản phí môi giới nào từ sinh viên.
                  </div>
                </div>

                <div style={{ background: '#FAF8FC', border: '1px solid #EAE5F0', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, color: '#594675', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🤝 Đánh giá hai chiều uy tín
                  </div>
                  <div style={{ fontSize: 13, color: '#554E60', lineHeight: 1.6 }}>
                    Cơ chế đánh giá và phản hồi 2 chiều sau mỗi hợp đồng làm việc giúp sinh viên xây dựng hồ sơ năng lực uy tín cho tương lai.
                  </div>
                </div>
              </div>

              <div style={{ background: '#FFF9F6', border: '1px solid #F5DCD0', borderRadius: 10, padding: 14, fontSize: 13, color: '#6A4F44', lineHeight: 1.6 }}>
                💡 <strong>Cam kết bảo mật:</strong> Thông tin cá nhân của bạn được lưu trữ an toàn, mật khẩu được mã hóa và chỉ những người có quyền mới xem được hồ sơ của bạn.
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#594675', marginBottom: 10 }}>
                1. ĐIỀU KHOẢN DỊCH VỤ DÀNH CHO NGƯỜI DÙNG JOBNEST
              </h4>
              <p style={{ marginBottom: 12 }}>
                Chào mừng bạn đến với <strong>JobNest</strong> — Nền tảng việc làm Part-time & Full-time kết nối sinh viên và nhà tuyển dụng. Bằng việc truy cập hoặc sử dụng hệ thống, bạn đồng ý tuân thủ các điều khoản sau:
              </p>
              <ul style={{ paddingLeft: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Tài khoản sinh viên:</strong> Sinh viên cam kết cung cấp thông tin học vấn, kỹ năng và hồ sơ CV trung thực. Không sử dụng tài khoản để nhận công việc thay cho người khác.</li>
                <li><strong>Tài khoản nhà tuyển dụng:</strong> Doanh nghiệp cam kết đăng tải việc làm có thù lao minh bạch, mô tả công việc chính xác, không thu phí tuyển dụng từ sinh viên dưới bất kỳ hình thức nào.</li>
                <li><strong>Thanh toán và thù lao:</strong> Mức lương và hình thức thanh toán (theo giờ hoặc theo dự án) phải được thỏa thuận rõ ràng trong hợp đồng thỏa thuận công việc.</li>
                <li><strong>Quyền chấm dứt dịch vụ:</strong> JobNest có quyền tạm ngưng hoặc khóa vĩnh viễn các tài khoản vi phạm chuẩn mực đạo đức hoặc quy định pháp luật.</li>
              </ul>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#594675', marginBottom: 10 }}>
                2. CHÍNH SÁCH BẢO MẬT VÀ DỮ LIỆU CÁ NHÂN (GDPR & NĐ 13/2023/NĐ-CP)
              </h4>
              <p style={{ marginBottom: 12 }}>
                JobNest cam kết bảo vệ thông tin cá nhân và dữ liệu nhạy cảm của toàn bộ sinh viên và doanh nghiệp tham gia nền tảng:
              </p>
              <ul style={{ paddingLeft: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Mã hóa mật khẩu:</strong> Mật khẩu người dùng được băm an toàn 100% bằng thuật toán <code>bcrypt</code> với salt rounds tiêu chuẩn công nghiệp.</li>
                <li><strong>Xác thực phiên làm việc:</strong> Sử dụng chuẩn <code>JSON Web Token (JWT)</code> mã hóa bất đối xứng để bảo vệ các thao tác ứng tuyển và quản lý tin đăng.</li>
                <li><strong>Quyền riêng tư hồ sơ:</strong> Thông tin số điện thoại và email cá nhân của sinh viên chỉ được hiển thị cho Nhà tuyển dụng sau khi đơn ứng tuyển được duyệt hợp lệ.</li>
                <li><strong>Không chia sẻ dữ liệu thứ ba:</strong> JobNest tuyệt đối không thương mại hóa hoặc bán dữ liệu người dùng cho bất kỳ đơn vị quảng cáo nào.</li>
              </ul>
            </div>
          )}

          {activeTab === 'regulations' && (
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#594675', marginBottom: 10 }}>
                3. QUY CHẾ HOẠT ĐỘNG VÀ CƠ CHẾ GIẢI QUYẾT TRANH CHẤP (UC-09 & UC-10)
              </h4>
              <p style={{ marginBottom: 12 }}>
                Nhằm tạo môi trường làm việc công bằng, tin cậy cho sinh viên, JobNest thiết lập cơ chế kiểm soát chất lượng 2 chiều:
              </p>
              <ul style={{ paddingLeft: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Đánh giá 2 chiều (UC-09):</strong> Cả Sinh viên và Nhà tuyển dụng đều có quyền chấm điểm (1 - 5 sao) và gửi nhận xét sau khi công việc hoàn thành.</li>
                <li><strong>Cơ chế khiếu nại (UC-10):</strong> Nếu xảy ra bất đồng về thù lao, khối lượng công việc hoặc thời gian ca làm, người dùng có thể gửi yêu cầu giải quyết khiếu nại trực tiếp đến Ban Quản trị.</li>
                <li><strong>Thời hạn xử lý:</strong> Ban Quản trị JobNest sẽ tiếp nhận và phản hồi giải quyết trong vòng 24 - 48 giờ làm việc.</li>
              </ul>
            </div>
          )}

          {activeTab === 'sitemap' && (
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#594675', marginBottom: 10 }}>
                4. SƠ ĐỒ WEBSITE & TRUNG TÂM TÍNH NĂNG JOBNEST
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                <div style={{ background: '#FBFAFD', border: '1px solid #EAE5F0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: '#594675', marginBottom: 6 }}>🎓 Dành cho Sinh viên</div>
                  <div style={{ fontSize: 12.5, color: '#777080', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>• Tìm kiếm việc làm part-time</div>
                    <div>• Quản lý đơn ứng tuyển</div>
                    <div>• Hồ sơ năng lực & CV</div>
                    <div>• Đánh giá nhà tuyển dụng</div>
                  </div>
                </div>

                <div style={{ background: '#FBFAFD', border: '1px solid #EAE5F0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: '#594675', marginBottom: 6 }}>🏢 Nhà tuyển dụng</div>
                  <div style={{ fontSize: 12.5, color: '#777080', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>• Đăng tin tuyển dụng</div>
                    <div>• Quản lý tin đăng</div>
                    <div>• Duyệt hồ sơ ứng viên</div>
                    <div>• Hồ sơ doanh nghiệp</div>
                  </div>
                </div>

                <div style={{ background: '#FBFAFD', border: '1px solid #EAE5F0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: '#594675', marginBottom: 6 }}>🛡️ Quản trị hệ thống</div>
                  <div style={{ fontSize: 12.5, color: '#777080', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>• Quản lý người dùng</div>
                    <div>• Phê duyệt tin tuyển dụng</div>
                    <div>• Quản trị thông báo</div>
                    <div>• Thống kê việc làm</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 28px',
          borderTop: '1px solid #EAE5F0',
          background: '#FBFAFD',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: 12, color: '#777080' }}>
            Phiên bản tài liệu: 2.4 (Cập nhật tháng 11/2026)
          </span>
          <Button
            variant="primary"
            onClick={onClose}
            style={{ padding: '8px 20px', fontSize: 13 }}
          >
            Đã hiểu & Đóng
          </Button>
        </div>
      </div>
    </AnimatedModal>
  );
}
