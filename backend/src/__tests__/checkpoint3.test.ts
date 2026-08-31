import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

describe('Phase 3 Checkpoint 3', () => {
  let recruiterTokenCookie: string;
  let interviewerTokenCookie: string;
  let unassignedInterviewerCookie: string;

  let testJobId: string;
  let activeAppId: string;
  let interviewerId: string;
  let unassignedInterviewerId: string;

  beforeAll(async () => {
    // 1. Get users
    const recruiter = await prisma.user.findFirst({ where: { role: 'RECRUITER' } });
    if (!recruiter) throw new Error('No recruiter found');

    const interviewers = await prisma.user.findMany({ where: { role: 'INTERVIEWER' }, take: 2 });
    if (interviewers.length < 2) throw new Error('Need at least 2 interviewers');
    interviewerId = interviewers[0].id;
    unassignedInterviewerId = interviewers[1].id;

    // 2. Login
    let res = await request(app).post('/api/auth/login').send({ email: recruiter.email, password: 'password123' });
    let cookies = res.headers['set-cookie'];
    let cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    recruiterTokenCookie = cookieArray.find((c: string) => c && c.startsWith('hp_auth=')) as string;

    res = await request(app).post('/api/auth/login').send({ email: interviewers[0].email, password: 'password123' });
    cookies = res.headers['set-cookie'];
    cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    interviewerTokenCookie = cookieArray.find((c: string) => c && c.startsWith('hp_auth=')) as string;

    res = await request(app).post('/api/auth/login').send({ email: interviewers[1].email, password: 'password123' });
    cookies = res.headers['set-cookie'];
    cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    unassignedInterviewerCookie = cookieArray.find((c: string) => c && c.startsWith('hp_auth=')) as string;

    // 3. Create job
    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Cookie', recruiterTokenCookie)
      .send({ title: 'CP3 Test Job', department: 'Eng', description: 'test' });
    testJobId = jobRes.body.id;

    // 4. Create application
    const appRes = await request(app)
      .post('/api/applications')
      .set('Cookie', recruiterTokenCookie)
      .send({ jobId: testJobId, candidateName: 'CP3 Active', candidateEmail: 'cp3active@example.com', source: 'Web' });
    activeAppId = appRes.body.application.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Interviews & Assignments', () => {
    it('Recruiter can assign interviewer', async () => {
      const res = await request(app)
        .post(`/api/applications/${activeAppId}/assign`)
        .set('Cookie', recruiterTokenCookie)
        .send({ interviewerId });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('Interviewer cannot assign interviewer', async () => {
      const res = await request(app)
        .post(`/api/applications/${activeAppId}/assign`)
        .set('Cookie', interviewerTokenCookie)
        .send({ interviewerId: unassignedInterviewerId });
      expect(res.status).toBe(403);
    });

    it('Cannot schedule interview for APPLIED stage', async () => {
      const res = await request(app)
        .post(`/api/applications/${activeAppId}/interviews`)
        .set('Cookie', recruiterTokenCookie)
        .send({ scheduledAt: new Date(Date.now() + 86400000).toISOString() });
      expect(res.status).toBe(400);
    });

    it('Recruiter advances application to INTERVIEW stage', async () => {
      const appRecord = await prisma.application.findUnique({ where: { id: activeAppId } });
      await request(app)
        .post(`/api/applications/${activeAppId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: appRecord?.version, nextStage: 'SCREENING' });
      
      const appRecord2 = await prisma.application.findUnique({ where: { id: activeAppId } });
      await request(app)
        .post(`/api/applications/${activeAppId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: appRecord2?.version, nextStage: 'INTERVIEW' });
    });

    it('Recruiter can schedule interview for INTERVIEW stage', async () => {
      const res = await request(app)
        .post(`/api/applications/${activeAppId}/interviews`)
        .set('Cookie', recruiterTokenCookie)
        .send({ scheduledAt: new Date(Date.now() + 86400000).toISOString() });
      expect(res.status).toBe(200);
      expect(res.body.interview).toBeDefined();
    });

    it('Interviewer cannot schedule interview', async () => {
      const res = await request(app)
        .post(`/api/applications/${activeAppId}/interviews`)
        .set('Cookie', interviewerTokenCookie)
        .send({ scheduledAt: new Date(Date.now() + 86400000).toISOString() });
      expect(res.status).toBe(403);
    });
  });

  describe('Feedback & Authorization', () => {
    it('Unassigned interviewer receives 403 on feedback submission', async () => {
      const res = await request(app)
        .post(`/api/applications/${activeAppId}/feedback`)
        .set('Cookie', unassignedInterviewerCookie)
        .send({ notes: 'Great candidate' });
      expect(res.status).toBe(403);
    });

    it('Assigned interviewer can submit feedback', async () => {
      const res = await request(app)
        .post(`/api/applications/${activeAppId}/feedback`)
        .set('Cookie', interviewerTokenCookie)
        .send({ notes: 'Great candidate' });
      expect(res.status).toBe(200);
      expect(res.body.history).toBeDefined();
      expect(res.body.history.actionType).toBe('FEEDBACK_ADDED');
      expect(res.body.history.notes).toBe('Great candidate');
    });

    it('Recruiter can submit feedback', async () => {
      const res = await request(app)
        .post(`/api/applications/${activeAppId}/feedback`)
        .set('Cookie', recruiterTokenCookie)
        .send({ notes: 'Recruiter feedback' });
      expect(res.status).toBe(200);
    });
  });

  describe('Stalled Alerts', () => {
    let stalledAppId: string;
    let notStalledAppId: string;

    beforeAll(async () => {
      // Create test applications
      const stalledAppRes = await request(app)
        .post('/api/applications')
        .set('Cookie', recruiterTokenCookie)
        .send({ jobId: testJobId, candidateName: 'Stalled', candidateEmail: 'stalled@example.com', source: 'Web' });
      stalledAppId = stalledAppRes.body.application.id;

      const notStalledAppRes = await request(app)
        .post('/api/applications')
        .set('Cookie', recruiterTokenCookie)
        .send({ jobId: testJobId, candidateName: 'Not Stalled', candidateEmail: 'notstalled@example.com', source: 'Web' });
      notStalledAppId = notStalledAppRes.body.application.id;

      // Force stageEnteredAt to 11 days ago for stalledApp
      const elevenDaysAgo = new Date();
      elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);
      await prisma.application.update({
        where: { id: stalledAppId },
        data: { stageEnteredAt: elevenDaysAgo }
      });

      // Force stageEnteredAt to exactly 10 days ago (well, 10 days less 1 minute) for notStalledApp
      const almostTenDaysAgo = new Date();
      almostTenDaysAgo.setDate(almostTenDaysAgo.getDate() - 10);
      almostTenDaysAgo.setMinutes(almostTenDaysAgo.getMinutes() + 1); // Not quite 10 days yet
      await prisma.application.update({
        where: { id: notStalledAppId },
        data: { stageEnteredAt: almostTenDaysAgo }
      });
    });

    it('Identifies stalled applications (more than 10 days)', async () => {
      const res = await request(app)
        .get('/api/applications/stalled')
        .set('Cookie', recruiterTokenCookie);
      
      expect(res.status).toBe(200);
      const apps = res.body.applications;
      const foundStalled = apps.find((a: any) => a.id === stalledAppId);
      expect(foundStalled).toBeDefined();

      const foundNotStalled = apps.find((a: any) => a.id === notStalledAppId);
      expect(foundNotStalled).toBeUndefined(); // because it's not quite 10 days
    });

    it('Recruiter can dismiss a stalled alert', async () => {
      const res = await request(app)
        .post(`/api/applications/${stalledAppId}/stalled/dismiss`)
        .set('Cookie', recruiterTokenCookie);
      expect(res.status).toBe(200);

      // Verify it no longer appears in stalled list
      const listRes = await request(app)
        .get('/api/applications/stalled')
        .set('Cookie', recruiterTokenCookie);
      const apps = listRes.body.applications;
      expect(apps.find((a: any) => a.id === stalledAppId)).toBeUndefined();
    });

    it('New stage period resets stalled alert despite previous dismissal', async () => {
      // Advance stalledAppId to next stage
      const appRecord = await prisma.application.findUnique({ where: { id: stalledAppId } });
      const advRes = await request(app)
        .post(`/api/applications/${stalledAppId}/advance`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: appRecord?.version, nextStage: 'SCREENING' });
      expect(advRes.status).toBe(200);

      // Verify it is NOT stalled now
      let listRes = await request(app)
        .get('/api/applications/stalled')
        .set('Cookie', recruiterTokenCookie);
      let apps = listRes.body.applications;
      expect(apps.find((a: any) => a.id === stalledAppId)).toBeUndefined();

      // Force stageEnteredAt to 11 days ago again
      const elevenDaysAgo = new Date();
      elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);
      await prisma.application.update({
        where: { id: stalledAppId },
        data: { stageEnteredAt: elevenDaysAgo }
      });

      // Verify it IS stalled again (the previous dismissal was tied to the old stage)
      listRes = await request(app)
        .get('/api/applications/stalled')
        .set('Cookie', recruiterTokenCookie);
      apps = listRes.body.applications;
      expect(apps.find((a: any) => a.id === stalledAppId)).toBeDefined();
    });

    it('Rejected applications do not appear as stalled', async () => {
      const appRecord = await prisma.application.findUnique({ where: { id: stalledAppId } });
      const rejRes = await request(app)
        .post(`/api/applications/${stalledAppId}/reject`)
        .set('Cookie', recruiterTokenCookie)
        .send({ expectedVersion: appRecord?.version, notes: 'rejected' });
      expect(rejRes.status).toBe(200);

      const listRes = await request(app)
        .get('/api/applications/stalled')
        .set('Cookie', recruiterTokenCookie);
      const apps = listRes.body.applications;
      expect(apps.find((a: any) => a.id === stalledAppId)).toBeUndefined();
    });
  });
});
