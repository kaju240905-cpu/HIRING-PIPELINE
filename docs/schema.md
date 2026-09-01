# Hiring Pipeline Database Schema

This document details the database schema for the Hiring Pipeline application, based on the current Prisma implementation (`schema.prisma`) and backend constraints.

## 1. Database Models

The database is built on PostgreSQL using Prisma as the ORM. Below is a breakdown of all models, columns, and data types.

### `User`
Stores system users (Recruiters and Interviewers).

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key |
| `email` | `String` | No | Unique constraint |
| `passwordHash` | `String` | No | |
| `role` | `Role` | No | Enum: `RECRUITER`, `INTERVIEWER` |
| `createdAt` | `DateTime` | No | Defaults to `now()` |

### `JobOpening`
Represents an available job position.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key |
| `title` | `String` | No | |
| `department` | `String` | No | |
| `description` | `String` | No | |
| `status` | `JobStatus` | No | Enum: `OPEN`, `CLOSED`, `ARCHIVED` (Default: `OPEN`) |
| `createdAt` | `DateTime` | No | Defaults to `now()` |
| `updatedAt` | `DateTime` | No | Auto-updated on record changes |

### `Application`
Represents a candidate's application for a specific job opening.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key |
| `jobId` | `String` | No | Foreign Key to `JobOpening` |
| `candidateName`| `String` | No | |
| `candidateEmail`| `String` | No | |
| `source` | `String` | No | E.g. Referral, Website |
| `notes` | `String` | Yes | Internal notes |
| `currentStage` | `ApplicationStage` | No | Enum (Default: `APPLIED`) |
| `status` | `ApplicationStatus`| No | Enum: `ACTIVE`, `REJECTED` (Default: `ACTIVE`) |
| `appliedAt` | `DateTime` | No | Defaults to `now()` |
| `stageEnteredAt`| `DateTime` | No | Defaults to `now()` |
| `version` | `Int` | No | Used for optimistic concurrency control (Default: 1) |
| `createdAt` | `DateTime` | No | Defaults to `now()` |
| `updatedAt` | `DateTime` | No | Auto-updated on record changes |

### `InterviewerAssignment`
Maps users (interviewers) to specific applications. Note that this is separate from scheduling actual interviews; this model simply assigns a user to a candidate's application.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key |
| `applicationId`| `String` | No | Foreign Key to `Application` |
| `interviewerId`| `String` | No | Foreign Key to `User` |
| `createdAt` | `DateTime` | No | Defaults to `now()` |

### `Interview`
Records the scheduling information for an interview event related to an application. It does not directly link to an interviewer; it only tracks the application, the scheduled time, and the user who created the record.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key |
| `applicationId`| `String` | No | Foreign Key to `Application` |
| `scheduledAt` | `DateTime` | No | |
| `createdAt` | `DateTime` | No | Defaults to `now()` |
| `createdBy` | `String` | No | Foreign Key to `User` (The user who scheduled/created this record) |

### `ApplicationHistory`
An audit log of all actions and stage transitions on applications.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key |
| `applicationId`| `String` | No | Foreign Key to `Application` |
| `actorId` | `String` | Yes | Foreign Key to `User` |
| `actionType` | `ActionType` | No | Enum |
| `stage` | `ApplicationStage` | Yes | Relevant stage for the action |
| `oldStage` | `ApplicationStage` | Yes | State before transition |
| `newStage` | `ApplicationStage` | Yes | State after transition |
| `notes` | `String` | Yes | Additional context or feedback |
| `createdAt` | `DateTime` | No | Defaults to `now()` |

### `StalledAlertDismissal`
Tracks when recruiters dismiss "stalled" alerts for specific stages of applications.

| Column | Data Type | Optional | Notes |
| :--- | :--- | :---: | :--- |
| `id` | `String` (UUID) | No | Primary Key |
| `applicationId`| `String` | No | Foreign Key to `Application` |
| `stage` | `ApplicationStage` | No | Enum |
| `stageEnteredAt`| `DateTime` | No | Snapshot of when the alert was triggered |
| `dismissedAt` | `DateTime` | No | Defaults to `now()` |

---

## 2. Relationships

### One-to-Many
- **JobOpening ➔ Applications**: A job opening can have many applications.
- **Application ➔ InterviewerAssignments**: An application can have multiple assigned interviewers.
- **Application ➔ Interviews**: An application can have multiple scheduled interviews.
- **Application ➔ ApplicationHistory**: An application has a log of many history actions.
- **Application ➔ StalledAlertDismissals**: Alerts for a single application can be dismissed multiple times across different stages.
- **User ➔ InterviewerAssignments**: A user can be assigned to many applications.
- **User ➔ ApplicationHistory**: A user can perform many recorded actions.
- **User ➔ Interviews**: A user can schedule/create many interview records (tracked via `createdBy`).

