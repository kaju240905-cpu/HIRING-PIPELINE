import { Request, Response } from 'express';
import { PrismaClient, ApplicationStage, ApplicationStatus, ActionType } from '@prisma/client';

const prisma = new PrismaClient();

const stageOrder = [
  ApplicationStage.APPLIED,
  ApplicationStage.SCREENING,
  ApplicationStage.INTERVIEW,
  ApplicationStage.OFFER,
  ApplicationStage.HIRED
];

export const advanceApplication = async (req: any, res: Response) => {
  const { id } = req.params;
  const { expectedVersion } = req.body;

  try {
    const application = await prisma.application.findUnique({ where: { id } });
    
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.status !== ApplicationStatus.ACTIVE) return res.status(400).json({ error: 'Cannot advance a rejected application' });
    
    const currentIndex = stageOrder.indexOf(application.currentStage);
    if (currentIndex === stageOrder.length - 1) {
      return res.status(400).json({ error: 'Already at terminal stage' });
    }
    
    const nextStage = stageOrder[currentIndex + 1];

    // Optimistic concurrency transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedApp = await tx.application.updateMany({
        where: {
          id,
          version: expectedVersion, // MUST match expected version
          status: ApplicationStatus.ACTIVE
        },
        data: {
          currentStage: nextStage,
          version: { increment: 1 },
          stageEnteredAt: new Date()
        }
      });

      if (updatedApp.count === 0) {
        throw new Error('CONCURRENCY_ERROR');
      }

      await tx.applicationHistory.create({
        data: {
          applicationId: id,
          actorId: req.user.id,
          actionType: ActionType.STAGE_ADVANCED,
          oldStage: application.currentStage,
          newStage: nextStage
        }
      });

      return await tx.application.findUnique({ where: { id } });
    });

    res.json({ application: result });
  } catch (error: any) {
    if (error.message === 'CONCURRENCY_ERROR') {
      return res.status(409).json({ error: 'Conflict: Application was modified by another user' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectApplication = async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) return res.status(404).json({ error: 'Not found' });
    if (application.currentStage === ApplicationStage.HIRED) {
      return res.status(400).json({ error: 'Cannot reject a hired candidate' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { status: ApplicationStatus.REJECTED }
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: id,
          actorId: req.user.id,
          actionType: ActionType.REJECTED,
          oldStage: app.currentStage,
          newStage: app.currentStage
        }
      });
      return app;
    });

    res.json({ application: updated });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reinstateApplication = async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { 
          status: ApplicationStatus.ACTIVE,
          stageEnteredAt: new Date() // Reset to start new stalled alert period
        }
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: id,
          actorId: req.user.id,
          actionType: ActionType.REINSTATED,
          oldStage: app.currentStage,
          newStage: app.currentStage
        }
      });
      return app;
    });

    res.json({ application: updated });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
