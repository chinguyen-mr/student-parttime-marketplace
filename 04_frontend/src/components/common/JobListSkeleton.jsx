import React from 'react';
import JobCardSkeleton from './JobCardSkeleton';

/**
 * JobListSkeleton - Renders 6 to 8 JobCard skeletons in a responsive grid
 * Used during API loading states on Home, Job Listing and search results.
 */
export default function JobListSkeleton({ count = 6 }) {
  const skeletons = Array.from({ length: count }, (_, idx) => idx);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 20,
        width: '100%',
        marginBottom: 32,
      }}
      className="job-list-skeleton-grid"
    >
      {skeletons.map((index) => (
        <JobCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
}