### Many-to-Many
- There are **no implicit Many-to-Many** relations modeled strictly via Prisma arrays on both sides.
- However, the `InterviewerAssignment` table functions as an explicit **join table** representing a logical many-to-many relationship between **Applications** and **Users** (specifically Interviewers).

---

## 3. Constraints

### Enforced by Database / Prisma Schema
- **Primary Keys**: Handled automatically using UUID generation (`@id @default(uuid())`).
- **Unique Constraints**:
  - `User.email` must be unique across the system.
  - `InterviewerAssignment` has a composite unique constraint (`@@unique([applicationId, interviewerId])`) preventing the same user from being assigned to the same application twice.
  - `StalledAlertDismissal` has a composite unique constraint (`@@unique([applicationId, stage, stageEnteredAt])`) ensuring an alert for a specific stage/time combination is only dismissed once per application.
- **Referential Integrity**: All relationships explicitly use `onDelete: Restrict` in the Prisma schema. This ensures that a parent record (e.g., a User, JobOpening, or Application) cannot be deleted if there are any child records currently referencing it, preserving data integrity.
- **Duplicate Applications**: There is currently NO unique constraint on the combination of `jobId` and `candidateEmail`. The database does not enforce uniqueness for a candidate applying to the same job opening multiple times.

### Enforced by Application Code
The application logic (specifically in `pipelineController.ts`) enforces several critical business rules that the database does not:
- **Optimistic Concurrency Control**: Uses the `version` column on the `Application` model. State transition requests must provide an `expectedVersion` which is compared against the database to prevent race conditions during concurrent modifications.
- **State Machine Transitions**:
  - Advancing an application verifies it is a valid forward transition.
  - Applications already in the final stage cannot be advanced.
  - Rejected applications cannot be advanced unless explicitly reinstated first ("Application must be rejected to be reinstated").
- **Stage Requirements**: Business rules dictate that transitioning to specific stages requires attached data. E.g., advancing to `INTERVIEW` requires valid `notes`, an `interviewerId`, and a `scheduledAt` date.

---

## 4. Deliberate Denormalisation

- The **`Application` model stores `currentStage` and `stageEnteredAt`**, even though this exact information can be deduced by finding the latest `ApplicationHistory` record for that application.
- **Why?** This is a deliberate performance choice. By keeping the current stage and timeline on the main record, the system avoids complex subqueries or costly aggregations when generating lists of applications, filtering by active stage, or calculating whether an application is currently stalled.

---

## 5. Performance and Scalability (100× Data)

If this application experienced 100× more data, the following would likely become bottlenecks:

1. **Unindexed String Searches**: Full-table scans would occur when filtering `JobOpening` by `title` or `description`, or when filtering `Application` by `candidateName` or `candidateEmail`. Applying standard or trigram indexes on these searchable strings would be required.
2. **Audit Table Growth**: The `ApplicationHistory` table logs every interaction. At 100× scale, this table will become massive, slowing down write-heavy transactions or history retrieval. Implementing table partitioning (e.g., by month/year) or moving older logs to cold storage would become necessary.
3. **UUID Keys**: UUIDv4 primary keys are appropriate for the current application and provide excellent global uniqueness across the system. However, at a much larger scale, randomly generated UUIDs may have less efficient index locality in PostgreSQL than sequential identifiers (like ULIDs or UUIDv7). If database index performance becomes a concern as the tables grow to massive sizes, an alternative sequential ID strategy could be considered.

---

## 6. Interview Model Updates (Multi-Interview Architecture)

To support multiple interviews per application, distinct interviewers across different rounds, and multiple interviews conducted by the same interviewer for the same candidate without ambiguity, the `Interview` model was updated:

- **`interviewerId`**: `String` (Foreign Key to `User`, `onDelete: Restrict`). Directly connects each scheduled interview with the specific interviewer conducting that round.
- **`roundTitle`**: `String?` (Optional). Designates the specific round or type of interview (e.g., "Technical Interview", "HR Culture Interview", "Second Technical Round").
- **Relations**:
  - `User.interviewsConducted`: One-to-many relation linking an interviewer to all specific interviews they conduct across candidates.
  - `User.interviewsCreated`: One-to-many relation tracking the recruiter who scheduled the interview.
- **Indices**: Added `@@index([applicationId])` and `@@index([interviewerId])` to ensure fast retrieval when querying interviews by application or interviewer.

---

## 7. Application Archiving Schema Updates

To support soft-archiving applications while preserving complete audit logs and historical associations:

- **`ApplicationStatus` Enum**: Added `ARCHIVED` value (`ACTIVE`, `REJECTED`, `ARCHIVED`). This allows applications to be moved out of the active recruitment pipeline without altering their current stage or deleting related data.
- **`ActionType` Enum**: Added `ARCHIVED` value (`CREATED`, `STAGE_ADVANCED`, `REJECTED`, `REINSTATED`, `FEEDBACK_ADDED`, `ARCHIVED`) to record an audit trail event in `ApplicationHistory` whenever a recruiter archives an application.


