

# AI Prompts and AI-Assisted Development

This document describes how AI assistance was used throughout the development of the Hiring Pipeline project, from initial project understanding through implementation, debugging, documentation, and final review.

AI was used as a development assistant to understand requirements, analyze code, generate implementation suggestions, troubleshoot issues, review the project, and prepare technical documentation. AI-generated suggestions were reviewed and adapted during development.

## 1. Understanding the Project Requirements

### Goal

The first use of AI was to understand the project requirements and break the Hiring Pipeline application into manageable development tasks.

### Type of Prompt Used

> Analyze the Hiring Pipeline project requirements and explain what needs to be implemented. Break the project into frontend, backend, database, and business logic requirements.

### AI Assistance

AI helped identify the main parts of the application:

* User roles
* Job openings
* Candidate applications
* Pipeline stages
* Application transitions
* Interview scheduling
* Interviewer assignments
* Application history
* Rejection and reinstatement
* Database consistency

This helped create a clearer development plan before implementing individual features.

---

## 2. Planning the Project Structure

### Goal

AI was used to understand how the project should be organized.

### Type of Prompt Used

> Help me understand the project structure and explain which parts should belong to the frontend, backend, database, and API layers.

### AI Assistance

The project was understood as a client-server application consisting of:

* React frontend
* Express backend
* REST APIs
* Prisma ORM
* PostgreSQL database

The frontend was responsible for displaying information and collecting user input, while the backend handled business rules and database operations.

---

## 3. Understanding and Designing the Database

### Goal

AI was used to understand the data required by the hiring pipeline.

### Type of Prompt Used

> Help me understand the Prisma schema and explain the purpose and relationships of the models in the Hiring Pipeline application.

### AI Assistance

AI helped analyze the following database models:

* `User`
* `JobOpening`
* `Application`
* `InterviewerAssignment`
* `Interview`
* `ApplicationHistory`
* `StalledAlertDismissal`

It also helped explain:

* Primary keys
* Foreign keys
* One-to-many relationships
* Logical many-to-many relationships
* Unique constraints
* Enums
* Application status
* Pipeline stages

---

## 4. Implementing the Backend API

### Goal

AI assistance was used to understand and develop backend functionality.

### Type of Prompt Used

> Explain how the backend controller should handle application pipeline operations, including advancing, rejecting, and reinstating applications.

### AI Assistance

AI helped explain the backend responsibilities, including:

* Receiving API requests
* Validating request data
* Checking the current application state
* Updating application stages
* Handling rejection
* Handling reinstatement
* Recording application history
* Returning appropriate responses

The backend was implemented using Node.js, Express, TypeScript, and Prisma.

---

## 5. Implementing Application Stage Transitions

### Goal

One of the most important parts of the project was managing how candidates move through the hiring pipeline.

### Type of Prompt Used

> Explain how to implement valid application stage transitions and prevent candidates from moving through invalid stages.

### AI Assistance

AI helped explain the idea of treating the hiring pipeline as a state machine.

The backend validates that:

* The application exists
* The application is active
* The requested transition is valid
* Candidates cannot move through invalid stages
* Final-stage applications cannot be advanced incorrectly

This logic was kept on the backend rather than relying only on frontend controls.

---

## 6. Implementing Rejection and Reinstatement

### Goal

AI assistance was used to understand the logic for rejecting and later reinstating an application.

### Type of Prompt Used

> Help me understand how rejection and reinstatement should work in the application pipeline.

### AI Assistance

The implementation includes separate handling for:

* Rejecting an active application
* Updating the application status
* Recording the action in application history
* Reinstating a previously rejected application

This ensures that application status changes remain traceable.

---

## 7. Implementing Interviewer Assignment

### Goal

AI was used to understand how interviewers should be associated with applications.

### Type of Prompt Used

> Explain how interviewer assignment should work with Prisma relationships.

### AI Assistance

The project uses the `InterviewerAssignment` model to connect:

* Applications
* Users acting as interviewers

The composite unique constraint prevents the same interviewer from being assigned to the same application more than once.

---

