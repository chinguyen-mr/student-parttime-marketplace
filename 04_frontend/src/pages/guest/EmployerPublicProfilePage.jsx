import React, { useState, useEffect } from 'react';
import { 
  Building2, User, MapPin, Mail, Phone, Calendar, 
  CheckCircle2, Flag, ArrowLeft, Briefcase, Clock, 
  DollarSign, Sparkles, AlertCircle, RefreshCw, ChevronRight,
  ExternalLink, ShieldCheck
} from 'lucide-react';
import { API_BASE, formatApiError } from '../../config/api';
import ReportViolationModal from '../../components/forms/ReportViolationModal';

export default function EmployerPublicProfilePage({
  employerId,
  currentUser = null,
  onNavigateHome,
  onNavigateJobs,
  onSelectJob,
  onOpenAuth,
  showToast
}) {
  const FALLBACK_PROFILE = {
    id: employerId || 1,
    full_name: 'Nguyễn Văn A',
    company_name: 'Nguyễn Văn A',
    display_name: 'Nguyễn Văn A',
    business_license: false,
    avatar_url: null,
    company_logo_url: null,
    bio: 'Giới thiệu ngắn về nhà tuyển dụng (Bio). Nhà tuyển dụng cá nhân uy tín, hỗ trợ sinh viên các công việc bán thời gian và linh hoạt.',
    location: 'TP. Hồ Chí Minh',
    company_address: 'TP. Hồ Chí Minh',
    email: 'nguyenvana@jobnest.vn',
    phone: '0901234567',
    created_at: '2026-01-15T08:00:00Z',
  };

  const FALLBACK_JOBS = [
    {
      id: 1,
      title: 'Phục vụ quán cà phê',
      employer_name: 'Quán ABC',
      company_name: 'Quán ABC',
      salary: 25000,
      salary_type: 'HOURLY',
      location: 'Quận 1',
      work_type: 'PART_TIME',
      created_at: '2026-10-12T00:00:00Z',
    },
    {
      id: 2,
      title: 'Nhân viên sự kiện Tết',
      employer_name: 'Cá nhân',
      company_name: 'Cá nhân',
      salary: 300000,
      salary_type: 'DAILY',
      location: 'Quận 7',
      work_type: 'SEASONAL',
      created_at: '2026-10-10T00:00:00Z',
    },
    {
      id: 3,
      title: 'Thiết kế logo thương hiệu',
      employer_name: 'Cá nhân',
      company_name: 'Cá nhân',
      salary: 2000000,
      salary_type: 'PROJECT',
      location: 'Từ xa',
      work_type: 'FREELANCE',
      created_at: '2026-10-09T00:00:00Z',
    }
  ];

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PART_TIME' | 'FREELANCE' | 'SEASONAL'
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProfileAndJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Employer Public Profile
      let profLoaded = null;
      try {
        const profRes = await fetch(`${API_BASE}/profile/${employerId || 1}`);
        if (profRes.ok) {
          const profData = await profRes.json();
          profLoaded = profData.data || profData;
        }
      } catch {
        // quiet fallback
      }

      setProfile(profLoaded || FALLBACK_PROFILE);

      // 2. Fetch Public Jobs published by this Employer
      let jobsLoaded = [];
      try {
        const jobsRes = await fetch(`${API_BASE}/jobs?employerId=${employerId || 1}&limit=50`);
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          jobsLoaded = jobsData.data || [];
        }
      } catch {
        // quiet fallback
      }

      setJobs(jobsLoaded && jobsLoaded.length > 0 ? jobsLoaded : FALLBACK_JOBS);
    } catch {
      setProfile(FALLBACK_PROFILE);
      setJobs(FALLBACK_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndJobs();
  }, [employerId]);

  // Filter jobs by work type
  const filteredJobs = jobs.filter(job => {
    if (activeFilter === 'ALL') return true;
    return job.work_type === activeFilter;
  });

  // Format currency
  const formatSalary = (amount, type) => {
    if (!amount) return 'Thỏa thuận';
    const num = Number(amount).toLocaleString('vi-VN');
    if (type === 'HOURLY') return `${num} đ/giờ`;
    if (type === 'DAILY') return `${num} đ/ngày`;
    if (type === 'MONTHLY') return `${num} đ/tháng`;
    return `${num} đ/dự án`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Top Breadcrumb & Navigation */}
      <div style={{ background: '#ffffff', borderBottom: '1.5px solid #000000', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#64748B' }}>
            <span style={{ background: '#7565A8', color: '#ffffff', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 11.5 }}>
              WF-G06
            </span>
            <span style={{ color: '#0F172A', fontWeight: 700 }}>
              Trang công khai của Nhà tuyển dụng
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              onClick={onNavigateHome}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 13 }}
            >
              Trang chủ
            </button>
            <ChevronRight size={14} color="#CBD5E1" />
            <button 
              onClick={onNavigateJobs}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 13 }}
            >
              Việc làm
            </button>
            <ChevronRight size={14} color="#CBD5E1" />
            <button
              onClick={onNavigateJobs}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={13} /> Về danh sách việc làm
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: '24px auto', padding: '0 20px' }}>
        {/* ================= STATE 1: LOADING SKELETON ================= */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#ffffff', borderRadius: 16, padding: 32, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#E2E8F0' }} className="animate-pulse" />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 28, width: '40%', background: '#E2E8F0', borderRadius: 6, marginBottom: 12 }} className="animate-pulse" />
                  <div style={{ height: 16, width: '25%', background: '#E2E8F0', borderRadius: 4, marginBottom: 8 }} className="animate-pulse" />
                  <div style={{ height: 16, width: '60%', background: '#E2E8F0', borderRadius: 4 }} className="animate-pulse" />
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{ height: 180, background: '#ffffff', borderRadius: 12, border: '1px solid #E2E8F0' }} className="animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* ================= STATE 2: ERROR ================= */}
        {!loading && error && (
          <div 
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '48px 24px',
              textAlign: 'center',
              border: '1px solid #FCA5A5'
            }}
          >
            <div 
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
              Không thể tải hồ sơ Nhà tuyển dụng
            </h3>
            <p style={{ color: '#64748B', fontSize: 14, maxWidth: 460, margin: '0 auto 20px auto' }}>
              {error}
            </p>
            <button
              onClick={fetchProfileAndJobs}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 20px',
                borderRadius: 8,
                background: '#7565A8',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} /> Thử lại
            </button>
          </div>
        )}

        {/* ================= STATE 3: SUCCESS & CONTENT ================= */}
        {!loading && !error && profile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top Employer Card (Matching WF-G06) */}
            <div 
              style={{
                background: '#ffffff',
                borderRadius: 16,
                border: '1.5px solid #000000',
                padding: '28px 32px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Avatar / Logo */}
                  <div 
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: '50%',
                      border: '2px solid #000000',
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {profile.avatar_url || profile.company_logo_url ? (
                      <img 
                        src={profile.avatar_url || profile.company_logo_url} 
                        alt={profile.full_name || profile.company_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Building2 size={42} color="#7565A8" />
                    )}
                  </div>

                  {/* Profile info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {profile.company_name || profile.display_name || profile.full_name || 'Nhà tuyển dụng'}
                      </h1>
                      <span 
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: profile.business_license ? '#EDE9FE' : '#FEF3C7',
                          color: profile.business_license ? '#6B21A8' : '#92400E',
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      >
                        {profile.business_license ? 'Doanh nghiệp / Tổ chức' : 'Nhà tuyển dụng cá nhân'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, color: '#475569', fontSize: 13, marginBottom: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <MapPin size={15} color="#7565A8" />
                        {profile.company_address || profile.location || 'TP. Hồ Chí Minh'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={15} color="#7565A8" />
                        Thành viên từ: {formatDate(profile.created_at) || '2024'}
                      </span>
                    </div>

                    {/* Verified Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: '#166534',
                          background: '#DCFCE7',
                          padding: '2px 8px',
                          borderRadius: 6,
                          border: '1px solid #86EFAC'
                        }}
                      >
                        <ShieldCheck size={13} /> Đã xác thực Email
                      </span>
                      {profile.phone && (
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: '#166534',
                            background: '#DCFCE7',
                            padding: '2px 8px',
                            borderRadius: 6,
                            border: '1px solid #86EFAC'
                          }}
                        >
                          <ShieldCheck size={13} /> Đã xác thực SĐT
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Report Action Button (opens WF-X01) */}
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#ffffff',
                    border: '1.5px solid #E2E8F0',
                    color: '#64748B',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FCA5A5';
                    e.currentTarget.style.color = '#DC2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#64748B';
                  }}
                >
                  <Flag size={14} /> Báo cáo vi phạm
                </button>
              </div>

              {/* Bio / Giới thiệu */}
              {profile.bio && (
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#334155', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
                    Giới thiệu
                  </h4>
                  <p style={{ color: '#475569', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Section: Published Jobs (WF-G06) */}
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #000000', padding: '24px 28px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                    Tin tuyển dụng đang mở
                  </h2>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                    Hiện có <strong style={{ color: '#7565A8' }}>{jobs.length}</strong> vị trí đang nhận hồ sơ ứng tuyển
                  </p>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: 8, background: '#F1F5F9', padding: 4, borderRadius: 10 }}>
                  <button
                    onClick={() => setActiveFilter('ALL')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 7,
                      border: 'none',
                      background: activeFilter === 'ALL' ? '#7565A8' : 'transparent',
                      color: activeFilter === 'ALL' ? '#ffffff' : '#475569',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Tất cả ({jobs.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('PART_TIME')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 7,
                      border: 'none',
                      background: activeFilter === 'PART_TIME' ? '#7565A8' : 'transparent',
                      color: activeFilter === 'PART_TIME' ? '#ffffff' : '#475569',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Bán thời gian
                  </button>
                  <button
                    onClick={() => setActiveFilter('FREELANCE')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 7,
                      border: 'none',
                      background: activeFilter === 'FREELANCE' ? '#7565A8' : 'transparent',
                      color: activeFilter === 'FREELANCE' ? '#ffffff' : '#475569',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Linh hoạt / Freelance
                  </button>
                </div>
              </div>

              {/* Jobs Grid or Empty State */}
              {filteredJobs.length === 0 ? (
                <div 
                  style={{
                    padding: '48px 20px',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    borderRadius: 12,
                    border: '1px dashed #CBD5E1'
                  }}
                >
                  <Briefcase size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#334155', margin: '0 0 6px 0' }}>
                    Chưa có tin tuyển dụng nào phù hợp
                  </h4>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                    Nhà tuyển dụng hiện chưa đăng bài tuyển dụng mới trong danh mục này.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                    {filteredJobs.map(job => (
                      <div
                        key={job.id}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #000000',
                          borderRadius: 12,
                          padding: '16px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          minHeight: 160
                        }}
                      >
                        <div>
                          {/* Layout matching wireframe: thumbnail + title + details */}
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                            <div 
                              style={{
                                width: 52,
                                height: 52,
                                borderRadius: 8,
                                border: '1.5px solid #000000',
                                background: '#F1F5F9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#64748B'
                              }}
                            >
                              Ảnh
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h3 
                                style={{
                                  fontSize: 15,
                                  fontWeight: 700,
                                  color: '#0F172A',
                                  margin: '0 0 4px 0',
                                  lineHeight: 1.35,
                                  cursor: 'pointer'
                                }}
                                onClick={() => onSelectJob && onSelectJob(job)}
                              >
                                {job.title}
                              </h3>
                              <p style={{ fontSize: 12.5, color: '#475569', margin: 0 }}>
                                {job.company_name || job.employer_name || 'Nhà tuyển dụng'} · <strong style={{ color: '#16A34A' }}>{formatSalary(job.salary, job.salary_type)}</strong> · {job.location ? job.location.split(',')[0].trim() : 'TP.HCM'}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: '#64748B', marginBottom: 8 }}>
                            <span>
                              {job.work_type === 'FREELANCE' ? 'Tự do (Freelance)' : job.work_type === 'SEASONAL' ? 'Thời vụ' : 'Bán thời gian'}
                            </span>
                            <span>·</span>
                            <span>{formatDate(job.created_at)}</span>
                          </div>
                        </div>

                        <div style={{ paddingTop: 10, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => onSelectJob && onSelectJob(job)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '6px 14px',
                              borderRadius: 6,
                              background: '#7565A8',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: 12.5,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Xem chi tiết <ExternalLink size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination matching wireframe: < [1] [2] [3] >  Tổng số kết quả: N */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 24,
                    paddingTop: 16,
                    borderTop: '1px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button 
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        style={{ padding: '5px 12px', border: '1px solid #CBD5E1', borderRadius: 6, background: '#ffffff', cursor: 'pointer', fontSize: 13 }}
                      >
                        &lt;
                      </button>
                      {[1, 2, 3].map(page => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          style={{
                            padding: '5px 12px',
                            border: currentPage === page ? '1.5px solid #7565A8' : '1px solid #CBD5E1',
                            borderRadius: 6,
                            background: currentPage === page ? '#7565A8' : '#ffffff',
                            color: currentPage === page ? '#ffffff' : '#334155',
                            fontWeight: currentPage === page ? 700 : 500,
                            cursor: 'pointer',
                            fontSize: 13
                          }}
                        >
                          {page}
                        </button>
                      ))}
                      <button 
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.min(3, prev + 1))}
                        style={{ padding: '5px 12px', border: '1px solid #CBD5E1', borderRadius: 6, background: '#ffffff', cursor: 'pointer', fontSize: 13 }}
                      >
                        &gt;
                      </button>
                    </div>

                    <span style={{ fontSize: 13, color: '#64748B' }}>
                      Tổng số kết quả: <strong style={{ color: '#0F172A' }}>{filteredJobs.length}</strong>
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Bar matching wireframe */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #000000',
              borderRadius: 12,
              padding: '16px 20px',
              textAlign: 'center',
              fontSize: 13,
              color: '#475569'
            }}>
              <span>Giới thiệu</span> · <span>Liên hệ</span> · <span>Điều khoản</span> · <span>© 2026 JOBNEST</span>
            </div>

            {/* Wireframe Annotation matching Draw.io */}
            <div style={{
              background: '#F8FAFC',
              border: '1.5px dashed #64748B',
              borderRadius: 8,
              padding: '12px 18px',
              fontSize: 12,
              color: '#475569',
              lineHeight: 1.6
            }}>
              <strong style={{ color: '#0F172A' }}>Annotation — </strong>
              Trạng thái UI: Đang tải (skeleton) / Trống (chưa có tin đăng tuyển) / Lỗi (kèm nút Thử lại) / Thành công. Lưu ý: chỉ hiển thị Job đã PUBLISHED. Màn hình này chưa có trong File 05 — TBD, cần nhóm duyệt. Nút Báo cáo &rarr; WF-X01.
            </div>
          </div>
        )}
      </div>

      {/* Modal Báo cáo vi phạm (WF-X01) */}
      <ReportViolationModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="USER"
        targetId={employerId}
        targetTitle={profile?.company_name || profile?.full_name || `Nhà tuyển dụng #${employerId}`}
        currentUser={currentUser}
        showToast={showToast}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
}

