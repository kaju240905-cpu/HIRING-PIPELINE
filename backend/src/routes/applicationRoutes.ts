import { Router } from 'express';
import { createApplication, listApplications } from '../controllers/applicationController';
import { requireAuth, requireRecruiter } from '../auth';

const router = Router();

router.use(requireAuth);

router.post('/', requireRecruiter, createApplication);
router.get('/', listApplications); // Both recruiters and interviewers can list (filtered via logic)

export default router;