## 8. Implementing Interview Scheduling

### Goal

AI assistance was used when implementing the requirements for moving an application to the interview stage.

### Type of Prompt Used

> What information should be required when advancing a candidate to the INTERVIEW stage, and how should the backend validate it?

### AI Assistance

The transition to the `INTERVIEW` stage requires additional information.

The implementation validates relevant data such as:

* Notes
* Interviewer selection
* Scheduled interview time

This ensures that the application is not moved to the interview stage without the required interview information.

---

## 9. Using Database Transactions

### Goal

AI was used to understand how multiple related database operations should be handled safely.

### Type of Prompt Used

> Explain how to use a Prisma transaction when advancing an application to the interview stage.

### AI Assistance

AI helped explain why multiple operations should occur together.

The transaction can involve:

* Updating the application stage
* Updating the application version
* Creating application history
* Assigning an interviewer
* Creating an interview record

If one operation fails, the transaction prevents the database from remaining partially updated.

---

## 10. Implementing Optimistic Concurrency Control

### Goal

AI was used to understand how to prevent conflicting updates.

### Type of Prompt Used

> Explain optimistic concurrency control and how the version field can be used in this application.

### AI Assistance

The `Application` model contains a `version` field.

The frontend sends the version it currently knows as `expectedVersion`.

The backend compares this value with the current database value before performing an update.

This helps prevent one user's changes from accidentally overwriting another user's more recent changes.

---

## 11. Building the Frontend

### Goal

AI assistance was used to understand the React frontend and how it communicates with the backend.

### Type of Prompt Used

> Help me understand the frontend implementation and how React should interact with the Hiring Pipeline backend APIs.

### AI Assistance

The frontend was analyzed in terms of:

* Displaying applications
* Viewing application details
* Managing pipeline stages
* Opening forms and modals
* Selecting interviewers
* Scheduling interviews
* Sending API requests
* Refreshing data after successful operations

The frontend uses the browser `fetch` API to communicate with the backend.

---

## 12. Debugging and Code Review

### Goal

AI was used throughout development to review code and help identify errors.

### Type of Prompt Used

> Check this code and tell me what is wrong. Explain the problem and provide the correct approach.

### AI Assistance

AI was used to:

* Explain errors
* Review backend logic
* Check API request structures
* Review database operations
* Check Prisma relationships
* Identify possible logic problems
* Improve code clarity

AI explanations were used as guidance and were checked against the actual project implementation.

---

## 13. Reviewing Git History

### Goal

AI was used to understand how the project changed during development.

### Type of Prompt Used

> Analyze the Git history and explain the development order and important changes made during the project.

### AI Assistance

The Git history was used to understand:

* Project development phases
* Changes to pipeline logic
* Evolution of interview-stage requirements
* Implementation order
* Decisions that changed during development

This information was later used to create the project documentation.

---

## 14. Creating Database Documentation

### Goal

AI was used to prepare `docs/schema.md`.

### Type of Prompt Used

> Analyze the Prisma schema and backend implementation and create documentation explaining models, relationships, constraints, denormalization, and scalability considerations.

### AI Assistance

The resulting documentation covered:

* Database models
* Fields and data types
* Relationships
* Database constraints
* Application-level constraints
* Denormalization
* Potential future scalability concerns

The generated documentation was reviewed and corrected where necessary.

---

## 15. Creating Architecture Documentation

### Goal

AI was used to create `docs/architecture.md`.

### Type of Prompt Used

> Analyze the current project implementation and create system architecture documentation explaining the components, communication flow, execution environments, representative request flow, and architectural decisions.

### AI Assistance

The documentation explained:

* React frontend
* Express backend
* Prisma ORM
* PostgreSQL database
* API communication
* Application stage transitions
* Transactions
* Concurrency control
* Features outside the current project scope

---

## 16. Creating Technical Decision Documentation

### Goal

AI was used to create `docs/decisions.md`.

### Type of Prompt Used

> Review the project and Git history. Document the important technical decisions, alternatives considered, and the reasoning behind each decision.

### AI Assistance

Important decisions documented included:

