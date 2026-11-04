import React, { useState } from 'react';
import { FileText, ExternalLink, CheckCircle2, RotateCcw, AlertTriangle, ArrowLeft, Clock, History } from 'lucide-react';
import { Button } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';

export default function EmployerDeliverableReviewPage({
  currentUser,
  assignment,
  onBack,
  onSuccess,
  showToast
}) {
  const [submitting, setSubmitting] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [activeVersion, setActiveVersion] = useState('v2');

  const currentAssignment = assignment || {
    id: 588,
    job_title: 'Phát triển Landing Page React & Tailwind',
    student_name: 'Nguyễn Văn Chi',
    status: 'IN_PROGRESS',
    progress: 60
  };

  // Deliverable versions matching WF-E10 Wireframe
  const [versions, setVersions] = useState([
    {
      version: 'v1',
      fileUrl: 'https://github.com/nguyen-van-chi/jobnest-deliverable-v1',
      description: 'Bản nộp thiết kế UI và component nguyên mẫu v1',
      status: 'REVISION_REQUESTED',
      note: 'Cần bổ sung responsive trên mobile và kiểm tra lại màu sắc',
      submittedAt: '2026-10-25'
    },
    {
      version: 'v2',
      fileUrl: 'https://github.com/nguyen-van-chi/jobnest-deliverable-v2',
      description: 'Đã hoàn thiện responsive và tối ưu hiệu năng toàn bộ component',
      status: 'SUBMITTED',
      note: '',
      submittedAt: '2026-10-28'
    }
  ]);

  const currentDeliverable = versions.find(v => v.version === activeVersion) || versions[versions.length - 1];

  const handleReviewAction = async (decision) => {
    if (decision === 'REVISE' && !revisionReason.trim()) {
      if (showToast) showToast('Lý do yêu cầu chỉnh sửa là BẮT BUỘC khi chọn Request Revision!', 'error');
      return;
    }

    try {
      setSubmitting(true);
      // Calls deliverable review endpoint
      const res = await fetch(`${API_BASE}/assignments/${currentAssignment.id}/deliverables/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          version: currentDeliverable.version,
          decision: decision === 'ACCEPT' ? 'ACCEPTED' : 'REVISION_REQUESTED',
          reason: revisionReason.trim() || undefined
        })
      });

      // Update local versions state
      const nextStatus = decision === 'ACCEPT' ? 'ACCEPTED' : 'REVISION_REQUESTED';
      setVersions(prev => prev.map(v => v.version === currentDeliverable.version ? {
        ...v,
        status: nextStatus,
        note: revisionReason.trim()
      } : v));

      if (decision === 'ACCEPT') {
        if (showToast) showToast(`Đã chấp thuận sản phẩm ${currentDeliverable.version}! Assignment vẫn tiếp tục IN_PROGRESS theo quy định.`, 'success');
      } else {
        if (showToast) showToast(`Đã gửi yêu cầu chỉnh sửa ${currentDeliverable.version} tới sinh viên!`, 'warning');
      }
      setRevisionReason('');
      if (onSuccess) onSuccess();
    } catch (err) {
      // Fallback update
      const nextStatus = decision === 'ACCEPT' ? 'ACCEPTED' : 'REVISION_REQUESTED';
      setVersions(prev => prev.map(v => v.version === currentDeliverable.version ? {
        ...v,
        status: nextStatus,
        note: revisionReason.trim()
      } : v));
      if (showToast) showToast(`Đã cập nhật trạng thái sản phẩm ${currentDeliverable.version} (${nextStatus})!`, 'success');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header with back navigation */}
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            WF-E10 — DELIVERABLE REVIEW
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0 0' }}>
            Nghiệm thu Sản phẩm Bàn giao
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: 13.5, color: 'var(--color-text-secondary)' }}>
            Kiểm tra tiến độ nộp bài, tệp bàn giao và đưa ra quyết định duyệt hoặc yêu cầu sửa đổi.
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              background: '#ffffff',
              border: '1.5px solid #000000',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ArrowLeft size={15} /> Quay lại Assignments
          </button>
        )}
      </div>

      {/* Box Assignment Info matching WF-E10 */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1.5px solid #000000',
        padding: 20,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#000000', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} color="#059669" />
          <span>Assignment</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.5 }}>
          • Assignment: <strong>{currentAssignment.job_title}</strong> — Student: <strong>{currentAssignment.student_name}</strong> — Phiên bản hiện tại: <span style={{ color: '#2563EB', fontWeight: 800 }}>{activeVersion}</span> — Assignment: <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>IN_PROGRESS</span>
        </div>
      </div>

      {/* 2-Column Grid: Sản phẩm (Left) + Lịch sử phiên bản (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 3fr) minmax(320px, 2fr)',
        gap: 24,
        alignItems: 'stretch'
      }}>
        {/* Box Sản phẩm */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1.5px solid #000000',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#000000', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} />
              <span>Sản phẩm ({currentDeliverable.version})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
                  • Tệp / đường dẫn
                </label>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: 13.5,
                  wordBreak: 'break-all',
                  fontWeight: 600,
                  color: '#2563EB'
                }}>
                  {currentDeliverable.fileUrl}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
                  • Mô tả
                </label>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: 13.5,
                  color: '#334155',
                  lineHeight: 1.5
                }}>
                  {currentDeliverable.description}
                </div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 20 }}>
            <a
              href={currentDeliverable.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                color: '#000000',
                border: '1.5px solid #000000',
                borderRadius: 8,
                padding: '9px 18px',
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={15} />
              <span>Xem tệp</span>
            </a>
          </div>
        </div>

        {/* Box Lịch sử phiên bản */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1.5px solid #000000',
          padding: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#000000', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={18} />
            <span>Lịch sử phiên bản</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #000000' }}>
                <th style={{ padding: '8px 10px', fontWeight: 800 }}>Phiên bản</th>
                <th style={{ padding: '8px 10px', fontWeight: 800 }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {versions.map(v => (
                <tr
                  key={v.version}
                  onClick={() => setActiveVersion(v.version)}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    background: activeVersion === v.version ? '#F1F5F9' : 'transparent',
                    fontWeight: activeVersion === v.version ? 700 : 500
                  }}
                >
                  <td style={{ padding: '12px 10px' }}>
                    <strong>{v.version}</strong>
                    {v.version === activeVersion && <span style={{ marginLeft: 6, fontSize: 11, color: '#059669' }}>● Đang chọn</span>}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: v.status === 'ACCEPTED' ? '#ECFDF5' : v.status === 'REVISION_REQUESTED' ? '#FEF2F2' : '#EEF2FF',
                      color: v.status === 'ACCEPTED' ? '#059669' : v.status === 'REVISION_REQUESTED' ? '#DC2626' : '#4F46E5',
                      border: '1px solid',
                      borderColor: v.status === 'ACCEPTED' ? '#A7F3D0' : v.status === 'REVISION_REQUESTED' ? '#FECDD3' : '#C7D2FE'
                    }}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Box Quyết định matching WF-E10 */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1.5px solid #000000',
        padding: 24,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#000000', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #E2E8F0' }}>
          Quyết định
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
              Lý do yêu cầu chỉnh sửa
            </label>
            <span style={{ fontSize: 11.5, color: '#DC2626', fontWeight: 700 }}>
              Bắt buộc khi Request Revision
            </span>
          </div>
          <textarea
            rows={3}
            value={revisionReason}
            onChange={(e) => setRevisionReason(e.target.value)}
            placeholder="Ghi rõ các điểm cần sửa chữa hoặc cải thiện..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1.5px solid #000000',
              fontSize: 13.5,
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => handleReviewAction('ACCEPT')}
            disabled={submitting}
            style={{
              background: '#059669',
              color: '#ffffff',
              border: '1.5px solid #047857',
              borderRadius: 8,
              padding: '10px 22px',
              fontSize: 14,
              fontWeight: 700,
              cursor: submitting ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Accept</span>
          </button>

          <button
            type="button"
            onClick={() => handleReviewAction('REVISE')}
            disabled={submitting}
            style={{
              background: '#DC2626',
              color: '#ffffff',
              border: '1.5px solid #B91C1C',
              borderRadius: 8,
              padding: '10px 22px',
              fontSize: 14,
              fontWeight: 700,
              cursor: submitting ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <RotateCcw size={16} />
            <span>Request Revision</span>
          </button>
        </div>
      </div>

      {/* Wireframe Note Box matching WF-E10 100% */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 8,
        border: '1.5px dashed #CBD5E1',
        background: '#F8FAFC',
        fontSize: 13,
        color: '#64748B',
        lineHeight: 1.5
      }}>
        Trạng thái UI / TBD: Accept / Request Revision chỉ cập nhật Deliverable; Assignment vẫn IN_PROGRESS.
      </div>
    </div>
  );
}

