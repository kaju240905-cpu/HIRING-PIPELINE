import { Request, Response } from 'express';
import { prisma } from '../db';
import { JobStatus, Role } from '@prisma/client';

export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, department, description } = req.body;

    if (!title || !department || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await prisma.jobOpening.create({
      data: {
        title,
        department,
        description,
        status: JobStatus.OPEN
      }
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, department, description, status } = req.body;

    if (status && !Object.values(JobStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const job = await prisma.jobOpening.update({
      where: { id: String(id) },
      data: {
        title: title ? String(title) : undefined,
        department: department ? String(department) : undefined,
        description: description ? String(description) : undefined,
        status: status as JobStatus | undefined
      }
    });

    res.json(job);
  } catch (error: any) {
    if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Job not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listJobs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let whereClause: any = {};

    // Interviewers can only see OPEN jobs, Recruiters can see all.
    // (We also allow them to see closed/archived jobs if they have assigned applications, 
    // but the basic list is usually just OPEN for interviewers)
    if (user.role === Role.INTERVIEWER) {
      whereClause.status = JobStatus.OPEN;
    }

    const jobs = await prisma.jobOpening.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
