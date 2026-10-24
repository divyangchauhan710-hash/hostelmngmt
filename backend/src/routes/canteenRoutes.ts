import { Router } from 'express';
import {
  getCanteenItems,
  getCanteenItemById,
  createCanteenItem,
  updateCanteenItem,
  toggleCanteenAvailability,
  deleteCanteenItem,
} from '../controllers/canteenController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/items', getCanteenItems);
router.get('/items/:id', getCanteenItemById);
router.post('/items', requireAuth, requireRole('canteen_staff', 'admin'), createCanteenItem);
router.put('/items/:id', requireAuth, requireRole('canteen_staff', 'admin'), updateCanteenItem);
router.patch('/:id/availability', requireAuth, requireRole('canteen_staff', 'admin'), toggleCanteenAvailability);
router.delete('/items/:id', requireAuth, requireRole('canteen_staff', 'admin'), deleteCanteenItem);

export default router;
