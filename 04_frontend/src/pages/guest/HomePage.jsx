import React, { useState, useMemo } from 'react';
import { 
  Search, MapPin, Briefcase, Filter, Sparkles, X, 
  ChevronDown, DollarSign, Clock 
} from 'lucide-react';
import JobListSkeleton from '../../components/common/JobListSkeleton';
import EmptyState from '../../components/common/EmptyState';

// 6 Categories specified in WF-G01 (IT, Thiết kế, Marketing, Gia sư, Sự kiện, Phục vụ)
const WIREFRAME_CATEGORIES = [
  { id: 'it', name: 'IT', dbCategory: 'Công nghệ thông tin' },
  { id: 'design', name: 'Thiết kế', dbCategory: 'Thiết kế đồ họa' },
  { id: 'marketing', name: 'Marketing', dbCategory: 'Marketing / Truyền thông' },
  { id: 'tutor', name: 'Gia sư', dbCategory: 'Gia sư / Giáo dục' },
  { id: 'event', name: 'Sự kiện', dbCategory: 'Sự kiện / PG / PB' },
  { id: 'fnb', name: 'Phục vụ', dbCategory: 'Nhà hàng / F&B' }
];

export default function HomePage({
  jobs = [],
  loading = false,
  onSelectJob,
  onSearch,
  onSelectCategory,
  onPostJobClick
}) {
  // Search Inputs matching the Hero banner screenshot
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('');

  // Handle Search Submit
  const handleHeroSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onSearch) {
      onSearch({ 
        keyword, 
        category, 
        location, 
        salary, 
        experience,
        workType: '' 
      });
    }
  };

  // Handle Clear / Reset Filters
  const handleResetFilters = () => {
    setKeyword('');
    setCategory('');
    setLocation('');
    setSalary('');
    setExperience('');
    if (onSearch) {
      onSearch({ keyword: '', category: '', location: '', salary: '', experience: '', workType: '' });
    }
  };

  // 6 Featured Jobs (Việc làm nổi bật - WF-G01: 3 cột x 2 hàng = 6 cards)
  const featuredJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    const openJobs = jobs.filter(j => j.status === 'OPEN' || !j.status);
    return openJobs.slice(0, 6);
  }, [jobs]);

  // Helper format salary
  const formatSalary = (job) => {
    if (job.salary_range) return job.salary_range;
    if (job.salary_min && job.salary_max) {
      return `${(job.salary_min / 1000).toLocaleString('vi-VN')}k - ${(job.salary_max / 1000).toLocaleString('vi-VN')}k/tháng`;
    }
    if (job.hourly_rate) {
      return `${Number(job.hourly_rate).toLocaleString('vi-VN')}đ/giờ`;
    }
    if (job.budget) {
      return `${Number(job.budget).toLocaleString('vi-VN')}đ`;
    }
    return 'Thỏa thuận';
  };

  // Helper format work type
  const formatWorkType = (type) => {
    switch (type) {
      case 'PART_TIME':
        return 'Part-time';
      case 'SEASONAL':
        return 'Seasonal';
      case 'FREELANCE':
        return 'Freelance';
      default:
        return 'Part-time';
    }
  };

  // Helper format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '12/10/2026';
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return '12/10/2026';
    }
  };

  return (
    <div className="home-page-container" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '16px 20px 40px 20px' }}>
      
      {/* =========================================================================
          HERO SEARCH BANNER (CSS bám sát 100% theo ảnh đính kèm của người dùng)
          Màu nền tím đặc trưng, badge lấp lánh, thanh tìm kiếm trắng bo tròn & bộ lọc nhanh
          ========================================================================= */}
      <section 
        className="home-hero-section"
        style={{
          background: 'linear-gradient(135deg, #6C5C96 0%, #7565A8 50%, #8170B2 100%)',
          borderRadius: 16,
          padding: '28px 32px 24px 32px',
          marginBottom: 36,
          color: '#ffffff',
          boxShadow: '0 10px 28px -4px rgba(108, 92, 150, 0.35)',
          position: 'relative'
        }}
      >
        {/* Top Header Row: [Badge lấp lánh bên trái] & [Nút XÓA BỘ LỌC bên phải] */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16
        }}>
          {/* Badge: ✨ JobNest • Việc làm Part-time & Freelance Tin cậy */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#ffffff',
            color: '#7565A8',
            padding: '5px 14px',
            borderRadius: 20,
            fontSize: '12.5px',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
          }}>
            <span style={{ color: '#F59E0B', fontSize: '13px' }}>✨</span>
            <span>JobNest • Việc làm Part–time & Freelance Tin cậy</span>
          </div>

          {/* Button: XÓA BỘ LỌC (viền trắng trong suốt) */}
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              borderRadius: 8,
              padding: '6px 16px',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.6px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            XÓA BỘ LỌC
          </button>
        </div>

        {/* Tiêu đề in hoa đậm: TÌM KIẾM VIỆC LÀM PART-TIME & FREELANCE */}
        <h1 style={{
          fontSize: 'clamp(22px, 3.2vw, 27px)',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.25,
          margin: '0 0 8px 0',
          letterSpacing: '-0.3px',
          textTransform: 'uppercase'
        }}>
          TÌM KIẾM VIỆC LÀM PART–TIME & FREELANCE
        </h1>

        {/* Đoạn mô tả phụ đề */}
        <p style={{
          fontSize: '13.5px',
          color: 'rgba(255, 255, 255, 0.92)',
          lineHeight: 1.55,
          margin: '0 0 20px 0',
          maxWidth: '880px'
        }}>
          Khám phá việc làm bán thời gian và dự án freelance chất lượng dành riêng cho sinh viên trên hệ thống JobNest. 
          Minh bạch thù lao, hợp đồng rõ ràng và bảo vệ quyền lợi sinh viên tối đa.
        </p>

        {/* Khung tìm kiếm chính (Khối màu trắng bo góc như ảnh) */}
        <form 
          onSubmit={handleHeroSearch}
          style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: '6px 8px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
          }}
        >
          {/* Ô 1: Input "Tìm kiếm theo vị trí, kỹ năng, công ty..." */}
          <div style={{
            flex: '1 1 260px',
            minWidth: 200,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px'
          }}>
            <Search size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm theo vị trí, kỹ năng, công ty..."
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '13.5px',
                color: '#111827',
                background: 'transparent'
              }}
            />
          </div>

          {/* Ô 2: Dropdown "Ngành nghề / Danh mục" (Icon Cặp táp + Thiết kế đồ họa) */}
          <div style={{
            flex: '0 1 200px',
            minWidth: 175,
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            background: '#ffffff',
            position: 'relative'
          }}>
            <Briefcase size={16} color="#6B7280" style={{ flexShrink: 0, marginRight: 6 }} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '13px',
                color: '#111827',
                fontWeight: 500,
                background: 'transparent',
                cursor: 'pointer',
                appearance: 'none',
                paddingRight: 18
              }}
            >
              <option value="">Tất cả ngành nghề</option>
              <option value="Công nghệ thông tin">Công nghệ thông tin</option>
              <option value="Thiết kế đồ họa">Thiết kế đồ họa</option>
              <option value="Marketing / Truyền thông">Marketing / Truyền thông</option>
              <option value="Gia sư / Giáo dục">Gia sư / Giáo dục</option>
              <option value="Sự kiện / PG / PB">Sự kiện / PG / PB</option>
              <option value="Nhà hàng / F&B">Nhà hàng / F&B</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 10, pointerEvents: 'none' }} />
          </div>

          {/* Ô 3: Dropdown "Địa điểm / Khu vực" (Icon MapPin + Tất cả khu vực) */}
          <div style={{
            flex: '0 1 190px',
            minWidth: 165,
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            background: '#ffffff',
            position: 'relative'
          }}>
            <MapPin size={16} color="#6B7280" style={{ flexShrink: 0, marginRight: 6 }} />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '13px',
                color: '#111827',
                fontWeight: 500,
                background: 'transparent',
                cursor: 'pointer',
                appearance: 'none',
                paddingRight: 18
              }}
            >
              <option value="">Tất cả khu vực</option>
              <option value="Quận 1">Quận 1, TP.HCM</option>
              <option value="Quận 3">Quận 3, TP.HCM</option>
              <option value="Quận 7">Quận 7, TP.HCM</option>
              <option value="Bình Thạnh">Bình Thạnh, TP.HCM</option>
              <option value="Thủ Đức">TP. Thủ Đức</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Từ xa">Từ xa (Remote)</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 10, pointerEvents: 'none' }} />
          </div>

          {/* Ô 4: Nút "ÁP DỤNG BỘ LỌC" (Nền tím đậm) */}
          <button
            type="submit"
            style={{
              background: '#65538F',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              height: 40,
              padding: '0 22px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#55447E'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#65538F'}
          >
            ÁP DỤNG BỘ LỌC
          </button>
        </form>

        {/* Khối Bộ lọc nhanh phía dưới (Quick Filters Row) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 14,
          flexWrap: 'wrap'
        }}>
          {/* Label: ⑂ Bộ lọc nhanh: */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            <Filter size={14} />
            <span>Bộ lọc nhanh:</span>
          </div>

          {/* Dropdown 1: Tất cả mức lương */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.16)',
            border: '1px solid rgba(255, 255, 255, 0.32)',
            borderRadius: 8,
            padding: '5px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            position: 'relative'
          }}>
            <select
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer',
                appearance: 'none',
                paddingRight: 16
              }}
            >
              <option value="" style={{ color: '#111827' }}>Tất cả mức lương</option>
              <option value="under_3m" style={{ color: '#111827' }}>Dưới 3 triệu</option>
              <option value="3m_5m" style={{ color: '#111827' }}>3 - 5 triệu</option>
              <option value="5m_10m" style={{ color: '#111827' }}>5 - 10 triệu</option>
              <option value="over_10m" style={{ color: '#111827' }}>Trên 10 triệu</option>
              <option value="hourly" style={{ color: '#111827' }}>Theo giờ (&gt;25k/h)</option>
            </select>
            <ChevronDown size={13} color="#ffffff" style={{ position: 'absolute', right: 8, pointerEvents: 'none' }} />
          </div>

          {/* Dropdown 2: Tất cả kinh nghiệm */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.16)',
            border: '1px solid rgba(255, 255, 255, 0.32)',
            borderRadius: 8,
            padding: '5px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            position: 'relative'
          }}>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer',
                appearance: 'none',
                paddingRight: 16
              }}
            >
              <option value="" style={{ color: '#111827' }}>Tất cả kinh nghiệm</option>
              <option value="none" style={{ color: '#111827' }}>Không yêu cầu kinh nghiệm</option>
              <option value="under_1y" style={{ color: '#111827' }}>Dưới 1 năm</option>
              <option value="1y_2y" style={{ color: '#111827' }}>1 - 2 năm</option>
            </select>
            <ChevronDown size={13} color="#ffffff" style={{ position: 'absolute', right: 8, pointerEvents: 'none' }} />
          </div>

          {/* Button 3: ✕ Xóa bộ lọc đang chọn */}
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 210, 200, 0.65)',
              borderRadius: 8,
              padding: '5px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <span>✕</span> Xóa bộ lọc đang chọn
          </button>
        </div>
      </section>

      {/* =========================================================================
          FEATURED JOBS (Việc làm nổi bật - Layout lưới 3 cột chuẩn Wireframe)
          Card: Bên trái ô vuông "Ảnh", bên phải Tiêu đề (đậm), Tên cty + Lương (xám), Địa điểm
          Góc dưới: Loại việc · Ngày đăng + Nút "Xem chi tiết" (nền trắng, viền đen)
          ========================================================================= */}
      <section className="featured-jobs-section" style={{ marginBottom: 44 }}>
        <h2 style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#111827',
          margin: '0 0 20px 0'
        }}>
          Việc làm nổi bật
        </h2>

        {loading ? (
          <JobListSkeleton count={6} />
        ) : featuredJobs.length === 0 ? (
          <EmptyState
            title="Chưa có việc làm nổi bật"
            description="Hiện hệ thống đang cập nhật các cơ hội việc làm mới. Bạn hãy quay lại sau ít phút nhé!"
          />
        ) : (
          /* Grid 3 cột chuẩn Wireframe */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 20
          }}>
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #D1D5DB',
                  borderRadius: 8,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 150,
                  transition: 'box-shadow 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                {/* Top Row: [Ô vuông Ảnh] + [Nội dung bên phải] */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {/* Bên trái: Ô vuông (Placeholder ảnh) có chữ "Ảnh" */}
                  <div style={{
                    width: 58,
                    height: 58,
                    background: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#6B7280',
                    flexShrink: 0
                  }}>
                    Ảnh
                  </div>

                  {/* Bên phải: Tiêu đề Job (đậm), Tên công ty + Mức lương (màu xám), Địa điểm */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 
                      onClick={() => onSelectJob && onSelectJob(job)}
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#111827',
                        margin: '0 0 4px 0',
                        cursor: 'pointer',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={job.title}
                    >
                      {job.title}
                    </h3>
                    <div style={{
                      fontSize: 13,
                      color: '#4B5563',
                      margin: '0 0 3px 0',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {job.employer_name || 'Quán ABC'} · {formatSalary(job)}
                    </div>
                    <div style={{
                      fontSize: 12.5,
                      color: '#6B7280',
                      lineHeight: 1.3
                    }}>
                      {job.location || 'TP.HCM'}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: [Loại việc · Ngày đăng] + [Nút "Xem chi tiết"] */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 14,
                  paddingTop: 10,
                  borderTop: '1px solid #F3F4F6'
                }}>
                  {/* Góc dưới bên trái: Loại việc + Ngày đăng */}
                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    {formatWorkType(job.job_type)} · {formatDate(job.created_at)}
                  </div>

                  {/* Nút "Xem chi tiết" (nền trắng, viền đen) */}
                  <button
                    type="button"
                    onClick={() => onSelectJob && onSelectJob(job)}
                    style={{
                      background: '#ffffff',
                      color: '#000000',
                      border: '1.5px solid #000000',
                      borderRadius: 6,
                      padding: '5px 14px',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          DANH MỤC VIỆC LÀM (Categories - Layout 6 cột đều nhau chuẩn Wireframe)
          Mỗi danh mục: Ô vuông (Placeholder ảnh có chữ "Ảnh"), bên dưới là tên
          (IT, Thiết kế, Marketing, Gia sư, Sự kiện, Phục vụ)
          ========================================================================= */}
      <section className="categories-section" style={{ marginBottom: 44 }}>
        <h2 style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#111827',
          margin: '0 0 20px 0'
        }}>
          Danh mục việc làm
        </h2>

        {/* 6 Cột đều nhau */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 16
        }}>
          {WIREFRAME_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory && onSelectCategory(cat.dbCategory)}
              style={{
                background: '#ffffff',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: '20px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#000000';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Ô vuông (Placeholder ảnh) có chữ "Ảnh" */}
              <div style={{
                width: 56,
                height: 56,
                background: '#F3F4F6',
                border: '1px solid #D1D5DB',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: '#6B7280',
                marginBottom: 10
              }}>
                Ảnh
              </div>

              {/* Tên danh mục bên dưới */}
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#111827'
              }}>
                {cat.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          KHỐI CTA (Banner đăng tin chuẩn Wireframe)
          Nằm dưới cùng, nền xám nhạt
          Bên trái: Text đậm "Bạn cần tuyển sinh viên? Đăng tin miễn phí"
          Bên phải: Nút "Đăng tin tuyển dụng" (nền đen, chữ trắng)
          ========================================================================= */}
      <section 
        className="employer-cta-banner"
        style={{
          background: '#F3F4F6',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: '28px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        {/* Bên trái: Text đậm */}
        <div style={{
          fontSize: 'clamp(18px, 2.5vw, 21px)',
          fontWeight: 800,
          color: '#111827'
        }}>
          Bạn cần tuyển sinh viên? Đăng tin miễn phí
        </div>

        {/* Bên phải: Nút "Đăng tin tuyển dụng" (nền đen, chữ trắng) */}
        <div>
          <button
            type="button"
            onClick={onPostJobClick}
            style={{
              background: '#000000',
              color: '#ffffff',
              border: '1.5px solid #000000',
              borderRadius: 6,
              padding: '11px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2B2B2B'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
          >
            Đăng tin tuyển dụng
          </button>
        </div>
      </section>

    </div>
  );
}
