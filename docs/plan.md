# Project Development Plan

This document describes how the Hiring Pipeline project was developed, including the order in which the work was completed, changes made during development, and features that remained outside the final project scope.

## 1. How I Broke the Work into Sessions

Based on the Git commit history, I divided the project into several development phases.

### Phase 1: Project Setup and Database Foundation

The first phase focused on setting up the project structure and defining the database schema.

The frontend and backend environments were established, and the Prisma schema was created. The initial database models included users, job openings, applications, interviews, interviewer assignments, and application history.

Database seed data was also created to make it easier to test the application during development.

### Phase 2: Authentication and User Roles

The next phase focused on authentication and distinguishing between different types of users.

The application supports different roles, including recruiters and interviewers. This was important because later actions in the pipeline needed to identify which user was performing an action.

### Phase 3: Core Job and Application Features

After the database and user structure were available, the next step was implementing the main job opening and application functionality.

This provided the basic data required for the hiring pipeline. Users could work with job openings and applications before more complex pipeline actions were added.

### Phase 4: Pipeline State Management

The next phase focused on the main business logic of the application.

This included advancing applications through stages, rejecting applications, and reinstating rejected applications.

During this phase, optimistic concurrency control and database transactions were also introduced to make application updates safer and more reliable.

### Phase 5: Interview Stage Completion

The final major phase focused on improving the transition to the `INTERVIEW` stage.

The interview stage required more information than a normal stage transition. The implementation was updated to require notes, an interviewer assignment, and a scheduled interview time.

The frontend and backend were then connected to support this complete workflow.

---

## 2. Implementation Order and Why

The features were implemented in an order based on their dependencies.

### 1. Database and Project Structure First

The database schema and basic project structure were created first because the rest of the application depends on the data models.

Before implementing application logic, it was necessary to define how users, jobs, applications, interviews, and application history would be stored and related.

### 2. Authentication and Roles

Authentication and user roles were implemented before completing the main pipeline actions.

Many application actions need to know which user is performing them. For example, application history records can store the user responsible for a particular action.

### 3. Job Openings and Applications

The next step was implementing the basic entities of the system.

The hiring pipeline depends on job openings and candidate applications, so these features needed to exist before applications could move through different stages.

### 4. Pipeline Transitions

Once the basic data models and application records were available, the more complex pipeline logic was implemented.

This included stage transitions, rejection, reinstatement, application history, concurrency checks, and database transactions.

### 5. Interview Scheduling

The interview stage was completed after the basic pipeline functionality was working.

This made sense because interview scheduling depends on existing applications, users, stage transitions, and database relationships.

---

## 3. Planned Work Versus Actual Development

The actual development process required some changes to the original implementation approach, and time estimates shifted as complexity grew.

### Estimated vs. Actual Time
I originally estimated that the core requirements would take around 8-10 hours, divided evenly between database/backend setup and frontend UI development. In reality, the project took closer to 12-14 hours. The discrepancy came entirely from the backend complexity—specifically ensuring that atomic database transactions were rock solid, and implementing optimistic concurrency control to handle race conditions properly. The frontend was relatively quick, but the backend business rules demanded far more rigorous testing and adjustment than anticipated.

### Pipeline Features Took More Development Than Initially Planned

The Git history shows that some pipeline actions were initially left as placeholders for a later development phase.

For example, early versions of the project contained unimplemented pipeline actions marked for a future phase. The basic job and application functionality was completed first, while the more complex pipeline transitions were implemented later.

### Stage Advancement Became More Complex

The original stage advancement logic was relatively simple and focused on moving an application to the next stage.

During development, it became clear that some stages required additional information.

For example, moving a candidate to the `INTERVIEW` stage required more than simply changing the stage value. The application also needed evaluation notes, an assigned interviewer, and a scheduled interview time.

As a result, the implementation was updated to validate these fields and perform the related database operations together.

### Additional Transaction Logic Was Required

The final implementation also required database transactions for important pipeline actions.

A transition to the interview stage can update the application, create a history record, assign an interviewer, and create an interview schedule.

The implementation therefore became more complex than a simple application stage update because all of these operations needed to succeed together.

---

## 4. What Was Left Out of the Final Scope

The project focuses on the core internal hiring pipeline. Some common Applicant Tracking System features were not included in the current implementation.

### Automated Tests

Testing packages are present in the project configuration, but a complete automated test suite was not implemented as part of the final project.

This is an area that could be expanded in the future.

### Candidate Portal

The application does not currently provide a separate portal for candidates.

Candidates cannot create accounts, submit applications directly, track their application status, or manage interview information through the system.

### Automated Notifications

The current system does not automatically send emails or messages when an application changes stage or when an interview is scheduled.

Interview information is stored in the database, but notifications are not automatically sent to candidates or interviewers.

### External Calendar Integration

Interview schedules are stored within the application database.

However, the system does not currently integrate with external calendar services such as Google Calendar or Microsoft Outlook.

### Resume Upload and Parsing

The current application stores basic candidate information such as name, email, source, and notes.

Resume file uploads, file storage, and automatic resume parsing are not part of the current implementation.

---

## 5. Development Outcome

The final development process followed a dependency-based approach. The project started with the database and basic system structure, followed by user roles and core application functionality.

More complex features such as pipeline state transitions, concurrency handling, database transactions, interviewer assignments, and interview scheduling were added after the required foundation was in place.

Some features that would be useful in a larger Applicant Tracking System remain outside the current scope and could be considered for future development.

---

## 6. Multi-Interview Implementation Milestone

In a subsequent implementation phase, the interview management system was upgraded to support full multi-interview workflows:

- **Data Model Migration:** Added `interviewerId` and `roundTitle` to `Interview` in `schema.prisma`, safely migrating all 36 existing database records with zero data loss and regenerating the Prisma client.
- **Stage Gating:** Maintained atomic creation of the initial interview during the `SCREENING -> INTERVIEW` transition, while adding a protected `POST /api/applications/:id/interviews` endpoint permitting additional interviews exclusively when an application is in the `INTERVIEW` stage.
- **UI Enhancements:** Updated Application Details to list each scheduled interview with round title, assigned interviewer, scheduled date/time, and status badge, while providing recruiters with a "+ Schedule Another Interview" modal.
- **Global Overview:** Updated the Global Interviews page to directly display the interviewer responsible for each specific interview event.

---

## 7. Application Archiving Implementation Milestone

In a subsequent phase, full application archiving functionality was implemented:

- **Schema Evolution:** Added `ARCHIVED` to `ApplicationStatus` and `ActionType` enums, enabling soft-archiving without loss of candidate details, stage history, interviews, or feedback.
- **Backend API & Guardrails:** Created `POST /api/applications/:id/archive` with recruiter-only permissions and idempotency. Enhanced pipeline transition endpoints (`advanceApplication`, `rejectApplication`, `bulkAdvance`, `bulkReject`, and `createAdditionalInterview`) to reject operations on non-active applications.
- **Default Exclusion & Visibility:** Updated `listApplications` to exclude archived applications by default, while allowing recruiters to toggle archived visibility via `showArchived=true`.
- **Frontend Experience:** Added a "Show Archived" toggle on the Applications page, clear status badges, confirmation modals preventing accidental archiving, and safety disabling of bulk action checkboxes for archived rows.