import { Request, Response } from 'express';
import { prisma } from '../db';
import { ApplicationStatus } from '@prisma/client';

const escapeCsvField = (field: string | null | undefined): string => {
  if (!field) return '';
  const stringField = String(field);
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

export const exportApplicationsCsv = async (req: any, res: Response) => {
  try {
    const isRecruiter = req.user.role === 'RECRUITER';
    const userId = req.user.userId;

    let applications;
    
    if (isRecruiter) {
      applications = await prisma.application.findMany({
        include: { job: true }
      });
    } else {
      const assignedApps = await prisma.interviewerAssignment.findMany({
        where: { interviewerId: userId },
        select: { applicationId: true }
      });
      const assignedAppIds = assignedApps.map(a => a.applicationId);
      
      applications = await prisma.application.findMany({
        where: { id: { in: assignedAppIds } },
        include: { job: true }
      });
    }

    const headers = ['ID', 'Candidate Name', 'Candidate Email', 'Job Title', 'Stage', 'Status', 'Applied At'];
    const rows = applications.map(app => [
      escapeCsvField(app.id),
      escapeCsvField(app.candidateName),
      escapeCsvField(app.candidateEmail),
      escapeCsvField(app.job?.title),
      escapeCsvField(app.currentStage),
      escapeCsvField(app.status),
      escapeCsvField(app.appliedAt.toISOString())
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
    res.send(csvContent);

  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
};
