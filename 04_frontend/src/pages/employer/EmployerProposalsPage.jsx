import React, { useState, useEffect } from 'react';
import { 
  Briefcase, User, Calendar, DollarSign, Clock, 
  CheckCircle2, XCircle, Eye, AlertCircle, RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, AnimatedModal } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';

export default function EmployerProposalsPage({
  currentUser,
  selectedJob = null,
  onNavigateSelection,
  onNavigateAssignments,
  showToast
}) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProposals = async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/proposals/employer-proposals`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProposals(data.data);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(formatApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [currentUser]);

  // Employer accepts proposal -> A3 RULE: POST /jobs/:jobId/selections
  const handleAcceptProposal = async (proposal) => {
    if (!confirm(`Bạn có chắc chắn muốn CHẤP THUẬN đề xuất của sinh viên ${proposal.student_name} và KHỞI TẠO HỢP ĐỒNG LÀM VIỆC (A3 Rule)?`)) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE}/jobs/${proposal.job_id}/selections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({ proposalIds: [proposal.id] }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Chấp nhận đề xuất thành công và đã tạo hợp đồng (A3)!', 'success');
        setProposals(prev => prev.map(p => p.id === proposal.id ? { ...p, status: 'ACCEPTED' } : p));
        if (selectedProposal && selectedProposal.id === proposal.id) {
          setSelectedProposal({ ...selectedProposal, status: 'ACCEPTED' });
        }
      } else {
        showToast(data.message || 'Lỗi lựa chọn đề xuất', 'error');
      }
    } catch (err) {
      showToast(formatApiError(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Employer reviews or rejects proposal -> PATCH /proposals/:id/status
  const handleUpdateStatus = async (proposalId, status) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE}/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Trạng thái đề xuất đã chuyển sang: ${status === 'REVIEWING' ? 'Đang xem xét' : 'Từ chối'}`);
        setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status } : p));
        if (selectedProposal && selectedProposal.id === proposalId) {
          setSelectedProposal({ ...selectedProposal, status });
        }
      } else {
        showToast(data.message || 'Lỗi cập nhật trạng thái', 'error');
      }
    } catch (err) {
      showToast(formatApiError(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
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
            <Clock size={13} /> Chờ duyệt
          </span>
        );
      case 'REVIEWING':
        return (
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#D97706',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            padding: '4px 10px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <Eye size={13} /> Đang xem xét
          </span>
        );
      case 'ACCEPTED':
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
            <CheckCircle2 size={13} /> Đã chọn (Hợp đồng A3)
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#DC2626',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            padding: '4px 10px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <XCircle size={13} /> Đã từ chối
          </span>
        );
      default:
        return (
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#64748B',
            background: '#F1F5F9',
            border: '1px solid #E2E8F0',
            padding: '4px 10px',
            borderRadius: 6
          }}>
            {status}
          </span>
        );
    }
  };

  const filtered = proposals.filter(p => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  return (
    <div style={{ width: '100%', maxWidth: 'none', paddingBottom: 60 }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 100%)',
        borderRadius: 14,
        padding: '28px 30px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>
              <ShieldCheck size={13} color="#A7F3D0" /> FREELANCE PORTAL • QUY TẮC A3
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
              QUẢN LÝ ĐỀ XUẤT DỰ ÁN FREELANCE
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: '#E2E8F0', maxWidth: 640 }}>
              Duyệt báo giá, đánh giá năng lực ứng viên và chấp thuận tuyển chọn sinh viên thực hiện dự án Freelance theo quy tắc A3 (khởi tạo Work Assignment).
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={fetchProposals}
            style={{ background: '#ffffff', color: '#4C1D95', border: 'none', padding: '8px 16px', fontSize: 13, gap: 6, fontWeight: 700 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { key: 'ALL', label: `Tất cả (${proposals.length})` },
          { key: 'SUBMITTED', label: `Chờ duyệt (${proposals.filter(p => p.status === 'SUBMITTED').length})` },
          { key: 'REVIEWING', label: `Đang xem xét (${proposals.filter(p => p.status === 'REVIEWING').length})` },
          { key: 'ACCEPTED', label: `Đã chọn (${proposals.filter(p => p.status === 'ACCEPTED').length})` },
          { key: 'REJECTED', label: `Đã từ chối (${proposals.filter(p => p.status === 'REJECTED').length})` },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: statusFilter === tab.key ? '1.5px solid #6D28D9' : '1px solid var(--color-border)',
              background: statusFilter === tab.key ? '#6D28D9' : '#ffffff',
              color: statusFilter === tab.key ? '#ffffff' : 'var(--color-text)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List proposals */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
          Đang tải danh sách đề xuất nhận được...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          padding: '48px 20px',
          textAlign: 'center',
        }}>
          <Briefcase size={44} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
            Chưa có đề xuất nào trong trạng thái này
          </h4>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            Đề xuất từ sinh viên ứng tuyển vào các dự án Freelance của bạn sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
          {filtered.map(item => (
            <motion.div
              key={item.id}
              whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(89, 70, 117, 0.08)' }}
              style={{
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#6D28D9', background: '#F5F3FF', padding: '3px 8px', borderRadius: 6 }}>
                    Dự án: {item.job_title}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                {/* Student Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: '#6D28D9',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 16,
                  }}>
                    {item.student_name ? item.student_name.charAt(0) : 'S'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 2px 0' }}>
                      {item.student_name}
                    </h4>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {item.university || item.student_email || 'Sinh viên'}
                    </div>
                  </div>
                </div>

                {/* Proposal Text preview */}
                <div style={{
                  background: 'var(--color-background)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13,
                  color: '#334155',
                  lineHeight: 1.5,
                  marginBottom: 14,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {item.proposal_text}
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', display: 'block' }}>Báo giá đề xuất:</span>
                    <strong style={{ color: '#059669', fontSize: 14 }}>
                      {item.proposed_price ? `${Number(item.proposed_price).toLocaleString('vi-VN')} đ` : 'Thỏa thuận'}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', display: 'block' }}>Thời gian:</span>
                    <strong style={{ color: 'var(--color-text)', fontSize: 13.5 }}>
                      {item.estimated_duration || 'Linh hoạt'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #F1F5F9', paddingTop: 14, flexWrap: 'wrap' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedProposal(item)}
                  style={{ flex: 1, padding: '7px 10px', fontSize: 12.5 }}
                >
                  Chi tiết
                </Button>

                {item.status === 'SUBMITTED' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(item.id, 'REVIEWING')}
                    style={{ padding: '7px 10px', fontSize: 12.5, color: '#D97706', borderColor: '#FDE68A' }}
                  >
                    Xem xét
                  </Button>
                )}

                {['SUBMITTED', 'REVIEWING'].includes(item.status) && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                      style={{ padding: '7px 10px', fontSize: 12.5, color: '#DC2626', borderColor: '#FECACA' }}
                    >
                      Từ chối
                    </Button>
                    {onNavigateSelection && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onNavigateSelection({ id: item.job_id, title: item.job_title, work_type: 'FREELANCE' })}
                        style={{ padding: '7px 14px', fontSize: 12.5, background: 'var(--color-primary)', fontWeight: 800 }}
                      >
                        Chọn ứng viên (E08)
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal chi tiết đề xuất */}
      {selectedProposal && (
        <AnimatedModal isOpen={!!selectedProposal} onClose={() => setSelectedProposal(null)} maxWidth="640px">
          <div style={{ padding: '26px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="badge badge-primary" style={{ fontSize: 11 }}>CHI TIẾT ĐỀ XUẤT #{selectedProposal.id}</span>
                  {getStatusBadge(selectedProposal.status)}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  Dự án: {selectedProposal.job_title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                style={{
                  background: 'var(--color-lavender-surface)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Student card info */}
            <div style={{ background: 'var(--color-background)', borderRadius: 10, padding: '14px 16px', marginBottom: 18, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Ứng viên</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)' }}>{selectedProposal.student_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{selectedProposal.student_email}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{selectedProposal.student_phone || 'Chưa cập nhật SĐT'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Trường & Chuyên ngành</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{selectedProposal.university || 'N/A'}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{selectedProposal.major || 'Sinh viên'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Thù lao đề xuất</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>
                    {selectedProposal.proposed_price ? `${Number(selectedProposal.proposed_price).toLocaleString('vi-VN')} đ` : 'Thỏa thuận'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Thời gian thực hiện</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>
                    {selectedProposal.estimated_duration || 'Linh hoạt'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>
                Nội dung giải pháp & Kế hoạch triển khai:
              </h4>
              <div style={{
                background: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '14px 16px',
                fontSize: 13.5,
                lineHeight: 1.6,
                color: '#334155',
                whiteSpace: 'pre-line'
              }}>
                {selectedProposal.proposal_text}
              </div>
            </div>

            {/* Modal actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
              <Button variant="secondary" onClick={() => setSelectedProposal(null)} style={{ padding: '8px 18px', fontSize: 13 }}>
                Đóng
              </Button>
              {['SUBMITTED', 'REVIEWING'].includes(selectedProposal.status) && (
                <>
                  <Button
                    variant="secondary"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedProposal.id, 'REJECTED')}
                    style={{ padding: '8px 16px', fontSize: 13, color: '#DC2626', borderColor: '#FECACA' }}
                  >
                    Từ chối
                  </Button>
                  {onNavigateSelection && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        const target = { id: selectedProposal.job_id, title: selectedProposal.job_title, work_type: 'FREELANCE' };
                        setSelectedProposal(null);
                        onNavigateSelection(target);
                      }}
                      style={{ padding: '8px 20px', fontSize: 13, background: 'var(--color-primary)', fontWeight: 800 }}
                    >
                      Chọn ứng viên này (WF-E08)
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </AnimatedModal>
      )}
    </div>
  );
}
