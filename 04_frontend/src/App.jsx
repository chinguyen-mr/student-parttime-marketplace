import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, User, Shield, MapPin, DollarSign, Send, LogIn, 
  PlusCircle, Building2, Bell, Star, Eye, ArrowLeft, ArrowRight,
  ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, FileText, Download, Check, Users, Briefcase, Filter,
  AlertCircle, RefreshCw, Sparkles, Home, LayoutDashboard, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, AnimatedToast, AnimatedModal, CustomDropdown } from './components/ui';
import AuthModal from './components/AuthModal';
import ApplicationModal from './components/forms/ApplicationModal';
import ProposalModal from './components/forms/ProposalModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotificationsDropdown from './components/NotificationsDropdown';
import JobDetailModal from './components/JobDetailModal';
import ReviewModal from './components/ReviewModal';
import StudentProfileModal, { StudentProfileCard } from './components/StudentProfileModal';
import EmployerProfileModal from './components/EmployerProfileModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import Footer from './components/Footer';
import AccountMenu from './components/layout/AccountMenu';
import { applyBlockReason, salaryOptionsFor, matchesSalaryFilter } from './utils/jobDisplay';
import FloatingActions from './components/FloatingActions';
import PolicyModal from './components/PolicyModal';
import SupportModal from './components/SupportModal';
import ComingSoonPage from './pages/ComingSoonPage';
import HomePage from './pages/HomePage';
import JobCard from './components/JobCard';
import { JobListSkeleton, EmptyState } from './components/common';
import JobQuickPreview from './components/JobQuickPreview';
import JobDetailPage from './pages/JobDetailPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import MyProposalsPage from './pages/student/MyProposalsPage';
import EmployerProposalsPage from './pages/employer/EmployerProposalsPage';
import MyAssignmentsPage from './pages/student/MyAssignmentsPage';
import EmployerAssignmentsPage from './pages/employer/EmployerAssignmentsPage';
import EmployerDashboardPage from './pages/employer/EmployerDashboardPage';
import EmployerPortal from './pages/EmployerPortal';
import AdminPortal from './pages/admin/AdminPortal';
import NotificationsPage from './pages/student/NotificationsPage';
import AboutPage from './pages/guest/AboutPage';
import EmployerPublicProfilePage from './pages/guest/EmployerPublicProfilePage';
import StaticContentPage from './pages/guest/StaticContentPage';
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
const PUBLIC_TABS = ['home', 'jobs', 'about', 'static_content', 'job_detail', 'employer_public_profile', 'coming_soon', 'login', 'register'];
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

// Wireframe Screen 8: Default 12 Applications matching wireframe tabs
// Tất cả (12) = Chờ duyệt (3) + Đã duyệt (4) + Bị từ chối (2) + Hoàn thành (3)
export const DEFAULT_STUDENT_APPLICATIONS = [
  {
    id: 'app-seed-1',
    employer_name: 'ABC',
    job_title: 'Kế toán',
    location: 'tp.hcm',
    applied_at: '2020-11-20T08:30:00Z',
    cv_file: 'CV_Ketoan_hoten',
    status: 'ACCEPTED',
    note: 'Hồ sơ đã được phê duyệt. Mời bạn tham gia nhận việc.'
  },
  {
    id: 'app-seed-2',
    employer_name: 'TechCorp Vietnam',
    job_title: 'Lập trình viên Frontend React.js Part-time',
    location: 'Quận 1, TP.HCM',
    applied_at: '2026-10-23T14:20:00Z',
    cv_file: 'CV_NguyenVanChi_IT',
    status: 'PENDING',
    note: 'Nhà tuyển dụng đang đánh giá CV của bạn'
  },
  {
    id: 'app-seed-3',
    employer_name: 'Highlands Coffee',
    job_title: 'Nhân viên pha chế Barista ca linh hoạt',
    location: 'Bình Thạnh, TP.HCM',
    applied_at: '2026-10-22T08:15:00Z',
    cv_file: 'CV_NguyenVanChi_FNB',
    status: 'ACCEPTED',
    note: 'Đã chấp nhận hồ sơ, mời bạn tham gia training'
  },
  {
    id: 'app-seed-4',
    employer_name: 'Shopee Express',
    job_title: 'Điều phối viên kho vận Hub ca tối',
    location: 'Tân Bình, TP.HCM',
    applied_at: '2026-10-20T16:45:00Z',
    cv_file: 'CV_NguyenVanChi',
    status: 'REJECTED',
    note: 'Đã đủ số lượng ứng viên cho đợt tuyển này'
  },
  {
    id: 'app-seed-5',
    employer_name: 'FPT Software',
    job_title: 'Thực tập sinh Tester / QC Part-time',
    location: 'TP. Thủ Đức, TP.HCM',
    applied_at: '2026-10-18T10:00:00Z',
    cv_file: 'CV_NguyenVanChi_IT',
    status: 'COMPLETED',
    note: 'Dự án đã hoàn thành, hãy để lại đánh giá!'
  },
  {
    id: 'app-seed-6',
    employer_name: 'The Coffee House',
    job_title: 'Thu ngân & Phục vụ part-time cuối tuần',
    location: 'Quận 3, TP.HCM',
    applied_at: '2026-10-15T11:30:00Z',
    cv_file: 'CV_NguyenVanChi_FNB',
    status: 'PENDING',
    note: 'Đang chờ quản lý cửa hàng xét duyệt hồ sơ'
  },
  {
    id: 'app-seed-7',
    employer_name: 'VNG Corporation',
    job_title: 'Cộng tác viên Sự kiện Game Fest 2026',
    location: 'Quận 7, TP.HCM',
    applied_at: '2026-10-12T13:00:00Z',
    cv_file: 'CV_NguyenVanChi_Event',
    status: 'ACCEPTED',
    note: 'Đã duyệt tham gia ban tổ chức sự kiện'
  },
  {
    id: 'app-seed-8',
    employer_name: 'Katinat Saigon Kafe',
    job_title: 'Nhân viên Phục vụ Ca tối Part-time',
    location: 'Quận 1, TP.HCM',
    applied_at: '2026-10-10T18:20:00Z',
    cv_file: 'CV_NguyenVanChi',
    status: 'REJECTED',
    note: 'Lịch học chưa phù hợp với ca làm việc yêu cầu'
  },
  {
    id: 'app-seed-9',
    employer_name: 'Vinamilk',
    job_title: 'Trợ lý Truyền thông Nội bộ Part-time',
    location: 'Quận 7, TP.HCM',
    applied_at: '2026-10-08T08:45:00Z',
    cv_file: 'CV_NguyenVanChi_Media',
    status: 'COMPLETED',
    note: 'Chiến dịch đã kết thúc thành công, vui lòng đánh giá'
  },
  {
    id: 'app-seed-10',
    employer_name: 'Grab Vietnam',
    job_title: 'Cộng tác viên Hỗ trợ Đối tác Tài xế',
    location: 'Quận 10, TP.HCM',
    applied_at: '2026-10-05T15:10:00Z',
    cv_file: 'CV_NguyenVanChi',
    status: 'PENDING',
    note: 'Hồ sơ đang chờ phòng nhân sự phân ca'
  },
  {
    id: 'app-seed-11',
    employer_name: 'Tiki Corporation',
    job_title: 'Cộng tác viên Kiểm duyệt Sản phẩm',
    location: 'Tân Bình, TP.HCM',
    applied_at: '2026-10-02T09:00:00Z',
    cv_file: 'CV_NguyenVanChi',
    status: 'ACCEPTED',
    note: 'Đã phê duyệt tài khoản cộng tác viên'
  },
  {
    id: 'app-seed-12',
    employer_name: 'VNPAY',
    job_title: 'Hỗ trợ Triển khai Mã QR Điểm bán',
    location: 'Phú Nhuận, TP.HCM',
    applied_at: '2026-09-28T14:30:00Z',
    cv_file: 'CV_NguyenVanChi',
    status: 'COMPLETED',
    note: 'Đợt triển khai hoàn thành tốt đẹp'
  }
];

