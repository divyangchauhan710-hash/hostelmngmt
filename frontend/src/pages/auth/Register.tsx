import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Building, DoorClosed, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  hostelBlock: z.string().min(1, 'Please select your hostel block'),
  roomNumber: z.string().min(1, 'Room number is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      hostelBlock: 'Block A (Mandakini)',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      success('Student account registered successfully.');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-xl bg-brand-700 text-white items-center justify-center font-bold text-xl shadow-xs mb-3">
            H
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">
            Student Registration
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Create an account to report issues, review meals, and access hostel contacts.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 sm:px-10 rounded-2xl border border-surface-200 shadow-xs">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder="e.g. Aarav Patel"
                  className={`block w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                  } focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent`}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
            </div>

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
                  placeholder="student.name@institution.edu"
                  className={`block w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                    errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                  } focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="At least 6 characters"
                  className={`block w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                    errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                  } focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent`}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="hostelBlock" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Hostel Block
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <select
                    id="hostelBlock"
                    {...register('hostelBlock')}
                    className="block w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-surface-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                  >
                    <option value="Block A (Mandakini)">Block A (Mandakini)</option>
                    <option value="Block B (Alaknanda)">Block B (Alaknanda)</option>
                    <option value="Block C (Bhagirathi)">Block C (Bhagirathi)</option>
                    <option value="Block D (Kaveri)">Block D (Kaveri)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="roomNumber" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Room Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <DoorClosed className="w-4 h-4" />
                  </div>
                  <input
                    id="roomNumber"
                    type="text"
                    {...register('roomNumber')}
                    placeholder="e.g. A-304"
                    className={`block w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                      errors.roomNumber ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent`}
                  />
                </div>
                {errors.roomNumber && <p className="mt-1 text-xs text-rose-600">{errors.roomNumber.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="+91 98765 43210"
                  className={`block w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                    errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                  } focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-surface-500">
            Already have a registered account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
