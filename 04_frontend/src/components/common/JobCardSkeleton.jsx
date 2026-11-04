import React from 'react';

/**
 * JobCardSkeleton - Skeleton loading state for a single JobCard
 * Matches the exact wireframe layout of JobCard (56x56 logo on left, title, info, badges).
 */
export default function JobCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 180,
        boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="job-card-skeleton"
    >
      <div>
        {/* Top Header: Logo + Title Skeleton */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          {/* 56x56 Company Logo Skeleton */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: '#f1f5f9',
              flexShrink: 0,
              animation: 'skeleton-shimmer 1.5s infinite ease-in-out',
            }}
          />

          {/* Title & Company Name */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title line 1 */}
            <div
              style={{
                width: '75%',
                height: 18,
                borderRadius: 4,
                background: '#e2e8f0',
                marginBottom: 8,
                animation: 'skeleton-shimmer 1.5s infinite ease-in-out',
              }}
            />
            {/* Company name line */}
            <div
              style={{
                width: '45%',
                height: 13,
                borderRadius: 4,
                background: '#f1f5f9',
                animation: 'skeleton-shimmer 1.5s infinite ease-in-out',
              }}
            />
          </div>

          {/* Heart button skeleton */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#f1f5f9',
              flexShrink: 0,
            }}
          />
        </div>

        {/* Salary & Deadline Skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div
            style={{
              width: '40%',
              height: 16,
              borderRadius: 4,
              background: '#e2e8f0',
              animation: 'skeleton-shimmer 1.5s infinite ease-in-out',
            }}
          />
          <div
            style={{
              width: '25%',
              height: 16,
              borderRadius: 10,
              background: '#f1f5f9',
              animation: 'skeleton-shimmer 1.5s infinite ease-in-out',
            }}
          />
        </div>
      </div>

      {/* Footer Badges & CTA Skeleton */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 65, height: 20, borderRadius: 6, background: '#f1f5f9' }} />
          <div style={{ width: 55, height: 20, borderRadius: 6, background: '#f1f5f9' }} />
        </div>
        <div style={{ width: 85, height: 24, borderRadius: 6, background: '#e2e8f0' }} />
      </div>

      <style>{`
        @keyframes skeleton-shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