// Wireframe Screen 10: Default Employer Jobs matching wireframe screenshot
// Row 1 MUST BE: Kế toán | 20/11/2020 | 10 ứng viên | Đang tuyển
export const DEFAULT_EMPLOYER_JOBS = [
  {
    id: 'emp-job-1',
    title: 'Kế toán',
    created_at: '2020-11-20T08:00:00Z',
    applicant_count: 10,
    total_applicants: 10,
    status: 'OPEN',
    category: 'Tài chính / Kế toán',
    location: 'Quận 1, TP.HCM',
    salary: 40000,
    salary_type: 'HOURLY',
    work_type: 'PART_TIME',
    description: 'Hỗ trợ kiểm tra chứng từ kế toán, nhập liệu hóa đơn đầu vào - đầu ra trên phần mềm MISA, đối soát thu chi nội bộ và lưu trữ sổ sách.',
    requirements: 'Sinh viên năm 3 hoặc năm 4 chuyên ngành Kế toán / Kiểm toán / Tài chính. Cẩn thận, trung thực, sử dụng tốt Excel căn bản.',
    work_days: 'Thứ 2 - Thứ 6 (Linh hoạt chọn ca)',
    work_shift: 'Ca sáng (08:00 - 12:00) hoặc Ca chiều (13:30 - 17:30)',
    deadline: '2026-11-30',
    contact_info: 'hr@abc-corp.vn - 028 3822 1234'
  },
  {
    id: 'emp-job-2',
    title: 'Lập trình viên Frontend React.js Part-time',
    created_at: '2026-10-23T09:00:00Z',
    applicant_count: 8,
    total_applicants: 8,
    status: 'OPEN',
    category: 'Công nghệ thông tin',
    location: 'Quận 1, TP.HCM',
    salary: 50000,
    salary_type: 'HOURLY',
    work_type: 'PART_TIME',
    description: 'Phát triển các giao diện người dùng bằng React, Tailwind CSS / Vanilla CSS, tích hợp RESTful API cho hệ sinh thái tuyển dụng.',
    requirements: 'Sinh viên ngành CNTT/KTPM, nắm vững Javascript ES6, React Hooks, HTML/CSS.',
    work_days: 'Thứ 2 - Thứ 6 (Tối thiểu 20h/tuần)',
    work_shift: 'Linh hoạt theo lịch học của sinh viên',
    deadline: '2026-11-25',
    contact_info: 'hr@techcorp.vn - 0909 123 456'
  },
  {
    id: 'emp-job-3',
    title: 'Nhân viên Pha chế Barista Ca linh hoạt',
    created_at: '2026-10-15T10:30:00Z',
    applicant_count: 14,
    total_applicants: 14,
    status: 'OPEN',
    category: 'Nhà hàng / F&B',
    location: 'Bình Thạnh, TP.HCM',
    salary: 28000,
    salary_type: 'HOURLY',
    work_type: 'PART_TIME',
    description: 'Pha chế cà phê, trà sữa theo công thức chuẩn; duy trì vệ sinh khu vực quầy bar; hỗ trợ phục vụ khách hàng.',
    requirements: 'Chăm chỉ, nhanh nhẹn, vui vẻ, có thể xoay ca theo lịch học.',
    work_days: 'Thứ 2 - Chủ Nhật (Đăng ký lịch hàng tuần)',
    work_shift: 'Ca sáng (06:30 - 11:30) | Ca chiều (12:00 - 17:00)',
    deadline: '2026-11-20',
    contact_info: 'tuyendung@highlands.com.vn'
  },
  {
    id: 4,
    title: 'Triển Khai Kỹ Thuật Thi Công (Nội Thất Văn Phòng)',
    created_at: '2026-10-25T08:30:00Z',
    applicant_count: 5,
    total_applicants: 5,
    status: 'OPEN',
    category: 'Thiết kế đồ họa',
    location: 'Quận 1, TP. Hồ Chí Minh',
    salary: 18000000,
    salary_type: 'MONTHLY',
    work_type: 'FULL_TIME',
    level: 'Nhân viên kỹ thuật',
    experience: 'Tối thiểu 02 năm',
    education: 'Cao đẳng / Đại học chuyên ngành Kiến trúc, Nội thất',
    headcount: 2,
    deadline: '2026-12-15',
    work_schedule: 'Thứ 2 – Thứ 7 (08:30 – 18:00, Nghỉ trưa 12:00 – 13:30; Thứ 7 làm việc cách tuần)',
    description: '• Triển khai bản vẽ kỹ thuật 2D chi tiết cho các dự án nội thất văn phòng và thương mại.\n• Thể hiện đầy đủ và chính xác thông tin vật liệu, phụ kiện, quy cách kỹ thuật phục vụ gia công sản xuất.\n• Triển khai hồ sơ shopdrawing, phối hợp bóc tách khối lượng vật tư và cấu kiện thi công.\n• Phối hợp chặt chẽ với bộ phận thiết kế ý tưởng và đội ngũ kỹ sư giám sát tại công trình.\n• Thực hiện các công việc chuyên môn khác liên quan theo sự phân công của Trưởng bộ phận Kỹ thuật.',
    requirements: '• Tối thiểu 02 năm kinh nghiệm ở vị trí triển khai kỹ thuật / shopdrawing nội thất văn phòng.\n• Có kinh nghiệm thực tế triển khai hoàn thiện hồ sơ thi công nội thất, fit-out thương mại.\n• Am hiểu sâu về cấu tạo đồ gỗ nội thất, vật liệu mới và các phụ kiện kỹ thuật hiện đại.\n• Có khả năng đọc hiểu bản vẽ hệ thống M&E cơ bản để phối hợp ăn khớp trên mặt bằng.\n• Sử dụng thành thạo AutoCAD 2D, SketchUp; ưu tiên ứng viên biết thêm Revit hoặc 3dsMax.',
    benefits: '• Mức lương cạnh tranh: 15.000.000 – 20.000.000 VNĐ/tháng theo năng lực thực tế.\n• Hoa hồng hấp dẫn theo từng hợp đồng thi công bàn giao thành công.\n• Đầy đủ chế độ BHXH, BHYT, BHTN theo đúng quy định của Luật Lao động.\n• Hoạt động Team building, du lịch nghỉ dưỡng hàng năm, khám sức khỏe định kỳ.\n• Thưởng các ngày lễ tết, lương tháng 13 và xét duyệt tăng lương định kỳ.',
    contact_info: 'tuyendung@techcorp.vn'
  },
  {
    id: 'emp-job-4',
    title: 'Thực tập sinh Marketing / Content Social',
    created_at: '2026-10-10T14:15:00Z',
    applicant_count: 12,
    total_applicants: 12,
    status: 'CLOSED',
    category: 'Marketing / Truyền thông',
    location: 'Quận 3, TP.HCM',
    salary: 35000,
    salary_type: 'HOURLY',
    work_type: 'PART_TIME',
    description: 'Lên ý tưởng và viết bài cho Fanpage, TikTok; hỗ trợ thiết kế ảnh cơ bản bằng Canva; theo dõi tương tác bài đăng.',
    requirements: 'Sinh viên ngành Marketing, Báo chí, Ngôn ngữ. Có khả năng sáng tạo nội dung tốt.',
    work_days: 'Thứ 3, 5, 7',
    work_shift: '08:30 - 12:30',
    deadline: '2026-10-30',
    contact_info: 'recruitment@brandsolutions.vn'
  },
  {
    id: 'emp-job-5',
    title: 'Cộng tác viên Sự kiện Game Fest 2026',
    created_at: '2026-10-05T08:00:00Z',
    applicant_count: 18,
    total_applicants: 18,
    status: 'CLOSED',
    category: 'Tổ chức sự kiện',
    location: 'Quận 7, TP.HCM',
    salary: 350000,
    salary_type: 'DAILY',
    work_type: 'PART_TIME',
    description: 'Hỗ trợ check-in khách mời sự kiện, hướng dẫn tham quan booth trải nghiệm game, phát quà lưu niệm.',
    requirements: 'Năng động, nhiệt tình, ngoại hình sáng, giao tiếp tốt.',
    work_days: 'Thứ 7 & Chủ Nhật',
    work_shift: '08:00 - 18:00',
    deadline: '2026-10-15',
    contact_info: 'event@vng.com.vn'
  },
  {
    id: 'emp-job-6',
    title: 'Cộng tác viên Nhập liệu & Hỗ trợ Văn phòng',
    created_at: '2026-09-28T11:20:00Z',
    applicant_count: 6,
    total_applicants: 6,
    status: 'OPEN',
    category: 'Hành chính / Văn phòng',
    location: 'Tân Bình, TP.HCM',
    salary: 30000,
    salary_type: 'HOURLY',
    work_type: 'PART_TIME',
    description: 'Nhập dữ liệu thông tin khách hàng vào hệ thống CRM, scan tài liệu và sắp xếp hồ sơ hành chính.',
    requirements: 'Cẩn thận, tốc độ đánh máy khá, bảo mật thông tin.',
    work_days: 'Thứ 2, 4, 6',
    work_shift: '13:30 - 17:30',
    deadline: '2026-11-15',
    contact_info: 'admin@logisticshub.vn'
  },
  {
    id: 'emp-job-7',
    title: 'Gia sư Tiếng Anh Giao tiếp Buổi tối',
    created_at: '2026-09-20T16:00:00Z',
    applicant_count: 5,
    total_applicants: 5,
    status: 'CLOSED',
    category: 'Gia sư / Giáo dục',
    location: 'Quận 10, TP.HCM',
    salary: 120000,
    salary_type: 'HOURLY',
    work_type: 'PART_TIME',
    description: 'Kèm cặp giao tiếp tiếng Anh cơ bản cho học sinh lớp 8-9, củng cố ngữ pháp và rèn luyện phát âm chuẩn.',
    requirements: 'Sinh viên Đại học Sư phạm / Ngoại ngữ, IELTS 6.5+ hoặc tương đương.',
    work_days: 'Thứ 3 & Thứ 5',
    work_shift: '18:30 - 20:30',
    deadline: '2026-10-05',
    contact_info: 'contact@englishclub.edu.vn'
  }
];