* Separating frontend and backend
* Using PostgreSQL
* Using Prisma
* Adding optimistic concurrency control
* Using transactions for critical operations
* Strengthening requirements for the interview stage

The Git history was reviewed to identify decisions that changed during development.

---

## 17. Creating the Development Plan and History

### Goal

AI was used to create `docs/plan.md`.

### Type of Prompt Used

> Analyze the Git history and project implementation. Document the development phases, implementation order, changes in the plan, and features that remained out of scope.

### AI Assistance

The documentation described the project's progression from:

1. Initial project and database setup
2. Core entities
3. Application workflow
4. Pipeline transitions
5. Concurrency and transactions
6. Interview functionality

---

## 18. Documentation Review and Correction

### Goal

AI was used to review documentation generated during the project.

### Type of Prompt Used

> Check this documentation carefully against the actual implementation. Tell me what is correct, what is incorrect, and provide corrected content in a format that can be copied directly into the Markdown file.

### AI Assistance

AI helped improve:

* Markdown formatting
* Technical explanations
* Section organization
* Consistency
* Accuracy

An important part of the process was checking AI-generated content instead of automatically accepting every statement.

---

## 19. Example of AI Output That Required Correction

AI-generated content occasionally included statements that were too speculative or more detailed than the actual project implementation supported.

For example, scalability predictions and interpretations of development decisions needed to be reviewed carefully.

### Correction Process

The documentation was revised according to the following principle:

> Project documentation should clearly distinguish between implemented functionality, observations based on the current code, and possible future improvements.

This review process helped prevent unsupported assumptions from being presented as established project facts.

---

## 20. Overall Use of AI

AI was used throughout the project as a development and documentation assistant.

The major uses included:

* Understanding project requirements
* Planning the application structure
* Understanding the database schema
* Explaining Prisma relationships
* Developing backend logic
* Understanding pipeline transitions
* Implementing interview workflows
* Understanding transactions
* Understanding concurrency control
* Reviewing frontend-backend communication
* Debugging and reviewing code
* Analyzing Git history
* Preparing technical documentation
* Reviewing and correcting generated documentation
* Improving Markdown formatting

AI was used as a supporting tool during development. The project implementation, testing, code review, and final documentation decisions remained under the developer's control.

---

## 21. Investigating UI Data Flow

### Goal

AI was used to trace and investigate a suspected data truncation bug in the frontend Job Details modal.

### Type of Prompt Used

> The screenshot appears to show only a small amount of the Job Description, so I need you to trace and verify the complete data flow before making any changes. Investigate from the Job Creation input to the Job Details Modal.

### AI Assistance

AI helped systematically trace the data flow through:

* Frontend `<textarea>` inputs
* API POST requests
* Backend controller data handling (`jobController.ts`)
* Prisma schema definitions and PostgreSQL storage (`TEXT`)
* API GET responses
* React state (`selectedJob`)
* Modal CSS and JSX rendering

The investigation successfully proved that no code or data truncation was occurring. The "small amount" of description text seen in testing was simply due to the database seed data (`seed.ts`) containing very short job descriptions by design. This prevented making unnecessary CSS or architectural changes for a bug that didn't exist.

---

## 22. Fixing Internal Server Error & Enforcing Interviewer Workflow

### Goal

AI was used to investigate a 500 Internal Server Error occurring during the `SCREENING` to `INTERVIEW` transition, and to enforce a stricter business rule preventing premature interviewer assignment during the `APPLIED` and `SCREENING` stages.

### Type of Prompt Used

> I am receiving an "Internal server error" when advancing a candidate to the INTERVIEW stage... Investigate the actual root cause... The intended workflow is: APPLIED -> SCREENING -> INTERVIEW. The recruiter must NOT be able to assign an interviewer while the application is in APPLIED.

### AI Assistance

The investigation traced the request payload, controller logic, database schema, and middleware.

