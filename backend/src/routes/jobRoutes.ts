import { Router } from 'express';
import { createJob, updateJob, listJobs } from '../controllers/jobController';
import { requireAuth, requireRecruiter } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', listJobs);
router.post('/', requireRecruiter, createJob);
router.put('/:id', requireRecruiter, updateJob);

export default router;
