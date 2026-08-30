import { Router } from 'express';
import { createApplication, listApplications } from '../controllers/applicationController';

const router = Router();

// Auth is a Phase 2 feature, endpoints are open in Phase 1
router.post('/', createApplication);
router.get('/', listApplications); 

export default router;