1.  **Internal Server Error Fix**: AI discovered a payload mapping issue. The JWT token stores the user ID as `userId`, but `pipelineController.ts` and `applicationController.ts` were attempting to read `req.user.id`. This caused `undefined` values to be passed to Prisma for required fields (`createdBy` on Interviews), which triggered a `PrismaClientValidationError` and a 500 status code. The property accesses were fixed.
2.  **Workflow Rule Enforcement (Frontend)**: The independent "Assign Interviewer" functionality in the UI was conditionally hidden for `APPLIED` and `SCREENING` stages.
3.  **Workflow Rule Enforcement (Backend)**: The `assignInterviewer` and `scheduleInterview` API endpoints in `interviewController.ts` were updated to explicitly reject requests if the application has not yet reached the `INTERVIEW` stage, ensuring rules cannot be bypassed via direct API calls.

---

## 23. Final Workflow Review & Cleanup

### Goal

AI was used to evaluate whether multiple interview rounds were a supported feature of the project, and to permanently remove the standalone "Assign Interviewer" UI control if they were not.

### Type of Prompt Used

> Please make one final review of the interviewer assignment workflow... Unless the current project explicitly supports multiple interview rounds or additional interviewer assignments, do NOT display a separate standalone "Assign Interviewer" or "Schedule Interview" control.

### AI Assistance

The project documentation (`docs/plan.md` and `docs/decisions.md`) and frontend codebase were reviewed. AI confirmed that the project focuses entirely on a core hiring pipeline and only actively supports one initial interview scheduling step during the `SCREENING` -> `INTERVIEW` transition. The standalone "Assign Interviewer" interface was a redundant UI element that did not align with a fully implemented multi-round feature. Therefore, the standalone assignment block was completely removed from the frontend code, ensuring initial interview creation happens exclusively through the validated state transition.

---

## 24. Final Backend API Cleanup

### Goal

AI was used to completely eliminate backend API loopholes that allowed users to bypass the intended pipeline transition workflow.

### Type of Prompt Used

> Please perform one final verification of the backend interviewer assignment and interview scheduling restrictions... If these endpoints are no longer required for any implemented functionality, do not leave a backend loophole that allows users to bypass the intended workflow through direct API requests.

### AI Assistance

AI verified that the standalone `/assign` and `/interviews` endpoints in `applicationRoutes.ts` and `interviewController.ts` were no longer connected to any frontend functionality (since multiple interview rounds were confirmed out-of-scope for the core project). The backend endpoints were entirely deleted to remove the loophole and ensure that the only way to create an interviewer assignment and interview schedule is through the atomic, validated `SCREENING` -> `INTERVIEW` transition API.



## 25. Workflow and Data Consistency Enforcement

**Prompt Summary:** Enforce that APPLIED and SCREENING candidates cannot have an interviewer assigned or an interview scheduled, both at the API level and the frontend display level.

**Changes Made:**
1. Modified `backend/src/controllers/applicationController.ts` inside `getApplicationById` to dynamically strip `assignments` and `interviews` from the API response if the application is in the `APPLIED` or `SCREENING` stage, thereby safely hiding any previously orphaned data.
2. Updated `frontend/src/App.tsx` to conditionally hide the Interviews section based on stage.
3. Verified that the `SCREENING -> INTERVIEW` transition remains strictly atomic and sequential.

## 26. Implementation of the Global Interviews Page

**Prompt Summary:** Replace the 'Not globally available' placeholder with a full global interviews overview page, adhering to the existing workflow constraints (no standalone creation).

**Changes Made:**
1. Created a new read-only backend endpoint `/api/interviews` by adding `listInterviews` to `backend/src/controllers/interviewController.ts` and creating `backend/src/routes/interviewRoutes.ts`.
2. The endpoint retrieves all existing interviews alongside candidate, job, and interviewer details by leveraging existing Prisma relations.
3. Added `globalInterviews` state and `loadGlobalInterviews` fetching logic to `frontend/src/App.tsx`.
4. Replaced the `case 'interviews':` block in `App.tsx` with a full table displaying Candidate, Job Position, Interviewer, Date & Time, and an auto-calculated Status (Scheduled or Completed).
5. Ensured no UI controls exist to manually create or alter interviews, fully preserving the invariant that interviews are strictly created during the SCREENING -> INTERVIEW advancement transition.

