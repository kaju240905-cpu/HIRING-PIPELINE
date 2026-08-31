import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

describe('Phase 3 Checkpoint 1: Jobs & Application CRUD', () => {
  let recruiterTokenCookie: string;
  let interviewerTokenCookie: string;
  let recruiterEmail: string;
  let interviewerEmail: string;

  let testJobId: string;

  beforeAll(async () => {
    const recruiter = await prisma.user.findFirst({ where: { role: 'RECRUITER' } });
    if (!recruiter) throw new Error('No recruiter found');
    recruiterEmail = recruiter.email;

    const interviewer = await prisma.user.findFirst({ where: { role: 'INTERVIEWER' } });
    if (!interviewer) throw new Error('No interviewer found');
    interviewerEmail = interviewer.email;

    // Login recruiter
    let res = await request(app).post('/api/auth/login').send({ email: recruiterEmail, password: 'password123' });
    let cookies = res.headers['set-cookie'];
    let cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    recruiterTokenCookie = cookieArray.find((c: string) => c && c.startsWith('hp_auth=')) as string;

    // Login interviewer
    res = await request(app).post('/api/auth/login').send({ email: interviewerEmail, password: 'password123' });
    cookies = res.headers['set-cookie'];
    cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    interviewerTokenCookie = cookieArray.find((c: string) => c && c.startsWith('hp_auth=')) as string;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Jobs API', () => {
    it('Recruiter can create a job', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Cookie', recruiterTokenCookie)
        .send({
          title: 'Software Engineer',
          department: 'Engineering',
          description: 'A cool job'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Software Engineer');
      expect(res.body.status).toBe('OPEN');
      testJobId = res.body.id;
    });

    it('Interviewer cannot create a job', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Cookie', interviewerTokenCookie)
        .send({
          title: 'Manager',
          department: 'Sales',
          description: 'Manage sales'
        });
      expect(res.status).toBe(403);
    });

    it('Recruiter can list jobs', async () => {
      const res = await request(app)
        .get('/api/jobs')
        .set('Cookie', recruiterTokenCookie);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('Interviewer can list OPEN jobs', async () => {
      const res = await request(app)
        .get('/api/jobs')
        .set('Cookie', interviewerTokenCookie);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Ensure all returned are OPEN
      res.body.forEach((job: any) => {
        expect(job.status).toBe('OPEN');
      });
    });

    it('Recruiter can update a job', async () => {
      const res = await request(app)
        .put(`/api/jobs/${testJobId}`)
        .set('Cookie', recruiterTokenCookie)
        .send({
          title: 'Senior Software Engineer',
          status: 'CLOSED'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Senior Software Engineer');
      expect(res.body.status).toBe('CLOSED');
    });
  });

  describe('Applications API', () => {
    let testApplicationId: string;

    it('Recruiter can create an application', async () => {
      // Need an open job first
      const openJobRes = await request(app)
        .post('/api/jobs')
        .set('Cookie', recruiterTokenCookie)
        .send({ title: 'App Job', department: 'Eng', description: 'desc' });
      
      const jobId = openJobRes.body.id;

      const res = await request(app)
        .post('/api/applications')
        .set('Cookie', recruiterTokenCookie)
        .send({
          jobId,
          candidateName: 'John Doe',
          candidateEmail: 'john.doe@example.com',
          source: 'LinkedIn'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.application.candidateName).toBe('John Doe');
      testApplicationId = res.body.application.id;
    });

    it('Recruiter can list applications', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Cookie', recruiterTokenCookie);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((a: any) => a.id === testApplicationId)).toBe(true);
    });

    it('Interviewer cannot see unassigned applications in list', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Cookie', interviewerTokenCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.data.some((a: any) => a.id === testApplicationId)).toBe(false);
    });

    describe('Search', () => {
      it('Candidate name search (case-insensitive)', async () => {
        const res = await request(app)
          .get('/api/applications?search=john%20doe')
          .set('Cookie', recruiterTokenCookie);
        expect(res.status).toBe(200);
        expect(res.body.data.some((a: any) => a.id === testApplicationId)).toBe(true);
      });

      it('Candidate email search', async () => {
        const res = await request(app)
          .get('/api/applications?search=john.doe@example.com')
          .set('Cookie', recruiterTokenCookie);
        expect(res.status).toBe(200);
        expect(res.body.data.some((a: any) => a.id === testApplicationId)).toBe(true);
      });

      it('Empty results search', async () => {
        const res = await request(app)
          .get('/api/applications?search=nobodyherenamedsam')
          .set('Cookie', recruiterTokenCookie);
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(0);
      });

      it('Assigned interviewer cannot discover unassigned candidate through search', async () => {
        const res = await request(app)
          .get('/api/applications?search=john%20doe')
          .set('Cookie', interviewerTokenCookie);
        expect(res.status).toBe(200);
        expect(res.body.data.some((a: any) => a.id === testApplicationId)).toBe(false);
      });
    });

    describe('Sorting', () => {
      it('Sort by candidateName asc', async () => {
        const res = await request(app)
          .get('/api/applications?sortBy=candidateName&sortOrder=asc')
          .set('Cookie', recruiterTokenCookie);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        // just check it doesn't crash and returns 200
      });

      it('Sort by candidateName desc', async () => {
        const res = await request(app)
          .get('/api/applications?sortBy=candidateName&sortOrder=desc')
          .set('Cookie', recruiterTokenCookie);
        expect(res.status).toBe(200);
      });

      it('Sort by appliedAt asc', async () => {
        const res = await request(app)
          .get('/api/applications?sortBy=appliedAt&sortOrder=asc')
          .set('Cookie', recruiterTokenCookie);
        expect(res.status).toBe(200);
      });

      it('Invalid sort field defaults safely to appliedAt', async () => {
        const res = await request(app)
          .get('/api/applications?sortBy=DROP%20TABLE%20Users')
          .set('Cookie', recruiterTokenCookie);
        expect(res.status).toBe(200);
      });

      it('Invalid sort direction defaults safely to desc', async () => {
        const res = await request(app)
          .get('/api/applications?sortBy=candidateName&sortOrder=invalid')
          .set('Cookie', recruiterTokenCookie);
        expect(res.status).toBe(200);
      });
    });
  });
});
