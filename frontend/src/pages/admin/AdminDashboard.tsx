import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Brush,
  UtensilsCrossed,
  Star,
  PhoneCall,
  FileText,
  User,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Complaint } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        setLoading(true);
        const res = await api.get('/admin/overview');
        setOverview(res.overview || null);
      } catch (err) {
        console.error('Failed to load admin overview', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-200/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Staff Administration Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
            Operations & Service Control
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Real-time management of cleanliness complaints, dining menus, contacts, and student notices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/complaints">
            <Button size="sm" variant="primary" leftIcon={<Brush className="w-4 h-4" />}>
              Manage Complaints
            </Button>
          </Link>
          <Link to="/admin/menus">
            <Button size="sm" variant="outline" leftIcon={<UtensilsCrossed className="w-4 h-4" />}>
              Edit Menus
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border-l-4 border-l-brand-700">
          <div className="text-xs font-medium text-surface-500">Total Complaints</div>
          <div className="mt-1 text-2xl font-bold text-surface-900">
            {loading ? <Skeleton className="h-7 w-12" /> : overview?.complaints?.total ?? 0}
          </div>
          <div className="text-[11px] text-surface-400 mt-1">All time logged</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-600">
          <div className="text-xs font-medium text-surface-500">Unassigned / Pending</div>
          <div className="mt-1 text-2xl font-bold text-rose-700">
            {loading ? <Skeleton className="h-7 w-12" /> : overview?.complaints?.submitted ?? 0}
          </div>
          <div className="text-[11px] text-surface-400 mt-1">Requires staff assignment</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-600">
          <div className="text-xs font-medium text-surface-500">In Resolution</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              (overview?.complaints?.assigned ?? 0) + (overview?.complaints?.inProgress ?? 0)
            )}
          </div>
          <div className="text-[11px] text-surface-400 mt-1">Assigned or in progress</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-teal-600">
          <div className="text-xs font-medium text-surface-500">Resolved Complaints</div>
          <div className="mt-1 text-2xl font-bold text-teal-800">
            {loading ? <Skeleton className="h-7 w-12" /> : overview?.complaints?.resolved ?? 0}
          </div>
          <div className="text-[11px] text-surface-400 mt-1">Completed maintenance</div>
        </Card>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          to="/admin/complaints"
          className="p-3 bg-white border border-surface-200 rounded-xl hover:border-brand-500 hover:shadow-xs transition-all text-center block group"
        >
          <Brush className="w-5 h-5 text-brand-700 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-semibold text-surface-900">Complaints</div>
          <div className="text-[10px] text-surface-400">Assignments</div>
        </Link>

        <Link
          to="/admin/menus"
          className="p-3 bg-white border border-surface-200 rounded-xl hover:border-brand-500 hover:shadow-xs transition-all text-center block group"
        >
          <UtensilsCrossed className="w-5 h-5 text-brand-700 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-semibold text-surface-900">Menus & Canteen</div>
          <div className="text-[10px] text-surface-400">Weekly & daily</div>
        </Link>

        <Link
          to="/admin/reviews"
          className="p-3 bg-white border border-surface-200 rounded-xl hover:border-brand-500 hover:shadow-xs transition-all text-center block group"
        >
          <Star className="w-5 h-5 text-brand-700 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-semibold text-surface-900">Review Mod</div>
          <div className="text-[10px] text-surface-400">Student feedback</div>
        </Link>

        <Link
          to="/admin/contacts"
          className="p-3 bg-white border border-surface-200 rounded-xl hover:border-brand-500 hover:shadow-xs transition-all text-center block group"
        >
          <PhoneCall className="w-5 h-5 text-brand-700 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-semibold text-surface-900">Contacts</div>
          <div className="text-[10px] text-surface-400">Rector & Wardens</div>
        </Link>

        <Link
          to="/admin/notices"
          className="p-3 bg-white border border-surface-200 rounded-xl hover:border-brand-500 hover:shadow-xs transition-all text-center block group"
        >
          <FileText className="w-5 h-5 text-brand-700 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-semibold text-surface-900">Notices</div>
          <div className="text-[10px] text-surface-400">Circular board</div>
        </Link>

        <Link
          to="/admin/users"
          className="p-3 bg-white border border-surface-200 rounded-xl hover:border-brand-500 hover:shadow-xs transition-all text-center block group"
        >
          <User className="w-5 h-5 text-brand-700 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-semibold text-surface-900">Users</div>
          <div className="text-[10px] text-surface-400">Role permissions</div>
        </Link>
      </div>

      {/* Recent Complaints Table */}
      <Card>
        <CardHeader
          title="Recent Complaints Queue"
          subtitle="Latest reports submitted across all residential blocks"
          action={
            <Link to="/admin/complaints" className="text-xs font-semibold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : overview?.recentComplaints && overview.recentComplaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-100 text-surface-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Ref</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {overview.recentComplaints.map((c: Complaint) => (
                    <tr key={c._id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-surface-700 whitespace-nowrap">
                        {c.referenceNumber}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-surface-900 max-w-xs truncate">
                        {c.title}
                      </td>
                      <td className="py-2.5 px-3 capitalize text-surface-700 whitespace-nowrap">
                        {c.category.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-surface-600 truncate max-w-[160px]">
                        {c.location}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Badge priority={c.priority} />
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Badge status={c.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <Link
                          to={`/cleanliness/${c._id}`}
                          className="font-semibold text-brand-700 hover:text-brand-900 text-xs"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-surface-500">
              No recent complaints logged.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
