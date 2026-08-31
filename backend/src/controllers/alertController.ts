import { Request, Response } from 'express';
import { prisma } from '../db';
import { ApplicationStatus } from '@prisma/client';

export const getStalledApplications = async (req: any, res: Response) => {
  try {
    const tenDaysAgo = new Date();
    // Exactly 10 days in the current stage is NOT stalled.
    // More than 10 days is STALLED.
    // So we need stageEnteredAt to be strictly BEFORE tenDaysAgo
    // However, to avoid sub-millisecond flakiness, we use exactly 10 days subtracted.
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    
    const stalledApps = await prisma.application.findMany({
      where: {
        status: ApplicationStatus.ACTIVE,
        stageEnteredAt: { lt: tenDaysAgo } // strictly less than, meaning older than 10 days
      },
      include: {
        stalledDismissals: true
      }
    });
    
    // Filter out dismissed applications for the current stage period
    const activeStalled = stalledApps.filter(app => {
      const isDismissed = app.stalledDismissals.some(d => 
        d.stage === app.currentStage && 
        d.stageEnteredAt.getTime() === app.stageEnteredAt.getTime()
      );
      return !isDismissed;
    });
    
    res.json({ applications: activeStalled });
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
};

export const dismissStalledAlert = async (req: any, res: Response) => {
  try {
    const applicationId = req.params.id;
    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    if (application.status !== ApplicationStatus.ACTIVE) {
      return res.status(400).json({ error: 'Application is not active' });
    }
    
    await prisma.stalledAlertDismissal.upsert({
      where: {
        applicationId_stage_stageEnteredAt: {
          applicationId,
          stage: application.currentStage,
          stageEnteredAt: application.stageEnteredAt
        }
      },
      create: {
        applicationId,
        stage: application.currentStage,
        stageEnteredAt: application.stageEnteredAt
      },
      update: {}
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
};
