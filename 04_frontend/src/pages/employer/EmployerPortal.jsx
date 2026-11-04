import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Users, FileText, Clock, CheckCircle2, 
  XCircle, AlertCircle, ArrowRight, Plus, RefreshCw, 
  Eye, Calendar, DollarSign, Building2, User, ChevronRight,
  ShieldCheck, AlertTriangle, ExternalLink, Filter, Search,
  Bell, LayoutDashboard, Award, Star, GraduationCap
} from 'lucide-react';
import { Button } from '../../components/ui';

// Import all 12 Wireframe Employer Sub-pages (WF-E01 to WF-E12)
import EmployerDashboardPage from './EmployerDashboardPage';             // WF-E01
import EmployerPersonalProfilePage from './EmployerPersonalProfilePage'; // WF-E02 (Personal Profile only, no company profile)
import EmployerVerificationCenterPage from './EmployerVerificationCenterPage'; // WF-E03 (Standalone verification center)
import EmployerJobsPage from './EmployerJobsPage';                       // WF-E04 (Job list with 7 filters & moderation_reason)
import EmployerCreateJobPage from './EmployerCreateJobPage';             // WF-E05 (Create/Edit Job with PT/SS/FL variants & verification gate)
import EmployerApplicantsPage from './EmployerApplicantsPage';           // WF-E06 (Part-time applicants, no Accept button)
import EmployerProposalsPage from './EmployerProposalsPage';             // WF-E07 (Freelance proposals, no Accept button)
import EmployerCandidateSelectionPage from './EmployerCandidateSelectionPage'; // WF-E08 (Rule A3 Selection & Work Assignment)
import EmployerAssignmentsPage from './EmployerAssignmentsPage';         // WF-E09 (Assignment management by student)
import EmployerDeliverableReviewPage from './EmployerDeliverableReviewPage'; // WF-E10 (Deliverable review v1/v2, mandatory revision reason)
import EmployerReviewStudentPage from './EmployerReviewStudentPage';     // WF-E11 (5-star rating & review for completed assignments)
import EmployerNotificationsPage from './EmployerNotificationsPage';     // WF-E12 (Notification list read/unread)

