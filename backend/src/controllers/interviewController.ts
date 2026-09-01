import { Request, Response } from 'express';
import { prisma } from '../db';
import { ActionType, ApplicationStage } from '@prisma/client';

export const listInterviews = async (req: Request, res: Response) => {
  try {
    const interviews = await prisma.interview.findMany({
      orderBy: { scheduledAt: 'asc' },
      include: {
        interviewer: {
          select: { id: true, email: true, role: true }
        },
        application: {
          include: {
            job: {
              select: { title: true }
            }
          }
        }
      }
    });

    res.json({ interviews });
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
};

export const createAdditionalInterview = async (req: any, res: Response) => {
  try {
    const applicationId = req.params.id;
    const { interviewerId, scheduledAt, roundTitle } = req.body;

    if (!interviewerId) {
      return res.status(400).json({ error: 'Interviewer is required' });
    }

    if (!scheduledAt || isNaN(Date.parse(scheduledAt))) {
      return res.status(400).json({ error: 'Valid scheduledAt date and time is required' });
    }

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.currentStage !== ApplicationStage.INTERVIEW) {
      return res.status(400).json({
        error: `Additional interviews can only be scheduled when candidate is in the INTERVIEW stage. Current stage: ${application.currentStage}`
      });
    }

    if (application.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Cannot schedule interviews for non-active applications' });
    }

    const interviewerUser = await prisma.user.findUnique({ where: { id: interviewerId } });
    if (!interviewerUser || interviewerUser.role !== 'INTERVIEWER') {
      return res.status(400).json({ error: 'Selected user is not a valid interviewer' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Ensure InterviewerAssignment exists for (applicationId, interviewerId) so this interviewer has access
      const existingAssignment = await tx.interviewerAssignment.findUnique({
        where: {
          applicationId_interviewerId: {
            applicationId,
            interviewerId
          }
        }
      });

      if (!existingAssignment) {
        await tx.interviewerAssignment.create({
          data: {
            applicationId,
            interviewerId
          }
        });
      }

      // Create Interview
      const newInterview = await tx.interview.create({
        data: {
          applicationId,
          interviewerId,
          roundTitle: roundTitle || 'Additional Interview',
          scheduledAt: new Date(scheduledAt),
          createdBy: req.user.userId
        },
        include: {
          interviewer: {
            select: { id: true, email: true, role: true }
          }
        }
      });

      // Add to ApplicationHistory
      await tx.applicationHistory.create({
        data: {
          applicationId,
          actorId: req.user.userId,
          actionType: ActionType.STAGE_ADVANCED,
          stage: ApplicationStage.INTERVIEW,
          notes: `Additional interview scheduled: ${roundTitle || 'Interview'} with ${interviewerUser.email} on ${new Date(scheduledAt).toLocaleString()}`
        }
      });

      return newInterview;
    });

    res.status(201).json({ success: true, interview: result });
  } catch (error) {
    console.error('Error creating additional interview:', error);
    res.status(500).json({ error: 'Internal server error' });
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

