import React, { useState } from 'react';
import { Headphones, Mail, Copy, Check, X, Clock } from 'lucide-react';
import { AnimatedModal, Button } from '../ui';
import { parseSupportBody } from '../../utils/supportDisplay';

/** Admin bấm thông báo "Yêu cầu hỗ trợ" → xem chi tiết và trả lời người gửi qua email. */
export default function SupportRequestModal({ notification, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!notification) return null;
  const { name, email, message } = parseSupportBody(notification.body);
  const topic = String(notification.title || '').replace(/^Yêu cầu hỗ trợ:\s*/, '');
  const sentAt = notification.created_at ? new Date(notification.created_at).toLocaleString('vi-VN') : '';

  const subject = `Re: [JobNest] ${topic}`;
  const quoted = message.split('\n').map(l => `> ${l}`).join('\n');
  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Chào ${name || 'bạn'},\n\n\n\n---\nBạn đã gửi lúc ${sentAt}:\n${quoted}\n\nJobNest — Trung tâm hỗ trợ`)}`;

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(email); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* trình duyệt chặn clipboard */ }
  };

  const row = { display: 'grid', gridTemplateColumns: '110px minmax(0, 1fr)', gap: 8, fontSize: 13.5, padding: '6px 0' };
  return (
    <AnimatedModal isOpen={Boolean(notification)} onClose={onClose} maxWidth="560px">
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Headphones size={19} color="var(--color-primary)" /> Yêu cầu hỗ trợ
          </h2>
          <button type="button" onClick={onClose} aria-label="Đóng" style={{ color: 'var(--color-text-secondary)', display: 'flex' }}><X size={18} /></button>
        </div>

        <div style={row}><span style={{ color: 'var(--color-text-secondary)' }}>Chủ đề</span><strong>{topic || '—'}</strong></div>
        <div style={row}><span style={{ color: 'var(--color-text-secondary)' }}>Người gửi</span><span>{name || '—'}</span></div>
        <div style={row}><span style={{ color: 'var(--color-text-secondary)' }}>Email</span><span style={{ wordBreak: 'break-all' }}>{email || '—'}</span></div>
        <div style={row}><span style={{ color: 'var(--color-text-secondary)' }}>Thời gian</span><span><Clock size={13} style={{ verticalAlign: '-2px' }} /> {sentAt}</span></div>

        <div style={{ marginTop: 10, padding: '12px 14px', background: 'var(--color-lavender-surface)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {message}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {email && (
            <Button variant="secondary" onClick={copyEmail} style={{ padding: '8px 14px', fontSize: 13, gap: 6 }}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Đã sao chép' : 'Sao chép email'}
            </Button>
          )}
          {email ? (
            <a href={mailto} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}>
              <Mail size={14} /> Trả lời qua email
            </a>
          ) : (
            <Button variant="secondary" onClick={onClose} style={{ padding: '8px 14px', fontSize: 13 }}>Đóng</Button>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
}
