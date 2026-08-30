import { PrismaClient, Role, JobStatus, ApplicationStage, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@example.com' },
    update: {},
    create: {
      email: 'recruiter@example.com',
      passwordHash,
      role: Role.RECRUITER
    }
  });

  const interviewer1 = await prisma.user.upsert({
    where: { email: 'interviewer1@example.com' },
    update: {},
    create: {
      email: 'interviewer1@example.com',
      passwordHash,
      role: Role.INTERVIEWER
    }
  });

  const interviewer2 = await prisma.user.upsert({
    where: { email: 'interviewer2@example.com' },
    update: {},
    create: {
      email: 'interviewer2@example.com',
      passwordHash,
      role: Role.INTERVIEWER
    }
  });

  // 2. Create Job Openings
  const job1 = await prisma.jobOpening.create({
    data: {
      title: 'Software Engineer',
      department: 'Engineering',
      description: 'Backend Go developer',
      status: JobStatus.OPEN
    }
  });

  const job2 = await prisma.jobOpening.create({
    data: {
      title: 'Sales Representative',
      department: 'Sales',
      description: 'B2B enterprise sales',
      status: JobStatus.CLOSED
    }
  });

  // 3. Create Applications
  const app1 = await prisma.application.create({
    data: {
      jobId: job1.id,
      candidateName: 'Alice Smith',
      candidateEmail: 'alice@example.com',
      source: 'LinkedIn',
      currentStage: ApplicationStage.APPLIED,
      status: ApplicationStatus.ACTIVE,
      history: {
        create: {
          actorId: recruiter.id,
          actionType: 'CREATED'
        }
      }
    }
  });

  const app2 = await prisma.application.create({
    data: {
      jobId: job1.id,
      candidateName: 'Bob Jones',
      candidateEmail: 'bob@example.com',
      source: 'Referral',
      currentStage: ApplicationStage.INTERVIEW,
      status: ApplicationStatus.ACTIVE,
      history: {
        create: [
          { actorId: recruiter.id, actionType: 'CREATED' },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'APPLIED', newStage: 'SCREENING' },
          { actorId: recruiter.id, actionType: 'STAGE_ADVANCED', oldStage: 'SCREENING', newStage: 'INTERVIEW' }
        ]
      },
      assignments: {
        create: [
          { interviewerId: interviewer1.id }
        ]
      }
    }
  });

  console.log('Seed completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
