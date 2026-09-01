import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function cleanupTestData(targetJobTitles: string[], targetAppEmails: string[]) {
  const jobsToDelete = await prisma.jobOpening.findMany({ where: { title: { in: targetJobTitles } }});
  const jobIds = jobsToDelete.map(j => j.id);
  
  const appsToDelete = await prisma.application.findMany({ 
    where: { 
      OR: [
        { candidateEmail: { in: targetAppEmails } },
        { jobId: { in: jobIds } }
      ]
    } 
  });

  const appIds = appsToDelete.map(a => a.id);

  if (jobIds.length > 0 || appIds.length > 0) {
    await prisma.$transaction([
      prisma.stalledAlertDismissal.deleteMany({ where: { applicationId: { in: appIds } } }),
      prisma.applicationHistory.deleteMany({ where: { applicationId: { in: appIds } } }),
      prisma.interview.deleteMany({ where: { applicationId: { in: appIds } } }),
      prisma.interviewerAssignment.deleteMany({ where: { applicationId: { in: appIds } } }),
      prisma.application.deleteMany({ where: { id: { in: appIds } } }),
      prisma.jobOpening.deleteMany({ where: { id: { in: jobIds } } })
    ]);
  }
}
