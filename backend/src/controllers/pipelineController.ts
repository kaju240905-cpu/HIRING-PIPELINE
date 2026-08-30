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
  res.status(501).json({ error: 'Not implemented (Phase 3)' });
};

export const rejectApplication = async (req: any, res: Response) => {
  res.status(501).json({ error: 'Not implemented (Phase 3)' });
};

export const reinstateApplication = async (req: any, res: Response) => {
  res.status(501).json({ error: 'Not implemented (Phase 3)' });
};
