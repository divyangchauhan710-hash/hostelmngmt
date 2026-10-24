import React from 'react';

export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}> = ({ className = '', variant = 'rect' }) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full',
  };

  return (
    <div
      className={`animate-pulse bg-surface-200/70 ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-surface-200 p-5 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="pt-2 flex justify-between items-center border-t border-surface-100">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);
