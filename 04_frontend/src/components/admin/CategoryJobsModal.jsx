import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, Briefcase, Users, Clock, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import AnimatedModal from '../ui/AnimatedModal';
import ExportMenu from '../common/ExportMenu';
import { API_BASE, formatApiError } from '../../config/api';
import { getStatusInfo } from '../../utils/formatters';
import { formatSalary } from '../../utils/jobDisplay';
import { fmtDate } from '../../utils/reportExport';

const FILTERS = [
  ['ALL', 'Tất cả'], ['OPEN', 'Đang tuyển'], ['PENDING', 'Chờ duyệt'], ['FILLED', 'Đủ người'],
  ['DONE', 'Đã kết thúc'], ['REJECTED', 'Bị từ chối'],
];
const matchFilter = (j, f) => {
  if (f === 'ALL') return true;
  if (f === 'PENDING') return j.moderation_status === 'PENDING';
  if (f === 'REJECTED') return j.moderation_status === 'REJECTED';
  if (j.moderation_status !== 'APPROVED') return false;
  if (f === 'DONE') return ['COMPLETED', 'CLOSED', 'EXPIRED'].includes(j.status);
  return j.status === f;
};
const jobStatusText = (j) => (j.moderation_status === 'PENDING' ? 'Chờ duyệt'
  : j.moderation_status === 'REJECTED' ? 'Bị từ chối'
    : j.status === 'FILLED' ? 'Đủ người' : getStatusInfo(j.status).label);

