# Submission

## Links

- **GitHub repository:** https://github.com/kaju240905-cpu/HIRING-PIPELINE.git
- **Live application:** https://hiring-pipeline-bay.vercel.app/

## Notes for the reviewer

The backend is hosted on a free Render instance, which spins down after 15 minutes of inactivity. **The very first request (e.g., logging in or loading the initial dashboard) might take 50–60 seconds while the server wakes up.** Please be patient on the first load!

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Recruiter | recruiter@example.com | password123 |
| Interviewer | int1@example.com | password123 |
| Interviewer | int2@example.com | password123 |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | React (Vite) + TailwindCSS | Fast development cycle, excellent component ecosystem, and Tailwind allows rapid UI styling without context-switching to CSS files. |
| Backend | Node.js + Express + TypeScript | Lightweight, unopinionated, and shares types effortlessly with the frontend. |
| Database | PostgreSQL (Neon) via Prisma ORM | Relational data integrity is critical for a pipeline. Prisma provides fantastic type safety and developer experience. |
| Hosting | Vercel (Frontend) + Render (Backend) | Both offer generous free tiers and seamless GitHub integrations for continuous deployment. |

## Goal checklist

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles | Done | Enforced on backend with JWT + Role checks (403 Forbidden). |
| 2 | Job openings | Done | Includes creation, archiving, restoring, and editing jobs. |
| 3 | Applications inside job openings | Done | Tracked with candidate data and notes. |
| 4 | A pipeline with rules | Done | Strict validation on stage advancement; rejected apps can only be reinstated to their exact previous stage. |
| 5 | Interview panel | Done | Interviewers only see candidates explicitly assigned to them. |
| 6 | Finding candidates | Done | Server-side text search, filtering, and pagination implemented via Prisma queries. |
| 7 | Acting on many candidates at once | Done | Bulk advance, bulk reject, and CSV export are fully functional for recruiters. |
| 8 | A dashboard | Done | Tracks headline metrics, active apps, upcoming interviews, and charts. |
| 9 | History you cannot rewrite | Done | Implemented an append-only `ApplicationHistory` log that includes feedback records. |
| 10 | Stalled-application alerts | Done | Flags applications in the same stage for >10 days. Recruiter can dismiss alerts (tracked in DB). |

## How much time did you actually spend?

Roughly 12-14 hours, spread across a few days. The bulk of the time was spent designing the database schema properly to support immutable history, optimistic concurrency control, and ensuring the interviewer scope was absolutely airtight.

## What would you do next, with another 12 hours?

1. **Refactor the Frontend**: Break down the monolithic `App.tsx` into discrete, reusable components (e.g., `CandidateList`, `JobDashboard`, `Modals`). 
2. **Structured Interview Scorecards**: Move away from a single text block for feedback and implement custom rubrics per stage.
3. **Self-Service Scheduling**: Generate unique calendar links for candidates to book their own interview slots directly into the recruiter's calendar.

## What are you least happy with in this codebase, and why?

I am least happy with the frontend architecture. Because I prioritized getting the functionality and API constraints perfectly right on the backend, the React frontend ended up as a massive monolithic `App.tsx` file. While it works and looks good, it violates separation of concerns. In a real-world scenario, this file would be extremely difficult for a team to collaborate on without merge conflicts, and it desperately needs to be refactored into smaller component and context files.
