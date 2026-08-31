import { Router } from 'express';
import {
  createApplication,
  listApplications,
  getApplicationById
} from '../controllers/applicationController';
import { assignInterviewer, scheduleInterview, addFeedback } from '../controllers/interviewController';
import { getStalledApplications, dismissStalledAlert } from '../controllers/alertController';
import { requireAuth, requireRecruiter, requireInterviewerAssignment } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/stalled', requireRecruiter, getStalledApplications);
router.post('/', requireRecruiter, createApplication);
router.get('/', listApplications);
router.get('/:id', requireInterviewerAssignment, getApplicationById);

router.post('/:id/stalled/dismiss', requireRecruiter, dismissStalledAlert);
router.post('/:id/assign', requireRecruiter, assignInterviewer);
router.post('/:id/interviews', requireRecruiter, scheduleInterview);
router.post('/:id/feedback', requireInterviewerAssignment, addFeedback);

export default router;
