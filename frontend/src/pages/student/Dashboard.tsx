import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brush,
  UtensilsCrossed,
  Coffee,
  PhoneCall,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Complaint, MessMenuDay, CanteenItem, HostelNotice, OfficialContact } from '../../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaintMetrics, setComplaintMetrics] = useState<any>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [todayMenu, setTodayMenu] = useState<MessMenuDay | null>(null);
  const [canteenPreview, setCanteenPreview] = useState<CanteenItem[]>([]);
  const [rectorContact, setRectorContact] = useState<OfficialContact | null>(null);
  const [notices, setNotices] = useState<HostelNotice[]>([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayDayName = daysOfWeek[new Date().getDay()];

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [metricsRes, complaintsRes, menuRes, canteenRes, contactsRes, noticesRes] =
          await Promise.all([
            api.get('/complaints/metrics').catch(() => ({ metrics: {} })),
            api.get('/complaints?limit=3').catch(() => ({ complaints: [] })),
            api.get(`/mess/menu/${todayDayName}`).catch(() => ({ menu: null })),
            api.get('/canteen/items?availability=available').catch(() => ({ items: [] })),
            api.get('/contacts').catch(() => ({ contacts: [] })),
            api.get('/notices').catch(() => ({ notices: [] })),
          ]);

        setComplaintMetrics(metricsRes.metrics || {});
        setRecentComplaints(complaintsRes.complaints || []);
        setTodayMenu(menuRes.menu || null);
        setCanteenPreview((canteenRes.items || []).slice(0, 4));

        const rector = (contactsRes.contacts || []).find((c: OfficialContact) =>
          c.roleName.toLowerCase().includes('rector')
        );
        setRectorContact(rector || (contactsRes.contacts || [])[0] || null);

        setNotices((noticesRes.notices || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [todayDayName]);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* 1. Header greeting & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-surface-200/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-brand-700" />
            <span>{formattedDate}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
            Good day, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            {user?.hostelBlock ? `${user.hostelBlock}` : 'Mandakini Hostel'}
            {user?.roomNumber ? ` • Room ${user.roomNumber}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/cleanliness/new">
            <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Report Cleanliness Issue
            </Button>
          </Link>
          <Link to="/mess">
            <Button size="sm" variant="outline" leftIcon={<UtensilsCrossed className="w-4 h-4" />}>
              Mess Menu
            </Button>
          </Link>
          <Link to="/rector">
            <Button size="sm" variant="outline" leftIcon={<PhoneCall className="w-4 h-4" />}>
              Contact Rector
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Compact Complaints Overview (Real counts from DB) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border-l-4 border-l-brand-700">
          <div className="text-xs font-medium text-surface-500">My Total Complaints</div>
          <div className="mt-1 text-2xl font-bold text-surface-900">
            {loading ? <Skeleton className="h-7 w-12" /> : complaintMetrics?.total ?? 0}
          </div>
          <div className="text-[11px] text-surface-400 mt-1">Registered requests</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-600">
          <div className="text-xs font-medium text-surface-500">In Progress / Assigned</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              (complaintMetrics?.inProgress ?? 0) + (complaintMetrics?.assigned ?? 0)
            )}
          </div>
          <div className="text-[11px] text-surface-400 mt-1">Under resolution</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-teal-600">
          <div className="text-xs font-medium text-surface-500">Resolved Complaints</div>
          <div className="mt-1 text-2xl font-bold text-teal-800">
            {loading ? <Skeleton className="h-7 w-12" /> : complaintMetrics?.resolved ?? 0}
          </div>
          <div className="text-[11px] text-surface-400 mt-1">Successfully addressed</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-600">
          <div className="text-xs font-medium text-surface-500">Pending Review</div>
          <div className="mt-1 text-2xl font-bold text-rose-700">
            {loading ? <Skeleton className="h-7 w-12" /> : complaintMetrics?.submitted ?? 0}
          </div>
          <div className="text-[11px] text-surface-400 mt-1">Awaiting staff assignment</div>
        </Card>
      </div>

      {/* 3. Main Split: Today's Mess Menu & Recent Complaint Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Mess Menu (Spans 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title={`Today's Mess Menu (${todayDayName.toUpperCase()})`}
              subtitle="Fresh meals served daily at the Central Dining Hall"
              action={
                <Link to="/mess" className="text-xs text-brand-700 hover:text-brand-800 font-semibold inline-flex items-center gap-1">
                  <span>Weekly Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 rounded-xl border border-surface-200 space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : todayMenu ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Breakfast */}
                  <div className="p-4 rounded-xl border border-surface-200/80 bg-surface-50/40 hover:bg-surface-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
                        Breakfast
                      </span>
                      <span className="text-[11px] font-medium text-surface-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-surface-400" />
                        {todayMenu.meals.breakfast.timing}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-surface-700">
                      {todayMenu.meals.breakfast.items.map((it, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                          <span className="leading-snug">{it.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Lunch */}
                  <div className="p-4 rounded-xl border border-surface-200/80 bg-surface-50/40 hover:bg-surface-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
                        Lunch
                      </span>
                      <span className="text-[11px] font-medium text-surface-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-surface-400" />
                        {todayMenu.meals.lunch.timing}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-surface-700">
                      {todayMenu.meals.lunch.items.map((it, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                          <span className="leading-snug">{it.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Snacks */}
                  <div className="p-4 rounded-xl border border-surface-200/80 bg-surface-50/40 hover:bg-surface-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
                        Evening Snacks
                      </span>
                      <span className="text-[11px] font-medium text-surface-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-surface-400" />
                        {todayMenu.meals.snacks.timing}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-surface-700">
                      {todayMenu.meals.snacks.items.map((it, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                          <span className="leading-snug">{it.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dinner */}
                  <div className="p-4 rounded-xl border border-surface-200/80 bg-surface-50/40 hover:bg-surface-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
                        Dinner
                      </span>
                      <span className="text-[11px] font-medium text-surface-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-surface-400" />
                        {todayMenu.meals.dinner.timing}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-surface-700">
                      {todayMenu.meals.dinner.items.map((it, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                          <span className="leading-snug">{it.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-surface-500 text-xs">
                  No menu published for today yet.
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs">
                <span className="text-surface-500">
                  Enjoyed today's meal or have feedback for the chef?
                </span>
                <Link to="/reviews" className="text-brand-700 hover:text-brand-800 font-semibold inline-flex items-center gap-1">
                  Rate Meals
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Cleanliness Complaints Updates */}
          <Card>
            <CardHeader
              title="Recent Cleanliness Updates"
              subtitle="Latest status progression on your reported issues"
              action={
                <Link to="/cleanliness" className="text-xs text-brand-700 hover:text-brand-800 font-semibold inline-flex items-center gap-1">
                  <span>View All Complaints</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : recentComplaints.length > 0 ? (
                <div className="divide-y divide-surface-100">
                  {recentComplaints.map((c) => (
                    <Link
                      key={c._id}
                      to={`/cleanliness/${c._id}`}
                      className="block py-3 hover:bg-surface-50 -mx-2 px-2 rounded-lg transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-surface-600">
                              {c.referenceNumber}
                            </span>
                            <Badge status={c.status} />
                            {c.priority === 'urgent' && <Badge priority="urgent" />}
                          </div>
                          <h4 className="text-sm font-semibold text-surface-900 group-hover:text-brand-800 transition-colors truncate">
                            {c.title}
                          </h4>
                          <div className="text-xs text-surface-500 mt-0.5 truncate">
                            {c.location} • {new Date(c.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-surface-400 group-hover:text-surface-700 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-surface-500 text-xs">
                  You have not submitted any complaints yet. Everything in your room and floor looks good!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Canteen Preview, Rector Contact & Important Notices */}
        <div className="space-y-6">
          {/* Verified Rector Contact Summary */}
          {rectorContact && (
            <Card className="border-t-4 border-t-brand-700">
              <CardHeader
                title="Verified Rector Contact"
                subtitle="Official office details & hours"
              />
              <CardContent className="space-y-3">
                <div>
                  <div className="font-semibold text-sm text-surface-900">{rectorContact.name}</div>
                  <div className="text-xs text-surface-500">{rectorContact.designation}</div>
                </div>
                <div className="text-xs text-surface-600 space-y-1 bg-surface-50 p-2.5 rounded-lg border border-surface-100">
                  <div>
                    <span className="font-medium text-surface-700">Office:</span> {rectorContact.officeLocation}
                  </div>
                  <div>
                    <span className="font-medium text-surface-700">Hours:</span> {rectorContact.officeHours}
                  </div>
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href={`tel:${rectorContact.phone.replace(/\s+/g, '')}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-surface-200 text-xs font-semibold text-surface-800 hover:bg-surface-50 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-brand-700" />
                    <span>Call Office</span>
                  </a>
                  <a
                    href={`mailto:${rectorContact.email}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-surface-200 text-xs font-semibold text-surface-800 hover:bg-surface-50 transition-colors"
                  >
                    <span>Email Rector</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Canteen Availability Preview */}
          <Card>
            <CardHeader
              title="Canteen Quick Bites"
              subtitle="Available now at Student Activity Complex"
              action={
                <Link to="/canteen" className="text-xs text-brand-700 hover:text-brand-800 font-semibold">
                  Full Menu
                </Link>
              }
            />
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : canteenPreview.length > 0 ? (
                <div className="divide-y divide-surface-100">
                  {canteenPreview.map((item) => (
                    <div key={item._id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-surface-900">{item.name}</div>
                        <div className="text-[11px] text-surface-400 capitalize">{item.category}</div>
                      </div>
                      <div className="font-bold text-surface-900">₹{item.price}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-surface-500">
                  No items listed as available currently.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Notices */}
          <Card>
            <CardHeader
              title="Hostel Announcements"
              subtitle="Official administrative circulars"
              action={
                <Link to="/hostel-info" className="text-xs text-brand-700 hover:text-brand-800 font-semibold">
                  All Notices
                </Link>
              }
            />
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : notices.length > 0 ? (
                <div className="space-y-3">
                  {notices.map((n) => (
                    <div key={n._id} className="p-2.5 rounded-lg border border-surface-100 bg-surface-50/50 text-xs">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-surface-900 line-clamp-1">{n.title}</span>
                        {n.priority === 'urgent' && (
                          <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 rounded font-bold uppercase">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-surface-600 line-clamp-2 leading-relaxed">{n.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-surface-500">No active notices.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
