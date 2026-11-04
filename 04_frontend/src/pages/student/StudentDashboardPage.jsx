import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Briefcase, FileText, Bookmark, Clock, CheckCircle2, 
  XCircle, AlertCircle, ArrowRight, Save, Trash2, ExternalLink,
  Building2, MapPin, DollarSign, Calendar, UploadCloud, Plus, X,
  GraduationCap, Award, RefreshCw, Send, Check, Bell, Star,
  ShieldCheck, CheckCheck, Upload, Download, Eye, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../components/ui';
import JobCard from '../../components/common/JobCard';
import EmptyState from '../../components/common/EmptyState';
import CompanyLogo from '../../components/CompanyLogo';
import { API_BASE, formatApiError } from '../../config/api';
import MyAssignmentsPage from './MyAssignmentsPage';
import NotificationsPage from './NotificationsPage';

export default function StudentDashboardPage({
  currentUser,
  jobs = [],
  initialTab = 'dashboard',
  onSelectJob,
  onNavigateJobs,
  onNavigateComingSoon,
  showToast
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'dashboard' | 'profile' | 'cv' | 'saved_jobs' | 'applications' | 'assignments' | 'reviews' | 'notifications'
  
  // Dashboard overall loading & error states (WF-S01 Error / Loading / Retry)
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Applications State
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appFilter, setAppFilter] = useState('ALL');

  // Profile Form State (student_code, university, major, experience, bio, default_cv_url, skills)
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.full_name || 'Nguyễn Văn Chí');
  const [studentCode, setStudentCode] = useState('20110001');
  const [university, setUniversity] = useState('Trường Đại học Văn Lang (VLU)');
  const [major, setMajor] = useState('Công nghệ Thông tin');
  const [experience, setExperience] = useState('Đã hoàn thành dự án Web bán hàng ReactJS, có kinh nghiệm phục vụ cafe 6 tháng.');
  const [bio, setBio] = useState('Sinh viên năm 4 đam mê lập trình và phát triển kỹ năng mềm. Năng động, cầu tiến, có thể linh hoạt sắp xếp thời gian làm việc.');
  const [defaultCvUrl, setDefaultCvUrl] = useState('https://jobnest.vn/uploads/cv/CV_NguyenVanChi_Default.pdf');
  const [skills, setSkills] = useState(['Giao tiếp', 'Làm việc nhóm', 'Tin học văn phòng', 'Java', 'SQL', 'React.js']);
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

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
        if (p.student_code) setStudentCode(p.student_code);
        if (p.school || p.university) setUniversity(p.school || p.university);
        if (p.major) setMajor(p.major);
        if (p.experience) setExperience(p.experience);
        if (p.bio) setBio(p.bio);
        if (p.default_cv_url) setDefaultCvUrl(p.default_cv_url);
        if (Array.isArray(p.skills) && p.skills.length > 0) setSkills(p.skills);
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
        fetchNotifications()
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
  }, [initialTab]);

  // =========================================================================
  // 4. SAVE PROFILE HANDLER (PUT /api/profile/me)
  // =========================================================================
  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!currentUser?.token) {
      if (showToast) showToast('Vui lòng đăng nhập để lưu hồ sơ', 'error');
      return;
    }

    try {
      setIsSavingProfile(true);
      const res = await fetch(`${API_BASE}/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          student_code: studentCode,
          school: university,
          university,
          major,
          experience,
          bio,
          default_cv_url: defaultCvUrl,
          skills
        })
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) {
          showToast('Cập nhật hồ sơ cá nhân thành công!', 'success');
        }
      } else {
        throw new Error(data.message || 'Lỗi lưu hồ sơ');
      }
    } catch (err) {
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi cập nhật hồ sơ'), 'error');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Skill Add/Remove Handlers
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

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
  const inProgressAssignmentsCount = assignments.filter(a => a.status === 'IN_PROGRESS').length;
  const completedAssignmentsCount = assignments.filter(a => a.status === 'COMPLETED').length;

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
        setReviewConflictError('409 Conflict: Bạn đã gửi đánh giá cho đối tác này trong công việc này rồi! (G-41, G-42 TBD)');
        if (showToast) showToast('409 Conflict: Công việc này bạn đã gửi đánh giá rồi', 'error');
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
        setReviewConflictError('409 Conflict: Bạn đã gửi đánh giá cho đối tác này trong công việc này rồi! (G-41, G-42 TBD)');
      }
      if (showToast) showToast(formatApiError(err, 'Lỗi gửi đánh giá'), 'error');
    } finally {
      setSubmittingReview(false);
    }
  };


  return (
    <div className="student-dashboard-container" style={{ maxWidth: 1240, margin: '0 auto', paddingBottom: 60 }}>
      {/* =========================================================================
          PAGE HEADER TITLE & BREADCRUMB
          ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
            CỔNG THÔNG TIN SINH VIÊN (WF-S01)
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            Quản lý Tài khoản & Hoạt động Sinh viên
          </h1>
        </div>

        <button
          onClick={onNavigateJobs}
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--color-border)',
            color: 'var(--color-primary)',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-primary-light)';
            e.currentTarget.style.borderColor = '#A997C5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          Khám phá việc làm mới <ArrowRight size={14} />
        </button>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN LAYOUT: SIDEBAR (LEFT) + TAB CONTENT (RIGHT)
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '270px minmax(0, 1fr)', gap: 24, alignItems: 'flex-start' }} className="student-layout-grid">
        
        {/* =====================================================================
            LEFT SIDEBAR (AVATAR + MENU ĐIỀU HƯỚNG THEO CHUẨN WF-S01)
            ===================================================================== */}
        <aside style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          padding: '24px 18px',
          boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)',
          position: 'sticky',
          top: 80
        }}>
          {/* Avatar & Student Info Card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 20, borderBottom: '1px solid #F1F5F9', marginBottom: 18 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7565A8 0%, #A997C5 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 12,
              boxShadow: '0 6px 16px rgba(117, 101, 168, 0.25)',
              border: '3px solid #ffffff'
            }}>
              {fullName?.charAt(0) || 'S'}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
              {fullName}
            </h3>

            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              MSSV: <strong>{studentCode}</strong>
            </div>

            <span style={{
              display: 'inline-block',
              background: 'var(--color-accent-bg)',
              color: 'var(--color-primary)',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 12,
              border: '1px solid var(--color-secondary)'
            }}>
              Sinh viên Văn Lang
            </span>
          </div>

          {/* Sidebar Menu Items matching WF-S01 */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { id: 'dashboard', label: 'Tổng quan (Dashboard)', icon: Briefcase, count: null, code: 'WF-S01' },
              { id: 'profile', label: 'Hồ sơ cá nhân (Profile)', icon: User, count: null, code: 'WF-S02' },
              { id: 'cv', label: 'Quản lý CV (CV)', icon: GraduationCap, count: null, code: 'WF-S03' },
              { id: 'saved_jobs', label: 'Việc làm đã lưu (Saved Jobs)', icon: Bookmark, count: savedJobIds.length, code: 'WF-S04' },
              { id: 'applications', label: 'Lịch sử ứng tuyển (History)', icon: Clock, count: applications.length, code: 'WF-S05' },
              { id: 'assignments', label: 'Công việc được giao (Assignments)', icon: FileText, count: assignments.length, code: 'WF-S08' },
              { id: 'reviews', label: 'Đánh giá & Phản hồi (Reviews)', icon: Star, count: null, code: 'WF-S10' },
              { id: 'notifications', label: 'Thông báo (Notifications)', icon: Bell, count: unreadNotifsCount, code: 'WF-S11' },
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
        <main style={{ minWidth: 0 }}>
          
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
                    {/* 1. Application đang chờ (WF-S01: Application đang chờ [ N ]) */}
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
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>Application đang chờ</span>
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

                    {/* 2. Assignment đang thực hiện (WF-S01: Assignment đang thực hiện [ N ]) */}
                    <div 
                      onClick={() => setActiveTab('assignments')}
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
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>Assignment đang thực hiện</span>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Briefcase size={18} color="#2563EB" />
                        </div>
                      </div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)' }}>
                        {inProgressAssignmentsCount}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Công việc / Ca làm đang diễn ra
                      </div>
                    </div>

                    {/* 3. Việc đã hoàn thành (WF-S01: Việc đã hoàn thành [ N ]) */}
                    <div style={{
                      background: '#ffffff',
                      borderRadius: 14,
                      border: '1px solid var(--color-border)',
                      padding: '20px 18px',
                      boxShadow: '0 2px 8px rgba(41, 38, 58, 0.03)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#047857' }}>Việc đã hoàn thành</span>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={18} color="#047857" />
                        </div>
                      </div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)' }}>
                        {completedAssignmentsCount}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Dự án & Ca làm đã kết thúc
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

                  {/* 2 Bảng danh sách gần đây theo WF-S01: Assignment gần đây & Application gần đây */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
                    {/* 1. Assignment gần đây (WF-S01: [ Công việc | Trạng thái ]) */}
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
                            Assignment gần đây
                          </h3>
                          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            Công việc & Hợp đồng nhận làm
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab('assignments')}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Xem tất cả →
                        </button>
                      </div>

                      {/* Header row: Công việc | Trạng thái */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                        <span>CÔNG VIỆC</span>
                        <span>TRẠNG THÁI</span>
                      </div>

                      {assignments.length === 0 ? (
                        <EmptyState
                          title="Chưa có Assignment nào"
                          description="Bạn chưa có công việc nhận làm nào. Khám phá các công việc part-time & freelance phù hợp ngay!"
                          actionText="Tìm việc làm ngay"
                          onAction={onNavigateJobs}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {assignments.slice(0, 4).map((ass) => {
                            const isCompleted = ass.status === 'COMPLETED';
                            const isInProgress = ass.status === 'IN_PROGRESS';
                            return (
                              <div key={ass.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: '#F8F7FB', border: '1px solid #EAE7F0' }}>
                                <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {ass.job_title}
                                  </div>
                                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                    {ass.company_name || 'Doanh nghiệp'}
                                  </div>
                                </div>

                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  background: isCompleted ? '#ECFDF5' : isInProgress ? '#EFF6FF' : '#F1F5F9',
                                  color: isCompleted ? '#047857' : isInProgress ? '#2563EB' : '#64748B',
                                  border: `1px solid ${isCompleted ? '#A7F3D0' : isInProgress ? '#BFDBFE' : '#E2E8F0'}`
                                }}>
                                  {isCompleted ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : 'NOT_STARTED'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

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
                            Application gần đây
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
                        <span>JOB / VỊ TRÍ</span>
                        <span>TRẠNG THÁI</span>
                      </div>

                      {applications.length === 0 ? (
                        <EmptyState
                          title="Chưa có Application nào"
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
                                  {app.status || 'PENDING'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 2: HỒ SƠ CÁ NHÂN (PROFILE - WF-S02)
              Cho phép cập nhật: student_code, university, major, experience, bio, default_cv_url
              =================================================================== */}
          {activeTab === 'profile' && (
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid var(--color-border)',
              padding: '28px 32px',
              boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                    Thông tin hồ sơ sinh viên
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: 0 }}>
                    Cập nhật thông tin học vấn và hồ sơ năng lực để gây ấn tượng với nhà tuyển dụng
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  style={{
                    background: 'var(--color-primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 22px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(117, 101, 168, 0.3)'
                  }}
                >
                  {isSavingProfile ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>

              {profileLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                  Đang tải thông tin hồ sơ...
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="form-two-cols">
                    {/* Họ và tên */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                        Họ và tên sinh viên *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1.5px solid var(--color-border)',
                          fontSize: 13.5,
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Mã sinh viên (student_code) */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                        Mã số sinh viên (MSSV) *
                      </label>
                      <input
                        type="text"
                        value={studentCode}
                        onChange={(e) => setStudentCode(e.target.value)}
                        placeholder="VD: 20110001"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1.5px solid var(--color-border)',
                          fontSize: 13.5,
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="form-two-cols">
                    {/* Trường đại học (university) */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                        Trường Đại học / Cao đẳng *
                      </label>
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="VD: Trường Đại học Văn Lang (VLU)"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1.5px solid var(--color-border)',
                          fontSize: 13.5,
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Chuyên ngành (major) */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                        Chuyên ngành đào tạo *
                      </label>
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="VD: Công nghệ Thông tin, Thiết kế đồ họa, Quản trị du lịch..."
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1.5px solid var(--color-border)',
                          fontSize: 13.5,
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Kinh nghiệm (experience) */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                      Kinh nghiệm làm việc & Hoạt động
                    </label>
                    <textarea
                      rows={3}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Mô tả các dự án, công việc part-time hoặc hoạt động phong trào đã tham gia..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1.5px solid var(--color-border)',
                        fontSize: 13.5,
                        outline: 'none',
                        lineHeight: 1.5
                      }}
                    />
                  </div>

                  {/* Giới thiệu bản thân (bio) */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                      Giới thiệu bản thân (Bio)
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Giới thiệu điểm mạnh, sở thích và mục tiêu nghề nghiệp..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1.5px solid var(--color-border)',
                        fontSize: 13.5,
                        outline: 'none',
                        lineHeight: 1.5
                      }}
                    />
                  </div>

                  {/* Link CV mặc định (default_cv_url) */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                      Tệp CV mặc định / Đường dẫn CV Online
                    </label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="url"
                        value={defaultCvUrl}
                        onChange={(e) => setDefaultCvUrl(e.target.value)}
                        placeholder="https://drive.google.com/your-cv.pdf"
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1.5px solid var(--color-border)',
                          fontSize: 13.5,
                          outline: 'none'
                        }}
                      />
                      {defaultCvUrl && (
                        <a
                          href={defaultCvUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: '#F8F7FB',
                            border: '1.5px solid var(--color-border)',
                            color: 'var(--color-primary)',
                            padding: '0 16px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={14} /> Xem CV
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Kỹ năng (skills) */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                      Kỹ năng chuyên môn & Kỹ năng mềm
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            background: '#F3EFF9',
                            color: 'var(--color-primary)',
                            fontSize: 12.5,
                            fontWeight: 600,
                            padding: '5px 12px',
                            borderRadius: 20,
                            border: '1px solid #EDE9FE',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: '#7565A8' }}
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}

                      {isAddingSkill ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                            placeholder="Nhập kỹ năng mới..."
                            autoFocus
                            style={{
                              padding: '4px 10px',
                              borderRadius: 16,
                              border: '1.5px solid var(--color-primary)',
                              fontSize: 12.5,
                              outline: 'none'
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            style={{ background: 'var(--color-primary)', color: '#ffffff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}
                          >
                            Thêm
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAddingSkill(true)}
                          style={{
                            background: '#ffffff',
                            color: 'var(--color-primary)',
                            border: '1px dashed var(--color-primary)',
                            borderRadius: 20,
                            padding: '4px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Plus size={13} /> Thêm kỹ năng
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
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
                /* Empty State theo yêu cầu */
                <EmptyState
                  title="Bạn chưa có đơn ứng tuyển nào"
                  description="Hiện tại bạn chưa nộp hồ sơ vào công việc nào trong danh mục này. Hãy tìm kiếm các cơ hội việc làm part-time hấp dẫn và ứng tuyển ngay nhé!"
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              background: isAccepted ? '#ECFDF5' : isRejected ? '#FEE2E2' : '#FEF3C7',
                              color: isAccepted ? '#047857' : isRejected ? '#DC2626' : '#D97706',
                              border: `1px solid ${isAccepted ? '#A7F3D0' : isRejected ? '#FECACA' : '#FDE68A'}`
                            }}>
                              {isAccepted ? '✓ ĐÃ DUYỆT' : isRejected ? '✕ BỊ TỪ CHỐI' : '⏳ CHỜ DUYỆT'}
                            </span>
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
                    Quản lý CV & Hồ sơ ứng tuyển (WF-S03)
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: 0 }}>
                    Tải lên và thiết lập CV mặc định để nộp nhanh cho các công việc part-time & freelance
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
                <strong>💡 Mẹo từ JobNest:</strong> Đảm bảo CV của bạn ghi rõ các kỹ năng chuyên môn, kinh nghiệm thực tế hoặc dự án đồ án ở trường để tăng <strong>85% tỉ lệ duyệt đơn</strong> từ doanh nghiệp đối tác!
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
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F1EEF8', color: '#7565A8', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                    WF-S10 — REVIEWS
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                    Đánh giá & Phản hồi Nhà tuyển dụng
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: 0 }}>
                    Đánh giá chất lượng và sự hỗ trợ của Nhà tuyển dụng sau khi hoàn thành công việc
                  </p>
                </div>
              </div>

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

                <div style={{ marginTop: 14, fontSize: 11.5, color: '#64748B', fontStyle: 'italic' }}>
                  Trạng thái UI / TBD: 409 nếu đã đánh giá. G-41, G-42 TBD.
                </div>
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
                if (showToast) showToast(`Đã mở thông báo: ${item.title || 'Thông báo'}`, 'info');
              }}
            />
          )}

        </main>
      </div>
    </div>
  );
}
