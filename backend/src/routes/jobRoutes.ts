import { Router } from 'express';
import { createJob, updateJob, listJobs, archiveJob, restoreJob } from '../controllers/jobController';
import { requireAuth, requireRecruiter } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', listJobs);
router.post('/', requireRecruiter, createJob);
router.put('/:id', requireRecruiter, updateJob);
router.post('/:id/archive', requireRecruiter, archiveJob);
router.post('/:id/restore', requireRecruiter, restoreJob);

export default router;
