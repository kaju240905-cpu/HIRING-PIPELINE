import { Request, Response } from 'express';
import { prisma } from '../db';
import { ApplicationStatus, JobStatus, ApplicationStage } from '@prisma/client';

export const getDashboardMetrics = async (req: any, res: Response) => {
  try {
    const isRecruiter = req.user.role === 'RECRUITER';
    const userId = req.user.userId;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    if (isRecruiter) {
      // Recruiter metrics
      const [
        totalApplications,
        activeApplications,
        rejectedApplications,
        hiredApplications,
        openJobs,
        totalInterviews,
        interviewsThisWeek,
        hiresThisMonth
      ] = await Promise.all([
        prisma.application.count(),
        prisma.application.count({ where: { status: ApplicationStatus.ACTIVE } }),
        prisma.application.count({ where: { status: ApplicationStatus.REJECTED } }),
        prisma.application.count({ where: { currentStage: ApplicationStage.HIRED } }),
        prisma.jobOpening.count({ where: { status: JobStatus.OPEN } }),
        prisma.interview.count(),
        prisma.interview.count({ where: { scheduledAt: { gte: startOfWeek } } }),
        prisma.application.count({ where: { currentStage: ApplicationStage.HIRED, updatedAt: { gte: startOfMonth } } })
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

      // Applications by job
      const appsByJobData = await prisma.application.groupBy({
        by: ['jobId'],
        _count: { id: true },
        where: { status: ApplicationStatus.ACTIVE }
      });
      
      const jobs = await prisma.jobOpening.findMany({ select: { id: true, title: true } });
      const jobMap = jobs.reduce((acc, j) => { acc[j.id] = j.title; return acc; }, {} as Record<string, string>);
      
      const applicationsByJob = appsByJobData.reduce((acc, curr) => {
        acc[jobMap[curr.jobId] || curr.jobId] = curr._count.id;
        return acc;
      }, {} as Record<string, number>);

      // Chart: Applications received per week over the last quarter
      const recentApps = await prisma.application.findMany({
        where: { appliedAt: { gte: threeMonthsAgo } },
        select: { appliedAt: true }
      });
      
      const applicationsPerWeekChart = recentApps.reduce((acc, app) => {
        const d = new Date(app.appliedAt);
        const wStart = new Date(d);
        wStart.setDate(d.getDate() - d.getDay());
        wStart.setHours(0,0,0,0);
        const key = wStart.toISOString().split('T')[0];
        acc[key] = (acc[key] || 0) + 1;
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
        interviewsThisWeek,
        hiresThisMonth,
        applicationsByStage,
        applicationsByJob,
        applicationsPerWeekChart,
        stalledCount
      });
    } else {
      // Interviewer metrics
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      const [
        todayInterviewsCount,
        upcomingInterviewsCount,
        completedInterviewsCount,
        upcomingInterviews,
        todayInterviews
      ] = await Promise.all([
        prisma.interview.count({
          where: {
            interviewerId: userId,
            scheduledAt: { gte: todayStart, lte: todayEnd }
          }
        }),
        prisma.interview.count({
          where: {
            interviewerId: userId,
            status: 'SCHEDULED',
            scheduledAt: { gt: now }
          }
        }),
        prisma.interview.count({
          where: {
            interviewerId: userId,
            status: 'COMPLETED'
          }
        }),
        prisma.interview.findMany({
          where: {
            interviewerId: userId,
            status: 'SCHEDULED',
            scheduledAt: { gt: now }
          },
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
        }),
        prisma.interview.findMany({
          where: {
            interviewerId: userId,
            scheduledAt: { gte: todayStart, lte: todayEnd }
          },
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
        })
      ]);

      return res.json({
        todayInterviewsCount,
        upcomingInterviewsCount,
        completedInterviewsCount,
        upcomingInterviews,
        todayInterviews
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
};
