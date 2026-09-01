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
    const { expectedVersion, nextStage, notes, interviewerId, scheduledAt, roundTitle } = req.body;

    if (expectedVersion === undefined || !nextStage) {
      return res.status(400).json({ error: 'expectedVersion and nextStage are required' });
    }

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.version !== Number(expectedVersion)) {
      return res.status(409).json({ error: 'Optimistic concurrency conflict' });
    }
    if (application.status !== ApplicationStatus.ACTIVE) {
      return res.status(400).json({ error: 'Cannot advance a non-active application' });
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

    // Validation for SCREENING -> INTERVIEW
    if (nextStage === 'INTERVIEW') {
      if (!notes) return res.status(400).json({ error: 'Evaluation notes are required when advancing to INTERVIEW' });
      if (!interviewerId) return res.status(400).json({ error: 'Interviewer assignment is required when advancing to INTERVIEW' });
      if (!scheduledAt || isNaN(Date.parse(scheduledAt))) return res.status(400).json({ error: 'Valid scheduledAt date is required when advancing to INTERVIEW' });

      const interviewerUser = await prisma.user.findUnique({ where: { id: interviewerId } });
      if (!interviewerUser || interviewerUser.role !== 'INTERVIEWER') {
        return res.status(400).json({ error: 'Selected user is not a valid interviewer' });
      }
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
            actorId: req.user.userId,
            actionType: ActionType.STAGE_ADVANCED,
            oldStage: application.currentStage,
            newStage: nextStage,
            notes
          }
        });

        if (nextStage === 'INTERVIEW') {
          // Upsert InterviewerAssignment to prevent duplicates if already assigned
          const existingAssignment = await tx.interviewerAssignment.findUnique({
            where: {
              applicationId_interviewerId: {
                applicationId: id,
                interviewerId
              }
            }
          });
          
          if (!existingAssignment) {
             await tx.interviewerAssignment.create({
               data: { applicationId: id, interviewerId }
             });
          }

          // Create Interview
          await tx.interview.create({
            data: {
              applicationId: id,
              interviewerId,
              roundTitle: roundTitle || 'Initial Interview',
              scheduledAt: new Date(scheduledAt),
              createdBy: req.user.userId
            }
          });
        }
      });
      res.json({ success: true });
    } catch (txError: any) {
      if (txError.message === 'CONCURRENCY_CONFLICT') {
        return res.status(409).json({ error: 'Optimistic concurrency conflict' });
      }
      throw txError;
    }
  } catch (error) {
    console.error('ADVANCE_ERROR:', error);
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
    if (application.status !== ApplicationStatus.ACTIVE) {
      return res.status(400).json({ error: application.status === ApplicationStatus.REJECTED ? 'Application is already rejected' : 'Cannot reject a non-active application' });
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
            actorId: req.user.userId,
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
            actorId: req.user.userId,
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

export const bulkAdvance = async (req: any, res: Response) => {
  try {
    const { applications, nextStage, notes, interviewerId, scheduledAt } = req.body;
    if (!Array.isArray(applications) || !nextStage) {
      return res.status(400).json({ error: 'applications array and nextStage required' });
    }

    const results = [];
    for (const app of applications) {
      const { id, expectedVersion } = app;
      try {
        const dbApp = await prisma.application.findUnique({ where: { id } });
        if (!dbApp) {
          results.push({ id, success: false, error: 'Application not found' });
          continue;
        }
        if (dbApp.version !== Number(expectedVersion)) {
          results.push({ id, success: false, error: 'Concurrency conflict' });
          continue;
        }
        if (dbApp.status !== ApplicationStatus.ACTIVE) {
          results.push({ id, success: false, error: 'Cannot advance rejected application' });
          continue;
        }

        const currentIndex = stageOrder.indexOf(dbApp.currentStage);
        const nextIndex = stageOrder.indexOf(nextStage);
        if (currentIndex === -1 || nextIndex === -1 || currentIndex === stageOrder.length - 1 || nextIndex !== currentIndex + 1) {
          results.push({ id, success: false, error: 'Invalid stage transition' });
          continue;
        }

        if (nextStage === 'INTERVIEW') {
          if (!notes || !interviewerId || !scheduledAt || isNaN(Date.parse(scheduledAt))) {
            results.push({ id, success: false, error: 'Missing interview fields' });
            continue;
          }
        }

        await prisma.$transaction(async (tx) => {
          const updateResult = await tx.application.updateMany({
            where: { id, version: Number(expectedVersion) },
            data: { currentStage: nextStage, stageEnteredAt: new Date(), version: { increment: 1 } }
          });
          if (updateResult.count === 0) throw new Error('CONCURRENCY');

          await tx.applicationHistory.create({
            data: { applicationId: id, actorId: req.user.userId, actionType: ActionType.STAGE_ADVANCED, oldStage: dbApp.currentStage, newStage: nextStage, notes }
          });

          if (nextStage === 'INTERVIEW') {
            const existingAssignment = await tx.interviewerAssignment.findUnique({
              where: { applicationId_interviewerId: { applicationId: id, interviewerId } }
            });
            if (!existingAssignment) {
              await tx.interviewerAssignment.create({ data: { applicationId: id, interviewerId } });
            }
            await tx.interview.create({
              data: {
                applicationId: id,
                interviewerId,
                roundTitle: 'Initial Interview',
                scheduledAt: new Date(scheduledAt),
                createdBy: req.user.userId
              }
            });
          }
        });

        results.push({ id, success: true });
      } catch (err: any) {
        results.push({ id, success: false, error: err.message === 'CONCURRENCY' ? 'Concurrency conflict' : 'Internal error' });
      }
    }
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const bulkReject = async (req: any, res: Response) => {
  try {
    const { applications, notes } = req.body;
    if (!Array.isArray(applications)) {
      return res.status(400).json({ error: 'applications array required' });
    }

    const results = [];
    for (const app of applications) {
      const { id, expectedVersion } = app;
      try {
        const dbApp = await prisma.application.findUnique({ where: { id } });
        if (!dbApp) {
          results.push({ id, success: false, error: 'Application not found' });
          continue;
        }
        if (dbApp.version !== Number(expectedVersion)) {
          results.push({ id, success: false, error: 'Concurrency conflict' });
          continue;
        }
        if (dbApp.status !== ApplicationStatus.ACTIVE) {
          results.push({ id, success: false, error: dbApp.status === ApplicationStatus.REJECTED ? 'Already rejected' : 'Cannot reject non-active application' });
          continue;
        }

        await prisma.$transaction(async (tx) => {
          const updateResult = await tx.application.updateMany({
            where: { id, version: Number(expectedVersion) },
            data: { status: ApplicationStatus.REJECTED, version: { increment: 1 } }
          });
          if (updateResult.count === 0) throw new Error('CONCURRENCY');

          await tx.applicationHistory.create({
            data: { applicationId: id, actorId: req.user.userId, actionType: ActionType.REJECTED, stage: dbApp.currentStage, notes }
          });
        });

        results.push({ id, success: true });
      } catch (err: any) {
        results.push({ id, success: false, error: err.message === 'CONCURRENCY' ? 'Concurrency conflict' : 'Internal error' });
      }
    }
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
