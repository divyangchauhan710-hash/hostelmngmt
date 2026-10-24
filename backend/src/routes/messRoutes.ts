import { Router } from 'express';
import {
  getWeeklyMenu,
  getDayMenu,
  updateDayMenu,
  getMealReviews,
  submitMealReview,
  deleteMealReview,
} from '../controllers/messController.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/menu', getWeeklyMenu);
router.get('/menu/:day', getDayMenu);
router.put('/menu', requireAuth, requireRole('mess_staff', 'admin'), updateDayMenu);

router.get('/reviews', optionalAuth, getMealReviews);
router.post('/reviews', requireAuth, submitMealReview);
router.delete('/reviews/:id', requireAuth, deleteMealReview);

export default router;
