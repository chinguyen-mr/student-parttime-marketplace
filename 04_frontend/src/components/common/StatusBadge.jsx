import React from 'react';
import { getStatusInfo } from '../../utils/formatters';

/**
 * Standard StatusBadge Component for JobNest.
 * Replaces raw enums like IN_PROGRESS, PENDING, ACCEPTED with friendly Vietnamese labels and palette colors.
 */
export default function StatusBadge({
  status,
  size = 'md', // 'sm' | 'md' | 'lg'
  style = {},
  className = ''
}) {
  const info = getStatusInfo(status);

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '12px' },
    md: { padding: '4px 11px', fontSize: '12px', fontWeight: 700, borderRadius: '14px' },
    lg: { padding: '6px 14px', fontSize: '13px', fontWeight: 800, borderRadius: '16px' }
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: info.bg,
        color: info.color,
        border: `1px solid ${info.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        ...selectedSize,
        ...style
      }}
    >
      <span
        style={{
          width: size === 'sm' ? '5px' : '6px',
          height: size === 'sm' ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: info.color,
          flexShrink: 0
        }}
      />
      {info.label}
    </span>
  );
}

