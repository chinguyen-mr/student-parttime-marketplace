import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Shield, MapPin, DollarSign, Bell, ArrowLeft, ArrowRight, Briefcase, Filter, Sparkles, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, AnimatedToast, CustomDropdown } from './components/ui';
import AuthModal from './components/AuthModal';
import ApplicationModal from './components/forms/ApplicationModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotificationsDropdown from './components/NotificationsDropdown';
import JobDetailModal from './components/JobDetailModal';
import ReviewModal from './components/ReviewModal';
import { StudentProfileCard } from './components/StudentProfileModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import Footer from './components/Footer';
import AccountMenu from './components/layout/AccountMenu';
import { applyBlockReason, salaryOptionsFor, matchesSalaryFilter } from './utils/jobDisplay';
import FloatingActions from './components/FloatingActions';
import SupportModal from './components/SupportModal';
import ComingSoonPage from './pages/ComingSoonPage';
import HomePage from './pages/HomePage';
import JobCard from './components/JobCard';
import { JobListSkeleton, EmptyState } from './components/common';
import JobQuickPreview from './components/JobQuickPreview';
import JobDetailPage from './pages/JobDetailPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import MyAssignmentsPage from './pages/student/MyAssignmentsPage';
import EmployerPortal from './pages/EmployerPortal';
import AdminPortal from './pages/admin/AdminPortal';
import NotificationsPage from './pages/student/NotificationsPage';
import AboutPage from './pages/guest/AboutPage';
import EmployerPublicProfilePage from './pages/guest/EmployerPublicProfilePage';
import RegisterSuccessPage from './pages/guest/RegisterSuccessPage';
import ErrorPage from './pages/common/ErrorPage';
import ApplicationDetailPage from './pages/student/ApplicationDetailPage';
import StudentProfileViewPage from './pages/employer/StudentProfileViewPage';
import ReportViolationModal from './components/forms/ReportViolationModal';
import AccountSettingsPage from './pages/student/AccountSettingsPage';
import { API_BASE, checkBackendConnection, formatApiError } from './config/api';
import { takeRestoredTab, rememberTab, clearRememberedTabs } from './utils/rememberedTab';
import { isImeComposing } from './utils/ime';

// ===== Giữ đăng nhập & vị trí khi tải lại trang =====
const SESSION_KEY = 'jobnest_session';
/** Phiên đã lưu; tự xóa nếu token hỏng hoặc đã hết hạn (exp trong JWT). */
function loadStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    const payload = JSON.parse(atob(String(user?.token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp * 1000 <= Date.now()) throw new Error('expired');
    return user;
  } catch {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* bỏ qua */ }
    return null;
  }
}
// Trang khách xem được khi chưa đăng nhập; trang khác chỉ khôi phục khi còn phiên
const PUBLIC_TABS = ['home', 'jobs', 'about', 'job_detail', 'employer_public_profile', 'coming_soon', 'login', 'register'];
// Trang cần mã đối tượng đang xem → thiếu mã thì không khôi phục
const TAB_SELECTION = { job_detail: 'jobId', employer_public_profile: 'employerId', application_detail: 'applicationId', student_profile_view: 'studentId' };
let appRestore;
function getAppRestore() {
  if (appRestore) return appRestore;
  const session = loadStoredSession();
  let tab = takeRestoredTab('app');
  let sel = {};
  try { sel = JSON.parse(takeRestoredTab('app_sel') || '{}') || {}; } catch { sel = {}; }
  if (session && ['login', 'register', 'register_success'].includes(tab)) tab = null;
  if (!session && tab && !PUBLIC_TABS.includes(tab)) tab = null;
  if (tab && TAB_SELECTION[tab] && !sel[TAB_SELECTION[tab]]) tab = tab === 'job_detail' ? 'jobs' : null;
  appRestore = { session, tab, sel };
  return appRestore;
}

