import React, { useState, useMemo, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { SHIFTS, normalizeSlots } from '../../components/student/AvailabilityEditor';
import { DAY_SHORT, WEEK_ORDER } from '../../utils/jobDisplay';

/** Tóm tắt lịch rảnh: "Sáng T2, T4 · Tối T5" */
function summarizeSlots(slots) {
  return SHIFTS.map(sh => {
    const days = slots.filter(s => s.start_time.startsWith(sh.start))
      .map(s => s.day_of_week).sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b))
      .map(d => DAY_SHORT[d]);
    return days.length ? `${sh.label} ${days.join(', ')}` : null;
  }).filter(Boolean).join(' · ');
}
import { 
  Search, MapPin, Briefcase, Filter, Sparkles, X, 
  ChevronDown, DollarSign, Clock, Calendar, Check, ArrowRight,
  Code2, Palette, Megaphone, GraduationCap, Utensils, 
  Store, Users, ShieldCheck, CheckCircle2, ChevronRight,
  Sparkle, Building2, Eye, Star, HeartHandshake, Layers
} from 'lucide-react';
import JobListSkeleton from '../../components/common/JobListSkeleton';
import EmptyState from '../../components/common/EmptyState';
import JobCard from '../../components/common/JobCard';

// 8 Job Categories aligned with real DB categories
const POPULAR_CATEGORIES = [
  { id: 'it', name: 'Công nghệ thông tin', dbCategory: 'Công nghệ thông tin', icon: Code2, desc: 'Lập trình viên, Web, Tester, Data' },
  { id: 'fnb', name: 'Nhà hàng / F&B', dbCategory: 'Nhà hàng / F&B', icon: Utensils, desc: 'Phục vụ, Pha chế, Phụ bếp' },
  { id: 'sales', name: 'Bán hàng / Thu ngân', dbCategory: 'Bán hàng / Thu ngân', icon: Store, desc: 'Cửa hàng tiện lợi, Siêu thị, Shop' },
  { id: 'tutor', name: 'Gia sư / Giáo dục', dbCategory: 'Gia sư / Giáo dục', icon: GraduationCap, desc: 'Dạy kèm Toán, Tiếng Anh, Trợ giảng' },
  { id: 'design', name: 'Thiết kế đồ họa', dbCategory: 'Thiết kế đồ họa', icon: Palette, desc: 'Banner, Poster, Video Editor, UI' },
  { id: 'marketing', name: 'Marketing / Truyền thông', dbCategory: 'Marketing / Truyền thông', icon: Megaphone, desc: 'Content Creator, Fanpage, Seeding' },
  { id: 'event', name: 'Sự kiện / PG / PB', dbCategory: 'Sự kiện / PG / PB', icon: Users, desc: 'Hoạt náo viên, Lễ tân, Check-in' },
  { id: 'admin', name: 'Hành chính / Văn phòng', dbCategory: 'Hành chính / Văn phòng', icon: Layers, desc: 'Nhập liệu, Trợ lý part-time, Soạn thảo' }
];

