import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  Brush,
  Clock,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../types';

export const CleanlinessList: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get<{ complaints: Complaint[] }>(`/complaints?${params.toString()}`);
      setComplaints(res.complaints || []);
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

  const statusTabs = [
    { label: 'All', value: 'all' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
            Cleanliness Complaints
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Report sanitation issues, track maintenance progress, and view resolution history.
          </p>
        </div>
        <Link to="/cleanliness/new">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Report Cleanliness Issue
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Controls */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar & Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-surface-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search complaints..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent bg-white"
              />
            </form>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-surface-300 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-700"
              aria-label="Filter by category"
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
              className="text-xs py-1.5 px-2.5 rounded-lg border border-surface-300 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-700"
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Complaints List (Responsive: Table on Desktop, Cards on Mobile) */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4 mt-2" />
              <div className="flex gap-4 mt-3 pt-3 border-t border-surface-100">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : complaints.length > 0 ? (
        <>
          {/* Desktop Tabular View (Visible on >= md screens) */}
          <div className="hidden md:block bg-white rounded-xl border border-surface-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-surface-700 whitespace-nowrap">
                      {c.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-surface-900 truncate">{c.title}</div>
                      <div className="text-[11px] text-surface-500 truncate mt-0.5">
                        Submitted on {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-surface-700 whitespace-nowrap">
                      {c.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-surface-600 max-w-[200px] truncate">
                      {c.location}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge priority={c.priority} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/cleanliness/${c._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (Visible on < md screens) */}
          <div className="md:hidden space-y-3">
            {complaints.map((c) => (
              <Card key={c._id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-surface-600">
                    {c.referenceNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {c.priority === 'urgent' && <Badge priority="urgent" />}
                    <Badge status={c.status} />
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-surface-900 mb-1 leading-snug">
                  {c.title}
                </h3>
                <p className="text-xs text-surface-600 line-clamp-2 mb-3">
                  {c.description}
                </p>

                <div className="pt-2.5 border-t border-surface-100 flex items-center justify-between text-xs text-surface-500">
                  <div className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" />
                    <span className="truncate">{c.location}</span>
                  </div>
                  <Link
                    to={`/cleanliness/${c._id}`}
                    className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-900 flex-shrink-0"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Brush}
          title="No Cleanliness Complaints Found"
          description={
            statusFilter !== 'all' || categoryFilter !== 'all' || search
              ? 'No complaints match the current search or filter criteria. Try adjusting your filters.'
              : 'You have not submitted any complaints yet. Report an issue anytime you notice a cleanliness problem.'
          }
          actionText="Report an Issue"
          onAction={() => window.location.assign('/cleanliness/new')}
        />
      )}
    </div>
  );
};
