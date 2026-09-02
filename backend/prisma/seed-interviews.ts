import { PrismaClient, InterviewStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed-interviews...');

  const recruiter = await prisma.user.findUnique({ where: { email: 'recruiter@example.com' } });
  const int1 = await prisma.user.findUnique({ where: { email: 'int1@example.com' } });
  const int2 = await prisma.user.findUnique({ where: { email: 'int2@example.com' } });

  if (!recruiter || !int1 || !int2) throw new Error("Users not found");

  // Get up to 3 applications that are in INTERVIEW stage
  const apps = await prisma.application.findMany({
    where: { currentStage: 'INTERVIEW' },
    take: 3
  });

  if (apps.length === 0) throw new Error("No applications in INTERVIEW stage found.");

  const today = new Date();

  // For each app, assign an interviewer and schedule an interview for today
  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    const interviewer = i % 2 === 0 ? int1 : int2; // alternate between int1 and int2

    // 1. Assign the interviewer (upsert to avoid unique constraint failure)
    const assignment = await prisma.interviewerAssignment.findFirst({
      where: { applicationId: app.id, interviewerId: interviewer.id }
    });
    
    if (!assignment) {
      await prisma.interviewerAssignment.create({
        data: {
          applicationId: app.id,
          interviewerId: interviewer.id
        }
      });
    }

    // 2. Schedule the interview for today
    // Let's stagger them by 1 hour increments today
    const interviewDate = new Date(today.getTime() + (i * 60 * 60 * 1000));
    
    await prisma.interview.create({
      data: {
        applicationId: app.id,
        interviewerId: interviewer.id,
        roundTitle: `Technical Screen - Round ${i + 1}`,
        scheduledAt: interviewDate,
        status: InterviewStatus.SCHEDULED,
        createdBy: recruiter.id
      }
    });
    console.log(`Scheduled interview for application ${app.candidateName} with ${interviewer.email}`);
  }

  console.log('Added 3 new interviews for today successfully.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
