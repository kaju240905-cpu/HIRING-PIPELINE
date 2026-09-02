import { PrismaClient, ApplicationStage, ApplicationStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed-stalled...');

  const recruiter = await prisma.user.findUnique({ where: { email: 'recruiter@example.com' } });
  if (!recruiter) throw new Error("Recruiter not found");

  const jobs = await prisma.jobOpening.findMany({ take: 3 });
  if (jobs.length === 0) throw new Error("No jobs found");

  const now = new Date();
  const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Stalled applications are usually those in a stage for > 10-15 days
  const stalled15Days = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const stalled20Days = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);

  const stalledCandidates = [
    { name: 'Oliver Stalled', email: 'oliver.s@example.com', job: jobs[0].id, stage: ApplicationStage.SCREENING, date: stalled15Days },
    { name: 'Sophia Waiting', email: 'sophia.w@example.com', job: jobs[1 % jobs.length].id, stage: ApplicationStage.INTERVIEW, date: stalled20Days },
    { name: 'Liam Pending', email: 'liam.p@example.com', job: jobs[2 % jobs.length].id, stage: ApplicationStage.APPLIED, date: stalled15Days }
  ];

  for (const c of stalledCandidates) {
    await prisma.application.create({
      data: {
        jobId: c.job,
        candidateName: c.name,
        candidateEmail: c.email,
        source: 'Website',
        currentStage: c.stage,
        status: ApplicationStatus.ACTIVE,
        appliedAt: pastMonth,
        stageEnteredAt: c.date,
        history: {
          create: [
            { actorId: recruiter.id, actionType: 'CREATED', createdAt: pastMonth },
            ...(c.stage !== ApplicationStage.APPLIED ? [{ actorId: recruiter.id, actionType: 'STAGE_ADVANCED' as const, oldStage: ApplicationStage.APPLIED, newStage: c.stage, createdAt: c.date }] : [])
          ]
        }
      }
    });
    console.log(`Added stalled application for ${c.name} in stage ${c.stage}`);
  }

  console.log('Added 3 new stalled applications successfully.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
