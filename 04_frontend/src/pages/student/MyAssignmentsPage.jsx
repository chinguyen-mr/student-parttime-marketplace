import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Building2,
  Clock,
  RefreshCw,
  X,
  UploadCloud,
  Link as LinkIcon,
  Send,
  ChevronRight,
  Paperclip
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button, AnimatedModal } from '../../components/ui';
import StatusBadge from '../../components/common/StatusBadge';
import ExportMenu from '../../components/common/ExportMenu';
import { formatSalary } from '../../utils/jobDisplay';
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
  const [progressList, setProgressList] = useState([]); // GET /assignments/:id/progress (lưu DB)

  // WF-S09: Deliverable Submission form state
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableDescription, setDeliverableDescription] = useState('');
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);
  const [deliverables, setDeliverables] = useState([]); // GET /assignments/:id/deliverables (lưu DB)
  const [detailLoading, setDetailLoading] = useState(false);

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
  }, [currentUser]);

  const authJson = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Thao tác thất bại');
    return data.data;
  };

  // Tiến độ & sản phẩm bàn giao của hợp đồng đang mở (lưu DB, nhà tuyển dụng cùng xem)
  const loadDetail = async (assignId) => {
    setDetailLoading(true);
    try {
      const [prog, dels] = await Promise.all([
        authJson(`/assignments/${assignId}/progress`),
        authJson(`/assignments/${assignId}/deliverables`),
      ]);
      setProgressList(prog || []);
      setDeliverables(dels || []);
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Không tải được tiến độ công việc'), 'error');
    } finally {
      setDetailLoading(false);
    }
  };
  useEffect(() => {
    setProgressList([]);
    setDeliverables([]);
    if (selectedAssignment?.id && currentUser?.token) loadDetail(selectedAssignment.id);
  }, [selectedAssignment?.id]);

  const getStatusBadge = (status) => {
    return <StatusBadge status={status} />;
  };

  const isActiveAssignment = (a) => ['NOT_STARTED', 'IN_PROGRESS'].includes(a?.status);
  const fmtDateTime = (v) => (v ? new Date(v).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

  // WF-S08: Cập nhật tiến độ → POST /assignments/:id/progress
  const handleAddProgress = async (e) => {
    e?.preventDefault();
    if (!progressNote.trim()) {
      if (showToast) showToast('Vui lòng nhập nội dung cập nhật tiến độ', 'error');
      return;
    }
    setUpdatingProgress(true);
    try {
      await authJson(`/assignments/${selectedAssignment.id}/progress`, { method: 'POST', body: JSON.stringify({ description: progressNote.trim() }) });
      setProgressNote('');
      await loadDetail(selectedAssignment.id);
      if (showToast) showToast('Đã lưu cập nhật tiến độ. Nhà tuyển dụng đã được thông báo.', 'success');
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Không lưu được tiến độ'), 'error');
    } finally {
      setUpdatingProgress(false);
    }
  };

  // WF-S09: Nộp sản phẩm bàn giao (đường link) → POST /assignments/:id/deliverables
  const handleSubmitDeliverable = async (e) => {
    e?.preventDefault();
    if (!/^https?:\/\/\S+$/i.test(deliverableUrl.trim())) {
      if (showToast) showToast('Vui lòng dán đường link sản phẩm bắt đầu bằng http:// hoặc https://', 'error');
      return;
    }
    setSubmittingDeliverable(true);
    try {
      const ver = await authJson(`/assignments/${selectedAssignment.id}/deliverables`, {
        method: 'POST',
        body: JSON.stringify({ link: deliverableUrl.trim(), description: deliverableDescription.trim() }),
      });
      setDeliverableUrl('');
      setDeliverableDescription('');
      await loadDetail(selectedAssignment.id);
      if (showToast) showToast(`Nộp sản phẩm v${ver.version_no} thành công! Nhà tuyển dụng đã được thông báo.`, 'success');
    } catch (err) {
      if (showToast) showToast(formatApiError(err, 'Không nộp được sản phẩm'), 'error');
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  const filtered = assignments.filter(item => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  return (
    <div>
      {/* Hero Header */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--color-border)',
        borderRadius: 14,
        padding: '24px 28px',
        marginBottom: 24,
        boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--color-text)' }}>
              Công việc được giao
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--color-text-secondary)', maxWidth: 640 }}>
              Theo dõi chi tiết hợp đồng, cập nhật tiến độ công việc và nộp sản phẩm bàn giao cho Nhà tuyển dụng.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ExportMenu
            label="Xuất xác nhận công việc"
            disabled={loading || assignments.length === 0}
            onError={() => showToast && showToast('Xuất file thất bại', 'error')}
            getReport={() => {
              const WORK = { NOT_STARTED: 'Chưa bắt đầu', IN_PROGRESS: 'Đang làm việc', COMPLETED: 'Đã hoàn thành', RESIGNED: 'Đã xin nghỉ', TERMINATED: 'Đã thôi việc' };
              return {
                title: 'Bảng tổng hợp quá trình làm việc part-time',
                subtitle: `Sinh viên: ${currentUser?.full_name || ''}${currentUser?.email ? ` · ${currentUser.email}` : ''}`,
                fileName: 'qua-trinh-lam-viec',
                author: currentUser?.full_name,
                summary: [['Tổng công việc', filtered.length], ['Đã hoàn thành', filtered.filter(a => a.status === 'COMPLETED').length],
                  ['Đang làm việc', filtered.filter(a => a.status === 'IN_PROGRESS').length]],
                columns: [
                  { header: 'Vị trí', value: a => a.job_title, width: 32 },
                  { header: 'Doanh nghiệp', value: a => a.employer_name, width: 28 },
                  { header: 'Ngành nghề', value: a => a.category, width: 20 },
                  { header: 'Mức lương', value: a => formatSalary(a), width: 18 },
                  { header: 'Bắt đầu', value: a => a.started_at, type: 'date', width: 12 },
                  { header: 'Kết thúc', value: a => a.completed_at || a.terminated_at, type: 'date', width: 12 },
                  { header: 'Tình trạng', value: a => WORK[a.status] || a.status, width: 16 },
                ],
                rows: filtered,
              };
            }}
          />
          <Button
            variant="secondary"
            onClick={fetchAssignments}
            style={{ padding: '8px 16px', fontSize: 13, gap: 6, fontWeight: 700 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </Button>
          </div>
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
                      {assignment.work_type === 'FULL_TIME' ? 'Full-time Toàn thời gian' : 'Part-time Bán thời gian'}
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
                      {selectedAssignment.work_type === 'FULL_TIME' ? 'Full-time Toàn thời gian' : 'Part-time Bán thời gian'}
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
                    Thư giới thiệu ứng tuyển:
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
                    {selectedAssignment.cover_letter || 'Đã chấp thuận theo hồ sơ ứng tuyển ban đầu.'}
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
                        {progressList.length > 0 && (
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

                    {/* Các lần cập nhật tiến độ (lưu DB — cả sinh viên và nhà tuyển dụng) */}
                    {detailLoading && progressList.length === 0 && (
                      <div style={{ fontSize: 12.5, color: '#94A3B8', paddingLeft: 38 }}>Đang tải tiến độ…</div>
                    )}
                    {progressList.map((entry, idx, arr) => (
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
                            <strong style={{ fontSize: 13.5, color: 'var(--color-text)' }}>
                              {entry.description}{entry.progress_percent !== null && entry.progress_percent !== undefined ? ` (${entry.progress_percent}%)` : ''}
                            </strong>
                            <span style={{ fontSize: 11.5, color: '#64748B', whiteSpace: 'nowrap', marginLeft: 8 }}>{fmtDateTime(entry.created_at)}</span>
                          </div>
                          <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11, background: '#F1EEF8', color: '#7565A8', padding: '1px 7px', borderRadius: 4 }}>
                            {entry.updated_by_role === 'EMPLOYER' ? 'Nhà tuyển dụng' : 'Sinh viên'} ({entry.updated_by_name})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Form Cập nhật tiến độ */}
                <div style={{ background: '#FAF8FD', border: '1.5px solid #EDE9FE', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 4 }}>
                    Cập nhật tiến độ công việc
                  </div>
                  <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 10px 0' }}>
                    Ghi lại các mốc hoàn thành công việc định kỳ để Nhà tuyển dụng theo dõi.
                  </p>
                  {!isActiveAssignment(selectedAssignment) ? (
                    <div style={{ fontSize: 12.5, color: '#64748B' }}>Hợp đồng đã kết thúc nên không thể thêm cập nhật tiến độ.</div>
                  ) : (
                  <form onSubmit={handleAddProgress}>
                    <textarea
                      maxLength={1000}
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
                  )}
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
                    Nộp sản phẩm bàn giao →
                  </Button>
                </div>
              </div>
            )}

            {/* =================================================================
                TAB 2: DELIVERABLE SUBMISSION & VERSION HISTORY
                ================================================================= */}
            {modalActiveTab === 'deliverables' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0 0' }}>
                      Nộp sản phẩm bàn giao (Deliverables)
                    </h4>
                  </div>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    Quy tắc: Mỗi lần nộp tạo phiên bản mới (v1, v2, v3...)
                  </span>
                </div>

                {/* Submit Form (ẩn khi hợp đồng đã kết thúc) */}
                {isActiveAssignment(selectedAssignment) ? (
                <form onSubmit={handleSubmitDeliverable} style={{ background: '#FAF8FD', border: '1.5px solid #EDE9FE', borderRadius: 12, padding: '18px 20px', marginBottom: 24 }}>
                  {/* URL Input */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                      Đường dẫn sản phẩm (Google Drive / GitHub / Figma...) <span style={{ color: '#DC2626' }}>*</span>
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
                ) : (
                  <div style={{ fontSize: 12.5, color: '#64748B', marginBottom: 16 }}>Hợp đồng đã kết thúc nên không thể nộp thêm sản phẩm.</div>
                )}

                {/* Version History Table */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)' }}>
                      Lịch sử các phiên bản bàn giao
                    </div>
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
                        {deliverables.length === 0 && (
                          <tr><td colSpan={5} style={{ padding: '16px 14px', textAlign: 'center', color: '#94A3B8' }}>
                            {detailLoading ? 'Đang tải…' : 'Chưa nộp phiên bản nào.'}
                          </td></tr>
                        )}
                        {deliverables.map((ver) => (
                          <tr key={ver.id} style={{ borderBottom: '1px solid #F1F5F9', verticalAlign: 'top' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--color-primary)' }}>
                              v{ver.version_no}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {ver.status === 'SUBMITTED' ? (
                                <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                                  Chờ duyệt
                                </span>
                              ) : ver.status === 'REVISION_REQUESTED' ? (
                                <span style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                                  Cần chỉnh sửa
                                </span>
                              ) : (
                                <span style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                                  Đã chấp nhận
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#334155', wordBreak: 'break-all' }}>
                              <a href={ver.file_key} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#7565A8' }}>
                                <Paperclip size={13} color="#7565A8" /> {ver.file_key}
                              </a>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#64748B', fontSize: 12.5 }}>
                              {ver.description}
                              {ver.review_comment && (
                                <div style={{ marginTop: 6, color: ver.review_decision === 'ACCEPTED' ? '#047857' : '#B45309' }}>
                                  Nhận xét của NTD: {ver.review_comment}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#64748B', fontSize: 12 }}>
                              {fmtDateTime(ver.submitted_at)}
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
                    ← Quay lại tiến độ công việc
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
