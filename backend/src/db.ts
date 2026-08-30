import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

// Create a single shared PostgreSQL connection pool
export const pool = new Pool({ connectionString });

// Create the PrismaPg adapter using the shared pool
const adapter = new PrismaPg(pool);

// Instantiate the single shared PrismaClient instance
export const prisma = new PrismaClient({ adapter });

// Optional: Graceful shutdown handling for the pool and Prisma
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});
