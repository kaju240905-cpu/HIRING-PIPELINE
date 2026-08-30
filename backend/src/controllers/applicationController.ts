import { Request, Response } from 'express';
import { PrismaClient, JobStatus } from '@prisma/client';
import { prisma } from '../db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createApplication = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented (Phase 3)' });
};

export const listApplications = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented (Phase 3)' });
};

export const getApplicationById = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented (Phase 3)' });
};
