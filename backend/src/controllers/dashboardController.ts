import { Request, Response } from 'express';
import { prisma } from '../db';
import { ApplicationStatus, JobStatus, ApplicationStage } from '@prisma/client';

export const getDashboardMetrics = async (req: any, res: Response) => {
  try {
    const isRecruiter = req.user.role === 'RECRUITER';
    const userId = req.user.userId;

    if (isRecruiter) {
      // Recruiter metrics
      const [
        totalApplications,
        activeApplications,
        rejectedApplications,
        hiredApplications,
        openJobs,
        totalInterviews
      ] = await Promise.all([
        prisma.application.count(),
        prisma.application.count({ where: { status: ApplicationStatus.ACTIVE } }),
        prisma.application.count({ where: { status: ApplicationStatus.REJECTED } }),
        prisma.application.count({ where: { currentStage: ApplicationStage.HIRED } }),
        prisma.jobOpening.count({ where: { status: JobStatus.OPEN } }),
        prisma.interview.count()
      ]);

      // Applications by stage
      const appsByStageData = await prisma.application.groupBy({
        by: ['currentStage'],
        _count: { id: true },
        where: { status: ApplicationStatus.ACTIVE }
      });
      const applicationsByStage = appsByStageData.reduce((acc, curr) => {
        acc[curr.currentStage] = curr._count.id;
        return acc;
      }, {} as Record<string, number>);

      // Stalled applications logic
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const stalledApps = await prisma.application.findMany({
        where: { status: ApplicationStatus.ACTIVE, stageEnteredAt: { lt: tenDaysAgo } },
        include: { stalledDismissals: true }
      });
      const stalledCount = stalledApps.filter(app => {
        return !app.stalledDismissals.some(d => d.stage === app.currentStage && d.stageEnteredAt.getTime() === app.stageEnteredAt.getTime());
      }).length;

      return res.json({
        totalApplications,
        activeApplications,
        rejectedApplications,
        hiredApplications,
        openJobs,
        totalInterviews,
        applicationsByStage,
        stalledCount
      });
    } else {
      // Interviewer metrics
      const assignedApps = await prisma.interviewerAssignment.findMany({
        where: { interviewerId: userId },
        select: { applicationId: true }
      });
      const assignedAppIds = assignedApps.map(a => a.applicationId);

      const [
        totalAssigned,
        activeAssigned,
        interviewsAssigned
      ] = await Promise.all([
        prisma.application.count({ where: { id: { in: assignedAppIds } } }),
        prisma.application.count({ where: { id: { in: assignedAppIds }, status: ApplicationStatus.ACTIVE } }),
        prisma.interview.count({ where: { applicationId: { in: assignedAppIds } } })
      ]);

      const appsByStageData = await prisma.application.groupBy({
        by: ['currentStage'],
        _count: { id: true },
        where: { id: { in: assignedAppIds }, status: ApplicationStatus.ACTIVE }
      });
      const applicationsByStage = appsByStageData.reduce((acc, curr) => {
        acc[curr.currentStage] = curr._count.id;
        return acc;
      }, {} as Record<string, number>);

      return res.json({
        totalApplications: totalAssigned,
        activeApplications: activeAssigned,
        totalInterviews: interviewsAssigned,
        applicationsByStage
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
};
