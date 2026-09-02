# Hiring Pipeline Database Schema

This document details the database schema for the Hiring Pipeline application based on the Prisma implementation (`schema.prisma`) and backend business constraints.

---

## 1. Table by Table: Models, Columns, and Data Types

The database is built on PostgreSQL using Prisma ORM. Below is a breakdown of all models, columns, data types, and nullability.

### `User`
Stores system accounts for Recruiters and Interviewers.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key (`@id @default(uuid())`) |
| `email` | `String` | No | Unique constraint (`@unique`) |
| `passwordHash` | `String` | No | Hashed password credential |
| `role` | `Role` Enum | No | Values: `RECRUITER`, `INTERVIEWER` |
| `createdAt` | `DateTime` | No | Defaults to `now()` |

### `JobOpening`
Represents an open position created by recruiters.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key (`@id @default(uuid())`) |
| `title` | `String` | No | Role title |
| `department` | `String` | No | Department name |
| `description` | `String` | No | Role summary and job description |
| `status` | `JobStatus` Enum | No | Values: `OPEN`, `CLOSED`, `ARCHIVED` (Default: `OPEN`) |
| `createdAt` | `DateTime` | No | Defaults to `now()` |
| `updatedAt` | `DateTime` | No | Auto-updated on modification (`@updatedAt`) |

### `Application`
Represents a candidate's application for a job position and tracks their pipeline state.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key (`@id @default(uuid())`) |
| `jobId` | `String` | No | Foreign Key ➔ `JobOpening.id` (`onDelete: Restrict`) |
| `candidateName` | `String` | No | Candidate full name |
| `candidateEmail` | `String` | No | Candidate email address |
| `source` | `String` | No | Application channel (e.g. Referral, Job Board) |
| `notes` | `String` | Yes | Optional recruiter notes |
| `currentStage` | `ApplicationStage` Enum | No | Values: `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED` (Default: `APPLIED`) |
| `status` | `ApplicationStatus` Enum | No | Values: `ACTIVE`, `REJECTED`, `ARCHIVED` (Default: `ACTIVE`) |
| `appliedAt` | `DateTime` | No | Defaults to `now()` |
| `stageEnteredAt` | `DateTime` | No | Timestamp of entry into `currentStage` (Default: `now()`) |
| `version` | `Int` | No | Version counter for Optimistic Concurrency Control (Default: `1`) |
| `createdAt` | `DateTime` | No | Defaults to `now()` |
| `updatedAt` | `DateTime` | No | Auto-updated on modification (`@updatedAt`) |

### `InterviewerAssignment`
Explicit join table mapping assigned interviewers to candidate applications.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key (`@id @default(uuid())`) |
| `applicationId` | `String` | No | Foreign Key ➔ `Application.id` (`onDelete: Restrict`) |
| `interviewerId` | `String` | No | Foreign Key ➔ `User.id` (`onDelete: Restrict`) |
| `createdAt` | `DateTime` | No | Defaults to `now()` |

* **Composite Constraint**: `@@unique([applicationId, interviewerId])` prevents assigning the same interviewer twice to the same application.

### `Interview`
Tracks scheduled interview rounds for candidate applications.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key (`@id @default(uuid())`) |
| `applicationId` | `String` | No | Foreign Key ➔ `Application.id` (`onDelete: Restrict`) |
| `interviewerId` | `String` | No | Foreign Key ➔ `User.id` (Assigned Interviewer) |
| `roundTitle` | `String` | Yes | Title/type of round (e.g. "System Design Round") |
| `scheduledAt` | `DateTime` | No | Date and time of interview |
| `status` | `InterviewStatus` Enum | No | Values: `SCHEDULED`, `COMPLETED` (Default: `SCHEDULED`) |
| `createdAt` | `DateTime` | No | Defaults to `now()` |
| `createdBy` | `String` | No | Foreign Key ➔ `User.id` (Recruiter who scheduled it) |

### `Feedback`
Evaluation form filled by an interviewer after an interview round.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key (`@id @default(uuid())`) |
| `interviewId` | `String` | No | Foreign Key ➔ `Interview.id` (`@unique`, `onDelete: Cascade`) |
| `interviewerId` | `String` | No | Foreign Key ➔ `User.id` (`onDelete: Restrict`) |
| `technicalSkillsRating` | `Int` | No | Score between 1 and 5 |
| `communicationSkillsRating` | `Int` | No | Score between 1 and 5 |
| `problemSolvingRating` | `Int` | No | Score between 1 and 5 |
| `roleSpecificSkillsRating` | `Int` | No | Score between 1 and 5 |
| `recommendation` | `Recommendation` Enum | No | Values: `STRONG_HIRE`, `HIRE`, `NEUTRAL`, `REJECT`, `STRONG_REJECT` |
| `strengths` | `String` | No | Text assessment of strengths |
| `concerns` | `String` | No | Text assessment of concerns |
| `comments` | `String` | Yes | Optional extra feedback notes |
| `createdAt` | `DateTime` | No | Defaults to `now()` |
| `updatedAt` | `DateTime` | No | Auto-updated on modification (`@updatedAt`) |

