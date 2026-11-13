import React from 'react';
import { Calendar, Save, RotateCcw, Check } from 'lucide-react';
import { DAY_SHORT, WEEK_ORDER } from '../../utils/jobDisplay';

export const SHIFTS = [
  { key: 'morning', label: 'Sáng', icon: '🌅', start: '07:30', end: '11:30' },
  { key: 'afternoon', label: 'Chiều', icon: '☀️', start: '13:00', end: '17:00' },
  { key: 'evening', label: 'Tối', icon: '🌙', start: '18:00', end: '22:00' },
];

// Cột Thứ 2 → Chủ nhật; giá trị day_of_week theo quy ước backend (1 = CN, 2 = T2 …)
const DAYS = WEEK_ORDER.map(day => ({ day, short: DAY_SHORT[day] }));

const toMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
const slotOf = (day, shift) => ({ day_of_week: day, start_time: `${shift.start}:00`, end_time: `${shift.end}:00`, is_active: true });
const keyOf = (s) => `${s.day_of_week}-${s.start_time.slice(0, 5)}`;

/** Quy mọi khung giờ (vd 08:00-17:00) về các ca chuẩn Sáng/Chiều/Tối mà nó giao nhau. */
export function normalizeSlots(slots = []) {
  const seen = new Set();
  const out = [];
  for (const s of slots) {
    if (s.is_active === false) continue;
    for (const shift of SHIFTS) {
      const overlaps = toMin(s.start_time) < toMin(shift.end) && toMin(s.end_time) > toMin(shift.start);
      const slot = slotOf(s.day_of_week, shift);
      if (overlaps && !seen.has(keyOf(slot))) { seen.add(keyOf(slot)); out.push(slot); }
    }
  }
  return out.sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time));
}

const PRESETS = [
  { label: 'Sáng T2 · T4 · T6', cells: [[2, 'morning'], [4, 'morning'], [6, 'morning']] },
  { label: 'Tối T3 · T5 · T7', cells: [[3, 'evening'], [5, 'evening'], [7, 'evening']] },
  { label: 'Cả ngày cuối tuần', cells: [[7, 'morning'], [7, 'afternoon'], [1, 'morning'], [1, 'afternoon']] },
  { label: 'Tối mọi ngày', cells: DAYS.map(d => [d.day, 'evening']) },
];

/**
 * Lưới chọn ca rảnh 7 ngày × 3 ca. Nút Lưu nằm ở cuối bảng.
 * `slots` phải là dạng đã normalizeSlots.
 */
