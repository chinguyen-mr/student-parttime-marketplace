import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Send, Mail, CheckCircle2, Bell } from 'lucide-react';
import { apiJson, card, input, btn, btnPrimary, hintStyle } from '../../components/employer/companyProfileShared';

const FILTERS = [['OPEN', 'Chưa trả lời'], ['DONE', 'Đã trả lời'], ['ALL', 'Tất cả']];
const fmt = (d) => (d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '');
const BADGE = {
  OPEN: { background: '#FEF3C7', color: '#78350F', border: '1px solid #FCD34D' },
  DONE: { background: '#DCFCE7', color: '#14532D', border: '1px solid #86EFAC' },
};

/** Tin nhắn từ form "Trung tâm hỗ trợ": Admin đọc và trả lời ngay trong trang. */
export default function AdminSupportPage({ currentUser, showToast }) {
  const token = currentUser?.token;
  const [filter, setFilter] = useState('OPEN');
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState(null);
  const [mailFallback, setMailFallback] = useState({}); // id → mailto khi máy chủ chưa gửi được email
  const notify = (m, t) => showToast && showToast(m, t);

  const load = async () => {
    setState('loading');
    try { setRows(await apiJson(token, '/admin/support-requests')); setState('ready'); } catch { setState('error'); }
  };
  useEffect(() => { if (token) load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (row) => {
    const message = (drafts[row.id] || '').trim();
    if (message.length < 5) { notify('Câu trả lời cần ít nhất 5 ký tự.', 'error'); return; }
    setBusy(row.id);
    try {
      const r = await apiJson(token, `/admin/support-requests/${row.id}/reply`, { method: 'POST', body: { message } });
      const parts = [r.emailed && 'đã gửi email', r.in_app && 'đã báo trong ứng dụng'].filter(Boolean);
      if (!r.emailed) {
        setMailFallback(m => ({ ...m, [row.id]: `mailto:${row.email}?subject=${encodeURIComponent(`[JobNest] Phản hồi yêu cầu hỗ trợ: ${row.topic}`)}&body=${encodeURIComponent(`Chào ${row.name || 'bạn'},\n\n${message}\n\n---\nCâu hỏi của bạn:\n${row.message}\n\nTrân trọng,\nTrung tâm hỗ trợ JobNest`)}` }));
      }
      notify(parts.length ? `Đã trả lời (${parts.join(', ')}).` : 'Đã lưu câu trả lời. Máy chủ chưa gửi được email — bấm "Gửi bằng ứng dụng email".', parts.length ? 'success' : 'info');
      setDrafts(d => ({ ...d, [row.id]: '' }));
      load();
    } catch (ex) { notify(ex.message, 'error'); } finally { setBusy(null); }
  };

  const status = (row) => (row.replies.length ? 'DONE' : 'OPEN');
  const shown = rows.filter(r => filter === 'ALL' || status(r) === filter);
  const openCount = rows.filter(r => status(r) === 'OPEN').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Hỗ trợ liên hệ</h1>
        <p style={{ ...hintStyle, fontSize: 13.5, color: '#475569', maxWidth: '64ch' }}>
          Tin nhắn gửi từ form "Trung tâm hỗ trợ". Câu trả lời được gửi qua email người gửi đã nhập; nếu email trùng tài khoản JobNest, họ cũng nhận ở chuông thông báo.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FILTERS.map(([v, l]) => (
          <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)}
            style={{ ...btn, borderColor: filter === v ? '#7565A8' : '#E2E8F0', background: filter === v ? '#F1EEF8' : '#fff', color: filter === v ? '#594675' : '#475569' }}>
            {l}{v === 'OPEN' && state === 'ready' ? ` (${openCount})` : ''}
          </button>
        ))}
        <button type="button" style={{ ...btn, marginLeft: 'auto' }} onClick={load}><RefreshCw size={14} /> Tải lại</button>
      </div>

      {state === 'loading' && <div style={{ ...card, color: '#475569' }}><Loader2 size={16} className="animate-spin" /> Đang tải…</div>}
      {state === 'error' && <div style={{ ...card, color: '#B91C1C' }} role="alert">Không tải được danh sách. <button type="button" style={btn} onClick={load}>Thử lại</button></div>}
      {state === 'ready' && shown.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: '#475569' }}>{filter === 'OPEN' ? 'Không còn yêu cầu nào chờ trả lời.' : 'Chưa có yêu cầu hỗ trợ nào.'}</div>
      )}
      {state === 'ready' && shown.map(row => (
        <div key={row.id} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <strong>{row.name || 'Không rõ tên'}</strong> <span style={{ color: '#475569' }}>· {row.topic}</span>
              <div style={{ fontSize: 13, color: '#475569', overflowWrap: 'anywhere' }}>{row.email}</div>
              <div style={{ fontSize: 13, color: '#475569' }}>Gửi lúc {fmt(row.created_at)}</div>
            </div>
            <span style={{ alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 6, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', ...BADGE[status(row)] }}>
              {status(row) === 'DONE' ? 'Đã trả lời' : 'Chưa trả lời'}
            </span>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.55, whiteSpace: 'pre-line', background: '#F8FAFC', borderRadius: 8, padding: '10px 12px', maxWidth: '80ch' }}>{row.message}</div>

          {row.replies.map((r, i) => (
            <div key={i} style={{ fontSize: 13.5, lineHeight: 1.55, borderLeft: '3px solid #7565A8', padding: '2px 0 2px 12px', maxWidth: '80ch' }}>
              <div style={{ whiteSpace: 'pre-line' }}>{r.message}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span>{r.admin_name} · {fmt(r.created_at)}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {r.emailed ? <><CheckCircle2 size={12} color="#047857" /> Đã gửi email</> : <><Mail size={12} /> Chưa gửi email tự động</>}
                </span>
                {r.in_app && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Bell size={12} /> Đã báo trong ứng dụng</span>}
              </div>
            </div>
          ))}

          {mailFallback[row.id] && (
            <a href={mailFallback[row.id]} style={{ ...btn, alignSelf: 'flex-start', textDecoration: 'none' }}>
              <Mail size={14} /> Gửi bằng ứng dụng email
            </a>
          )}

          <textarea rows={3} maxLength={3000} style={{ ...input, resize: 'vertical' }} aria-label={`Trả lời ${row.name || row.email}`}
            placeholder={row.replies.length ? 'Gửi thêm câu trả lời…' : 'Nhập câu trả lời cho người gửi…'}
            value={drafts[row.id] || ''} onChange={(e) => setDrafts(d => ({ ...d, [row.id]: e.target.value }))} />
          <div>
            <button type="button" style={btnPrimary} disabled={busy === row.id} onClick={() => send(row)}>
              {busy === row.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Gửi trả lời
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
