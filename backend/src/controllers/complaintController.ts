import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Complaint, IComplaint, ComplaintStatus, ComplaintCategory, ComplaintPriority } from '../models/Complaint.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

const createComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category: z.enum([
    'washroom',
    'corridor',
    'room',
    'drinking_water',
    'garbage',
    'common_area',
    'other',
  ]),
  hostelBlock: z.string().min(1, 'Hostel block is required'),
  location: z.string().min(2, 'Specific location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['normal', 'urgent']).default('normal'),
});

const updateStatusSchema = z.object({
  status: z.enum(['submitted', 'assigned', 'in_progress', 'resolved', 'rejected', 'reopened']),
  note: z.string().optional(),
  isInternal: z.boolean().default(false),
  priority: z.enum(['normal', 'urgent']).optional(),
});

const assignSchema = z.object({
  assignedTo: z.string().min(1, 'Staff ID is required'),
  note: z.string().optional(),
});

// Helper to generate reference number
async function generateReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `CLN-${year}-${sequence}`;
}

export async function createComplaint(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const validated = createComplaintSchema.parse(req.body);

  const referenceNumber = await generateReferenceNumber();
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  const complaint = new Complaint({
    referenceNumber,
    studentId: new mongoose.Types.ObjectId(req.user.id),
    studentName: req.user.name,
    studentRoom: req.user.roomNumber || '',
    title: validated.title,
    category: validated.category,
    hostelBlock: validated.hostelBlock,
    location: validated.location,
    description: validated.description,
    priority: validated.priority,
    status: 'submitted',
    imageUrl,
    statusHistory: [
      {
        status: 'submitted',
        changedBy: new mongoose.Types.ObjectId(req.user.id),
        changedByName: req.user.name,
        note: 'Complaint submitted by student.',
        isInternal: false,
        timestamp: new Date(),
      },
    ],
  });

  await complaint.save();

  // Create confirmation notification for student
  await Notification.create({
    userId: new mongoose.Types.ObjectId(req.user.id),
    type: 'complaint_status',
    title: `Complaint Submitted (${referenceNumber})`,
    message: `Your cleanliness complaint regarding "${complaint.title}" has been registered.`,
    link: `/cleanliness/${complaint._id}`,
    isRead: false,
  });

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully.',
    complaint,
  });
}

