import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2, MapPin, Users, Calendar, Briefcase, Globe, Mail, Phone, Flag, ArrowLeft, RefreshCw,
  ShieldCheck, ShieldAlert, Clock3, CheckCircle2, CircleDashed, X, ChevronLeft, ChevronRight, Search, Award
} from 'lucide-react';
import { API_BASE, resolveFileUrl } from '../../config/api';
import CompanyLogo from '../../components/common/CompanyLogo';
import JobCard from '../../components/common/JobCard';
import JobLocationMap from '../../components/common/JobLocationMap';
import ReportViolationModal from '../../components/forms/ReportViolationModal';
import CompanyReviewsSection from '../../components/reviews/CompanyReviewsSection';
import { applyBlockReason, salaryOptionsFor, matchesSalaryFilter, shortLocation } from '../../utils/jobDisplay';

const ACCOUNT_LABEL = { BUSINESS: 'Doanh nghiệp', INDIVIDUAL: 'Nhà tuyển dụng cá nhân / Hộ kinh doanh' };
const SOCIAL_LABEL = { facebook: 'Facebook', linkedin: 'LinkedIn', tiktok: 'TikTok', youtube: 'YouTube', instagram: 'Instagram' };
// Thứ tự hiển thị chính sách nhân sự (ưu tiên thông tin sinh viên quan tâm)
const POLICY_LABELS = [
  ['internship', 'Chính sách thực tập'], ['training', 'Đào tạo nhân viên mới'], ['student_support', 'Hỗ trợ sinh viên'],
  ['flexible_schedule', 'Lịch làm việc linh hoạt'], ['part_time', 'Chính sách Part-time'], ['full_time', 'Chính sách Full-time'],
  ['benefits', 'Phúc lợi'], ['career_growth', 'Cơ hội phát triển nghề nghiệp'], ['hr_policies', 'Chính sách khác'],
];
const policyText = (p, key) => (['benefits', 'hr_policies'].includes(key) ? p[key] : p.hr_policy_details?.[key]);
const JOBS_STEP = 6;

const monthYear = (d) => {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : `${String(t.getMonth() + 1).padStart(2, '0')}/${t.getFullYear()}`;
};
const hostOf = (url) => { try { return new URL(url).host.replace(/^www\./, ''); } catch { return url; } };
// Khu vực: bỏ phần số nhà/tên đường, giữ quận/khu vực + tỉnh/thành
const areaOf = (loc) => {
  const parts = String(loc || '').split(',').map(x => x.trim()).filter(x => x && !/^(số\s*)?[0-9]/i.test(x));
  return parts.length ? parts.slice(-2).join(', ') : null;
};
const cityOf = (job) => { const s = shortLocation(job); return s ? s.split(',').pop().trim() : null; };

const card = { background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', padding: '22px 24px', boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)' };
const h2 = { fontSize: 19, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 16px 0' };
const h3 = { fontSize: 15, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px 0' };
const para = { fontSize: 14.5, color: '#334155', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line', overflowWrap: 'anywhere', maxWidth: '75ch' };
const chip = (bg, color, border) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: bg, color, border: `1px solid ${border}` });
const btnPrimary = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', background: '#7565A8', color: '#ffffff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' };
const btnOutline = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1.5px solid #CBD5E1', background: '#ffffff', color: '#334155', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' };
const btnLink = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 4px', border: 'none', background: 'none', color: '#7565A8', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const control = { padding: '8px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, fontWeight: 600, color: '#334155', background: '#ffffff', minWidth: 0 };
const lbBtn = { position: 'absolute', width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

function TextBlock({ title, text }) {
  if (!text) return null;
  return <div className="company-block"><h3 style={h3}>{title}</h3><p style={para}>{text}</p></div>;
}

function VerifyRow({ label, state, hint }) {
  const s = {
    ok: { icon: CheckCircle2, color: '#047857', text: 'Đã xác minh' },
    pending: { icon: Clock3, color: '#B45309', text: 'Đang chờ duyệt' },
    no: { icon: CircleDashed, color: '#94A3B8', text: 'Chưa xác minh' },
  }[state];
  const Icon = s.icon;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: '1px solid #F1F5F9' }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text)' }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>{hint}</div>}
      </div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: s.color, whiteSpace: 'nowrap' }}>
        <Icon size={14} /> {s.text}
      </span>
    </div>
  );
}

