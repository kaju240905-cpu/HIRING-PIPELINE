import { Request, Response } from 'express';
import { PrismaClient, ApplicationStage, ApplicationStatus, ActionType } from '@prisma/client';
import { prisma } from '../db';

const stageOrder = [
  ApplicationStage.APPLIED,
  ApplicationStage.SCREENING,
  ApplicationStage.INTERVIEW,
  ApplicationStage.OFFER,
  ApplicationStage.HIRED
];

export const advanceApplication = async (req: any, res: Response) => {
  try {
    const id = req.params.id;
    const { expectedVersion, nextStage } = req.body;

    if (expectedVersion === undefined || !nextStage) {
      return res.status(400).json({ error: 'expectedVersion and nextStage are required' });
    }

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.version !== Number(expectedVersion)) {
      return res.status(409).json({ error: 'Optimistic concurrency conflict' });
    }
    if (application.status !== ApplicationStatus.ACTIVE) {
      return res.status(400).json({ error: 'Cannot advance a rejected application' });
    }
    
    const currentIndex = stageOrder.indexOf(application.currentStage);
    const nextIndex = stageOrder.indexOf(nextStage);

    if (currentIndex === -1 || nextIndex === -1) {
      return res.status(400).json({ error: 'Invalid stage' });
    }
    
    if (currentIndex === stageOrder.length - 1) {
      return res.status(400).json({ error: 'Application is already in the final stage' });
    }

    if (nextIndex !== currentIndex + 1) {
      return res.status(400).json({ error: 'Invalid forward transition' });
    }

    try {
      await prisma.$transaction(async (tx) => {
        const updateResult = await tx.application.updateMany({
          where: { id, version: Number(expectedVersion) },
          data: {
            currentStage: nextStage,
            stageEnteredAt: new Date(),
            version: { increment: 1 }
          }
        });

        if (updateResult.count === 0) {
          throw new Error('CONCURRENCY_CONFLICT');
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
      });
      res.json({ success: true });
    } catch (txError: any) {
      if (txError.message === 'CONCURRENCY_CONFLICT') {
        return res.status(409).json({ error: 'Optimistic concurrency conflict' });
      }
      throw txError;
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectApplication = async (req: any, res: Response) => {
  try {
    const id = req.params.id;
    const { expectedVersion, notes } = req.body;

    if (expectedVersion === undefined) {
      return res.status(400).json({ error: 'expectedVersion is required' });
    }

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.version !== Number(expectedVersion)) {
      return res.status(409).json({ error: 'Optimistic concurrency conflict' });
    }
    if (application.status === ApplicationStatus.REJECTED) {
      return res.status(400).json({ error: 'Application is already rejected' });
    }

    try {
      await prisma.$transaction(async (tx) => {
        const updateResult = await tx.application.updateMany({
          where: { id, version: Number(expectedVersion) },
          data: {
            status: ApplicationStatus.REJECTED,
            version: { increment: 1 }
          }
        });

        if (updateResult.count === 0) {
          throw new Error('CONCURRENCY_CONFLICT');
        }

        await tx.applicationHistory.create({
          data: {
            applicationId: id,
            actorId: req.user.id,
            actionType: ActionType.REJECTED,
            stage: application.currentStage,
            notes
          }
        });
      });
      res.json({ success: true });
    } catch (txError: any) {
      if (txError.message === 'CONCURRENCY_CONFLICT') {
        return res.status(409).json({ error: 'Optimistic concurrency conflict' });
      }
      throw txError;
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reinstateApplication = async (req: any, res: Response) => {
  try {
    const id = req.params.id;
    const { expectedVersion, notes } = req.body;

    if (expectedVersion === undefined) {
      return res.status(400).json({ error: 'expectedVersion is required' });
    }

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.version !== Number(expectedVersion)) {
      return res.status(409).json({ error: 'Optimistic concurrency conflict' });
    }
    if (application.status !== ApplicationStatus.REJECTED) {
      return res.status(400).json({ error: 'Application must be rejected to be reinstated' });
    }

    try {
      await prisma.$transaction(async (tx) => {
        const updateResult = await tx.application.updateMany({
          where: { id, version: Number(expectedVersion) },
          data: {
            status: ApplicationStatus.ACTIVE,
            stageEnteredAt: new Date(),
            version: { increment: 1 }
          }
        });

        if (updateResult.count === 0) {
          throw new Error('CONCURRENCY_CONFLICT');
        }

        await tx.applicationHistory.create({
          data: {
            applicationId: id,
            actorId: req.user.id,
            actionType: ActionType.REINSTATED,
            stage: application.currentStage,
            notes
          }
        });
      });
      res.json({ success: true });
    } catch (txError: any) {
      if (txError.message === 'CONCURRENCY_CONFLICT') {
        return res.status(409).json({ error: 'Optimistic concurrency conflict' });
      }
      throw txError;
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