export default function EmployerPortal({
  currentUser,
  initialTab = 'dashboard',
  initialEditingJob = null,
  onNavigateHome,
  onNavigateLogin,
  onNavigateMarketplace,
  showToast
}) {
  // Navigation State inside Employer Workspace:
  // 'dashboard' (WF-E01)
  // 'profile' (WF-E02)
  // 'verification' (WF-E03)
  // 'jobs' (WF-E04)
  // 'create_job' (WF-E05)
  // 'applicants' (WF-E06)
  // 'proposals' (WF-E07)
  // 'selection' (WF-E08)
  // 'assignments' (WF-E09)
  // 'deliverable' (WF-E10)
  // 'review_student' (WF-E11)
  // 'notifications' (WF-E12)
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editingJob, setEditingJob] = useState(initialEditingJob);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [selectedAssignmentForSubflow, setSelectedAssignmentForSubflow] = useState(null);

  // Sync initialTab & editingJob when changed from outside
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (initialEditingJob !== undefined) {
      setEditingJob(initialEditingJob);
    }
  }, [initialTab, initialEditingJob]);

  // =========================================================================
  // 1. STRICT ROLE GUARD
  // Chặn hoàn toàn nếu User không phải Role EMPLOYER (ví dụ STUDENT hoặc GUEST)
  // =========================================================================
  const isEmployer = currentUser?.token && currentUser?.role === 'EMPLOYER';

  if (!isEmployer) {
    return (
      <div style={{
        maxWidth: 720,
        margin: '60px auto',
        padding: '48px 36px',
        background: '#ffffff',
        borderRadius: 24,
        border: '1.5px solid #FEE2E2',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#FEF2F2',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          border: '2px solid #FCA5A5'
        }}>
          <AlertTriangle size={40} />
        </div>

        <span style={{
          display: 'inline-block',
          background: '#FEE2E2',
          color: '#B91C1C',
          fontSize: 12.5,
          fontWeight: 800,
          padding: '4px 14px',
          borderRadius: 20,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: 14
        }}>
          403 FORBIDDEN — KHÔNG CÓ QUYỀN TRUY CẬP
        </span>

        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1E293B', margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>
          Khu vực bảo mật dành riêng cho Nhà tuyển dụng
        </h2>

        <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.6, marginBottom: 32, maxWidth: 540, margin: '0 auto 32px' }}>
          {currentUser?.token ? (
            <>
              Bạn hiện đang đăng nhập với vai trò <strong style={{ color: '#0F172A' }}>{currentUser.role === 'STUDENT' ? 'Sinh viên' : currentUser.role}</strong>. 
              Toàn bộ các phân hệ quản lý tuyển dụng từ <strong>WF-E01 đến WF-E12</strong> chỉ cấp quyền cho tài khoản <code>EMPLOYER</code>.
            </>
          ) : (
            <>
              Bạn đang ở chế độ Khách vãng lai (chưa đăng nhập). 
              Vui lòng đăng nhập với tài khoản <strong>Nhà tuyển dụng</strong> (ví dụ: <code>employer.test@vlu.edu.vn</code>) để tiếp tục.
            </>
          )}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={onNavigateHome}
            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700 }}
          >
            Quay lại Trang chủ
          </Button>

          <Button
            variant="primary"
            onClick={onNavigateLogin}
            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700 }}
          >
            Đăng nhập tài khoản Nhà tuyển dụng
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN UNIFIED EMPLOYER PORTAL LAYOUT (FULL-WIDTH 100vw)
  // Sidebar sát mép trái (260px) + Main Content chiếm toàn bộ chiều rộng còn lại
  // =========================================================================
  return (
    <div className="employer-portal-container" style={{
      width: '100%',
      minHeight: 'calc(100vh - 74px)',
      background: '#F8FAFC',
      boxSizing: 'border-box'
    }}>
      
      {/* 2-COLUMN FULL-WIDTH LAYOUT: SIDEBAR SÁT MÉP TRÁI + MAIN CONTENT TOÀN BỘ PHẦN CÒN LẠI */}
      <div className="employer-grid-layout" style={{
        display: 'grid',
        gridTemplateColumns: '260px minmax(0, 1fr)',
        minHeight: 'calc(100vh - 74px)',
        alignItems: 'stretch',
        width: '100%'
      }}>
        
        {/* ================= REUSABLE LEFT SIDEBAR (SÁT MÉP TRÁI VIEWPORT) ================= */}
        <aside className="employer-sidebar-aside" style={{
          width: 260,
          background: '#ffffff',
          borderRight: '1.5px solid #E2E8F0',
          padding: '24px 16px',
          boxSizing: 'border-box',
          position: 'sticky',
          top: 74,
          height: 'calc(100vh - 74px)',
          overflowY: 'auto'
        }}>
          {/* ================= PHẦN THÔNG TIN TÀI KHOẢN (REFERENCE IMAGE 1) ================= */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingBottom: 16,
            marginBottom: 16,
            borderBottom: '1px solid #E2E8F0'
          }}>
            {/* Avatar / Logo doanh nghiệp */}
            <div style={{
              width: 62,
              height: 62,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 10,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              border: '2px solid #ffffff'
            }}>
              {currentUser?.company_name?.charAt(0) || currentUser?.full_name?.charAt(0) || 'C'}
            </div>

            {/* Tên doanh nghiệp */}
            <h3 style={{
              fontSize: 14.5,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 4px 0',
              lineHeight: 1.3
            }}>
              {currentUser?.company_name || currentUser?.full_name || 'Công Ty Công Nghệ Giáo Dục Văn Lang (VLU Tech)'}
            </h3>

            {/* Email */}
            <div style={{
              fontSize: 12,
              color: '#64748B',
              marginBottom: 8,
              wordBreak: 'break-all'
            }}>
              {currentUser?.email || 'employer.test@vlu.edu.vn'}
            </div>

            {/* Trạng thái xác minh */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: '#ECFDF5',
              color: '#059669',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 12,
              border: '1.5px solid #A7F3D0'
            }}>
              <ShieldCheck size={12} /> Đã xác thực uy tín
            </span>
          </div>

          {/* Sidebar Menu Items: 8 mục chuẩn xác 100% Wireframe WF-E01 draw.io */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'verification', label: 'Verification', icon: ShieldCheck },
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'applicants', label: 'Applicants', icon: Users },
              { id: 'proposals', label: 'Proposals', icon: FileText },
              { id: 'assignments', label: 'Assignments', icon: Clock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
            ].map(item => {
              const isActive = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 14px',
                    borderRadius: 6,
                    border: '1.5px solid #000000',
                    background: isActive ? '#94A3B8' : '#ffffff',
                    color: '#000000',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = '#F1F5F9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    border: '1.5px solid #000000',
                    borderRadius: 3,
                    background: isActive ? '#000000' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isActive ? (
                      <span style={{ width: 8, height: 8, background: '#ffffff', borderRadius: 2 }} />
                    ) : null}
                  </div>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <IconComp size={16} color={isActive ? '#000000' : '#475569'} />
                </button>
              );
            })}
          </nav>

          {/* Quick Action: Đăng tin mới */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={() => {
                setEditingJob(null);
                setActiveTab('create_job');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 6,
                border: '1.5px solid #000000',
                background: activeTab === 'create_job' ? '#94A3B8' : '#ffffff',
                color: '#000000',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={15} />
              <span>+ Đăng tin mới</span>
            </button>
          </div>

          {/* Nút chuyển đổi sang Trường 2: Không gian nghiên cứu thị trường */}
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={() => {
                if (onNavigateMarketplace) onNavigateMarketplace();
                else if (onNavigateHome) onNavigateHome();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 6,
                border: '1.5px dashed #64748B',
                background: '#F8FAFC',
                color: '#334155',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F1F5F9';
                e.currentTarget.style.borderColor = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.borderColor = '#64748B';
              }}
              title="Chuyển sang Trường 2: Không gian Nghiên cứu thị trường việc làm"
            >
              <Search size={14} color="#059669" />
              <span>Khám phá thị trường</span>
            </button>
          </div>
        </aside>

        {/* ================= RIGHT MAIN CONTENT AREA (FULL REMAINING WIDTH) ================= */}
        <main style={{
          minWidth: 0,
          width: '100%',
          maxWidth: 'none',
          padding: '28px 36px 60px 36px',
          boxSizing: 'border-box'
        }}>
          {/* WF-E01: Employer Dashboard */}
          {activeTab === 'dashboard' && (
            <EmployerDashboardPage
              currentUser={currentUser}
              onNavigateTab={(tab) => {
                if (tab === 'employer_jobs' || tab === 'jobs') setActiveTab('jobs');
                else if (tab === 'employer_proposals' || tab === 'proposals') setActiveTab('proposals');
                else if (tab === 'employer_assignments' || tab === 'assignments') setActiveTab('assignments');
                else if (tab === 'employer_profile' || tab === 'profile') setActiveTab('profile');
                else setActiveTab(tab);
              }}
              onSelectJobForApplicants={(job) => {
                setSelectedJobForApplicants(job);
                setActiveTab('applicants');
              }}
              onOpenCreateJob={() => {
                setEditingJob(null);
                setActiveTab('create_job');
              }}
              onOpenProfile={() => setActiveTab('profile')}
              onNavigateHome={onNavigateHome}
              onNavigateLogin={onNavigateLogin}
              showToast={showToast}
            />
          )}

          {/* WF-E02: Personal Profile (Avatar, display_name, bio, location, readonly email & phone) */}
          {activeTab === 'profile' && (
            <EmployerPersonalProfilePage
              currentUser={currentUser}
              showToast={showToast}
              onNavigateVerification={() => setActiveTab('verification')}
            />
          )}

          {/* WF-E03: Verification Center (Separate screen for Email OTP & Phone OTP) */}
          {activeTab === 'verification' && (
            <EmployerVerificationCenterPage
              currentUser={currentUser}
              showToast={showToast}
              onNavigateJobs={() => setActiveTab('jobs')}
              onNavigateCreateJob={() => {
                setEditingJob(null);
                setActiveTab('create_job');
              }}
              onNavigateProfile={() => setActiveTab('profile')}
            />
          )}

          {/* WF-E04: Job List (7 filters, moderation_reason for REJECTED) */}
          {activeTab === 'jobs' && (
            <EmployerJobsPage
              currentUser={currentUser}
              onNavigateCreateJob={() => {
                setEditingJob(null);
                setActiveTab('create_job');
              }}
              onEditJob={(job) => {
                setEditingJob(job);
                setActiveTab('create_job');
              }}
              onViewApplicants={(job) => {
                setSelectedJobForApplicants(job);
                setActiveTab('applicants');
              }}
              showToast={showToast}
            />
          )}

          {/* WF-E05: Create / Edit Job (Dynamic work types: PT, SS, FL & verification prerequisite) */}
          {activeTab === 'create_job' && (
            <EmployerCreateJobPage
              currentUser={currentUser}
              editingJob={editingJob}
              onCancel={() => setActiveTab('jobs')}
              onSuccess={() => setActiveTab('jobs')}
              onNavigateVerification={() => setActiveTab('verification')}
              showToast={showToast}
            />
          )}

          {/* WF-E06: Applicant Management (Part-time / Seasonal applicants, no Accept button) */}
          {activeTab === 'applicants' && (
            <EmployerApplicantsPage
              currentUser={currentUser}
              selectedJob={selectedJobForApplicants}
              onNavigateSelection={(job) => {
                setSelectedJobForApplicants(job);
                setActiveTab('selection');
              }}
              onNavigateAssignments={() => setActiveTab('assignments')}
              showToast={showToast}
            />
          )}

          {/* WF-E07: Proposal Management (Freelance proposals, no Accept button) */}
          {activeTab === 'proposals' && (
            <EmployerProposalsPage
              currentUser={currentUser}
              selectedJob={selectedJobForApplicants}
              onNavigateSelection={(job) => {
                setSelectedJobForApplicants(job);
                setActiveTab('selection');
              }}
              onNavigateAssignments={() => setActiveTab('assignments')}
              showToast={showToast}
            />
          )}

          {/* WF-E08: Candidate Selection (Single approval entry point enforcing Rule A3) */}
          {activeTab === 'selection' && (
            <EmployerCandidateSelectionPage
              currentUser={currentUser}
              job={selectedJobForApplicants}
              onBack={() => setActiveTab('applicants')}
              onNavigateAssignments={() => setActiveTab('assignments')}
              showToast={showToast}
            />
          )}

          {/* WF-E09: Assignment Management (Progress table by student with E10/E11 links) */}
          {activeTab === 'assignments' && (
            <EmployerAssignmentsPage
              currentUser={currentUser}
              onNavigateDeliverable={(assignment) => {
                setSelectedAssignmentForSubflow(assignment);
                setActiveTab('deliverable');
              }}
              onNavigateReview={(assignment) => {
                setSelectedAssignmentForSubflow(assignment);
                setActiveTab('review_student');
              }}
              showToast={showToast}
            />
          )}

          {/* WF-E10: Deliverable Review (v1, v2 history, mandatory revision note) */}
          {activeTab === 'deliverable' && (
            <EmployerDeliverableReviewPage
              currentUser={currentUser}
              assignment={selectedAssignmentForSubflow}
              onBack={() => setActiveTab('assignments')}
              onSuccess={() => setActiveTab('assignments')}
              showToast={showToast}
            />
          )}

          {/* WF-E11: Review Student (5-star rating for completed assignments) */}
          {activeTab === 'review_student' && (
            <EmployerReviewStudentPage
              currentUser={currentUser}
              assignment={selectedAssignmentForSubflow}
              onBack={() => setActiveTab('assignments')}
              onSuccess={() => setActiveTab('assignments')}
              showToast={showToast}
            />
          )}

          {/* WF-E12: Notifications (Read / Unread filter & navigation) */}
          {activeTab === 'notifications' && (
            <EmployerNotificationsPage
              currentUser={currentUser}
              showToast={showToast}
              onNavigateTab={(tab) => {
                if (tab === 'employer_jobs' || tab === 'jobs') setActiveTab('jobs');
                else if (tab === 'employer_proposals' || tab === 'proposals') setActiveTab('proposals');
                else if (tab === 'employer_assignments' || tab === 'assignments') setActiveTab('assignments');
                else setActiveTab(tab);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