export default function AvailabilityEditor({ slots, savedSlots, onChange, onSave, saving = false, loading = false }) {
  const active = new Set(slots.map(keyOf));
  const isOn = (day, shift) => active.has(`${day}-${shift.start}`);
  const dirty = JSON.stringify(slots.map(keyOf).sort()) !== JSON.stringify((savedSlots || []).map(keyOf).sort());

  const setCells = (cells, on) => {
    const next = new Map(slots.map(s => [keyOf(s), s]));
    for (const [day, shift] of cells) {
      const slot = slotOf(day, shift);
      if (on) next.set(keyOf(slot), slot); else next.delete(keyOf(slot));
    }
    onChange(normalizeSlots([...next.values()]));
  };
  const toggle = (day, shift) => setCells([[day, shift]], !isOn(day, shift));
  const toggleDay = (day) => {
    const all = SHIFTS.every(sh => isOn(day, sh));
    setCells(SHIFTS.map(sh => [day, sh]), !all);
  };
  const toggleShift = (shift) => {
    const all = DAYS.every(d => isOn(d.day, shift));
    setCells(DAYS.map(d => [d.day, shift]), !all);
  };
  const applyPreset = (preset) => {
    onChange(normalizeSlots(preset.cells.map(([day, k]) => slotOf(day, SHIFTS.find(s => s.key === k)))));
  };

  const headerCell = { padding: '10px 6px', fontSize: 12.5, fontWeight: 800, color: '#594675', textAlign: 'center' };
  const chip = {
    background: '#ffffff', border: '1px solid #DDD6FE', color: '#594675', padding: '6px 12px',
    borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer'
  };

  return (
    <div style={{
      background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)',
      padding: '24px 28px', boxShadow: '0 2px 10px rgba(41, 38, 58, 0.04)'
    }}>
      {/* Tiêu đề */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={20} color="#7565A8" /> Lịch rảnh trong tuần
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
          Chọn các ca bạn có thể đi làm. JobNest dùng lịch này để loại việc trùng giờ học và gợi ý việc phù hợp.
          Bấm vào tên ngày hoặc tên ca để chọn cả cột/hàng.
        </p>
      </div>

      {/* Mẫu chọn nhanh */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748B', marginRight: 2 }}>Chọn nhanh:</span>
        {PRESETS.map(p => (
          <button key={p.label} type="button" style={chip} onClick={() => applyPreset(p)}>{p.label}</button>
        ))}
        <button type="button" style={{ ...chip, borderColor: '#FECACA', color: '#B91C1C' }} onClick={() => onChange([])}>
          Bỏ chọn tất cả
        </button>
      </div>

      {/* Lưới 7 ngày × 3 ca */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 12, opacity: loading ? 0.5 : 1 }}>
        <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: '#F5F3FF' }}>
              <th style={{ ...headerCell, width: 120, textAlign: 'left', paddingLeft: 14 }}>Ca \ Ngày</th>
              {DAYS.map(d => (
                <th key={d.day} style={headerCell}>
                  <button type="button" onClick={() => toggleDay(d.day)} title="Chọn/bỏ cả ngày"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit', padding: '2px 6px' }}>
                    {d.short}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIFTS.map(shift => (
              <tr key={shift.key} style={{ borderTop: '1px solid #EEF0F4' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>
                  <button type="button" onClick={() => toggleShift(shift)} title="Chọn/bỏ ca này cả tuần"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--color-text)' }}>{shift.icon} {shift.label}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>{shift.start} – {shift.end}</div>
                  </button>
                </th>
                {DAYS.map(d => {
                  const on = isOn(d.day, shift);
                  return (
                    <td key={d.day} style={{ padding: 6, textAlign: 'center' }}>
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-label={`${shift.label} ${d.short}`}
                        onClick={() => toggle(d.day, shift)}
                        style={{
                          width: '100%', height: 40, borderRadius: 8, cursor: 'pointer',
                          border: `1.5px solid ${on ? '#7565A8' : '#E2E8F0'}`,
                          background: on ? '#7565A8' : '#FAFAFC', color: '#ffffff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s ease'
                        }}
                      >
                        {on && <Check size={16} strokeWidth={3} />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Thanh lưu ở cuối bảng */}
      <div style={{
        marginTop: 16, padding: '14px 16px', borderRadius: 12,
        background: dirty ? '#FFF7ED' : '#F8FAFC', border: `1px solid ${dirty ? '#FED7AA' : '#E2E8F0'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: 13, color: '#334155' }}>
          Đã chọn <strong>{slots.length}</strong> ca rảnh / tuần
          {dirty && <span style={{ color: '#C2410C', fontWeight: 700 }}> · Có thay đổi chưa lưu</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {dirty && (
            <button type="button" onClick={() => onChange(savedSlots || [])} disabled={saving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8,
                border: '1px solid #CBD5E1', background: '#ffffff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>
              <RotateCcw size={14} /> Hoàn tác
            </button>
          )}
          <button type="button" onClick={onSave} disabled={saving || !dirty}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none',
              background: saving || !dirty ? '#C4B5FD' : '#7565A8', color: '#ffffff', fontSize: 13.5, fontWeight: 700,
              cursor: saving || !dirty ? 'not-allowed' : 'pointer'
            }}>
            <Save size={15} /> {saving ? 'Đang lưu...' : 'Lưu lịch rảnh'}
          </button>
        </div>
      </div>
    </div>
  );
}
