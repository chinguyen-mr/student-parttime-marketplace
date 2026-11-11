import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, Users, FileText, Clock, CheckCircle2, 
  XCircle, AlertCircle, ArrowRight, Plus, RefreshCw, 
  Eye, Calendar, DollarSign, Building2, User, ChevronRight,
  ShieldCheck, AlertTriangle, ExternalLink, Filter, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';
import { DEFAULT_EMPLOYER_JOBS, DEFAULT_APPLICANTS_KETOAN } from '../../App';

export default function EmployerDashboardPage({
  currentUser,
  jobs = [],
  hideSidebar = false,
  onNavigateTab,
  onSelectJobForApplicants,
  onOpenCreateJob,
  onOpenProfile,
  onNavigateHome,
  onNavigateLogin,
  showToast
}) {
  // Navigation / Active View within Employer Portal
  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard' | 'profile' | 'verification' | 'jobs' | 'applicants' | 'proposals' | 'assignments' | 'notifications'

  // Loading, refreshing, and error states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Data states
  const [employerJobs, setEmployerJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [allApplicants, setAllApplicants] = useState([]);

  // Candidate Filter
  const [candidateFilter, setCandidateFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACCEPTED' | 'APPLICATION' | 'PROPOSAL'
  const [searchKeyword, setSearchKeyword] = useState('');

  // =========================================================================
  // 1. ROLE GUARD CHECK (Only EMPLOYER permitted)
  // =========================================================================
  const isEmployer = currentUser?.token && currentUser?.role === 'EMPLOYER';

  // =========================================================================
  // 2. FETCH DASHBOARD DATA
  // =========================================================================
  const fetchDashboardData = async (isManualRefresh = false) => {
    if (!isEmployer) {
      setLoading(false);
      return;
    }

    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setApiError(null);

      const headers = { Authorization: `Bearer ${currentUser.token}` };

      // 1. Fetch Employer's Jobs (GET /api/jobs/my-jobs)
      let fetchedJobs = [];
      try {
        const resJobs = await fetch(`${API_BASE}/jobs/my-jobs`, { headers });
        const dataJobs = await resJobs.json();
        if (dataJobs.success && Array.isArray(dataJobs.data)) {
          fetchedJobs = dataJobs.data;
        }
      } catch (err) {
        console.warn('API /jobs/my-jobs warning:', err);
      }

      // If API returns empty and we have props jobs / seed jobs, keep fallback for smooth UX
      if (fetchedJobs.length === 0 && Array.isArray(DEFAULT_EMPLOYER_JOBS) && DEFAULT_EMPLOYER_JOBS.length > 0) {
        fetchedJobs = DEFAULT_EMPLOYER_JOBS;
      }
      setEmployerJobs(fetchedJobs);

      // 2. Fetch Proposals (GET /api/proposals/employer-proposals)
      let fetchedProposals = [];
      try {
        const resProp = await fetch(`${API_BASE}/proposals/employer-proposals`, { headers });
        const dataProp = await resProp.json();
        if (dataProp.success && Array.isArray(dataProp.data)) {
          fetchedProposals = dataProp.data;
        }
      } catch (err) {
        console.warn('API /proposals/employer-proposals warning:', err);
      }
      setProposals(fetchedProposals);

      // 3. Fetch Assignments (GET /api/assignments/employer-assignments)
      let fetchedAssignments = [];
      try {
        const resAssign = await fetch(`${API_BASE}/assignments/employer-assignments`, { headers });
        const dataAssign = await resAssign.json();
        if (dataAssign.success && Array.isArray(dataAssign.data)) {
          fetchedAssignments = dataAssign.data;
        }
      } catch (err) {
        console.warn('API /assignments/employer-assignments warning:', err);
      }
      setAssignments(fetchedAssignments);

      // 4. Fetch / Compile Recent Applicants
      // Fetch applications from the active jobs or combine with seed applicants
      let compiledApplicants = [];
      try {
        // Try fetching applicants for first 3 jobs if available
        const jobsToCheck = fetchedJobs.slice(0, 3);
        const appPromises = jobsToCheck.map(async (job) => {
          if (!job.id) return [];
          try {
            const resApp = await fetch(`${API_BASE}/applications/job/${job.id}`, { headers });
            const dataApp = await resApp.json();
            if (dataApp.success && Array.isArray(dataApp.data)) {
              return dataApp.data.map(app => ({
                ...app,
                job_title: job.title,
                type: 'APPLICATION'
              }));
            }
          } catch {
            return [];
          }
          return [];
        });

        const appResults = await Promise.all(appPromises);
        compiledApplicants = appResults.flat();
      } catch (err) {
        console.warn('API /applications/job/:id warning:', err);
      }

      // If compiled applicants are empty, use DEFAULT_APPLICANTS_KETOAN as high-fidelity wireframe seed
      if (compiledApplicants.length === 0 && Array.isArray(DEFAULT_APPLICANTS_KETOAN)) {
        compiledApplicants = DEFAULT_APPLICANTS_KETOAN.map(a => ({
          ...a,
          job_title: fetchedJobs[0]?.title || 'Nhân viên kế toán part-time',
          type: 'APPLICATION'
        }));
      }

      // Merge Proposals as candidates into recent applicants list
      const proposalCandidates = fetchedProposals.map(p => ({
        id: `prop-${p.id}`,
        student_name: p.student_name || 'Sinh viên Freelancer',
        student_email: p.student_email || 'student@vlu.edu.vn',
        university: p.university || 'Đại học Văn Lang',
        job_title: p.job_title || 'Dự án Freelance',
        status: p.status || 'PENDING',
        applied_at: p.created_at || new Date().toISOString(),
        type: 'PROPOSAL',
        cover_letter: p.cover_letter || p.proposal_text,
        price: p.price
      }));

      const mergedCandidates = [...compiledApplicants, ...proposalCandidates].sort((a, b) => {
        return new Date(b.applied_at || 0) - new Date(a.applied_at || 0);
      });

      setAllApplicants(mergedCandidates);

      if (isManualRefresh && showToast) {
        showToast('Đã làm mới dữ liệu Bảng điều khiển Nhà tuyển dụng', 'success');
      }
    } catch (err) {
      console.error('Error fetching employer dashboard data:', err);
      setApiError('Không thể tải toàn bộ dữ liệu bảng điều khiển. Hiển thị dữ liệu lưu tạm.');
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi cập nhật bảng điều khiển'), 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  // =========================================================================
  // 3. STATISTICAL KPI CALCULATIONS
  // =========================================================================
  const kpiStats = useMemo(() => {
    // 1. Total Jobs & Active (Recruiting/Open) Jobs
    const totalJobs = employerJobs.length;
    const activeJobs = employerJobs.filter(j => 
      j.status === 'OPEN' || j.status === 'RECRUITING' || j.status === 'PUBLISHED'
    ).length;

    // 2. Total Applications & Pending
    const totalApplications = allApplicants.filter(a => a.type === 'APPLICATION').length;
    const pendingApplications = allApplicants.filter(a => a.type === 'APPLICATION' && a.status === 'PENDING').length;

    // 3. Total Proposals & Pending Proposals
    const totalProposals = proposals.length;
    const pendingProposals = proposals.filter(p => p.status === 'PENDING').length;

    // 4. Assignments In-Progress & Completed
    const inProgressAssignments = assignments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'ACCEPTED').length;
    const completedAssignments = assignments.filter(a => a.status === 'COMPLETED').length;

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      totalProposals,
      pendingProposals,
      inProgressAssignments,
      completedAssignments
    };
  }, [employerJobs, allApplicants, proposals, assignments]);

  // =========================================================================
  // 4. FILTERED CANDIDATES & JOBS LIST
  // =========================================================================
  const filteredCandidates = useMemo(() => {
    return allApplicants.filter(item => {
      // Filter by type or status
      if (candidateFilter === 'PENDING' && item.status !== 'PENDING') return false;
      if (candidateFilter === 'ACCEPTED' && item.status !== 'ACCEPTED') return false;
      if (candidateFilter === 'APPLICATION' && item.type !== 'APPLICATION') return false;
      if (candidateFilter === 'PROPOSAL' && item.type !== 'PROPOSAL') return false;

      // Filter by search keyword
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchName = (item.student_name || '').toLowerCase().includes(kw);
        const matchJob = (item.job_title || '').toLowerCase().includes(kw);
        const matchUni = (item.university || '').toLowerCase().includes(kw);
        return matchName || matchJob || matchUni;
      }
      return true;
    });
  }, [allApplicants, candidateFilter, searchKeyword]);

  // Active Running Jobs
  const runningJobs = useMemo(() => {
    return employerJobs.filter(j => 
      j.status === 'OPEN' || j.status === 'RECRUITING' || j.status === 'PUBLISHED'
    );
  }, [employerJobs]);

  // Date formatting helper
  const formatDate = (isoString) => {
    if (!isoString) return '--/--/----';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  // Status Badge Renderer
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            background: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            border: '1px solid var(--color-warning-border)'
          }}>
            <Clock size={12} /> Chờ duyệt
          </span>
        );
      case 'ACCEPTED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            background: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success-border)'
          }}>
            <CheckCircle2 size={12} /> Đã chấp thuận
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            border: '1px solid var(--color-danger-border)'
          }}>
            <XCircle size={12} /> Từ chối
          </span>
        );
      case 'COMPLETED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            background: '#F5F3FF',
            color: '#6D28D9',
            border: '1px solid #DDD6FE'
          }}>
            <ShieldCheck size={12} /> Hoàn thành
          </span>
        );
      default:
        return (
          <span style={{
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: '#F1F5F9',
            color: '#64748B'
          }}>
            {status || 'Mới'}
          </span>
        );
    }
  };

  // =========================================================================
  // 5. ROLE GUARD ACCESS DENIED VIEW
  // =========================================================================
  if (!isEmployer) {
    return (
      <div style={{
        maxWidth: 720,
        margin: '60px auto',
        padding: '40px 32px',
        background: '#ffffff',
        borderRadius: 20,
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          border: '1.5px solid var(--color-danger-border)'
        }}>
          <AlertTriangle size={36} />
        </div>

        <span style={{
          display: 'inline-block',
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          fontSize: 12,
          fontWeight: 800,
          padding: '4px 12px',
          borderRadius: 16,
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          marginBottom: 12
        }}>
          403 — Quyền truy cập bị từ chối
        </span>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 12px 0' }}>
          Khu vực dành riêng cho Nhà tuyển dụng
        </h2>

        <p style={{ fontSize: 14.5, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 28, maxWidth: 540, margin: '0 auto 28px' }}>
          {currentUser?.token ? (
            <>
              Bạn đang đăng nhập với tài khoản <strong>{currentUser.role === 'STUDENT' ? 'Sinh viên' : currentUser.role}</strong>. 
              Trang Bảng điều khiển này chỉ dành riêng cho tài khoản Nhà tuyển dụng.
            </>
          ) : (
            <>
              Bạn chưa đăng nhập vào hệ thống. Vui lòng đăng nhập với tài khoản <strong>Nhà tuyển dụng</strong> để truy cập bảng điều khiển và quản lý ứng viên.
            </>
          )}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={onNavigateHome}
            style={{ padding: '10px 22px', fontSize: 14 }}
          >
            Quay lại Trang chủ
          </Button>
          <Button
            variant="primary"
            onClick={onNavigateLogin}
            style={{ padding: '10px 22px', fontSize: 14 }}
          >
            Đăng nhập Nhà tuyển dụng
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. MAIN RENDER — EMPLOYER DASHBOARD
  // =========================================================================
  const dashboardContent = (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* ================= 1. 4 KPI STATS CARDS (1 HÀNG TRÊN DESKTOP) ================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20
      }}>
            {/* KPI 1: Job đã đăng */}
            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  Job đã đăng
                </span>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--color-lavender-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Briefcase size={18} />
                </div>
              </div>

              {loading ? (
                <div style={{ height: 38, width: 70, background: '#F1F5F9', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2, marginBottom: 6 }}>
                  {kpiStats.totalJobs}
                </div>
              )}

              <div style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
                {kpiStats.activeJobs} tin đang tuyển dụng (RECRUITING)
              </div>
            </div>

            {/* KPI 2: Application chờ xử lý */}
            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  Application chờ xử lý
                </span>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--color-warning-bg)',
                  color: 'var(--color-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={18} />
                </div>
              </div>

              {loading ? (
                <div style={{ height: 38, width: 70, background: '#F1F5F9', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2, marginBottom: 6 }}>
                  {kpiStats.pendingApplications}
                </div>
              )}

              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Tổng số {kpiStats.totalApplications} hồ sơ đã tiếp nhận
              </div>
            </div>

            {/* KPI 3: Proposal chờ xử lý */}
            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  Proposal chờ xử lý
                </span>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={18} />
                </div>
              </div>

              {loading ? (
                <div style={{ height: 38, width: 70, background: '#F1F5F9', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2, marginBottom: 6 }}>
                  {kpiStats.pendingProposals}
                </div>
              )}

              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Tổng số {kpiStats.totalProposals} báo giá Freelance
              </div>
            </div>

            {/* KPI 4: Assignment đang thực hiện */}
            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  Assignment đang thực hiện
                </span>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={18} />
                </div>
              </div>

              {loading ? (
                <div style={{ height: 38, width: 70, background: '#F1F5F9', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
              ) : (
                <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2, marginBottom: 6 }}>
                  {kpiStats.inProgressAssignments}
                </div>
              )}

              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                {kpiStats.completedAssignments} công việc đã hoàn thành
              </div>
            </div>
          </div>

          {/* ================= 2. SECTION: ỨNG VIÊN & ĐỀ XUẤT MỚI (WF-E01 MAIN TABLE) ================= */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid var(--color-border)',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14,
              marginBottom: 18
            }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                  Application / Proposal mới
                </h2>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Danh sách sinh viên vừa nộp hồ sơ hoặc gửi báo giá dự án gần đây
                </p>
              </div>

              {/* Candidate Filter Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'PENDING', label: 'Chờ duyệt' },
                  { id: 'ACCEPTED', label: 'Đã duyệt' },
                  { id: 'APPLICATION', label: 'Part-time' },
                  { id: 'PROPOSAL', label: 'Freelance' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCandidateFilter(tab.id)}
                    style={{
                      background: candidateFilter === tab.id ? 'var(--color-primary)' : '#F8F7FB',
                      color: candidateFilter === tab.id ? '#ffffff' : 'var(--color-text-secondary)',
                      border: '1px solid',
                      borderColor: candidateFilter === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
                      borderRadius: 20,
                      padding: '5px 14px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidates Table */}
            {loading ? (
              // Skeleton loading for table
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} style={{
                    height: 56,
                    background: '#F8F7FB',
                    borderRadius: 8,
                    animation: 'pulse 1.5s infinite'
                  }} />
                ))}
              </div>
            ) : filteredCandidates.length === 0 ? (
              <EmptyState
                title="Chưa có ứng viên nào trong danh mục này"
                description={
                  employerJobs.length === 0 
                    ? "Bạn chưa có tin tuyển dụng nào đang chạy. Hãy đăng tin đầu tiên để tiếp cận hàng ngàn sinh viên Văn Lang!"
                    : "Hiện tại chưa có hồ sơ ứng tuyển mới phù hợp với bộ lọc đã chọn."
                }
                actionLabel={employerJobs.length === 0 ? "+ Đăng tin tuyển dụng mới" : undefined}
                onAction={employerJobs.length === 0 ? onOpenCreateJob : undefined}
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{
                      borderBottom: '2px solid #F1F5F9',
                      color: 'var(--color-text-secondary)',
                      fontSize: 12.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>Sinh viên</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>Loại</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>Vị trí ứng tuyển</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>Thời gian</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>Trạng thái</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.slice(0, 6).map((item, index) => (
                      <tr 
                        key={item.id || index}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FBFBFE'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Student Name & Avatar */}
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              background: index % 2 === 0 ? 'var(--color-lavender-light)' : '#E0F2FE',
                              color: index % 2 === 0 ? 'var(--color-primary)' : '#0284C7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 14,
                              fontWeight: 800,
                              flexShrink: 0
                            }}>
                              {item.student_name ? item.student_name.charAt(0) : 'S'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                                {item.student_name || 'Nguyễn Văn Chí'}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                {item.university || 'Đại học Văn Lang'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Loại: Application vs Proposal */}
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: 11.5,
                            fontWeight: 700,
                            background: item.type === 'PROPOSAL' ? '#EEF2FF' : 'var(--color-accent-bg)',
                            color: item.type === 'PROPOSAL' ? '#4F46E5' : 'var(--color-primary)',
                            border: `1px solid ${item.type === 'PROPOSAL' ? '#C7D2FE' : 'var(--color-secondary)'}`
                          }}>
                            {item.type === 'PROPOSAL' ? 'Proposal (Freelance)' : 'Application (Part-time)'}
                          </span>
                        </td>

                        {/* Vị trí ứng tuyển */}
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                            {item.job_title || 'Nhân viên kế toán part-time'}
                          </div>
                        </td>

                        {/* Thời gian */}
                        <td style={{ padding: '14px', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                          {formatDate(item.applied_at)}
                        </td>

                        {/* Trạng thái */}
                        <td style={{ padding: '14px' }}>
                          {renderStatusBadge(item.status)}
                        </td>

                        {/* Thao tác */}
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              if (item.type === 'PROPOSAL') {
                                if (onNavigateTab) onNavigateTab('employer_proposals');
                              } else {
                                if (onNavigateTab) onNavigateTab('applicants');
                              }
                            }}
                            style={{
                              background: '#ffffff',
                              border: '1px solid var(--color-border)',
                              borderRadius: 8,
                              padding: '6px 12px',
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--color-primary-light)';
                              e.currentTarget.style.borderColor = 'var(--color-primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#ffffff';
                              e.currentTarget.style.borderColor = 'var(--color-border)';
                            }}
                          >
                            Chi tiết <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom View All Link */}
            {filteredCandidates.length > 6 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('applicants')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  Xem toàn bộ {allApplicants.length} hồ sơ ứng viên <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* ================= 3. SECTION: TIN TUYỂN DỤNG ĐANG CHẠY ================= */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid var(--color-border)',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14,
              marginBottom: 18
            }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                  Tin tuyển dụng đang chạy
                </h2>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Các tin đăng tuyển còn thời hạn và đang tiếp nhận hồ sơ từ sinh viên
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={() => onNavigateTab && onNavigateTab('employer_jobs')}
                style={{ padding: '6px 14px', fontSize: 13, gap: 6 }}
              >
                Quản lý tất cả tin ({employerJobs.length}) <ChevronRight size={14} />
              </Button>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {[1, 2].map(idx => (
                  <div key={idx} style={{ height: 140, background: '#F8F7FB', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : runningJobs.length === 0 ? (
              <EmptyState
                title="Chưa có tin tuyển dụng nào đang chạy"
                description="Bạn chưa kích hoạt tin tuyển dụng nào hoặc các tin trước đó đã hết hạn."
                actionLabel="+ Đăng tin tuyển dụng mới ngay"
                onAction={onOpenCreateJob || (() => onNavigateTab && onNavigateTab('create_job'))}
              />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 16
              }}>
                {runningJobs.slice(0, 4).map((job) => {
                  const applicantCount = job.applicant_count ?? job.total_applicants ?? (job.applications_count || 0);
                  return (
                    <div
                      key={job.id}
                      style={{
                        background: '#FAFAFD',
                        borderRadius: 14,
                        border: '1px solid var(--color-border)',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 14,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.background = '#FAFAFD';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div>
                        {/* Type pill + Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: job.type === 'FREELANCE' ? '#EEF2FF' : 'var(--color-primary-light)',
                            color: job.type === 'FREELANCE' ? '#4F46E5' : 'var(--color-primary)'
                          }}>
                            {job.type || 'PART_TIME'}
                          </span>

                          <span style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: 'var(--color-success)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)' }} />
                            Đang tuyển
                          </span>
                        </div>

                        {/* Title */}
                        <h4 style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: 'var(--color-text)',
                          margin: '0 0 6px 0',
                          lineHeight: 1.3
                        }}>
                          {job.title}
                        </h4>

                        {/* Salary / Wage */}
                        <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 700, marginBottom: 8 }}>
                          {job.salary || job.budget || 'Thỏa thuận theo năng lực'}
                        </div>
                      </div>

                      {/* Meta info & Action */}
                      <div style={{
                        paddingTop: 12,
                        borderTop: '1px solid #ECEAEF',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12.5,
                        color: 'var(--color-text-secondary)'
                      }}>
                        <div>
                          <strong style={{ color: 'var(--color-text)' }}>{applicantCount}</strong> hồ sơ
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={13} /> Hạn: {formatDate(job.deadline)}
                        </div>

                        <button
                          onClick={() => {
                            if (onSelectJobForApplicants) onSelectJobForApplicants(job);
                            if (onNavigateTab) onNavigateTab('applicants');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          Xem <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>



    </div>
  );

  return dashboardContent;
}
