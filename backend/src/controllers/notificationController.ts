import { Response } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const userId = new mongoose.Types.ObjectId(req.user.id);
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  res.json({
    success: true,
    notifications,
    unreadCount,
  });
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const { id } = req.params;
  const notification = await Notification.findOne({
    _id: id,
    userId: new mongoose.Types.ObjectId(req.user.id),
  });

  if (!notification) {
    res.status(404).json({ success: false, message: 'Notification not found.' });
    return;
  }

  notification.isRead = true;
  await notification.save();

  res.json({
    success: true,
    message: 'Notification marked as read.',
    notification,
  });
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const userId = new mongoose.Types.ObjectId(req.user.id);
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });

  res.json({
    success: true,
    message: 'All notifications marked as read.',
  });
}

export async function deleteNotification(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const { id } = req.params;
  const deleted = await Notification.findOneAndDelete({
    _id: id,
    userId: new mongoose.Types.ObjectId(req.user.id),
  });

  if (!deleted) {
    res.status(404).json({ success: false, message: 'Notification not found.' });
    return;
  }

  res.json({
    success: true,
    message: 'Notification removed.',
  });
}
