import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, switchDemoAccount } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'student@hostelhub.local',
      password: 'Student@123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      success('Signed in successfully.');
      navigate(from, { replace: true });
    } catch (err: any) {
      error(err.message || 'Invalid email address or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setIsSubmitting(true);
    try {
      await switchDemoAccount(role);
      success(`Signed in as ${role.replace('_', ' ')}.`);
      if (role === 'admin' || role === 'rector') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      error(err.message || 'Failed to switch demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-xl bg-brand-700 text-white items-center justify-center font-bold text-xl shadow-xs mb-3">
            H
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">
            Welcome to HostelHub
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Everyday hostel services, complaints, menus, and announcements.
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 rounded-2xl border border-surface-200 shadow-xs">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="student@hostelhub.local"
                  className={`block w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                    errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                  } focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-700 hover:text-brand-800 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className={`block w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                    errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                  } focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Evaluation Panel */}
          <div className="mt-6 pt-5 border-t border-surface-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-600 uppercase tracking-wider mb-2.5">
              <UserCheck className="w-4 h-4 text-brand-700" />
              <span>1-Click Demo Account Logins</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                disabled={isSubmitting}
                className="p-2 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-300 text-surface-800 hover:text-brand-900 transition-colors text-left"
              >
                <span className="font-semibold block">Student</span>
                <span className="text-[10px] text-surface-400 block truncate">Aarav (A-304)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('rector')}
                disabled={isSubmitting}
                className="p-2 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-300 text-surface-800 hover:text-brand-900 transition-colors text-left"
              >
                <span className="font-semibold block">Rector / Warden</span>
                <span className="text-[10px] text-surface-400 block truncate">Dr. S. Kulkarni</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('housekeeping')}
                disabled={isSubmitting}
                className="p-2 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-300 text-surface-800 hover:text-brand-900 transition-colors text-left"
              >
                <span className="font-semibold block">Housekeeping</span>
                <span className="text-[10px] text-surface-400 block truncate">R. Yadav (Lead)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={isSubmitting}
                className="p-2 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-300 text-surface-800 hover:text-brand-900 transition-colors text-left"
              >
                <span className="font-semibold block">Administrator</span>
                <span className="text-[10px] text-surface-400 block truncate">System Manager</span>
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div className="mt-5 text-center text-xs text-surface-500">
            New resident student?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
              Register Student Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
