import { Response } from 'express';
import { z } from 'zod';
import { User, UserRole } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';
import { MealReview } from '../models/MealReview.js';
import { CanteenItem } from '../models/CanteenItem.js';
import { HostelNotice } from '../models/HostelNotice.js';
import { AuthRequest } from '../middleware/auth.js';

const updateRoleSchema = z.object({
  role: z.enum(['student', 'rector', 'housekeeping', 'mess_staff', 'canteen_staff', 'admin']),
});

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required.' });
    return;
  }

  const { role, search } = req.query;
  const filter: any = {};
  if (role && role !== 'all') {
    filter.role = role;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { roomNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

  res.json({
    success: true,
    users,
  });
}

export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required.' });
    return;
  }

  const { id } = req.params;
  const validated = updateRoleSchema.parse(req.body);

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  user.role = validated.role as UserRole;
  await user.save();

  res.json({
    success: true,
    message: `Role for ${user.name} changed to ${user.role}.`,
    user,
  });
}

export async function getAdminOverview(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'rector')) {
    res.status(403).json({ success: false, message: 'Administrative access required.' });
    return;
  }

  const [
    totalUsers,
    totalStudents,
    totalComplaints,
    submittedComplaints,
    assignedComplaints,
    inProgressComplaints,
    resolvedComplaints,
    urgentComplaints,
    totalReviews,
    totalCanteenItems,
    availableCanteenItems,
    totalNotices,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'submitted' }),
    Complaint.countDocuments({ status: 'assigned' }),
    Complaint.countDocuments({ status: 'in_progress' }),
    Complaint.countDocuments({ status: 'resolved' }),
    Complaint.countDocuments({ priority: 'urgent', status: { $ne: 'resolved' } }),
    MealReview.countDocuments(),
    CanteenItem.countDocuments(),
    CanteenItem.countDocuments({ isAvailable: true }),
    HostelNotice.countDocuments(),
  ]);

  // Recent 5 complaints
  const recentComplaints = await Complaint.find()
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    overview: {
      users: {
        total: totalUsers,
        students: totalStudents,
      },
      complaints: {
        total: totalComplaints,
        submitted: submittedComplaints,
        assigned: assignedComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        urgent: urgentComplaints,
      },
      messAndCanteen: {
        reviews: totalReviews,
        canteenTotal: totalCanteenItems,
        canteenAvailable: availableCanteenItems,
      },
      notices: {
        total: totalNotices,
      },
      recentComplaints,
    },
  });
}
