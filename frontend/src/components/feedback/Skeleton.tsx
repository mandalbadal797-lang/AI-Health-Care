import React from 'react';

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
}) => {
  return <div className="skeleton" style={{ width, height, borderRadius }} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="card flex flex-col gap-md p-md">
      <Skeleton height="160px" borderRadius="var(--radius-md)" />
      <Skeleton width="40%" height="1.25rem" />
      <Skeleton width="85%" height="1rem" />
      <Skeleton width="60%" height="1rem" />
    </div>
  );
};
