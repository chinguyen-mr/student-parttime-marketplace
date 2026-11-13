import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, FileText, CheckCircle2, XCircle, Clock, 
  Eye, Award, Building2, Search, Filter, AlertCircle, 
  ExternalLink, ChevronRight, UserCheck, ShieldCheck, 
  ArrowRight, Sparkles, AlertTriangle
} from 'lucide-react';
import { Button, AnimatedModal } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';
import { DEFAULT_APPLICANTS_KETOAN, DEFAULT_EMPLOYER_JOBS } from '../../App';

export default function EmployerApplicantsPage({
  currentUser,
  selectedJob = null,
  showToast,
  onNavigateSelection,
  onNavigateAssignments
}) {
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' (WF-E06) | 'proposals' (WF-E07)
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [currentJobId, setCurrentJobId] = useState(selectedJob?.id || 'ALL');

  // Applications & Proposals state
  const [applications, setApplications] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [appFilter, setAppFilter] = useState('ALL'); // ALL, PENDING, SHORTLISTED, REJECTED
  const [propFilter, setPropFilter] = useState('ALL'); // ALL, SUBMITTED, REVIEWING, REJECTED

  // WF-E08: Candidate Selection (A3 Rule) Modal State
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [targetJobForSelection, setTargetJobForSelection] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [submittingSelection, setSubmittingSelection] = useState(false);

  // WF-E13: Student Profile View Modal State
  const [viewingStudent, setViewingStudent] = useState(null);

  // Fetch Jobs & Data
  const fetchData = async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${currentUser.token}` };

      // 1. Fetch Employer's Jobs
      const resJobs = await fetch(`${API_BASE}/jobs/my-jobs`, { headers });
      const dataJobs = await resJobs.json();
      let fetchedJobs = [];
      if (dataJobs.success && Array.isArray(dataJobs.data)) {
        fetchedJobs = dataJobs.data;
        setJobs(fetchedJobs);
      } else if (DEFAULT_EMPLOYER_JOBS) {
        setJobs(DEFAULT_EMPLOYER_JOBS);
        fetchedJobs = DEFAULT_EMPLOYER_JOBS;
      }

      // 2. Fetch Proposals (GET /api/proposals/employer-proposals)
      try {
        const resProp = await fetch(`${API_BASE}/proposals/employer-proposals`, { headers });
        const dataProp = await resProp.json();
        if (dataProp.success && Array.isArray(dataProp.data)) {
          setProposals(dataProp.data);
        }
      } catch (err) {
        console.warn('Error fetching proposals:', err);
      }

      // 3. Fetch Applications from jobs
      let compiledApps = [];
      try {
        const jobsToCheck = fetchedJobs.slice(0, 5);
        for (const j of jobsToCheck) {
          if (!j.id) continue;
          const resApp = await fetch(`${API_BASE}/applications/job/${j.id}`, { headers });
          const dataApp = await resApp.json();
          if (dataApp.success && Array.isArray(dataApp.data)) {
            compiledApps.push(...dataApp.data.map(a => ({ ...a, job_title: j.title, job_id: j.id })));
          }
        }
      } catch (err) {
        console.warn('Error fetching job apps:', err);
      }

      if (compiledApps.length === 0 && DEFAULT_APPLICANTS_KETOAN) {
        compiledApps = DEFAULT_APPLICANTS_KETOAN.map(a => ({
          ...a,
          job_id: fetchedJobs[0]?.id || 1,
          job_title: fetchedJobs[0]?.title || 'Nhân viên kế toán part-time'
        }));
      }

      setApplications(compiledApps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Update current job if prop changes
  useEffect(() => {
    if (selectedJob) {
      setCurrentJobId(selectedJob.id);
      if (selectedJob.work_type === 'FREELANCE') {
        setActiveTab('proposals');
      } else {
        setActiveTab('applications');
      }
    }
  }, [selectedJob]);

  // Filtered Applications (WF-E06)
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (currentJobId !== 'ALL' && String(app.job_id) !== String(currentJobId)) return false;
      if (appFilter === 'PENDING' && app.status !== 'PENDING') return false;
      if (appFilter === 'SHORTLISTED' && app.status !== 'SHORTLISTED') return false;
      if (appFilter === 'REJECTED' && app.status !== 'REJECTED') return false;
      return true;
    });
  }, [applications, currentJobId, appFilter]);

  // Filtered Proposals (WF-E07)
  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      if (currentJobId !== 'ALL' && String(p.job_id) !== String(currentJobId)) return false;
      if (propFilter === 'SUBMITTED' && p.status !== 'SUBMITTED' && p.status !== 'PENDING') return false;
      if (propFilter === 'REVIEWING' && p.status !== 'REVIEWING') return false;
      if (propFilter === 'REJECTED' && p.status !== 'REJECTED') return false;
      return true;
    });
  }, [proposals, currentJobId, propFilter]);

  // Handle Mark Shortlist / Reviewing
  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Không cập nhật được trạng thái hồ sơ.');
      showToast(`Đã cập nhật trạng thái hồ sơ thành: ${newStatus}`, 'success');
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      // Không đổi giao diện khi server chưa lưu — trước đây báo "thành công" dù API lỗi
      showToast(formatApiError(err, 'Không cập nhật được trạng thái hồ sơ'), 'error');
    }
  };

  // Open Selection Screen/Modal (WF-E08)
  const handleOpenSelection = (targetJob) => {
    if (onNavigateSelection) {
      onNavigateSelection(targetJob);
      return;
    }
    setTargetJobForSelection(targetJob);
    setSelectedCandidateId(null);
    setSelectionModalOpen(true);
  };

  // Submit Candidate Selection (WF-E08 - A3 RULE Enforcement)
  const handleConfirmSelection = async () => {
    if (!selectedCandidateId || !targetJobForSelection) {
      if (showToast) showToast('Vui lòng chọn 1 ứng viên xuất sắc nhất để chấp nhận!', 'error');
      return;
    }

    try {
      setSubmittingSelection(true);
      const isFreelance = targetJobForSelection.work_type === 'FREELANCE';
      const payload = isFreelance
        ? { proposalIds: [parseInt(selectedCandidateId, 10)] }
        : { applicationIds: [parseInt(selectedCandidateId, 10)] };

      const res = await fetch(`${API_BASE}/jobs/${targetJobForSelection.id}/selections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) {
          showToast(
            'Tuyển ứng viên thành công! Đã kích hoạt hợp đồng làm việc.',
            'success'
          );
        }
        setSelectionModalOpen(false);
        fetchData();
        if (onNavigateAssignments) {
          setTimeout(() => onNavigateAssignments(), 1200);
        }
      } else {
        throw new Error(data.message || 'Lỗi tuyển chọn ứng viên');
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Lỗi kích hoạt hợp đồng (Rule A3)'), 'error');
    } finally {
      setSubmittingSelection(false);
    }
  };

  // Open Student Profile View (WF-E13)
  const handleViewStudentProfile = (student) => {
    setViewingStudent(student);
  };

  return (
    <div style={{ width: '100%', maxWidth: 'none', paddingBottom: 60 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
            QUẢN LÝ ỨNG VIÊN & ĐỀ XUẤT
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            Hồ sơ Ứng tuyển & Tuyển chọn Ứng viên
          </h1>
        </div>

        {/* Job Selection Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            Lọc theo tin tuyển dụng:
          </span>
          <select
            value={currentJobId}
            onChange={(e) => setCurrentJobId(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              fontSize: 13.5,
              fontWeight: 600,
              background: '#ffffff',
              maxWidth: 320
            }}
          >
            <option value="ALL">Tất cả tin tuyển dụng ({jobs.length})</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                #{j.id} - {j.title} ({j.work_type || 'PART_TIME'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs: Applications vs Proposals */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setActiveTab('applications')}
            style={{
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'applications' ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === 'applications' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Users size={16} /> Đơn ứng tuyển Part-time
            <span style={{ fontSize: 11, background: '#E2E8F0', padding: '2px 8px', borderRadius: 10, color: '#334155' }}>
              {filteredApplications.length}
            </span>
          </button>

          {/* Tab Đề xuất Freelance đã tắt: JobNest chỉ có Part-time/Full-time */}
          {false && <button
            onClick={() => setActiveTab('proposals')}
            style={{
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'proposals' ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === 'proposals' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <FileText size={16} /> Đề xuất Freelance
            <span style={{ fontSize: 11, background: '#E2E8F0', padding: '2px 8px', borderRadius: 10, color: '#334155' }}>
              {filteredProposals.length}
            </span>
          </button>}
        </div>

        {/* CTA to WF-E08 Candidate Selection */}
        {jobs.length > 0 && (
          <Button
            variant="primary"
            onClick={() => {
              const target = jobs.find(j => String(j.id) === String(currentJobId)) || jobs[0];
              handleOpenSelection(target);
            }}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: 'var(--shadow-sm)' }}
          >
            <UserCheck size={16} /> Tuyển chọn ứng viên chính thức (WF-E08 A3)
          </Button>
        )}
      </div>

      {/* ================= TAB 1: WF-E06 — APPLICANT MANAGEMENT ================= */}
      {activeTab === 'applications' && (
        <div>
          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'Tất cả hồ sơ' },
              { id: 'PENDING', label: 'Chờ duyệt (APPLIED)' },
              { id: 'SHORTLISTED', label: 'Rút gọn (SHORTLISTED)' },
              { id: 'REJECTED', label: 'Từ chối (REJECTED)' },
              { id: 'WITHDRAWN', label: 'Đã hủy / Rút đơn (WITHDRAWN)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAppFilter(tab.id)}
                style={{
                  background: appFilter === tab.id ? 'var(--color-primary)' : '#ffffff',
                  color: appFilter === tab.id ? '#ffffff' : 'var(--color-text-secondary)',
                  border: '1px solid',
                  borderColor: appFilter === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
                  borderRadius: 20,
                  padding: '5px 14px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredApplications.length === 0 ? (
            <EmptyState
              title="Chưa có hồ sơ ứng tuyển nào"
              description="Hiện tại chưa có sinh viên nộp hồ sơ cho tiêu chí lọc đã chọn."
            />
          ) : (
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: '#FAFAFD', borderBottom: '2px solid #F1F5F9', color: 'var(--color-text-secondary)', fontSize: 12.5, textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Sinh viên</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Vị trí / Tin tuyển dụng</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>CV / Hồ sơ</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Thời gian</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Trạng thái</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app, index) => (
                    <tr key={app.id || index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'var(--color-lavender-light)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 800
                          }}>
                            {app.student_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                              {app.student_name || 'Dương Hữu Anh'}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                              {app.university || 'Đại học Văn Lang'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        {app.job_title || 'Lập trình viên ReactJS'}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <a
                          href={app.cv_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                        >
                          <FileText size={14} /> Xem CV (PDF)
                        </a>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)', fontSize: 12.5 }}>
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString('vi-VN') : 'Hôm nay'}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {app.status === 'WITHDRAWN' ? (
                          <div>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 700,
                              background: '#F1F5F9',
                              color: '#64748B'
                            }}>
                              Đã hủy ứng tuyển
                            </span>
                            {app.withdraw_reason && (
                              <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3, fontStyle: 'italic', maxWidth: 200 }} title={app.withdraw_reason}>
                                Lý do: {app.withdraw_reason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 700,
                            background: app.status === 'SHORTLISTED' ? '#ECFDF5' : app.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                            color: app.status === 'SHORTLISTED' ? '#047857' : app.status === 'REJECTED' ? '#B91C1C' : '#B45309'
                          }}>
                            {app.status === 'SHORTLISTED' ? 'Rút gọn' : app.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleViewStudentProfile(app)}
                            title="Xem chi tiết hồ sơ sinh viên"
                            style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer' }}
                          >
                            Xem hồ sơ
                          </button>

                          {app.status !== 'WITHDRAWN' ? (
                            <>
                              <button
                                onClick={() => handleUpdateApplicationStatus(app.id, 'SHORTLISTED')}
                                style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 6, padding: '5px 8px', fontSize: 12, fontWeight: 700, color: '#047857', cursor: 'pointer' }}
                              >
                                Rút gọn
                              </button>

                              <button
                                onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                                style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 6, padding: '5px 8px', fontSize: 12, fontWeight: 700, color: '#BE123C', cursor: 'pointer' }}
                              >
                                Từ chối
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: 11.5, color: '#94A3B8', fontStyle: 'italic', padding: '5px 4px' }}>
                              Đã hủy
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: WF-E07 — PROPOSAL MANAGEMENT ================= */}
      {activeTab === 'proposals' && (
        <div>
          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'Tất cả đề xuất' },
              { id: 'SUBMITTED', label: 'Mới nộp (SUBMITTED)' },
              { id: 'REVIEWING', label: 'Đang xem xét (REVIEWING)' },
              { id: 'REJECTED', label: 'Từ chối (REJECTED)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPropFilter(tab.id)}
                style={{
                  background: propFilter === tab.id ? 'var(--color-primary)' : '#ffffff',
                  color: propFilter === tab.id ? '#ffffff' : 'var(--color-text-secondary)',
                  border: '1px solid',
                  borderColor: propFilter === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
                  borderRadius: 20,
                  padding: '5px 14px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredProposals.length === 0 ? (
            <EmptyState
              title="Chưa có đề xuất Freelance nào"
              description="Hiện tại chưa có sinh viên nộp báo giá dự án theo tiêu chí lọc này."
            />
          ) : (
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: '#FAFAFD', borderBottom: '2px solid #F1F5F9', color: 'var(--color-text-secondary)', fontSize: 12.5, textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Freelancer / Sinh viên</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Dự án Freelance</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Thời gian dự kiến</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Giá đề xuất (VNĐ)</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700 }}>Trạng thái</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProposals.map((prop, index) => (
                    <tr key={prop.id || index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: '#EEF2FF',
                            color: '#4F46E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 800
                          }}>
                            {prop.student_name?.charAt(0) || 'F'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                              {prop.student_name || 'Vũ Thu Nam'}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                              {prop.university || 'Đại học Văn Lang'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        {prop.job_title || 'Thiết kế Banner Sự Kiện'}
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)' }}>
                        {prop.estimated_duration || '7 ngày'}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {prop.proposed_price ? `${Number(prop.proposed_price).toLocaleString()} đ` : '3.200.000 đ'}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 16,
                          fontSize: 12,
                          fontWeight: 700,
                          background: prop.status === 'REVIEWING' ? '#EEF2FF' : prop.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                          color: prop.status === 'REVIEWING' ? '#4F46E5' : prop.status === 'REJECTED' ? '#B91C1C' : '#B45309'
                        }}>
                          {prop.status === 'REVIEWING' ? 'Đang xem xét' : prop.status === 'REJECTED' ? 'Từ chối' : 'Mới nộp'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleViewStudentProfile(prop)}
                            style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer' }}
                          >
                            Hồ sơ (WF-E13)
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: WF-E08 — CANDIDATE SELECTION (A3 RULE ENFORCEMENT) ================= */}
      {selectionModalOpen && targetJobForSelection && (
        <AnimatedModal isOpen={selectionModalOpen} onClose={() => setSelectionModalOpen(false)} maxWidth={780}>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  background: '#ECFDF5',
                  color: '#047857',
                  border: '1px solid #A7F3D0',
                  padding: '3px 10px',
                  borderRadius: 12
                }}>
                  QUY TẮC TUYỂN DỤNG — CHỈ ĐƯỢC CHỌN 1 ỨNG VIÊN
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '8px 0 4px 0' }}>
                  Tuyển chọn ứng viên chính thức
                </h2>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  Công việc: <strong style={{ color: 'var(--color-text)' }}>{targetJobForSelection.title}</strong> • Loại: {targetJobForSelection.work_type}
                </div>
              </div>
            </div>

            {/* Target & KPI Boxes matching Wireframe WF-E08 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#F8F7FB', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Chỉ tiêu tuyển dụng:</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)' }}>
                  {targetJobForSelection.quantity_required || 1} người
                </div>
              </div>

              <div style={{ background: '#F8F7FB', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Đã chọn (M):</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: selectedCandidateId ? 'var(--color-success)' : 'var(--color-text)' }}>
                  {selectedCandidateId ? 1 : 0} người
                </div>
              </div>

              <div style={{ background: '#F8F7FB', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Còn lại (N - M):</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)' }}>
                  {Math.max(0, (targetJobForSelection.quantity_required || 1) - (selectedCandidateId ? 1 : 0))} người
                </div>
              </div>
            </div>

            {/* Warning Banner regarding Rule A3 */}
            <div style={{
              background: '#FFFBEB',
              border: '1.5px solid #FCD34D',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 13,
              color: '#92400E',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
              <div>
                <strong>LƯU Ý NGHIỆP VỤ:</strong> Tuyến này sẽ kích hoạt Hợp đồng làm việc (Work Assignment). 
                Khi bạn bấm xác nhận chọn, ứng viên này sẽ được tiếp nhận và các ứng viên còn lại sẽ được cập nhật trạng thái tương ứng.
              </div>
            </div>

            {/* Candidate Radio List */}
            <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 10, marginBottom: 20 }}>
              {(targetJobForSelection.work_type === 'FREELANCE' ? proposals : applications).map(candidate => {
                const isSelected = String(selectedCandidateId) === String(candidate.id);
                return (
                  <div
                    key={candidate.id}
                    onClick={() => setSelectedCandidateId(candidate.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--color-primary-light)' : '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedCandidateId(candidate.id)}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: 13.5 }}>
                          {candidate.student_name || 'Ứng viên sinh viên'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          {candidate.university || 'Đại học Văn Lang'} • Trạng thái: {candidate.status}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>
                      {candidate.proposed_price ? `${Number(candidate.proposed_price).toLocaleString()} đ` : 'Part-time'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button variant="secondary" onClick={() => setSelectionModalOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                disabled={!selectedCandidateId || submittingSelection}
                onClick={handleConfirmSelection}
                style={{ padding: '8px 22px', fontSize: 13.5, fontWeight: 700 }}
              >
                {submittingSelection ? 'Đang kích hoạt...' : 'Chấp thuận & Khởi tạo Hợp đồng'}
              </Button>
            </div>
          </div>
        </AnimatedModal>
      )}

      {/* ================= MODAL: STUDENT PROFILE VIEW ================= */}
      {viewingStudent && (
        <AnimatedModal isOpen={!!viewingStudent} onClose={() => setViewingStudent(null)} maxWidth={700}>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                HỒ SƠ ỨNG VIÊN SINH VIÊN
              </div>
              <Button variant="secondary" onClick={() => setViewingStudent(null)} style={{ padding: '4px 12px', fontSize: 12 }}>
                Đóng
              </Button>
            </div>

            {/* Header Profile Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7565A8 0%, #A997C5 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 800
              }}>
                {viewingStudent.student_name?.charAt(0) || 'S'}
              </div>

              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
                  {viewingStudent.student_name || 'Nguyễn Văn Chí'}
                </h3>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  {viewingStudent.university || 'Trường Đại học Văn Lang (VLU)'} — Ngành Công nghệ thông tin
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>
                  Địa điểm: TP. Hồ Chí Minh • Email: {viewingStudent.student_email || 'student@vlu.edu.vn'}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Giới thiệu bản thân
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {viewingStudent.cover_letter || viewingStudent.proposal_text || 'Sinh viên năng động, có tinh thần trách nhiệm cao, có thể linh hoạt sắp xếp lịch học và lịch làm việc thực tế.'}
              </p>
            </div>

            {/* Skills */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                Kỹ năng chuyên môn
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Giao tiếp', 'Làm việc nhóm', 'React.js', 'Figma', 'Tin học văn phòng'].map((sk, idx) => (
                  <span key={idx} style={{ background: '#F1F5F9', color: '#334155', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* CV Link & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <a
                href={viewingStudent.cv_url || 'https://jobnest.vn/uploads/cv/CV_NguyenVanChi_Default.pdf'}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'var(--color-primary-light)',
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <FileText size={15} /> Xem hồ sơ CV đầy đủ (PDF)
              </a>

              <Button
                variant="primary"
                onClick={() => {
                  setViewingStudent(null);
                  const job = jobs.find(j => j.id === viewingStudent.job_id) || jobs[0];
                  handleOpenSelection(job);
                }}
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700 }}
              >
                Chọn ứng viên này
              </Button>
            </div>
          </div>
        </AnimatedModal>
      )}
    </div>
  );
}
