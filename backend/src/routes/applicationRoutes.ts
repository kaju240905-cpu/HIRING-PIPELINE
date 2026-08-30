import { Router } from 'express';
import {
  createApplication,
  listApplications,
  getApplicationById
} from '../controllers/applicationController';
import { requireAuth, requireRecruiter, requireInterviewerAssignment } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/', requireRecruiter, createApplication);
router.get('/', listApplications);
router.get('/:id', requireInterviewerAssignment, getApplicationById);

export default router;
