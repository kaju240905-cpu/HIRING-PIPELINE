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

describe('Phase 3 Checkpoint 2: Pipeline & Concurrency', () => {
  let recruiterTokenCookie: string;
  let interviewerTokenCookie: string;
  
  let testJobId: string;
  let testApplicationId: string;
  let testVersion: number = 1;
  let interviewerId: string;

  beforeAll(async () => {
    const recruiter = await prisma.user.findFirst({ where: { role: 'RECRUITER' } });
    if (!recruiter) throw new Error('No recruiter found');

    const interviewer = await prisma.user.findFirst({ where: { role: 'INTERVIEWER' } });
    if (!interviewer) throw new Error('No interviewer found');
    interviewerId = interviewer.id;

    // Login recruiter
    let res = await request(app).post('/api/auth/login').send({ email: recruiter.email, password: 'password123' });
    let cookies = res.headers['set-cookie'];
    let cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    recruiterTokenCookie = cookieArray.find((c: string) => c && c.startsWith('hp_auth=')) as string;

    // Login interviewer
    res = await request(app).post('/api/auth/login').send({ email: interviewer.email, password: 'password123' });
    cookies = res.headers['set-cookie'];
    cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    interviewerTokenCookie = cookieArray.find((c: string) => c && c.startsWith('hp_auth=')) as string;

    // Create a job for testing
    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Cookie', recruiterTokenCookie)
      .send({ title: 'Pipeline Test Job', department: 'Eng', description: 'test' });
    testJobId = jobRes.body.id;

    // Create an application
    const appRes = await request(app)
      .post('/api/applications')
      .set('Cookie', recruiterTokenCookie)
      .send({ jobId: testJobId, candidateName: 'Pipeline Test', candidateEmail: 'pipeline@example.com', source: 'Web' });
    testApplicationId = appRes.body.application.id;
    testVersion = appRes.body.application.version; // should be 1
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Forward Transitions', () => {
    it('Cannot skip a stage (APPLIED -> INTERVIEW)', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApplicationId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: testVersion, nextStage: 'INTERVIEW' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid forward transition');
    });

    it('Advances from APPLIED to SCREENING correctly', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApplicationId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: testVersion, nextStage: 'SCREENING' });
      
      expect(res.status).toBe(200);
      testVersion++;
    });

    it('Creates history for successful advance', async () => {
      const appRecord = await prisma.application.findUnique({
        where: { id: testApplicationId },
        include: { history: true }
      });
      expect(appRecord?.history.some(h => h.actionType === 'STAGE_ADVANCED' && h.newStage === 'SCREENING')).toBe(true);
    });

    it('Cannot do backward transition (SCREENING -> APPLIED)', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApplicationId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: testVersion, nextStage: 'APPLIED' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid forward transition');
    });

    it('Advances from SCREENING to INTERVIEW correctly', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApplicationId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ 
          expectedVersion: testVersion, 
          nextStage: 'INTERVIEW',
          notes: 'Test evaluation notes',
          interviewerId: interviewerId,
          scheduledAt: new Date().toISOString()
        });
      expect(res.status).toBe(200);
      testVersion++;
    });

    it('Advances from INTERVIEW to OFFER correctly', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApplicationId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: testVersion, nextStage: 'OFFER' });
      expect(res.status).toBe(200);
      testVersion++;
    });

    it('Advances from OFFER to HIRED correctly', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApplicationId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: testVersion, nextStage: 'HIRED' });
      expect(res.status).toBe(200);
      testVersion++;
    });

    it('Cannot transition after HIRED', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApplicationId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: testVersion, nextStage: 'SCREENING' });
      
      expect(res.status).toBe(400);
    });
  });

  describe('Rejection and Reinstatement', () => {
    let testApp2: string;
    let testApp2Version: number;

    beforeAll(async () => {
      const appRes = await request(app)
        .post('/api/applications')
        .set('Cookie', recruiterTokenCookie)
        .send({ jobId: testJobId, candidateName: 'Reject Test', candidateEmail: 'reject@example.com', source: 'Web' });
      testApp2 = appRes.body.application.id;
      testApp2Version = appRes.body.application.version;
    });

    it('Interviewer cannot reject (receives 403)', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApp2}/reject`)
        .set('Cookie', interviewerTokenCookie)
        .send({ expectedVersion: testApp2Version });
      expect(res.status).toBe(403);
    });

    it('Recruiter can reject application', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApp2}/reject`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: testApp2Version, notes: 'Not a fit' });
      
      expect(res.status).toBe(200);
      testApp2Version++;

      const appRecord = await prisma.application.findUnique({ where: { id: testApp2 }, include: { history: true } });
      expect(appRecord?.status).toBe('REJECTED');
      expect(appRecord?.history.some(h => h.actionType === 'REJECTED')).toBe(true);
    });

    it('Cannot advance a rejected application', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApp2}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: testApp2Version, nextStage: 'SCREENING' });
      
      expect(res.status).toBe(400);
    });

    it('Non-rejected application cannot be reinstated', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApplicationId}/reinstate`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: testVersion });
      expect(res.status).toBe(400);
    });

    it('Rejected application can be reinstated', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApp2}/reinstate`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: testApp2Version, notes: 'Second chance' });
      
      expect(res.status).toBe(200);
      testApp2Version++;

      const appRecord = await prisma.application.findUnique({ where: { id: testApp2 }, include: { history: true } });
      expect(appRecord?.status).toBe('ACTIVE');
      expect(appRecord?.history.some(h => h.actionType === 'REINSTATED')).toBe(true);
    });
  });

  describe('Optimistic Concurrency', () => {
    it('Creates realistic concurrency conflict', async () => {
      const appRes = await request(app)
        .post('/api/applications')
        .set('Cookie', recruiterTokenCookie)
        .send({ jobId: testJobId, candidateName: 'Concurrency Test', candidateEmail: 'conc@example.com', source: 'Web' });
      
      const cAppId = appRes.body.application.id;
      const initialVersion = appRes.body.application.version;

      // Simulate two concurrent requests with the exact same expectedVersion
      const promise1 = request(app)
        .post(`/api/applications/${cAppId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: initialVersion, nextStage: 'SCREENING' });
      
      const promise2 = request(app)
        .post(`/api/applications/${cAppId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: initialVersion, nextStage: 'SCREENING' });
      
      const [res1, res2] = await Promise.all([promise1, promise2]);

      // Exactly ONE succeeds (200), ONE fails with conflict (409)
      const statuses = [res1.status, res2.status].sort();
      expect(statuses[0]).toBe(200);
      expect(statuses[1]).toBe(409);

      // Verify version incremented EXACTLY ONCE
      const finalApp = await prisma.application.findUnique({ where: { id: cAppId }, include: { history: true } });
      expect(finalApp?.version).toBe(initialVersion + 1);

      // Verify history only contains ONE STAGE_ADVANCED record
      const advanceHistories = finalApp?.history.filter(h => h.actionType === 'STAGE_ADVANCED');
      expect(advanceHistories?.length).toBe(1);
    });
  });
});
