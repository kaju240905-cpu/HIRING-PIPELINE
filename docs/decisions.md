# Project Decisions

This document records the important technical and design decisions that shaped the Hiring Pipeline project. Each decision involved considering an alternative approach and selecting the option that best suited the requirements of the application.

## Decision 1: Separate Frontend and Backend

- **Chose:** A separate React/Vite frontend and Node.js/Express backend.
- **Rejected:** A single monolithic application with server-rendered pages.
- **Why:** Separating the frontend and backend provides a clear separation of responsibilities. The frontend is responsible for displaying data and handling user interaction, while the backend handles business logic, validation, and database operations. It also allows the frontend and backend to communicate through a well-defined REST API.

## Decision 2: PostgreSQL with Prisma ORM

- **Chose:** PostgreSQL as the database and Prisma as the ORM.
- **Rejected:** Writing database queries directly using raw SQL or using a different query builder.
- **Why:** PostgreSQL is suitable for the relational structure of the hiring pipeline, where users, applications, interviews, and application history have multiple relationships. Prisma provides type-safe database access and makes it easier to define models and relationships using the Prisma schema.

## Decision 3: Require Additional Information for Interview Stage

- **Chose:** Requiring notes, an interviewer, and a scheduled interview time when moving an application to the `INTERVIEW` stage.
- **Rejected:** Allowing applications to move to every stage using only a simple generic "Advance" action.
- **Why:** Moving a candidate to the interview stage without assigning an interviewer or scheduling an interview would create an incomplete application state. Requiring this information ensures that an application entering the `INTERVIEW` stage has the necessary information associated with it.

- **Later reversed:** The original implementation used a simpler stage advancement approach that automatically moved an application to the next stage. During development, this approach was changed after it became clear that the `INTERVIEW` stage required additional information. The implementation was updated to validate the required interview details before allowing the transition.

## Decision 4: Optimistic Concurrency Control

- **Chose:** Using a `version` field on the `Application` model for optimistic concurrency control.
- **Rejected:** Ignoring concurrent updates or using database-level pessimistic locking.
- **Why:** Multiple recruiters could potentially update the same application at nearly the same time. The version field allows the backend to check whether the application has been modified since the frontend last retrieved it. This helps prevent one user's update from accidentally overwriting another user's changes.

## Decision 5: Database Transactions for Pipeline Actions

- **Chose:** Using Prisma transactions for operations that modify multiple related records.
- **Rejected:** Performing each database operation independently.
- **Why:** Some application actions require several related database changes. For example, moving an application to the `INTERVIEW` stage can involve updating the application, creating an application history record, assigning an interviewer, and creating an interview record. A database transaction ensures that all required operations succeed together. If one operation fails, the transaction can be rolled back to prevent partially completed data.

## Decision 6: Store Application History Separately

- **Chose:** Using a separate `ApplicationHistory` model to record important application actions and stage transitions.
- **Rejected:** Storing only the current application stage and overwriting previous information.
- **Why:** The hiring pipeline requires a record of how an application has changed over time. Keeping a separate history table provides an audit trail that can show stage transitions and other important actions without losing previous information.

## Decision 7: Keep Current Stage on the Application Record

- **Chose:** Storing `currentStage` and `stageEnteredAt` directly on the `Application` model.
- **Rejected:** Calculating the current stage every time from the latest `ApplicationHistory` record.
- **Why:** The current stage is frequently required when displaying and filtering the hiring pipeline. Storing it directly on the application makes these operations simpler and avoids repeatedly calculating the latest stage from the history table.

## Decision 8: Direct Interview-to-Interviewer Link for Multi-Interview Support

- **Chose:** Linking `Interview` directly to an `interviewerId` (`User`) and allowing recruiters to schedule multiple interviews per candidate once in the `INTERVIEW` stage.
- **Rejected:** Relying solely on `InterviewerAssignment` joined to `Application`, or restricting candidates to a single interview round.
- **Why:** In real-world hiring workflows, candidates regularly go through multiple interview rounds (e.g. Technical Round 1, Second Technical Round, HR Culture Round). Some rounds may be conducted by the same interviewer, while others are conducted by different interviewers. Storing the interviewer only at the application level created ambiguity regarding which interviewer conducted which round and prevented the same interviewer from conducting multiple separate rounds. Directly attaching `interviewerId` to each `Interview` record provides clear attribution, preserves multi-round support, and allows seamless interviewer reuse.

## Decision 9: Soft-Archiving Applications Instead of Hard Deletion

- **Chose:** Adding `ARCHIVED` status to `ApplicationStatus` and recording an `ActionType.ARCHIVED` audit trail while preserving the application, history, interviews, and feedback.
- **Rejected:** Permanently deleting application records or overwriting pipeline stages.
- **Why:** Deleting an application loses valuable hiring context, historical interviewer evaluations, and candidate interaction timelines. By soft-archiving, the system removes inactive candidates from day-to-day active recruiter views while maintaining historical fidelity and compliance auditability.