export default function HomePage({
  jobs = [],
  loading = false,
  currentUser = null,
  onSelectJob,
  onApply,
  isSaved,
  onToggleSave,
  onSearch,
  onSelectCategory,
  onPostJobClick,
  onExploreAllJobs,
  onNavigateTab,
  onOpenAuth,
  onHoverStart,
  onHoverEnd,
  onViewCompany,
  onOpenStudentTab
}) {
  // Featured Jobs Tab Filter: 'ALL' | 'PART_TIME' | 'FULL_TIME'
  const [featuredTab, setFeaturedTab] = useState('ALL');

  // Đề xuất thật cho sinh viên đang đăng nhập, dựa trên lịch rảnh đã lưu trong hồ sơ
  // (null = chưa có dữ liệu → hiển thị ví dụ A/B)
  const [personalMatches, setPersonalMatches] = useState(null);
  const [mySlots, setMySlots] = useState([]);
  useEffect(() => {
    setPersonalMatches(null);
    setMySlots([]);
    if (currentUser?.role !== 'STUDENT' || !currentUser?.token) return undefined;
    let cancelled = false;
    const headers = { Authorization: `Bearer ${currentUser.token}` };
    fetch(`${API_BASE}/jobs/recommended?limit=2`, { headers })
      .then(res => res.json())
      .then(data => {
        if (cancelled || !data?.success) return;
        const list = Array.isArray(data.data?.jobs) ? data.data.jobs : [];
        if (data.data?.student_has_availability && list.length > 0) setPersonalMatches(list);
      })
      .catch(() => {}); // Lỗi mạng → giữ ví dụ A/B
    fetch(`${API_BASE}/profile/availability`, { headers })
      .then(res => res.json())
      .then(data => { if (!cancelled && data?.success && Array.isArray(data.data)) setMySlots(normalizeSlots(data.data)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [currentUser?.role, currentUser?.token]);

  const isStudent = currentUser?.role === 'STUDENT';
  const openAvailability = () => (onOpenStudentTab ? onOpenStudentTab('availability') : onNavigateTab && onNavigateTab('student_dashboard'));

  // 6 Featured Open Jobs
  const featuredJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    let filtered = jobs.filter(j => j.status === 'OPEN' || !j.status);
    if (featuredTab !== 'ALL') {
      filtered = filtered.filter(j => (j.work_type || j.job_type) === featuredTab);
    }
    return filtered.slice(0, 6);
  }, [jobs, featuredTab]);

  // Compute category job counts from actual open jobs
  const categoryCounts = useMemo(() => {
    const counts = {};
    if (Array.isArray(jobs)) {
      jobs.forEach(j => {
        const cat = j.category || '';
        counts[cat] = (counts[cat] || 0) + 1;
      });
    }
    return counts;
  }, [jobs]);

  // Scroll to section helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="home-page-container" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '16px 20px 60px 20px' }}>
      
      {/* =========================================================================
          SECTION 02: HERO BANNER (STUDENT-FIRST, CONVERSION-FOCUSED)
          Thông điệp: "Tìm việc làm thêm phù hợp với lịch học của bạn."
          ========================================================================= */}
      <section 
        className="home-hero-section"
        style={{
          background: '#4E3E6B',
          borderRadius: 16,
          padding: '36px 40px 32px 40px',
          marginBottom: 36,
          color: '#ffffff'
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(320px, 0.95fr)',
          gap: 36,
          alignItems: 'center'
        }}>
          {/* Left Column: Headline, Value Proposition, Action CTAs */}
          <div>
            {/* Badge: ✨ Nền tảng việc làm thêm sinh viên */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: 30,
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: 16
            }}>
              <span style={{ color: '#F4B99D' }}>✨</span>
              <span>JOBNEST • KẾT NỐI THEO THỜI GIAN BIỂU SINH VIÊN</span>
            </div>

            {/* Main Headline: H1 */}
            <h1 style={{
              fontSize: 'clamp(26px, 3.4vw, 42px)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.22,
              margin: '0 0 14px 0',
              letterSpacing: '-0.025em'
            }}>
              Tìm việc làm thêm <span style={{ color: '#F4B99D', textDecoration: 'underline', textDecorationColor: 'rgba(244, 185, 157, 0.5)' }}>phù hợp với lịch học</span> của bạn.
            </h1>

            {/* Subheadline */}
            <p style={{
              fontSize: '15.5px',
              color: '#FFFFFF',
              fontWeight: 500,
              lineHeight: 1.6,
              margin: '0 0 20px 0',
              maxWidth: '56ch'
            }}>
              Không cần đánh đổi việc học để đi làm. JOBNEST giúp bạn khám phá các cơ hội việc làm bán thời gian phù hợp với thời gian rảnh, gần trường và đúng nhu cầu cá nhân.
            </p>

            {/* Value bullets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 26 }}>
              {[
                'Chủ động chọn ca làm',
                'Lọc sạch ca trùng lịch thi',
                'Minh bạch thù lao & Không phí'
              ].map((text, i) => (
                <div key={i} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#ffffff',
                  background: 'rgba(0, 0, 0, 0.14)',
                  padding: '4px 12px',
                  borderRadius: 20
                }}>
                  <span style={{ color: '#F4B99D', fontWeight: 800 }}>✓</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Hero CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
              <button
                type="button"
                onClick={onExploreAllJobs}
                style={{
                  background: '#F4B99D',
                  color: '#29263A',
                  border: 'none',
                  borderRadius: 10,
                  padding: '13px 26px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: 'none',
                  transition: 'background-color 0.15s ease, transform 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = '#E8A484';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.background = '#F4B99D';
                }}
              >
                <span>Khám phá việc làm</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('schedule-matching')}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: 10,
                  padding: '12px 22px',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background-color 0.15s ease, border-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.borderColor = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
              >
                <Sparkles size={16} color="#F4B99D" />
                <span>Tìm việc theo lịch rảnh</span>
              </button>

              {!currentUser?.token && onOpenAuth && (
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  style={{
                    background: 'transparent',
                    color: 'rgba(255, 255, 255, 0.85)',
                    border: 'none',
                    padding: '8px 12px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Đăng ký tài khoản sinh viên
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Schedule Matching Showcase */}
          <div style={{
            background: '#FFFFFF',
            color: '#1F2937',
            borderRadius: 12,
            padding: '20px 22px',
            border: 'none',
            boxShadow: 'none'
          }}>
            {/* Showcase Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: '#EDE9FE',
                  color: '#4C1D95',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: 8
                }}>
                  VÍ DỤ MINH HỌA SO KHỚP
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#4B5563' }}>(Thuật toán 2 tầng)</span>
              </div>
              <span style={{
                background: '#DCFCE7',
                color: '#14532D',
                border: '1px solid #86EFAC',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 8
              }}>
                MÔ PHỎNG: 91% PHÙ HỢP
              </span>
            </div>

            {/* Student Availability Row */}
            <div style={{
              paddingBottom: 12,
              marginBottom: 12,
              borderBottom: '1px solid #F3F4F6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                <Calendar size={14} color="#6B7280" />
                <span>Lịch rảnh sinh viên (SV Nguyễn Văn Chí)</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                <span style={{ background: '#5B21B6', color: '#ffffff', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>
                  Thứ 2, 4, 6
                </span>
                <span style={{ background: '#F3F4F6', color: '#1F2937', fontSize: 12.5, fontWeight: 600, padding: '3px 10px', borderRadius: 6 }}>
                  Ca Sáng: 07:30 - 11:30
                </span>
                <span style={{ fontSize: 12, color: '#15803D', fontWeight: 700, marginLeft: 2 }}>
                  ✓ Đã đồng bộ
                </span>
              </div>
            </div>

            {/* Matched Job Row */}
            <div style={{
              paddingBottom: 12,
              marginBottom: 10,
              borderBottom: '1px solid #F3F4F6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                    Phục vụ Part-time The Coffee Chill House
                  </div>
                  <div style={{ fontSize: 12, color: '#4B5563', marginTop: 2 }}>
                    The Coffee Chill House • Quận Bình Thạnh, TP.HCM
                  </div>
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>
                  35.000 đ/h
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12.5, color: '#15803D', fontWeight: 600 }}>
                <span>✓</span>
                <span>Yêu cầu ca: Thứ 2, 4, 6 (08:00 - 11:30) — Khớp 100% thời gian!</span>
              </div>
            </div>

            {/* Why Matched explanation */}
            <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5 }}>
              💡 <strong>Lý do đề xuất:</strong> Trùng ca rảnh buổi sáng, địa điểm cách trường ĐH Văn Lang dưới 3km, không trùng ca học buổi chiều.
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04: GIẢI THÍCH GIÁ TRỊ CỐT LÕI (SCHEDULE MATCHING EXPLAINER)
          Điểm khác biệt lớn nhất: So khớp theo lịch rảnh, không chỉ từ khóa
          ========================================================================= */}
      <section 
        id="schedule-matching"
        style={{
          scrollMarginTop: '90px',
          background: '#ffffff',
          borderRadius: 20,
          border: '1.5px solid #EAE7F0',
          padding: '36px 36px',
          marginBottom: 48,
          boxShadow: '0 4px 20px rgba(117, 101, 168, 0.06)'
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 36px auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#EDE9FE',
            color: '#5B21B6',
            border: '1px solid #DDD6FE',
            padding: '5px 14px',
            borderRadius: 20,
            fontSize: '12.5px',
            fontWeight: 800,
            marginBottom: 10
          }}>
            <Sparkles size={14} />
            ĐẶC SẢN CỦA JOBNEST
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 2.8vw, 32px)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 10px 0' }}>
            Tìm việc theo lịch rảnh — Không chỉ tìm việc theo từ khóa
          </h2>
          <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6, margin: '0 auto', maxWidth: '52ch' }}>
            Các website tuyển dụng thông thường chỉ lọc theo từ khóa, khiến sinh viên dễ gặp tình trạng trùng giờ lên lớp hoặc trễ giờ thi. JOBNEST tự loại bỏ những việc trùng lịch học của bạn, rồi gợi ý việc phù hợp nhất để bạn an tâm vừa học vừa làm.
          </p>
        </div>

        {/* 3 Step Process Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 32
        }}>
          {/* Step 1 */}
          <div style={{
            background: '#F8F7FB',
            border: '1px solid #EAE7F0',
            borderRadius: 14,
            padding: '24px 22px'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#5B21B6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18,
              marginBottom: 14
            }}>
              1
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#29263A', margin: '0 0 8px 0' }}>
              Sinh viên khai báo lịch rảnh
            </h3>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.55, margin: 0 }}>
              Chỉ cần đánh dấu các ca bạn rảnh trong tuần (Sáng, Chiều hoặc Tối từ Thứ 2 đến Chủ Nhật). Lịch học của bạn luôn được bảo vệ tối đa.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{
            background: '#F8F7FB',
            border: '1px solid #EAE7F0',
            borderRadius: 14,
            padding: '24px 22px'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#F4B99D',
              color: '#29263A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18,
              marginBottom: 14
            }}>
              2
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#29263A', margin: '0 0 8px 0' }}>
              Doanh nghiệp công khai ca làm
            </h3>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.55, margin: 0 }}>
              Mỗi tin tuyển dụng đều được kiểm duyệt chặt chẽ, bắt buộc ghi rõ khung giờ bắt đầu, giờ kết thúc và các ngày cần đi làm trong tuần.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{
            background: '#F8F7FB',
            border: '1px solid #EAE7F0',
            borderRadius: 14,
            padding: '24px 22px'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#047857',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18,
              marginBottom: 14
            }}>
              3
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#29263A', margin: '0 0 8px 0' }}>
              Đối chiếu & Gợi ý chính xác
            </h3>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.55, margin: 0 }}>
              Bộ lọc cứng loại bỏ ngay việc làm xung đột giờ học.
            </p>
          </div>
        </div>

        {/* Live Matching Demonstration Card (Đối chứng Sinh viên A và B) */}
        <div style={{
          background: 'linear-gradient(135deg, #FAF8FF 0%, #F5F2FC 100%)',
          border: '1.5px solid #D8B4FE',
          borderRadius: 16,
          padding: '24px 28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#4C1D95' }}>
                  {personalMatches ? 'JOBNEST đề xuất cho bạn' : 'Ví dụ: JOBNEST gợi ý việc làm theo lịch rảnh của từng sinh viên'}
                </div>
              </div>
              {personalMatches && mySlots.length > 0 && (
                <div style={{ fontSize: 12.5, color: '#59477B', marginTop: 6 }}>
                  Theo lịch rảnh trong hồ sơ của bạn: <strong>{summarizeSlots(mySlots)}</strong>
                </div>
              )}
            </div>
            {personalMatches && (
              <button type="button" onClick={openAvailability}
                style={{ background: '#ffffff', border: '1.5px solid #C4B5FD', color: '#594675', borderRadius: 8, padding: '6px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                Chỉnh lịch rảnh
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20
          }}>
            {personalMatches ? personalMatches.map((job, idx) => (
              <button
                key={job.id}
                type="button"
                onClick={() => onSelectJob && onSelectJob(job)}
                style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit', background: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #EAE7F0' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 13.5, color: '#29263A' }}>{job.employer_name}</span>
                  <span style={{ background: '#DCFCE7', color: '#14532D', fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                    Top {idx + 1} Gợi ý: {job.matching_score}%
                  </span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#5B21B6' }}>
                  → {job.title}
                </div>
                {(job.match_reasons || []).slice(0, 3).map(reason => (
                  <div key={reason} style={{ fontSize: 12.5, color: '#15803D', fontWeight: 600, marginTop: 4 }}>
                    ✓ {reason}
                  </div>
                ))}
              </button>
            )) : (<>
            {/* Case A: Student A */}
            <div style={{ background: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #EAE7F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 13.5, color: '#29263A' }}>Sinh viên A (Rảnh Sáng T2, T4, T6)</span>
                <span style={{ background: '#DCFCE7', color: '#14532D', fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>
                  Top 1 Gợi ý: 91%
                </span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#5B21B6' }}>
                → The Coffee Chill House (Ca Sáng: 08:00 - 11:30)
              </div>
              <div style={{ fontSize: 12.5, color: '#15803D', fontWeight: 600, marginTop: 4 }}>
                ✓ Khớp 100% thời gian rảnh • Gần ĐH Văn Lang Bình Thạnh
              </div>
              <div style={{ fontSize: 12.5, color: '#B91C1C', fontWeight: 600, marginTop: 4 }}>
                ✕ Việc làm rạp chiếu phim Ca tối bị loại bỏ (không làm phiền bạn học bài)
              </div>
            </div>

            {/* Case B: Student B */}
            <div style={{ background: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #EAE7F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 13.5, color: '#29263A' }}>Sinh viên B (Rảnh Tối T3, T5, T7)</span>
                <span style={{ background: '#DCFCE7', color: '#14532D', fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>
                  Top 1 Gợi ý: 98%
                </span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#5B21B6' }}>
                → Lập trình viên React.js Part-time (Giờ linh hoạt)
              </div>
              <div style={{ fontSize: 12.5, color: '#15803D', fontWeight: 600, marginTop: 4 }}>
                ✓ Phù hợp chuyên ngành CNTT • Đúng khung giờ rảnh buổi tối
              </div>
              <div style={{ fontSize: 12.5, color: '#B91C1C', fontWeight: 600, marginTop: 4 }}>
                ✕ Việc làm quán cafe Ca sáng bị loại bỏ vì bạn bận lên lớp
              </div>
            </div>
            </>)}
          </div>

          {/* Action callout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 18,
            paddingTop: 14,
            borderTop: '1px solid #EAE7F0',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: 13, color: '#59477B', fontWeight: 600 }}>
              {personalMatches
                ? 'Đề xuất tự cập nhật mỗi khi bạn lưu lịch rảnh hoặc hồ sơ.'
                : 'Khai báo lịch rảnh để nhận gợi ý việc làm dành riêng cho bạn.'}
            </span>
            {isStudent ? (
              <button
                type="button"
                onClick={openAvailability}
                style={{
                  background: '#7565A8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {personalMatches ? 'Xem tất cả đề xuất →' : 'Khai báo lịch rảnh ngay →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('register')}
                style={{
                  background: '#7565A8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Đăng ký tài khoản để nhận gợi ý riêng →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 05: VIỆC LÀM PHÙ HỢP VỚI SINH VIÊN (FEATURED JOBS LISTING)
          Sử dụng JobCard component chính thức từ design system
          ========================================================================= */}
      <section id="featured-jobs" style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#EDE9FE',
              color: '#5B21B6',
              border: '1px solid #DDD6FE',
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: 6
            }}>
              CƠ HỘI NỔI BẬT
            </div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              Việc làm thêm mới nhất dành cho sinh viên
            </h2>
          </div>

          {/* Filter Tab Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'PART_TIME', label: 'Part-time' },
              { id: 'FULL_TIME', label: 'Full-time' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFeaturedTab(tab.id)}
                style={{
                  background: featuredTab === tab.id ? 'var(--color-primary, #7565A8)' : '#ffffff',
                  color: featuredTab === tab.id ? '#ffffff' : 'var(--color-text)',
                  border: `1.5px solid ${featuredTab === tab.id ? 'var(--color-primary, #7565A8)' : '#EAE7F0'}`,
                  borderRadius: 20,
                  padding: '5px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guest info banner */}
        {!currentUser?.token && (
          <div style={{
            background: '#F5F3FF',
            border: '1px solid #DDD6FE',
            borderRadius: 10,
            padding: '10px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#5B21B6', fontWeight: 600 }}>
              <Sparkles size={16} />
              <span>Bạn đang xem danh sách việc làm mở công khai. Đăng nhập và cài đặt lịch rảnh để nhận điểm tương thích riêng từ AI Matching!</span>
            </div>
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#7565A8',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Đăng nhập ngay →
              </button>
            )}
          </div>
        )}

        {/* Job Cards Grid */}
        {loading ? (
          <JobListSkeleton count={6} />
        ) : featuredJobs.length === 0 ? (
          <EmptyState
            title="Chưa có việc làm phù hợp danh mục này"
            description="Hãy thử chọn danh mục khác hoặc xóa bộ lọc để khám phá các cơ hội việc làm khác nhé."
            actionText="Xem tất cả việc làm"
            onAction={onExploreAllJobs}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 20
          }}>
            {featuredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={isSaved ? isSaved(job.id) : false}
                onToggleSave={onToggleSave}
                onSelectJob={onSelectJob}
                onApply={onApply}
                onHoverStart={onHoverStart}
                onHoverEnd={onHoverEnd}
                onViewCompany={onViewCompany}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA to explore all jobs */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button
            type="button"
            onClick={onExploreAllJobs}
            style={{
              background: '#ffffff',
              border: '2px solid var(--color-primary, #7565A8)',
              color: 'var(--color-primary, #7565A8)',
              borderRadius: 10,
              padding: '11px 28px',
              fontSize: 14.5,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background-color 0.15s ease, color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-primary, #7565A8)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = 'var(--color-primary, #7565A8)';
            }}
          >
            <span>Xem tất cả {jobs.length} công việc đang tuyển</span>
            <ChevronRight size={17} />
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 06: DANH MỤC NGÀNH NGHỀ (JOB CATEGORIES)
          ========================================================================= */}
      <section id="categories" style={{ marginBottom: 48 }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 28px auto' }}>
          <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px 0' }}>
            Khám phá theo ngành nghề phổ biến
          </h2>
          <p style={{ fontSize: 14.5, color: '#374151', lineHeight: 1.6, margin: 0 }}>
            Lựa chọn ngành nghề phù hợp với chuyên môn học tập hoặc sở thích của bạn để tích lũy kinh nghiệm làm việc thực tế.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))',
          gap: 16
        }}>
          {POPULAR_CATEGORIES.map((cat) => {
            const IconComponent = cat.icon || Briefcase;
            const count = categoryCounts[cat.dbCategory] || 0;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.dbCategory)}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid var(--color-border, #EAE7F0)',
                  borderRadius: 14,
                  padding: '20px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
                  boxShadow: '0 2px 8px rgba(41, 38, 58, 0.03)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary, #7565A8)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(117, 101, 168, 0.14)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border, #EAE7F0)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(41, 38, 58, 0.03)';
                }}
              >
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: '#F1EEF8',
                  color: '#7565A8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComponent size={24} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 2px 0' }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.desc}
                  </div>
                  <div style={{ fontSize: 12, color: '#5B21B6', fontWeight: 700, marginTop: 4 }}>
                    {count > 0 ? `${count} việc làm đang tuyển` : 'Đang cập nhật việc mới'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 07: VÌ SAO SINH VIÊN NÊN CHỌN JOBNEST?
          ========================================================================= */}
      <section style={{
        background: '#FAF8FC',
        border: '1px solid #EAE7F0',
        borderRadius: 20,
        padding: '36px 36px',
        marginBottom: 48
      }}>
        <div style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto 32px auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#FDE8DD',
            color: '#8C3B14',
            border: '1px solid #FDBA74',
            padding: '4px 12px',
            borderRadius: 14,
            fontSize: '12px',
            fontWeight: 800,
            marginBottom: 8
          }}>
            LỢI ÍCH DÀNH RIÊNG CHO SINH VIÊN
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 2.6vw, 28px)', fontWeight: 800, color: '#29263A', margin: '0 0 8px 0' }}>
            Tại sao sinh viên tin tưởng lựa chọn JOBNEST?
          </h2>
          <p style={{ fontSize: 14.5, color: '#374151', lineHeight: 1.6, margin: '0 auto', maxWidth: '48ch' }}>
            Được xây dựng từ chính nỗi niềm và nhu cầu thực tế của sinh viên khi tìm kiếm việc làm thêm part-time và dự án tự do.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20
        }}>
          {[
            {
              icon: Clock,
              title: 'Chủ động thời gian, ưu tiên lịch học',
              desc: 'Lịch học và lịch thi của bạn luôn là ưu tiên cao nhất. Thuật toán tự động lọc bỏ các ca làm việc bị xung đột.'
            },
            {
              icon: Eye,
              title: 'Minh bạch ca làm việc 100%',
              desc: 'Biết trước chính xác khung giờ, các ngày cần làm trong tuần và địa chỉ làm việc trước khi quyết định nộp đơn.'
            },
            {
              icon: DollarSign,
              title: 'Thù lao công khai, không thu phí',
              desc: 'Mức lương theo giờ hoặc theo tháng hiển thị minh bạch. Cam kết không thu bất kỳ khoản phí môi giới nào từ sinh viên.'
            },
            {
              icon: ShieldCheck,
              title: 'Doanh nghiệp được xác thực uy tín',
              desc: 'Mọi tin đăng và thông tin doanh nghiệp đều được kiểm duyệt chặt chẽ, loại bỏ hoàn toàn các tin tuyển dụng lừa đảo.'
            },
            {
              icon: CheckCircle2,
              title: 'Theo dõi hồ sơ theo thời gian thực',
              desc: 'Nhận thông báo tức thời ngay khi nhà tuyển dụng xem hồ sơ, mời phỏng vấn hoặc chấp nhận đơn ứng tuyển.'
            },
            {
              icon: HeartHandshake,
              title: 'Đánh giá 2 chiều minh bạch',
              desc: 'Sau mỗi ca làm hoặc hợp đồng hoàn thành, sinh viên và doanh nghiệp đánh giá lẫn nhau để tích lũy uy tín nghề nghiệp.'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{
                background: '#ffffff',
                border: '1px solid #EAE7F0',
                borderRadius: 14,
                padding: '20px 22px',
                display: 'flex',
                gap: 16
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#F1EEF8',
                  color: '#7565A8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#29263A', margin: '0 0 6px 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.5, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 08: QUY TRÌNH SỬ DỤNG (5 BƯỚC ĐƠN GIẢN)
          ========================================================================= */}
      <section id="how-it-works" style={{ scrollMarginTop: '90px', marginBottom: 48 }}>
        <div style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto 32px auto' }}>
          <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px 0' }}>
            Quy trình tìm việc dễ dàng qua 5 bước
          </h2>
          <p style={{ fontSize: 14.5, color: '#374151', lineHeight: 1.6, margin: '0 auto', maxWidth: '48ch' }}>
            Từ việc khám phá đến lúc nhận thù lao đều được tối ưu hóa đơn giản và an toàn cho sinh viên.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          position: 'relative'
        }}>
          {[
            { step: '01', title: 'Khám phá việc làm', desc: 'Tìm việc theo ngành nghề, khu vực và mức lương mong muốn.' },
            { step: '02', title: 'Cập nhật lịch rảnh', desc: 'Chọn các buổi sáng/chiều/tối bạn có thể đi làm trong tuần.' },
            { step: '03', title: 'Nhận gợi ý AI', desc: 'Hệ thống đối chiếu và gợi ý công việc khớp lịch học nhất.' },
            { step: '04', title: 'Ứng tuyển 1 chạm', desc: 'Gửi hồ sơ nhanh chóng và theo dõi phản hồi trực tuyến.' },
            { step: '05', title: 'Đi làm & Đánh giá', desc: 'Bắt đầu công việc, nhận thù lao an toàn và tích lũy uy tín.' }
          ].map((s, idx) => (
            <div key={idx} style={{
              background: '#ffffff',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: '20px 18px',
              textAlign: 'left',
              position: 'relative'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#F3F4F6',
                color: '#1F2937',
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 12
              }}>
                {idx + 1}
              </div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 09: CTA CUỐI TRANG (CONVERSION BANNER)
          ========================================================================= */}
      <section 
        style={{
          background: '#4E3E6B',
          borderRadius: 16,
          padding: '40px 36px',
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: 36
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#FDE8DD',
            color: '#7C2D12',
            padding: '5px 14px',
            borderRadius: 14,
            fontSize: '12.5px',
            fontWeight: 800,
            marginBottom: 12
          }}>
            BẮT ĐẦU NGAY HÔM NAY
          </div>

          <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 34px)', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Công việc phù hợp bắt đầu từ thời gian rảnh của bạn.
          </h2>

          <p style={{ fontSize: '15.5px', color: '#FFFFFF', lineHeight: 1.6, margin: '0 auto 24px auto', maxWidth: '52ch' }}>
            Đừng để việc làm thêm ảnh hưởng đến việc học tập. Hàng trăm cơ hội việc làm bán thời gian đang chờ đón bạn trên hệ thống JOBNEST.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onExploreAllJobs}
              style={{
                background: '#ffffff',
                color: '#7565A8',
                border: 'none',
                borderRadius: 10,
                padding: '13px 28px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <span>Khám phá việc làm ngay</span>
              <ArrowRight size={16} />
            </button>

            {!currentUser?.token && onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                style={{
                  background: '#F4B99D',
                  color: '#29263A',
                  border: 'none',
                  borderRadius: 10,
                  padding: '13px 28px',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, transform 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E8A484';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F4B99D';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                Tạo tài khoản sinh viên
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: BANNER DÀNH CHO NHÀ TUYỂN DỤNG
          ========================================================================= */}
      <section 
        style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 14,
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>
            Bạn là Doanh nghiệp cần tuyển dụng sinh viên?
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
            Đăng tin tuyển dụng ca linh hoạt, tiếp cận hàng nghìn sinh viên tiềm năng trên hệ thống JobNest.
          </div>
        </div>

        <button
          type="button"
          onClick={onPostJobClick}
          style={{
            background: '#ffffff',
            color: '#7565A8',
            border: '2px solid #7565A8',
            borderRadius: 8,
            padding: '10px 22px',
            fontSize: 13.5,
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#7565A8';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = '#7565A8';
          }}
        >
          Đăng tin tuyển dụng miễn phí
        </button>
      </section>

    </div>
  );
}
