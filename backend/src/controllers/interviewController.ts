import { Request, Response } from 'express';
import { prisma } from '../db';
import { ActionType, ApplicationStage } from '@prisma/client';

export const assignInterviewer = async (req: any, res: Response) => {
  try {
    const applicationId = req.params.id;
    const { interviewerId } = req.body;
    
    if (!interviewerId) return res.status(400).json({ error: 'interviewerId required' });
    
    const user = await prisma.user.findUnique({ where: { id: interviewerId } });
    if (!user || user.role !== 'INTERVIEWER') return res.status(400).json({ error: 'Invalid interviewer' });
    
    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    await prisma.interviewerAssignment.create({
      data: { applicationId, interviewerId }
    });
    
    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Already assigned' });
    res.status(500).json({ error: 'Internal error' });
  }
};

export const scheduleInterview = async (req: any, res: Response) => {
  try {
    const applicationId = req.params.id;
    const { scheduledAt } = req.body;
    
    if (!scheduledAt || isNaN(Date.parse(scheduledAt))) return res.status(400).json({ error: 'Valid scheduledAt required' });
    
    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    // Only allow interview scheduling if application is ACTIVE and in an appropriate stage
    if (application.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Cannot schedule interview for a rejected application' });
    }
    if (application.currentStage === 'APPLIED' || application.currentStage === 'HIRED' || application.currentStage === 'OFFER') {
      return res.status(400).json({ error: 'Inappropriate application stage for interview' });
    }
    
    const interview = await prisma.interview.create({
      data: {
        applicationId,
        scheduledAt: new Date(scheduledAt),
        createdBy: req.user.userId
      }
    });
    
    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
};

export const addFeedback = async (req: any, res: Response) => {
  try {
    const applicationId = req.params.id;
    const { notes } = req.body;
    
    if (!notes) return res.status(400).json({ error: 'notes required' });
    
    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    const history = await prisma.applicationHistory.create({
      data: {
        applicationId,
        actorId: req.user.userId,
        actionType: ActionType.FEEDBACK_ADDED,
        notes,
        stage: application.currentStage
      }
    });
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
};