## 27. Fixing the False Empty State on the Interviews Page

### Goal
AI was used to investigate why the Global Interviews page displayed 'No interviews scheduled yet' despite candidates having scheduled interviews.

### AI Assistance
1. Validated that 29 Interview records actually exist in the database.
2. Discovered that the backend development server (
px tsx) does not hot-reload, meaning the newly implemented GET /api/interviews route was returning a 404 Not Found.
3. Identified a flaw in the frontend loadGlobalInterviews function where failed API requests silently left the state as an empty array, triggering a false empty state.
4. Updated the frontend to explicitly handle loading and error states, ensuring that network or API errors display an 'Error loading interviews' message rather than misleading the user.
5. Removed the 'Feedback' navigation link from the sidebar.

## 28. Multi-Interview Management Implementation

### Goal
Implement end-to-end interview management enabling multiple interviews per candidate, distinct or repeating interviewers, and direct attribution between interviews and interviewers without pipeline bypass.

### AI Assistance
1. Inspected schema and confirmed `Interview` only held `applicationId` and `createdBy`, leading to ambiguity when multiple interviews and interviewers existed.
2. Formulated a minimal safe database migration adding `interviewerId` and `roundTitle` to `Interview`, backfilling all 36 existing database records from existing assignments, applying NOT NULL and foreign key constraints, and regenerating the Prisma client.
3. Updated `advanceApplication` to associate the selected interviewer and optional round title when creating the first interview during `SCREENING -> INTERVIEW`.
4. Implemented `createAdditionalInterview` (`POST /api/applications/:id/interviews`) requiring the application to strictly be in the `INTERVIEW` stage and validating interviewer role and dates.
5. Enhanced Application Details UI to list all interviews with round title, assigned interviewer, scheduled date/time, and status badge, accompanied by a "+ Schedule Another Interview" button for recruiters on active candidates in `INTERVIEW`.
6. Updated the Global Interviews page table to display the assigned interviewer directly from `interview.interviewer`.
7. Created and executed an automated verification suite confirming all 6 interview reuse and stage restriction scenarios pass.
8. Resolved a frontend ReferenceError where the `applications` state declaration was missing from `App.tsx`, restoring application loading and table rendering.

## 29. Implementation of Application Archiving

### Goal
Implement application archiving functionality allowing recruiters to soft-archive applications when no longer relevant to the active recruitment workflow, ensuring complete data preservation (candidate info, stages, history, assignments, interviews, and feedback) without permanent deletion.

### What Was Inspected Before Implementation
1. Inspected `schema.prisma` and discovered that while `JobStatus` already included `ARCHIVED`, `ApplicationStatus` only had `ACTIVE` and `REJECTED`.
2. Inspected `applicationController.ts`, `pipelineController.ts`, and `interviewController.ts` to analyze how status filtering and pipeline guardrails operated.
3. Inspected `dashboardController.ts` and `csvController.ts`, verifying that active metrics and CSV export explicitly query `status: ApplicationStatus.ACTIVE`.

### Requirements Given
- Recruiters must be able to archive an application from the active workflow.
- Archiving must not delete the application or any of its historical data.
- Archived applications must be excluded by default from the active applications table.
- Recruiters must have a way to view archived applications (e.g. "Show Archived" toggle).
- Archived applications must be blocked from advancing, rejecting, receiving new interviews, and participating in bulk actions.
- A confirmation dialog must precede any archiving action.
- Historical data must remain fully viewable.

### Changes Made
1. **Schema & Database:** Added `ARCHIVED` to PostgreSQL enum types `"ApplicationStatus"` and `"ActionType"` and updated `schema.prisma`. Regenerated the Prisma Client.
2. **Backend Controllers & Routes:**
   - Updated `listApplications` in `applicationController.ts` to exclude `ApplicationStatus.ARCHIVED` by default unless `showArchived=true` or an explicit status filter is supplied.
   - Added `archiveApplication` endpoint (`POST /api/applications/:id/archive`) requiring recruiter permissions, operating idempotently, updating status to `ARCHIVED`, incrementing version, and logging `ActionType.ARCHIVED` in `ApplicationHistory`.
   - Updated `pipelineController.ts` (`advanceApplication`, `rejectApplication`, `bulkAdvance`, `bulkReject`) and `interviewController.ts` (`createAdditionalInterview`) to strictly block non-active applications from entering active workflow transitions.
