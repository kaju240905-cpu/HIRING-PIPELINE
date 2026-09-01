import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

export default async function teardown() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Running global teardown to clean up test data...');
  
  const targetJobTitles = ['App Job', 'CP3 Test Job', 'Pipeline Test Job', 'Senior Software Engineer'];
  const targetAppEmails = ['pipeline@example.com', 'reject@example.com', 'conc@example.com', 'test@example.com', 'cp3active@example.com', 'stalled@example.com', 'notstalled@example.com', 'john.doe@example.com'];

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
    console.log(`Cleaned up ${jobIds.length} test jobs and ${appIds.length} test applications.`);
  } else {
    console.log('No test data found to clean up.');
  }

  await prisma.$disconnect();
  await pool.end();
}
