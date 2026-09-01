import { Router } from 'express';
import { listInterviews } from '../controllers/interviewController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', listInterviews);

export default router;
