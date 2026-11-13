import React, { useState } from 'react';
import { Send, Loader2, Clock3, XCircle } from 'lucide-react';
import { API_BASE } from '../../config/api';

/**
 * Hiện khi đăng nhập bị từ chối vì tài khoản bị khóa (details.code = 'ACCOUNT_BANNED').
 * Người bị khóa không có token → gửi khiếu nại kèm email + mật khẩu vừa nhập để xác minh.
 */
export default function AccountAppealPanel({ email, password, appeal, apiBase = API_BASE }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [state, setState] = useState({ busy: false, error: '', done: false });
  const pending = state.done || appeal?.status === 'PENDING';

  const submit = async () => {
    if (text.trim().length < 10) { setState(s => ({ ...s, error: 'Vui lòng trình bày nội dung khiếu nại (ít nhất 10 ký tự).' })); return; }
    setState({ busy: true, error: '', done: false });
    try {
      const res = await fetch(`${apiBase}/auth/appeals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, appeal_reason: text.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Không gửi được khiếu nại.');
      setState({ busy: false, error: '', done: true });
    } catch (err) {
      setState({ busy: false, error: err.message, done: false });
    }
  };

  const box = { marginBottom: 18, padding: '12px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: 13, color: '#334155', lineHeight: 1.5 };

  if (pending) {
    return (
      <div style={box} role="status">
        <Clock3 size={15} style={{ verticalAlign: -3, color: '#B45309' }} /> <strong>Khiếu nại đang chờ Quản trị viên xử lý.</strong> Khi được chấp nhận, bạn có thể đăng nhập lại bình thường.
      </div>
    );
  }

  return (
    <div style={box}>
      {appeal?.status === 'REJECTED' && (
        <p style={{ margin: '0 0 8px 0', color: '#B91C1C' }}>
          <XCircle size={15} style={{ verticalAlign: -3 }} /> Khiếu nại trước đã bị từ chối{appeal.admin_response ? `: ${appeal.admin_response}` : '.'}
        </p>
      )}
      {!open ? (
        <button type="button" onClick={() => setOpen(true)}
          style={{ background: 'none', border: 'none', padding: 0, color: '#594675', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          Bạn cho rằng đây là nhầm lẫn? Gửi khiếu nại →
        </button>
      ) : (
        <>
          <label htmlFor="appeal-text" style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Nội dung khiếu nại</label>
          <textarea id="appeal-text" rows={4} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Trình bày lý do bạn cho rằng tài khoản bị khóa nhầm, kèm thông tin giúp Quản trị viên xác minh."
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
          {state.error && <p role="alert" style={{ margin: '6px 0 0 0', color: '#B91C1C' }}>{state.error}</p>}
          <button type="button" onClick={submit} disabled={state.busy}
            style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#7565A8', color: '#fff', fontWeight: 700, cursor: state.busy ? 'wait' : 'pointer' }}>
            {state.busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Gửi khiếu nại
          </button>
        </>
      )}
    </div>
  );
}
