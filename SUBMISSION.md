# Hiring Pipeline Project Submission

## 1. Overview
This project is a complete Hiring Pipeline system that allows recruiters to manage job openings, track candidates through various pipeline stages, and assign interviewers. It also features a scoped interviewer dashboard where interviewers can view assigned candidates and submit feedback securely.

## 2. Live Deployment
*(Add your live URL here if deploying)*
**Frontend URL:** 
**Backend API URL:** 

## 3. GitHub Repository
**Repository:** https://github.com/kaju240905-cpu/HIRING-PIPELINE.git

## 4. Demo Credentials

The database is seeded with several test accounts to verify role-based permissions and dashboard scoping.

### Recruiter Account
Has full access to job creation, candidate advancement, and global dashboards.
- **Email:** `recruiter@example.com`
- **Password:** `password123`

### Interviewer Accounts
Can only see candidates explicitly assigned to them for interviews, and can only submit feedback for their own interviews.
- **Email:** `int1@example.com`
- **Password:** `password123`

- **Email:** `int2@example.com`
- **Password:** `password123`

## 5. Running Locally

To run the project locally from scratch:

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Setup Database:**
   Ensure PostgreSQL is running locally, then in the `backend` directory:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
   *(This will create the schema and populate the demo credentials above).*

3. **Start the applications:**
   Backend: `cd backend && npx tsx src/index.ts`
   Frontend: `cd frontend && npm run dev`

## 6. Project Highlights
- **Atomic Transactions:** Stage advancements and interview assignments are handled atomically to prevent orphaned states.
- **Optimistic Concurrency:** Application records use version control to prevent race conditions when multiple recruiters update the same candidate simultaneously.
- **Role-Based Access Control (RBAC):** All restricted actions (like an interviewer trying to submit feedback for someone else's interview) are strictly blocked at the API level with 403 errors.
- **Immutable History:** A full audit log is generated automatically for all pipeline movements, and feedback cannot be modified once submitted.
