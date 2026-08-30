import { Router } from 'express';
import { advanceApplication, rejectApplication, reinstateApplication } from '../controllers/pipelineController';

const router = Router();

router.post('/:id/advance', advanceApplication);
router.post('/:id/reject', rejectApplication);
router.post('/:id/reinstate', reinstateApplication);

export default router;