// Seed 10 applicants for Kế toán job (Screen 10 -> Screen 12)
export const DEFAULT_APPLICANTS_KETOAN = [
  { id: 'app-kt-1', student_name: 'Nguyễn Văn Chí', student_email: 'nguyen.van.chi@vlu.edu.vn', student_phone: '0901234567', university: 'Đại học Văn Lang', major: 'Kế toán - Kiểm toán', applied_at: '2020-11-20T10:15:00Z', status: 'PENDING', cv_url: '/uploads/cv_ketoan_nguyen_van_chi.pdf', cover_letter: 'Em là sinh viên năm 3 ngành Kế toán - Kiểm toán, đã có chứng chỉ MISA và kinh nghiệm thực hành sổ sách.' },
  { id: 'app-kt-2', student_name: 'Trần Thị Thu Thảo', student_email: 'thao.tran@vlu.edu.vn', student_phone: '0912345678', university: 'Đại học Kinh tế TP.HCM', major: 'Kế toán doanh nghiệp', applied_at: '2020-11-20T11:30:00Z', status: 'ACCEPTED', cv_url: '/uploads/cv_ketoan_tran_thi_thu_thao.pdf', cover_letter: 'Em mong muốn được làm quen môi trường thực tế tại vị trí Kế toán part-time của công ty.' },
  { id: 'app-kt-3', student_name: 'Lê Hoàng Long', student_email: 'long.le@huflit.edu.vn', student_phone: '0988776655', university: 'Đại học Ngoại ngữ - Tin học', major: 'Tài chính - Ngân hàng', applied_at: '2020-11-21T09:00:00Z', status: 'PENDING', cv_url: '/uploads/cv_ketoan_le_hoang_long.pdf', cover_letter: 'Em đã hoàn thành các học phần kế toán doanh nghiệp và có thể làm việc ngay.' },
  { id: 'app-kt-4', student_name: 'Phạm Minh Trang', student_email: 'trang.pham@hcmue.edu.vn', student_phone: '0977665544', university: 'ĐH Sư phạm TP.HCM', major: 'Toán ứng dụng & Tài chính', applied_at: '2020-11-21T14:20:00Z', status: 'ACCEPTED', cv_url: '/uploads/cv_ketoan_pham_minh_trang.pdf', cover_letter: 'Em muốn ứng tuyển vị trí này để tích lũy thêm kinh nghiệm đối soát chứng từ.' },
  { id: 'app-kt-5', student_name: 'Đỗ Quốc Bảo', student_email: 'bao.do@ou.edu.vn', student_phone: '0933221100', university: 'Đại học Mở TP.HCM', major: 'Kế toán - Kiểm toán', applied_at: '2020-11-22T08:45:00Z', status: 'REJECTED', cv_url: '/uploads/cv_ketoan_do_quoc_bao.pdf', cover_letter: 'Em gửi hồ sơ ứng tuyển vị trí thực tập / part-time kế toán.' },
  { id: 'app-kt-6', student_name: 'Vũ Hoàng Yến', student_email: 'yen.vu@vlu.edu.vn', student_phone: '0944556677', university: 'Đại học Văn Lang', major: 'Tài chính doanh nghiệp', applied_at: '2020-11-22T13:10:00Z', status: 'ACCEPTED', cv_url: '/uploads/cv_ketoan_vu_hoang_yen.pdf', cover_letter: 'Em có thể sắp xếp lịch làm việc 4 buổi/tuần theo yêu cầu của công ty.' },
  { id: 'app-kt-7', student_name: 'Nguyễn Tiến Đạt', student_email: 'dat.nguyen@ftu.edu.vn', student_phone: '0908877665', university: 'Đại học Ngoại Thương CS2', major: 'Kinh tế đối ngoại', applied_at: '2020-11-23T10:00:00Z', status: 'COMPLETED', cv_url: '/uploads/cv_ketoan_nguyen_tien_dat.pdf', cover_letter: 'Hồ sơ ứng tuyển nhân viên kế toán nội bộ part-time.' },
  { id: 'app-kt-8', student_name: 'Hoàng Kim Ngân', student_email: 'ngan.hoang@ueh.edu.vn', student_phone: '0922334455', university: 'Đại học Kinh tế TP.HCM', major: 'Kiểm toán & Kế toán công', applied_at: '2020-11-23T15:30:00Z', status: 'ACCEPTED', cv_url: '/uploads/cv_ketoan_hoang_kim_ngan.pdf', cover_letter: 'Kính gửi quý công ty, em mong muốn được thử sức với công việc kế toán kho và hóa đơn.' },
  { id: 'app-kt-9', student_name: 'Bùi Anh Tuấn', student_email: 'tuan.bui@hcmut.edu.vn', student_phone: '0911223344', university: 'Đại học Bách Khoa TP.HCM', major: 'Quản lý Công nghiệp', applied_at: '2020-11-24T09:40:00Z', status: 'PENDING', cv_url: '/uploads/cv_ketoan_bui_anh_tuan.pdf', cover_letter: 'Em có chứng chỉ kế toán thực hành và mong muốn làm việc bán thời gian.' },
  { id: 'app-kt-10', student_name: 'Đặng Mai Phương', student_email: 'phuong.dang@vlu.edu.vn', student_phone: '0966778899', university: 'Đại học Văn Lang', major: 'Kế toán - Kiểm toán', applied_at: '2020-11-24T16:15:00Z', status: 'COMPLETED', cv_url: '/uploads/cv_ketoan_dang_mai_phuong.pdf', cover_letter: 'Em đã hoàn thành tốt kỳ thực tập và sẵn sàng nhận việc ngay khi được duyệt.' }
];

const getCompanyAvatar = (name = '') => {
  if (!name) return 'CT';
  const clean = name.replace(/công ty|tnhh|cổ phần|cp|vietnam/gi, '').trim();
  if (clean.toLowerCase().includes('abc')) return 'ABC';
  const words = clean.split(' ').filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
};

const getCompanyColor = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('abc')) return { bg: '#F9E5DC', text: 'var(--color-primary)' };
  if (n.includes('techcorp')) return { bg: '#eff6ff', text: '#1d4ed8' };
  if (n.includes('highlands')) return { bg: '#fef3c7', text: '#92400e' };
  if (n.includes('shopee')) return { bg: '#fff1f2', text: '#be123c' };
  if (n.includes('fpt')) return { bg: '#ecfdf5', text: '#047857' };
  if (n.includes('coffee house')) return { bg: '#fef2f2', text: '#b91c1c' };
  if (n.includes('vng')) return { bg: 'var(--color-primary-light)', text: '#6d28d9' };
  if (n.includes('katinat')) return { bg: '#fdf4ff', text: '#a21caf' };
  if (n.includes('vinamilk')) return { bg: '#eff6ff', text: '#2563eb' };
  if (n.includes('grab')) return { bg: '#ecfdf5', text: '#059669' };
  if (n.includes('tiki')) return { bg: '#eff6ff', text: '#0284c7' };
  return { bg: 'var(--color-lavender-surface)', text: '#475569' };
};

