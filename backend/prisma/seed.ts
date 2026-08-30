import { PrismaClient, Role, JobStatus, ApplicationStage, ApplicationStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@example.com' },
    update: {},
    create: { email: 'recruiter@example.com', passwordHash, role: Role.RECRUITER }
  });

  const i1 = await prisma.user.upsert({
    where: { email: 'int1@example.com' },
    update: {},
    create: { email: 'int1@example.com', passwordHash, role: Role.INTERVIEWER }
  });

  const i2 = await prisma.user.upsert({
    where: { email: 'int2@example.com' },
    update: {},
    create: { email: 'int2@example.com', passwordHash, role: Role.INTERVIEWER }
  });

  const i3 = await prisma.user.upsert({
    where: { email: 'int3@example.com' },
    update: {},
    create: { email: 'int3@example.com', passwordHash, role: Role.INTERVIEWER }
  });

  // 2. Create Job Openings
  const jobOpen = await prisma.jobOpening.create({
    data: {
      title: 'Frontend Developer',
      department: 'Engineering',
      description: 'React and Tailwind expert needed.',
      status: JobStatus.OPEN
    }
  });

  const jobClosed = await prisma.jobOpening.create({
    data: {
      title: 'Sales Representative',
      department: 'Sales',
      description: 'B2B enterprise sales.',
      status: JobStatus.CLOSED
    }
  });

  const jobArchived = await prisma.jobOpening.create({
    data: {
      title: 'Legacy Support Staff',
      department: 'Support',
      description: 'Archived role.',
      status: JobStatus.ARCHIVED
    }
  });

  // Calculate Dates
  const now = new Date();
  const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const pastThreeWeeks = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
  const pastTwoWeeks = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pastThreeDays = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const pastTwoDays = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  
  // Next week date to ensure we have one interview OUTSIDE current week
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Date inside current week (since today is Sunday, -2 days is Friday, which is inside this week)
  const currentWeekDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // 3. Create Applications covering all stages & statuses
  // A. APPLIED
  await prisma.application.create({
    data: {
      jobId: jobOpen.id, candidateName: 'Alice Applied', candidateEmail: 'alice@test.com', source: 'LinkedIn',
      currentStage: ApplicationStage.APPLIED, status: ApplicationStatus.ACTIVE,
      appliedAt: pastWeek, stageEnteredAt: pastWeek,
      history: { create: { actorId: recruiter.id, actionType: 'CREATED', createdAt: pastWeek } }
    }
  });

  // B. SCREENING
  await prisma.application.create({
    data: {
      jobId: jobOpen.id, candidateName: 'Bob Screening', candidateEmail: 'bob@test.com', source: 'Website',
      currentStage: ApplicationStage.SCREENING, status: ApplicationStatus.ACTIVE,
      appliedAt: pastMonth, stageEnteredAt: pastWeek,
      history: {
        create: [
          { actorId: recruiter.id, actionType: 'CREATED', createdAt: pastMonth },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'APPLIED', newStage: 'SCREENING', createdAt: pastWeek }
        ]
      }
    }
  });

  // C. INTERVIEW (With multiple interviewers assigned & multiple interviews & feedback)
  const appInterview = await prisma.application.create({
    data: {
      jobId: jobOpen.id, candidateName: 'Charlie Interview', candidateEmail: 'charlie@test.com', source: 'Referral',
      currentStage: ApplicationStage.INTERVIEW, status: ApplicationStatus.ACTIVE, notes: 'Very promising candidate.',
      appliedAt: pastMonth, stageEnteredAt: pastWeek,
      history: {
        create: [
          { actorId: recruiter.id, actionType: 'CREATED', createdAt: pastMonth },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'APPLIED', newStage: 'SCREENING', createdAt: pastThreeWeeks },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'SCREENING', newStage: 'INTERVIEW', createdAt: pastWeek },
          { actorId: i1.id, actionType: 'FEEDBACK_ADDED', stage: 'INTERVIEW', notes: 'Great technical skills, good communication.', createdAt: pastThreeDays }
        ]
      },
      assignments: {
        create: [{ interviewerId: i1.id }, { interviewerId: i2.id }]
      },
      interviews: {
        create: [
          { scheduledAt: currentWeekDate, createdBy: recruiter.id, createdAt: pastWeek }, // Inside current week
          { scheduledAt: futureDate, createdBy: recruiter.id, createdAt: pastWeek } // Outside current week
        ]
      }
    }
  });

  // D. OFFER
  await prisma.application.create({
    data: {
      jobId: jobClosed.id, candidateName: 'Diana Offer', candidateEmail: 'diana@test.com', source: 'Indeed',
      currentStage: ApplicationStage.OFFER, status: ApplicationStatus.ACTIVE,
      appliedAt: pastMonth, stageEnteredAt: pastThreeDays,
      history: {
        create: [
          { actorId: recruiter.id, actionType: 'CREATED', createdAt: pastMonth },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'APPLIED', newStage: 'SCREENING', createdAt: pastThreeWeeks },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'SCREENING', newStage: 'INTERVIEW', createdAt: pastTwoWeeks },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'INTERVIEW', newStage: 'OFFER', createdAt: pastThreeDays }
        ]
      },
      assignments: {
        create: [{ interviewerId: i1.id }]
      }
    }
  });

  // E. HIRED
  await prisma.application.create({
    data: {
      jobId: jobClosed.id, candidateName: 'Eve Hired', candidateEmail: 'eve@test.com', source: 'Internal',
      currentStage: ApplicationStage.HIRED, status: ApplicationStatus.ACTIVE,
      appliedAt: pastMonth, stageEnteredAt: now,
      history: {
        create: [
          { actorId: recruiter.id, actionType: 'CREATED', createdAt: pastMonth },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'APPLIED', newStage: 'SCREENING', createdAt: pastThreeWeeks },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'SCREENING', newStage: 'INTERVIEW', createdAt: pastTwoWeeks },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'INTERVIEW', newStage: 'OFFER', createdAt: pastWeek },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'OFFER', newStage: 'HIRED', createdAt: now }
        ]
      }
    }
  });

  // F. REJECTED (and REINSTATED example)
  await prisma.application.create({
    data: {
      jobId: jobOpen.id, candidateName: 'Frank Rejected', candidateEmail: 'frank@test.com', source: 'LinkedIn',
      currentStage: ApplicationStage.SCREENING, status: ApplicationStatus.REJECTED,
      appliedAt: pastMonth,
      stageEnteredAt: pastTwoDays, // Represents the timestamp of the new reinstated period
      history: {
        create: [
          { actorId: recruiter.id, actionType: 'CREATED', createdAt: pastMonth },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'APPLIED', newStage: 'SCREENING', createdAt: pastThreeWeeks },
          { actorId: recruiter.id, actionType: 'REJECTED', stage: 'SCREENING', createdAt: pastTwoWeeks },
          { actorId: recruiter.id, actionType: 'REINSTATED', stage: 'SCREENING', createdAt: pastTwoDays }, // Reinstatement creates new period
          { actorId: recruiter.id, actionType: 'REJECTED', stage: 'SCREENING', createdAt: now } // Rejected again in new period
        ]
      }
    }
  });

  // G. STALLED ALERT (Explicitly stalled application)
  // Stage entered 15 days ago, so it is >10 days stalled.
  const appStalled = await prisma.application.create({
    data: {
      jobId: jobOpen.id, candidateName: 'Grace Stalled', candidateEmail: 'grace@test.com', source: 'Direct',
      currentStage: ApplicationStage.INTERVIEW, status: ApplicationStatus.ACTIVE,
      appliedAt: pastMonth, stageEnteredAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // Stalled!
      history: {
        create: [
          { actorId: recruiter.id, actionType: 'CREATED', createdAt: pastMonth },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'APPLIED', newStage: 'SCREENING', createdAt: pastThreeWeeks },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'SCREENING', newStage: 'INTERVIEW', createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) }
        ]
      }
    }
  });

  // 4. Stalled Alert Dismissal
  await prisma.stalledAlertDismissal.create({
    data: {
      applicationId: appStalled.id,
      stage: ApplicationStage.INTERVIEW,
      stageEnteredAt: appStalled.stageEnteredAt, // Must match exactly
      dismissedAt: pastTwoDays
    }
  });

  console.log('Comprehensive seed completed successfully.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
