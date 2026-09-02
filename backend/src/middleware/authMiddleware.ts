import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, COOKIE_NAME, JwtPayload } from '../utils/jwt';

import { prisma } from '../db';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
}

export function requireRecruiter(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'RECRUITER') {
    return res.status(403).json({ error: 'Access denied: Recruiters only' });
  }
  next();
}

export async function requireInterviewerAssignment(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Recruiters have full access
  if (req.user.role === 'RECRUITER') {
    return next();
  }

  // Interviewers must be assigned to the specific application
  const paramId = req.params.id;
  if (!paramId || typeof paramId !== 'string') {
    return res.status(400).json({ error: 'Valid application ID required' });
  }
  const applicationId = paramId;

  try {
    const assignment = await prisma.interviewerAssignment.findUnique({
      where: {
        applicationId_interviewerId: {
          applicationId,
          interviewerId: req.user.userId,
        },
      },
    });

    if (assignment) {
      return next();
    }

    const hasInterview = await prisma.interview.findFirst({
      where: {
        applicationId,
        interviewerId: req.user.userId,
      },
    });

    if (hasInterview) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied: You are not assigned to this application' });
  } catch (error) {
    console.error('Error checking interviewer assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
