import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Building,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  MessageSquare,
  Send,
  Eye,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Complaint, ComplaintStatus } from '../../types';

export const CleanlinessDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('in_progress');
  const [statusNote, setStatusNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isStaffOrAdmin =
    user && ['admin', 'rector', 'housekeeping'].includes(user.role);

  const fetchComplaint = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get<{ complaint: Complaint }>(`/complaints/${id}`);
      setComplaint(res.complaint);
      setNewStatus(res.complaint.status);
    } catch (err: any) {
      error(err.message || 'Could not load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setIsUpdating(true);
    try {
      await api.patch(`/complaints/${complaint._id}/status`, {
        status: newStatus,
        note: statusNote.trim() || undefined,
        isInternal: isInternalNote,
      });
      success(`Complaint status updated to ${newStatus}.`);
      setIsUpdateModalOpen(false);
      setStatusNote('');
      fetchComplaint();
    } catch (err: any) {
      error(err.message || 'Failed to update complaint status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-surface-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-surface-900">Complaint Not Found</h2>
        <p className="text-xs text-surface-500 mt-1 mb-4">
          The requested complaint does not exist or you do not have permission to view it.
        </p>
        <Link to="/cleanliness">
          <Button variant="outline">Back to Complaints List</Button>
        </Link>
      </div>
    );
  }

  const statusSteps: { key: ComplaintStatus; label: string }[] = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === complaint.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/cleanliness"
            className="p-1.5 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors"
            aria-label="Back to complaints list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-surface-700 bg-surface-100 px-2 py-0.5 rounded">
                {complaint.referenceNumber}
              </span>
              <Badge status={complaint.status} />
              {complaint.priority === 'urgent' && <Badge priority="urgent" />}
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-surface-900 mt-1">
              {complaint.title}
            </h1>
          </div>
        </div>

        {isStaffOrAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUpdateModalOpen(true)}
            leftIcon={<Shield className="w-4 h-4" />}
          >
            Update Status / Notes
          </Button>
        )}
      </div>

      {/* Status Progress Pipeline Bar */}
      <Card className="p-4 sm:p-5">
        <div className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">
          Resolution Pipeline
        </div>
        <div className="relative">
          {/* Track line */}
          <div className="absolute top-3.5 left-3 right-3 h-0.5 bg-surface-200 -z-0" />
          <div
            className="absolute top-3.5 left-3 h-0.5 bg-brand-700 transition-all duration-300 -z-0"
            style={{
              width:
                currentStepIndex >= 0
                  ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`
                  : '0%',
            }}
          />

          {/* Steps */}
          <div className="flex items-center justify-between relative z-10">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      isCompleted
                        ? 'bg-brand-700 border-brand-700 text-white'
                        : 'bg-white border-surface-300 text-surface-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-medium ${
                      isCurrent ? 'text-brand-900 font-bold' : isCompleted ? 'text-surface-700' : 'text-surface-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Main Details & Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Description & Location" />
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="font-semibold text-surface-700 uppercase tracking-wider block mb-1">
                  Problem Description
                </span>
                <p className="text-surface-800 leading-relaxed bg-surface-50 p-3 rounded-lg border border-surface-100 whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {/* Photo attachment if available */}
              {complaint.imageUrl && (
                <div>
                  <span className="font-semibold text-surface-700 uppercase tracking-wider block mb-1">
                    Attached Photo
                  </span>
                  <div className="border border-surface-200 rounded-lg p-2 bg-surface-50 inline-block">
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint attachment"
                      className="max-h-64 rounded object-contain"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Progression Timeline / Audit History */}
          <Card>
            <CardHeader
              title="Status History & Staff Remarks"
              subtitle="Chronological record of status changes and maintenance notes"
            />
            <CardContent>
              {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-200">
                  {complaint.statusHistory.map((item, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-brand-700 border-2 border-white shadow-xs" />
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <Badge status={item.status} />
                          {item.isInternal && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded font-semibold uppercase">
                              Internal Note
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-surface-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-surface-800">
                        Updated by {item.changedByName}
                      </div>
                      {item.note && (
                        <p className="text-xs text-surface-600 mt-1 bg-surface-50/80 p-2.5 rounded-lg border border-surface-100 leading-relaxed">
                          {item.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-surface-500">
                  No status updates recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Information Summary" />
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-surface-400 block">Category</span>
                <span className="font-semibold text-surface-800 capitalize">
                  {complaint.category.replace('_', ' ')}
                </span>
              </div>
              <div className="pt-2 border-t border-surface-100">
                <span className="text-surface-400 block">Hostel Block</span>
                <span className="font-semibold text-surface-800">{complaint.hostelBlock}</span>
              </div>
              <div className="pt-2 border-t border-surface-100">
                <span className="text-surface-400 block">Specific Location</span>
                <span className="font-semibold text-surface-800">{complaint.location}</span>
              </div>
              <div className="pt-2 border-t border-surface-100">
                <span className="text-surface-400 block">Reported By</span>
                <span className="font-semibold text-surface-800">
                  {complaint.studentName} {complaint.studentRoom ? `(Room ${complaint.studentRoom})` : ''}
                </span>
              </div>
              <div className="pt-2 border-t border-surface-100">
                <span className="text-surface-400 block">Assigned Staff</span>
                <span className="font-semibold text-surface-800">
                  {complaint.assignedStaffName || 'Unassigned'}
                </span>
              </div>
              <div className="pt-2 border-t border-surface-100">
                <span className="text-surface-400 block">Submission Date</span>
                <span className="font-semibold text-surface-800">
                  {new Date(complaint.createdAt).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Staff Update Status Dialog Modal */}
      {isStaffOrAdmin && (
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Update Complaint Status (${complaint.referenceNumber})`}
          description="Advance workflow status or add remarks visible to the student."
        >
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div>
              <label htmlFor="modalStatus" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                New Status
              </label>
              <select
                id="modalStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                className="block w-full px-3 py-2 text-sm rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
              >
                <option value="submitted">Submitted (Pending Assignment)</option>
                <option value="assigned">Assigned to Staff</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
                <option value="reopened">Reopened</option>
              </select>
            </div>

            <div>
              <label htmlFor="modalNote" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Progress Note or Resolution Remarks
              </label>
              <textarea
                id="modalNote"
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Plumber replaced washers in tap; tested leak-free."
                className="block w-full px-3 py-2 text-sm rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="internalNote"
                type="checkbox"
                checked={isInternalNote}
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="h-4 w-4 rounded border-surface-300 text-brand-700 focus:ring-brand-700"
              />
              <label htmlFor="internalNote" className="text-xs text-surface-700 select-none">
                Internal staff note only (hidden from student)
              </label>
            </div>

            <div className="pt-3 border-t border-surface-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsUpdateModalOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                Save Status Update
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
