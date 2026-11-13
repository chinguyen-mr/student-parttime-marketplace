import React, { useState } from 'react';
import { Star } from 'lucide-react';

const FILL = '#F59E0B';
const EMPTY = '#E2E8F0';

/**
 * Hiển thị số sao (value có thể lẻ, làm tròn 0,5) hoặc chọn sao khi có onChange.
 * Chế độ chọn: nhóm radio truy cập được bằng bàn phím.
 */
export default function RatingStars({ value = 0, size = 16, onChange, label, idPrefix }) {
  const [hover, setHover] = useState(0);

  if (!onChange) {
    const rounded = Math.round(Number(value || 0) * 2) / 2;
    return (
      <span role="img" aria-label={`${Number(value || 0).toFixed(1)} trên 5 sao`} style={{ display: 'inline-flex', gap: 1, verticalAlign: 'middle' }}>
        {[1, 2, 3, 4, 5].map(i => {
          const full = rounded >= i;
          const half = !full && rounded >= i - 0.5;
          return (
            <span key={i} style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
              <Star size={size} color={EMPTY} fill={EMPTY} style={{ position: 'absolute', inset: 0 }} />
              {(full || half) && (
                <span style={{ position: 'absolute', inset: 0, width: full ? '100%' : '50%', overflow: 'hidden' }}>
                  <Star size={size} color={FILL} fill={FILL} />
                </span>
              )}
            </span>
          );
        })}
      </span>
    );
  }

  const shown = hover || value;
  const names = ['Rất tệ', 'Chưa tốt', 'Bình thường', 'Tốt', 'Rất tốt'];
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} sao – ${names[i - 1]}`}
          id={idPrefix ? `${idPrefix}-${i}` : undefined}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(5, (value || 0) + 1)); }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(1, (value || 0) - 1)); }
          }}
          style={{ border: 'none', background: 'none', padding: 2, cursor: 'pointer', lineHeight: 0 }}
        >
          <Star size={size} color={shown >= i ? FILL : '#CBD5E1'} fill={shown >= i ? FILL : 'none'} />
        </button>
      ))}
      <span style={{ fontSize: 12, color: value ? '#475569' : '#94A3B8', marginLeft: 6, minWidth: 74 }}>
        {shown ? names[shown - 1] : 'Chưa chấm'}
      </span>
    </div>
  );
}
