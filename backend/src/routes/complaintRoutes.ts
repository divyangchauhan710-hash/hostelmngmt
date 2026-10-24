import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  getComplaintMetrics,
} from '../controllers/complaintController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { uploadAttachment } from '../middleware/upload.js';

const router = Router();

router.get('/metrics', requireAuth, getComplaintMetrics);
router.get('/', requireAuth, getComplaints);
router.get('/:id', requireAuth, getComplaintById);
router.post('/', requireAuth, uploadAttachment.single('attachment'), createComplaint);
router.patch('/:id/status', requireAuth, requireRole('housekeeping', 'rector', 'admin'), updateComplaintStatus);
router.patch('/:id/assign', requireAuth, requireRole('housekeeping', 'rector', 'admin'), assignComplaint);

export default router;
