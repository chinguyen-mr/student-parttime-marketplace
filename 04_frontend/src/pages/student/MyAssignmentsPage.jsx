import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Building2, Calendar, DollarSign, Clock, 
  CheckCircle2, AlertCircle, PlayCircle, Star, Eye, RefreshCw, X,
  UploadCloud, Link as LinkIcon, FileText, Send, ChevronRight, History, CheckCheck, Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, AnimatedModal } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';

/**
 * MyAssignmentsPage
 * Hỗ trợ đồng bộ chuẩn 2 màn hình Wireframe:
 * - WF-S08 — Assignment Detail (Thông tin công việc, trạng thái, timeline tiến độ, form cập nhật tiến độ)
 * - WF-S09 — Deliverable Submission (Nộp sản phẩm bàn giao: File upload / Link, mô tả, bảng lịch sử phiên bản v1, v2...)
 */
export default function MyAssignmentsPage({ currentUser, showToast, onOpenReview }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Sub-tabs inside Detail Modal: 'detail_timeline' (WF-S08) | 'deliverables' (WF-S09)
  const [modalActiveTab, setModalActiveTab] = useState('detail_timeline');

  // WF-S08: Progress update state
  const [progressNote, setProgressNote] = useState('');
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [timelineNotes, setTimelineNotes] = useState({});

  // WF-S09: Deliverable Submission form state
  const [deliverableFile, setDeliverableFile] = useState(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableDescription, setDeliverableDescription] = useState('');
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);
  const [deliverableVersions, setDeliverableVersions] = useState({});

  const fetchAssignments = async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/assignments/my-assignments`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAssignments(data.data);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(formatApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // Load persisted timeline and deliverable versions
    try {
      const savedTimelines = JSON.parse(localStorage.getItem('jobnest_assignment_timelines') || '{}');
      setTimelineNotes(savedTimelines);
      const savedDeliverables = JSON.parse(localStorage.getItem('jobnest_assignment_deliverables') || '{}');
      setDeliverableVersions(savedDeliverables);
    } catch (e) {
      console.warn('Failed to load assignment states from localStorage:', e);
    }
  }, [currentUser]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NOT_STARTED':
        return (
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#B45309',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            padding: '4px 10px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <Clock size={13} /> Chưa bắt đầu (NOT_STARTED)
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#1D4ED8',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '4px 10px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <PlayCircle size={13} /> Đang thực hiện (IN_PROGRESS)
          </span>
        );
      case 'COMPLETED':
        return (
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#059669',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            padding: '4px 10px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <CheckCircle2 size={13} /> Đã hoàn thành (COMPLETED)
          </span>
        );
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  // WF-S08: Handle add progress note
  const handleAddProgress = (e) => {
    e?.preventDefault();
    if (!progressNote.trim()) {
      if (showToast) showToast('Vui lòng nhập nội dung cập nhật tiến độ', 'error');
      return;
    }

    setUpdatingProgress(true);
    const assignId = selectedAssignment.id;
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      note: progressNote.trim(),
      actor: 'Sinh viên (' + (currentUser?.full_name || 'Tôi') + ')'
    };

    const currentList = timelineNotes[assignId] || [];
    const updated = [newEntry, ...currentList];
    const newStore = { ...timelineNotes, [assignId]: updated };
    setTimelineNotes(newStore);
    localStorage.setItem('jobnest_assignment_timelines', JSON.stringify(newStore));

    setProgressNote('');
    setUpdatingProgress(false);
    if (showToast) showToast('Cập nhật tiến độ công việc thành công (WF-S08)!', 'success');
  };

  // WF-S09: Handle submit deliverable
  const handleSubmitDeliverable = (e) => {
    e?.preventDefault();
    if (!deliverableFile && !deliverableUrl.trim()) {
      if (showToast) showToast('Vui lòng tải lên tệp hoặc dán đường dẫn sản phẩm bàn giao', 'error');
      return;
    }

    setSubmittingDeliverable(true);
    const assignId = selectedAssignment.id;
    const currentVersions = deliverableVersions[assignId] || [
      {
        version: 'v1',
        status: 'SUBMITTED',
        fileOrLink: 'Source_code_v1.zip',
        description: 'Bàn giao cấu trúc thư mục và giao diện ban đầu',
        submittedAt: '02/11/2026 10:15'
      },
      {
        version: 'v2',
        status: 'REVISION_REQUESTED',
        fileOrLink: 'Figma_prototype_v2.fig',
        description: 'Điều chỉnh màu sắc nút bấm và bổ sung responsive tablet',
        submittedAt: '03/11/2026 15:40'
      }
    ];

    const nextVerNumber = currentVersions.length + 1;
    const newVer = {
      version: `v${nextVerNumber}`,
      status: 'SUBMITTED',
      fileOrLink: deliverableFile ? deliverableFile.name : deliverableUrl.trim(),
      description: deliverableDescription.trim() || 'Nộp bản cập nhật sản phẩm',
      submittedAt: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newVer, ...currentVersions];
    const newStore = { ...deliverableVersions, [assignId]: updated };
    setDeliverableVersions(newStore);
    localStorage.setItem('jobnest_assignment_deliverables', JSON.stringify(newStore));

    // Also push a milestone to timeline
    const curTimeline = timelineNotes[assignId] || [];
    const timelineEntry = {
      id: Date.now(),
      date: newVer.submittedAt,
      note: `Đã nộp sản phẩm bàn giao phiên bản ${newVer.version}: ${newVer.description}`,
      actor: 'Sinh viên (' + (currentUser?.full_name || 'Tôi') + ')'
    };
    const updatedTl = [timelineEntry, ...curTimeline];
    setTimelineNotes(prev => ({ ...prev, [assignId]: updatedTl }));
    localStorage.setItem('jobnest_assignment_timelines', JSON.stringify({ ...timelineNotes, [assignId]: updatedTl }));

    setDeliverableFile(null);
    setDeliverableUrl('');
    setDeliverableDescription('');
    setSubmittingDeliverable(false);
    if (showToast) showToast(`Nộp sản phẩm ${newVer.version} thành công (WF-S09)! Nhà tuyển dụng đã được thông báo.`, 'success');
  };

  const filtered = assignments.filter(item => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  return (
    <div>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        borderRadius: 14,
        padding: '28px 30px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>
              ✨ WORK ASSIGNMENTS • WF-S08 & WF-S09
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
              CÔNG VIỆC CỦA TÔI (ASSIGNMENTS)
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: '#E0E7FF', maxWidth: 640 }}>
              Theo dõi chi tiết hợp đồng, cập nhật tiến độ (WF-S08) và nộp sản phẩm bàn giao (WF-S09) cho Nhà tuyển dụng.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={fetchAssignments}
            style={{ background: '#ffffff', color: '#312E81', border: 'none', padding: '8px 16px', fontSize: 13, gap: 6, fontWeight: 700 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { key: 'ALL', label: `Tất cả (${assignments.length})` },
          { key: 'NOT_STARTED', label: `Chưa bắt đầu (${assignments.filter(a => a.status === 'NOT_STARTED').length})` },
          { key: 'IN_PROGRESS', label: `Đang thực hiện (${assignments.filter(a => a.status === 'IN_PROGRESS').length})` },
          { key: 'COMPLETED', label: `Đã hoàn thành (${assignments.filter(a => a.status === 'COMPLETED').length})` },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: statusFilter === tab.key ? 700 : 500,
              border: statusFilter === tab.key ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: statusFilter === tab.key ? 'var(--color-primary-light)' : '#ffffff',
              color: statusFilter === tab.key ? 'var(--color-primary)' : 'var(--color-text)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assignment List Cards */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid var(--color-border)'
        }}>
          <Briefcase size={44} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 6px 0' }}>
            Không có công việc nào trong danh mục này
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            Các công việc sau khi bạn được Nhà tuyển dụng duyệt tuyển sẽ tự động hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {filtered.map(assignment => (
            <motion.div
              key={assignment.id}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(41,38,58,0.08)' }}
              onClick={() => {
                setSelectedAssignment(assignment);
                setModalActiveTab('detail_timeline');
              }}
              style={{
                background: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                padding: '20px 22px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: 4 }}>
                    HỢP ĐỒNG #{assignment.id}
                  </span>
                  {getStatusBadge(assignment.status)}
                </div>

                <h3 style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                  {assignment.job_title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', marginBottom: 12 }}>
                  <Building2 size={14} color="#7565A8" />
                  <span style={{ fontWeight: 600 }}>{assignment.employer_name}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#F8FAFC', padding: '10px 12px', borderRadius: 8, fontSize: 12 }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', marginBottom: 2 }}>Hình thức</span>
                    <strong style={{ color: '#1E293B' }}>
                      {assignment.work_type === 'FREELANCE' ? 'Dự án Freelance' : 'Part-time Bán thời gian'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', marginBottom: 2 }}>Mức thu nhập</span>
                    <strong style={{ color: '#059669' }}>
                      {assignment.proposed_price ? `${Number(assignment.proposed_price).toLocaleString('vi-VN')} đ` : (assignment.salary ? `${Number(assignment.salary).toLocaleString('vi-VN')} đ` : 'Thỏa thuận')}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11.5, color: '#94A3B8' }}>
                  Giao việc: {new Date(assignment.created_at).toLocaleDateString('vi-VN')}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Chi tiết & Tiến độ <ChevronRight size={14} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* =========================================================================
          MODAL CHI TIẾT CÔNG VIỆC: WF-S08 & WF-S09
          ========================================================================= */}
      {selectedAssignment && (
        <AnimatedModal isOpen={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} maxWidth="840px">
          <div style={{ padding: '26px 28px', maxHeight: '88vh', overflowY: 'auto' }}>
            
            {/* Modal Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ background: '#F1EEF8', color: '#7565A8', border: '1px solid #D8B4FE', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                    HỢP ĐỒNG #{selectedAssignment.id}
                  </span>
                  {getStatusBadge(selectedAssignment.status)}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  {selectedAssignment.job_title}
                </h3>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                  Nhà tuyển dụng: <strong>{selectedAssignment.employer_name}</strong> • {selectedAssignment.employer_email}
                </div>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* TAB NAVIGATION: WF-S08 vs WF-S09 */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1.5px solid var(--color-border)' }}>
              <button
                type="button"
                onClick={() => setModalActiveTab('detail_timeline')}
                style={{
                  padding: '9px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: modalActiveTab === 'detail_timeline' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
                  color: modalActiveTab === 'detail_timeline' ? 'var(--color-primary)' : '#64748B',
                  fontWeight: modalActiveTab === 'detail_timeline' ? 800 : 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Clock size={16} /> WF-S08: Chi tiết & Timeline tiến độ
              </button>
              <button
                type="button"
                onClick={() => setModalActiveTab('deliverables')}
                style={{
                  padding: '9px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: modalActiveTab === 'deliverables' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
                  color: modalActiveTab === 'deliverables' ? 'var(--color-primary)' : '#64748B',
                  fontWeight: modalActiveTab === 'deliverables' ? 800 : 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <UploadCloud size={16} /> WF-S09: Nộp sản phẩm bàn giao (Deliverable)
              </button>
            </div>

            {/* =================================================================
                TAB 1: WF-S08 — ASSIGNMENT DETAIL & TIMELINE TIẾN ĐỘ
                ================================================================= */}
            {modalActiveTab === 'detail_timeline' && (
              <div>
                {/* 1. Contract Summary Cards */}
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  padding: '16px 18px',
                  marginBottom: 22,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: 14
                }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginBottom: 2 }}>Hình thức công việc</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>
                      {selectedAssignment.work_type === 'FREELANCE' ? 'Dự án Freelance' : 'Part-time Bán thời gian'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginBottom: 2 }}>Mức thù lao / Lương</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>
                      {selectedAssignment.proposed_price ? `${Number(selectedAssignment.proposed_price).toLocaleString('vi-VN')} đ` : (selectedAssignment.salary ? `${Number(selectedAssignment.salary).toLocaleString('vi-VN')} đ` : 'Thỏa thuận')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginBottom: 2 }}>Ngày giao nhiệm vụ</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                      {new Date(selectedAssignment.created_at).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginBottom: 2 }}>Trạng thái Assignment</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
                      {selectedAssignment.status}
                    </div>
                  </div>
                </div>

                {/* Excerpt of proposal/application */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                    {selectedAssignment.proposal_id ? 'Nội dung đề xuất / Cam kết thực hiện của bạn:' : 'Thư giới thiệu ứng tuyển:'}
                  </div>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    fontSize: 13,
                    color: '#334155',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line'
                  }}>
                    {selectedAssignment.proposal_text || selectedAssignment.cover_letter || 'Đã chấp thuận theo hồ sơ ứng tuyển ban đầu.'}
                  </div>
                </div>

                {/* 2. Visual Progress Timeline (WF-S08 specification) */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)' }}>
                      Timeline tiến độ (Date — Update note — Actor)
                    </div>
                    <span style={{ fontSize: 11.5, color: '#64748B' }}>
                      Chuẩn wireframe WF-S08
                    </span>
                  </div>

                  <div style={{
                    background: '#ffffff',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 12,
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                  }}>
                    {/* Default Milestone 1: Hợp đồng khởi tạo */}
                    <div style={{ display: 'flex', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#DEF7EC', color: '#03543F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                          ✓
                        </div>
                        <div style={{ width: 2, flex: 1, background: '#E2E8F0', marginTop: 4 }}></div>
                      </div>
                      <div style={{ flex: 1, paddingBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong style={{ fontSize: 13.5, color: 'var(--color-text)' }}>Hợp đồng công việc được thiết lập chính thức</strong>
                          <span style={{ fontSize: 11.5, color: '#64748B' }}>
                            {new Date(selectedAssignment.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0 0', fontSize: 12.5, color: '#475569' }}>
                          Nhà tuyển dụng {selectedAssignment.employer_name} đã xác nhận giao nhiệm vụ cho sinh viên.
                        </p>
                        <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11, background: '#F1F5F9', color: '#475569', padding: '1px 7px', borderRadius: 4 }}>
                          Actor: Nhà tuyển dụng ({selectedAssignment.employer_name})
                        </span>
                      </div>
                    </div>

                    {/* Default Milestone 2: Bắt đầu làm */}
                    <div style={{ display: 'flex', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E1EFFE', color: '#1E429F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                          ▶
                        </div>
                        {(timelineNotes[selectedAssignment.id]?.length > 0) && (
                          <div style={{ width: 2, flex: 1, background: '#E2E8F0', marginTop: 4 }}></div>
                        )}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong style={{ fontSize: 13.5, color: 'var(--color-text)' }}>Bắt đầu tiếp nhận và triển khai nhiệm vụ</strong>
                          <span style={{ fontSize: 11.5, color: '#64748B' }}>
                            {new Date(new Date(selectedAssignment.created_at).getTime() + 86400000).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0 0', fontSize: 12.5, color: '#475569' }}>
                          Sinh viên tiếp nhận tài liệu và lịch trình thực hiện theo yêu cầu bàn giao.
                        </p>
                        <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11, background: '#EFF6FF', color: '#1D4ED8', padding: '1px 7px', borderRadius: 4 }}>
                          Actor: Sinh viên ({currentUser?.full_name || 'Tôi'})
                        </span>
                      </div>
                    </div>

                    {/* Dynamic updates by student */}
                    {(timelineNotes[selectedAssignment.id] || []).map((entry, idx, arr) => (
                      <div key={entry.id} style={{ display: 'flex', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FAF5FF', color: '#7565A8', border: '1.5px solid #D8B4FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                            {arr.length - idx}
                          </div>
                          {idx < arr.length - 1 && (
                            <div style={{ width: 2, flex: 1, background: '#E2E8F0', marginTop: 4 }}></div>
                          )}
                        </div>
                        <div style={{ flex: 1, paddingBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <strong style={{ fontSize: 13.5, color: 'var(--color-text)' }}>{entry.note}</strong>
                            <span style={{ fontSize: 11.5, color: '#64748B' }}>{entry.date}</span>
                          </div>
                          <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11, background: '#F1EEF8', color: '#7565A8', padding: '1px 7px', borderRadius: 4 }}>
                            Actor: {entry.actor}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Form Cập nhật tiến độ (WF-S08 specification) */}
                <div style={{ background: '#FAF8FD', border: '1.5px solid #EDE9FE', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 4 }}>
                    Cập nhật tiến độ công việc (G-06 TBD)
                  </div>
                  <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 10px 0' }}>
                    Ghi lại các mốc hoàn thành công việc định kỳ để Nhà tuyển dụng theo dõi.
                  </p>
                  <form onSubmit={handleAddProgress}>
                    <textarea
                      rows={3}
                      value={progressNote}
                      onChange={(e) => setProgressNote(e.target.value)}
                      placeholder="Ví dụ: Đã hoàn thành 50% khối lượng công việc, đang kiểm tra bước cuối trước khi bàn giao..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1.5px solid var(--color-border)',
                        fontSize: 13,
                        background: '#ffffff',
                        outline: 'none',
                        resize: 'vertical',
                        marginBottom: 10
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#64748B' }}>
                        Trạng thái UI: Không đổi trạng thái Assignment trực tiếp; không có SUBMITTED (G-58 TBD).
                      </span>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={updatingProgress}
                        style={{ padding: '8px 18px', fontSize: 13, gap: 6 }}
                      >
                        <Send size={13} /> {updatingProgress ? 'Đang lưu...' : 'Cập nhật'}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Actions bottom */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
                  <Button variant="secondary" onClick={() => setSelectedAssignment(null)} style={{ padding: '8px 18px', fontSize: 13 }}>
                    Đóng
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setModalActiveTab('deliverables')}
                    style={{ padding: '8px 20px', fontSize: 13, gap: 6, background: '#7565A8' }}
                  >
                    Nộp sản phẩm bàn giao (WF-S09) →
                  </Button>
                </div>
              </div>
            )}

            {/* =================================================================
                TAB 2: WF-S09 — DELIVERABLE SUBMISSION & VERSION HISTORY
                ================================================================= */}
            {modalActiveTab === 'deliverables' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <span style={{ background: '#F1EEF8', color: '#7565A8', border: '1px solid #D8B4FE', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                      WF-S09 — DELIVERABLE SUBMISSION
                    </span>
                    <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0 0' }}>
                      Nộp sản phẩm bàn giao (Deliverables)
                    </h4>
                  </div>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    Quy tắc: Mỗi lần nộp tạo phiên bản mới (v1, v2, v3...)
                  </span>
                </div>

                {/* Submit Form */}
                <form onSubmit={handleSubmitDeliverable} style={{ background: '#FAF8FD', border: '1.5px solid #EDE9FE', borderRadius: 12, padding: '18px 20px', marginBottom: 24 }}>
                  {/* File Upload Box */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                      Tệp đính kèm (Chọn tệp / Kéo thả)
                    </label>
                    <div
                      style={{
                        border: '2px dashed #C4B5FD',
                        borderRadius: 10,
                        padding: '20px',
                        textAlign: 'center',
                        background: '#ffffff',
                        cursor: 'pointer'
                      }}
                      onClick={() => document.getElementById('deliverable_file_input')?.click()}
                    >
                      <UploadCloud size={30} color="#7565A8" style={{ margin: '0 auto 6px auto' }} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                        {deliverableFile ? deliverableFile.name : 'Bấm để tải tệp hoặc kéo thả file vào đây'}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                        Hỗ trợ ZIP, PDF, DOCX, RAR, PNG (tối đa 25MB)
                      </div>
                      <input
                        id="deliverable_file_input"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setDeliverableFile(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* URL Input */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                      Đường dẫn trực tuyến (GitHub / Google Drive / Figma...)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={deliverableUrl}
                        onChange={(e) => setDeliverableUrl(e.target.value)}
                        placeholder="https://github.com/my-repo hoặc https://figma.com/file/..."
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 36px',
                          borderRadius: 8,
                          border: '1.5px solid var(--color-border)',
                          fontSize: 13,
                          background: '#ffffff',
                          outline: 'none'
                        }}
                      />
                      <LinkIcon size={15} color="#64748B" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>

                  {/* Description Textarea */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                      Mô tả phiên bản bàn giao
                    </label>
                    <textarea
                      rows={3}
                      value={deliverableDescription}
                      onChange={(e) => setDeliverableDescription(e.target.value)}
                      placeholder="Mô tả tóm tắt nội dung đợt nộp này (các tính năng đã làm, kết quả đạt được, ghi chú cho nhà tuyển dụng)..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1.5px solid var(--color-border)',
                        fontSize: 13,
                        background: '#ffffff',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submittingDeliverable}
                      style={{ padding: '9px 24px', fontSize: 13, gap: 6 }}
                    >
                      <UploadCloud size={14} /> {submittingDeliverable ? 'Đang nộp...' : 'Nộp sản phẩm'}
                    </Button>
                  </div>
                </form>

                {/* Version History Table (WF-S09 specification) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)' }}>
                      Lịch sử các phiên bản bàn giao (Version History)
                    </div>
                    <span style={{ fontSize: 11.5, color: '#64748B' }}>
                      Chuẩn wireframe WF-S09
                    </span>
                  </div>

                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)', color: '#475569', fontWeight: 700 }}>
                          <th style={{ padding: '10px 14px', width: 90 }}>Phiên bản</th>
                          <th style={{ padding: '10px 14px', width: 140 }}>Trạng thái</th>
                          <th style={{ padding: '10px 14px' }}>Tệp / Đường dẫn</th>
                          <th style={{ padding: '10px 14px' }}>Mô tả</th>
                          <th style={{ padding: '10px 14px', width: 130 }}>Ngày nộp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(deliverableVersions[selectedAssignment.id] || [
                          {
                            version: 'v1',
                            status: 'SUBMITTED',
                            fileOrLink: 'Source_code_v1.zip',
                            description: 'Bàn giao cấu trúc thư mục và giao diện ban đầu',
                            submittedAt: '02/11/2026 10:15'
                          },
                          {
                            version: 'v2',
                            status: 'REVISION_REQUESTED',
                            fileOrLink: 'Figma_prototype_v2.fig',
                            description: 'Điều chỉnh màu sắc nút bấm và bổ sung responsive tablet',
                            submittedAt: '03/11/2026 15:40'
                          }
                        ]).map((ver) => (
                          <tr key={ver.version} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--color-primary)' }}>
                              {ver.version}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {ver.status === 'SUBMITTED' ? (
                                <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                                  SUBMITTED
                                </span>
                              ) : ver.status === 'REVISION_REQUESTED' ? (
                                <span style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                                  REVISION_REQUESTED
                                </span>
                              ) : (
                                <span style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                                  ACCEPTED
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#334155' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                <Paperclip size={13} color="#7565A8" /> {ver.fileOrLink}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#64748B', fontSize: 12.5 }}>
                              {ver.description}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#64748B', fontSize: 12 }}>
                              {ver.submittedAt}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions bottom */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20 }}>
                  <Button variant="secondary" onClick={() => setModalActiveTab('detail_timeline')} style={{ padding: '8px 18px', fontSize: 13, gap: 6 }}>
                    ← Xem lại WF-S08 Timeline
                  </Button>
                  <Button variant="secondary" onClick={() => setSelectedAssignment(null)} style={{ padding: '8px 18px', fontSize: 13 }}>
                    Đóng
                  </Button>
                </div>
              </div>
            )}

          </div>
        </AnimatedModal>
      )}
    </div>
  );
}
