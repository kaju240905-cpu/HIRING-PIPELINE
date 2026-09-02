import { Router } from 'express';
import {
  listInterviews,
  submitFeedback,
  getFeedback,
  updateFeedback
} from '../controllers/interviewController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', listInterviews);
router.post('/:id/feedback', submitFeedback);
router.get('/:id/feedback', getFeedback);
router.patch('/:id/feedback', updateFeedback);

export default router;
