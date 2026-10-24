import { Router } from 'express';
import {
  getOfficialContacts,
  getOfficialContactById,
  createOfficialContact,
  updateOfficialContact,
  deleteOfficialContact,
} from '../controllers/contactController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getOfficialContacts);
router.get('/:id', getOfficialContactById);
router.post('/', requireAuth, requireRole('rector', 'admin'), createOfficialContact);
router.put('/:id', requireAuth, requireRole('rector', 'admin'), updateOfficialContact);
router.delete('/:id', requireAuth, requireRole('rector', 'admin'), deleteOfficialContact);

export default router;
