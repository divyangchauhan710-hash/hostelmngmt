import React, { useState, useEffect } from 'react';
import {
  Info,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
  PhoneCall,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { HostelNotice } from '../../types';

export const HostelInfoPage: React.FC = () => {
  const [notices, setNotices] = useState<HostelNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [noticeSearch, setNoticeSearch] = useState('');

  useEffect(() => {
    async function fetchNotices() {
      try {
        setLoading(true);
        const res = await api.get<{ notices: HostelNotice[] }>('/notices');
        setNotices(res.notices || []);
      } catch (err) {
        console.error('Failed to load notices', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(noticeSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(noticeSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
          Hostel Information & Rules
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          Official policies, emergency procedures, and circular notice board.
        </p>
      </div>

      {/* Prominent Emergency Protocol Guidance Banner */}
      <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-4 sm:p-5 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-950">
              Immediate Emergency Protocol Notice
            </h3>
            <p className="text-xs text-amber-900/90 mt-0.5 max-w-2xl leading-relaxed">
              For acute medical emergencies, fires, physical security threats, or life safety situations, DO NOT rely on this complaint system. Ring Central Security Control immediately at <span className="font-bold">+91 20 2550 7999</span> or the Campus Medical Centre at <span className="font-bold">+91 20 2550 7108</span>.
            </p>
          </div>
        </div>
        <a
          href="tel:+912025507999"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-700 text-white font-semibold text-xs hover:bg-amber-800 transition-colors flex-shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call Security (24x7)</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Notices Board */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="p-4 sm:p-5 border-b border-surface-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-surface-900">
                  Official Notice Board
                </h2>
                <p className="text-xs text-surface-500 mt-0.5">
                  Administrative circulars and maintenance alerts
                </p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-surface-400 pointer-events-none" />
                <input
                  type="text"
                  value={noticeSearch}
                  onChange={(e) => setNoticeSearch(e.target.value)}
                  placeholder="Search notices..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-700 bg-white"
                />
              </div>
            </div>

            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border border-surface-200 rounded-xl space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : filteredNotices.length > 0 ? (
                <div className="divide-y divide-surface-100">
                  {filteredNotices.map((notice) => (
                    <div key={notice._id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {notice.isPinned && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded uppercase">
                              Pinned Notice
                            </span>
                          )}
                          <span className="text-[10px] font-semibold bg-surface-100 text-surface-700 px-2 py-0.5 rounded capitalize">
                            {notice.category}
                          </span>
                          {notice.priority === 'urgent' && (
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded uppercase">
                              Urgent
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-surface-400">
                          Published: {new Date(notice.publishedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm text-surface-900 leading-snug">
                        {notice.title}
                      </h3>

                      <p className="text-xs text-surface-700 leading-relaxed whitespace-pre-wrap bg-surface-50/60 p-3 rounded-lg border border-surface-100">
                        {notice.content}
                      </p>

                      <div className="text-[11px] text-surface-500 pt-1">
                        Issued by: <span className="font-medium text-surface-700">{notice.authorName}</span> ({notice.authorRole})
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-surface-500">
                  No notices found matching your search.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Key Rules and Code of Conduct */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Hostel Code of Conduct"
              subtitle="Official regulations and resident guidelines"
            />
            <CardContent className="space-y-4 text-xs text-surface-700">
              <div className="space-y-1.5">
                <span className="font-semibold text-surface-900 block">1. Gate Hours & Curfew</span>
                <p className="text-surface-600 leading-relaxed">
                  Hostel entry gates close promptly at 10:30 PM. Late entries require biometric verification at the security desk and warden authorization.
                </p>
              </div>

              <div className="pt-3 border-t border-surface-100 space-y-1.5">
                <span className="font-semibold text-surface-900 block">2. Silence Hours</span>
                <p className="text-surface-600 leading-relaxed">
                  Strict silence hours are maintained across all residential corridors from 10:30 PM to 06:00 AM. Study sessions may take place in the 24-hour reading hall.
                </p>
              </div>

              <div className="pt-3 border-t border-surface-100 space-y-1.5">
                <span className="font-semibold text-surface-900 block">3. Prohibited Electrical Appliances</span>
                <p className="text-surface-600 leading-relaxed">
                  High-load heating rods, immersion coils, and electric stoves are prohibited inside student rooms due to fire safety codes.
                </p>
              </div>

              <div className="pt-3 border-t border-surface-100 space-y-1.5">
                <span className="font-semibold text-surface-900 block">4. Visitor Policies</span>
                <p className="text-surface-600 leading-relaxed">
                  Day visitors and parents are permitted in the ground floor visitor lobby only between 09:00 AM and 07:00 PM upon signing the entry register.
                </p>
              </div>

              <div className="pt-3 border-t border-surface-100 space-y-1.5">
                <span className="font-semibold text-surface-900 block">5. Room Cleanliness</span>
                <p className="text-surface-600 leading-relaxed">
                  Housekeeping sweeps corridors daily. Please deposit room waste into the corridor segregation bins before 09:00 AM each morning.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