export default function App() {
  // Navigation tabs matching the wireframe screens:
  // 'home' (WF-G01), 'jobs' (WF-G02), 'student_apps' (Screen 8), 'employer_jobs' (Screen 10),
  // 'create_job' (Screen 11), 'applicants' (Screen 12), 'admin' (Screen 5), 'login' (Screen 1 & 2)
  const [activeTab, setActiveTab] = useState(() => getAppRestore().tab || 'home');
  // Tab con muốn mở trong trang Sinh viên; n tăng mỗi lần chọn để mở lại cả khi trùng tab
  const [studentDashNav, setStudentDashNav] = useState({ tab: 'dashboard', n: 0 });
  const [editingEmployerJob, setEditingEmployerJob] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Backend Connectivity State (Port 5000)
  const [backendStatus, setBackendStatus] = useState({
    checked: false,
    online: true,
    dbOk: true,
    message: ''
  });
  const [retryingBackend, setRetryingBackend] = useState(false);

  // Authentication state (null when not logged in)
  const [currentUser, setCurrentUser] = useState(() => getAppRestore().session);

  // Lưu phiên để tải lại trang không bị đăng xuất; đăng xuất (currentUser = null) thì xóa
  useEffect(() => {
    try {
      if (currentUser?.token) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      else localStorage.removeItem(SESSION_KEY);
    } catch { /* trình duyệt chặn lưu trữ → chỉ mất tính năng giữ đăng nhập */ }
  }, [currentUser]);
  // Đăng nhập tài khoản khác / đăng xuất → không mở lại các tab của phiên trước
  const prevTokenRef = useRef(currentUser?.token);
  useEffect(() => {
    if (prevTokenRef.current !== currentUser?.token) clearRememberedTabs();
    prevTokenRef.current = currentUser?.token;
  }, [currentUser?.token]);

  // =========================================================================
  // TRƯỜNG 1 (WORKSPACE) vs TRƯỜNG 2 (MARKETPLACE) CONDITIONAL DEFINITION
  // =========================================================================
  const isEmployer = Boolean(currentUser?.token && currentUser?.role === 'EMPLOYER');
  const employerWorkspaceTabs = [
    'employer_dashboard',
    'employer_jobs',
    'create_job',
    'applicants',
    'employer_assignments',
    'employer_profile'
  ];
  const isEmployerWorkspace = Boolean(
    isEmployer && (
      employerWorkspaceTabs.includes(activeTab) || 
      (activeTab === 'notifications' && currentUser?.role === 'EMPLOYER')
    )
  );

  const isAdminWorkspace = Boolean(
    currentUser?.token && currentUser?.role === 'ADMIN' && activeTab === 'admin'
  );

  // Trang Sinh viên dùng toàn bộ chiều rộng, sidebar dính sát mép trái
  const isStudentWorkspace = Boolean(
    currentUser?.token && currentUser?.role === 'STUDENT' &&
    ['student_apps', 'student_dashboard', 'account_settings', 'profile'].includes(activeTab)
  );

  // QUY TẮC FOOTER BẮT BUỘC (FT-01 đến FT-15):
  // 1. Chỉ hiển thị Footer tại khu vực Khám phá thị trường (Market Discovery: home, jobs, categories, search)
  // 2. Tuyệt đối ẩn Footer tại toàn bộ khu vực Quản trị Employer (WF-E01 đến WF-E12)
  const isMarketDiscoveryRoute = [
    'home',
    'jobs',
    'categories',
    'search',
    'featured_jobs',
    'about',
    'employer_public_profile'
  ].includes(activeTab) && !isEmployerWorkspace && !isAdminWorkspace;

  const isEmployerOperationalScreen = isEmployerWorkspace || isAdminWorkspace || (
    currentUser?.role === 'EMPLOYER' && [
      'employer_dashboard',
      'employer_jobs',
      'create_job',
      'applicants',
      'employer_assignments',
      'employer_profile',
      'notifications'
    ].includes(activeTab)
  );

  // Modal open states matching wireframe screens:
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [notificationsOpen, setNotificationsOpen] = useState(false); // Screen 4
  const [headerUnreadCount, setHeaderUnreadCount] = useState(0);

  // Tự động đồng bộ số lượng thông báo chưa đọc từ Backend cho Notification Bell
  useEffect(() => {
    if (!currentUser?.token) {
      setHeaderUnreadCount(0);
      return;
    }
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications?limit=1`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        const data = await res.json();
        if (data.success && typeof data.unread_count === 'number') {
          setHeaderUnreadCount(data.unread_count);
        }
      } catch (err) {
        // quiet fallback
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);
  const [jobDetailModalOpen, setJobDetailModalOpen] = useState(false); // Screen 7
  const [applicationModalOpen, setApplicationModalOpen] = useState(false); // WF-S06: Application Form (PT/SV)
  const [applyTargetJob, setApplyTargetJob] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false); // Screen 13
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false); // Screen 3
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [headerIntroMenuOpen, setHeaderIntroMenuOpen] = useState(false);
  const [aboutSection, setAboutSection] = useState('about');
  const introMenuRef = useRef(null);
  const introTimeoutRef = useRef(null);

  const handleNavigateAbout = (section = 'about') => {
    setActiveTab('about');
    setAboutSection(section);
    setHeaderIntroMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIntroMouseEnter = () => {
    if (introTimeoutRef.current) clearTimeout(introTimeoutRef.current);
    setHeaderIntroMenuOpen(true);
  };

  const handleIntroMouseLeave = () => {
    if (introTimeoutRef.current) clearTimeout(introTimeoutRef.current);
    introTimeoutRef.current = setTimeout(() => {
      setHeaderIntroMenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (introMenuRef.current && !introMenuRef.current.contains(event.target)) {
        setHeaderIntroMenuOpen(false);
      }
    };
    if (headerIntroMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [headerIntroMenuOpen]);
  const [comingSoonInfo, setComingSoonInfo] = useState({
    title: 'Tính năng đang phát triển',
    desc: 'Tính năng này đang trong quá trình phát triển và sẽ sớm ra mắt trên nền tảng JobNest.',
  });

  const handleNavigateComingSoon = (title, desc) => {
    setComingSoonInfo({
      title: title || 'Tính năng đang phát triển',
      desc: desc || 'Chúng tôi đang hoàn thiện tính năng này để mang đến trải nghiệm tốt hơn cho bạn.',
      prevTab: activeTab !== 'coming_soon' ? activeTab : 'jobs',
    });
    setActiveTab('coming_soon');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selected entities for modals & pages
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewingJobId, setViewingJobId] = useState(() => getAppRestore().sel.jobId || null);

  // 8 Màn hình bổ sung states (WF-G06, WF-G07, WF-G08, WF-X02, WF-S12, WF-E13, WF-X01, WF-X03)
  const [selectedEmployerId, setSelectedEmployerId] = useState(() => getAppRestore().sel.employerId || null);
  const [selectedApplicationId, setSelectedApplicationId] = useState(() => getAppRestore().sel.applicationId || null);
  const [selectedStudentId, setSelectedStudentId] = useState(() => getAppRestore().sel.studentId || null);

  // Ghi nhớ trang + đối tượng đang xem để tải lại trang (F5) vẫn ở đúng chỗ
  useEffect(() => { rememberTab('app', activeTab); }, [activeTab]);
  useEffect(() => {
    rememberTab('app_sel', JSON.stringify({ jobId: viewingJobId, employerId: selectedEmployerId, applicationId: selectedApplicationId, studentId: selectedStudentId }));
  }, [viewingJobId, selectedEmployerId, selectedApplicationId, selectedStudentId]);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [errorPageConfig, setErrorPageConfig] = useState({ type: '404', message: '' });
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalTarget, setReportModalTarget] = useState({ type: 'JOB', id: null, title: '' });
  const [pendingApplyJob, setPendingApplyJob] = useState(null);
  const [registerSuccessModalOpen, setRegisterSuccessModalOpen] = useState(false);

  // Hồ sơ sinh viên đủ để ứng tuyển? Hỏi server (GET /profile/me) — đúng trên mọi thiết bị
  const fetchStudentProfileComplete = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile/me`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      const data = await res.json();
      const p = data?.data || {};
      return Boolean(p.is_profile_completed || ((p.school || p.university) && p.major));
    } catch {
      return true; // lỗi mạng: để backend kiểm tra lại khi nộp đơn
    }
  };

  // Helper xử lý điều hướng sau Đăng nhập / Đăng ký thành công có xét pendingApplyJob
  const handleAuthSuccess = (user, isRegister = false) => {
    setCurrentUser(user);
    if (isRegister) setRegisteredUser(user);
    setAuthModalOpen(false);

    if (pendingApplyJob) {
      const target = pendingApplyJob;
      setPendingApplyJob(null);
      handleNavigateToJobDetail(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(`${isRegister ? 'Đăng ký' : 'Đăng nhập'} thành công! Bạn đang xem lại công việc "${target.title}".`, 'success');
    } else {
      if (isRegister) {
        // Đăng ký xong → vào thẳng trang chỉnh sửa hồ sơ trong dashboard (không mở popup)
        if (user?.role === 'EMPLOYER') {
          setActiveTab('employer_profile');
          showToast(`Đăng ký thành công! Hãy hoàn thiện thông tin doanh nghiệp để sẵn sàng đăng tin tuyển dụng.`, 'success');
        } else {
          setStudentDashNav(prev => ({ tab: 'profile', n: prev.n + 1 }));
          setActiveTab('student_dashboard');
          showToast(`Đăng ký thành công! Hãy hoàn thiện hồ sơ sinh viên để sẵn sàng ứng tuyển.`, 'success');
        }
      } else {
        setActiveTab(user.role === 'EMPLOYER' ? 'employer_dashboard' : user.role === 'ADMIN' ? 'admin' : 'home');
        showToast(`Đăng nhập thành công! Chào mừng ${user.full_name || 'bạn'}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToEmployerProfile = (employerIdOrJob) => {
    let id = employerIdOrJob;
    if (typeof employerIdOrJob === 'object' && employerIdOrJob !== null) {
      // Tin tuyển dụng → lấy employer_id; không dùng job.id làm mã nhà tuyển dụng
      id = employerIdOrJob.employer_id || ('title' in employerIdOrJob ? null : employerIdOrJob.id);
    }
    setSelectedEmployerId(id || null);
    setActiveTab('employer_public_profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToApplicationDetail = (appId) => {
    setSelectedApplicationId(appId);
    setActiveTab('application_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReportModal = (type, id, title) => {
    setReportModalTarget({ type, id, title });
    setReportModalOpen(true);
  };

  // Saved Jobs State (Lưu việc làm yêu thích)
  // Việc làm đã lưu — lưu DB (job_saved), tải lại khi đăng nhập
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Quick Preview Hover State (Giai đoạn 2: Xem nhanh) & Auto-Dismissal Architecture
  const [previewJob, setPreviewJob] = useState(null);
  const [previewAnchorRect, setPreviewAnchorRect] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewTimerRef = useRef(null);
  const previewCloseTimerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollDebounceTimerRef = useRef(null);
  const lastScrollTimeRef = useRef(0);
  const scrollSuppressActiveRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const activePreviewJobIdRef = useRef(null);

  // Đóng lập tức Quick Preview, hủy các timer đang chờ
  const closeQuickPreviewImmediate = useCallback(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    if (previewCloseTimerRef.current) {
      clearTimeout(previewCloseTimerRef.current);
      previewCloseTimerRef.current = null;
    }
    activePreviewJobIdRef.current = null;
    setIsPreviewOpen(false);
    setPreviewJob(null);
    setPreviewAnchorRect(null);
  }, []);

  // Xử lý sự kiện cuộn trang (Window, nested container, wheel, touchmove)
  const handleScrollDismiss = useCallback(() => {
    const now = Date.now();
    lastScrollTimeRef.current = now;
    if (typeof window !== 'undefined') {
      window.__jobNestLastScrollTime = now;
      window.__isJobNestScrolling = true;
    }
    scrollSuppressActiveRef.current = true;
    isScrollingRef.current = true;

    // 1. Đóng Quick Preview ngay lập tức không phụ thuộc vị trí Card
    closeQuickPreviewImmediate();

    // 2. Debounce kết thúc cuộn (~300ms)
    if (scrollDebounceTimerRef.current) {
      clearTimeout(scrollDebounceTimerRef.current);
    }
    scrollDebounceTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      if (typeof window !== 'undefined') {
        window.__isJobNestScrolling = false;
      }
    }, 300);
  }, [closeQuickPreviewImmediate]);

  // Lắng nghe di chuyển chuột thực tế của người dùng để gỡ bỏ suppression sau khi cuộn dừng
  const handleUserMouseMove = useCallback((e) => {
    if (!scrollSuppressActiveRef.current) {
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Chỉ gỡ bỏ khi đã dừng cuộn ít nhất 200ms và người dùng thực sự di chuột lệch ít nhất 6px
    if (Date.now() - lastScrollTimeRef.current > 200) {
      const dx = Math.abs(e.clientX - lastMousePosRef.current.x);
      const dy = Math.abs(e.clientY - lastMousePosRef.current.y);
      if (dx > 6 || dy > 6) {
        scrollSuppressActiveRef.current = false;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    }
  }, []);

  // Đăng ký event listener ở Capture Phase để bắt cả scroll ở nested container lẫn window
  useEffect(() => {
    // Capture phase (true) cho phép bắt mọi scroll event trong cây DOM
    window.addEventListener('scroll', handleScrollDismiss, { capture: true, passive: true });
    window.addEventListener('wheel', handleScrollDismiss, { passive: true });
    window.addEventListener('touchmove', handleScrollDismiss, { passive: true });
    window.addEventListener('mousemove', handleUserMouseMove, { capture: true, passive: true });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeQuickPreviewImmediate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollDismiss, { capture: true });
      window.removeEventListener('wheel', handleScrollDismiss);
      window.removeEventListener('touchmove', handleScrollDismiss);
      window.removeEventListener('mousemove', handleUserMouseMove, { capture: true });
      window.removeEventListener('keydown', handleKeyDown);
      if (scrollDebounceTimerRef.current) clearTimeout(scrollDebounceTimerRef.current);
    };
  }, [handleScrollDismiss, handleUserMouseMove, closeQuickPreviewImmediate]);

  // Dọn dẹp hoàn toàn khi chuyển tab / trang (Rule 2: Chuyển sang trang khác)
  useEffect(() => {
    closeQuickPreviewImmediate();
    scrollSuppressActiveRef.current = false;
    isScrollingRef.current = false;
  }, [activeTab, closeQuickPreviewImmediate]);

  // Lấy ảnh đại diện khi đăng nhập để header hiển thị đúng (currentUser từ API login không có avatar)
  useEffect(() => {
    const token = currentUser?.token;
    if (!token) return undefined;
    let cancelled = false;
    fetch(`${API_BASE}/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        const url = data?.data?.avatar_url || null;
        if (!cancelled && url) setCurrentUser(prev => (prev?.token === token ? { ...prev, avatar_url: url } : prev));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [currentUser?.token]);

  // Chiều cao header → biến CSS --app-header-h cho các sidebar dính (sticky) bên dưới header
  useEffect(() => {
    const header = document.querySelector('.app-header');
    if (!header || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => document.documentElement.style.setProperty('--app-header-h', `${header.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, [currentUser?.token]);

  // Rời trang Sinh viên thì lần sau vào lại mặc định mở Tổng quan
  useEffect(() => {
    if (activeTab !== 'student_dashboard') {
      setStudentDashNav(prev => (prev.tab === 'dashboard' ? prev : { tab: 'dashboard', n: prev.n }));
    }
  }, [activeTab]);

  // Đồng bộ activeTab với lịch sử trình duyệt để nút Back/Forward hoạt động
  const historyInitRef = useRef(false);
  useEffect(() => {
    if (!historyInitRef.current) {
      historyInitRef.current = true;
      window.history.replaceState({ ...window.history.state, tab: activeTab }, '');
      return;
    }
    if (window.history.state?.tab === activeTab) return; // vừa Back/Forward tới đây
    window.history.pushState({ ...window.history.state, tab: activeTab }, '');
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state?.tab) setActiveTab(e.state.tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Trả về false nếu chưa mở được (vừa cuộn) để thẻ thử lại khi chuột di chuyển
  const handlePreviewHoverStart = useCallback((jobItem, rect) => {
    if (!jobItem) return false;

    // Rule 3: Tuyệt đối không mở lại nếu vừa cuộn hoặc đang trong trạng thái suppress do cuộn
    if (
      isScrollingRef.current || 
      scrollSuppressActiveRef.current || 
      (Date.now() - lastScrollTimeRef.current < 350)
    ) {
      return false;
    }

    if (previewCloseTimerRef.current) {
      clearTimeout(previewCloseTimerRef.current);
      previewCloseTimerRef.current = null;
    }
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }

    previewTimerRef.current = setTimeout(() => {
      // Kiểm tra lại trạng thái trước khi mở
      if (
        isScrollingRef.current || 
        scrollSuppressActiveRef.current || 
        (Date.now() - lastScrollTimeRef.current < 350)
      ) {
        return;
      }
      activePreviewJobIdRef.current = jobItem.id;
      setPreviewJob(jobItem);
      setPreviewAnchorRect(rect);
      setIsPreviewOpen(true);
    }, 140);
    return true;
  }, []);

  const handlePreviewHoverEnd = useCallback((jobItem) => {
    // Nếu vừa có hành động cuộn thì bỏ qua logic hoverEnd bình thường vì đã đóng ngay lập tức
    if (
      isScrollingRef.current || 
      scrollSuppressActiveRef.current || 
      (Date.now() - lastScrollTimeRef.current < 350)
    ) {
      return;
    }

    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    previewCloseTimerRef.current = setTimeout(() => {
      activePreviewJobIdRef.current = null;
      setIsPreviewOpen(false);
      setPreviewJob(null);
      setPreviewAnchorRect(null);
    }, 220);
  }, []);

  const handlePreviewMouseEnter = useCallback(() => {
    if (previewCloseTimerRef.current) {
      clearTimeout(previewCloseTimerRef.current);
      previewCloseTimerRef.current = null;
    }
    setIsPreviewOpen(true);
  }, []);

  const handlePreviewMouseLeave = useCallback(() => {
    previewCloseTimerRef.current = setTimeout(() => {
      activePreviewJobIdRef.current = null;
      setIsPreviewOpen(false);
      setPreviewJob(null);
      setPreviewAnchorRect(null);
    }, 180);
  }, []);

  // Toggle Lưu việc làm
  // Danh sách tin đã lưu của sinh viên đang đăng nhập (GET /jobs/saved)
  useEffect(() => {
    if (!currentUser?.token || currentUser?.role !== 'STUDENT') { setSavedJobIds([]); return undefined; }
    let cancelled = false;
    fetch(`${API_BASE}/jobs/saved`, { headers: { Authorization: `Bearer ${currentUser.token}` } })
      .then(res => res.json())
      .then(data => { if (!cancelled && data.success && Array.isArray(data.data?.ids)) setSavedJobIds(data.data.ids); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [currentUser?.token, currentUser?.role]);

  // Bật/tắt lưu việc làm → POST /jobs/:id/save (lưu DB)
  const handleToggleSaveJob = async (jobItem) => {
    if (!currentUser?.token) {
      showToast('Vui lòng đăng nhập tài khoản sinh viên để lưu việc làm', 'error');
      return;
    }
    if (currentUser.role !== 'STUDENT') {
      showToast('Chỉ sinh viên mới lưu được việc làm', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobItem.id}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Không lưu được việc làm');
      const saved = Boolean(data.data?.saved);
      setSavedJobIds(prev => (saved ? [...new Set([...prev, jobItem.id])] : prev.filter(id => id !== jobItem.id)));
      showToast(saved ? `Đã lưu tin "${jobItem.title}" vào mục yêu thích ❤️` : `Đã bỏ lưu việc "${jobItem.title}"`);
    } catch (err) {
      showToast(formatApiError(err, 'Không lưu được việc làm'), 'error');
    }
  };

  // Navigate to full Job Detail page (Giai đoạn 3)
  const handleNavigateToJobDetail = (jobItem) => {
    setIsPreviewOpen(false);
    setSelectedJob(jobItem);
    setViewingJobId(jobItem.id);
    setActiveTab('job_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mở một mục trong trang Sinh viên (Tổng quan, Hồ sơ, Lịch sử ứng tuyển, Thông báo...)
  const openStudentTab = (tab) => {
    setStudentDashNav(prev => ({ tab, n: prev.n + 1 }));
    setActiveTab('student_dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bấm vào thông báo → chuyển tới đúng nơi liên quan dựa trên target_type / target_id
  const handleOpenNotification = (item) => {
    setNotificationsOpen(false);
    if (currentUser?.role !== 'STUDENT') {
      showToast(`Đã mở thông báo: ${item?.title || ''}`);
      return;
    }
    const id = item?.target_id;
    switch (item?.target_type) {
      case 'APPLICATION':
        if (id) handleNavigateToApplicationDetail(id);
        else openStudentTab('applications');
        return;
      case 'JOB':
        if (id) handleNavigateToJobDetail(jobs.find(j => j.id === id) || { id });
        else openStudentTab('saved_jobs');
        return;
      case 'REVIEW':
      case 'COMPANY_REVIEW': // đánh giá doanh nghiệp / công việc: trạng thái kiểm duyệt, phản hồi của doanh nghiệp
      case 'JOB_REVIEW':
        openStudentTab('reviews');
        return;
      case 'ASSIGNMENT': // mục "Công việc được giao" đã ẩn → xem trong lịch sử ứng tuyển
      case 'PROPOSAL':
        openStudentTab('applications');
        return;
      case 'USER': // cảnh báo vi phạm / kết quả khiếu nại liên quan tài khoản
        openStudentTab('settings');
        return;
      default:
        openStudentTab('notifications');
    }
  };

  const [reviewTarget, setReviewTarget] = useState({
    targetName: 'TechCorp Vietnam',
    targetRole: 'Nhà tuyển dụng đối tác',
    jobTitle: 'Lập trình viên React part-time',
    jobTime: '15/09/2026 - 15/10/2026',
  });

  // Filters for job search (Screen 6)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSalary, setSelectedSalary] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [jobsPage, setJobsPage] = useState(1); // trang hiện tại của danh sách Tìm việc

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Đã đăng xuất khỏi tài khoản.');
    setActiveTab('jobs');
  };

  // Check Backend and PostgreSQL health
  const handleCheckConnection = async (showToastFeedback = false) => {
    try {
      const res = await checkBackendConnection(3500);
      setBackendStatus({
        checked: true,
        online: res.ok,
        dbOk: res.dbOk,
        message: res.message
      });
      if (res.ok) {
        if (showToastFeedback) {
          showToast('Đã kết nối lại hệ thống thành công!', 'success');
        }
        fetchJobs();
      } else {
        if (showToastFeedback) {
          showToast(res.message, 'error');
        }
      }
      return res;
    } catch (e) {
      setBackendStatus({
        checked: true,
        online: false,
        dbOk: false,
        message: 'Không kết nối được tới máy chủ.'
      });
      if (showToastFeedback) {
        showToast('Không kết nối được tới máy chủ.', 'error');
      }
      return { ok: false };
    }
  };

  // Helper login function for quick role switching
  const handleQuickLogin = async (email, roleName, silent = false) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser({ ...data.data.user, token: data.data.token });
        setBackendStatus(prev => ({ ...prev, online: true, checked: true }));
        if (!silent) {
          showToast(`Đã chuyển vai trò: ${roleName} (${data.data.user.full_name})`);
        }
      } else {
        if (!silent) showToast(data.message || 'Đăng nhập không thành công', 'error');
      }
    } catch (err) {
      setBackendStatus(prev => ({ ...prev, online: false, checked: true }));
      if (!silent) {
        showToast(formatApiError(err), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Public Jobs (Screen 6)
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchKeyword) params.append('keyword', searchKeyword);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLocation) params.append('location', selectedLocation);
      // Lọc & phân trang làm ở phía giao diện → cần tải đủ tin (API mặc định chỉ trả 20)
      params.append('limit', '500');

      const res = await fetch(`${API_BASE}/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
        setBackendStatus(prev => ({ ...prev, online: true, checked: true }));
      }
    } catch (err) {
      console.error(err);
      setBackendStatus(prev => ({ ...prev, online: false, checked: true }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCheckConnection();
    // Fetch initial public jobs in guest mode matching WF-G01
    fetchJobs();

    // Hỗ trợ Deep Linking qua URL Search Params cho các màn hình bổ sung (WF-G06, WF-G07, WF-G08, WF-X02, WF-S12, WF-E13, WF-X03)
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      const urlEmployerId = params.get('employerId');
      const urlAppId = params.get('applicationId');
      const urlStudentId = params.get('studentId');
      const urlErrorType = params.get('errorType');

      if (urlEmployerId) {
        setSelectedEmployerId(urlEmployerId);
        setActiveTab('employer_public_profile');
      } else if (urlAppId) {
        setSelectedApplicationId(urlAppId);
        setActiveTab('application_detail');
      } else if (urlStudentId) {
        setSelectedStudentId(urlStudentId);
        setActiveTab('student_profile_view');
      } else if (urlTab === 'register_success') {
        setActiveTab('register_success');
      } else if (urlTab === 'error_page' || urlErrorType) {
        if (urlErrorType) setErrorPageConfig(prev => ({ ...prev, type: urlErrorType }));
        setActiveTab('error_page');
      } else if (urlTab === 'account_settings') {
        setActiveTab('account_settings');
      } else if (urlTab === 'static_content') {
        setActiveTab('about');
      } else if (urlTab === 'employer_public_profile') {
        setActiveTab('employer_public_profile');
      }
    } catch {
      // quiet fallback
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'jobs' || activeTab === 'home') fetchJobs();
  }, [activeTab, currentUser]);

  // Handle Submit Application (from JobDetailModal - Screen 7)
  const handleApplyFromModal = async ({ jobId, coverLetter, cvUrl }) => {
    if (!currentUser?.token) {
      if (selectedJob) setPendingApplyJob(selectedJob);
      showToast('Vui lòng đăng nhập với tài khoản Sinh viên để ứng tuyển', 'info');
      setActiveTab('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (currentUser?.role !== 'STUDENT') {
      showToast('Chỉ tài khoản Sinh viên mới có thể nộp hồ sơ ứng tuyển', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          job_id: jobId,
          cover_letter: coverLetter,
          cv_url: cvUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Nộp hồ sơ ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ.');
        setJobDetailModalOpen(false);
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(formatApiError(err), 'error');
    }
  };

  // Mở WF-S06 (Application Form)
  const handleOpenApplyModal = async (jobItem) => {
    // Tin đã đóng hoặc hết hạn nhận hồ sơ → không cho ứng tuyển
    const blockReason = applyBlockReason(jobItem);
    if (blockReason) {
      showToast(blockReason, 'error');
      return;
    }
    if (!currentUser?.token) {
      setPendingApplyJob(jobItem);
      showToast('Vui lòng đăng nhập với tài khoản Sinh viên để ứng tuyển công việc này', 'info');
      setActiveTab('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (currentUser?.role !== 'STUDENT') {
      showToast('Chỉ sinh viên mới có thể nộp đơn ứng tuyển công việc này!', 'error');
      return;
    }

    // Yêu cầu: Sinh viên chưa hoàn thành hồ sơ thì CHƯA ĐƯỢC ỨNG TUYỂN
    if (!(await fetchStudentProfileComplete())) {
      showToast('Bạn chưa hoàn thiện hồ sơ sinh viên! Vui lòng cập nhật đầy đủ thông tin (Trường học, Chuyên ngành, Kỹ năng, CV) để nộp đơn ứng tuyển.', 'error');
      openStudentTab('profile');
      return;
    }

    setApplyTargetJob(jobItem);
    setApplicationModalOpen(true);
  };

  // Handle Job Info Update (from JobDetailModal Edit mode)
  const handleUpdateJobInfo = async (updatedJob) => {
    setSelectedJob(prev => ({ ...prev, ...updatedJob }));
    showToast(`Đã lưu thay đổi thông tin tin tuyển dụng "${updatedJob.title}" thành công!`);
    if (typeof updatedJob.id === 'number' || !String(updatedJob.id).startsWith('emp-job-')) {
      try {
        await fetch(`${API_BASE}/jobs/${updatedJob.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser?.token}`
          },
          body: JSON.stringify(updatedJob)
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle Submit Review (Screen 13)
  const handleSubmitReview = async ({ rating, comment }) => {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          reviewee_id: 1, // Demo partner ID
          job_id: selectedJob?.id || 1,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Gửi đánh giá sau công việc thành công! Điểm uy tín đã được ghi nhận.');
      } else {
        showToast(data.message || 'Đã ghi nhận đánh giá thành công.');
      }
    } catch (err) {
      showToast('Đã ghi nhận đánh giá kiểm thử: ' + rating + ' sao.');
    }
  };

  // Filtered public jobs (Screen 6)
  const filteredJobs = jobs.filter(job => {
    const matchKeyword = !searchKeyword || job.title.toLowerCase().includes(searchKeyword.toLowerCase()) || (job.company_name || '').toLowerCase().includes(searchKeyword.toLowerCase());
    const matchCat = !selectedCategory || job.category === selectedCategory;
    const matchLoc = !selectedLocation || (job.location || '').toLowerCase().includes(selectedLocation.toLowerCase());
    const matchSaved = !showSavedOnly || savedJobIds.includes(job.id);

    // Mức lương: mỗi lựa chọn thuộc 1 loại hình (Part-time theo giờ/tháng, Full-time theo tháng)
    const matchSalary = matchesSalaryFilter(job, selectedSalary);

    // Kinh nghiệm filter (Section 4 specs)
    const matchExp = !selectedExperience || (() => {
      const text = `${job.requirements || ''} ${job.description || ''}`.toLowerCase();
      if (selectedExperience === 'NONE') return text.includes('không yêu cầu') || text.includes('sinh viên') || text.includes('thực tập') || !text.includes('kinh nghiệm');
      if (selectedExperience === 'UNDER_1Y') return text.includes('dưới 1 năm') || text.includes('mới tốt nghiệp') || text.includes('chưa có kinh nghiệm');
      if (selectedExperience === '1_2Y') return text.includes('1 năm') || text.includes('1-2') || text.includes('2 năm');
      if (selectedExperience === 'ABOVE_2Y') return text.includes('2-3') || text.includes('3 năm') || text.includes('trên 2 năm');
      return true;
    })();

    // Loại việc filter (WF-G01 / WF-G02 specs)
    const matchWorkType = !selectedWorkType || job.work_type === selectedWorkType;

    return matchKeyword && matchCat && matchLoc && matchSaved && matchSalary && matchExp && matchWorkType;
  });

  // Phân trang danh sách Tìm việc: 12 tin/trang, tổng số trang theo số tin sau khi lọc (ít nhất 1)
  const JOBS_PER_PAGE = 12;
  const jobsTotalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const jobsCurrentPage = Math.min(jobsPage, jobsTotalPages);
  const pagedJobs = filteredJobs.slice((jobsCurrentPage - 1) * JOBS_PER_PAGE, jobsCurrentPage * JOBS_PER_PAGE);
  const goToJobsPage = (page) => {
    setJobsPage(Math.min(Math.max(1, page), jobsTotalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Đổi bộ lọc → quay về trang 1
  useEffect(() => {
    setJobsPage(1);
  }, [searchKeyword, selectedCategory, selectedLocation, selectedSalary, selectedExperience, selectedWorkType, showSavedOnly]);

  // STANDALONE FULL-SCREEN COMING SOON VIEW (NO WEBSITE CHROME / SEPARATE SCREEN)
  if (activeTab === 'coming_soon') {
    const prevTab = comingSoonInfo.prevTab || 'home';
    const prevTabLabel = prevTab === 'register' 
      ? 'Đăng ký' 
      : prevTab === 'login' 
        ? 'Đăng nhập' 
        : prevTab === 'jobs' 
          ? 'Tìm việc làm' 
          : 'trang trước';

    return (
      <ComingSoonPage
        title={comingSoonInfo.title}
        description={comingSoonInfo.desc}
        prevTabLabel={prevTabLabel}
        onBack={() => {
          setActiveTab(prevTab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onGoHome={() => {
          setActiveTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  const navigateToSection = (sectionId) => {
    if (activeTab === 'home') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      setActiveTab('home');
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const el = document.getElementById(sectionId);
        if (el) {
          clearInterval(interval);
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 40);
        } else if (attempts > 35) {
          clearInterval(interval);
        }
      }, 35);
    }
  };

  // STANDALONE VIEW: REGISTER SUCCESS (WF-G08 - NO WEBSITE CHROME)
  if (activeTab === 'register_success') {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <AnimatedToast toast={toast} onClose={() => setToast(null)} />
        <RegisterSuccessPage
          user={registeredUser || currentUser}
          role={registeredUser?.role || currentUser?.role || 'STUDENT'}
          onNavigateLogin={() => {
            setActiveTab('login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateHome={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // STANDALONE VIEW: MẤT KẾT NỐI BACKEND → trang lỗi riêng thay vì banner trong trang chủ
  if (backendStatus.checked && !backendStatus.online) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <AnimatedToast toast={toast} onClose={() => setToast(null)} />
        <ErrorPage
          type="server"
          customMessage={backendStatus.message}
          retrying={retryingBackend}
          onRetry={async () => {
            setRetryingBackend(true);
            await handleCheckConnection(true);
            setRetryingBackend(false);
          }}
        />
      </div>
    );
  }

  // STANDALONE VIEW: UNIVERSAL ERROR PAGE 404 / 403 / EXPIRED (WF-X02 - NO WEBSITE CHROME)
  if (activeTab === 'error_page') {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <AnimatedToast toast={toast} onClose={() => setToast(null)} />
        <ErrorPage
          type={errorPageConfig.type || '404'}
          customMessage={errorPageConfig.message}
          onNavigateHome={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateJobs={() => {
            setActiveTab('jobs');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode || 'login');
            setAuthModalOpen(true);
          }}
        />
      </div>
    );
  }

  // STANDALONE DEDICATED AUTH PAGES (NO HEADER / NO FOOTER — MATCHING WIREFRAME & TOPCV REFERENCE)
  if (activeTab === 'login' || activeTab === 'register') {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F6F8', display: 'flex', flexDirection: 'column' }}>
        <AnimatedToast toast={toast} onClose={() => setToast(null)} />
        {activeTab === 'login' ? (
          <LoginPage 
            onLoginSuccess={(user) => handleAuthSuccess(user, false)}
            onCancel={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateRegister={() => {
              setActiveTab('register');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateHome={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateComingSoon={handleNavigateComingSoon}
            apiBase={API_BASE}
          />
        ) : (
          <RegisterPage
            onRegisterSuccess={(user) => handleAuthSuccess(user, true)}
            onCancel={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateLogin={() => {
              setActiveTab('login');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateHome={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateComingSoon={handleNavigateComingSoon}
            apiBase={API_BASE}
          />
        )}
      </div>
    );
  }


  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)', color: 'var(--color-text)' }}>
      {/* Toast Notification */}
      <AnimatedToast toast={toast} onClose={() => setToast(null)} />

      {/* ================= MAIN NAVBAR (Header matching Wireframe WF-G01 100% - Full Browser Width) ================= */}
      <header className="app-header" style={{
        background: '#ffffff',
        borderBottom: '1.5px solid #000000',
        padding: '0 36px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        width: '100%',
        minHeight: 74,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: 24,
          minHeight: 74
        }}>
          {/* Bên trái: Logo hình tròn + Text "JOBNEST" in đậm + Role badge (CHỈ HIỆN KHI ĐÃ ĐĂNG NHẬP CÓ TOKEN) */}
          <div 
            onClick={() => setActiveTab('home')}
            style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', flexShrink: 0 }}
          >
            {/* Logo hình tròn chứa Logo.jpg thật - Kích thước tăng lên 48px */}
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '2px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <img 
                src="/logo.jpg" 
                alt="JobNest Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerText = 'Logo';
                }}
              />
            </div>

            {/* Text "JOBNEST" in đậm - Kích thước tăng lên 24px */}
            <span style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#000000',
              letterSpacing: '-0.5px'
            }}>
              JOBNEST
            </span>

            {/* Role Badge - CHỈ HIỆN KHI ĐÃ ĐĂNG NHẬP (CÓ TOKEN) */}
            {currentUser?.token && currentUser?.role === 'STUDENT' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('student_dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: '#F1EEF8',
                  color: '#7565A8',
                  border: '1.5px solid #D8B4FE',
                  borderRadius: 20,
                  padding: '3px 12px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  letterSpacing: '0.2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Bấm để mở Quản lý tài khoản & Hoạt động Sinh viên"
              >
                Sinh viên
              </button>
            )}
            {currentUser?.token && currentUser?.role === 'EMPLOYER' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // nằm trong khối logo (bấm logo = về trang chủ)
                    setActiveTab('employer_dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    background: '#ECFDF5',
                    color: '#059669',
                    border: '1.5px solid #A7F3D0',
                    borderRadius: 20,
                    padding: '4px 14px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: '0.2px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Mở Bảng điều khiển Nhà tuyển dụng"
                >
                  Nhà tuyển dụng
                </button>

                {/* Nút + Đăng tin mới nằm ngay cạnh badge Nhà tuyển dụng chuẩn 100% Wireframe WF-E01 */}
                {isEmployerWorkspace && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // nằm trong khối logo (bấm logo = về trang chủ)
                      setEditingEmployerJob(null);
                      setActiveTab('create_job');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      background: '#ffffff',
                      color: '#000000',
                      border: '1.5px solid #000000',
                      borderRadius: 8,
                      padding: '5px 14px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                  >
                    + Đăng tin mới
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Ở giữa: Điều hướng Header - Tách biệt rõ ràng TRƯỜNG 1 (Workspace) vs TRƯỜNG 2 (Marketplace) */}
          {(isEmployerWorkspace || isAdminWorkspace) ? (
            /* TRƯỜNG 1: KHÔNG GIAN QUẢN LÝ (WORKSPACE) -> Tối giản header, ẩn các link Trang chủ, Việc làm, Danh mục */
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('jobs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: 22,
                  padding: '8px 20px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0F172A',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#EEF2F6';
                  e.currentTarget.style.borderColor = '#94A3B8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                title="Chuyển sang Trường 2: Không gian Nghiên cứu thị trường / Việc làm công khai"
              >
                <Search size={16} color="#059669" />
                <span>Khám phá thị trường</span>
                <span style={{
                  fontSize: 11,
                  background: '#DCFCE7',
                  color: '#15803D',
                  padding: '1px 8px',
                  borderRadius: 10,
                  fontWeight: 800
                }}>
                  Trường 2
                </span>
              </button>
            </div>
          ) : (
            /* TRƯỜNG 2: KHÔNG GIAN NGHIÊN CỨU & KHÁCH / SINH VIÊN -> Hiển thị đầy đủ menu công khai */
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              flexWrap: 'nowrap'
            }}>
              {/* Trang chủ */}
              <button
                type="button"
                onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: activeTab === 'home' ? 800 : 600,
                  color: activeTab === 'home' ? 'var(--color-primary, #7565A8)' : '#000000',
                  cursor: 'pointer',
                  padding: '8px 4px',
                  borderBottom: activeTab === 'home' ? '2.5px solid var(--color-primary, #7565A8)' : '2.5px solid transparent',
                  transition: 'color 0.15s ease, border-color 0.15s ease'
                }}
              >
                Trang chủ
              </button>

              {/* Tìm việc làm */}
              <button
                type="button"
                onClick={() => { setActiveTab('jobs'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: activeTab === 'jobs' ? 800 : 600,
                  color: activeTab === 'jobs' ? 'var(--color-primary, #7565A8)' : '#000000',
                  cursor: 'pointer',
                  padding: '8px 4px',
                  borderBottom: activeTab === 'jobs' ? '2.5px solid var(--color-primary, #7565A8)' : '2.5px solid transparent',
                  transition: 'color 0.15s ease, border-color 0.15s ease'
                }}
              >
                Tìm việc làm
              </button>

              {/* Việc làm theo lịch rảnh ✨ (SECTION 01 requirement) */}
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === 'STUDENT') {
                    openStudentTab('availability');
                  } else {
                    navigateToSection('schedule-matching');
                  }
                }}
                style={{
                  background: 'rgba(117, 101, 168, 0.08)',
                  border: '1px solid rgba(117, 101, 168, 0.25)',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--color-primary, #7565A8)',
                  cursor: 'pointer',
                  padding: '5px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(117, 101, 168, 0.16)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(117, 101, 168, 0.08)'}
                title="Khám phá cơ chế gợi ý việc làm theo thời gian rảnh"
              >
                <Sparkles size={14} color="#7565A8" />
                <span>Việc làm theo lịch rảnh</span>
              </button>

              {/* Giới thiệu ▼ (Dropdown thông tin & chính sách) */}
              <div 
                ref={introMenuRef} 
                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                onMouseEnter={handleIntroMouseEnter}
                onMouseLeave={handleIntroMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => handleNavigateAbout('about')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 15,
                    fontWeight: activeTab === 'about' ? 800 : (headerIntroMenuOpen ? 700 : 500),
                    color: (activeTab === 'about' || headerIntroMenuOpen) ? 'var(--color-primary, #7565A8)' : '#000000',
                    borderBottom: activeTab === 'about' ? '2.5px solid var(--color-primary, #7565A8)' : '2.5px solid transparent',
                    cursor: 'pointer',
                    padding: '8px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'color 0.15s ease, border-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary, #7565A8)'}
                  onMouseLeave={(e) => {
                    if (!headerIntroMenuOpen && activeTab !== 'about') e.currentTarget.style.color = '#000000';
                  }}
                >
                  <span>Giới thiệu</span>
                  <span style={{ fontSize: 10, transition: 'transform 0.2s ease', transform: headerIntroMenuOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
                </button>

                {headerIntroMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: '#ffffff',
                    border: '1.5px solid #111827',
                    borderRadius: 10,
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                    padding: '8px 6px',
                    minWidth: 260,
                    zIndex: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    {[
                      { 
                        label: 'Hướng dẫn sử dụng', 
                        desc: 'Quy trình 5 bước tìm việc dễ dàng',
                        action: () => handleNavigateAbout('guide')
                      },
                      { 
                        label: 'Về JobNest', 
                        desc: 'Sứ mệnh & giá trị cốt lõi',
                        action: () => handleNavigateAbout('about')
                      },
                      { 
                        label: 'Giới thiệu nền tảng', 
                        desc: 'Công nghệ & thuật toán khớp lịch',
                        action: () => handleNavigateAbout('platform')
                      },
                      { 
                        label: 'Liên hệ', 
                        desc: 'Hỗ trợ sinh viên & đối tác',
                        action: () => handleNavigateAbout('contact')
                      },
                      { 
                        label: 'Hỏi đáp (FAQ)', 
                        desc: 'Câu hỏi thường gặp',
                        action: () => handleNavigateAbout('faq')
                      },
                      { 
                        label: 'Thỏa thuận sử dụng', 
                        desc: 'Điều khoản dịch vụ',
                        action: () => handleNavigateAbout('terms')
                      },
                      { 
                        label: 'Quy định bảo mật', 
                        desc: 'Bảo vệ thông tin cá nhân',
                        action: () => handleNavigateAbout('privacy')
                      },
                      { 
                        label: 'Quy chế hoạt động sàn giao dịch', 
                        desc: 'Quy tắc & giải quyết tranh chấp',
                        action: () => handleNavigateAbout('regulations')
                      }
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.action}
                        style={{
                          background: 'none',
                          border: 'none',
                          borderRadius: 8,
                          padding: '9px 14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F2FA';
                          const title = e.currentTarget.querySelector('.intro-item-title');
                          if (title) title.style.color = '#7565A8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          const title = e.currentTarget.querySelector('.intro-item-title');
                          if (title) title.style.color = '#1F2937';
                        }}
                      >
                        <span className="intro-item-title" style={{ fontSize: 13.5, fontWeight: 700, color: '#1F2937', transition: 'color 0.15s ease' }}>
                          {item.label}
                        </span>
                        <span style={{ fontSize: 11.5, color: '#6B7280' }}>
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dành cho nhà tuyển dụng */}
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === 'EMPLOYER') {
                    setActiveTab('employer_dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setActiveTab('login');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#000000',
                  cursor: 'pointer',
                  padding: '8px 2px',
                  transition: 'color 0.15s ease'
                }}
              >
                Dành cho nhà tuyển dụng
              </button>
            </nav>
          )}

          {/* Bên phải: Nút action tăng kích thước (height 42px), chuẩn chuyên nghiệp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* TRƯỜNG 2: Nút ← Về trang Quản lý nổi bật khi Nhà tuyển dụng đang xem Marketplace */}
            {currentUser?.token && currentUser?.role === 'ADMIN' && !isAdminWorkspace && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: '#0F172A',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  height: 42,
                  padding: '0 18px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.35)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
              >
                <span>← Về Bảng Quản trị</span>
              </button>
            )}

            {currentUser?.token && currentUser?.role === 'EMPLOYER' && !isEmployerWorkspace && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('employer_dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  height: 42,
                  padding: '0 18px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(117, 101, 168, 0.35)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.08)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
              >
                <span>← Về trang Quản lý</span>
              </button>
            )}

            {/* Đăng tin tuyển dụng - CHỈ HIỆN KHI ĐÃ ĐĂNG NHẬP VỚI VAI TRÒ NHÀ TUYỂN DỤNG VÀ Ở TRƯỜNG 2 */}
            {currentUser?.token && currentUser?.role === 'EMPLOYER' && !isEmployerWorkspace && (
              <button
                type="button"
                onClick={() => setActiveTab('create_job')}
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  border: '1.5px solid #000000',
                  borderRadius: 8,
                  height: 42,
                  padding: '0 18px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
              >
                Đăng tin tuyển dụng
              </button>
            )}

            {currentUser?.token ? (
              /* When logged in: Notification Bell, Circular Avatar Logo, and Logout Button */
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Notification Bell */}
                <div style={{ position: 'relative' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: notificationsOpen ? '#F3F4F6' : '#ffffff',
                      color: '#000000',
                      border: '1.5px solid #000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Thông báo"
                  >
                    <Bell size={18} />
                    {headerUnreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        background: '#D95F68',
                        color: '#ffffff',
                        fontSize: 10,
                        fontWeight: 800,
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ffffff'
                      }}>
                        {headerUnreadCount > 9 ? '9+' : headerUnreadCount}
                      </span>
                    )}
                  </motion.button>
                  <NotificationsDropdown 
                    isOpen={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                    currentUser={currentUser}
                    onSelectNotification={handleOpenNotification}
                    onViewAll={() => (currentUser?.role === 'STUDENT' ? openStudentTab('notifications') : setActiveTab('notifications'))}
                  />
                </div>

                {/* Menu tài khoản: rê chuột vào avatar để mở, Đăng xuất nằm cuối menu */}
                <AccountMenu
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onNavigate={(tab) => {
                    if (currentUser?.role === 'STUDENT') {
                      setStudentDashNav(prev => ({ tab, n: prev.n + 1 }));
                      setActiveTab('student_dashboard');
                    } else if (currentUser?.role === 'EMPLOYER') {
                      setActiveTab('employer_dashboard');
                    } else {
                      setActiveTab('admin');
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            ) : (
              /* When GUEST (WF-G01 Screen): [Đăng nhập] (trắng viền đen) & [Đăng ký] (đen chữ trắng) - Kích thước tăng lên height 42px, font 14.5px */
              <>
                {/* Nút: Đăng nhập (nền trắng, viền đen) */}
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    border: '1.5px solid #000000',
                    borderRadius: 8,
                    height: 42,
                    padding: '0 20px',
                    fontSize: 14.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  Đăng nhập
                </button>

                {/* Nút: Đăng ký (nền đen, chữ trắng) */}
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{
                    background: '#000000',
                    color: '#ffffff',
                    border: '1.5px solid #000000',
                    borderRadius: 8,
                    height: 42,
                    padding: '0 22px',
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2B2B2B'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>

        {/* Global Navigation Tabs – Dành riêng cho Quản trị viên Admin (Cấu trúc Header -> Navigation -> Sidebar + Content) */}
        {currentUser?.token && currentUser?.role === 'ADMIN' && (
          <nav 
            className="app-nav-container" 
            style={{ 
              width: '100%', 
              maxWidth: 'none', 
              margin: 0, 
              padding: '8px 24px', 
              display: 'flex', 
              gap: 10, 
              alignItems: 'center',
              background: '#ffffff',
              borderTop: '1px solid #F1F5F9',
              boxSizing: 'border-box'
            }}
          >
            <Button 
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              variant={activeTab === 'home' ? 'primary' : 'secondary'}
              style={{ padding: '7px 16px', fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0, gap: 6 }}>
              <Home size={15} /> Trang chủ
            </Button>
            <Button 
              onClick={() => {
                setActiveTab('jobs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              variant={activeTab === 'jobs' ? 'primary' : 'secondary'}
              style={{ padding: '7px 16px', fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0, gap: 6 }}>
              <Search size={15} /> Tìm việc làm
            </Button>
            <Button 
              onClick={() => {
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              variant={activeTab === 'admin' ? 'primary' : 'secondary'}
              style={{ padding: '7px 16px', fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0, gap: 6 }}>
              <Shield size={15} /> Bảng Quản Trị
            </Button>
          </nav>
        )}
      </header>

      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      {/* FULL-WIDTH VIEWPORT CHO EMPLOYER WORKSPACE, MAX-WIDTH 1240 CHO CÁC KHU VỰC KHÁC */}
      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: (isEmployerWorkspace || isAdminWorkspace || isStudentWorkspace) ? 'none' : 1240,
        margin: (isEmployerWorkspace || isAdminWorkspace || isStudentWorkspace) ? 0 : '0 auto',
        padding: (isEmployerWorkspace || isAdminWorkspace || isStudentWorkspace) ? 0 : '28px 24px',
        boxSizing: 'border-box'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >

            {/* ========================================================================= */}
            {/* SCREEN 1 & 2: GIAO DIỆN ĐĂNG NHẬP / ĐĂNG KÝ (LOGIN PAGE)                 */}
            {/* ========================================================================= */}
            {activeTab === 'login' && (
              <LoginPage 
                onLoginSuccess={(user) => handleAuthSuccess(user, false)}
                onCancel={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateRegister={() => {
                  setActiveTab('register');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                apiBase={API_BASE}
              />
            )}

            {/* ========================================================================= */}
            {/* WF-G04: ĐĂNG KÝ TÀI KHOẢN (REGISTER PAGE)                                 */}
            {/* ========================================================================= */}
            {activeTab === 'register' && (
              <RegisterPage
                onRegisterSuccess={(user) => handleAuthSuccess(user, true)}
                onNavigateLogin={() => {
                  setActiveTab('login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onCancel={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                apiBase={API_BASE}
              />
            )}

            {/* ========================================================================= */}
            {/* WF-G01: TRANG CHỦ (HOME PAGE)                                             */}
            {/* ========================================================================= */}
            {activeTab === 'home' && (
              <HomePage
                jobs={jobs}
                loading={loading}
                currentUser={currentUser}
                onOpenStudentTab={openStudentTab}
                onSelectJob={handleNavigateToJobDetail}
                onApply={handleOpenApplyModal}
                isSaved={(id) => savedJobIds.includes(id)}
                onToggleSave={handleToggleSaveJob}
                onSearch={({ keyword, location, workType, category, salary, experience }) => {
                  setSearchKeyword(keyword || '');
                  setSelectedLocation(location || '');
                  if (category !== undefined) setSelectedCategory(category || '');
                  if (workType !== undefined) setSelectedWorkType(workType || '');
                  if (salary !== undefined) setSelectedSalary(salary || '');
                  if (experience !== undefined) setSelectedExperience(experience || '');
                  setActiveTab('jobs');
                  fetchJobs();
                }}
                onSelectCategory={(category) => {
                  setSelectedCategory(category);
                  setActiveTab('jobs');
                  fetchJobs();
                }}
                onPostJobClick={() => {
                  if (currentUser?.role === 'EMPLOYER') {
                    setActiveTab('create_job');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setActiveTab('login');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                onExploreAllJobs={() => setActiveTab('jobs')}
                onHoverStart={handlePreviewHoverStart}
                onHoverEnd={handlePreviewHoverEnd}
                onViewCompany={handleNavigateToEmployerProfile}
              />
            )}

            {/* ========================================================================= */}
            {/* TRUNG TÂM GIỚI THIỆU & QUY CHẾ (TRANG RÕ RÀNG, KHÔNG LÀM POPUP)           */}
            {/* ========================================================================= */}
            {activeTab === 'about' && (
              <AboutPage
                initialSection={aboutSection}
                currentUser={currentUser}
                onNavigateHome={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateJobs={() => {
                  setActiveTab('jobs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={(mode) => {
                  setActiveTab(mode === 'register' ? 'register' : 'login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showToast={showToast}
              />
            )}

            {/* ========================================================================= */}
            {/* SCREEN 6: TÌM KIẾM VIỆC LÀM (JOB SEARCH FEED)                             */}
            {/* ========================================================================= */}
            {activeTab === 'jobs' && (
              <div>
                {/* Search & Filter Hero Banner matching Screen 6 */}
                <div style={{
                  background: 'linear-gradient(135deg, #5C4B82 0%, #7565A8 55%, #927FB9 100%)',
                  borderRadius: 14,
                  border: '1px solid rgba(244, 185, 157, 0.35)',
                  padding: '32px 30px',
                  color: '#ffffff',
                  marginBottom: 28,
                  boxShadow: 'var(--shadow-lg)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--color-accent-bg)',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                        fontSize: 12,
                        padding: '4px 10px',
                        borderRadius: 6,
                        marginBottom: 10,
                        border: '1px solid var(--color-secondary)'
                      }}>
                        ✨ JobNest • Việc làm Part-time & Full-time Tin cậy
                      </span>
                      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                        TÌM KIẾM VIỆC LÀM PART-TIME & FULL-TIME
                      </h2>
                      <p style={{ color: 'var(--color-lavender-light)', fontSize: 13.5, margin: 0, maxWidth: 640, lineHeight: 1.5 }}>
                        Khám phá việc làm bán thời gian và toàn thời gian chất lượng dành riêng cho sinh viên trên hệ thống JobNest. Minh bạch thù lao, hợp đồng rõ ràng và bảo vệ quyền lợi sinh viên tối đa.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => { 
                          setSearchKeyword(''); 
                          setSelectedCategory(''); 
                          setSelectedLocation(''); 
                          setSelectedSalary('');
                          setSelectedExperience('');
                          setSelectedWorkType('');
                          fetchJobs(); 
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.16)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: 8,
                          padding: '6px 14px',
                          fontSize: 12.5,
                          cursor: 'pointer',
                          fontWeight: 600,
                          backdropFilter: 'blur(4px)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'}
                      >
                        XÓA BỘ LỌC
                      </button>
                    </div>
                  </div>

                  {/* Search Bar Grid (Tiêu đề, Ngành nghề, Địa điểm, Áp dụng bộ lọc) */}
                  <div className="search-filter-grid">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 6, minWidth: 0 }}>
                      <Search size={18} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
                      <input 
                        type="text" 
                        placeholder="Tìm kiếm theo vị trí, kỹ năng, công ty..." 
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !isImeComposing(e)) fetchJobs(); }}
                        style={{ border: 'none', width: '100%', padding: '8px 0', fontSize: 13.5, outline: 'none' }}
                      />
                    </div>

                    <CustomDropdown
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      placeholder={`Tất cả ngành nghề (${jobs.length})`}
                      icon={Briefcase}
                      searchable={true}
                      searchPlaceholder="Tìm ngành nghề..."
                      options={[
                        { value: '', label: `Tất cả ngành nghề (${jobs.length})` },
                        { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin' },
                        { value: 'Thiết kế đồ họa', label: 'Thiết kế đồ họa' },
                        { value: 'F&B / Dịch vụ ăn uống', label: 'F&B / Dịch vụ ăn uống' },
                        { value: 'Bán lẻ', label: 'Bán lẻ' },
                        { value: 'Logistics / Giao nhận', label: 'Logistics / Giao nhận' },
                        { value: 'Sản xuất / Kỹ thuật', label: 'Sản xuất / Kỹ thuật' },
                        { value: 'Giáo dục / Đào tạo', label: 'Giáo dục / Đào tạo' },
                        { value: 'Hàng tiêu dùng / FMCG', label: 'Hàng tiêu dùng / FMCG' },
                        { value: 'Tài chính / Kế toán', label: 'Tài chính / Kế toán' },
                        { value: 'Marketing & Sự kiện', label: 'Marketing & Sự kiện' },
                      ]}
                    />

                    <CustomDropdown
                      value={selectedLocation} 
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      placeholder="Tất cả khu vực"
                      icon={MapPin}
                      searchable={true}
                      searchPlaceholder="Tìm tỉnh thành..."
                      options={[
                        { value: '', label: 'Tất cả khu vực' },
                        { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
                        { value: 'Hà Nội', label: 'Hà Nội' },
                        { value: 'Đà Nẵng', label: 'Đà Nẵng' },
                        { value: 'Bình Dương', label: 'Bình Dương' },
                        { value: 'Đồng Nai', label: 'Đồng Nai' },
                        { value: 'Cần Thơ', label: 'Cần Thơ' },
                        { value: 'Hải Phòng', label: 'Hải Phòng' },
                        { value: 'Bà Rịa - Vũng Tàu', label: 'Bà Rịa - Vũng Tàu' },
                        { value: 'Thanh Hóa', label: 'Thanh Hóa' },
                      ]}
                    />

                    <Button onClick={fetchJobs} variant="primary" style={{ padding: '9px 20px', fontSize: 13, whiteSpace: 'nowrap' }}>
                      ÁP DỤNG BỘ LỌC
                    </Button>
                  </div>

                  {/* Secondary Quick Filters: Mức lương & Kinh nghiệm (Section 4 specs) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Filter size={14} color="#FFFFFF" /> Bộ lọc nhanh:
                    </span>

                    {/* Loại hình: Part-time / Full-time — quyết định các mức lương bên cạnh */}
                    <div style={{ width: 170 }}>
                      <CustomDropdown
                        size="sm"
                        value={selectedWorkType}
                        onChange={(e) => {
                          const next = e.target.value;
                          setSelectedWorkType(next);
                          // Mức lương đang chọn không thuộc loại hình mới → bỏ chọn
                          if (selectedSalary && selectedSalary !== 'NEGOTIABLE' && !salaryOptionsFor(next).some(o => o.value === selectedSalary)) {
                            setSelectedSalary('');
                          }
                        }}
                        placeholder="Tất cả loại hình"
                        icon={Briefcase}
                        triggerStyle={{
                          background: '#FFFFFF',
                          border: selectedWorkType ? '2px solid var(--color-secondary)' : '1px solid #FFFFFF',
                          boxShadow: '0 2px 8px rgba(41, 38, 58, 0.15)',
                          fontWeight: selectedWorkType ? 700 : 600,
                        }}
                        options={[
                          { value: '', label: 'Tất cả loại hình' },
                          { value: 'PART_TIME', label: 'Part-time (bán thời gian)' },
                          { value: 'FULL_TIME', label: 'Full-time (toàn thời gian)' },
                        ]}
                      />
                    </div>

                    {/* Mức lương Filter (đổi theo loại hình) */}
                    <div style={{ width: selectedWorkType ? 215 : 265 }}>
                      <CustomDropdown
                        size="sm"
                        value={selectedSalary}
                        onChange={(e) => setSelectedSalary(e.target.value)}
                        placeholder="Tất cả mức lương"
                        icon={DollarSign}
                        // Nền trắng đặc để nổi trên khung tím; viền cam khi đang lọc
                        triggerStyle={{
                          background: '#FFFFFF',
                          border: selectedSalary ? '2px solid var(--color-secondary)' : '1px solid #FFFFFF',
                          boxShadow: '0 2px 8px rgba(41, 38, 58, 0.15)',
                          fontWeight: selectedSalary ? 700 : 600,
                        }}
                        options={salaryOptionsFor(selectedWorkType)}
                      />
                    </div>

                    {/* Kinh nghiệm Filter */}
                    <div style={{ width: 215 }}>
                      <CustomDropdown
                        size="sm"
                        value={selectedExperience}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        placeholder="Tất cả kinh nghiệm"
                        triggerStyle={{
                          background: '#FFFFFF',
                          border: selectedExperience ? '2px solid var(--color-secondary)' : '1px solid #FFFFFF',
                          boxShadow: '0 2px 8px rgba(41, 38, 58, 0.15)',
                          fontWeight: selectedExperience ? 700 : 600,
                        }}
                        options={[
                          { value: '', label: 'Tất cả kinh nghiệm' },
                          { value: 'NONE', label: 'Không yêu cầu kinh nghiệm' },
                          { value: 'UNDER_1Y', label: 'Dưới 1 năm' },
                          { value: '1_2Y', label: '1 – 2 năm' },
                          { value: 'ABOVE_2Y', label: 'Trên 2 năm' },
                        ]}
                      />
                    </div>

                    {(selectedCategory || selectedLocation || selectedSalary || selectedExperience || selectedWorkType || searchKeyword) && (
                      <button
                        onClick={() => {
                          setSearchKeyword('');
                          setSelectedCategory('');
                          setSelectedLocation('');
                          setSelectedSalary('');
                          setSelectedExperience('');
                          setSelectedWorkType('');
                        }}
                        style={{
                          background: 'rgba(244, 185, 157, 0.22)',
                          border: '1px solid var(--color-secondary)',
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: 700,
                          borderRadius: 6,
                          padding: '5px 12px',
                          cursor: 'pointer',
                        }}
                      >
                        ✕ Xóa bộ lọc đang chọn
                      </button>
                    )}
                  </div>
                </div>

                {/* Job Listings Results Header & Saved Jobs Filter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={() => setShowSavedOnly(false)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 13.5,
                        fontWeight: !showSavedOnly ? 700 : 500,
                        background: !showSavedOnly ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: !showSavedOnly ? '#ffffff' : 'var(--color-text)',
                        border: '1px solid ' + (!showSavedOnly ? 'var(--color-primary)' : 'var(--color-border)'),
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>Tất cả việc làm</span>
                      <span style={{
                        background: !showSavedOnly ? 'rgba(255,255,255,0.2)' : 'var(--color-accent-bg)',
                        color: !showSavedOnly ? '#ffffff' : 'var(--color-primary)',
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700
                      }}>
                        {jobs.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setShowSavedOnly(true)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 13.5,
                        fontWeight: showSavedOnly ? 700 : 500,
                        background: showSavedOnly ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: showSavedOnly ? '#ffffff' : 'var(--color-text-secondary)',
                        border: '1px solid ' + (showSavedOnly ? 'var(--color-primary)' : 'var(--color-border)'),
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>❤️</span>
                      <span>Việc làm đã lưu</span>
                      <span style={{
                        background: showSavedOnly ? 'rgba(255,255,255,0.2)' : 'var(--color-accent-bg)',
                        color: showSavedOnly ? '#ffffff' : 'var(--color-primary)',
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700
                      }}>
                        {savedJobIds.length}
                      </span>
                    </button>
                  </div>

                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    Hiển thị <strong>{filteredJobs.length}</strong> vị trí phù hợp
                  </span>
                </div>

                {/* Job Cards Grid - Wireframe WF-G02: Loading Skeleton / Empty State / List */}
                {loading ? (
                  <JobListSkeleton count={6} />
                ) : filteredJobs.length === 0 ? (
                  <EmptyState
                    title={showSavedOnly ? 'Bạn chưa lưu việc làm nào' : 'Không tìm thấy công việc phù hợp với tiêu chí lọc'}
                    message={showSavedOnly ? 'Bấm biểu tượng trái tim "Lưu việc" ở góc mỗi card để xem lại sau.' : 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm Xóa bộ lọc bên dưới.'}
                    actionText="Xóa tất cả bộ lọc"
                    onAction={() => {
                      setSearchKeyword('');
                      setSelectedCategory('');
                      setSelectedLocation('');
                      setSelectedSalary('');
                      setSelectedExperience('');
                      setSelectedWorkType('');
                      setShowSavedOnly(false);
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: 16,
                  }}>
                    {pagedJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobIds.includes(job.id)}
                        onToggleSave={handleToggleSaveJob}
                        onSelectJob={handleNavigateToJobDetail}
                        onApply={handleOpenApplyModal}
                        onHoverStart={handlePreviewHoverStart}
                        onHoverEnd={handlePreviewHoverEnd}
                        onViewCompany={handleNavigateToEmployerProfile}
                      />
                    ))}
                  </div>
                )}

                {/* Quick Preview Hover Popup (Giai đoạn 2: Desktop) */}
                <JobQuickPreview
                  job={previewJob}
                  anchorRect={previewAnchorRect}
                  isOpen={isPreviewOpen}
                  onClose={closeQuickPreviewImmediate}
                  onMouseEnter={handlePreviewMouseEnter}
                  onMouseLeave={handlePreviewMouseLeave}
                  onSelectJob={handleNavigateToJobDetail}
                  onApply={(j) => {
                    closeQuickPreviewImmediate();
                    handleOpenApplyModal(j);
                  }}
                />

                {/* Phân trang: số trang tính theo số tin sau khi lọc */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 32,
                  paddingTop: 16,
                  borderTop: '1px solid var(--color-border)',
                }}>
                  <Button variant="secondary" style={{ padding: '6px 12px', fontSize: 12 }}
                    disabled={jobsCurrentPage <= 1} onClick={() => goToJobsPage(jobsCurrentPage - 1)}>
                    <ArrowLeft size={14} /> Trang trước
                  </Button>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }} aria-live="polite">
                    Trang {jobsCurrentPage} / {jobsTotalPages}
                  </span>
                  <Button variant="secondary" style={{ padding: '6px 12px', fontSize: 12 }}
                    disabled={jobsCurrentPage >= jobsTotalPages} onClick={() => goToJobsPage(jobsCurrentPage + 1)}>
                    Trang sau <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* JOB DETAIL PAGE: TRANG CHI TIẾT CÔNG VIỆC DÀNH RIÊNG (TOPCV UX PATTERN)   */}
            {/* ========================================================================= */}
            {activeTab === 'job_detail' && (
              <JobDetailPage
                jobId={viewingJobId || selectedJob?.id || 4}
                fallbackJob={selectedJob || jobs.find(j => j.id === (viewingJobId || 4)) || jobs[0]}
                isSaved={savedJobIds.includes(viewingJobId || selectedJob?.id || 4)}
                onToggleSave={handleToggleSaveJob}
                onBackToList={() => {
                  setActiveTab('jobs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onApply={handleOpenApplyModal}
                onEditJob={(jobToEdit) => {
                  setEditingEmployerJob(jobToEdit);
                  setActiveTab('create_job');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectRelatedJob={(relJob) => {
                  handleNavigateToJobDetail(relJob);
                }}
                onViewCompany={(jobOrEmployer) => {
                  handleNavigateToEmployerProfile(jobOrEmployer || (selectedJob || jobs[0]));
                }}
                onViewEmployerProfile={(jobOrEmployer) => {
                  handleNavigateToEmployerProfile(jobOrEmployer || (selectedJob || jobs[0]));
                }}
                onReportViolation={(targetJob) => {
                  const jobToReport = targetJob || selectedJob || jobs[0];
                  handleOpenReportModal('JOB', jobToReport?.id || 1, jobToReport?.title || 'Tin tuyển dụng');
                }}
                currentUser={currentUser}
                onOpenAuth={(mode, targetJob) => {
                  if (targetJob || selectedJob) {
                    setPendingApplyJob(targetJob || selectedJob);
                  }
                  setActiveTab('login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showToast={showToast}
              />
            )}

            {/* ========================================================================= */}
            {/* WF-G06: TRANG CÔNG KHAI CỦA NHÀ TUYỂN DỤNG (EMPLOYER PUBLIC PROFILE)        */}
            {/* ========================================================================= */}
            {activeTab === 'employer_public_profile' && (
              <EmployerPublicProfilePage
                employerId={selectedEmployerId}
                currentUser={currentUser}
                savedJobIds={savedJobIds}
                onToggleSave={handleToggleSaveJob}
                onNavigateHome={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateJobs={() => {
                  setActiveTab('jobs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectJob={handleNavigateToJobDetail}
                onOpenAuth={(mode, targetJob) => {
                  if (targetJob || selectedJob) {
                    setPendingApplyJob(targetJob || selectedJob);
                  }
                  setActiveTab('login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showToast={showToast}
              />
            )}

            {/* ========================================================================= */}
            {/* WF-S12: CHI TIẾT APPLICATION / PROPOSAL DÀNH CHO SINH VIÊN                 */}
            {/* ========================================================================= */}
            {activeTab === 'application_detail' && (
              <ApplicationDetailPage
                applicationId={selectedApplicationId || 1}
                currentUser={currentUser}
                onNavigateBack={() => {
                  setActiveTab('student_apps');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectJob={handleNavigateToJobDetail}
                showToast={showToast}
              />
            )}

            {/* ========================================================================= */}
            {/* WF-E13: XEM HỒ SƠ SINH VIÊN (DÀNH CHO NHÀ TUYỂN DỤNG)                     */}
            {/* ========================================================================= */}
            {activeTab === 'student_profile_view' && (
              <StudentProfileViewPage
                studentId={selectedStudentId || 1}
                currentUser={currentUser}
                onNavigateBack={() => {
                  setActiveTab('applicants');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showToast={showToast}
              />
            )}

            {/* ========================================================================= */}
            {/* WF-X03: CÀI ĐẶT TÀI KHOẢN & BẢO MẬT (ACCOUNT SETTINGS)                     */}
            {/* ========================================================================= */}
            {activeTab === 'account_settings' && currentUser?.role !== 'STUDENT' && currentUser?.role !== 'EMPLOYER' && (
              <AccountSettingsPage
                currentUser={currentUser}
                onNavigateBack={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showToast={showToast}
              />
            )}

            {/* ========================================================================= */}
            {/* WF-S01 & WF-S02: STUDENT DASHBOARD & APPLICATIONS (MANAGEMENT)            */}
            {/* ========================================================================= */}
            {(activeTab === 'student_apps' || activeTab === 'student_dashboard' || (activeTab === 'account_settings' && currentUser?.role === 'STUDENT')) && (
              <StudentDashboardPage
                currentUser={currentUser}
                jobs={jobs}
                initialTab={activeTab === 'account_settings' ? 'settings' : (activeTab === 'student_dashboard' ? studentDashNav.tab : 'applications')}
                onUserUpdate={(patch) => setCurrentUser(prev => (prev ? { ...prev, ...patch } : prev))}
                onOpenNotification={handleOpenNotification}
                navNonce={studentDashNav.n}
                onSelectJob={handleNavigateToJobDetail}
                onSelectApplication={(app) => handleNavigateToApplicationDetail(app.id)}
                onNavigateJobs={() => setActiveTab('jobs')}
                onNavigateComingSoon={handleNavigateComingSoon}
                showToast={showToast}
              />
            )}

{/* ========================================================================= */}
            {/* WORK ASSIGNMENTS: CÔNG VIỆC CỦA TÔI (STUDENT ASSIGNMENTS)                 */}
            {/* ========================================================================= */}
            {activeTab === 'student_assignments' && (
              <MyAssignmentsPage
                currentUser={currentUser}
                showToast={showToast}
                onOpenReview={(target) => {
                  setReviewTarget(target);
                  setReviewModalOpen(true);
                }}
              />
            )}

                        {/* ========================================================================= */}
            {/* WF-S02: HỒ SƠ CÁ NHÂN SINH VIÊN (STUDENT PROFILE)                         */}
            {/* ========================================================================= */}
            {activeTab === 'profile' && (
              currentUser?.role === 'STUDENT' ? (
                <StudentDashboardPage
                  currentUser={currentUser}
                  jobs={jobs}
                  initialTab="profile"
                  onUserUpdate={(patch) => setCurrentUser(prev => (prev ? { ...prev, ...patch } : prev))}
                onOpenNotification={handleOpenNotification}
                  onSelectJob={handleNavigateToJobDetail}
                  onNavigateJobs={() => setActiveTab('jobs')}
                  onNavigateComingSoon={handleNavigateComingSoon}
                  showToast={showToast}
                />
              ) : (
                <div style={{ maxWidth: 860, margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <span className="badge badge-primary" style={{ marginBottom: 6 }}>Hồ sơ người dùng</span>
                      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0' }}>HỒ SƠ CÁ NHÂN</h2>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: 13.5, margin: 0 }}>
                        Quản lý thông tin tài khoản cá nhân
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => setActiveTab('jobs')} style={{ padding: '6px 14px', fontSize: 12.5 }}>
                      <ArrowLeft size={14} /> Quay lại tìm việc
                    </Button>
                  </div>

                  <StudentProfileCard
                    currentUser={currentUser}
                    onCancel={() => setActiveTab('jobs')}
                    onSave={(data) => {
                      showToast(`Đã lưu thông tin hồ sơ cho: ${data.fullName}`);
                    }}
                    isModal={false}
                  />
                </div>
              )
            )}

{/* ========================================================================= */}
            {/* WF-E01 - WF-E13: CỔNG THÔNG TIN NHÀ TUYỂN DỤNG (EMPLOYER PORTAL)          */}
            {/* ========================================================================= */}
            {(activeTab === 'employer_dashboard' || 
              (currentUser?.role === 'EMPLOYER' && (
                activeTab === 'employer_jobs' ||
                activeTab === 'create_job' ||
                activeTab === 'applicants' ||
                activeTab === 'employer_assignments' ||
                activeTab === 'employer_profile' ||
                activeTab === 'account_settings'
              )) ||
              (activeTab === 'employer_jobs' && currentUser?.role !== 'EMPLOYER') ||
              (activeTab === 'create_job' && currentUser?.role !== 'EMPLOYER')
            ) && (
              <EmployerPortal
                currentUser={currentUser}
                initialTab={
                  activeTab === 'create_job' ? 'create_job' :
                  activeTab === 'employer_jobs' ? 'jobs' :
                  activeTab === 'applicants' ? 'applicants' :
                  activeTab === 'employer_assignments' ? 'assignments' :
                  activeTab === 'employer_profile' ? 'profile' :
                  activeTab === 'account_settings' ? 'settings' :
                  'dashboard'
                }
                initialEditingJob={editingEmployerJob}
                onNavigateHome={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateMarketplace={() => {
                  setActiveTab('jobs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateLogin={() => {
                  setActiveTab('login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showToast={showToast}
              />
            )}

            {/* ========================================================================= */}
            {/* NOTIFICATIONS PAGE: TRUNG TÂM THÔNG BÁO HỆ THỐNG                          */}
            {/* ========================================================================= */}
            {activeTab === 'notifications' && (
              currentUser?.role === 'EMPLOYER' ? (
                <EmployerPortal
                  currentUser={currentUser}
                  initialTab="notifications"
                  onNavigateHome={() => setActiveTab('home')}
                  onNavigateLogin={() => setActiveTab('login')}
                  showToast={showToast}
                />
              ) : (
                <NotificationsPage
                  currentUser={currentUser}
                  showToast={showToast}
                  onSelectNotification={handleOpenNotification}
                />
              )
            )}

            {/* ========================================================================= */}
            {/* SCREEN 5: ADMIN PORTAL (QUẢN LÝ NGƯỜI DÙNG & KIỂM DUYỆT TIN ĐĂNG)          */}
            {/* ========================================================================= */}
            {/* ========================================================================= */}
            {/* WF-A01 - WF-A08: CỔNG THÔNG TIN QUẢN TRỊ VIÊN (ADMIN PORTAL)              */}
            {/* ========================================================================= */}
            {activeTab === 'admin' && (
              <AdminPortal
                currentUser={currentUser}
                initialTab="dashboard"
                onNavigateHome={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateMarketplace={() => {
                  setActiveTab('jobs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateLogin={() => {
                  setActiveTab('login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showToast={showToast}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* MODAL DIALOGS MATCHING WIREFRAME SCREENS                                  */}
      {/* ========================================================================= */}

      {/* WF-S06: ĐƠN ỨNG TUYỂN PART-TIME / FULL-TIME (APPLICATION FORM) */}
      <ApplicationModal
        isOpen={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
        job={applyTargetJob || selectedJob}
        currentUser={currentUser}
        onSuccess={() => {
          setActiveTab('student_apps');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        showToast={showToast}
      />

      {/* SCREEN 7: CHI TIẾT TUYỂN DỤNG & NỘP CV */}
      <JobDetailModal
        isOpen={jobDetailModalOpen}
        onClose={() => setJobDetailModalOpen(false)}
        job={selectedJob}
        onApply={handleApplyFromModal}
        currentUser={currentUser}
        onUpdateJob={handleUpdateJobInfo}
        onViewCompany={() => { setJobDetailModalOpen(false); handleNavigateToEmployerProfile(selectedJob); }}
        onEditJob={(jobToEdit) => {
          setEditingEmployerJob(jobToEdit);
          setJobDetailModalOpen(false);
          setActiveTab('create_job');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onViewApplicants={() => {
          setJobDetailModalOpen(false);
          setActiveTab('applicants');
        }}
      />

      {/* SCREEN 13: FORM ĐÁNH GIÁ ỨNG VIÊN / NHÀ TUYỂN DỤNG (UC-09) */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        targetName={reviewTarget.targetName}
        targetRole={reviewTarget.targetRole}
        jobTitle={reviewTarget.jobTitle}
        jobTime={reviewTarget.jobTime}
        onSubmitReview={handleSubmitReview}
      />



      {/* SCREEN 3: QUÊN MẬT KHẨU */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onSwitchToLogin={() => {
          setForgotPasswordOpen(false);
          setActiveTab('login');
        }}
      />

      {/* SCREEN 1 & 2: MODAL POPUP ĐĂNG NHẬP / ĐĂNG KÝ */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onLoginSuccess={(user) => handleAuthSuccess(user, false)} 
        onRegisterSuccess={(user) => handleAuthSuccess(user, true)}
        initialMode={authModalMode} 
        apiBase={API_BASE} 
      />

      {/* MODAL POPUP: XÁC NHẬN ĐĂNG KÝ THÀNH CÔNG (THEO YÊU CẦU & WF-G08) */}
      {registerSuccessModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            border: '2px solid #000000',
            maxWidth: 480,
            width: '100%',
            padding: '32px 28px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#DCFCE7',
              border: '2px solid #16A34A',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: 36,
              fontWeight: 800
            }}>
              ✓
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
              Đăng ký thành công!
            </h3>

            <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Chúc mừng <strong>{registeredUser?.full_name || currentUser?.full_name}</strong>! Tài khoản của bạn đã được khởi tạo và <strong>tự động đăng nhập sẵn</strong> vào hệ thống.
            </p>

            <div style={{
              background: '#F8FAFC',
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              padding: '14px 16px',
              fontSize: 13,
              color: '#334155',
              marginBottom: 24,
              textAlign: 'left',
              lineHeight: 1.6
            }}>
              <div>• <strong>Vai trò:</strong> {registeredUser?.role === 'EMPLOYER' ? 'Nhà tuyển dụng' : 'Sinh viên tìm việc'}</div>
              <div>• <strong>Email:</strong> {registeredUser?.email || currentUser?.email}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: 6 }}>
                💡 <strong>Bước tiếp theo:</strong> {registeredUser?.role === 'EMPLOYER' ? 'Đăng tin tuyển dụng và tìm kiếm ứng viên tiềm năng!' : 'Hoàn thiện hồ sơ & tải CV để sẵn sàng nộp đơn ứng tuyển!'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setRegisterSuccessModalOpen(false);
                  const targetTab = (registeredUser?.role === 'EMPLOYER' || currentUser?.role === 'EMPLOYER') ? 'employer_dashboard' : 'home';
                  setActiveTab(targetTab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#7565A8',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(117, 101, 168, 0.3)'
                }}
              >
                {(registeredUser?.role === 'EMPLOYER' || currentUser?.role === 'EMPLOYER') ? 'Vào cổng Nhà tuyển dụng ngay' : 'Vào trang chủ ngay (Đã đăng nhập)'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegisterSuccessModalOpen(false);
                  setCurrentUser(null);
                  setActiveTab('login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  width: '100%',
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: '1px solid #CBD5E1',
                  background: '#ffffff',
                  color: '#64748B',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Chuyển qua Đăng nhập tài khoản khác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= COMPREHENSIVE RESTRUCTURED FOOTER ================= */}
      {/* QUY TẮC HIỂN THỊ ROUTE-BASED (FT-01 đến FT-15): CHỈ RENDER TẠI KHÁM PHÁ THỊ TRƯỜNG, TUYỆT ĐỐI ẨN TRONG EMPLOYER PORTAL */}
      {!isEmployerOperationalScreen && isMarketDiscoveryRoute && (
        <Footer
          onSelectCategory={(category) => {
            setSelectedCategory(category);
            setActiveTab('jobs');
            setTimeout(() => fetchJobs(), 50);
          }}
          onSelectLocation={(location) => {
            setSelectedLocation(location);
            setActiveTab('jobs');
            setTimeout(() => fetchJobs(), 50);
          }}
          onSelectWorkType={(workType) => {
            setActiveTab('jobs');
            showToast(`Đã lọc danh sách theo: ${workType === 'PART_TIME' ? 'Việc làm bán thời gian' : 'Việc làm toàn thời gian'}`);
          }}
          onNavigateTab={(tab) => {
            if (tab === 'create_job' && currentUser?.role !== 'EMPLOYER') {
              handleQuickLogin('techcorp@gmail.com', 'Nhà tuyển dụng');
            } else if (tab === 'student_apps' && currentUser?.role !== 'STUDENT') {
              handleQuickLogin('nguyen.van.chi@vlu.edu.vn', 'Sinh viên');
            }
            setActiveTab(tab);
          }}
          onOpenStudentProfile={() => (currentUser?.role === 'STUDENT' ? openStudentTab('profile') : setActiveTab('login'))}
          onOpenEmployerProfile={() => setActiveTab(currentUser?.role === 'EMPLOYER' ? 'employer_profile' : 'login')}
          onOpenSupport={() => setSupportModalOpen(true)}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode || 'login');
            setAuthModalOpen(true);
          }}
          onNavigateComingSoon={handleNavigateComingSoon}
          onNavigateAbout={handleNavigateAbout}
          currentUser={currentUser}
        />
      )}

      {/* FLOATING ACTION BUTTONS (Back to top, Quick Support, Notifications) */}
      <FloatingActions
        onOpenSupport={() => setSupportModalOpen(true)}
      />

      {/* SUPPORT & HOTLINE MODAL */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        currentUser={currentUser}
      />

      {/* WF-X01: MODAL BÁO CÁO VI PHẠM (REPORT VIOLATION MODAL) */}
      <ReportViolationModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType={reportModalTarget.type}
        targetId={reportModalTarget.id}
        targetTitle={reportModalTarget.title}
        currentUser={currentUser}
        showToast={showToast}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setAuthModalOpen(true);
        }}
      />
    </div>
  );
}
