import React from 'react';
import { ComplaintStatus, ComplaintPriority } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'status' | 'priority' | 'success' | 'warning' | 'info' | 'danger';
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  className = '',
}) => {
  let baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';

  if (status) {
    switch (status) {
      case 'submitted':
        return (
          <span className={`${baseStyle} bg-slate-50 text-slate-700 border-slate-200 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
            Submitted
          </span>
        );
      case 'assigned':
        return (
          <span className={`${baseStyle} bg-blue-50 text-blue-700 border-blue-200 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
            Assigned
          </span>
        );
      case 'in_progress':
        return (
          <span className={`${baseStyle} bg-amber-50 text-amber-800 border-amber-200 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className={`${baseStyle} bg-teal-50 text-teal-800 border-teal-200 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mr-1.5"></span>
            Resolved
          </span>
        );
      case 'rejected':
        return (
          <span className={`${baseStyle} bg-rose-50 text-rose-700 border-rose-200 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
            Rejected
          </span>
        );
      case 'reopened':
        return (
          <span className={`${baseStyle} bg-purple-50 text-purple-700 border-purple-200 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
            Reopened
          </span>
        );
    }
  }

  if (priority) {
    if (priority === 'urgent') {
      return (
        <span className={`${baseStyle} bg-amber-50 text-amber-900 border-amber-300 font-semibold ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5 animate-pulse"></span>
          Urgent
        </span>
      );
    }
    return (
      <span className={`${baseStyle} bg-surface-100 text-surface-600 border-surface-200 ${className}`}>
        Normal
      </span>
    );
  }

  const variants = {
    default: 'bg-surface-100 text-surface-700 border-surface-200',
    status: 'bg-surface-100 text-surface-700 border-surface-200',
    priority: 'bg-surface-100 text-surface-700 border-surface-200',
    success: 'bg-teal-50 text-teal-800 border-teal-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return <span className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</span>;
};
