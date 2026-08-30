import { Router } from 'express';
import { advanceApplication, rejectApplication, reinstateApplication } from '../controllers/pipelineController';
import { requireAuth, requireRecruiter } from '../auth';

const router = Router();

router.use(requireAuth);
router.use(requireRecruiter); // Pipeline operations are recruiter-only

router.post('/:id/advance', advanceApplication);
router.post('/:id/reject', rejectApplication);
router.post('/:id/reinstate', reinstateApplication);

export default router;
