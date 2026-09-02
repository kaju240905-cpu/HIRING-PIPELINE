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
  console.log('Starting seed-more...');

  const recruiter = await prisma.user.findUnique({ where: { email: 'recruiter@example.com' } });
  if (!recruiter) throw new Error("Recruiter not found, run normal seed first.");

  const job1 = await prisma.jobOpening.create({
    data: {
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      description: 'Looking for a Node.js and PostgreSQL expert.',
      status: JobStatus.OPEN
    }
  });

  const job2 = await prisma.jobOpening.create({
    data: {
      title: 'Product Manager',
      department: 'Product',
      description: 'Lead product strategy for our new B2B tools.',
      status: JobStatus.OPEN
    }
  });

  const job3 = await prisma.jobOpening.create({
    data: {
      title: 'UX Designer',
      department: 'Design',
      description: 'Create beautiful user experiences.',
      status: JobStatus.OPEN
    }
  });

  const now = new Date();
  const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pastTwoDays = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // Add 10 varied applications
  const candidates = [
    { name: 'John Doe', email: 'john@example.com', job: job1.id, stage: ApplicationStage.APPLIED, status: ApplicationStatus.ACTIVE },
    { name: 'Jane Smith', email: 'jane@example.com', job: job1.id, stage: ApplicationStage.SCREENING, status: ApplicationStatus.ACTIVE },
    { name: 'Michael Johnson', email: 'mjohnson@example.com', job: job2.id, stage: ApplicationStage.INTERVIEW, status: ApplicationStatus.ACTIVE },
    { name: 'Emily Davis', email: 'emilyd@example.com', job: job2.id, stage: ApplicationStage.OFFER, status: ApplicationStatus.ACTIVE },
    { name: 'William Brown', email: 'wbrown@example.com', job: job3.id, stage: ApplicationStage.HIRED, status: ApplicationStatus.ACTIVE },
    { name: 'Sarah Wilson', email: 'swilson@example.com', job: job1.id, stage: ApplicationStage.SCREENING, status: ApplicationStatus.REJECTED },
    { name: 'David Miller', email: 'dmiller@example.com', job: job2.id, stage: ApplicationStage.APPLIED, status: ApplicationStatus.ACTIVE },
    { name: 'Jessica Taylor', email: 'jtaylor@example.com', job: job3.id, stage: ApplicationStage.INTERVIEW, status: ApplicationStatus.ACTIVE },
    { name: 'James Anderson', email: 'janderson@example.com', job: job1.id, stage: ApplicationStage.OFFER, status: ApplicationStatus.ACTIVE },
    { name: 'Amanda Thomas', email: 'athomas@example.com', job: job2.id, stage: ApplicationStage.SCREENING, status: ApplicationStatus.ACTIVE }
  ];

  for (const c of candidates) {
    await prisma.application.create({
      data: {
        jobId: c.job,
        candidateName: c.name,
        candidateEmail: c.email,
        source: ['LinkedIn', 'Website', 'Referral', 'Indeed', 'Direct'][Math.floor(Math.random() * 5)],
        currentStage: c.stage,
        status: c.status,
        appliedAt: pastWeek,
        stageEnteredAt: pastTwoDays,
        history: {
          create: { actorId: recruiter.id, actionType: 'CREATED', createdAt: pastWeek }
        }
      }
    });
  }

  console.log('Added 3 new jobs and 10 new applications successfully.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
