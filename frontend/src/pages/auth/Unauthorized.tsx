import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8 stroke-[1.8]" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-surface-900 mb-2">
        Access Denied
      </h1>
      <p className="text-sm text-surface-500 max-w-md mb-6 leading-relaxed">
        Your current role ({user?.role?.replace('_', ' ') || 'Guest'}) does not have permission to view or manage this administrative section.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Student Dashboard
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="outline" leftIcon={<LogIn className="w-4 h-4" />}>
            Sign In with Another Account
          </Button>
        </Link>
      </div>
    </div>
  );
};
