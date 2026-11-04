import React, { useState } from 'react';
import { Star, Award, CheckCircle2, User, Building2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedModal, Button } from '../ui';

export default function ReviewModal({
  isOpen,
  onClose,
  targetName = 'Trần Gia Bảo',
  targetRole = 'Sinh viên Đại học Văn Lang',
  jobTitle = 'Thực tập sinh Marketing',
  jobTime = '01/10/2026 - 25/10/2026',
  onSubmitReview,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const satisfactionLabels = [
    { star: 1, text: '1 - Rất không hài lòng' },
    { star: 2, text: '2 - Không hài lòng' },
    { star: 3, text: '3 - Bình thường' },
    { star: 4, text: '4 - Hài lòng' },
    { star: 5, text: '5 - Rất hài lòng' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    await onSubmitReview({ rating, comment });
    setSubmitting(false);
    onClose();
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="580px"
    >
      <div style={{ padding: '24px 28px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header (Matching Wireframe Screen 13 & PlantUML Salt #2) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="badge badge-primary">JOBNEST REVIEWS</span>
              <span className="badge badge-success">UC-09: Đánh giá hai chiều</span>
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
              ĐÁNH GIÁ SAU CÔNG VIỆC
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
              Chia sẻ nhận xét về quá trình làm việc sau khi công việc kết thúc
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-lavender-surface)',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Thông tin công việc (Card) */}
        <div style={{
          background: 'var(--color-background)',
          borderRadius: 10,
          border: '1px solid var(--color-border)',
          padding: 16,
          marginBottom: 18,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', marginBottom: 8 }}>
            THÔNG TIN CÔNG VIỆC
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: '#334155' }}>
            <div>Vị trí: <strong>{jobTitle}</strong></div>
            <div>Thời gian: <span>{jobTime}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span>Trạng thái:</span>
              <span className="badge badge-success" style={{ fontSize: 11 }}>Đã hoàn thành</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--color-text)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16,
            }}>
              {targetName.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{targetName}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{targetRole}</div>
            </div>
          </div>
        </div>

        {/* Mức độ hài lòng & Rating (Matching Wireframe Screen 13) */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
              MỨC ĐỘ HÀI LÒNG (*)
            </label>

            {/* Satisfaction pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
              {satisfactionLabels.slice(0, 4).map(item => (
                <button
                  key={item.star}
                  type="button"
                  onClick={() => setRating(item.star)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: rating === item.star ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                    background: rating === item.star ? '#eef2ff' : '#ffffff',
                    color: rating === item.star ? '#4338ca' : '#475569',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.text}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRating(5)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                marginBottom: 14,
                border: rating === 5 ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                background: rating === 5 ? '#f0fdf4' : '#ffffff',
                color: rating === 5 ? '#15803d' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              {satisfactionLabels[4].text} (Khuyên dùng)
            </button>

            {/* Interactive Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--color-background)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, color: '#475569', marginRight: 6 }}>Chọn số sao:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 2,
                    color: (hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1',
                  }}
                >
                  <Star size={24} fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'} />
                </motion.button>
              ))}
              <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                ({rating} / 5 sao)
              </span>
            </div>
          </div>

          {/* Nội dung nhận xét */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              NỘI DUNG NHẬN XÉT (*)
            </label>
            <textarea
              rows={4}
              required
              placeholder="Nhập nhận xét về thái độ, kỹ năng, tinh thần trách nhiệm và hiệu quả công việc..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', fontSize: 13 }}
            />
          </div>

          {/* Ghi chú wireframe */}
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: 20 }}>
            (*) Đánh giá chỉ được gửi sau khi công việc chuyển sang trạng thái Đã hoàn thành và sẽ được lưu trữ vĩnh viễn trên hồ sơ để xây dựng uy tín cộng đồng.
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="secondary" type="button" onClick={onClose} style={{ padding: '8px 18px', fontSize: 13 }}>
              HỦY
            </Button>
            <Button variant="primary" type="submit" disabled={submitting} style={{ padding: '8px 24px', fontSize: 13 }}>
              {submitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
            </Button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
