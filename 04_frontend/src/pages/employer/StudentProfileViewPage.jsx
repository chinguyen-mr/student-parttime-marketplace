import React, { useState, useEffect } from 'react';
import { 
  User, School, BookOpen, Mail, Phone, Calendar, 
  Clock, Download, ArrowLeft, ExternalLink, ShieldCheck, 
  Briefcase, Award, CheckCircle2, AlertCircle, RefreshCw, ChevronRight
} from 'lucide-react';
import { API_BASE, formatApiError } from '../../config/api';

export default function StudentProfileViewPage({
  studentId,
  currentUser,
  onNavigateBack,
  showToast
}) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentProfile = async () => {
    if (!studentId) {
      setError('Thiếu mã định danh sinh viên');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/profile/${studentId}`, {
        headers: currentUser?.token ? {
          'Authorization': `Bearer ${currentUser.token}`
        } : {}
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Bạn không có quyền xem thông tin hồ sơ của ứng viên này');
        }
        if (res.status === 404) {
          throw new Error('Không tìm thấy thông tin sinh viên');
        }
        throw new Error('Không thể tải thông tin sinh viên');
      }

      const data = await res.json();
      setStudent(data.data || data);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải hồ sơ sinh viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, [studentId, currentUser]);

  const daysOfWeek = [
    { key: 2, label: 'Thứ Hai' },
    { key: 3, label: 'Thứ Ba' },
    { key: 4, label: 'Thứ Tư' },
    { key: 5, label: 'Thứ Năm' },
    { key: 6, label: 'Thứ Sáu' },
    { key: 7, label: 'Thứ Bảy' },
    { key: 1, label: 'Chủ Nhật' },
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Top Breadcrumb Navigation */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #E2E8F0', padding: '14px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#64748B' }}>
            <button 
              onClick={onNavigateBack}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
            >
              Danh sách ứng viên
            </button>
            <ChevronRight size={14} />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Hồ sơ sinh viên #{studentId}</span>
          </div>

          <button
            onClick={onNavigateBack}
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
            <ArrowLeft size={14} /> Quay lại danh sách
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '24px auto', padding: '0 20px' }}>
        {/* ================= STATE 1: LOADING ================= */}
        {loading && (
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 36, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#E2E8F0' }} className="animate-pulse" />
              <div style={{ flex: 1 }}>
                <div style={{ height: 26, width: '35%', background: '#E2E8F0', borderRadius: 6, marginBottom: 10 }} className="animate-pulse" />
                <div style={{ height: 16, width: '50%', background: '#E2E8F0', borderRadius: 4 }} className="animate-pulse" />
              </div>
            </div>
            <div style={{ height: 160, background: '#F8FAFC', borderRadius: 12 }} className="animate-pulse" />
          </div>
        )}

        {/* ================= STATE 2: ERROR ================= */}
        {!loading && error && (
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '48px 24px', textAlign: 'center', border: '1px solid #FCA5A5' }}>
            <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>{error}</h3>
            <p style={{ color: '#64748B', fontSize: 14, margin: '0 auto 20px auto' }}>
              Vui lòng kiểm tra lại quyền truy cập hoặc tài khoản Nhà tuyển dụng của bạn.
            </p>
            <button
              onClick={fetchStudentProfile}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 8,
                background: '#7565A8',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} /> Thử lại
            </button>
          </div>
        )}

        {/* ================= STATE 3: SUCCESS & CONTENT (WF-E13) ================= */}
        {!loading && !error && student && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top Student Header Card */}
            <div 
              style={{
                background: '#ffffff',
                borderRadius: 16,
                border: '1.5px solid #000000',
                padding: '28px 32px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div 
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: '50%',
                      border: '2px solid #000000',
                      background: '#EDE9FE',
                      color: '#7565A8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {student.avatar_url ? (
                      <img 
                        src={student.avatar_url} 
                        alt={student.full_name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={46} />
                    )}
                  </div>

                  {/* Student details */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {student.full_name || 'Hồ sơ sinh viên'}
                      </h1>
                      <span 
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: '#DCFCE7',
                          color: '#166534',
                          border: '1px solid #86EFAC',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <ShieldCheck size={13} /> Đã xác thực sinh viên
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, color: '#475569', fontSize: 13.5, marginBottom: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <School size={15} color="#7565A8" />
                        {student.school || student.university || 'Đại học Quốc gia TP.HCM'}
                      </span>
                      {student.major && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <BookOpen size={15} color="#7565A8" />
                          Chuyên ngành: <strong>{student.major}</strong>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#64748B' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Mail size={14} color="#64748B" />
                        {student.email || 'Chưa cập nhật'}
                      </span>
                      {student.phone && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Phone size={14} color="#64748B" />
                          {student.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Contact Actions (WF-E13: strictly NO Accept button here) */}
                <div style={{ display: 'flex', gap: 10 }}>
                  {student.email && (
                    <a
                      href={`mailto:${student.email}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1.5px solid #CBD5E1',
                        color: '#334155',
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <Mail size={14} /> Gửi email
                    </a>
                  )}
                  {student.phone && (
                    <a
                      href={`tel:${student.phone}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1.5px solid #CBD5E1',
                        color: '#334155',
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <Phone size={14} /> Gọi điện
                    </a>
                  )}
                </div>
              </div>

              {/* Bio */}
              {student.bio && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#334155', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
                    Giới thiệu bản thân
                  </h4>
                  <p style={{ color: '#475569', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
                    {student.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Grid Sections: Skills, Experience & CV */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              {/* Left Column: Skills & Availability */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Skills */}
                <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #000000', padding: '24px 28px' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>
                    Kỹ năng chuyên môn
                  </h3>
                  {student.skills ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(Array.isArray(student.skills) ? student.skills : String(student.skills).split(',')).map((sk, idx) => (
                        <span 
                          key={idx}
                          style={{
                            padding: '4px 12px',
                            borderRadius: 6,
                            background: '#EDE9FE',
                            color: '#6B21A8',
                            fontSize: 12.5,
                            fontWeight: 600,
                            border: '1px solid #DDD6FE'
                          }}
                        >
                          {String(sk).trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13.5, color: '#64748B', margin: 0 }}>Chưa cập nhật danh sách kỹ năng.</p>
                  )}
                </div>

                {/* Availability Schedule */}
                <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #000000', padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Calendar size={18} color="#7565A8" />
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Lịch rảnh trong tuần
                    </h3>
                  </div>

                  {student.availabilities && student.availabilities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {daysOfWeek.map(day => {
                        const daySlots = student.availabilities.filter(s => s.day_of_week === day.key);
                        if (daySlots.length === 0) return null;
                        return (
                          <div 
                            key={day.key}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              background: '#F8FAFC',
                              borderRadius: 8,
                              border: '1px solid #E2E8F0',
                              fontSize: 13
                            }}
                          >
                            <strong style={{ color: '#0F172A' }}>{day.label}</strong>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {daySlots.map((slot, sIdx) => (
                                <span 
                                  key={sIdx}
                                  style={{
                                    fontSize: 11.5,
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    background: '#DCFCE7',
                                    color: '#166534',
                                    fontWeight: 600
                                  }}
                                >
                                  {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13.5, color: '#64748B', margin: 0 }}>
                      Sinh viên chưa cài đặt lịch rảnh công khai.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Work Experience & CV */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Work Experience */}
                <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #000000', padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Briefcase size={18} color="#7565A8" />
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Kinh nghiệm & Dự án
                    </h3>
                  </div>

                  <div style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6 }}>
                    {student.experience ? (
                      <div style={{ whiteSpace: 'pre-line' }}>{student.experience}</div>
                    ) : (
                      <p style={{ color: '#64748B', fontStyle: 'italic', margin: 0 }}>
                        Chưa có lịch sử làm việc ghi nhận trên nền tảng.
                      </p>
                    )}
                  </div>
                </div>

                {/* CV Attachment View */}
                <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #000000', padding: '24px 28px' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
                    Hồ sơ CV đính kèm
                  </h3>

                  {student.default_cv_url || student.cv_url ? (
                    <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Download size={22} color="#7565A8" />
                        <div>
                          <strong style={{ display: 'block', fontSize: 13.5, color: '#0F172A' }}>
                            {(student.default_cv_url || student.cv_url).split('/').pop() || 'Curriculum_Vitae.pdf'}
                          </strong>
                          <span style={{ fontSize: 12, color: '#64748B' }}>Tài liệu CV chính thức</span>
                        </div>
                      </div>
                      <a
                        href={student.default_cv_url || student.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '7px 14px',
                          borderRadius: 6,
                          background: '#7565A8',
                          color: '#ffffff',
                          fontSize: 12.5,
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <ExternalLink size={13} /> Mở CV
                      </a>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13.5, color: '#64748B', margin: 0 }}>
                      Sinh viên chưa đính kèm file CV PDF.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Note & Back Button */}
            <div 
              style={{
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              <span style={{ fontSize: 13, color: '#64748B' }}>
                Lưu ý: Để chấp nhận và tuyển dụng ứng viên này, vui lòng chuyển sang mục <strong>Quản lý ứng viên / Chọn ứng viên (WF-E08)</strong>.
              </span>

              <button
                type="button"
                onClick={onNavigateBack}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  background: '#7565A8',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Quay lại danh sách ứng viên
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

