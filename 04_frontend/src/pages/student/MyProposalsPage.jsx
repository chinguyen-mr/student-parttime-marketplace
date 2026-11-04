import React, { useState, useEffect } from 'react';
import { 
  FileText, Building2, Calendar, DollarSign, Clock, 
  CheckCircle2, XCircle, AlertCircle, Eye, ArrowRight, 
  Briefcase, Sparkles, RefreshCw, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, AnimatedModal } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';

export default function MyProposalsPage({ currentUser, onSelectJob, showToast }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProposal, setSelectedProposal] = useState(null);

  const fetchProposals = async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/proposals/my-proposals`, {
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
            <Clock size={13} /> Đã nộp
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
            <CheckCircle2 size={13} /> Đã chấp thuận (A3)
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
    <div>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4A3A69 0%, #685794 100%)',
        borderRadius: 14,
        padding: '28px 30px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>
              <Sparkles size={13} color="#FDE047" /> QUẢN LÝ DỰ ÁN FREELANCE
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
              ĐỀ XUẤT FREELANCE CỦA TÔI
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: '#E2E8F0', maxWidth: 600 }}>
              Theo dõi danh sách các đề xuất dự án, báo giá dịch vụ và trạng thái xét duyệt từ các Nhà tuyển dụng.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={fetchProposals}
            style={{ background: '#ffffff', color: 'var(--color-primary)', border: 'none', padding: '8px 16px', fontSize: 13, gap: 6, fontWeight: 700 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { key: 'ALL', label: `Tất cả (${proposals.length})` },
          { key: 'SUBMITTED', label: `Đã nộp (${proposals.filter(p => p.status === 'SUBMITTED').length})` },
          { key: 'REVIEWING', label: `Đang xem xét (${proposals.filter(p => p.status === 'REVIEWING').length})` },
          { key: 'ACCEPTED', label: `Đã chấp thuận (${proposals.filter(p => p.status === 'ACCEPTED').length})` },
          { key: 'REJECTED', label: `Từ chối (${proposals.filter(p => p.status === 'REJECTED').length})` },
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
              border: statusFilter === tab.key ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: statusFilter === tab.key ? 'var(--color-primary)' : '#ffffff',
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
          Đang tải danh sách đề xuất...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          padding: '48px 20px',
          textAlign: 'center',
        }}>
          <FileText size={44} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
            Chưa có đề xuất nào trong danh mục này
          </h4>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            Khám phá các công việc Freelance trên bảng tin việc làm và nộp báo giá ngay hôm nay.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {filtered.map(item => (
            <motion.div
              key={item.id}
              whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(89, 70, 117, 0.08)' }}
              onClick={() => setSelectedProposal(item)}
              style={{
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                padding: '20px 22px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: 6 }}>
                    {item.category || 'Freelance / Dự án'}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                  {item.job_title || `Dự án #${item.job_id}`}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  <Building2 size={14} />
                  <span>{item.employer_name || 'Doanh nghiệp'}</span>
                </div>

                <p style={{
                  fontSize: 13,
                  color: '#475569',
                  margin: '0 0 14px 0',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {item.proposal_text}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', fontWeight: 800 }}>
                    <DollarSign size={15} color="#10b981" />
                    <span>{item.proposed_price ? `${Number(item.proposed_price).toLocaleString('vi-VN')} đ` : 'Thỏa thuận'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)', fontSize: 12 }}>
                    <Calendar size={13} />
                    <span>{new Date(item.submitted_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <AnimatedModal isOpen={!!selectedProposal} onClose={() => setSelectedProposal(null)} maxWidth="640px">
          <div style={{ padding: '26px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="badge badge-primary" style={{ fontSize: 11 }}>ĐỀ XUẤT #{selectedProposal.id}</span>
                  {getStatusBadge(selectedProposal.status)}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  {selectedProposal.job_title}
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

            <div style={{ background: 'var(--color-background)', borderRadius: 10, padding: '14px 16px', marginBottom: 18, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Nhà tuyển dụng</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>{selectedProposal.employer_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Thù lao đề xuất</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary)' }}>
                    {selectedProposal.proposed_price ? `${Number(selectedProposal.proposed_price).toLocaleString('vi-VN')} đ` : 'Thỏa thuận'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Thời gian hoàn thành</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>
                    {selectedProposal.estimated_duration || 'Chưa xác định'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Ngày nộp đề xuất</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)' }}>
                    {new Date(selectedProposal.submitted_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>
                Nội dung đề xuất & Kế hoạch triển khai:
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="secondary" onClick={() => setSelectedProposal(null)} style={{ padding: '8px 18px', fontSize: 13 }}>
                Đóng
              </Button>
            </div>
          </div>
        </AnimatedModal>
      )}
    </div>
  );
}
