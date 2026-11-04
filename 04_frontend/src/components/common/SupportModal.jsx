import React, { useState } from 'react';
import { 
  Phone, Mail, MapPin, Clock, MessageSquare, 
  Send, CheckCircle2, X, Headphones, HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedModal, Button, CustomDropdown } from '../ui';

export default function SupportModal({
  isOpen,
  onClose,
  currentUser,
}) {
  const [topic, setTopic] = useState('STUDENT_INQUIRY');
  const [senderName, setSenderName] = useState(currentUser?.full_name || '');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      // Keep feedback visible briefly
    }, 300);
  };

  const handleReset = () => {
    setSent(false);
    setMessage('');
    onClose();
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="760px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}>
        {/* Top Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #EAE5F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FBFAFD'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#F9E5DC',
              color: '#594675',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #F2A184'
            }}>
              <Headphones size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#30283A', margin: 0 }}>
                Trung Tâm Hỗ Trợ & Chăm Sóc Khách Hàng JobNest
              </h3>
              <p style={{ fontSize: 12, color: '#777080', margin: '2px 0 0 0' }}>
                Hỗ trợ sinh viên tìm việc và đồng hành cùng nhà tuyển dụng 24/7
              </p>
            </div>
          </div>

          <motion.button 
            onClick={handleReset}
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

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* Dual Hotline Contact Cards (Inspired by Vieclam24h pattern) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 20 }}>
            {/* Card 1: Hỗ trợ sinh viên */}
            <div style={{
              background: '#FBFAFD',
              border: '1px solid #EAE5F0',
              borderRadius: 12,
              padding: '16px 18px',
              borderLeft: '4px solid #594675',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Phone size={16} color="#594675" />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#30283A' }}>
                  Hotline cho Sinh viên & Người tìm việc
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#777080', margin: '0 0 10px 0' }}>
                Hỗ trợ nộp hồ sơ, tạo CV, tư vấn việc làm và xác thực hợp đồng
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                <div><strong>Miền Nam (TP.HCM):</strong> <a href="tel:02871092424" style={{ color: '#594675', fontWeight: 700, textDecoration: 'none' }}>(028) 7109 2424</a></div>
                <div><strong>Miền Bắc (Hà Nội):</strong> <a href="tel:02473092424" style={{ color: '#594675', fontWeight: 700, textDecoration: 'none' }}>(024) 7309 2424</a></div>
              </div>
            </div>

            {/* Card 2: Hỗ trợ nhà tuyển dụng */}
            <div style={{
              background: '#FBFAFD',
              border: '1px solid #EAE5F0',
              borderRadius: 12,
              padding: '16px 18px',
              borderLeft: '4px solid #F2A184',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Headphones size={16} color="#F2A184" />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#30283A' }}>
                  Hotline cho Doanh nghiệp & Tuyển dụng
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#777080', margin: '0 0 10px 0' }}>
                Tư vấn đăng tin tuyển dụng, chọn lọc ứng viên sinh viên chất lượng
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                <div><strong>Hotline tuyển dụng:</strong> <a href="tel:02871082424" style={{ color: '#594675', fontWeight: 700, textDecoration: 'none' }}>(028) 7108 2424</a></div>
                <div><strong>Email đối tác:</strong> <a href="mailto:doitac@jobnest.vn" style={{ color: '#594675', fontWeight: 700, textDecoration: 'none' }}>doitac@jobnest.vn</a></div>
              </div>
            </div>
          </div>

          {/* Location & Operating Hours */}
          <div style={{
            background: '#F9E5DC',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            fontSize: 12.5,
            color: '#30283A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} color="#594675" />
              <span><strong>Giờ làm việc:</strong> Thứ 2 - Thứ 6 (08:00 - 17:30) | Thứ 7 (08:00 - 12:00)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={16} color="#594675" />
              <span>Khoa CNTT — Đại học Văn Lang (69/68 Đặng Thùy Trâm, Q. Bình Thạnh)</span>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          {sent ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#EDFDF5',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <CheckCircle2 size={28} />
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#30283A', marginBottom: 6 }}>
                Yêu cầu hỗ trợ đã được tiếp nhận!
              </h4>
              <p style={{ fontSize: 13, color: '#777080', maxWidth: 460, margin: '0 auto 18px' }}>
                Bộ phận hỗ trợ sinh viên của JobNest đã ghi nhận nội dung câu hỏi và sẽ phản hồi qua email <strong>{senderEmail}</strong> trong vòng tối đa 2 giờ làm việc.
              </p>
              <Button variant="primary" onClick={handleReset} style={{ padding: '8px 20px', fontSize: 13 }}>
                Hoàn tất
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#30283A', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={16} color="#594675" /> Gửi tin nhắn yêu cầu hỗ trợ trực tuyến
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#30283A', marginBottom: 4 }}>
                    Họ và tên của bạn *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    style={{ width: '100%', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#30283A', marginBottom: 4 }}>
                    Email nhận phản hồi *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    style={{ width: '100%', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#30283A', marginBottom: 4 }}>
                  Chủ đề cần hỗ trợ *
                </label>
                <CustomDropdown
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  options={[
                    { value: 'STUDENT_INQUIRY', label: '🎓 Hướng dẫn tìm việc & Ứng tuyển cho sinh viên' },
                    { value: 'EMPLOYER_INQUIRY', label: '🏢 Tư vấn đăng tin tuyển dụng & Tìm kiếm ứng viên' },
                    { value: 'DISPUTE_COMPLAINT', label: '⚠️ Khiếu nại thù lao hoặc hợp đồng làm việc' },
                    { value: 'TECHNICAL_HELP', label: '💻 Lỗi kỹ thuật tài khoản hoặc đăng nhập' },
                    { value: 'OTHER', label: '❓ Câu hỏi khác' },
                  ]}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#30283A', marginBottom: 4 }}>
                  Nội dung chi tiết *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mô tả cụ thể vấn đề hoặc nội dung cần tư vấn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <Button variant="secondary" type="button" onClick={handleReset} style={{ padding: '8px 16px', fontSize: 13 }}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" style={{ padding: '8px 22px', fontSize: 13 }}>
                  <Send size={14} /> Gửi yêu cầu hỗ trợ
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
}
