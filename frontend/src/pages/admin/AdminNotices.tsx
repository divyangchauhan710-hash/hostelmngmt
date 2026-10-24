import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Pin,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { HostelNotice, NoticeCategory, NoticePriority } from '../../types';

export const AdminNotices: React.FC = () => {
  const { success, error } = useToast();
  const [notices, setNotices] = useState<HostelNotice[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('general');
  const [priority, setPriority] = useState<NoticePriority>('normal');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ notices: HostelNotice[] }>('/notices');
      setNotices(res.notices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      await api.post('/notices', {
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        isPinned,
      });
      success('Notice published to student notice board.');
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setCategory('general');
      setPriority('normal');
      setIsPinned(false);
      fetchNotices();
    } catch (err: any) {
      error(err.message || 'Failed to publish notice.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      success('Notice removed.');
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch (err: any) {
      error(err.message || 'Failed to delete notice.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
            Hostel Circulars & Notices
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Publish maintenance schedules, administrative directives, and emergency announcements.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Publish New Notice
        </Button>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <Card key={n._id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {n.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded uppercase">
                      <Pin className="w-3 h-3" />
                      <span>Pinned</span>
                    </span>
                  )}
                  <span className="text-[10px] font-semibold bg-surface-100 text-surface-700 px-2 py-0.5 rounded capitalize">
                    {n.category}
                  </span>
                  {n.priority === 'urgent' && (
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded uppercase">
                      Urgent
                    </span>
                  )}
                  <span className="text-[11px] text-surface-400">
                    Published {new Date(n.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-surface-900 leading-snug">
                  {n.title}
                </h3>

                <p className="text-xs text-surface-700 leading-relaxed bg-surface-50 p-3 rounded-lg border border-surface-100 whitespace-pre-wrap">
                  {n.content}
                </p>

                <div className="text-[11px] text-surface-500 pt-1">
                  Issued by: <span className="font-medium text-surface-700">{n.authorName}</span> ({n.authorRole})
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteNotice(n._id)}
                className="text-surface-400 hover:text-rose-600 p-1.5 rounded transition-colors flex-shrink-0"
                title="Delete Notice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Publish Notice Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Publish Hostel Notice"
          description="This circular will be displayed on the student notice board and sent as an in-app alert."
        >
          <form onSubmit={handleCreateNotice} className="space-y-4">
            <div>
              <label htmlFor="noticeTitle" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Notice Title *
              </label>
              <input
                id="noticeTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Water Tank Sanitization Schedule"
                className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="noticeCategory" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  id="noticeCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                >
                  <option value="general">General Directive</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="emergency">Emergency</option>
                  <option value="mess">Mess & Dining</option>
                  <option value="event">Hostel Event</option>
                </select>
              </div>

              <div>
                <label htmlFor="noticePriority" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Priority *
                </label>
                <select
                  id="noticePriority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NoticePriority)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important (Dispatches Alert)</option>
                  <option value="urgent">Urgent Action Required</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="noticeContent" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Notice Text / Instructions *
              </label>
              <textarea
                id="noticeContent"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Provide complete guidance, dates, affected floors, and guidelines..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="pinnedNoticeCheck"
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-surface-300 text-brand-700 focus:ring-brand-700"
              />
              <label htmlFor="pinnedNoticeCheck" className="text-xs text-surface-700 select-none">
                Pin to top of Student Notice Board
              </label>
            </div>

            <div className="pt-3 border-t border-surface-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isPublishing}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isPublishing}>
                Publish Notice
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
