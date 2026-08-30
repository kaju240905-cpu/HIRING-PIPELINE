import { Router } from 'express';
import { advanceApplication, rejectApplication, reinstateApplication } from '../controllers/pipelineController';
import { requireAuth, requireRecruiter } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);
router.use(requireRecruiter);

router.post('/:id/advance', advanceApplication);
router.post('/:id/reject', rejectApplication);
router.post('/:id/reinstate', reinstateApplication);

export default router;