### `ApplicationHistory`
Audit log recording every state transition and action taken on an application.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key (`@id @default(uuid())`) |
| `applicationId` | `String` | No | Foreign Key ➔ `Application.id` (`onDelete: Restrict`) |
| `actorId` | `String` | Yes | Foreign Key ➔ `User.id` (`onDelete: Restrict`) |
| `actionType` | `ActionType` Enum | No | Values: `CREATED`, `STAGE_ADVANCED`, `REJECTED`, `REINSTATED`, `FEEDBACK_ADDED`, `ARCHIVED` |
| `stage` | `ApplicationStage` | Yes | Relevant stage during action |
| `oldStage` | `ApplicationStage` | Yes | Pre-transition stage |
| `newStage` | `ApplicationStage` | Yes | Post-transition stage |
| `notes` | `String` | Yes | Additional notes attached to action |
| `createdAt` | `DateTime` | No | Defaults to `now()` |

### `StalledAlertDismissal`
Records recruiter dismissals of stalled alerts for specific application stages.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key (`@id @default(uuid())`) |
| `applicationId` | `String` | No | Foreign Key ➔ `Application.id` (`onDelete: Restrict`) |
| `stage` | `ApplicationStage` | No | Stage in which alert occurred |
| `stageEnteredAt` | `DateTime` | No | Snapshot timestamp when candidate entered stage |
| `dismissedAt` | `DateTime` | No | Defaults to `now()` |

* **Composite Constraint**: `@@unique([applicationId, stage, stageEnteredAt])` ensures an alert for a specific stage entry timestamp can only be dismissed once.

---

## 2. Relationships

### One-to-Many Relationships
- **`JobOpening` ➔ `Application`**: A single job opening receives multiple candidate applications.
- **`Application` ➔ `InterviewerAssignment`**: An application can have multiple assigned interviewers.
- **`Application` ➔ `Interview`**: An application can have multiple scheduled interview rounds.
- **`Application` ➔ `ApplicationHistory`**: An application records multiple historical audit events over its lifecycle.
- **`Application` ➔ `StalledAlertDismissal`**: An application can have multiple alert dismissals over different stages/entry timestamps.
- **`User` ➔ `InterviewerAssignment`**: An interviewer can be assigned to multiple candidate applications.
- **`User` ➔ `ApplicationHistory`**: A user can perform and record multiple audit log actions.
- **`User` ➔ `Interview`**: A user acts as an interviewer (`interviewsConducted`) and/or creator (`interviewsCreated`) across multiple interviews.
- **`User` ➔ `Feedback`**: An interviewer submits feedback across multiple interviews.

### One-to-One Relationships
- **`Interview` ➔ `Feedback`**: Each scheduled interview round connects to at most one feedback record (`Feedback.interviewId` has a `@unique` constraint).

### Many-to-Many Relationships
- **`Application` ↔ `User` (Interviewers)**: Explicitly modeled via the **`InterviewerAssignment`** join table. An application can be assigned to multiple users (interviewers), and an interviewer can be assigned to multiple applications.

---

## 3. Constraints: Database vs. Application Code

### Constraints Enforced by Database / Prisma
- **Entity Identity & Uniqueness**:
  - Primary keys (`UUIDv4`) across all models.
  - Unique constraint on `User.email`.
  - Unique constraint on `Feedback.interviewId` (guarantees maximum 1 feedback form per interview round).
  - Composite unique constraint `@@unique([applicationId, interviewerId])` on `InterviewerAssignment` (prevents double assignment).
  - Composite unique constraint `@@unique([applicationId, stage, stageEnteredAt])` on `StalledAlertDismissal` (prevents multiple dismissals of the same stalled event).
- **Referential Integrity & Cascades**:
  - Foreign key constraints with `onDelete: Restrict` across parent entities (`User`, `JobOpening`, `Application`) to block accidental deletion when dependent records exist.
  - Foreign key constraint with `onDelete: Cascade` on `Feedback.interview` (deleting an interview automatically removes its associated feedback record).
- **Type Enums**: Native PostgreSQL enums strictly constrain column values (`Role`, `JobStatus`, `ApplicationStage`, `ApplicationStatus`, `ActionType`, `InterviewStatus`, `Recommendation`).

