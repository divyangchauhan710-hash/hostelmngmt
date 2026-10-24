import { Request, Response } from 'express';
import { z } from 'zod';
import { HostelNotice, NoticeCategory, NoticePriority } from '../models/HostelNotice.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

const noticeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.enum(['general', 'maintenance', 'emergency', 'mess', 'event']).default('general'),
  priority: z.enum(['normal', 'important', 'urgent']).default('normal'),
  isPinned: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

export async function getNotices(req: Request, res: Response): Promise<void> {
  const { category, priority, search } = req.query;

  const filter: any = {};
  if (category && category !== 'all') {
    filter.category = category;
  }
  if (priority && priority !== 'all') {
    filter.priority = priority;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  // Pinned first, then by publishedAt desc
  const notices = await HostelNotice.find(filter).sort({ isPinned: -1, publishedAt: -1 });

  res.json({
    success: true,
    notices,
  });
}

export async function getNoticeById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const notice = await HostelNotice.findById(id);

  if (!notice) {
    res.status(404).json({ success: false, message: 'Notice not found.' });
    return;
  }

  res.json({
    success: true,
    notice,
  });
}

export async function createNotice(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'rector' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only rector, warden, and administrators can publish notices.',
    });
    return;
  }

  const validated = noticeSchema.parse(req.body);

  const notice = new HostelNotice({
    ...validated,
    expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : undefined,
    authorName: req.user.name,
    authorRole: req.user.role === 'rector' ? 'Rector' : 'Administration',
    publishedAt: new Date(),
  });

  await notice.save();

  // If priority is important or urgent, notify students
  if (validated.priority === 'important' || validated.priority === 'urgent') {
    const students = await User.find({ role: 'student' }).select('_id');
    if (students.length > 0) {
      const notifications = students.map((s) => ({
        userId: s._id,
        type: 'notice' as const,
        title: `Hostel Notice: ${notice.title}`,
        message: notice.content.substring(0, 120) + (notice.content.length > 120 ? '...' : ''),
        link: '/hostel-info',
        isRead: false,
        createdAt: new Date(),
      }));
      await Notification.insertMany(notifications);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Notice published successfully.',
    notice,
  });
}

export async function updateNotice(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'rector' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only rector, warden, and administrators can modify notices.',
    });
    return;
  }

  const { id } = req.params;
  const validated = noticeSchema.partial().parse(req.body);

  const notice = await HostelNotice.findById(id);
  if (!notice) {
    res.status(404).json({ success: false, message: 'Notice not found.' });
    return;
  }

  Object.assign(notice, validated);
  if (validated.expiresAt) {
    notice.expiresAt = new Date(validated.expiresAt);
  }

  await notice.save();

  res.json({
    success: true,
    message: 'Notice updated successfully.',
    notice,
  });
}

export async function deleteNotice(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'rector' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only rector, warden, and administrators can delete notices.',
    });
    return;
  }

  const { id } = req.params;
  const notice = await HostelNotice.findByIdAndDelete(id);
  if (!notice) {
    res.status(404).json({ success: false, message: 'Notice not found.' });
    return;
  }

  res.json({
    success: true,
    message: 'Notice deleted successfully.',
  });
}