3. **Frontend UI (`frontend/src/App.tsx`):**
   - Added a "Show Archived" toggle to the Applications view header.
   - Displayed status badges (`ACTIVE`, `REJECTED`, `ARCHIVED`) in the applications table and job details candidate list.
   - Disabled bulk selection checkboxes for archived applications so they cannot be selected for bulk advance or bulk reject.
   - Added an "Archive Application" button in the Application Details modal for active applications, opening a confirmation modal detailing that history will be preserved.
   - When viewing an archived application, displayed an informative banner and disabled all active recruitment action buttons while preserving full visibility of candidate details, job info, previous history, scheduled interviews, assignments, and feedback.
4. **Verification:** Executed an automated test suite verifying status transition, data preservation, pipeline blocking, interview blocking, default list filtering, and idempotency.

## 30. End-to-End Archiving & Restoration Fix for Jobs and Applications

### Goal
Audit and resolve missing visible UI actions and backend routes for Job and Application archiving/restoring, and restart stale backend processes.

### Audit Findings
1. The backend server on port 4000 was running a stale process instance (PID 6316) that did not reflect newly added routes.
2. In the frontend (`App.tsx`), although status badges and an Archive button inside the Application Details modal existed, the Applications table Action column only contained "View Details" and lacked visible inline Archive / Restore actions.
3. The Jobs table Action column and Job Details modal completely lacked Archive and Restore buttons.
4. Dedicated REST endpoints `POST /api/jobs/:id/archive`, `POST /api/jobs/:id/restore`, and `POST /api/applications/:id/restore` needed explicit registration in backend controllers and Express routers.

### Changes Made
1. **Backend Endpoints:**
   - Implemented `archiveJob` (`POST /api/jobs/:id/archive`) and `restoreJob` (`POST /api/jobs/:id/restore`) in `jobController.ts` and registered them in `jobRoutes.ts`.
   - Implemented `restoreApplication` (`POST /api/applications/:id/restore`) in `applicationController.ts` and registered it in `applicationRoutes.ts`.
2. **Frontend UI:**
   - Added visible "Archive" and "Restore" buttons in the Jobs table Action column (`View Details | Archive / Restore`).
   - Added "Archive Job" and "Restore Job" buttons to the Job Details modal header.
   - Added confirmation modal for archiving jobs explaining that the job will be hidden from the active list while history is preserved.
   - Added visible "Archive" and "Restore" buttons in the Applications table Action column (`View Details | Archive / Restore`).
   - Added "Restore Application" button in the Application Details modal when viewing an archived candidate.
3. **Server Restart:** Terminated the stale node process on port 4000 and restarted the backend server with `npx tsx src/index.ts`.
4. **Verification:** Created and executed an automated end-to-end HTTP test suite (`verify_e2e_archiving.ts`) confirming job archiving, job restoring, application archiving, application restoring, pipeline stage preservation, action blocking, and recruiter role enforcement.

## 31. Interviewer-Specific Dashboard & Scoped Navigation

### Goal
Implement a dedicated Interviewer experience with scoped sidebar navigation (Dashboard, My Interviews, Sign Out) and personal interview metrics, while preserving all recruiter workflows.

### Audit Findings
1. The currently logged-in user's role is identified by JWT claims decoded in `authMiddleware.ts` into `req.user.role` (`RECRUITER` | `INTERVIEWER`) and stored in React state as `user.role`.
2. The frontend sidebar previously displayed recruiter management views (Jobs, Applications, Pipeline) to interviewers, though actions were guarded.
3. The dashboard endpoint (`GET /api/dashboard`) returned incomplete stage group counts for interviewers rather than actionable interview schedules.
4. The global interviews endpoint (`GET /api/interviews`) returned all interviews without filtering by `interviewerId` when called by an interviewer.