function ContactRow({ icon: Icon, label, children }) {
  if (!children) return null;
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderTop: '1px solid #F1F5F9' }}>
      <Icon size={16} color="#7565A8" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#64748B' }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', overflowWrap: 'anywhere' }}>{children}</div>
      </div>
    </div>
  );
}

/** Trang hồ sơ công khai của nhà tuyển dụng (4 mục: Tổng quan, Giới thiệu, Tin tuyển dụng, Liên hệ). Chỉ dữ liệu thật. */
export default function EmployerPublicProfilePage({
  employerId,
  currentUser = null,
  onNavigateJobs,
  onSelectJob,
  onOpenAuth,
  showToast,
  savedJobIds = [],
  onToggleSave,
}) {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | error
  const [keyword, setKeyword] = useState('');
  const [workFilter, setWorkFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [visibleJobs, setVisibleJobs] = useState(JOBS_STEP);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewToReport, setReviewToReport] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const navRef = useRef(null);
  const clickLockRef = useRef(null); // khi bấm tab: giữ tab đó cho tới khi cuộn xong

  const load = useCallback(async () => {
    if (!employerId) { setStatus('notfound'); return; }
    setStatus('loading');
    try {
      const [pRes, jRes] = await Promise.all([
        fetch(`${API_BASE}/profile/${employerId}`),
        fetch(`${API_BASE}/jobs?employerId=${employerId}&limit=200`),
      ]);
      if (pRes.status === 404) { setStatus('notfound'); return; }
      const pData = await pRes.json();
      if (!pRes.ok || !pData.success) throw new Error(pData.message);
      const jData = jRes.ok ? await jRes.json() : { data: [] };
      setProfile(pData.data);
      setJobs(Array.isArray(jData.data) ? jData.data : []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [employerId]);

  useEffect(() => { load(); }, [load]);

  // API chỉ trả tin OPEN + đã duyệt; loại thêm tin đã quá hạn nhận hồ sơ
  const openJobs = useMemo(() => jobs.filter(j => !applyBlockReason(j)), [jobs]);
  const categories = useMemo(() => [...new Set(openJobs.map(j => j.category).filter(Boolean))].sort(), [openJobs]);
  const cities = useMemo(() => [...new Set(openJobs.map(cityOf).filter(Boolean))].sort(), [openJobs]);
  const filteredJobs = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return openJobs
      .filter(j => !q || (j.title || '').toLowerCase().includes(q))
      .filter(j => !workFilter || j.work_type === workFilter)
      .filter(j => !categoryFilter || j.category === categoryFilter)
      .filter(j => !cityFilter || cityOf(j) === cityFilter)
      .filter(j => matchesSalaryFilter(j, salaryFilter));
  }, [openJobs, keyword, workFilter, categoryFilter, cityFilter, salaryFilter]);
  useEffect(() => { setVisibleJobs(JOBS_STEP); }, [keyword, workFilter, categoryFilter, cityFilter, salaryFilter]);
  const filtersActive = Boolean(keyword || workFilter || categoryFilter || cityFilter || salaryFilter);
  const clearFilters = () => { setKeyword(''); setWorkFilter(''); setCategoryFilter(''); setCityFilter(''); setSalaryFilter(''); };

  const p = profile;
  const policies = p ? POLICY_LABELS.filter(([k]) => policyText(p, k)) : [];
  const hasAbout = Boolean(p && ([p.bio, p.industry, p.company_type, p.products_services, p.mission, p.core_values, p.achievements,
    p.work_environment_desc, p.internal_culture].some(Boolean) || policies.length || p.office_images?.length));
  const mapAddress = p ? (p.headquarters || p.location || p.province) : null;
  const hasContact = Boolean(p && (p.website || p.public_email || p.public_phone || mapAddress || p.branches?.length || Object.keys(p.social_links || {}).length));

  // Luôn giữ đủ 5 mục; mục chưa có dữ liệu hiển thị 1 dòng thông báo thay vì khung rỗng
  const sections = useMemo(() => [
    ['overview', 'Tổng quan'],
    ['about', 'Giới thiệu'],
    ['jobs', 'Tin tuyển dụng'],
    ['reviews', 'Đánh giá'],
    ['contact', 'Liên hệ'],
  ], []);

  // Vị trí đặt tiêu đề khi bấm tab = ngay dưới header trang + thanh tab (đo thật) + khoảng thở
  const stickyOffset = () => {
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--app-header-h'), 10) || 84;
    return headerH + (navRef.current?.offsetHeight || 48) + 16;
  };
  // Vạch nhận diện mục đang xem: thấp hơn vị trí trên một chút để tiêu đề vừa hiện dưới thanh tab là đổi tab
  const spyLine = () => stickyOffset() + Math.min(140, window.innerHeight * 0.2);

  // Scroll-spy: mục cuối cùng có tiêu đề đã qua vạch nhận diện; chạm đáy trang → mục cuối
  useEffect(() => {
    if (status !== 'ready') return undefined;
    const update = () => {
      if (clickLockRef.current) return;
      const line = spyLine();
      let current = sections[0][0];
      for (const [id] of sections) {
        const el = document.getElementById(`company-${id}`);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1][0];
      setActiveSection(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [status, sections]);

  const goTo = (id) => {
    const el = document.getElementById(`company-${id}`);
    if (!el) return;
    setActiveSection(id);
    const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset();
    // Giữ tab vừa bấm cho tới khi cuộn mượt dừng hẳn (không nhảy qua các tab ở giữa)
    clearTimeout(clickLockRef.current);
    let last = -1;
    const waitStop = () => {
      if (Math.abs(window.scrollY - last) < 1) { clickLockRef.current = null; return; }
      last = window.scrollY;
      clickLockRef.current = setTimeout(waitStop, 120);
    };
    clickLockRef.current = setTimeout(waitStop, 150);
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };
  useEffect(() => () => clearTimeout(clickLockRef.current), []);

  // Màn hình hẹp: thanh tab cuộn ngang → luôn đưa tab đang chọn vào tầm nhìn
  useEffect(() => {
    const nav = navRef.current;
    const b = nav?.querySelector('.is-active');
    if (!nav || !b || nav.scrollWidth <= nav.clientWidth) return;
    const left = b.offsetLeft - 16;
    const right = b.offsetLeft + b.offsetWidth + 16 - nav.clientWidth;
    if (nav.scrollLeft > left) nav.scrollLeft = left;
    else if (nav.scrollLeft < right) nav.scrollLeft = right;
  }, [activeSection]);

  // Phím tắt trình xem ảnh
  useEffect(() => {
    if (lightbox === null) return undefined;
    const n = p?.office_images?.length || 0;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % n);
      if (e.key === 'ArrowLeft') setLightbox(i => (i - 1 + n) % n);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox, p]);

  if (status === 'loading') {
    return (
      <div className="company-page" aria-busy="true">
        <div style={{ height: 96, borderRadius: 18, background: 'linear-gradient(90deg,#F1EEF8,#F8F7FB,#F1EEF8)' }} />
        <div style={{ height: 140, marginTop: 14, borderRadius: 16, background: '#F8F7FB' }} />
        <div style={{ textAlign: 'center', color: '#94A3B8', marginTop: 14, fontSize: 13 }}>Đang tải hồ sơ doanh nghiệp…</div>
      </div>
    );
  }

  if (status === 'notfound' || status === 'error') {
    const notFound = status === 'notfound';
    return (
      <div style={{ ...card, maxWidth: 560, margin: '40px auto', textAlign: 'center' }} role="alert">
        <ShieldAlert size={36} color={notFound ? '#94A3B8' : '#DC2626'} style={{ margin: '0 auto 10px' }} />
        <h2 style={{ ...h2, marginBottom: 6 }}>{notFound ? 'Không tìm thấy nhà tuyển dụng' : 'Không tải được hồ sơ doanh nghiệp'}</h2>
        <p style={{ ...para, color: '#64748B', margin: '0 auto 18px' }}>
          {notFound ? 'Hồ sơ này không tồn tại hoặc đã ngừng hoạt động.' : 'Vui lòng kiểm tra kết nối và thử lại.'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {!notFound && <button type="button" onClick={load} style={btnPrimary}><RefreshCw size={15} /> Thử lại</button>}
          {onNavigateJobs && <button type="button" onClick={onNavigateJobs} style={btnOutline}><Briefcase size={15} /> Xem việc làm khác</button>}
        </div>
      </div>
    );
  }

  const cover = resolveFileUrl(p.cover_url);
  const legalState = p.verification.legal ? 'ok' : p.verification.legal_status === 'PENDING' ? 'pending' : 'no';
  const joined = monthYear(p.joined_at);
  const place = p.province || areaOf(p.location);
  const stats = [
    ['Lĩnh vực hoạt động', p.industry, Briefcase],
    ['Quy mô nhân sự', p.company_size, Users],
    ['Năm thành lập', p.founded_year, Calendar],
    ['Địa điểm', place, MapPin],
    ['Tham gia JobNest', joined, Award],
    ['Tin đang tuyển', `${p.open_jobs_count} vị trí`, Briefcase],
  ].filter(([, v]) => v !== null && v !== undefined && v !== '');
  const socials = Object.entries(p.social_links || {});
  const longBio = (p.bio || '').length > 320;

  return (
    <div className="company-page">
      {onNavigateJobs && (
        <button type="button" onClick={onNavigateJobs} style={{ ...btnLink, marginBottom: 10 }}><ArrowLeft size={15} /> Quay lại danh sách việc làm</button>
      )}

      {/* ===== Company Header ===== */}
      <header style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div
          className={cover ? 'company-cover has-image' : 'company-cover'}
          style={{ background: cover ? `#E2E8F0 url("${cover}") center / cover no-repeat` : 'linear-gradient(120deg, #7565A8 0%, #A997C5 55%, #F4B99D 100%)' }}
          role={cover ? 'img' : undefined}
          aria-label={cover ? `Ảnh bìa ${p.display_name}` : undefined}
        />
        <div className="company-header-body">
          <div className="company-logo-wrap">
            <CompanyLogo src={p.logo_url} alt={p.display_name} size={88} borderRadius={14} />
          </div>
          <div className="company-header-info">
            <h1 title={p.display_name} style={{
              fontSize: 23, fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1.3, overflowWrap: 'anywhere',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>{p.display_name}</h1>
            {p.brand_name && p.brand_name !== p.display_name && (
              <div style={{ fontSize: 13.5, color: '#64748B', marginTop: 2 }}>Thương hiệu: <strong>{p.brand_name}</strong></div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {p.verification.legal && <span style={chip('#ECFDF5', '#047857', '#A7F3D0')}><ShieldCheck size={13} /> Đã xác minh pháp lý</span>}
              {ACCOUNT_LABEL[p.account_type] && <span style={chip('#F1EEF8', '#594675', '#DDD6FE')}><Building2 size={13} /> {ACCOUNT_LABEL[p.account_type]}</span>}
              {p.industry && <span style={chip('#F8FAFC', '#334155', '#E2E8F0')}>{p.industry}</span>}
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
              {place && <span><MapPin size={13} style={{ verticalAlign: -2 }} /> {place}</span>}
              {joined && <span><Calendar size={13} style={{ verticalAlign: -2 }} /> Tham gia JobNest từ {joined}</span>}
              <span><Briefcase size={13} style={{ verticalAlign: -2 }} /> {p.open_jobs_count} vị trí đang tuyển</span>
            </div>
          </div>
          <div className="company-header-actions">
            <button type="button" onClick={() => goTo('jobs')} style={btnPrimary}><Briefcase size={15} /> Xem việc làm</button>
            <button type="button" onClick={() => setReportOpen(true)} style={btnOutline}><Flag size={15} /> Báo cáo vi phạm</button>
          </div>
        </div>
      </header>

      {/* ===== Điều hướng 4 mục (dính dưới header trang) ===== */}
      <nav ref={navRef} aria-label="Mục trong hồ sơ công ty" className="company-nav">
        {sections.map(([id, label]) => (
          <button key={id} type="button" onClick={() => goTo(id)} aria-current={activeSection === id ? 'location' : undefined}
            className={activeSection === id ? 'is-active' : ''}>
            {label}
          </button>
        ))}
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
        {/* ===== Tổng quan ===== */}
        <section id="company-overview" style={card} aria-labelledby="h-overview">
          <h2 id="h-overview" style={h2}>Tổng quan</h2>
          {p.bio && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ ...para, ...(longBio && !bioExpanded ? { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}) }}>{p.bio}</p>
              {longBio && <button type="button" style={btnLink} onClick={() => setBioExpanded(v => !v)}>{bioExpanded ? 'Thu gọn' : 'Xem thêm'}</button>}
            </div>
          )}
          <div className="company-stats">
            {stats.map(([label, value, Icon]) => (
              <div key={label} className="company-stat">
                <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}><Icon size={13} /> {label}</div>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--color-text)', marginTop: 4, overflowWrap: 'anywhere' }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <h3 style={{ ...h3, marginBottom: 2 }}>Xác minh & độ tin cậy</h3>
            <VerifyRow label="Pháp lý doanh nghiệp" state={legalState} hint="JobNest đối chiếu giấy phép kinh doanh" />
            <VerifyRow label="Email" state={p.verification.email ? 'ok' : 'no'} />
            <VerifyRow label="Số điện thoại" state={p.verification.phone ? 'ok' : 'no'} />
            <p style={{ fontSize: 12, color: '#94A3B8', margin: '8px 0 0 0' }}>Xác minh email/số điện thoại chỉ xác nhận kênh liên lạc, không thay cho xác minh pháp lý.</p>
          </div>
        </section>

        {/* ===== Giới thiệu ===== */}
        {(
          <section id="company-about" style={{ ...card, display: 'flex', flexDirection: 'column', gap: 20 }} aria-labelledby="h-about">
            <h2 id="h-about" style={{ ...h2, marginBottom: 0 }}>Giới thiệu</h2>
            {!hasAbout && <p style={{ ...para, color: '#94A3B8' }}>Doanh nghiệp chưa cập nhật phần giới thiệu.</p>}
            <TextBlock title="Giới thiệu doanh nghiệp" text={p.bio} />
            {(p.industry || p.company_type) && (
              <TextBlock title="Lĩnh vực hoạt động" text={[p.industry, p.company_type].filter(Boolean).join(' · ')} />
            )}
            <TextBlock title="Sản phẩm & dịch vụ" text={p.products_services} />
            <TextBlock title="Sứ mệnh & tầm nhìn" text={p.mission} />
            <TextBlock title="Giá trị cốt lõi" text={p.core_values} />
            <TextBlock title="Thành tựu nổi bật" text={p.achievements} />
            <TextBlock title="Môi trường làm việc" text={p.work_environment_desc} />
            <TextBlock title="Văn hóa nội bộ" text={p.internal_culture} />
            {p.office_images?.length > 0 && (
              <div className="company-block">
                <h3 style={{ ...h3, marginBottom: 10 }}>Hình ảnh doanh nghiệp</h3>
                <div className="company-gallery">
                  {p.office_images.map((url, i) => (
                    <button key={url} type="button" onClick={() => setLightbox(i)} aria-label={`Xem ảnh văn phòng ${i + 1}`}>
                      <img src={resolveFileUrl(url)} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {policies.length > 0 && (
              <div className="company-block">
                <h3 style={{ ...h3, marginBottom: 10 }}>Chính sách nhân sự</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 12 }}>
                  {policies.map(([k, label]) => (
                    <div key={k} style={{ border: '1px solid #EDE9F6', background: '#FBFAFE', borderRadius: 12, padding: '12px 14px' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#594675', marginBottom: 4 }}>{label}</div>
                      <p style={{ ...para, fontSize: 14 }}>{policyText(p, k)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ===== Tin tuyển dụng ===== */}
        <section id="company-jobs" style={card} aria-labelledby="h-jobs">
          <h2 id="h-jobs" style={{ ...h2, marginBottom: 12 }}>Tin tuyển dụng đang nhận hồ sơ ({openJobs.length})</h2>
          {openJobs.length > 0 && (
            <div className="company-job-filters">
              <label className="company-search">
                <Search size={15} color="#94A3B8" />
                <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên công việc" aria-label="Tìm theo tên công việc" />
              </label>
              <select style={control} value={workFilter} aria-label="Hình thức làm việc"
                onChange={(e) => { setWorkFilter(e.target.value); setSalaryFilter(''); }}>
                <option value="">Mọi hình thức</option>
                <option value="PART_TIME">Part-time ({openJobs.filter(j => j.work_type === 'PART_TIME').length})</option>
                <option value="FULL_TIME">Full-time ({openJobs.filter(j => j.work_type === 'FULL_TIME').length})</option>
              </select>
              {categories.length > 1 && (
                <select style={control} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Ngành nghề">
                  <option value="">Mọi ngành nghề</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              {cities.length > 1 && (
                <select style={control} value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} aria-label="Địa điểm">
                  <option value="">Mọi địa điểm</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              <select style={control} value={salaryFilter} onChange={(e) => setSalaryFilter(e.target.value)} aria-label="Mức lương">
                {salaryOptionsFor(workFilter).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {filtersActive && <button type="button" style={btnLink} onClick={clearFilters}><X size={14} /> Xóa lọc</button>}
            </div>
          )}

          {filteredJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '26px 12px', border: '1px dashed #E2E8F0', borderRadius: 12, color: '#64748B', fontSize: 14 }}>
              {openJobs.length === 0 ? 'Doanh nghiệp hiện chưa có tin tuyển dụng đang nhận hồ sơ.' : 'Không có tin phù hợp với bộ lọc.'}
              {filtersActive && openJobs.length > 0 && <div><button type="button" style={btnLink} onClick={clearFilters}>Xóa bộ lọc</button></div>}
            </div>
          ) : (
            <div className="company-jobs-grid">
              {filteredJobs.slice(0, visibleJobs).map(job => (
                <JobCard key={job.id} job={job} isSaved={savedJobIds.includes(job.id)} onToggleSave={onToggleSave} onSelectJob={onSelectJob} />
              ))}
            </div>
          )}
          {filteredJobs.length > visibleJobs && (
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <button type="button" onClick={() => setVisibleJobs(v => v + JOBS_STEP)} style={btnOutline}>
                Xem thêm ({filteredJobs.length - visibleJobs} tin)
              </button>
            </div>
          )}
        </section>

        {/* ===== Đánh giá ===== */}
        <section id="company-reviews" style={card} aria-labelledby="h-reviews">
          <CompanyReviewsSection
            employerId={employerId}
            employerName={p.display_name}
            currentUser={currentUser}
            onOpenAuth={onOpenAuth}
            onSelectJob={onSelectJob}
            onReport={setReviewToReport}
            showToast={showToast}
          />
        </section>

        {/* ===== Liên hệ ===== */}
        {(
          <section id="company-contact" style={card} aria-labelledby="h-contact">
            <h2 id="h-contact" style={{ ...h2, marginBottom: 6 }}>Liên hệ</h2>
            {!hasContact && <p style={{ ...para, color: '#94A3B8' }}>Doanh nghiệp chưa công khai thông tin liên hệ và địa chỉ.</p>}
            <div className="company-contact-grid">
              <div style={{ minWidth: 0 }}>
                <ContactRow icon={Globe} label="Website chính thức">
                  {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer nofollow" style={{ color: '#7565A8' }}>{hostOf(p.website)}</a>}
                </ContactRow>
                <ContactRow icon={Mail} label="Email liên hệ">
                  {p.public_email && <a href={`mailto:${p.public_email}`} style={{ color: '#7565A8' }}>{p.public_email}</a>}
                </ContactRow>
                <ContactRow icon={Phone} label="Điện thoại">
                  {p.public_phone && <a href={`tel:${p.public_phone}`} style={{ color: '#7565A8' }}>{p.public_phone}</a>}
                </ContactRow>
                <ContactRow icon={MapPin} label={p.headquarters ? 'Địa chỉ trụ sở' : 'Khu vực'}>{mapAddress}</ContactRow>
                {p.branches?.length > 0 && (
                  <ContactRow icon={MapPin} label={`Chi nhánh (${p.branches.length})`}>
                    <ul style={{ margin: 0, paddingLeft: 16, fontWeight: 500, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {p.branches.map((b, i) => (
                        <li key={`${b.name || ''}-${b.address}-${i}`}>
                          {b.name && <strong>{b.name}: </strong>}{b.address}
                          {(b.phone || b.email) && (
                            <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>
                              {b.phone && <a href={`tel:${b.phone}`} style={{ color: '#7565A8' }}>{b.phone}</a>}
                              {b.phone && b.email && ' · '}
                              {b.email && <a href={`mailto:${b.email}`} style={{ color: '#7565A8' }}>{b.email}</a>}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </ContactRow>
                )}
                {socials.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                    {socials.map(([k, url]) => (
                      <a key={k} href={url} target="_blank" rel="noopener noreferrer nofollow" style={{ ...chip('#F8FAFC', '#475569', '#E2E8F0'), textDecoration: 'none' }}>{SOCIAL_LABEL[k] || k}</a>
                    ))}
                  </div>
                )}
                {hasContact && !p.website && !p.public_email && !p.public_phone && (
                  <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '10px 0 0 0' }}>Doanh nghiệp chưa công khai website, email hoặc số điện thoại liên hệ.</p>
                )}
              </div>
              {mapAddress && (
                <JobLocationMap
                  job={{ title: p.display_name, work_address: p.headquarters, location: p.location || p.province, latitude: p.latitude, longitude: p.longitude }}
                  title="Vị trí doanh nghiệp"
                  exactLabel="Vị trí do doanh nghiệp ghim"
                  approxLabel="Ước lượng theo địa chỉ"
                  mapHeight={260}
                  strictPrecision
                />
              )}
            </div>
          </section>
        )}
      </div>

      {lightbox !== null && p.office_images?.length > 0 && (
        <div role="dialog" aria-modal="true" aria-label="Ảnh văn phòng" onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <img src={resolveFileUrl(p.office_images[lightbox])} alt={`Ảnh văn phòng ${lightbox + 1}`} onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '86vh', borderRadius: 12, objectFit: 'contain' }} />
          <button type="button" aria-label="Đóng" onClick={() => setLightbox(null)} style={{ ...lbBtn, top: 16, right: 16 }}><X size={20} /></button>
          {p.office_images.length > 1 && (
            <>
              <button type="button" aria-label="Ảnh trước" onClick={(e) => { e.stopPropagation(); setLightbox(i => (i - 1 + p.office_images.length) % p.office_images.length); }} style={{ ...lbBtn, left: 16, top: '50%' }}><ChevronLeft size={22} /></button>
              <button type="button" aria-label="Ảnh sau" onClick={(e) => { e.stopPropagation(); setLightbox(i => (i + 1) % p.office_images.length); }} style={{ ...lbBtn, right: 16, top: '50%' }}><ChevronRight size={22} /></button>
            </>
          )}
        </div>
      )}

      <ReportViolationModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="USER"
        targetId={employerId}
        targetTitle={p.display_name}
        currentUser={currentUser}
        showToast={showToast}
        onOpenAuth={onOpenAuth}
      />
      <ReportViolationModal
        isOpen={Boolean(reviewToReport)}
        onClose={() => setReviewToReport(null)}
        targetType={reviewToReport?.type === 'job' ? 'JOB_REVIEW' : 'COMPANY_REVIEW'}
        targetId={reviewToReport?.id}
        targetTitle={reviewToReport ? (reviewToReport.title || reviewToReport.job_title || `#${reviewToReport.id}`) : ''}
        currentUser={currentUser}
        showToast={showToast}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
}
