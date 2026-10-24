import { Router } from 'express';
import {
  getUsers,
  updateUserRole,
  getAdminOverview,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/overview', requireAuth, requireRole('admin', 'rector'), getAdminOverview);
router.get('/users', requireAuth, requireRole('admin'), getUsers);
router.patch('/users/:id/role', requireAuth, requireRole('admin'), updateUserRole);

export default router;
