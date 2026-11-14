import React, { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, Printer, ChevronDown, Loader2 } from 'lucide-react';
import { exportExcel, printReport } from '../../utils/reportExport';

/**
 * Nút "Xuất báo cáo" → Excel (.xlsx) hoặc In / Lưu PDF.
 * getReport: () => report spec (xem utils/reportExport.js) hoặc Promise trả về spec.
 */
export default function ExportMenu({ getReport, disabled = false, label = 'Xuất báo cáo', onError, style }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const run = async (kind) => {
    setOpen(false);
    setBusy(true);
    try {
      const spec = await getReport();
      if (kind === 'excel') await exportExcel(spec);
      else printReport(spec);
    } catch (err) {
      console.error('Lỗi xuất báo cáo:', err);
      if (onError) onError(err);
    } finally {
      setBusy(false);
    }
  };

  const item = {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'none',
    cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'left', borderRadius: 8,
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        disabled={disabled || busy}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 10,
          border: '1.5px solid #7565A8', background: '#F5F3FB', color: '#4C3F86', fontSize: 13, fontWeight: 700,
          cursor: disabled || busy ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, whiteSpace: 'nowrap',
        }}
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
        <span>{busy ? 'Đang xuất…' : label}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div role="menu" style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 50, minWidth: 230, padding: 6, background: '#fff',
          border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 12px 32px rgba(15,23,42,0.14)',
        }}>
          <button type="button" role="menuitem" style={item} onClick={() => run('excel')}
            onMouseEnter={e => { e.currentTarget.style.background = '#F5F3FB'; }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
            <FileSpreadsheet size={17} color="#15803D" />
            <span>Excel (.xlsx)<br /><small style={{ color: '#64748B', fontWeight: 500 }}>Bảng tính có định dạng, lọc được</small></span>
          </button>
          <button type="button" role="menuitem" style={item} onClick={() => run('print')}
            onMouseEnter={e => { e.currentTarget.style.background = '#F5F3FB'; }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
            <Printer size={17} color="#7565A8" />
            <span>In / Lưu PDF<br /><small style={{ color: '#64748B', fontWeight: 500 }}>Bản báo cáo A4 có chỗ ký tên</small></span>
          </button>
        </div>
      )}
    </div>
  );
}
