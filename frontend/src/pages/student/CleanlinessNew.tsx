import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Upload,
  X,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { ComplaintCategory, ComplaintPriority } from '../../types';

const complaintFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  category: z.enum([
    'washroom',
    'corridor',
    'room',
    'drinking_water',
    'garbage',
    'common_area',
    'other',
  ]),
  hostelBlock: z.string().min(1, 'Hostel block is required'),
  location: z.string().min(3, 'Specific floor or location is required (e.g. 3rd Floor East Washroom)'),
  description: z.string().min(10, 'Please provide sufficient details (at least 10 characters)'),
  priority: z.enum(['normal', 'urgent']).default('normal'),
});

type ComplaintFormData = z.infer<typeof complaintFormSchema>;

export const CleanlinessNew: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRef, setCreatedRef] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      category: 'washroom',
      hostelBlock: user?.hostelBlock || 'Block A (Mandakini)',
      location: user?.roomNumber ? `Near Room ${user.roomNumber}` : '',
      priority: 'normal',
    },
  });

  const selectedPriority = watch('priority');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file type. Only JPEG, PNG, or WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds the 5MB limit. Please select a smaller photo.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const removeSelectedFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('category', data.category);
      formData.append('hostelBlock', data.hostelBlock);
      formData.append('location', data.location);
      formData.append('description', data.description);
      formData.append('priority', data.priority);

      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      const res = await api.post<{ success: boolean; complaint: any }>('/complaints', formData);
      success(`Complaint ${res.complaint.referenceNumber} submitted successfully.`);
      setCreatedRef(res.complaint.referenceNumber);
      setCreatedId(res.complaint._id);
    } catch (err: any) {
      error(err.message || 'Failed to submit complaint. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view once saved in backend
  if (createdRef && createdId) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <Card className="text-center p-8 border-teal-500/20 bg-white">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-4 border border-teal-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-surface-900 mb-1">
            Complaint Registered Successfully
          </h2>
          <p className="text-xs text-surface-500 mb-4">
            Your complaint has been permanently logged in the system and queued for assignment.
          </p>

          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 max-w-sm mx-auto mb-6">
            <div className="text-xs text-surface-500 font-medium uppercase tracking-wider">
              Complaint Reference Number
            </div>
            <div className="text-2xl font-mono font-bold text-surface-900 tracking-wider mt-1">
              {createdRef}
            </div>
            <div className="text-[11px] text-surface-400 mt-1">
              Quote this reference for official status inquiries
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to={`/cleanliness/${createdId}`}>
              <Button variant="primary">
                View Complaint & Track Status
              </Button>
            </Link>
            <Link to="/cleanliness">
              <Button variant="outline">
                Back to All Complaints
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/cleanliness"
          className="p-1.5 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors"
          aria-label="Back to complaints list"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
            Report a Cleanliness Issue
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Submit a problem with washroom, water dispenser, corridor, or garbage disposal.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Problem Details"
          subtitle="Be specific about the issue and exact location for faster resolution"
        />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Complaint Title *
              </label>
              <input
                id="title"
                type="text"
                {...register('title')}
                placeholder="e.g. Washroom tap leaking continuously in 2nd floor west wing"
                className={`block w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                } focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent bg-white`}
              />
              {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Area Category *
              </label>
              <select
                id="category"
                {...register('category')}
                className="block w-full px-3 py-2 text-sm rounded-lg border border-surface-300 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
              >
                <option value="washroom">Washroom / Restroom</option>
                <option value="drinking_water">Drinking Water Station / Purifier</option>
                <option value="corridor">Corridor / Balcony / Stairwell</option>
                <option value="room">Student Room (Sanitation/Fixtures)</option>
                <option value="garbage">Garbage / Waste Disposal Bin</option>
                <option value="common_area">Common Area / Study Hall</option>
                <option value="other">Other Campus Facility</option>
              </select>
            </div>

            {/* Hostel Block & Specific Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hostelBlock" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Hostel Block *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    id="hostelBlock"
                    type="text"
                    {...register('hostelBlock')}
                    placeholder="e.g. Block A (Mandakini)"
                    className={`block w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                      errors.hostelBlock ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent bg-white`}
                  />
                </div>
                {errors.hostelBlock && (
                  <p className="mt-1 text-xs text-rose-600">{errors.hostelBlock.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Specific Location *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    id="location"
                    type="text"
                    {...register('location')}
                    placeholder="e.g. 2nd Floor, Room 204 or Staircase B"
                    className={`block w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                      errors.location ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent bg-white`}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-xs text-rose-600">{errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Detailed Description *
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                placeholder="Describe what is broken, dirty, or requires urgent sanitization. Mention timings or severity if applicable."
                className={`block w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.description ? 'border-rose-400 bg-rose-50/20' : 'border-surface-300'
                } focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent bg-white`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
              )}
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('priority', 'normal')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedPriority === 'normal'
                      ? 'border-brand-700 bg-brand-50/50 ring-1 ring-brand-700'
                      : 'border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  <div className="font-semibold text-xs text-surface-900">Normal Priority</div>
                  <div className="text-[11px] text-surface-500 mt-0.5">
                    Routine sanitation, minor fixture leakage, standard maintenance.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('priority', 'urgent')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedPriority === 'urgent'
                      ? 'border-amber-600 bg-amber-50/60 ring-1 ring-amber-600'
                      : 'border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  <div className="font-semibold text-xs text-amber-900 flex items-center gap-1.5">
                    <span>Urgent Priority</span>
                  </div>
                  <div className="text-[11px] text-surface-500 mt-0.5">
                    Water overflow, total blockage, contamination, hygiene hazard.
                  </div>
                </button>
              </div>
            </div>

            {/* Optional Photo Attachment */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Optional Photo Attachment (Max 5MB)
              </label>

              {filePreview ? (
                <div className="relative inline-block border border-surface-200 rounded-lg p-2 bg-surface-50">
                  <img
                    src={filePreview}
                    alt="Problem attachment preview"
                    className="max-h-48 max-w-full rounded object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="absolute top-3 right-3 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-700 transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-surface-300 border-dashed rounded-xl hover:border-surface-400 transition-colors bg-white">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-surface-400" />
                    <div className="flex text-xs text-surface-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-brand-700 hover:text-brand-800 focus-within:outline-none"
                      >
                        <span>Upload a picture</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-[11px] text-surface-400">PNG, JPG, JPEG, WebP up to 5MB</p>
                  </div>
                </div>
              )}
              {fileError && <p className="mt-1.5 text-xs text-rose-600">{fileError}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-surface-100 flex items-center justify-end gap-3">
              <Link to="/cleanliness">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Submit Complaint
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
