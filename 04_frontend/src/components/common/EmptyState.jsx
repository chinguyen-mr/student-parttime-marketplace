import React from 'react';
import { SearchX, RefreshCw, Briefcase, Filter } from 'lucide-react';
import { Button } from './Button';

/**
 * EmptyState - Reusable empty state component following JOBNEST Wireframes
 * Displays when no jobs or records match active filters, with a friendly CTA to clear filters or retry.
 */
export default function EmptyState({
  title = 'Không tìm thấy việc làm phù hợp',
  message = 'Hãy thử điều chỉnh từ khóa tìm kiếm, mở rộng địa điểm hoặc xóa bộ lọc để xem thêm các cơ hội khác.',
  actionText = 'Xóa tất cả bộ lọc',
  onAction,
  icon: CustomIcon,
}) {
  const IconComponent = CustomIcon || SearchX;

  return (
    <div
      style={{
        background: 'var(--color-surface, #ffffff)',
        border: '1px dashed var(--color-border, #cbd5e1)',
        borderRadius: 16,
        padding: '54px 24px',
        textAlign: 'center',
        margin: '24px 0 36px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className="jobnest-empty-state"
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--color-primary-light, #EDE9FE)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
          color: 'var(--color-primary, #594675)',
        }}
      >
        <IconComponent size={32} />
      </div>

      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--color-text, #1e293b)',
          marginBottom: 8,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 14,
          color: 'var(--color-text-secondary, #64748b)',
          maxWidth: 480,
          lineHeight: 1.5,
          marginBottom: onAction ? 24 : 0,
        }}
      >
        {message}
      </p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            background: 'var(--color-primary, #594675)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 22px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#49375F')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary, #594675)')}
        >
          <Filter size={15} />
          {actionText}
        </button>
      )}
    </div>
  );
}
