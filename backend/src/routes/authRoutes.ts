import { Router } from 'express';
import { login, logout, getCurrentUser, getInterviewers } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);
router.get('/interviewers', requireAuth, getInterviewers);

export default router;
