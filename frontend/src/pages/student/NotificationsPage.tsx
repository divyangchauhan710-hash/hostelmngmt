import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Check,
  AlertCircle,
  FileText,
  Brush,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { AppNotification } from '../../types';

export const NotificationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ notifications: AppNotification[]; unreadCount: number }>(
        '/notifications'
      );
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      success('All notifications marked as read.');
    } catch (err: any) {
      error(err.message || 'Failed to update notifications.');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      success('Notification removed.');
    } catch (err) {
      // Ignore
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'complaint_status':
      case 'complaint_assigned':
        return <Brush className="w-4 h-4 text-brand-700" />;
      case 'notice':
        return <FileText className="w-4 h-4 text-amber-700" />;
      default:
        return <Bell className="w-4 h-4 text-surface-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header and Mark All Read */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Real-time updates regarding your cleanliness complaints and hostel notices.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader
          title="Recent In-App Alerts"
          subtitle={`${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`}
        />
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-surface-200 rounded-xl space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-surface-100">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`py-3.5 px-3 rounded-xl transition-colors flex items-start gap-3 ${
                    !n.isRead ? 'bg-brand-50/40 border border-brand-100' : 'hover:bg-surface-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-surface-900 leading-snug">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-surface-400 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-surface-600 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="mt-2.5 flex items-center gap-3 text-xs">
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => handleMarkAsRead(n._id)}
                          className="font-semibold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1"
                        >
                          <span>Open Item</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}

                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(n._id)}
                          className="text-surface-500 hover:text-surface-900 font-medium"
                        >
                          Mark as read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(n._id)}
                        className="text-surface-400 hover:text-rose-600 ml-auto p-1"
                        title="Remove notification"
                        aria-label="Remove notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="No Notifications"
              description="You have no notifications at this time. Updates regarding your reported issues will appear here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
