import React, { useCallback, useEffect, useState } from 'react';
import { PenLine, RefreshCw, ChevronLeft, ChevronRight, Star, Briefcase } from 'lucide-react';
import ReviewSummary from './ReviewSummary';
import ReviewCard from './ReviewCard';
import ReviewFormModal from './ReviewFormModal';
import MyReviewItem from './MyReviewItem';
import { reviewRequest } from './reviewApi';
import { COMPANY_CRITERIA, JOB_CRITERIA, EXPERIENCE_LABEL, COMPANY_EXPERIENCES, ELIGIBILITY_MESSAGE, formatRating } from '../../utils/reviewDisplay';

const h2 = { fontSize: 19, fontWeight: 800, color: 'var(--color-text)', margin: 0 };
const control = { padding: '8px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, fontWeight: 600, color: '#334155', background: '#ffffff', minWidth: 0 };
const btnPrimary = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: 'none', background: '#7565A8', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' };
const btnOutline = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', background: '#fff', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' };
const empty = { textAlign: 'center', padding: '22px 12px', border: '1px dashed #E2E8F0', borderRadius: 12, color: '#64748B', fontSize: 14 };

function Pager({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;
  return (
    <nav aria-label="Phân trang đánh giá" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 12 }}>
      <button type="button" style={btnOutline} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Trang trước"><ChevronLeft size={15} /></button>
      <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Trang {page}/{totalPages}</span>
      <button type="button" style={btnOutline} disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Trang sau"><ChevronRight size={15} /></button>
    </nav>
  );
}

/**
 * Tab "Đánh giá" trên trang doanh nghiệp: điểm doanh nghiệp và điểm công việc tách riêng.
 * Chỉ hiển thị đánh giá đã được duyệt (API chỉ trả PUBLISHED).
 */
