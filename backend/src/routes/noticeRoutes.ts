import { Router } from 'express';
import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getNotices);
router.get('/:id', getNoticeById);
router.post('/', requireAuth, requireRole('rector', 'admin'), createNotice);
router.put('/:id', requireAuth, requireRole('rector', 'admin'), updateNotice);
router.delete('/:id', requireAuth, requireRole('rector', 'admin'), deleteNotice);

export default router;