### Changes Made
1. **Backend:**
   - Updated `dashboardController.ts`: When `req.user.role === 'INTERVIEWER'`, queries interviews assigned to `req.user.userId` and returns `todayInterviewsCount`, `upcomingInterviewsCount`, `completedInterviewsCount`, and `upcomingInterviews` (with candidate and job details).
   - Updated `interviewController.ts`: Filtered `listInterviews` by `{ interviewerId: req.user.userId }` when requested by an interviewer.
   - Updated `authMiddleware.ts`: Extended `requireInterviewerAssignment` to check both `InterviewerAssignment` and direct `Interview` records.
2. **Frontend:**
   - Scoped sidebar navigation for interviewers to strictly: Dashboard, My Interviews, Sign Out.
   - Replaced recruiter dashboard for interviewers with 3 metric cards (Today's Interviews, Upcoming Interviews, Completed Interviews) and an "Upcoming Interviews" table with "View Details" action.
   - Customized the Interviews page for interviewers to display "My Interviews".
   - Added view guard preventing interviewers from viewing unauthorized routes.
3. **Verification:**
   - Ran `npx tsc --noEmit` on backend (passed with 0 errors).
   - Ran `npm run build` on frontend (passed with 0 errors).
   - Executed live HTTP E2E tests verifying interviewer metrics, interview scoping, recruiter privilege barriers, and data isolation.

## 32. Fix Interviewer Dashboard "View Candidate" Flow & Application Details Modal Mounting

### Goal
Fix the non-functioning "View Candidate →" buttons on the Interviewer Dashboard (both in "Today's Interviews" and "Upcoming Interviews") so interviewers can seamlessly view details of candidates assigned to their interviews, while strictly enforcing assignment-based access and preserving recruiter functionality.

### Root Cause
1. In `frontend/src/App.tsx`, the `selectedApplication` modal (and related sub-modals) was defined exclusively inside the JSX return branch of `case 'applications':`.
2. When an interviewer logged in and viewed the Dashboard (`view === 'dashboard'`), `case 'applications':` was never rendered by `renderContent()`.
3. Clicking "View Candidate →" correctly invoked `loadApplicationDetails(item.applicationId)` and fetched the candidate details from `GET /api/applications/:id`, but the modal failed to appear on screen because it was conditionally unmounted within an inactive view.

### Changes Made
1. **Frontend Architecture (`frontend/src/App.tsx`):**
   - Extracted `selectedApplication` modal, `showAdvanceModal`, `showAdditionalInterviewModal`, and `archiveConfirmApp` into a top-level `renderApplicationModals()` helper.
   - Mounted `{renderApplicationModals()}` at the root level of the main layout, alongside `{renderContent()}`, ensuring candidate details can be viewed from any active tab (Dashboard, Interviews, Applications, Pipeline, Jobs).
   - Guarded the "Recruiter Actions" section inside the Application Details modal with `{user.role === 'RECRUITER' && (...)}`, ensuring interviewers only see candidate info, job details, interview schedules, feedback, and application history without exposing recruiter management controls.
   - Enhanced error handling in `loadApplicationDetails` to gracefully handle HTTP 403 (unassigned access), HTTP 404, and network errors without leaving the UI stuck.
2. **Security & Authorization Verification:**
   - Verified that `backend/src/middleware/authMiddleware.ts` enforces `requireInterviewerAssignment` on `GET /api/applications/:id`.
   - Verified that interviewers assigned via `InterviewerAssignment` or direct `Interview` can view their candidates, while unassigned candidate access correctly returns HTTP 403 Forbidden.
3. **Verification:**
   - Tested candidate retrieval for both Today's Interviews and Upcoming Interviews.
   - Verified HTTP 403 for unauthorized candidate access by other interviewers.
   - Confirmed recruiter unrestricted access and management workflows remain intact.
   - `npx tsc --noEmit` on backend: 0 errors.
   - `npm run build` on frontend: 0 errors.






