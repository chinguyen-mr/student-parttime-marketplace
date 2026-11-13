import React, { useMemo, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { suggestedSkillsForMajor, ALL_SKILLS } from '../../constants/profileOptions';

// So khớp không phân biệt dấu & hoa thường ("reac" khớp "ReactJS", "giao tiep" khớp "Giao tiếp")
const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/**
 * Ô nhập kỹ năng dạng thẻ. Gõ để xem gợi ý theo chuyên ngành; Enter hoặc dấu phẩy để thêm
 * cả kỹ năng không có trong danh sách gợi ý.
 */
export default function SkillTagInput({ value = [], onChange, major, max = 30 }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const has = (s) => value.some(v => fold(v) === fold(s));
  const majorSkills = useMemo(() => suggestedSkillsForMajor(major), [major]);

  const suggestions = useMemo(() => {
    const q = fold(text.trim());
    if (!q) return majorSkills.filter(s => !has(s)).slice(0, 10);
    const pool = [...majorSkills, ...ALL_SKILLS.filter(s => !majorSkills.includes(s))];
    return pool.filter(s => !has(s) && fold(s).includes(q)).slice(0, 8);
  }, [text, majorSkills, value]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = (raw) => {
    const s = String(raw).trim().replace(/,+$/, '').slice(0, 60);
    if (!s || has(s) || value.length >= max) { setText(''); return; }
    onChange([...value, s]);
    setText('');
    setActiveIdx(0);
  };
  const remove = (s) => onChange(value.filter(v => v !== s));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const typed = text.trim();
      // Enter khi đang chọn gợi ý → thêm gợi ý; nếu không, thêm đúng chữ đã gõ
      if (e.key === 'Enter' && suggestions[activeIdx] && typed && fold(suggestions[activeIdx]).includes(fold(typed))) add(suggestions[activeIdx]);
      else add(typed);
    } else if (e.key === 'Backspace' && !text && value.length) {
      remove(value[value.length - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  const showList = focused && suggestions.length > 0;

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', minHeight: 44,
          padding: '6px 8px', borderRadius: 8, background: '#ffffff',
          border: `1.5px solid ${focused ? '#7565A8' : 'var(--color-border, #E2E8F0)'}`
        }}
        onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
      >
        {value.map(s => (
          <span key={s} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F1EEF8', color: '#594675',
            border: '1px solid #DDD6FE', borderRadius: 999, padding: '3px 6px 3px 10px', fontSize: 12.5, fontWeight: 600
          }}>
            {s}
            <button type="button" onClick={() => remove(s)} aria-label={`Xóa kỹ năng ${s}`}
              style={{ display: 'flex', background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: '#7565A8' }}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); setActiveIdx(0); }}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={value.length ? 'Thêm kỹ năng…' : 'Gõ kỹ năng, ví dụ: ReactJS, Pha chế, Canva…'}
          disabled={value.length >= max}
          style={{ flex: 1, minWidth: 160, border: 'none', outline: 'none', fontSize: 13.5, padding: '4px 2px', background: 'transparent' }}
        />
      </div>

      {showList && (
        <div role="listbox" style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20, background: '#ffffff',
          border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 10px 24px rgba(15,23,42,0.12)', padding: 6,
          display: 'flex', flexWrap: 'wrap', gap: 6
        }}>
          <div style={{ width: '100%', fontSize: 11.5, color: '#64748B', fontWeight: 600, padding: '2px 4px' }}>
            {text.trim() ? 'Gợi ý phù hợp' : `Gợi ý theo chuyên ngành${major ? ` "${major}"` : ''}`}
          </div>
          {suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => { e.preventDefault(); add(s); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 999,
                border: '1px dashed #C4B5FD', background: i === activeIdx && text.trim() ? '#EDE9FE' : '#FAF8FF',
                color: '#594675', fontSize: 12.5, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Plus size={12} /> {s}
            </button>
          ))}
        </div>
      )}
      <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}>
        Nhấn Enter hoặc dấu phẩy để thêm kỹ năng không có trong gợi ý · {value.length}/{max}
      </div>
    </div>
  );
}
