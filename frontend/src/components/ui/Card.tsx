import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-surface-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden ${
        hoverable ? 'hover:border-surface-300 hover:shadow-sm transition-all duration-150' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`p-5 pb-3 border-b border-surface-100 flex items-start justify-between gap-4 ${className}`}>
    <div>
      <h3 className="text-base font-semibold text-surface-900 tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`p-5 ${className}`}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`p-4 bg-surface-50/50 border-t border-surface-100 flex items-center justify-between gap-2 ${className}`}>
    {children}
  </div>
);