export async function getComplaints(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const { status, category, priority, search, page = '1', limit = '10' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};

  // If student, can strictly only view own complaints
  if (req.user.role === 'student') {
    filter.studentId = new mongoose.Types.ObjectId(req.user.id);
  }

  if (status && status !== 'all') {
    filter.status = status;
  }
  if (category && category !== 'all') {
    filter.category = category;
  }
  if (priority && priority !== 'all') {
    filter.priority = priority;
  }
  if (search) {
    filter.$or = [
      { referenceNumber: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Complaint.countDocuments(filter);
  const rawComplaints = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // If student, filter out internal notes from status history
  const complaints = rawComplaints.map((c) => {
    const obj = c.toObject();
    if (req.user?.role === 'student') {
      obj.statusHistory = obj.statusHistory.filter((h: any) => !h.isInternal);
    }
    return obj;
  });

  res.json({
    success: true,
    complaints,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function getComplaintById(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const id = req.params.id as string;

  let complaint: IComplaint | null = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    complaint = await Complaint.findById(id);
  } else {
    complaint = await Complaint.findOne({ referenceNumber: id });
  }

  if (!complaint) {
    res.status(404).json({ success: false, message: 'Complaint not found.' });
    return;
  }

  // Student authorization check: students cannot view other students' complaints
  if (req.user.role === 'student' && complaint.studentId.toString() !== req.user.id) {
    res.status(403).json({
      success: false,
      message: 'Access denied. You do not have permission to view this complaint.',
    });
    return;
  }

  const obj = complaint.toObject();
  if (req.user.role === 'student') {
    obj.statusHistory = obj.statusHistory.filter((h: any) => !h.isInternal);
  }

  res.json({
    success: true,
    complaint: obj,
  });
}

export async function updateComplaintStatus(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  // Role check: students cannot change administrative complaint status
  if (req.user.role === 'student') {
    res.status(403).json({
      success: false,
      message: 'Students are not authorized to update complaint status.',
    });
    return;
  }

  const { id } = req.params;
  const validated = updateStatusSchema.parse(req.body);

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404).json({ success: false, message: 'Complaint not found.' });
    return;
  }

  const previousStatus = complaint.status;
  complaint.status = validated.status;

  if (validated.priority) {
    complaint.priority = validated.priority;
  }

  complaint.statusHistory.push({
    status: validated.status,
    changedBy: new mongoose.Types.ObjectId(req.user.id),
    changedByName: req.user.name,
    note: validated.note || `Status updated from ${previousStatus} to ${validated.status}.`,
    isInternal: validated.isInternal,
    timestamp: new Date(),
  });

  await complaint.save();

  // If status is visible to student, send notification
  if (!validated.isInternal) {
    const statusLabels: Record<string, string> = {
      assigned: 'Assigned to Staff',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected',
      reopened: 'Reopened',
    };

    await Notification.create({
      userId: complaint.studentId,
      type: 'complaint_status',
      title: `Complaint ${statusLabels[validated.status] || validated.status} (${complaint.referenceNumber})`,
      message: validated.note || `Your complaint "${complaint.title}" is now ${validated.status}.`,
      link: `/cleanliness/${complaint._id}`,
      isRead: false,
    });
  }

  res.json({
    success: true,
    message: `Complaint status updated to ${validated.status}.`,
    complaint,
  });
}

export async function assignComplaint(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role === 'student') {
    res.status(403).json({ success: false, message: 'Unauthorized.' });
    return;
  }

  const { id } = req.params;
  const validated = assignSchema.parse(req.body);

  const staffUser = await User.findById(validated.assignedTo);
  if (!staffUser) {
    res.status(404).json({ success: false, message: 'Staff user not found.' });
    return;
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404).json({ success: false, message: 'Complaint not found.' });
    return;
  }

  complaint.assignedTo = staffUser._id as mongoose.Types.ObjectId;
  complaint.assignedStaffName = staffUser.name;
  if (complaint.status === 'submitted') {
    complaint.status = 'assigned';
  }

  complaint.statusHistory.push({
    status: complaint.status,
    changedBy: new mongoose.Types.ObjectId(req.user.id),
    changedByName: req.user.name,
    note: validated.note || `Assigned to housekeeping staff member ${staffUser.name}.`,
    isInternal: false,
    timestamp: new Date(),
  });

  await complaint.save();

  // Notify student
  await Notification.create({
    userId: complaint.studentId,
    type: 'complaint_assigned',
    title: `Staff Assigned (${complaint.referenceNumber})`,
    message: `Housekeeping staff member ${staffUser.name} has been assigned to address your complaint.`,
    link: `/cleanliness/${complaint._id}`,
    isRead: false,
  });

  res.json({
    success: true,
    message: `Complaint assigned to ${staffUser.name}.`,
    complaint,
  });
}

export async function getComplaintMetrics(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const filter: any = {};
  if (req.user.role === 'student') {
    filter.studentId = new mongoose.Types.ObjectId(req.user.id);
  }

  const total = await Complaint.countDocuments(filter);
  const submitted = await Complaint.countDocuments({ ...filter, status: 'submitted' });
  const assigned = await Complaint.countDocuments({ ...filter, status: 'assigned' });
  const inProgress = await Complaint.countDocuments({ ...filter, status: 'in_progress' });
  const resolved = await Complaint.countDocuments({ ...filter, status: 'resolved' });
  const urgent = await Complaint.countDocuments({ ...filter, priority: 'urgent', status: { $ne: 'resolved' } });

  res.json({
    success: true,
    metrics: {
      total,
      submitted,
      assigned,
      inProgress,
      resolved,
      urgent,
    },
  });
}
