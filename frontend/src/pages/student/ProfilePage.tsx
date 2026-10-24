import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User as UserIcon,
  Mail,
  Building,
  DoorClosed,
  Phone,
  Shield,
  Save,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  hostelBlock: z.string().min(1, 'Hostel block is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      hostelBlock: user?.hostelBlock || 'Block A (Mandakini)',
      roomNumber: user?.roomNumber || '',
      emergencyName: user?.emergencyContact?.name || '',
      emergencyPhone: user?.emergencyContact?.phone || '',
      emergencyRelation: user?.emergencyContact?.relation || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: data.name,
        phone: data.phone,
        hostelBlock: data.hostelBlock,
        roomNumber: data.roomNumber,
        emergencyContact: {
          name: data.emergencyName || '',
          phone: data.emergencyPhone || '',
          relation: data.emergencyRelation || '',
        },
      });
      success('Profile details saved successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
          Student Profile & Room Details
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          Manage your contact credentials and emergency guardian details.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Account Details"
          subtitle="Keep room and phone number current for maintenance coordination"
        />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Readonly Email */}
            <div>
              <label htmlFor="userEmail" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Institutional Email (Read Only)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="userEmail"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-200 bg-surface-100/70 text-surface-600 cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="userName" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="userName"
                  type="text"
                  {...register('name')}
                  className={`block w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                  } focus:outline-none focus:ring-2 focus:ring-brand-700 bg-white`}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
            </div>

            {/* Block & Room */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="userBlock" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Hostel Block *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    id="userBlock"
                    type="text"
                    {...register('hostelBlock')}
                    className={`block w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${
                      errors.hostelBlock ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-700 bg-white`}
                  />
                </div>
                {errors.hostelBlock && (
                  <p className="mt-1 text-xs text-rose-600">{errors.hostelBlock.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="userRoom" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Room Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <DoorClosed className="w-4 h-4" />
                  </div>
                  <input
                    id="userRoom"
                    type="text"
                    {...register('roomNumber')}
                    className={`block w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${
                      errors.roomNumber ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-700 bg-white`}
                  />
                </div>
                {errors.roomNumber && (
                  <p className="mt-1 text-xs text-rose-600">{errors.roomNumber.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="userPhone" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Personal Contact Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="userPhone"
                  type="tel"
                  {...register('phone')}
                  className={`block w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${
                    errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                  } focus:outline-none focus:ring-2 focus:ring-brand-700 bg-white`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
            </div>

            {/* Emergency Contact Sub-section */}
            <div className="pt-4 border-t border-surface-100">
              <div className="flex items-center gap-2 mb-3">
                <HeartHandshake className="w-4 h-4 text-brand-700" />
                <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider">
                  Emergency Contact / Guardian
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="emergencyName" className="block text-[11px] font-medium text-surface-600 mb-1">
                    Contact Name
                  </label>
                  <input
                    id="emergencyName"
                    type="text"
                    {...register('emergencyName')}
                    placeholder="e.g. Vikram Patel"
                    className="block w-full px-3 py-1.5 text-xs rounded-lg border border-surface-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyPhone" className="block text-[11px] font-medium text-surface-600 mb-1">
                    Contact Phone
                  </label>
                  <input
                    id="emergencyPhone"
                    type="tel"
                    {...register('emergencyPhone')}
                    placeholder="+91 98765 00001"
                    className="block w-full px-3 py-1.5 text-xs rounded-lg border border-surface-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyRelation" className="block text-[11px] font-medium text-surface-600 mb-1">
                    Relationship
                  </label>
                  <input
                    id="emergencyRelation"
                    type="text"
                    {...register('emergencyRelation')}
                    placeholder="e.g. Father / Mother"
                    className="block w-full px-3 py-1.5 text-xs rounded-lg border border-surface-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-100 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