export default function App() {
  // Navigation tabs matching the wireframe screens:
  // 'home' (WF-G01), 'jobs' (WF-G02), 'student_apps' (Screen 8), 'employer_jobs' (Screen 10),
  // 'create_job' (Screen 11), 'applicants' (Screen 12), 'admin' (Screen 5), 'login' (Screen 1 & 2)
  const [activeTab, setActiveTab] = useState(() => getAppRestore().tab || 'home');
  // Tab con muốn mở trong trang Sinh viên; n tăng mỗi lần chọn để mở lại cả khi trùng tab
  const [studentDashNav, setStudentDashNav] = useState({ tab: 'dashboard', n: 0 });
  const [editingEmployerJob, setEditingEmployerJob] = useState(null);
  const [adminSubTab, setAdminSubTab] = useState('users'); // 'users' (User Management) | 'moderation' (Job Moderation)

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
    'employer_proposals',
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
    'employer_public_profile',
    'static_content'
  ].includes(activeTab) && !isEmployerWorkspace && !isAdminWorkspace;

  const isEmployerOperationalScreen = isEmployerWorkspace || isAdminWorkspace || (
    currentUser?.role === 'EMPLOYER' && [
      'employer_dashboard',
      'employer_jobs',
      'create_job',
      'applicants',
      'employer_proposals',
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
  const [proposalModalOpen, setProposalModalOpen] = useState(false); // WF-S07: Freelance Proposal Form
  const [applyTargetJob, setApplyTargetJob] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false); // Screen 13
  const [studentProfileOpen, setStudentProfileOpen] = useState(false); // Screen 9
  const [employerProfileOpen, setEmployerProfileOpen] = useState(false); // Screen 14
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false); // Screen 3
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyInitialTab, setPolicyInitialTab] = useState('terms');
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [headerJobsMenuOpen, setHeaderJobsMenuOpen] = useState(false);
  const [headerCategoryMenuOpen, setHeaderCategoryMenuOpen] = useState(false);
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

  // Helper: Kiểm tra xem sinh viên đã hoàn thành hồ sơ cá nhân hay chưa
  const isStudentProfileComplete = (user) => {
    if (!user) return false;
    if (user.role !== 'STUDENT') return true;

    // 1. Tài khoản sinh viên demo sẵn có trong seed DB / hệ thống test
    const demoStudentEmails = [
      'student.test@vlu.edu.vn',
      'student@gmail.com',
      'student.morning@vlu.edu.vn',
      'student.evening@vlu.edu.vn',
    ];
    if (demoStudentEmails.includes(user.email) || user.id === 4) {
      return true;
    }

    // 2. Kiểm tra thuộc tính trên user
    if (user.is_profile_completed) return true;
    if ((user.university || user.school) && (user.major || user.faculty)) {
      return true;
    }

    // 3. Kiểm tra localStorage theo userId
    const savedLocal = localStorage.getItem(`jobnest_student_profile_${user.id}`);
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        if (parsed.university || parsed.school || parsed.major || parsed.dob || (parsed.skills && parsed.skills.length > 0)) {
          return true;
        }
      } catch {}
    }

    return false;
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

  const handleNavigateToStudentProfile = (studentId) => {
    setSelectedStudentId(studentId);
    setActiveTab('student_profile_view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReportModal = (type, id, title) => {
    setReportModalTarget({ type, id, title });
    setReportModalOpen(true);
  };

  const handleNavigateErrorPage = (type = '404', message = '') => {
    setErrorPageConfig({ type, message });
    setActiveTab('error_page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Saved Jobs State (Lưu việc làm yêu thích)
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const saved = localStorage.getItem('jobnest_saved_jobs');
      return saved ? JSON.parse(saved) : [1, 4];
    } catch {
      return [1, 4];
    }
  });
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
  const handleToggleSaveJob = async (jobItem) => {
    const isCurrentlySaved = savedJobIds.includes(jobItem.id);
    const updated = isCurrentlySaved 
      ? savedJobIds.filter(id => id !== jobItem.id)
      : [...savedJobIds, jobItem.id];
    setSavedJobIds(updated);
    try {
      localStorage.setItem('jobnest_saved_jobs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showToast(isCurrentlySaved ? `Đã bỏ lưu việc "${jobItem.title}"` : `Đã lưu tin "${jobItem.title}" vào mục yêu thích ❤️`);

    if (currentUser?.token && typeof jobItem.id === 'number') {
      try {
        await fetch(`${API_BASE}/jobs/${jobItem.id}/save`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
      } catch (err) {
        console.error(err);
      }
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

  // Student state (Screen 8)
  const [myApplications, setMyApplications] = useState(DEFAULT_STUDENT_APPLICATIONS);
  const [studentAppFilter, setStudentAppFilter] = useState('ALL'); // ALL, PENDING, ACCEPTED, REJECTED, COMPLETED
  const [studentAppPage, setStudentAppPage] = useState(1);
  const [studentAppPageSize, setStudentAppPageSize] = useState(6);

  // Employer state (Screen 10, 11, 12)
  const [employerJobs, setEmployerJobs] = useState(DEFAULT_EMPLOYER_JOBS);
  const [employerJobFilter, setEmployerJobFilter] = useState('ALL'); // ALL, OPEN, CLOSED
  const [employerJobSearch, setEmployerJobSearch] = useState('');
  const [employerJobPage, setEmployerJobPage] = useState(1);
  const employerJobPageSize = 5;
  
  // Selected job for reviewing applicants (Screen 12)
  const [activeJobForApplicants, setActiveJobForApplicants] = useState(null);
  const [activeJobApplicants, setActiveJobApplicants] = useState([]);
  const [applicantStatusFilter, setApplicantStatusFilter] = useState('ALL'); // ALL, PENDING, ACCEPTED, REJECTED, COMPLETED
  const [applicantSearch, setApplicantSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [applicantDetailModalOpen, setApplicantDetailModalOpen] = useState(false);

  // Employer Create Job Form state (Screen 11)
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    category: 'Công nghệ thông tin',
    headcount: 3,
    description: '',
    requirements: '',
    work_days: 'Thứ 2 - Thứ 6',
    work_shift: '08:00 - 12:00',
    start_date: '2026-11-15',
    end_date: '2027-02-15',
    salary: 35000,
    salary_type: 'HOURLY',
    work_type: 'PART_TIME',
    location: 'Quận 1, TP.HCM',
    deadline: '2026-11-30',
    contact_info: 'hr@techcorp.vn - 0909123456',
  });

  // Admin state (Screen 5)
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminUserRoleFilter, setAdminUserRoleFilter] = useState('ALL');
  const [adminModerationFilter, setAdminModerationFilter] = useState('ALL');

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

  // Fetch Employer Jobs (Screen 10)
  const fetchEmployerJobs = async () => {
    if (!currentUser?.token || currentUser?.role !== 'EMPLOYER') {
      setEmployerJobs(DEFAULT_EMPLOYER_JOBS);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const ketoanSeed = DEFAULT_EMPLOYER_JOBS[0];
        const otherSeeds = DEFAULT_EMPLOYER_JOBS.slice(1);
        const dbJobs = data.data.map(j => ({
          ...j,
          applicant_count: j.total_applicants ?? (j.applications_count || 0)
        }));
        const filteredSeeds = otherSeeds.filter(
          s => !dbJobs.some(db => (db.title || '').toLowerCase() === (s.title || '').toLowerCase())
        );
        const merged = [ketoanSeed, ...dbJobs, ...filteredSeeds];
        setEmployerJobs(merged);
        if (!activeJobForApplicants) {
          setActiveJobForApplicants(ketoanSeed);
        }
      } else {
        setEmployerJobs(DEFAULT_EMPLOYER_JOBS);
        if (!activeJobForApplicants) {
          setActiveJobForApplicants(DEFAULT_EMPLOYER_JOBS[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setEmployerJobs(DEFAULT_EMPLOYER_JOBS);
      if (!activeJobForApplicants) {
        setActiveJobForApplicants(DEFAULT_EMPLOYER_JOBS[0]);
      }
    }
  };

  // Fetch Student Applications (Screen 8)
  const fetchMyApplications = async () => {
    if (!currentUser?.token || currentUser?.role !== 'STUDENT') return;
    try {
      const res = await fetch(`${API_BASE}/applications/my-applications`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const dbApps = data.data.map(app => ({
          ...app,
          cv_file: app.cv_url ? app.cv_url.split('/').pop().replace(/\.[^/.]+$/, '') : 'CV_NguyenVanChi'
        }));
        // Ensure ABC (Seed 1) is always row 1 matching the wireframe screenshot!
        const abcSeed = DEFAULT_STUDENT_APPLICATIONS[0];
        const otherSeeds = DEFAULT_STUDENT_APPLICATIONS.slice(1);
        const filteredSeeds = otherSeeds.filter(
          seed => !dbApps.some(db => (db.job_title || '').toLowerCase().includes('react') && (seed.job_title || '').toLowerCase().includes('react'))
        );
        const merged = [abcSeed, ...dbApps, ...filteredSeeds].slice(0, 12);
        setMyApplications(merged);
      } else {
        setMyApplications(DEFAULT_STUDENT_APPLICATIONS);
      }
    } catch (err) {
      console.error(err);
      setMyApplications(DEFAULT_STUDENT_APPLICATIONS);
    }
  };

  // Fetch Applicants for a specific Employer Job (Screen 12)
  const fetchApplicantsForJob = async (job) => {
    setActiveJobForApplicants(job);
    setActiveTab('applicants');
    try {
      const res = await fetch(`${API_BASE}/applications/job/${job.id}`, {
        headers: { Authorization: `Bearer ${currentUser?.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setActiveJobApplicants(data.data);
      } else {
        if (job.title === 'Kế toán' || job.id === 'emp-job-1') {
          setActiveJobApplicants(DEFAULT_APPLICANTS_KETOAN);
        } else {
          setActiveJobApplicants([]);
        }
      }
    } catch (err) {
      if (job.title === 'Kế toán' || job.id === 'emp-job-1') {
        setActiveJobApplicants(DEFAULT_APPLICANTS_KETOAN);
      } else {
        setActiveJobApplicants([]);
      }
    }
  };

  // Fetch Admin Data (Screen 5)
  const fetchAdminData = async () => {
    if (!currentUser?.token || currentUser?.role !== 'ADMIN') return;
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${currentUser.token}` } }),
        fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${currentUser.token}` } })
      ]);
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      if (statsData.success) setAdminStats(statsData.data);
      if (usersData.success) setAdminUsers(usersData.data);
    } catch (err) {
      console.error(err);
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
        setActiveTab('static_content');
      } else if (urlTab === 'employer_public_profile') {
        setActiveTab('employer_public_profile');
      }
    } catch {
      // quiet fallback
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'jobs' || activeTab === 'home') fetchJobs();
    if (activeTab === 'employer_jobs' || activeTab === 'create_job' || activeTab === 'employer_dashboard') fetchEmployerJobs();
    if (activeTab === 'student_apps') fetchMyApplications();
    if (activeTab === 'admin') fetchAdminData();
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
        fetchMyApplications();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(formatApiError(err), 'error');
    }
  };

  // Dispatches to WF-S06 (Application Form for PT/SV) or WF-S07 (Proposal Form for Freelance)
  const handleOpenApplyModal = (jobItem) => {
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
    if (!isStudentProfileComplete(currentUser)) {
      showToast('Bạn chưa hoàn thiện hồ sơ sinh viên! Vui lòng cập nhật đầy đủ thông tin (Trường học, Chuyên ngành, Kỹ năng, CV) để nộp đơn ứng tuyển.', 'error');
      setStudentProfileOpen(true);
      return;
    }

    setApplyTargetJob(jobItem);
    if (jobItem?.work_type === 'FREELANCE' || jobItem?.job_type === 'FREELANCE') {
      setProposalModalOpen(true);
    } else {
      setApplicationModalOpen(true);
    }
  };

  // Handle Create Job (Screen 11)
  const handleCreateJobSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.token || currentUser?.role !== 'EMPLOYER') {
      showToast('Vui lòng đăng nhập tài khoản Nhà tuyển dụng', 'error');
      return;
    }

    if (newJobForm.deadline) {
      const dl = new Date(newJobForm.deadline);
      if (dl <= new Date()) {
        showToast('Hạn nộp hồ sơ phải là một ngày trong tương lai!', 'error');
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          title: newJobForm.title,
          category: newJobForm.category,
          location: newJobForm.location,
          salary: Number(newJobForm.salary),
          salary_type: newJobForm.salary_type,
          work_type: newJobForm.work_type,
          description: newJobForm.description + `\n\n[Thời gian làm việc: ${newJobForm.work_days}, Ca làm: ${newJobForm.work_shift}]`,
          requirements: newJobForm.requirements,
          application_deadline: newJobForm.deadline,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đăng tin tuyển dụng thành công! Tin đã được đưa lên hệ thống.');
        fetchEmployerJobs();
        setActiveTab('employer_jobs');
        setNewJobForm({
          title: '',
          category: 'Công nghệ thông tin',
          headcount: 3,
          description: '',
          requirements: '',
          work_days: 'Thứ 2 - Thứ 6',
          work_shift: '08:00 - 12:00',
          start_date: '2026-11-15',
          end_date: '2027-02-15',
          salary: 35000,
          salary_type: 'HOURLY',
          work_type: 'PART_TIME',
          location: 'Quận 1, TP.HCM',
          deadline: '2026-11-30',
          contact_info: 'hr@techcorp.vn - 0909123456',
        });
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(formatApiError(err), 'error');
    }
  };

  // Handle Application Status Update (A3 RULE: Chấp nhận ứng viên phải qua POST /jobs/:jobId/selections)
  const handleUpdateApplicationStatus = async (appId, status) => {
    setActiveJobApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    showToast(`Đã chuyển trạng thái ứng viên sang: ${status === 'ACCEPTED' ? 'Đã tuyển & Khởi tạo hợp đồng (A3)' : status === 'REJECTED' ? 'Từ chối' : status}`);
    
    if (typeof appId === 'number' || !String(appId).startsWith('app-kt-')) {
      try {
        const targetJobId = activeJobForApplicants?.id || activeJobApplicants.find(a => a.id === appId)?.job_id;

        if (status === 'ACCEPTED') {
          // A3 RULE: Tuyến duy nhất chấp nhận ứng viên và khởi tạo Work Assignment
          const res = await fetch(`${API_BASE}/jobs/${targetJobId}/selections`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token}`
            },
            body: JSON.stringify({ applicationIds: [appId] })
          });
          const data = await res.json();
          if (!data.success) {
            showToast(data.message, 'error');
          } else {
            showToast(data.message || 'Lựa chọn ứng viên thành công!', 'success');
          }
        } else {
          // Chỉ gọi PATCH cho các trạng thái REJECTED, REVIEWING, SHORTLISTED
          const res = await fetch(`${API_BASE}/applications/${appId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token}`
            },
            body: JSON.stringify({ status })
          });
          const data = await res.json();
          if (!data.success) {
            showToast(data.message, 'error');
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle Job Info Update (from JobDetailModal Edit mode)
  const handleUpdateJobInfo = async (updatedJob) => {
    setEmployerJobs(prev => prev.map(j => j.id === updatedJob.id ? { ...j, ...updatedJob } : j));
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

  // Handle Job Status Update (Screen 10: Khóa / Mở tin)
  const handleUpdateJobStatus = async (jobId, status) => {
    setEmployerJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
    showToast(`Đã cập nhật trạng thái tin sang: ${status === 'OPEN' ? 'Đang tuyển' : 'Đã đóng'}`);
    if (typeof jobId === 'number' || !String(jobId).startsWith('emp-job-')) {
      try {
        await fetch(`${API_BASE}/jobs/${jobId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser?.token}`
          },
          body: JSON.stringify({ status })
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

  // Dynamic application counts for Screen 8 tabs (Tất cả (12), Chờ duyệt (3), Đã duyệt (4), Bị từ chối (2), Hoàn thành (3))
  const studentAppCounts = {
    ALL: myApplications.length,
    PENDING: myApplications.filter(a => a.status === 'PENDING').length,
    ACCEPTED: myApplications.filter(a => a.status === 'ACCEPTED').length,
    REJECTED: myApplications.filter(a => a.status === 'REJECTED').length,
    COMPLETED: myApplications.filter(a => a.status === 'COMPLETED').length,
  };

  // Filtered student applications (Screen 8)
  const filteredMyApps = myApplications.filter(app => {
    if (studentAppFilter === 'ALL') return true;
    return app.status === studentAppFilter;
  });

  const totalAppPages = Math.max(1, Math.ceil(filteredMyApps.length / studentAppPageSize));
  const paginatedMyApps = filteredMyApps.slice(
    (studentAppPage - 1) * studentAppPageSize,
    studentAppPage * studentAppPageSize
  );

  // Filtered employer jobs (Screen 10)
  const filteredEmployerJobs = employerJobs.filter(job => {
    const q = (employerJobSearch || '').toLowerCase().trim();
    const matchSearch = !q || 
      (job.title || '').toLowerCase().includes(q) ||
      (job.category || '').toLowerCase().includes(q) ||
      (job.location || '').toLowerCase().includes(q);
    const matchStatus = employerJobFilter === 'ALL' || job.status === employerJobFilter;
    return matchSearch && matchStatus;
  });

  const totalEmployerJobPages = Math.max(1, Math.ceil(filteredEmployerJobs.length / employerJobPageSize));
  const paginatedEmployerJobs = filteredEmployerJobs.slice(
    (employerJobPage - 1) * employerJobPageSize,
    employerJobPage * employerJobPageSize
  );

  // Filtered applicants (Screen 12)
  const filteredApplicants = activeJobApplicants.filter(app => {
    const matchSearch = !applicantSearch || (app.student_name || '').toLowerCase().includes(applicantSearch.toLowerCase()) || (app.student_email || '').toLowerCase().includes(applicantSearch.toLowerCase());
    const matchStatus = applicantStatusFilter === 'ALL' || app.status === applicantStatusFilter;
    return matchSearch && matchStatus;
  });

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
                    setActiveTab('student_dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                      },
                      { 
                        label: 'Sơ đồ trang web', 
                        desc: 'Cấu trúc các tính năng',
                        action: () => handleNavigateAbout('sitemap')
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
            {/* WF-G07: TRANG TĨNH (GIỚI THIỆU / LIÊN HỆ / ĐIỀU KHOẢN)                     */}
            {/* ========================================================================= */}
            {activeTab === 'static_content' && (
              <StaticContentPage
                initialTab="about"
                currentUser={currentUser}
                onNavigateHome={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateJobs={() => {
                  setActiveTab('jobs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
            {/* FREELANCE PROPOSALS: QUẢN LÝ ĐỀ XUẤT CỦA SINH VIÊN                       */}
            {/* ========================================================================= */}
            {activeTab === 'student_proposals' && (
              <MyProposalsPage
                currentUser={currentUser}
                showToast={showToast}
                onSelectJob={(job) => handleNavigateToJobDetail(job)}
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
                activeTab === 'employer_proposals' ||
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
                  activeTab === 'applicants' || activeTab === 'employer_proposals' ? 'applicants' :
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
            {/* LEGACY SCREEN 10: QUẢN LÝ TIN ĐĂNG (ĐÃ THAY THẾ BẰNG EMPLOYER PORTAL)     */}
            {/* ========================================================================= */}
            {false && activeTab === 'employer_jobs' && (
              <div style={{ maxWidth: 1140, margin: '0 auto', paddingBottom: 40 }}>
                {/* Header Banner matching Wireframe */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.02em' }}>
                        Quản lý tin đăng
                      </h1>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        background: 'var(--color-primary-light)',
                        padding: '2px 10px',
                        borderRadius: 999,
                        border: '1px solid var(--color-border)'
                      }}>
                        Nhà tuyển dụng
                      </span>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 13.5, margin: 0 }}>
                      Theo dõi trạng thái, quản lý các bài đăng tuyển dụng và số lượng hồ sơ ứng tuyển của doanh nghiệp
                    </p>
                  </div>
                </div>

                {/* Action & Filter Bar matching Wireframe Layout:
                    [+ TẠO TIN TUYỂN DỤNG]   [Tìm kiếm........]   [Tất cả trạng thái v]   [TÌM KIẾM]
                */}
                <div style={{
                  background: '#ffffff',
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 20,
                  flexWrap: 'wrap',
                }}>
                  {/* Left Action Button: + TẠO TIN TUYỂN DỤNG */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveTab('create_job')}
                    style={{
                      background: 'var(--color-primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 20px',
                      fontSize: 13.5,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(89, 70, 117, 0.25)',
                      flexShrink: 0,
                    }}
                    title="Chuyển đến Màn 11: Form tạo tin tuyển dụng"
                  >
                    <PlusCircle size={16} /> + TẠO TIN TUYỂN DỤNG
                  </motion.button>

                  {/* Middle Search Input: Tìm kiếm........ */}
                  <div style={{
                    position: 'relative',
                    flex: '1 1 240px',
                    minWidth: 200,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <Search 
                      size={16} 
                      color="#94a3b8" 
                      style={{ position: 'absolute', left: 14, pointerEvents: 'none' }} 
                    />
                    <input
                      type="text"
                      placeholder="Tìm kiếm........"
                      value={employerJobSearch}
                      onChange={(e) => {
                        setEmployerJobSearch(e.target.value);
                        setEmployerJobPage(1);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isImeComposing(e)) {
                          showToast(`Đang lọc tin với từ khóa: "${employerJobSearch}"`);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '9.5px 14px 9.5px 38px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13.5,
                        color: 'var(--color-text)',
                        outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        background: '#ffffff',
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                    />
                    {employerJobSearch && (
                      <button
                        onClick={() => { setEmployerJobSearch(''); setEmployerJobPage(1); }}
                        style={{
                          position: 'absolute',
                          right: 10,
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: 2,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdown: Tất cả trạng thái */}
                  <div style={{ flexShrink: 0, minWidth: 175 }}>
                    <CustomDropdown
                      value={employerJobFilter}
                      onChange={(e) => {
                        setEmployerJobFilter(e.target.value);
                        setEmployerJobPage(1);
                      }}
                      options={[
                        { value: 'ALL', label: 'Tất cả trạng thái' },
                        { value: 'OPEN', label: 'Đang tuyển' },
                        { value: 'CLOSED', label: 'Đã đóng' },
                      ]}
                    />
                  </div>

                  {/* Right Button: TÌM KIẾM */}
                  <motion.button
                    whileHover={{ scale: 1.01, backgroundColor: 'var(--color-lavender-surface)' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      showToast(`Đã lọc danh sách: ${filteredEmployerJobs.length} tin phù hợp`);
                    }}
                    style={{
                      padding: '9.5px 22px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      background: 'var(--color-background)',
                      color: '#1e293b',
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0,
                      letterSpacing: '0.02em',
                    }}
                  >
                    TÌM KIẾM
                  </motion.button>
                </div>

                {/* Section Header: DANH SÁCH TIN ĐĂNG */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                  padding: '0 4px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h2 style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#1e293b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      margin: 0,
                    }}>
                      DANH SÁCH TIN ĐĂNG
                    </h2>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-lavender-surface)',
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}>
                      {filteredEmployerJobs.length} tin
                    </span>
                  </div>

                  <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)' }}>
                    Đang tuyển: <strong style={{ color: '#047857' }}>{employerJobs.filter(j => j.status === 'OPEN').length}</strong> • Đã đóng: <strong style={{ color: 'var(--color-text-secondary)' }}>{employerJobs.filter(j => j.status === 'CLOSED').length}</strong>
                  </div>
                </div>

                {/* Data Table: STT | Vị trí | Ngày đăng | Số ứng viên | Trạng thái | Thao tác */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{
                          background: 'var(--color-background)',
                          borderBottom: '1px solid var(--color-border)',
                          color: '#475569',
                          fontSize: 12.5,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          <th style={{ padding: '14px 16px', textAlign: 'center', width: 60 }}>STT</th>
                          <th style={{ padding: '14px 16px', minWidth: 260 }}>Vị trí</th>
                          <th style={{ padding: '14px 16px', width: 140 }}>Ngày đăng</th>
                          <th style={{ padding: '14px 16px', textAlign: 'center', width: 140 }}>Số ứng viên</th>
                          <th style={{ padding: '14px 16px', textAlign: 'center', width: 140 }}>Trạng thái</th>
                          <th style={{ padding: '14px 16px', textAlign: 'center', width: 280 }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEmployerJobs.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-secondary)' }}>
                              <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'var(--color-lavender-surface)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 12px',
                                color: '#94a3b8',
                              }}>
                                <FileText size={24} />
                              </div>
                              <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                                Không tìm thấy tin tuyển dụng nào
                              </div>
                              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                                Thử thay đổi từ khóa tìm kiếm hoặc trạng thái lọc
                              </div>
                              <Button
                                variant="primary"
                                onClick={() => setActiveTab('create_job')}
                                style={{ padding: '7px 16px', fontSize: 13 }}
                              >
                                + Tạo tin tuyển dụng mới
                              </Button>
                            </td>
                          </tr>
                        ) : (
                          paginatedEmployerJobs.map((job, idx) => {
                            const globalIndex = (employerJobPage - 1) * employerJobPageSize + idx + 1;
                            const isRow1 = globalIndex === 1 && job.title === 'Kế toán';
                            const createdDateStr = job.created_at
                              ? new Date(job.created_at).toLocaleDateString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })
                              : '20/11/2020';

                            const applicantCount = job.applicant_count ?? job.total_applicants ?? (isRow1 ? 10 : 0);
                            const isOpen = job.status === 'OPEN';

                            return (
                              <tr
                                key={job.id}
                                style={{
                                  borderBottom: '1px solid var(--color-lavender-surface)',
                                  transition: 'background-color 0.15s ease',
                                  background: '#ffffff',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                              >
                                {/* STT */}
                                <td style={{
                                  padding: '16px 14px',
                                  textAlign: 'center',
                                  color: 'var(--color-text-secondary)',
                                  fontWeight: 600,
                                  fontSize: 13,
                                }}>
                                  {globalIndex}
                                </td>

                                {/* Vị trí */}
                                <td style={{ padding: '16px 14px' }}>
                                  <div style={{
                                    fontWeight: 700,
                                    fontSize: 14.5,
                                    color: 'var(--color-text)',
                                    marginBottom: 3,
                                  }}>
                                    {job.title}
                                  </div>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: 12,
                                    color: 'var(--color-text-secondary)',
                                  }}>
                                    <span>{job.category || 'Tài chính / Kế toán'}</span>
                                    <span>•</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                      <MapPin size={12} color="#94a3b8" /> {job.location || 'TP. Hồ Chí Minh'}
                                    </span>
                                  </div>
                                </td>

                                {/* Ngày đăng */}
                                <td style={{ padding: '16px 14px', color: '#334155', fontSize: 13 }}>
                                  <div style={{ fontWeight: 600 }}>{createdDateStr}</div>
                                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                    {isRow1 ? 'Đăng lúc 08:00' : 'Mới cập nhật'}
                                  </div>
                                </td>

                                {/* Số ứng viên */}
                                <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    padding: '4px 12px',
                                    borderRadius: 999,
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    background: applicantCount > 0 ? 'var(--color-primary-light)' : 'var(--color-lavender-surface)',
                                    color: applicantCount > 0 ? '#6d28d9' : 'var(--color-text-secondary)',
                                    border: applicantCount > 0 ? '1px solid var(--color-border)' : '1px solid var(--color-border)',
                                  }}>
                                    <Users size={13} /> {applicantCount}
                                  </span>
                                </td>

                                {/* Trạng thái */}
                                <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '4px 11px',
                                    borderRadius: 999,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    background: isOpen ? '#ecfdf5' : 'var(--color-lavender-surface)',
                                    color: isOpen ? '#047857' : '#475569',
                                    border: isOpen ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                                  }}>
                                    <span style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      backgroundColor: isOpen ? '#10b981' : '#94a3b8',
                                    }} />
                                    {isOpen ? 'Đang tuyển' : 'Đã đóng'}
                                  </span>
                                </td>

                                {/* Thao tác: Chỉ để icon mắt cho xem chi tiết, sắp xếp gọn gàng 1 hàng */}
                                <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                                  <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                  }}>
                                    {/* Action 1: Icon Mắt xem chi tiết & chỉnh sửa bài đăng */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedJob(job);
                                        setJobDetailModalOpen(true);
                                      }}
                                      style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 8,
                                        border: '1px solid #cbd5e1',
                                        background: '#ffffff',
                                        color: '#475569',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        flexShrink: 0,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--color-lavender-surface)';
                                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                                        e.currentTarget.style.color = 'var(--color-primary)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                        e.currentTarget.style.color = '#475569';
                                      }}
                                      title="Xem chi tiết bài đăng & Chỉnh sửa thông tin"
                                    >
                                      <Eye size={16} />
                                    </button>

                                    {/* Action 2: Xem ứng viên */}
                                    <button
                                      type="button"
                                      onClick={() => fetchApplicantsForJob(job)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '7px 14px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: 'var(--color-primary)',
                                        color: '#ffffff',
                                        fontSize: 12.5,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 2px rgba(89,70,117,0.2)',
                                        transition: 'background-color 0.15s ease',
                                        whiteSpace: 'nowrap',
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a3865'}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                                      title={`Xem danh sách ${applicantCount} ứng viên nộp hồ sơ (Màn 12)`}
                                    >
                                      <Users size={14} /> Xem ứng viên
                                    </button>

                                    {/* Action 3: Quick toggle status */}
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateJobStatus(job.id, isOpen ? 'CLOSED' : 'OPEN')}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '7px 11px',
                                        borderRadius: 8,
                                        border: isOpen ? '1px solid #fecaca' : '1px solid #bbf7d0',
                                        background: isOpen ? '#fef2f2' : '#f0fdf4',
                                        color: isOpen ? '#dc2626' : '#16a34a',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.15s ease',
                                      }}
                                      title={isOpen ? 'Đóng nhận thêm hồ sơ' : 'Mở lại tin tuyển dụng'}
                                    >
                                      {isOpen ? 'Đóng tin' : 'Mở lại'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Bar */}
                  {filteredEmployerJobs.length > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 18px',
                      background: '#ffffff',
                      borderTop: '1px solid var(--color-lavender-surface)',
                      fontSize: 12.5,
                      color: 'var(--color-text-secondary)',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}>
                      <div>
                        Hiển thị <strong>{(employerJobPage - 1) * employerJobPageSize + 1}</strong> - <strong>{Math.min(employerJobPage * employerJobPageSize, filteredEmployerJobs.length)}</strong> trong tổng số <strong>{filteredEmployerJobs.length}</strong> tin đăng
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setEmployerJobPage(p => Math.max(1, p - 1))}
                          disabled={employerJobPage === 1}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 12px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            background: employerJobPage === 1 ? 'var(--color-background)' : '#ffffff',
                            color: employerJobPage === 1 ? '#94a3b8' : '#334155',
                            cursor: employerJobPage === 1 ? 'not-allowed' : 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          <ChevronLeft size={14} /> Trước
                        </button>

                        {Array.from({ length: totalEmployerJobPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setEmployerJobPage(pageNum)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 6,
                              border: pageNum === employerJobPage ? '1px solid var(--color-primary)' : '1px solid #cbd5e1',
                              background: pageNum === employerJobPage ? 'var(--color-primary)' : '#ffffff',
                              color: pageNum === employerJobPage ? '#ffffff' : '#334155',
                              fontWeight: pageNum === employerJobPage ? 700 : 500,
                              fontSize: 12,
                              cursor: 'pointer',
                            }}
                          >
                            {pageNum}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => setEmployerJobPage(p => Math.min(totalEmployerJobPages, p + 1))}
                          disabled={employerJobPage === totalEmployerJobPages}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 12px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            background: employerJobPage === totalEmployerJobPages ? 'var(--color-background)' : '#ffffff',
                            color: employerJobPage === totalEmployerJobPages ? '#94a3b8' : '#334155',
                            cursor: employerJobPage === totalEmployerJobPages ? 'not-allowed' : 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Sau <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 11: FORM TẠO TIN (EMPLOYER CREATE JOB FORM)                         */}
            {/* ========================================================================= */}
            {false && activeTab === 'create_job' && (
              <div style={{ maxWidth: 880, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: 6 }}>Wireframe Screen 11</span>
                    <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0' }}>TẠO TIN TUYỂN DỤNG MỚI (Form tạo tin)</h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 13.5, margin: 0 }}>
                      Điền đầy đủ thông tin để sinh viên hiểu rõ vị trí công việc
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => setActiveTab('employer_jobs')} style={{ padding: '6px 14px', fontSize: 12.5 }}>
                    <ArrowLeft size={14} /> Quay lại danh sách
                  </Button>
                </div>

                <div className="card" style={{ padding: '28px 32px' }}>
                  <form onSubmit={handleCreateJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#4f46e5', margin: 0, textTransform: 'uppercase' }}>
                      THÔNG TIN CƠ BẢN
                    </h3>

                    {/* Tên công việc */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        Tên công việc (*)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nhân viên bán hàng part-time / Lập trình viên React..."
                        value={newJobForm.title}
                        onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                        style={{ width: '100%', fontSize: 13.5 }}
                      />
                    </div>

                    {/* Ngành nghề & Số lượng */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                          Ngành nghề (*)
                        </label>
                        <CustomDropdown
                          value={newJobForm.category}
                          onChange={(e) => setNewJobForm({ ...newJobForm, category: e.target.value })}
                          options={[
                            { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin' },
                            { value: 'Thiết kế đồ họa', label: 'Thiết kế đồ họa' },
                            { value: 'Dịch vụ & F&B', label: 'Dịch vụ & F&B' },
                            { value: 'Giáo dục & Gia sư', label: 'Giáo dục & Gia sư' },
                            { value: 'Marketing & Sự kiện', label: 'Marketing & Sự kiện' },
                            { value: 'Bán lẻ', label: 'Bán lẻ' },
                            { value: 'Tài chính / Kế toán', label: 'Tài chính / Kế toán' },
                          ]}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                          Số lượng cần tuyển (*)
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={newJobForm.headcount}
                          onChange={(e) => setNewJobForm({ ...newJobForm, headcount: e.target.value })}
                          style={{ width: '100%', fontSize: 13 }}
                        />
                      </div>
                    </div>

                    {/* Mô tả công việc */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        Mô tả công việc (*)
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Nhập nhiệm vụ, trách nhiệm và công việc hằng ngày sinh viên cần đảm nhận..."
                        value={newJobForm.description}
                        onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                        style={{ width: '100%', fontSize: 13 }}
                      />
                    </div>

                    {/* Yêu cầu ứng viên */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        Yêu cầu ứng viên
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Nhập kỹ năng, kinh nghiệm hoặc điều kiện cần có..."
                        value={newJobForm.requirements}
                        onChange={(e) => setNewJobForm({ ...newJobForm, requirements: e.target.value })}
                        style={{ width: '100%', fontSize: 13 }}
                      />
                    </div>

                    {/* Thời gian làm việc */}
                    <div style={{ background: 'var(--color-background)', padding: 14, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                        Thời gian làm việc (*)
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Ngày làm</label>
                          <input
                            type="text"
                            value={newJobForm.work_days}
                            onChange={(e) => setNewJobForm({ ...newJobForm, work_days: e.target.value })}
                            placeholder="VD: Thứ 2 - Thứ 6"
                            style={{ width: '100%', fontSize: 13 }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Ca làm</label>
                          <input
                            type="text"
                            value={newJobForm.work_shift}
                            onChange={(e) => setNewJobForm({ ...newJobForm, work_shift: e.target.value })}
                            placeholder="VD: 08:00 - 12:00"
                            style={{ width: '100%', fontSize: 13 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mức lương & Hình thức */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                          Mức lương (*)
                        </label>
                        <input
                          type="number"
                          required
                          value={newJobForm.salary}
                          onChange={(e) => setNewJobForm({ ...newJobForm, salary: e.target.value })}
                          style={{ width: '100%', fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                          Đơn vị tính lương
                        </label>
                        <CustomDropdown
                          value={newJobForm.salary_type}
                          onChange={(e) => setNewJobForm({ ...newJobForm, salary_type: e.target.value })}
                          options={[
                            { value: 'HOURLY', label: 'VNĐ/giờ' },
                            { value: 'FIXED', label: 'VNĐ/dự án' },
                            { value: 'MONTHLY', label: 'VNĐ/tháng' },
                          ]}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                          Hình thức
                        </label>
                        <CustomDropdown
                          value={newJobForm.work_type}
                          onChange={(e) => setNewJobForm({ ...newJobForm, work_type: e.target.value })}
                          options={[
                            { value: 'PART_TIME', label: 'Part-time' },
                            { value: 'FULL_TIME', label: 'Full-time' },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Địa điểm làm việc */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        Địa điểm làm việc (*)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                        value={newJobForm.location}
                        onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                        style={{ width: '100%', fontSize: 13 }}
                      />
                    </div>

                    {/* Hạn nhận hồ sơ & Liên hệ */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                          Hạn nhận hồ sơ
                        </label>
                        <input
                          type="date"
                          value={newJobForm.deadline}
                          onChange={(e) => setNewJobForm({ ...newJobForm, deadline: e.target.value })}
                          style={{ width: '100%', fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                          Email / SĐT liên hệ
                        </label>
                        <input
                          type="text"
                          value={newJobForm.contact_info}
                          onChange={(e) => setNewJobForm({ ...newJobForm, contact_info: e.target.value })}
                          style={{ width: '100%', fontSize: 13 }}
                        />
                      </div>
                    </div>

                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic', margin: '4px 0 10px 0' }}>
                      (*) Thông tin bắt buộc. Khi chỉnh sửa, biểu mẫu hiển thị dữ liệu tin đăng hiện tại.
                    </p>

                    {/* Action buttons matching Screen 11: HỦY, LƯU NHÁP, XEM TRƯỚC TIN ĐĂNG, ĐĂNG TIN TUYỂN DỤNG */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--color-lavender-surface)', paddingTop: 16 }}>
                      <Button variant="secondary" type="button" onClick={() => setActiveTab('employer_jobs')}>
                        HỦY
                      </Button>
                      <Button variant="secondary" type="button" onClick={() => showToast('Đã lưu bản nháp tin đăng thành công!')}>
                        LƯU NHÁP
                      </Button>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => {
                          setSelectedJob({
                            ...newJobForm,
                            company_name: currentUser?.full_name || 'TechCorp Vietnam',
                            created_at: new Date().toISOString(),
                          });
                          setJobDetailModalOpen(true);
                        }}
                      >
                        <Eye size={14} /> XEM TRƯỚC TIN ĐĂNG
                      </Button>
                      <Button variant="primary" type="submit">
                        <Send size={14} /> ĐĂNG TIN TUYỂN DỤNG
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 12: DANH SÁCH ỨNG VIÊN (EMPLOYER APPLICANTS REVIEW)                 */}
            {/* ========================================================================= */}
            {false && activeTab === 'applicants' && (
              <div style={{ maxWidth: 1140, margin: '0 auto', paddingBottom: 40 }}>
                {/* Header Banner */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                  paddingBottom: 14,
                  borderBottom: '1px solid var(--color-border)',
                  flexWrap: 'wrap',
                  gap: 12,
                }}>
                  <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                      Danh sách ứng viên
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 13.5, margin: 0 }}>
                      Xem thông tin hồ sơ CV, duyệt ứng tuyển và đánh giá sau khi hoàn thành công việc
                    </p>
                  </div>

                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveTab('employer_jobs')} 
                    style={{ padding: '7px 16px', fontSize: 13, gap: 6, borderColor: '#cbd5e1' }}
                  >
                    <ArrowLeft size={14} /> Quay lại Quản lý tin
                  </Button>
                </div>

                {/* Context card TIN ĐĂNG matching Wireframe Screen 12 */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 12,
                  padding: '16px 20px',
                  marginBottom: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}>
                  {/* Pill title TIN ĐĂNG */}
                  <div style={{
                    display: 'inline-block',
                    background: '#1e293b',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 800,
                    padding: '3px 14px',
                    borderRadius: 6,
                    letterSpacing: '0.04em',
                    marginBottom: 10,
                  }}>
                    TIN ĐĂNG
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                    Tin tuyển dụng: <span style={{ color: 'var(--color-primary)' }}>{activeJobForApplicants?.title || 'Nhân viên bán hàng part-time'}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 13, color: '#475569' }}>
                    <div>
                      Địa điểm: <strong style={{ color: '#1e293b' }}>{activeJobForApplicants?.location || 'Quận 1, TP. Hồ Chí Minh'}</strong>
                    </div>
                    <div>
                      Trạng thái tin: <strong style={{ color: activeJobForApplicants?.status === 'OPEN' ? '#047857' : 'var(--color-text-secondary)' }}>
                        {activeJobForApplicants?.status === 'OPEN' ? 'Đang tuyển' : 'Đã đóng'}
                      </strong>
                    </div>
                    <div>
                      Số lượng ứng viên: <strong style={{ color: '#6d28d9' }}>{filteredApplicants.length} hồ sơ</strong>
                    </div>
                  </div>
                </div>

                {/* Search & Filter Toolbar matching Wireframe:
                    [Tìm ứng viên..................]   [Tìm kiếm]   [Lọc trạng thái ứng viên v]
                */}
                <div style={{
                  background: '#ffffff',
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 20,
                  flexWrap: 'wrap',
                }}>
                  {/* Input Tìm ứng viên */}
                  <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200, display: 'flex', alignItems: 'center' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="Tìm ứng viên..."
                      value={applicantSearch}
                      onChange={(e) => setApplicantSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isImeComposing(e)) {
                          showToast(`Đang lọc ứng viên với từ khóa: "${applicantSearch}"`);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '9.5px 14px 9.5px 38px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13.5,
                        color: 'var(--color-text)',
                        outline: 'none',
                        background: '#ffffff',
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                    />
                    {applicantSearch && (
                      <button
                        onClick={() => setApplicantSearch('')}
                        style={{
                          position: 'absolute',
                          right: 10,
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: 14,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Button Tìm kiếm */}
                  <motion.button
                    whileHover={{ scale: 1.01, backgroundColor: 'var(--color-lavender-surface)' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      showToast(`Đã lọc danh sách: ${filteredApplicants.length} ứng viên`);
                    }}
                    style={{
                      padding: '9.5px 22px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      background: 'var(--color-background)',
                      color: '#1e293b',
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Tìm kiếm
                  </motion.button>

                  {/* Dropdown Lọc trạng thái ứng viên */}
                  <div style={{ flexShrink: 0, minWidth: 230 }}>
                    <CustomDropdown
                      value={applicantStatusFilter}
                      onChange={(e) => setApplicantStatusFilter(e.target.value)}
                      options={[
                        { value: 'ALL', label: 'Lọc trạng thái ứng viên (Tất cả)' },
                        { value: 'PENDING', label: 'Chờ duyệt' },
                        { value: 'ACCEPTED', label: 'Đã duyệt' },
                        { value: 'REJECTED', label: 'Từ chối' },
                        { value: 'COMPLETED', label: 'Hoàn thành công việc' },
                      ]}
                    />
                  </div>
                </div>

                {/* Table matching Wireframe Screen 12: STT | Họ và tên | Hồ sơ | Status | Thao tác | Đánh giá */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                      <thead>
                        <tr style={{
                          background: 'var(--color-background)',
                          borderBottom: '1px solid var(--color-border)',
                          color: '#475569',
                          fontSize: 12.5,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          <th style={{ padding: '14px 16px', textAlign: 'center', width: 60 }}>STT</th>
                          <th style={{ padding: '14px 16px', minWidth: 200 }}>Họ và tên</th>
                          <th style={{ padding: '14px 16px', textAlign: 'center', width: 130 }}>Hồ sơ</th>
                          <th style={{ padding: '14px 16px', textAlign: 'center', width: 150 }}>Status</th>
                          <th style={{ padding: '14px 16px', textAlign: 'center', width: 170 }}>Thao tác</th>
                          <th style={{ padding: '14px 16px', textAlign: 'center', width: 220 }}>Đánh giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplicants.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-secondary)' }}>
                              <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                                Không tìm thấy ứng viên nào phù hợp
                              </div>
                              <div style={{ fontSize: 13, color: '#94a3b8' }}>
                                Thử thay đổi từ khóa hoặc bộ lọc trạng thái
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredApplicants.map((app, idx) => {
                            const isPending = app.status === 'PENDING';
                            const isAccepted = app.status === 'ACCEPTED';
                            const isRejected = app.status === 'REJECTED';
                            const isCompleted = app.status === 'COMPLETED';

                            return (
                              <tr
                                key={app.id}
                                style={{
                                  borderBottom: '1px solid var(--color-lavender-surface)',
                                  transition: 'background-color 0.15s ease',
                                  background: '#ffffff',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                              >
                                {/* STT */}
                                <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                  {idx + 1}
                                </td>

                                {/* Họ và tên */}
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 14 }}>
                                    {app.student_name}
                                  </div>
                                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                    {app.university || 'Đại học Văn Lang'} • {app.major || 'Kế toán - Kiểm toán'}
                                  </div>
                                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                                    {app.student_email || 'student@vlu.edu.vn'}
                                  </div>
                                </td>

                                {/* Hồ sơ: Xem chi tiết */}
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedApplicant(app);
                                      setApplicantDetailModalOpen(true);
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      padding: '6px 12px',
                                      borderRadius: 6,
                                      border: '1px solid #cbd5e1',
                                      background: '#ffffff',
                                      color: '#4f46e5',
                                      fontSize: 12,
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                                      e.currentTarget.style.borderColor = '#4f46e5';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#ffffff';
                                      e.currentTarget.style.borderColor = '#cbd5e1';
                                    }}
                                    title="Xem chi tiết hồ sơ & CV ứng viên"
                                  >
                                    <FileText size={13} /> Xem chi tiết
                                  </button>
                                </td>

                                {/* Status */}
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    padding: '4px 11px',
                                    borderRadius: 999,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    background: isAccepted ? '#ecfdf5' : isPending ? '#fef3c7' : isRejected ? '#fff1f2' : 'var(--color-primary-light)',
                                    color: isAccepted ? '#047857' : isPending ? '#92400e' : isRejected ? '#be123c' : '#6d28d9',
                                    border: isAccepted ? '1px solid #a7f3d0' : isPending ? '1px solid #fde68a' : isRejected ? '1px solid #fecdd3' : '1px solid var(--color-border)',
                                  }}>
                                    <span style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      backgroundColor: isAccepted ? '#10b981' : isPending ? '#f59e0b' : isRejected ? '#ef4444' : '#8b5cf6',
                                    }} />
                                    {isPending && 'Chờ duyệt'}
                                    {isAccepted && 'Đã duyệt'}
                                    {isRejected && 'Từ chối'}
                                    {isCompleted && 'Hoàn thành công việc'}
                                  </span>
                                </td>

                                {/* Thao tác: Duyệt / Từ chối */}
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    {isPending ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateApplicationStatus(app.id, 'ACCEPTED')}
                                          style={{
                                            padding: '5px 12px',
                                            borderRadius: 6,
                                            border: 'none',
                                            background: '#16a34a',
                                            color: '#ffffff',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            boxShadow: '0 1px 2px rgba(22,163,74,0.2)',
                                          }}
                                          title="Chấp nhận hồ sơ ứng viên"
                                        >
                                          Duyệt
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                                          style={{
                                            padding: '5px 10px',
                                            borderRadius: 6,
                                            border: 'none',
                                            background: '#dc2626',
                                            color: '#ffffff',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            boxShadow: '0 1px 2px rgba(220,38,38,0.2)',
                                          }}
                                          title="Từ chối hồ sơ ứng viên"
                                        >
                                          Từ chối
                                        </button>
                                      </>
                                    ) : isAccepted ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>Đã duyệt</span>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#dc2626',
                                            fontSize: 11,
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            padding: 0,
                                          }}
                                        >
                                          Hủy
                                        </button>
                                      </div>
                                    ) : isRejected ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 12, color: '#be123c', fontWeight: 600 }}>Từ chối</span>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateApplicationStatus(app.id, 'ACCEPTED')}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#16a34a',
                                            fontSize: 11,
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            padding: 0,
                                          }}
                                        >
                                          Duyệt lại
                                        </button>
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: 12, color: '#6d28d9', fontWeight: 600 }}>Hoàn thành</span>
                                    )}
                                  </div>
                                </td>

                                {/* Đánh giá: Đánh giá ứng viên sau công việc */}
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReviewTarget({
                                        targetName: app.student_name,
                                        targetRole: 'Sinh viên ' + (app.university || 'Văn Lang'),
                                        jobTitle: activeJobForApplicants?.title || 'Kế toán',
                                        jobTime: 'Đã hoàn thành công việc',
                                      });
                                      setReviewModalOpen(true);
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 5,
                                      padding: '6px 14px',
                                      borderRadius: 6,
                                      border: 'none',
                                      background: 'var(--color-primary)',
                                      color: '#ffffff',
                                      fontSize: 12,
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      boxShadow: '0 1px 2px rgba(89,70,117,0.2)',
                                      transition: 'background-color 0.15s ease',
                                      whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a3865'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                                    title="Màn 13: Đánh giá chất lượng làm việc của ứng viên"
                                  >
                                    <Star size={12} color="#fbbf24" /> Đánh giá ứng viên sau công việc
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* FREELANCE PROPOSALS: QUẢN LÝ ĐỀ XUẤT NHẬN ĐƯỢC CỦA NHÀ TUYỂN DỤNG        */}
            {/* ========================================================================= */}
            {false && activeTab === 'employer_proposals' && (
              <EmployerProposalsPage
                currentUser={currentUser}
                showToast={showToast}
              />
            )}

            {/* ========================================================================= */}
            {/* WORK ASSIGNMENTS: QUẢN LÝ HỢP ĐỒNG CÔNG VIỆC (EMPLOYER ASSIGNMENTS)      */}
            {/* ========================================================================= */}
            {false && activeTab === 'employer_assignments' && (
              <EmployerAssignmentsPage
                currentUser={currentUser}
                showToast={showToast}
                onOpenReview={(target) => {
                  setReviewTarget(target);
                  setReviewModalOpen(true);
                }}
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
          fetchMyApplications();
          setActiveTab('student_apps');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        showToast={showToast}
      />

      {/* WF-S07: ĐỀ XUẤT DỰ ÁN FREELANCE (FREELANCE PROPOSAL FORM) */}
      <ProposalModal
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        job={applyTargetJob || selectedJob}
        currentUser={currentUser}
        onSuccess={() => {
          setActiveTab('student_proposals');
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
        onViewCompany={(companyName) => setEmployerProfileOpen(true)}
        onEditJob={(jobToEdit) => {
          setEditingEmployerJob(jobToEdit);
          setJobDetailModalOpen(false);
          setActiveTab('create_job');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onViewApplicants={(job) => {
          setJobDetailModalOpen(false);
          fetchApplicantsForJob(job);
        }}
      />

      {/* SCREEN 12: MODAL XEM CHI TIẾT HỒ SƠ ỨNG VIÊN */}
      {selectedApplicant && (
        <AnimatedModal
          isOpen={applicantDetailModalOpen}
          onClose={() => setApplicantDetailModalOpen(false)}
          maxWidth="640px"
        >
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '2px 10px', borderRadius: 999, border: '1px solid var(--color-border)' }}>
                  Hồ sơ ứng viên (Màn 12)
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '6px 0 2px 0' }}>
                  {selectedApplicant.student_name}
                </h2>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  Ứng tuyển vị trí: <strong>{activeJobForApplicants?.title || 'Kế toán'}</strong>
                </div>
              </div>

              <button
                onClick={() => setApplicantDetailModalOpen(false)}
                style={{
                  background: 'var(--color-lavender-surface)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ✕
              </button>
            </div>

            {/* Thông tin sinh viên */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div style={{ background: 'var(--color-background)', padding: 12, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Trường đào tạo</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>{selectedApplicant.university || 'Đại học Văn Lang'}</div>
              </div>
              <div style={{ background: 'var(--color-background)', padding: 12, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Chuyên ngành</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>{selectedApplicant.major || 'Kế toán - Kiểm toán'}</div>
              </div>
              <div style={{ background: 'var(--color-background)', padding: 12, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Email liên hệ</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{selectedApplicant.student_email || 'nguyen.van.chi@vlu.edu.vn'}</div>
              </div>
              <div style={{ background: 'var(--color-background)', padding: 12, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Số điện thoại</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{selectedApplicant.student_phone || '0901234567'}</div>
              </div>
            </div>

            {/* Thư giới thiệu */}
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Thư giới thiệu bản thân (Cover Letter)
              </h4>
              <div style={{ background: 'var(--color-background)', padding: 14, borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                {selectedApplicant.cover_letter || 'Kính gửi quý công ty, em mong muốn ứng tuyển vào vị trí này để rèn luyện kỹ năng chuyên môn và đóng góp vào sự phát triển của doanh nghiệp.'}
              </div>
            </div>

            {/* CV đính kèm */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff',
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} color="#4f46e5" />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>
                    CV_UngTuyen_{selectedApplicant.student_name.replace(/\s+/g, '_')}.pdf
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Đã xác thực định dạng PDF • 1.2 MB</div>
                </div>
              </div>

              <a
                href={selectedApplicant.cv_url || '#'}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 6,
                  background: 'var(--color-lavender-surface)',
                  color: '#4f46e5',
                  fontSize: 12.5,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <Download size={14} /> Tải / Xem CV
              </a>
            </div>

            {/* Thao tác duyệt */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleUpdateApplicationStatus(selectedApplicant.id, 'ACCEPTED');
                    setApplicantDetailModalOpen(false);
                  }}
                  style={{ padding: '7px 16px', fontSize: 13, background: '#16a34a' }}
                >
                  ✅ Phê duyệt hồ sơ
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateApplicationStatus(selectedApplicant.id, 'REJECTED');
                    setApplicantDetailModalOpen(false);
                  }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 6,
                    border: '1px solid #fecdd3',
                    background: '#fff1f2',
                    color: '#dc2626',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ❌ Từ chối
                </button>
              </div>

              <Button
                variant="secondary"
                onClick={() => setApplicantDetailModalOpen(false)}
                style={{ padding: '7px 16px', fontSize: 13 }}
              >
                Đóng
              </Button>
            </div>
          </div>
        </AnimatedModal>
      )}

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

      {/* SCREEN 9: PROFILE CÁ NHÂN SINH VIÊN */}
      <StudentProfileModal
        isOpen={studentProfileOpen}
        onClose={() => setStudentProfileOpen(false)}
        currentUser={currentUser}
        onSave={(data) => {
          if (currentUser?.id) {
            localStorage.setItem(`jobnest_student_profile_${currentUser.id}`, JSON.stringify(data));
          }
          const updatedUser = {
            ...(currentUser || {}),
            ...data,
            is_profile_completed: true,
            full_name: data.fullName || currentUser?.full_name,
            phone: data.phone || currentUser?.phone,
            university: data.university || currentUser?.university,
            major: data.major || currentUser?.major,
            location: data.address || currentUser?.location,
            bio: data.bio || currentUser?.bio,
            skills: data.skills || currentUser?.skills,
          };
          setCurrentUser(updatedUser);
          setStudentProfileOpen(false);

          if (pendingApplyJob) {
            const target = pendingApplyJob;
            setPendingApplyJob(null);
            handleNavigateToJobDetail(target);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast(`Đã lưu thông tin hồ sơ sinh viên thành công! Bạn đang xem lại công việc "${target.title}".`, 'success');
          } else {
            showToast('Đã lưu thông tin hồ sơ sinh viên thành công! Bạn có thể nhấn "Ứng tuyển ngay" khi đã sẵn sàng.', 'success');
          }
        }}
      />

      {/* SCREEN 14: PROFILE DOANH NGHIỆP / NHÀ TUYỂN DỤNG */}
      <EmployerProfileModal
        isOpen={employerProfileOpen}
        onClose={() => setEmployerProfileOpen(false)}
        currentUser={currentUser}
        onSave={(data) => {
          if (currentUser?.id) {
            localStorage.setItem(`jobnest_employer_profile_${currentUser.id}`, JSON.stringify(data));
          }
          const updatedUser = {
            ...(currentUser || {}),
            ...data,
            is_profile_completed: true,
            company_name: data.companyName || currentUser?.company_name,
            full_name: data.contactPerson || currentUser?.full_name,
            phone: data.phone || currentUser?.phone,
            tax_code: data.taxCode || currentUser?.tax_code,
            location: data.address || currentUser?.location,
            bio: data.description || currentUser?.bio,
          };
          setCurrentUser(updatedUser);
          showToast('Đã cập nhật hồ sơ doanh nghiệp thành công!', 'success');
        }}
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
          onOpenStudentProfile={() => setStudentProfileOpen(true)}
          onOpenEmployerProfile={() => setEmployerProfileOpen(true)}
          onOpenPolicy={(tab) => {
            setPolicyInitialTab(tab || 'terms');
            setPolicyModalOpen(true);
          }}
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

      {/* POLICY & LEGAL MODAL */}
      <PolicyModal
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        initialTab={policyInitialTab}
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