### Constraints Enforced by Application Code
- **Optimistic Concurrency Control**: Managed in `pipelineController.ts` using the `Application.version` column. Mutation requests must provide an `expectedVersion` matching the current version in PostgreSQL to prevent silent data overwrites during concurrent edits.
- **Pipeline State Machine Rules**:
  - Forward stage progression validations (e.g. verifying valid stage sequence `APPLIED` ➔ `SCREENING` ➔ `INTERVIEW` ➔ `OFFER` ➔ `HIRED`).
  - Terminal state restrictions (candidates in `HIRED` or `REJECTED` cannot advance without explicit reinstatement).
  - Reinstatement rules (only `REJECTED` applications can be reinstated).
  - Prerequisites for stage advancement (e.g. transitioning to `INTERVIEW` requires scheduled date, notes, and interviewer assignment).
- **Numerical Rating Bounds**: Controller input validation ensures ratings (`technicalSkillsRating`, `communicationSkillsRating`, etc.) are integers between 1 and 5.
- **Stalled Application Timeout Rules**: Business logic computing whether an application is "stalled" (e.g., active application remaining in a stage past the threshold duration without a dismissal) is evaluated dynamically in `alertController.ts`.
- **Role-Based Permissions**: Middleware verifying `RECRUITER` vs `INTERVIEWER` roles before allowing pipeline state modifications or user assignments.

### Why Draw the Line There?
* **Database Responsibilities**: Hard structural invariants, data entity uniqueness, referential integrity, and column type limits belong in the database layer. This ensures data corruption, orphaned child rows, or invalid enum values are physically impossible regardless of which service, script, or background worker accesses PostgreSQL.
* **Application Code Responsibilities**: Workflow state machine transitions, optimistic locking version comparisons, multi-model business validations, dynamic timeout thresholds, and authorization logic belong in application code. Business rules evolve frequently, require user-friendly validation messages, and depend on complex contextual state that is difficult to manage inside database triggers or static constraints.

---

## 4. Deliberate Denormalisation

1. **`Application.currentStage` & `Application.stageEnteredAt`**:
   - *Normalized Alternative*: Query the most recent entry in `ApplicationHistory` to derive the current stage and its entry timestamp.
   - *Why Denormalised*: Pipeline listings, Kanban boards, stage filters, dashboard metrics, and stalled alert calculations are queried constantly. Storing `currentStage` and `stageEnteredAt` directly on `Application` eliminates complex subqueries, `ROW_NUMBER() OVER (...)` window functions, and expensive joins on `ApplicationHistory`.
2. **`Application.status` (`ACTIVE`, `REJECTED`, `ARCHIVED`)**:
   - *Why Denormalised*: Allows fast indexing (`@@index([currentStage, status])`) and direct filtering of active recruitment pipelines without calculating status from audit history logs.
3. **`Feedback.interviewerId`**:
   - *Normalized Alternative*: Derive `interviewerId` via `Feedback ➔ Interview ➔ interviewerId`.
   - *Why Denormalised*: Direct index (`@@index([interviewerId])`) allows fetching an interviewer's submitted feedback history and performance metrics directly without joining through `Interview`.

---

## 5. Scalability Bottlenecks (100× Data)

If the dataset grows 100× (millions of applications, interviews, and audit logs), the following bottlenecks will emerge first:

1. **Unindexed String Searches & Filters**:
   - Searches on `candidateName`, `candidateEmail`, `source`, `JobOpening.title`, and `JobOpening.department` currently perform full-table scans. Adding B-tree or trigram (`pg_trgm`) indexes will be necessary to maintain fast search latency.
2. **`ApplicationHistory` Audit Log Table Growth**:
   - Every single action appends a row to `ApplicationHistory`. At 100× scale, table bloat will slow down writes and history queries. Implementing PostgreSQL table partitioning (e.g. range partitioning by `createdAt`) or moving older audit logs to cold storage will be required.
3. **Stalled Application Alert Computations**:
   - Alert calculations scan active applications and cross-reference `StalledAlertDismissal`. Without covering indexes on `(status, currentStage, stageEnteredAt)`, generating dashboard alerts across millions of applications will cause high CPU and I/O load.
4. **UUIDv4 Index Locality & Thrashing**:
   - `UUIDv4` primary keys generate random identifiers. At high write volumes with millions of rows, random UUID inserts cause page splits and cache thrashing in PostgreSQL B-tree indexes. Migrating to time-sortable sequential identifiers (`UUIDv7` or `ULID`) would improve index locality.
5. **Optimistic Locking Retries**:
   - High concurrency on popular job openings or batch operations will lead to frequent version mismatch errors (`version` conflict), requiring client retry strategies or queue-based sequencing.
