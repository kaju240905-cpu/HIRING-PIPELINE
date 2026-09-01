import { Router } from 'express';
import {
  createApplication,
  listApplications,
  getApplicationById,
  archiveApplication,
  restoreApplication
} from '../controllers/applicationController';
import { addFeedback, createAdditionalInterview } from '../controllers/interviewController';
import { getStalledApplications, dismissStalledAlert } from '../controllers/alertController';
import { requireAuth, requireRecruiter, requireInterviewerAssignment } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/stalled', requireRecruiter, getStalledApplications);
router.post('/', requireRecruiter, createApplication);
router.get('/', listApplications);
router.get('/:id', requireInterviewerAssignment, getApplicationById);

router.post('/:id/archive', requireRecruiter, archiveApplication);
router.post('/:id/restore', requireRecruiter, restoreApplication);
router.post('/:id/interviews', requireRecruiter, createAdditionalInterview);
router.post('/:id/stalled/dismiss', requireRecruiter, dismissStalledAlert);
router.post('/:id/feedback', requireInterviewerAssignment, addFeedback);

export default router;
