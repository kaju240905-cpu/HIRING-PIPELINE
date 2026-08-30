import { Request, Response } from 'express';
import { PrismaClient, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createApplication = async (req: Request, res: Response) => {
  const { jobId, candidateName, candidateEmail, source, notes } = req.body;

  if (!candidateName || !candidateEmail || !source) {
    return res.status(400).json({ error: 'Missing required fields: candidateName, candidateEmail, source' });
  }

  if (!EMAIL_REGEX.test(candidateEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const job = await prisma.jobOpening.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== JobStatus.OPEN) {
      return res.status(400).json({ error: 'Applications can only be submitted to OPEN jobs' });
    }

    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          jobId,
          candidateName,
          candidateEmail,
          source,
          notes,
          appliedAt: new Date(),
          stageEnteredAt: new Date()
        }
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: app.id,
          actorId: (req as any).user.id,
          actionType: 'CREATED',
          newStage: app.currentStage
        }
      });

      return app;
    });

    res.status(201).json({ application });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listApplications = async (req: Request, res: Response) => {
  try {
    const { jobId, stage, source, skip = 0, take = 50 } = req.query;
    const user = (req as any).user;

    let whereClause: any = {};
    if (jobId) whereClause.jobId = String(jobId);
    if (stage) whereClause.currentStage = String(stage);
    if (source) whereClause.source = String(source);

    // Interviewers can only see assigned applications
    if (user.role === 'INTERVIEWER') {
      whereClause.assignments = {
        some: { interviewerId: user.id }
      };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      skip: Number(skip),
      take: Number(take),
      orderBy: { appliedAt: 'desc' }
    });

    const total = await prisma.application.count({ where: whereClause });

    res.json({
      data: applications,
      meta: {
        total,
        skip: Number(skip),
        take: Number(take)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
