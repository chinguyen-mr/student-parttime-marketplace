import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Briefcase, FileText, Bookmark, Clock, CheckCircle2, 
  XCircle, AlertCircle, ArrowRight, Save, Trash2, ExternalLink,
  Building2, MapPin, DollarSign, Calendar, UploadCloud, Plus, X,
  GraduationCap, Award, RefreshCw, Send, Check, Bell, Star,
  ShieldCheck, CheckCheck, Upload, Download, Eye, AlertTriangle, Sparkles,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../components/ui';
import JobCard from '../../components/common/JobCard';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import CompanyLogo from '../../components/CompanyLogo';
import { API_BASE, formatApiError } from '../../config/api';
import MyAssignmentsPage from './MyAssignmentsPage';
import NotificationsPage from './NotificationsPage';
import AccountSettingsPage from './AccountSettingsPage';
import AvailabilityEditor, { normalizeSlots } from '../../components/student/AvailabilityEditor';
import AvatarUploader from '../../components/common/AvatarUploader';
import StudentProfileForm from '../../components/student/StudentProfileForm';
import MyExperienceReviews from '../../components/reviews/MyExperienceReviews';

// Nhãn tiếng Việt cho trạng thái đơn ứng tuyển
const APPLICATION_STATUS_LABEL = {
  PENDING: 'Chờ duyệt',
  REVIEWING: 'Đang xem xét',
  SHORTLISTED: 'Vào vòng trong',
  ACCEPTED: 'Đã nhận',
  REJECTED: 'Bị từ chối',
  WITHDRAWN: 'Đã rút',
  COMPLETED: 'Hoàn thành'
};