export default function CategoryJobsModal({ category, token, adminName, onClose, onOpenModeration }) {
  const [state, setState] = useState({ loading: true, error: null, jobs: [] });
  const [filter, setFilter] = useState('ALL');
  const [q, setQ] = useState('');

  const load = async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}/admin/categories/${category.id}/jobs`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Không tải được danh sách tin');
      setState({ loading: false, error: null, jobs: data.data.jobs || [] });
    } catch (err) {
      setState({ loading: false, error: formatApiError(err, 'Không tải được danh sách tin'), jobs: [] });
    }
  };
  useEffect(() => { if (category) { setFilter('ALL'); setQ(''); load(); } }, [category?.id]);

  const { jobs } = state;
  const shown = useMemo(() => {
    const k = q.trim().toLowerCase();
    return jobs.filter(j => matchFilter(j, filter) && (!k || `${j.title} ${j.company_name} ${j.location}`.toLowerCase().includes(k)));
  }, [jobs, filter, q]);

  const stats = [
    ['Tổng số tin', jobs.length, Briefcase, '#7565A8'],
    ['Đang tuyển', jobs.filter(j => matchFilter(j, 'OPEN')).length, CheckCircle2, '#047857'],
    ['Chờ duyệt', jobs.filter(j => j.moderation_status === 'PENDING').length, Clock, '#B45309'],
    ['Lượt ứng tuyển', jobs.reduce((s, j) => s + (j.application_count || 0), 0), Users, '#1D4ED8'],
  ];

  const getReport = () => ({
    title: `Danh sách tin tuyển dụng — ${category.name}`,
    subtitle: `Bộ lọc: ${FILTERS.find(f => f[0] === filter)[1]}${q.trim() ? ` · Từ khóa: "${q.trim()}"` : ''}`,
    fileName: `tin-tuyen-dung-${category.name}`,
    author: adminName,
    summary: stats.map(([l, v]) => [l, v]),
    columns: [
      { header: 'Mã tin', value: j => `#${j.id}`, width: 9 },
      { header: 'Tiêu đề', value: j => j.title, width: 36 },
      { header: 'Doanh nghiệp', value: j => j.company_name, width: 26 },
      { header: 'Mức lương', value: j => formatSalary(j), width: 18 },
      { header: 'Trạng thái', value: jobStatusText, width: 14 },
      { header: 'Số ứng tuyển', value: j => j.application_count, type: 'number', width: 12 },
      { header: 'Ngày đăng', value: j => j.created_at, type: 'date', width: 12 },
      { header: 'Hạn nộp', value: j => j.application_deadline, type: 'date', width: 12 },
    ],
    rows: shown,
  });

  const chip = (active) => ({
    padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
    border: `1.5px solid ${active ? '#7565A8' : '#E2E8F0'}`, background: active ? '#7565A8' : '#fff', color: active ? '#fff' : '#334155',
  });

  return (
    <AnimatedModal isOpen={!!category} onClose={onClose} maxWidth="1080px">
      {category && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '88vh', padding: 24, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#594675', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ngành nghề #{category.id}</div>
              <h2 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>{category.name}</h2>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <ExportMenu getReport={getReport} disabled={state.loading || !!state.error} />
              <button type="button" onClick={onClose} aria-label="Đóng" style={{ border: 'none', background: '#F1F5F9', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 10 }}>
            {stats.map(([label, value, Icon, color]) => (
              <div key={label} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={20} color={color} />
                <div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: '#0F172A' }}>{state.loading ? '…' : value}</div>
                  <div style={{ fontSize: 13, color: '#475569' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FILTERS.map(([k, l]) => (
                <button key={k} type="button" style={chip(filter === k)} onClick={() => setFilter(k)}>
                  {l} ({jobs.filter(j => matchFilter(j, k)).length})
                </button>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '0 10px', height: 36, minWidth: 240 }}>
              <Search size={15} color="#94A3B8" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tiêu đề, doanh nghiệp…" aria-label="Tìm tin"
                style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, background: 'transparent' }} />
            </label>
          </div>

          <div style={{ overflow: 'auto', border: '1px solid #CBD5E1', borderRadius: 12, minHeight: 200, padding: '4px 8px 8px' }}>
            {state.loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
                <RefreshCw size={22} className="animate-spin" style={{ margin: '0 auto 10px' }} />Đang tải danh sách tin…
              </div>
            ) : state.error ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#B91C1C' }}>
                <AlertTriangle size={22} style={{ margin: '0 auto 10px' }} />
                <div style={{ marginBottom: 12 }}>{state.error}</div>
                <button type="button" onClick={load} style={chip(true)}>Thử lại</button>
              </div>
            ) : shown.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
                {jobs.length === 0 ? 'Danh mục này chưa có tin tuyển dụng nào.' : 'Không có tin nào khớp bộ lọc.'}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', textAlign: 'left', position: 'sticky', top: 0 }}>
                    {['Mã', 'Tiêu đề / Doanh nghiệp', 'Mức lương', 'Trạng thái', 'Ứng tuyển', 'Ngày đăng', 'Hạn nộp'].map(h => (
                      <th key={h} style={{ padding: '11px 12px', fontWeight: 800, fontSize: 12, color: '#0F172A', borderBottom: '1.5px solid #0F172A', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map(j => {
                    const pending = j.moderation_status === 'PENDING';
                    const info = pending ? getStatusInfo('PENDING') : j.moderation_status === 'REJECTED' ? getStatusInfo('REJECTED') : getStatusInfo(j.status);
                    return (
                      <tr key={j.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>#{j.id}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{j.title}</div>
                          <div style={{ fontSize: 13, color: '#475569' }}>{j.company_name}</div>
                        </td>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{formatSalary(j)}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, color: info.color, background: info.bg, border: `1px solid ${info.border}`, whiteSpace: 'nowrap' }}>
                            {jobStatusText(j)}
                          </span>
                          {pending && onOpenModeration && (
                            <button type="button" onClick={onOpenModeration} style={{ display: 'block', marginTop: 4, border: 'none', background: 'none', color: '#7565A8', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                              Đi tới kiểm duyệt →
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>{j.application_count}</td>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{fmtDate(j.created_at)}</td>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{fmtDate(j.application_deadline)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </AnimatedModal>
  );
}
