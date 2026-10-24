import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Brush,
  ArrowRight,
  Shield,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Complaint, ComplaintStatus, User } from '../../types';

export const AdminComplaints: React.FC = () => {
  const { success, error } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Assign Modal
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (search.trim()) params.append('search', search.trim());

      const [complaintsRes, staffRes] = await Promise.all([
        api.get<{ complaints: Complaint[] }>(`/complaints?${params.toString()}`),
        api.get<{ users: User[] }>('/admin/users?role=housekeeping').catch(() => ({ users: [] })),
      ]);

      setComplaints(complaintsRes.complaints || []);
      setStaffUsers(staffRes.users || []);
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningComplaint || !selectedStaffId) return;
    setIsAssigning(true);
    try {
      await api.patch(`/complaints/${assigningComplaint._id}/assign`, {
        assignedTo: selectedStaffId,
        note: assignNote.trim() || undefined,
      });
      success(`Complaint ${assigningComplaint.referenceNumber} assigned to staff.`);
      setAssigningComplaint(null);
      setSelectedStaffId('');
      setAssignNote('');
      fetchComplaints();
    } catch (err: any) {
      error(err.message || 'Failed to assign staff.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
          Cleanliness Complaints Hub
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          Review, prioritize, and assign maintenance tickets to housekeeping and sanitation personnel.
        </p>
      </div>

      {/* Filter Card */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-surface-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ref, title, or room..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-700 bg-white"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-surface-300 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
              aria-label="Filter status"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted (New)</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
              <option value="reopened">Reopened</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-surface-300 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
              aria-label="Filter category"
            >
              <option value="all">All Categories</option>
              <option value="washroom">Washroom</option>
              <option value="corridor">Corridor</option>
              <option value="room">Room</option>
              <option value="drinking_water">Drinking Water</option>
              <option value="garbage">Garbage</option>
              <option value="common_area">Common Area</option>
              <option value="other">Other</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-surface-300 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
              aria-label="Filter priority"
            >
              <option value="all">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table of Complaints */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : complaints.length > 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Title & Reporter</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-surface-700 whitespace-nowrap">
                      {c.referenceNumber}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-surface-900 truncate">{c.title}</div>
                      <div className="text-[11px] text-surface-500 truncate">
                        By {c.studentName} {c.studentRoom ? `(Room ${c.studentRoom})` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-surface-600 max-w-[180px] truncate">
                      {c.location}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-surface-700 whitespace-nowrap">
                      {c.assignedStaffName || (
                        <span className="text-surface-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAssigningComplaint(c);
                          setSelectedStaffId(c.assignedTo || '');
                        }}
                        className="px-2 py-1 rounded border border-surface-200 bg-surface-50 hover:bg-surface-100 font-semibold text-surface-700 text-[11px] transition-colors"
                      >
                        Assign
                      </button>
                      <Link
                        to={`/cleanliness/${c._id}`}
                        className="px-2 py-1 rounded bg-brand-50 border border-brand-200 font-semibold text-brand-800 text-[11px] hover:bg-brand-100 transition-colors"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Brush}
          title="No Complaints in this Filter"
          description="Try selecting a different status filter or clearing the search query."
        />
      )}

      {/* Staff Assignment Modal */}
      {assigningComplaint && (
        <Modal
          isOpen={!!assigningComplaint}
          onClose={() => setAssigningComplaint(null)}
          title={`Assign Staff: ${assigningComplaint.referenceNumber}`}
          description="Select a housekeeping technician to take ownership of this complaint."
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <label htmlFor="staffSelect" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Select Housekeeping Staff *
              </label>
              <select
                id="staffSelect"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="block w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
                required
              >
                <option value="">-- Choose Staff Member --</option>
                {staffUsers.map((staff) => (
                  <option key={staff.id || staff._id} value={staff.id || staff._id}>
                    {staff.name} ({staff.email})
                  </option>
                ))}
                {/* Fallback option if user query returned empty */}
                {staffUsers.length === 0 && (
                  <option value="650000000000000000000003">
                    Rameshwar Yadav (Lead Housekeeper)
                  </option>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="assignRemarks" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Assignment Remarks / Instructions
              </label>
              <textarea
                id="assignRemarks"
                rows={3}
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                placeholder="e.g. Inspect plumbing line on 3rd floor before noon."
                className="block w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            <div className="pt-3 border-t border-surface-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAssigningComplaint(null)}
                disabled={isAssigning}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isAssigning}>
                Confirm Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