export default function StudentDashboardPage({
  currentUser,
  jobs = [],
  initialTab = 'dashboard',
  navNonce = 0,
  onUserUpdate,
  onOpenNotification,
  onSelectJob,
  onSelectApplication,
  onApply,
  onNavigateJobs,
  onNavigateComingSoon,
  showToast
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'dashboard' | 'availability' | 'profile' | 'cv' | 'saved_jobs' | 'applications' | 'assignments' | 'reviews' | 'notifications'
  
  // Dashboard overall loading & error states (WF-S01 Error / Loading / Retry)
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Availability & Matching Engine State (P0-03, P0-05)
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [savedAvailability, setSavedAvailability] = useState([]); // bản đã lưu trên server, để biết có thay đổi chưa lưu
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [matchingStatus, setMatchingStatus] = useState(null);

  // Applications State
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appFilter, setAppFilter] = useState('ALL');

  // Thông tin hiển thị ở sidebar (form đầy đủ nằm trong StudentProfileForm)
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || null);
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [defaultCvUrl, setDefaultCvUrl] = useState('');

  // Saved Jobs State from LocalStorage
  const [savedJobIds, setSavedJobIds] = useState([]);

  // Assignments / Stats for Dashboard
  const [assignments, setAssignments] = useState([]);

  // Notifications State for Dashboard Metric & Tab
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(3);

  // Reviews State for WF-S10 (Assignment đã hoàn thành chưa đánh giá)
  const [selectedReviewAssignment, setSelectedReviewAssignment] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('Nhà tuyển dụng rất nhiệt tình hỗ trợ, thanh toán thù lao đúng hạn và môi trường làm việc thân thiện.');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewConflictError, setReviewConflictError] = useState(null);
  const [reviewedAssignmentIds, setReviewedAssignmentIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobnest_student_reviewed_assignments') || '[]');
    } catch {
      return [];
    }
  });
  const [submittedReviewsList, setSubmittedReviewsList] = useState([]);

  // =========================================================================
  // 1. FETCH PROFILE DATA FROM API (GET /api/profile/me)
  // =========================================================================
  const fetchProfile = async () => {
    if (!currentUser?.token) return;
    try {
      setProfileLoading(true);
      const res = await fetch(`${API_BASE}/profile/me`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const p = data.data;
        if (p.full_name) setFullName(p.full_name);
        setAvatarUrl(p.avatar_url || null);
        if (p.school || p.university) setUniversity(p.school || p.university);
        if (p.major) setMajor(p.major);
        if (p.default_cv_url) setDefaultCvUrl(p.default_cv_url);
      }
    } catch (err) {
      console.warn('Could not fetch student profile from API:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // =========================================================================
  // 2. FETCH STUDENT APPLICATIONS (GET /api/applications/my-applications)
  // =========================================================================
  const fetchApplications = async () => {
    if (!currentUser?.token) return;
    try {
      setAppsLoading(true);
      const res = await fetch(`${API_BASE}/applications/my-applications`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setApplications(data.data);
      }
    } catch (err) {
      console.warn('Could not fetch applications from API:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  // =========================================================================
  // 3. FETCH ASSIGNMENTS FOR STATS (GET /api/assignments/my-assignments)
  // =========================================================================
  const fetchAssignments = async () => {
    if (!currentUser?.token) return;
    try {
      const res = await fetch(`${API_BASE}/assignments/my-assignments`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAssignments(data.data);
      }
    } catch (err) {
      console.warn('Could not fetch assignments:', err);
    }
  };

  // =========================================================================
  // 4. FETCH NOTIFICATIONS (GET /api/notifications)
  // =========================================================================
  const fetchNotifications = async () => {
    if (!currentUser?.token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
        if (typeof data.unread_count === 'number') {
          setUnreadNotifsCount(data.unread_count);
        } else {
          setUnreadNotifsCount(data.data.filter(n => !n.read_at).length);
        }
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  };

  // =========================================================================
  // 5. FETCH STUDENT AVAILABILITY (GET /api/profile/availability)
  // =========================================================================
  const fetchAvailability = async () => {
    if (!currentUser?.token) return;
    try {
      setAvailabilityLoading(true);
      const res = await fetch(`${API_BASE}/profile/availability`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const slots = normalizeSlots(data.data);
        setAvailabilitySlots(slots);
        setSavedAvailability(slots);
      }
    } catch (err) {
      console.warn('Could not fetch student availability:', err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // =========================================================================
  // 6. FETCH RECOMMENDED JOBS (GET /api/jobs/recommended)
  // =========================================================================
  // Xem trước gợi ý theo lịch đang chọn (chưa lưu). null = đang dùng lịch đã lưu
  const [previewJobs, setPreviewJobs] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const availabilityDirty = useMemo(() => {
    const key = (list) => list.map(s => `${s.day_of_week}-${String(s.start_time).slice(0, 5)}`).sort().join('|');
    return key(availabilitySlots) !== key(savedAvailability);
  }, [availabilitySlots, savedAvailability]);

  useEffect(() => {
    if (!currentUser?.token || !availabilityDirty) {
      setPreviewJobs(null);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch(`${API_BASE}/jobs/recommended/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
          body: JSON.stringify({ slots: availabilitySlots })
        });
        const data = await res.json();
        if (!cancelled && data.success) setPreviewJobs(Array.isArray(data.data?.jobs) ? data.data.jobs : []);
      } catch (err) {
        console.warn('Could not preview recommended jobs:', err);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [availabilitySlots, availabilityDirty, currentUser?.token]);

  const fetchRecommendedJobs = async () => {
    if (!currentUser?.token) return;
    try {
      setRecommendedLoading(true);
      const res = await fetch(`${API_BASE}/jobs/recommended`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRecommendedJobs(Array.isArray(data.data.jobs) ? data.data.jobs : []);
        setMatchingStatus(data.data.status || 'MATCH_FOUND');
      }
    } catch (err) {
      console.warn('Could not fetch recommended jobs:', err);
    } finally {
      setRecommendedLoading(false);
    }
  };

  // =========================================================================
  // 7. SAVE AVAILABILITY HANDLER (PUT /api/profile/availability)
  // =========================================================================
  const handleSaveAvailability = async (slotsToSave) => {
    if (!currentUser?.token) {
      if (showToast) showToast('Vui lòng đăng nhập để lưu lịch rảnh', 'error');
      return;
    }
    try {
      setIsSavingAvailability(true);
      const res = await fetch(`${API_BASE}/profile/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ slots: slotsToSave })
      });
      const data = await res.json();
      if (data.success) {
        const slots = normalizeSlots(data.data || []);
        setAvailabilitySlots(slots);
        setSavedAvailability(slots);
        if (showToast) showToast('Đã lưu lịch rảnh thành công! Đang tính toán gợi ý việc làm...', 'success');
        await fetchRecommendedJobs();
      } else {
        if (showToast) showToast(data.message || 'Lỗi khi lưu lịch rảnh', 'error');
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err), 'error');
    } finally {
      setIsSavingAvailability(false);
    }
  };

  // Load Saved Jobs from LocalStorage
  const loadSavedJobs = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('jobnest_saved_jobs') || '[]');
      if (Array.isArray(saved)) {
        setSavedJobIds(saved);
      }
    } catch (e) {
      console.warn('Failed to load saved jobs from LocalStorage:', e);
    }
  };

  // Overall loader for Dashboard (WF-S01 UI state)
  const loadAllDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      await Promise.allSettled([
        fetchProfile(),
        fetchApplications(),
        fetchAssignments(),
        fetchNotifications(),
        fetchAvailability(),
        fetchRecommendedJobs()
      ]);
    } catch (err) {
      setDashboardError('Không thể tải một số dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setDashboardLoading(false);
    }
    loadSavedJobs();
  };

  useEffect(() => {
    loadAllDashboardData();
  }, [currentUser]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, navNonce]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    if (appFilter === 'ALL') return applications;
    return applications.filter(a => a.status === appFilter);
  }, [applications, appFilter]);

  // Saved Jobs List
  const savedJobsList = useMemo(() => {
    return (jobs || []).filter(j => savedJobIds.includes(j.id));
  }, [jobs, savedJobIds]);

  // Dashboard Metrics
  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const acceptedCount = applications.filter(a => a.status === 'ACCEPTED').length;

  // Completed assignments for WF-S10
  const completedAssignments = useMemo(() => {
    return assignments.filter(a => a.status === 'COMPLETED');
  }, [assignments]);

  useEffect(() => {
    if (completedAssignments.length > 0 && !selectedReviewAssignment) {
      setSelectedReviewAssignment(completedAssignments[0]);
    }
  }, [completedAssignments]);

  // Submit Review Handler (WF-S10)
  const handleSubmitReview = async (e) => {
    e?.preventDefault();
    if (!selectedReviewAssignment) {
      if (showToast) showToast('Vui lòng chọn công việc đã hoàn thành để gửi đánh giá', 'error');
      return;
    }
    if (!reviewComment.trim()) {
      if (showToast) showToast('Vui lòng nhập nội dung nhận xét', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewConflictError(null);
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          job_id: selectedReviewAssignment.job_id,
          reviewee_id: selectedReviewAssignment.employer_id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (res.status === 409 || data.message?.includes('đã gửi đánh giá')) {
        setReviewConflictError('Bạn đã gửi đánh giá cho đối tác này trong công việc này rồi!');
        if (showToast) showToast('Công việc này bạn đã gửi đánh giá rồi', 'error');
        const updated = [...new Set([...reviewedAssignmentIds, selectedReviewAssignment.id])];
        setReviewedAssignmentIds(updated);
        localStorage.setItem('jobnest_student_reviewed_assignments', JSON.stringify(updated));
        return;
      }

      if (data.success) {
        if (showToast) showToast('Gửi đánh giá thành công! Cảm ơn phản hồi của bạn.', 'success');
        const updated = [...new Set([...reviewedAssignmentIds, selectedReviewAssignment.id])];
        setReviewedAssignmentIds(updated);
        localStorage.setItem('jobnest_student_reviewed_assignments', JSON.stringify(updated));
        setSubmittedReviewsList(prev => [
          {
            id: Date.now(),
            job_title: selectedReviewAssignment.job_title,
            employer_name: selectedReviewAssignment.employer_name,
            rating: reviewRating,
            comment: reviewComment.trim(),
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
        setReviewComment('');
      } else {
        throw new Error(data.message || 'Lỗi gửi đánh giá');
      }
    } catch (err) {
      const msg = err.message || 'Lỗi kết nối';
      if (msg.includes('409') || msg.includes('đã gửi đánh giá')) {
        setReviewConflictError('Bạn đã gửi đánh giá cho đối tác này trong công việc này rồi!');
      }
      if (showToast) showToast(formatApiError(err, 'Lỗi gửi đánh giá'), 'error');
    } finally {
      setSubmittingReview(false);
    }
  };


  return (
    <div className="student-dashboard-container">
      {/* =========================================================================
          MAIN 2-COLUMN LAYOUT: SIDEBAR (LEFT) + TAB CONTENT (RIGHT)
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px minmax(0, 1fr)', alignItems: 'flex-start' }} className="student-layout-grid">
        
        {/* =====================================================================
            LEFT SIDEBAR (AVATAR + MENU ĐIỀU HƯỚNG THEO CHUẨN WF-S01)
            ===================================================================== */}
        <aside className="student-sidebar" style={{
          background: '#ffffff',
          borderRight: '1px solid var(--color-border)',
          padding: '24px 20px',
          boxSizing: 'border-box',
          // Thanh điều hướng dính sát mép trái, cao bằng phần màn hình dưới header, tự cuộn nếu dài
          position: 'sticky',
          top: 'var(--app-header-h, 84px)',
          height: 'calc(100vh - var(--app-header-h, 84px))',
          overflowY: 'auto'
        }}>
          {/* Avatar & Student Info Card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 20, borderBottom: '1px solid #F1F5F9', marginBottom: 18 }}>
            <div style={{ marginBottom: 10 }}>
              {/* Chỉ hiển thị; đổi/chỉnh ảnh trong trang Hồ sơ */}
              <AvatarUploader
                readOnly
                avatarUrl={avatarUrl}
                fallbackText={fullName?.charAt(0) || 'S'}
                size={84}
                title="Xem hồ sơ xin việc"
                onClick={() => setActiveTab('profile')}
              />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
              {fullName}
            </h3>

            {(major || university) ? (
              <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                {major && <div style={{ fontWeight: 600, color: '#594675' }}>{major}</div>}
                {university && <div>{university}</div>}
              </div>
            ) : (
              <button type="button" onClick={() => setActiveTab('profile')}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                + Cập nhật trường & chuyên ngành
              </button>
            )}
          </div>

          {/* Sidebar Menu Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { id: 'dashboard', label: 'Tổng quan', icon: Briefcase, count: null },
              { id: 'availability', label: 'Lịch rảnh & Gợi ý AI', icon: Calendar, count: null },
              { id: 'profile', label: 'Hồ sơ xin việc', icon: User, count: null },
              { id: 'cv', label: 'Quản lý CV', icon: GraduationCap, count: null },
              { id: 'saved_jobs', label: 'Việc làm đã lưu', icon: Bookmark, count: savedJobIds.length },
              { id: 'applications', label: 'Lịch sử ứng tuyển', icon: Clock, count: applications.length },
              { id: 'reviews', label: 'Đánh giá & Phản hồi', icon: Star, count: null },
              { id: 'notifications', label: 'Thông báo', icon: Bell, count: unreadNotifsCount },
              { id: 'settings', label: 'Cài đặt tài khoản', icon: Settings, count: null },
            ].map((menuItem) => {
              const Icon = menuItem.icon;
              const isActive = activeTab === menuItem.id;

              return (
                <button
                  key={menuItem.id}
                  onClick={() => setActiveTab(menuItem.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--color-text)',
                    fontSize: 13.5,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--color-primary-light)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={16} color={isActive ? '#ffffff' : '#7565A8'} />
                    <span>{menuItem.label.split('(')[0]}</span>
                  </div>

                  {menuItem.count !== null && menuItem.count > 0 && (
                    <span style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#F1EEF8',
                      color: isActive ? '#ffffff' : '#7565A8',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 10
                    }}>
                      {menuItem.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* =====================================================================
            RIGHT MAIN CONTENT: DỰA THEO ACTIVE TAB
            ===================================================================== */}
        <main style={{ minWidth: 0, padding: '28px 32px 60px', maxWidth: 1320, boxSizing: 'border-box' }}>
          
          {/* ===================================================================
              TAB 1: TỔNG QUAN (DASHBOARD - WF-S01)
              =================================================================== */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Error Alert State with Retry Button (WF-S01 Error UI State) */}
              {dashboardError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1.5px solid #FECACA',
                  borderRadius: 12,
                  padding: '14px 18px',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#991B1B', fontSize: 13.5 }}>
                    <AlertTriangle size={18} color="#DC2626" />
                    <span>{dashboardError}</span>
                  </div>
                  <button
                    onClick={loadAllDashboardData}
                    style={{
                      background: '#DC2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 14px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <RefreshCw size={13} /> Thử lại
                  </button>
                </div>
              )}

              {/* Loading Skeleton State (WF-S01 Loading UI State) */}
              {dashboardLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--color-primary)' }} />
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Đang tải dữ liệu tổng quan sinh viên...</div>
                </div>
              ) : (
                <>
                  {/* 4 Metric Stat Cards matching WF-S01 exactly */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {/* 1. Đơn đang chờ duyệt */}
                    <div 
                      onClick={() => setActiveTab('applications')}
                      style={{
                        background: '#ffffff',
                        borderRadius: 14,
                        border: '1px solid var(--color-border)',
                        padding: '20px 18px',
                        boxShadow: '0 2px 8px rgba(41, 38, 58, 0.03)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(217, 119, 6, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(41, 38, 58, 0.03)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>Đơn đang chờ duyệt</span>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock size={18} color="#D97706" />
                        </div>
                      </div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)' }}>
                        {pendingCount}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Đang chờ nhà tuyển dụng phản hồi
                      </div>
                    </div>

                    {/* 2. Đơn đã được nhận */}
                    <div 
                      onClick={() => setActiveTab('applications')}
                      style={{
                        background: '#ffffff',
                        borderRadius: 14,
                        border: '1px solid var(--color-border)',
                        padding: '20px 18px',
                        boxShadow: '0 2px 8px rgba(41, 38, 58, 0.03)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(4, 120, 87, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(41, 38, 58, 0.03)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#047857' }}>Đã được nhận</span>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={18} color="#047857" />
                        </div>
                      </div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)' }}>
                        {acceptedCount}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Đơn được nhà tuyển dụng chấp nhận
                      </div>
                    </div>

                    {/* 3. Việc làm đã lưu */}
                    <div 
                      onClick={() => setActiveTab('saved_jobs')}
                      style={{
                        background: '#ffffff',
                        borderRadius: 14,
                        border: '1px solid var(--color-border)',
                        padding: '20px 18px',
                        boxShadow: '0 2px 8px rgba(41, 38, 58, 0.03)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(41, 38, 58, 0.03)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>Việc làm đã lưu</span>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Bookmark size={18} color="#2563EB" />
                        </div>
                      </div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)' }}>
                        {savedJobIds.length}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Việc làm bạn đang quan tâm
                      </div>
                    </div>

                    {/* 4. Thông báo chưa đọc (WF-S01: Thông báo chưa đọc [ N ]) */}
                    <div 
                      onClick={() => setActiveTab('notifications')}
                      style={{
                        background: '#ffffff',
                        borderRadius: 14,
                        border: '1px solid var(--color-border)',
                        padding: '20px 18px',
                        boxShadow: '0 2px 8px rgba(41, 38, 58, 0.03)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(117, 101, 168, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(41, 38, 58, 0.03)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#7565A8' }}>Thông báo chưa đọc</span>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F3EFF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Bell size={18} color="#7565A8" />
                        </div>
                      </div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)' }}>
                        {unreadNotifsCount}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Cập nhật kết quả & Tin nhắn mới
                      </div>
                    </div>
                  </div>

                  {/* Đơn ứng tuyển gần đây */}
                  <div>
                    {/* 2. Application gần đây (WF-S01: [ Job | Trạng thái ]) */}
                    <div style={{
                      background: '#ffffff',
                      borderRadius: 14,
                      border: '1px solid var(--color-border)',
                      padding: '22px 24px',
                      boxShadow: '0 2px 8px rgba(41, 38, 58, 0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                            Đơn ứng tuyển gần đây
                          </h3>
                          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            Đơn ứng tuyển gửi đi gần nhất
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab('applications')}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Xem tất cả →
                        </button>
                      </div>

                      {/* Header row: Job | Trạng thái */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                        <span>VỊ TRÍ</span>
                        <span>TRẠNG THÁI</span>
                      </div>

                      {applications.length === 0 ? (
                        <EmptyState
                          title="Chưa có đơn ứng tuyển nào"
                          description="Bạn chưa nộp đơn ứng tuyển nào. Hãy tìm việc làm phù hợp và nộp hồ sơ ngay nhé!"
                          actionText="Tìm việc làm ngay"
                          onAction={onNavigateJobs}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {applications.slice(0, 4).map((app) => {
                            const isAccepted = app.status === 'ACCEPTED';
                            const isRejected = app.status === 'REJECTED';
                            const isShortlisted = app.status === 'SHORTLISTED';
                            const isReviewing = app.status === 'REVIEWING';

                            return (
                              <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: '#F8F7FB', border: '1px solid #EAE7F0' }}>
                                <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {app.job_title}
                                  </div>
                                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                    {app.employer_name} • {new Date(app.applied_at || app.created_at || Date.now()).toLocaleDateString('vi-VN')}
                                  </div>
                                </div>

                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  background: isAccepted ? '#ECFDF5' : isRejected ? '#FEE2E2' : isShortlisted ? '#EFF6FF' : isReviewing ? '#F5F3FF' : '#FEF3C7',
                                  color: isAccepted ? '#047857' : isRejected ? '#DC2626' : isShortlisted ? '#1D4ED8' : isReviewing ? '#6D28D9' : '#D97706',
                                  border: `1px solid ${isAccepted ? '#A7F3D0' : isRejected ? '#FECACA' : isShortlisted ? '#BFDBFE' : isReviewing ? '#DDD6FE' : '#FDE68A'}`
                                }}>
                                  {APPLICATION_STATUS_LABEL[app.status] || 'Chờ duyệt'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* P0-03 & P0-05: VIỆC LÀM GỢI Ý CÁ NHÂN HÓA (AI MATCHING ENGINE) */}
                  <div style={{
                    background: '#ffffff',
                    borderRadius: 14,
                    border: '1px solid var(--color-border)',
                    padding: '24px 26px',
                    boxShadow: '0 2px 8px rgba(41, 38, 58, 0.03)',
                    marginTop: 20
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            background: 'var(--color-primary-light, #ede9fe)',
                            color: 'var(--color-primary, #7565A8)',
                            padding: '4px 8px',
                            borderRadius: 8,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 800
                          }}>
                            <Sparkles size={14} /> AI MATCHING
                          </span>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                            Việc làm tương thích với lịch rảnh của bạn
                          </h3>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                          Những việc không trùng giờ học, phù hợp với chuyên ngành và khu vực của bạn
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          onClick={() => setActiveTab('availability')}
                          style={{
                            background: '#F8F7FB',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-primary)',
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <Calendar size={14} /> Chỉnh sửa lịch rảnh
                        </button>
                      </div>
                    </div>

                    {/* Banner nhắc nhở nếu chưa cài đặt lịch rảnh */}
                    {matchingStatus === 'NO_AVAILABILITY' && (
                      <div style={{
                        background: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        borderRadius: 10,
                        padding: '14px 18px',
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 22 }}>💡</span>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#92400E' }}>
                              Bạn chưa cấu hình thời gian rảnh trong tuần!
                            </div>
                            <div style={{ fontSize: 12, color: '#B45309' }}>
                              Hãy cập nhật các buổi bạn có thể làm việc để nhận danh sách việc làm được AI tối ưu hóa độ khớp 100%.
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('availability')}
                          style={{
                            background: '#D97706',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 14px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Khai báo lịch rảnh ngay →
                        </button>
                      </div>
                    )}

                    {recommendedLoading ? (
                      <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13.5 }}>
                        <RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                        Đang phân tích độ tương thích thời gian và chấm điểm gợi ý...
                      </div>
                    ) : recommendedJobs.length === 0 ? (
                      <EmptyState
                        title="Chưa tìm thấy công việc tương thích"
                        description="Hiện chưa có công việc nào khớp với thời gian rảnh hiện tại của bạn. Thử mở rộng thêm các buổi rảnh trong tuần nhé!"
                        actionText="Chỉnh sửa lịch rảnh"
                        onAction={() => setActiveTab('availability')}
                      />
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 16
                      }}>
                        {recommendedJobs.slice(0, 6).map((job) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            isSaved={savedJobIds.includes(job.id)}
                            onToggleSave={() => {
                              const next = savedJobIds.includes(job.id)
                                ? savedJobIds.filter(id => id !== job.id)
                                : [...savedJobIds, job.id];
                              setSavedJobIds(next);
                              localStorage.setItem('jobnest_saved_jobs', JSON.stringify(next));
                            }}
                            onSelectJob={onSelectJob}
                            onApply={onApply}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB: QUẢN LÝ LỊCH RẢNH & SO KHỚP AI (P0-02, P0-03, P0-05)
              =================================================================== */}
          {activeTab === 'availability' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <AvailabilityEditor
                slots={availabilitySlots}
                savedSlots={savedAvailability}
                onChange={setAvailabilitySlots}
                onSave={() => handleSaveAvailability(availabilitySlots)}
                saving={isSavingAvailability}
                loading={availabilityLoading}
              />

              {/* Kết quả gợi ý theo lịch rảnh đã lưu */}
              <div style={{
                background: '#ffffff',
                borderRadius: 16,
                border: '1px solid var(--color-border)',
                padding: '24px 28px',
                boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)'
              }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={18} color="#7565A8" />
                      {previewJobs
                        ? `Xem trước: việc phù hợp với lịch đang chọn (${previewJobs.length})`
                        : `Việc làm phù hợp với lịch rảnh của bạn (${recommendedJobs.length})`}
                    </h3>
                    <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                      {previewJobs
                        ? 'Lịch này chưa được lưu. Bấm "Lưu lịch rảnh" để áp dụng gợi ý trên toàn bộ JobNest.'
                        : 'Chỉ gồm việc không trùng lịch học, sắp xếp theo mức độ phù hợp với bạn'}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={fetchRecommendedJobs}
                    disabled={recommendedLoading}
                    style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <RefreshCw size={13} className={recommendedLoading ? 'animate-spin' : ''} />
                    Làm mới gợi ý
                  </Button>
                </div>

                {(recommendedLoading || previewLoading) ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13.5 }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    Đang tìm việc phù hợp với lịch của bạn...
                  </div>
                ) : (previewJobs ?? recommendedJobs).length === 0 ? (
                  <EmptyState
                    title="Chưa có việc làm tương thích với lịch này"
                    description="Hãy thử chọn thêm ca rảnh khác để mở rộng danh sách công việc phù hợp nhé."
                  />
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 16
                  }}>
                    {(previewJobs ?? recommendedJobs).map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobIds.includes(job.id)}
                        onToggleSave={() => {
                          const next = savedJobIds.includes(job.id)
                            ? savedJobIds.filter(id => id !== job.id)
                            : [...savedJobIds, job.id];
                          setSavedJobIds(next);
                          localStorage.setItem('jobnest_saved_jobs', JSON.stringify(next));
                        }}
                        onSelectJob={onSelectJob}
                        onApply={onApply}
                      />
                    ))}
                  </div>
                )}
              </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 2: HỒ SƠ CÁ NHÂN (PROFILE - WF-S02)
              Cho phép cập nhật: student_code, university, major, experience, bio, default_cv_url
              =================================================================== */}
          {activeTab === 'profile' && (
            <StudentProfileForm
              token={currentUser?.token}
              email={currentUser?.email}
              showToast={showToast}
              avatarUrl={avatarUrl}
              onAvatarChange={(url) => {
                setAvatarUrl(url);
                if (onUserUpdate) onUserUpdate({ avatar_url: url });
              }}
              onSaved={(p) => {
                setFullName(p.full_name || '');
                setMajor(p.major || '');
                setUniversity(p.school || '');
                if (onUserUpdate) onUserUpdate({ full_name: p.full_name });
              }}
            />
          )}

          {/* ===================================================================
              TAB 3: ĐƠN ỨNG TUYỂN (APPLICATIONS - WF-S05)
              Gọi API lấy danh sách, hiển thị bảng, nút hủy nếu PENDING, Empty State
              =================================================================== */}
          {activeTab === 'applications' && (
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid var(--color-border)',
              padding: '24px 28px',
              boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                    Lịch sử & Danh sách đơn ứng tuyển
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: 0 }}>
                    Theo dõi trạng thái xét duyệt hồ sơ từ các nhà tuyển dụng
                  </p>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'PENDING', label: 'Chờ duyệt' },
                    { id: 'ACCEPTED', label: 'Đã duyệt' },
                    { id: 'REJECTED', label: 'Bị từ chối' }
                  ].map((filterItem) => (
                    <button
                      key={filterItem.id}
                      onClick={() => setAppFilter(filterItem.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12.5,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: appFilter === filterItem.id ? 'var(--color-primary)' : '#F1EEF8',
                        color: appFilter === filterItem.id ? '#ffffff' : '#7565A8',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {filterItem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List / Table of Applications */}
              {appsLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                  Đang tải danh sách đơn ứng tuyển...
                </div>
              ) : filteredApplications.length === 0 ? (
                /* Empty State theo yêu cầu UI-018 */
                <EmptyState
                  title={appFilter === 'ALL' ? 'Bạn chưa có đơn ứng tuyển nào' : `Không có đơn ứng tuyển ở trạng thái ${appFilter === 'PENDING' ? 'Chờ duyệt' : appFilter === 'ACCEPTED' ? 'Đã duyệt' : 'Bị từ chối'}`}
                  description={appFilter === 'ALL' ? 'Hiện tại bạn chưa nộp hồ sơ vào công việc nào. Hãy tìm kiếm các cơ hội việc làm part-time hấp dẫn và ứng tuyển ngay nhé!' : 'Bạn có thể chuyển sang bộ lọc khác hoặc tìm kiếm cơ hội việc làm mới.'}
                  actionText="Khám phá việc làm ngay"
                  onAction={onNavigateJobs}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {filteredApplications.map((app) => {
                    const isPending = app.status === 'PENDING';
                    const isAccepted = app.status === 'ACCEPTED';
                    const isRejected = app.status === 'REJECTED';

                    return (
                      <div
                        key={app.id}
                        style={{
                          border: '1.5px solid var(--color-border)',
                          borderRadius: 12,
                          padding: '18px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 16,
                          background: '#ffffff',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        <div style={{ minWidth: 260, flex: '1 1 300px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <StatusBadge status={app.status} />
                            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                              Nộp lúc: {new Date(app.applied_at || app.created_at || Date.now()).toLocaleDateString('vi-VN')}
                            </span>
                          </div>

                          <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px 0' }}>
                            {app.job_title}
                          </h4>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                              🏢 {app.employer_name || 'Doanh nghiệp'}
                            </span>
                            <span>•</span>
                            <span>📍 {app.location || 'TP. Hồ Chí Minh'}</span>
                          </div>

                          {app.note && (
                            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, background: '#F8F7FB', padding: '6px 10px', borderRadius: 6, border: '1px solid #EAE7F0' }}>
                              💬 Ghi chú từ NTD: {app.note}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleCancelApplication(app.id)}
                              style={{
                                background: '#ffffff',
                                border: '1.5px solid #D95F68',
                                color: '#D95F68',
                                borderRadius: 8,
                                padding: '8px 14px',
                                fontSize: 12.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#FDF1F2'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                            >
                              Hủy ứng tuyển
                            </button>
                          )}

                          {onSelectApplication && (
                            <button
                              type="button"
                              onClick={() => onSelectApplication(app)}
                              style={{
                                background: '#ffffff',
                                border: '1.5px solid var(--color-border)',
                                color: 'var(--color-primary)',
                                borderRadius: 8,
                                padding: '8px 14px',
                                fontSize: 12.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Chi tiết đơn
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const found = jobs.find(j => j.id === app.job_id || j.title === app.job_title);
                              if (found && onSelectJob) {
                                onSelectJob(found);
                              } else {
                                onNavigateJobs();
                              }
                            }}
                            style={{
                              background: 'var(--color-primary)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '8px 16px',
                              fontSize: 12.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            Xem việc làm <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 4: VIỆC LÀM ĐÃ LƯU (SAVED JOBS - WF-S04)
              Đọc từ LocalStorage (jobnest_saved_jobs), hiển thị JobCard, Empty State
              =================================================================== */}
          {activeTab === 'saved_jobs' && (
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid var(--color-border)',
              padding: '24px 28px',
              boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                    Danh sách việc làm đã lưu
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: 0 }}>
                    Lưu trữ các cơ hội việc làm để nộp đơn ứng tuyển khi sẵn sàng ({savedJobsList.length} việc làm)
                  </p>
                </div>

                {savedJobsList.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có muốn xóa tất cả việc làm đã lưu?')) {
                        localStorage.removeItem('jobnest_saved_jobs');
                        setSavedJobIds([]);
                        if (showToast) showToast('Đã xóa danh sách việc làm đã lưu');
                      }
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {savedJobsList.length === 0 ? (
                <EmptyState
                  title="Chưa có việc làm nào được lưu"
                  description="Bạn chưa lưu tin tuyển dụng nào. Trong quá trình tìm kiếm việc làm, bấm vào nút 'Lưu việc làm' để xem lại tại đây nhé!"
                  actionText="Tìm kiếm việc làm ngay"
                  onAction={onNavigateJobs}
                />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {savedJobsList.map((j) => (
                    <JobCard
                      key={j.id}
                      job={j}
                      isSaved={true}
                      onToggleSave={() => {
                        const nextSaved = savedJobIds.filter(id => id !== j.id);
                        setSavedJobIds(nextSaved);
                        localStorage.setItem('jobnest_saved_jobs', JSON.stringify(nextSaved));
                        if (showToast) showToast('Đã bỏ lưu việc làm');
                      }}
                      onSelectJob={onSelectJob}
                      onApply={(jobItem) => {
                        if (onSelectJob) onSelectJob(jobItem);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 5: QUẢN LÝ CV (CV MANAGEMENT - WF-S03)
              =================================================================== */}
          {activeTab === 'cv' && (
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid var(--color-border)',
              padding: '24px 28px',
              boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                    Quản lý CV & Hồ sơ ứng tuyển
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: 0 }}>
                    Tải lên và thiết lập CV mặc định để nộp nhanh cho các công việc part-time & full-time
                  </p>
                </div>

                <label style={{
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Upload size={14} /> Tải lên CV mới (.PDF)
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setDefaultCvUrl(`https://jobnest.vn/uploads/cv/${file.name}`);
                        if (showToast) showToast(`Đã tải lên CV: ${file.name}`, 'success');
                      }
                    }}
                  />
                </label>
              </div>

              {/* Default Active CV Card */}
              <div style={{
                border: '1.5px solid #A997C5',
                background: 'linear-gradient(135deg, #FAF8FD 0%, #FFFFFF 100%)',
                borderRadius: 12,
                padding: '20px 22px',
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                    <FileText size={26} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)' }}>
                        CV Mặc định - {fullName} (2026)
                      </span>
                      <span style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        ĐANG SỬ DỤNG
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)' }}>
                      Định dạng: PDF • Cập nhật lúc: {new Date().toLocaleDateString('vi-VN')} • Chuyên ngành: {major}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {defaultCvUrl && (
                    <a
                      href={defaultCvUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-primary)',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Eye size={13} /> Xem trước
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (showToast) showToast('Đang tải file CV về máy...', 'info');
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Download size={13} /> Tải về
                  </button>
                </div>
              </div>

              {/* CV Tips & Guidance */}
              <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '16px 18px', border: '1px solid #E2E8F0', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                <strong>💡 Mẹo từ JobNest:</strong> Đảm bảo CV của bạn ghi rõ các kỹ năng chuyên môn, kinh nghiệm thực tế hoặc dự án đồ án ở trường để <strong>hồ sơ của bạn nổi bật hơn</strong> trong mắt các doanh nghiệp đối tác.
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 6: CÔNG VIỆC NHẬN LÀM (ASSIGNMENTS - WF-S08)
              =================================================================== */}
          {activeTab === 'assignments' && (
            <MyAssignmentsPage
              currentUser={currentUser}
              showToast={showToast}
              onOpenReview={(target) => {
                if (showToast) showToast(`Mở đánh giá cho công việc: ${target?.title || 'Nhiệm vụ'}`, 'info');
              }}
            />
          )}

          {/* ===================================================================
              TAB 7: ĐÁNH GIÁ & PHẢN HỒI (REVIEWS - WF-S10)
              =================================================================== */}
          {activeTab === 'reviews' && (
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid var(--color-border)',
              padding: '24px 28px',
              boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)'
            }}>
              {/* Header Title matching WF-S10 */}
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                    Đánh giá & Phản hồi Nhà tuyển dụng
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: 0 }}>
                    Đánh giá chất lượng và sự hỗ trợ của Nhà tuyển dụng sau khi hoàn thành công việc
                  </p>
                </div>
              </div>

              {/* Đánh giá doanh nghiệp & công việc (migration 014) */}
              <MyExperienceReviews currentUser={currentUser} showToast={showToast} onSelectJob={onSelectJob} />

              {/* ===============================================================
                  1. TABLE: Assignment đã hoàn thành chưa đánh giá (Chuẩn Image 3)
                  =============================================================== */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', marginBottom: 10 }}>
                  Assignment đã hoàn thành chưa đánh giá
                </div>

                <div style={{ border: '1.5px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)', color: '#334155', fontWeight: 800 }}>
                        <th style={{ padding: '12px 16px' }}>Công việc</th>
                        <th style={{ padding: '12px 16px', width: '220px' }}>Employer</th>
                        <th style={{ padding: '12px 16px', width: '150px', textAlign: 'center' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedAssignments.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ padding: '28px 16px', textAlign: 'center', color: '#64748B' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                              <Star size={24} color="#CBD5E1" />
                              <span>Hiện tại bạn chưa có công việc hoàn thành nào cần đánh giá.</span>
                              <span style={{ fontSize: 12, color: '#94A3B8' }}>
                                (Sau khi hoàn tất công việc ở mục Assignments, công việc sẽ tự động chuyển vào đây)
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        completedAssignments.map((item) => {
                          const isReviewed = reviewedAssignmentIds.includes(item.id);
                          const isSelected = selectedReviewAssignment?.id === item.id;

                          return (
                            <tr
                              key={item.id}
                              style={{
                                borderBottom: '1px solid #F1F5F9',
                                background: isSelected ? '#FAF5FF' : '#ffffff',
                                transition: 'background 0.15s ease'
                              }}
                            >
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>
                                  {item.job_title}
                                </div>
                                <div style={{ fontSize: 12, color: '#64748B' }}>
                                  Hợp đồng #{item.id} • Hoàn thành {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 700, color: '#1E293B' }}>
                                  {item.employer_name}
                                </div>
                                <div style={{ fontSize: 12, color: '#64748B' }}>
                                  {item.employer_email}
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                {isReviewed ? (
                                  <span style={{
                                    background: '#ECFDF5',
                                    color: '#047857',
                                    border: '1px solid #A7F3D0',
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}>
                                    <Check size={13} /> Đã đánh giá
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReviewAssignment(item)}
                                    style={{
                                      background: isSelected ? '#7565A8' : '#ffffff',
                                      color: isSelected ? '#ffffff' : '#7565A8',
                                      border: '1.5px solid #7565A8',
                                      borderRadius: 6,
                                      padding: '5px 12px',
                                      fontSize: 12.5,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {isSelected ? 'Đang chọn' : 'Chọn đánh giá'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ===============================================================
                  2. FORM: Đánh giá & Số sao & Nhận xét (Chuẩn Image 3)
                  =============================================================== */}
              <div style={{
                background: '#FAFAFA',
                border: '1.5px solid var(--color-border)',
                borderRadius: 12,
                padding: '22px 24px',
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 2px 0' }}>
                      Đánh giá {selectedReviewAssignment ? `— ${selectedReviewAssignment.job_title}` : ''}
                    </h3>
                    {selectedReviewAssignment && (
                      <span style={{ fontSize: 13, color: '#64748B' }}>
                        Nhà tuyển dụng: <strong>{selectedReviewAssignment.employer_name}</strong>
                      </span>
                    )}
                  </div>
                  {selectedReviewAssignment && reviewedAssignmentIds.includes(selectedReviewAssignment.id) && (
                    <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                      ⚠️ Đã gửi đánh giá trước đó (409 Conflict)
                    </span>
                  )}
                </div>

                {/* Field 1: Số sao (thang điểm 1-5 ⭐) */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                    Số sao (thang điểm 1-5 ⭐)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          outline: 'none',
                          transition: 'transform 0.1s'
                        }}
                      >
                        <Star
                          size={32}
                          fill={(reviewHoverRating || reviewRating) >= star ? '#F59E0B' : 'transparent'}
                          color={(reviewHoverRating || reviewRating) >= star ? '#F59E0B' : '#CBD5E1'}
                        />
                      </button>
                    ))}
                    <span style={{ marginLeft: 12, fontSize: 13.5, fontWeight: 700, color: '#D97706' }}>
                      {reviewRating === 5 && '5 sao (Rất xuất sắc)'}
                      {reviewRating === 4 && '4 sao (Tốt / Hài lòng)'}
                      {reviewRating === 3 && '3 sao (Đạt yêu cầu)'}
                      {reviewRating === 2 && '2 sao (Dưới kỳ vọng)'}
                      {reviewRating === 1 && '1 sao (Không hài lòng)'}
                    </span>
                  </div>
                </div>

                {/* Field 2: Nhận xét */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                    Nhận xét
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Nhập nội dung nhận xét chi tiết về môi trường làm việc, tính minh bạch về lương và sự hỗ trợ của Nhà tuyển dụng..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: '1.5px solid var(--color-border)',
                      fontSize: 13.5,
                      background: '#ffffff',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      lineHeight: 1.5
                    }}
                  />
                </div>

                {reviewConflictError && (
                  <div style={{
                    background: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    color: '#92400E',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    marginBottom: 16
                  }}>
                    ⚠️ {reviewConflictError}
                  </div>
                )}

                {/* Nút Gửi đánh giá theo chuẩn Wireframe (đen chữ trắng) */}
                <Button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !selectedReviewAssignment || (selectedReviewAssignment && reviewedAssignmentIds.includes(selectedReviewAssignment.id))}
                  style={{
                    background: (selectedReviewAssignment && reviewedAssignmentIds.includes(selectedReviewAssignment.id)) ? '#94A3B8' : '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: (selectedReviewAssignment && reviewedAssignmentIds.includes(selectedReviewAssignment.id)) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </Button>
              </div>

              {/* ===============================================================
                  3. LỊCH SỬ ĐÁNH GIÁ ĐÃ GỬI & ĐÁNH GIÁ TỪ NHÀ TUYỂN DỤNG
                  =============================================================== */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
                {/* Reviews You Sent */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', background: '#ffffff' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 12px 0' }}>
                    Đánh giá bạn đã gửi ({submittedReviewsList.length})
                  </h4>
                  {submittedReviewsList.length === 0 ? (
                    <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>
                      Bạn chưa gửi đánh giá nào trong phiên làm việc này.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {submittedReviewsList.map(r => (
                        <div key={r.id} style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700 }}>
                            <span>{r.job_title} — {r.employer_name}</span>
                            <span style={{ color: '#D97706' }}>{'★'.repeat(r.rating)} ({r.rating}.0)</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#475569' }}>
                            "{r.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reviews Received from Employers */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', background: '#ffffff' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 12px 0' }}>
                    Nhà tuyển dụng đánh giá bạn
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#D97706' }}>
                      5.0 ★
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text)' }}>
                        Điểm uy tín trung bình
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        Dựa trên các việc làm đã hoàn tất
                      </div>
                    </div>
                  </div>
                  <div style={{ background: '#FAF8FD', padding: '10px 12px', borderRadius: 8, border: '1px solid #EDE9FE', fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                    "Sinh viên có thái độ làm việc rất chuyên nghiệp, tiếp thu nhanh và hoàn thành các task giao diện chuẩn xác theo yêu cầu."
                    <div style={{ marginTop: 4, fontWeight: 700, color: '#7565A8' }}>
                      • Công ty TNHH TechNova (Đánh giá 5 sao)
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================
              TAB 8: TRUNG TÂM THÔNG BÁO (NOTIFICATIONS - WF-S11)
              =================================================================== */}
          {activeTab === 'notifications' && (
            <NotificationsPage
              currentUser={currentUser}
              showToast={showToast}
              onSelectNotification={(item) => {
                fetchNotifications();
                if (onOpenNotification) onOpenNotification(item);
              }}
            />
          )}

          {/* ===================================================================
              TAB 9: CÀI ĐẶT TÀI KHOẢN & BẢO MẬT (ACCOUNT SETTINGS - WF-X03)
              =================================================================== */}
          {activeTab === 'settings' && (
            <AccountSettingsPage
              currentUser={currentUser}
              showToast={showToast}
              embedded={true}
              onNavigateProfile={() => setActiveTab('profile')}
            />
          )}

        </main>
      </div>
    </div>
  );
}
