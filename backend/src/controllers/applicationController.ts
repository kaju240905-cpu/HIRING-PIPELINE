import { Request, Response } from 'express';
import { prisma } from '../db';
import { JobStatus, ApplicationStage, ApplicationStatus, ActionType, Role } from '@prisma/client';

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
          currentStage: ApplicationStage.APPLIED,
          appliedAt: new Date(),
          stageEnteredAt: new Date()
        }
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: app.id,
          actorId: (req as any).user.userId,
          actionType: ActionType.CREATED,
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
    const { jobId, stage, source, skip = 0, take = 50, search, sortBy, sortOrder, showArchived, status } = req.query;
    const user = (req as any).user;

    let whereClause: any = {};
    if (jobId) whereClause.jobId = String(jobId);
    if (stage) whereClause.currentStage = String(stage);
    if (source) whereClause.source = String(source);

    if (showArchived === 'true') {
      if (status) whereClause.status = status as ApplicationStatus;
    } else {
      if (status) {
        whereClause.status = status as ApplicationStatus;
      } else {
        whereClause.status = { not: ApplicationStatus.ARCHIVED };
      }
    }

    if (search) {
      whereClause.OR = [
        { candidateName: { contains: String(search), mode: 'insensitive' } },
        { candidateEmail: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    // Interviewers can only see assigned applications
    if (user.role === Role.INTERVIEWER) {
      whereClause.assignments = {
        some: { interviewerId: user.userId }
      };
    }

    const allowedSortFields = ['appliedAt', 'candidateName', 'candidateEmail', 'stageEnteredAt', 'currentStage', 'updatedAt'];
    const finalSortBy = allowedSortFields.includes(String(sortBy)) ? String(sortBy) : 'appliedAt';
    const finalSortOrder = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const orderBy: any = [
      { [finalSortBy]: finalSortOrder },
      { id: 'asc' } // Stable secondary sort
    ];

    const applications = await prisma.application.findMany({
      where: whereClause,
      skip: Number(skip),
      take: Number(take),
      orderBy
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

export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        history: { orderBy: { createdAt: 'desc' } },
        assignments: {
          include: {
            interviewer: {
              select: { id: true, email: true, role: true }
            }
          }
        },
        interviews: {
          include: {
            interviewer: {
              select: { id: true, email: true, role: true }
            }
          },
          orderBy: { scheduledAt: 'asc' }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Enforce data consistency: APPLIED and SCREENING stages cannot have interview assignments
    if (application.currentStage === ApplicationStage.APPLIED || application.currentStage === ApplicationStage.SCREENING) {
      application.assignments = [];
      application.interviews = [];
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const archiveApplication = async (req: any, res: Response) => {
  try {
    const id = req.params.id as string;
    const { notes } = req.body || {};

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Idempotent: If already ARCHIVED, return success without error or duplicate mutation
    if (application.status === ApplicationStatus.ARCHIVED) {
      return res.json({
        success: true,
        message: 'Application is already archived',
        application
      });
    }

    const updatedApplication = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: {
          status: ApplicationStatus.ARCHIVED,
          version: { increment: 1 }
        }
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: id,
          actorId: req.user.userId,
          actionType: ActionType.ARCHIVED,
          stage: application.currentStage,
          notes: notes || 'Application archived'
        }
      });

      return updated;
    });

    res.json({ success: true, application: updatedApplication });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const restoreApplication = async (req: any, res: Response) => {
  try {
    const id = req.params.id as string;
    const { notes } = req.body || {};

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== ApplicationStatus.ARCHIVED) {
      return res.json({
        success: true,
        message: 'Application is not archived',
        application
      });
    }

    const updatedApplication = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: {
          status: ApplicationStatus.ACTIVE,
          version: { increment: 1 }
        }
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: id,
          actorId: req.user.userId,
          actionType: ActionType.REINSTATED,
          stage: application.currentStage,
          notes: notes || 'Application restored from archive'
        }
      });

      return updated;
    });

    res.json({ success: true, application: updatedApplication });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
