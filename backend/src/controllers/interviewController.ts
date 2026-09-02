import { Request, Response } from 'express';
import { prisma } from '../db';
import { ActionType, ApplicationStage } from '@prisma/client';

export const listInterviews = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const whereClause: any = {};
    if (user && user.role === 'INTERVIEWER') {
      whereClause.interviewerId = user.userId;
    }

    const interviews = await prisma.interview.findMany({
      where: whereClause,
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
        },
        feedback: {
          include: {
            interviewer: {
              select: { id: true, email: true, role: true }
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



export const submitFeedback = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      technicalSkillsRating,
      communicationSkillsRating,
      problemSolvingRating,
      roleSpecificSkillsRating,
      recommendation,
      strengths,
      concerns,
      comments
    } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { feedback: true, application: true }
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Rule 1 & 2: Only assigned interviewer can submit feedback
    if (interview.interviewerId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only submit feedback for interviews assigned to you' });
    }

    // Rule 3: Must be past the scheduled time
    if (new Date(interview.scheduledAt) > new Date()) {
      return res.status(400).json({ error: 'Feedback cannot be submitted before the scheduled interview time' });
    }

    // Rule 6: Prevent duplicate feedback
    if (interview.feedback) {
      return res.status(400).json({ error: 'Feedback has already been submitted for this interview' });
    }

    // Rating validations: 1 to 5
    const ratings = [
      { name: 'Technical skills rating', val: technicalSkillsRating },
      { name: 'Communication skills rating', val: communicationSkillsRating },
      { name: 'Problem-solving rating', val: problemSolvingRating },
      { name: 'Role-specific skills rating', val: roleSpecificSkillsRating }
    ];
    for (const r of ratings) {
      if (typeof r.val !== 'number' || !Number.isInteger(r.val) || r.val < 1 || r.val > 5) {
        return res.status(400).json({ error: `${r.name} must be an integer between 1 and 5` });
      }
    }

    // Recommendation validation
    const validRecs = ['STRONG_HIRE', 'HIRE', 'NEUTRAL', 'REJECT', 'STRONG_REJECT'];
    if (!recommendation || !validRecs.includes(recommendation)) {
      return res.status(400).json({ error: `Recommendation must be one of: ${validRecs.join(', ')}` });
    }

    if (!strengths || typeof strengths !== 'string' || !strengths.trim()) {
      return res.status(400).json({ error: 'Strengths are required' });
    }

    if (!concerns || typeof concerns !== 'string' || !concerns.trim()) {
      return res.status(400).json({ error: 'Concerns / areas for improvement are required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const newFeedback = await tx.feedback.create({
        data: {
          interviewId: id,
          interviewerId: userId,
          technicalSkillsRating,
          communicationSkillsRating,
          problemSolvingRating,
          roleSpecificSkillsRating,
          recommendation,
          strengths: strengths.trim(),
          concerns: concerns.trim(),
          comments: comments && typeof comments === 'string' ? comments.trim() : null
        },
        include: {
          interviewer: { select: { id: true, email: true, role: true } }
        }
      });

      // Update the interview status to COMPLETED
      await tx.interview.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });

      // Also record in ApplicationHistory so recruiters see the summary in candidate history
      await tx.applicationHistory.create({
        data: {
          applicationId: interview.applicationId,
          actorId: userId,
          actionType: ActionType.FEEDBACK_ADDED,
          stage: interview.application.currentStage,
          notes: `[Interview: ${interview.roundTitle || 'Round'}] [Recommendation: ${recommendation}] (Tech: ${technicalSkillsRating}/5, Comm: ${communicationSkillsRating}/5, Problem: ${problemSolvingRating}/5, Role: ${roleSpecificSkillsRating}/5)\nStrengths: ${strengths.trim()}\nConcerns: ${concerns.trim()}${comments ? `\nComments: ${comments.trim()}` : ''}`
        }
      });

      return newFeedback;
    });

    res.status(201).json({ success: true, feedback: result });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Feedback has already been submitted for this interview' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFeedback = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        feedback: {
          include: { interviewer: { select: { id: true, email: true, role: true } } }
        }
      }
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // If interviewer, must be assigned
    if (req.user.role === 'INTERVIEWER' && interview.interviewerId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only view feedback for interviews assigned to you' });
    }

    if (!interview.feedback) {
      return res.status(404).json({ error: 'No feedback found for this interview' });
    }

    res.json({ feedback: interview.feedback });
  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateFeedback = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      technicalSkillsRating,
      communicationSkillsRating,
      problemSolvingRating,
      roleSpecificSkillsRating,
      recommendation,
      strengths,
      concerns,
      comments
    } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { feedback: true }
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Only assigned interviewer can edit their own feedback
    if (interview.interviewerId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only edit your own feedback' });
    }

    if (!interview.feedback) {
      return res.status(404).json({ error: 'Feedback does not exist yet. Please submit feedback first.' });
    }

    const updateData: any = {};

    const ratingFields = [
      { key: 'technicalSkillsRating', name: 'Technical skills rating', val: technicalSkillsRating },
      { key: 'communicationSkillsRating', name: 'Communication skills rating', val: communicationSkillsRating },
      { key: 'problemSolvingRating', name: 'Problem-solving rating', val: problemSolvingRating },
      { key: 'roleSpecificSkillsRating', name: 'Role-specific skills rating', val: roleSpecificSkillsRating }
    ];

    for (const rf of ratingFields) {
      if (rf.val !== undefined) {
        if (typeof rf.val !== 'number' || !Number.isInteger(rf.val) || rf.val < 1 || rf.val > 5) {
          return res.status(400).json({ error: `${rf.name} must be an integer between 1 and 5` });
        }
        updateData[rf.key] = rf.val;
      }
    }

    if (recommendation !== undefined) {
      const validRecs = ['STRONG_HIRE', 'HIRE', 'NEUTRAL', 'REJECT', 'STRONG_REJECT'];
      if (!validRecs.includes(recommendation)) {
        return res.status(400).json({ error: `Recommendation must be one of: ${validRecs.join(', ')}` });
      }
      updateData.recommendation = recommendation;
    }

    if (strengths !== undefined) {
      if (typeof strengths !== 'string' || !strengths.trim()) {
        return res.status(400).json({ error: 'Strengths cannot be empty' });
      }
      updateData.strengths = strengths.trim();
    }

    if (concerns !== undefined) {
      if (typeof concerns !== 'string' || !concerns.trim()) {
        return res.status(400).json({ error: 'Concerns cannot be empty' });
      }
      updateData.concerns = concerns.trim();
    }

    if (comments !== undefined) {
      updateData.comments = typeof comments === 'string' ? comments.trim() : null;
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { interviewId: id },
      data: updateData,
      include: { interviewer: { select: { id: true, email: true, role: true } } }
    });

    res.json({ success: true, feedback: updatedFeedback });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