export default function CompanyReviewsSection({ employerId, employerName, currentUser, onOpenAuth, onSelectJob, onReport, showToast }) {
  const [summary, setSummary] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [view, setView] = useState('company'); // company | job
  const [filters, setFilters] = useState({ experience: '', rating: '', verified: false, sort: 'newest' });
  const [page, setPage] = useState(1);
  const [list, setList] = useState({ data: [], pagination: null, loading: true });
  const [jobFilter, setJobFilter] = useState('');
  const [jobPage, setJobPage] = useState(1);
  const [jobList, setJobList] = useState({ data: [], jobs: [], pagination: null, loading: true });
  const [modal, setModal] = useState(null); // { type, targetId, targetName, existing }
  const token = currentUser?.token;

  const loadBase = useCallback(async () => {
    setState('loading');
    try {
      const [s, e] = await Promise.all([
        reviewRequest(`/reviews/companies/${employerId}/summary`),
        reviewRequest(`/reviews/companies/${employerId}/eligibility`, { token }),
      ]);
      setSummary(s.data);
      setEligibility(e.data);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [employerId, token]);
  useEffect(() => { loadBase(); }, [loadBase]);

  useEffect(() => {
    let alive = true;
    const q = new URLSearchParams({ page: String(page), limit: '5', sort: filters.sort });
    if (filters.experience) q.set('experience', filters.experience);
    if (filters.rating) q.set('rating', filters.rating);
    if (filters.verified) q.set('verified', 'true');
    setList(l => ({ ...l, loading: true }));
    reviewRequest(`/reviews/companies/${employerId}/company-reviews?${q}`)
      .then(r => alive && setList({ data: r.data, pagination: r.pagination, loading: false }))
      .catch(() => alive && setList({ data: [], pagination: null, loading: false, error: true }));
    return () => { alive = false; };
  }, [employerId, filters, page, summary]);

  useEffect(() => {
    let alive = true;
    const q = new URLSearchParams({ page: String(jobPage), limit: '5' });
    if (jobFilter) q.set('job_id', jobFilter);
    setJobList(l => ({ ...l, loading: true }));
    reviewRequest(`/reviews/companies/${employerId}/job-reviews?${q}`)
      .then(r => alive && setJobList({ data: r.data, jobs: r.jobs, pagination: r.pagination, loading: false }))
      .catch(() => alive && setJobList({ data: [], jobs: [], pagination: null, loading: false, error: true }));
    return () => { alive = false; };
  }, [employerId, jobFilter, jobPage, summary]);

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
  const filtersActive = Boolean(filters.experience || filters.rating || filters.verified);

  // Nút viết đánh giá: kiểm tra đăng nhập, vai trò, điều kiện
  const writeCompanyReview = () => {
    if (!currentUser?.token) { onOpenAuth?.('login'); return; }
    if (eligibility?.existing) { setModal({ type: 'company', targetId: employerId, targetName: employerName, existing: eligibility.existing }); return; }
    if (!eligibility?.can_review) { showToast?.(ELIGIBILITY_MESSAGE[eligibility?.reason] || 'Bạn chưa thể viết đánh giá', 'error'); return; }
    setModal({ type: 'company', targetId: employerId, targetName: employerName, existing: null });
  };
  const writeJobReview = async (job) => {
    try {
      const e = await reviewRequest(`/reviews/jobs/${job.job_id}/eligibility`, { token });
      if (e.data.existing) setModal({ type: 'job', targetId: job.job_id, targetName: job.title, existing: e.data.existing });
      else if (e.data.can_review) setModal({ type: 'job', targetId: job.job_id, targetName: job.title, existing: null });
      else showToast?.(ELIGIBILITY_MESSAGE[e.data.reason] || 'Bạn chưa thể đánh giá công việc này', 'error');
    } catch (err) {
      showToast?.(err.message, 'error');
    }
  };

  if (state === 'loading') return <div aria-busy="true" style={{ color: '#94A3B8', fontSize: 13.5 }}>Đang tải đánh giá…</div>;
  if (state === 'error') {
    return (
      <div role="alert" style={empty}>
        Không tải được đánh giá. <button type="button" onClick={loadBase} style={{ ...btnOutline, marginLeft: 8 }}><RefreshCw size={14} /> Thử lại</button>
      </div>
    );
  }

  const company = summary.company;
  const jobsSummary = summary.jobs;
  const isStudent = currentUser?.role === 'STUDENT';
  const workedJobs = eligibility?.worked_jobs || [];
  const hint = !currentUser?.token ? ELIGIBILITY_MESSAGE.LOGIN_REQUIRED
    : (!isStudent && eligibility?.reason) ? ELIGIBILITY_MESSAGE[eligibility.reason] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h2 id="h-reviews" style={h2}>Đánh giá từ ứng viên</h2>
        {(isStudent || !currentUser?.token) && (
          <button type="button" style={btnPrimary} onClick={writeCompanyReview}>
            <PenLine size={15} /> {eligibility?.existing ? 'Xem / sửa đánh giá của bạn' : 'Viết đánh giá doanh nghiệp'}
          </button>
        )}
      </div>
      {hint && <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>{hint}</p>}

      {eligibility?.existing && (
        <div style={{ border: '1px solid #DDD6FE', background: '#FBFAFE', borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#594675', marginBottom: 8 }}>Đánh giá của bạn</div>
          <MyReviewItem review={eligibility.existing} currentUser={currentUser} showToast={showToast} onChanged={loadBase}
            onEdit={(r) => setModal({ type: 'company', targetId: employerId, targetName: employerName, existing: r })} />
        </div>
      )}

      {isStudent && workedJobs.length > 0 && (
        <div style={{ fontSize: 13, color: '#334155', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Briefcase size={14} color="#7565A8" /> Đánh giá công việc bạn đã làm:
          {workedJobs.map(j => (
            <button key={j.job_id} type="button" style={{ ...btnOutline, padding: '5px 10px', fontSize: 12.5 }} onClick={() => writeJobReview(j)}>{j.title}</button>
          ))}
        </div>
      )}

      <div role="tablist" aria-label="Loại đánh giá" style={{ display: 'flex', gap: 6, borderBottom: '1px solid #F1F5F9' }}>
        {[['company', `Về doanh nghiệp (${company.total})`], ['job', `Về từng công việc (${jobsSummary.total})`]].map(([k, text]) => (
          <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)}
            style={{ border: 'none', background: 'none', padding: '8px 10px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              color: view === k ? '#7565A8' : '#64748B', borderBottom: `2.5px solid ${view === k ? '#7565A8' : 'transparent'}`, marginBottom: -1 }}>
            {text}
          </button>
        ))}
      </div>

      {view === 'company' && (
        company.total === 0 ? (
          <div style={empty}>
            <Star size={22} color="#CBD5E1" style={{ display: 'block', margin: '0 auto 6px' }} />
            Doanh nghiệp chưa có đánh giá nào được duyệt.
          </div>
        ) : (
          <>
            <ReviewSummary summary={company} criteria={COMPANY_CRITERIA} />
            <div className="company-job-filters" style={{ marginBottom: 0 }}>
              <select style={control} value={filters.experience} onChange={(e) => setFilter('experience', e.target.value)} aria-label="Lọc theo trải nghiệm">
                <option value="">Tất cả trải nghiệm</option>
                {COMPANY_EXPERIENCES.map(x => <option key={x} value={x}>{EXPERIENCE_LABEL[x]} ({company.experience_counts?.[x] || 0})</option>)}
              </select>
              <select style={control} value={filters.rating} onChange={(e) => setFilter('rating', e.target.value)} aria-label="Lọc theo số sao">
                <option value="">Mọi số sao</option>
                {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} sao ({company.distribution[s]})</option>)}
              </select>
              <select style={control} value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} aria-label="Sắp xếp">
                <option value="newest">Mới nhất</option>
                <option value="highest">Điểm cao nhất</option>
                <option value="lowest">Điểm thấp nhất</option>
              </select>
              <label style={{ ...control, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={filters.verified} onChange={(e) => setFilter('verified', e.target.checked)} style={{ accentColor: '#7565A8' }} />
                Chỉ trải nghiệm đã xác thực
              </label>
            </div>
            {list.loading ? <div aria-busy="true" style={{ color: '#94A3B8', fontSize: 13 }}>Đang tải…</div>
              : list.error ? <div role="alert" style={empty}>Không tải được danh sách đánh giá.</div>
              : list.data.length === 0 ? (
                <div style={empty}>
                  Không có đánh giá phù hợp với bộ lọc.
                  {filtersActive && <div><button type="button" style={{ ...btnOutline, marginTop: 8 }} onClick={() => { setFilters({ experience: '', rating: '', verified: false, sort: 'newest' }); setPage(1); }}>Xóa bộ lọc</button></div>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {list.data.map(r => <ReviewCard key={r.id} review={r} onReport={currentUser?.token ? onReport : undefined} />)}
                </div>
              )}
            <Pager pagination={list.pagination} onPage={setPage} />
          </>
        )
      )}

      {view === 'job' && (
        jobsSummary.total === 0 ? (
          <div style={empty}>Chưa có đánh giá nào được duyệt cho các công việc của doanh nghiệp.</div>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748B' }}>
              Mỗi đánh giá dưới đây chỉ phản ánh trải nghiệm ở một công việc cụ thể, không đại diện cho toàn bộ doanh nghiệp.
            </p>
            <ReviewSummary summary={jobsSummary} criteria={JOB_CRITERIA} compact />
            <div className="company-job-filters" style={{ marginBottom: 0 }}>
              <select style={control} value={jobFilter} onChange={(e) => { setJobFilter(e.target.value); setJobPage(1); }} aria-label="Lọc theo công việc">
                <option value="">Tất cả công việc ({jobsSummary.total})</option>
                {jobList.jobs.map(j => <option key={j.job_id} value={j.job_id}>{j.title} — {formatRating(j.average_overall)}★ ({j.total})</option>)}
              </select>
            </div>
            {jobList.loading ? <div aria-busy="true" style={{ color: '#94A3B8', fontSize: 13 }}>Đang tải…</div>
              : jobList.error ? <div role="alert" style={empty}>Không tải được danh sách đánh giá.</div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {jobList.data.map(r => (
                    <ReviewCard key={r.id} review={r} onReport={currentUser?.token ? onReport : undefined}
                      onOpenJob={onSelectJob ? (id) => onSelectJob({ id }) : undefined} />
                  ))}
                </div>
              )}
            <Pager pagination={jobList.pagination} onPage={setJobPage} />
          </>
        )
      )}

      {modal && (
        <ReviewFormModal
          isOpen
          onClose={() => setModal(null)}
          type={modal.type}
          targetId={modal.targetId}
          targetName={modal.targetName}
          existing={modal.existing}
          verifiable={eligibility?.verifiable_experiences || []}
          currentUser={currentUser}
          showToast={showToast}
          onSaved={() => loadBase()}
        />
      )}
    </div>
  );
}
