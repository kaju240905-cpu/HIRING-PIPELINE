
**# System Architecture**

**## 1. Overview**

The Hiring Pipeline application follows a client-server architecture. The system is designed to help recruiters manage job openings, candidates, application stages, interviewer assignments, interview schedules, and application history.

The application has three main layers:

1. Frontend

2. Backend

3. Database

These layers communicate through REST APIs.

---

**## 2. Main Components**

**### Frontend**

The frontend is built using React, Vite, TypeScript, and Tailwind CSS.

It provides the user interface for managing the hiring process. The main functionality includes:

- Viewing job openings

- Viewing applications

- Filtering the hiring pipeline by job

- Viewing application details

- Advancing candidates through pipeline stages

- Rejecting and reinstating candidates

- Assigning interviewers

- Scheduling interviews

- Viewing application history and recruiter actions

The frontend communicates with the backend using HTTP requests through the browser `fetch` API.

The application currently uses React state and effects to manage data loading and UI updates.

---

**### Backend**

The backend is built using Node.js, Express, and TypeScript.

It exposes REST API endpoints that the frontend uses to retrieve and modify data.

The backend is responsible for:

- Handling API requests

- Validating application data

- Enforcing application stage transitions

- Managing candidate rejection and reinstatement

- Assigning interviewers

- Scheduling interviews

- Maintaining application history

- Handling optimistic concurrency control

- Performing database transactions

The backend acts as the main business logic layer of the system.

---

**### Prisma ORM**

Prisma is used by the backend to communicate with the PostgreSQL database.

Instead of directly writing SQL queries for every database operation, the backend uses the Prisma Client.

Prisma is responsible for:

- Reading data from the database

- Creating new records

- Updating applications

- Managing relationships between models

- Executing database transactions

It also provides TypeScript type safety when interacting with the database.

---

**### PostgreSQL Database**

PostgreSQL is used as the persistent database for the application.

The database stores:

- Users

- Job openings

- Applications

- Interviewer assignments

- Interview schedules

- Application history

- Stalled alert dismissals

The database preserves the complete state of the hiring pipeline.

---

**## 3. How the Components Communicate**

The overall communication flow is:

```text

Recruiter

↓

React Frontend

↓ HTTP Request

Express Backend API

↓

Prisma ORM

↓

PostgreSQL Database

↓

Prisma ORM

↓

Express Backend Response

↓ HTTP Response

React Frontend

↓

Updated User Interface

```

The frontend does not communicate directly with the PostgreSQL database.

All database operations go through the Express backend and Prisma ORM.

This separation allows business rules and database operations to remain centralized in the backend.

---

**## 4. Where Each Component Runs**

**### Frontend**

The React application runs in the user's web browser.

Vite is used during development and for building the frontend application.

**### Backend**

The Express application runs in a Node.js environment.

It receives HTTP requests from the frontend and processes the application's business logic.

**### Database**

PostgreSQL runs as the persistent data storage system.

The backend connects to PostgreSQL through Prisma.

---

**## 5. Representative Request Flow**

**### Advancing a Candidate from SCREENING to INTERVIEW**

A representative workflow in the system is advancing a candidate from the `SCREENING` stage to the `INTERVIEW` stage.

**### Step 1: Recruiter Action**

The recruiter opens an application's details and clicks the button to advance the candidate to the next stage.

If the candidate is moving from `SCREENING` to `INTERVIEW`, the system requires additional information.

**### Step 2: Additional Information**

The frontend displays a modal asking the recruiter to provide:

- Evaluation or advancement notes

- An interviewer

- Interview date and time

These fields provide context for why the candidate is progressing and ensure that the interview is properly assigned and scheduled.

**### Step 3: Frontend API Request**

After the recruiter submits the form, the React frontend sends a `POST` request to:

`/api/applications/:id/advance`

The request includes information such as:

- Target stage

- Expected application version

- Evaluation notes

- Selected interviewer

- Interview schedule

**### Step 4: Backend Validation**

The backend receives the request and validates the transition.

It checks:

- Whether the application exists

- Whether the application is active

- Whether the requested stage transition is valid

- Whether the expected version matches the current version

- Whether the required interview information has been provided

The backend prevents candidates from skipping stages or moving through invalid transitions.

**### Step 5: Database Transaction**

For the `SCREENING` to `INTERVIEW` transition, multiple database operations must succeed together.

The backend performs these operations inside a Prisma transaction.

The transaction:

- Updates the application's current stage

- Updates the stage entry time

- Increments the application version

- Creates an application history record

- Assigns the selected interviewer

- Creates the interview schedule

Using a transaction ensures atomicity.

This means that either all operations succeed or all of them are rolled back.

For example, a candidate cannot be successfully moved to the `INTERVIEW` stage if the interviewer assignment or interview schedule fails.

**### Step 6: Backend Response**

After the transaction completes successfully, the backend sends a success response to the frontend.

If validation or database operations fail, the backend sends an appropriate error response.

**### Step 7: Frontend Refresh**

After receiving a successful response, the frontend reloads the relevant data.

This updates:

- Application details

- Pipeline stage information

- Application history

- Dashboard data where necessary

The recruiter can immediately see the updated candidate status without manually refreshing the browser.

---

**## 6. Important Architectural Decisions**

**### Separation of Frontend and Backend**

The frontend and backend are kept separate.

The frontend focuses on displaying information and collecting user input, while the backend handles business rules and database operations.

This prevents critical hiring logic from depending only on the user interface.

**### Business Rules in the Backend**

Important rules such as valid stage transitions, rejection, reinstatement, and interview requirements are enforced by the backend.

This prevents users from bypassing business rules by manipulating frontend requests.

**### Optimistic Concurrency Control**

Applications contain a `version` field.

When an application is modified, the frontend sends the version it currently knows as the `expectedVersion`.

The backend checks whether the version still matches the database record.

If another recruiter has already modified the application, the update can be rejected instead of accidentally overwriting newer information.

**### Database Transactions for Critical Actions**

Actions that involve multiple database updates are performed inside transactions.

For example, advancing a candidate to the interview stage also requires interviewer assignment and interview scheduling.

The transaction ensures that the system does not end up in a partially updated state.

**### Application History as an Audit Trail**

The system stores important application actions in the `ApplicationHistory` table.

This allows recruiters to see how a candidate moved through the pipeline and provides context for decisions such as advancement or rejection.

---

**## 7. Features Not Currently Included**

The project focuses on the internal hiring pipeline workflow. Some features commonly found in large Applicant Tracking Systems have not been implemented.

**### Candidate Portal**

Candidates do not currently have their own portal.

They cannot log in to:

- Submit applications

- View application progress

- Schedule interviews

- Update personal information

Applications are currently managed internally.

**### Automated Notifications**

The system does not currently send automated:

- Emails

- SMS messages

- Interview reminders

- Application status notifications

Interview scheduling information is stored in the database, but notifications are not sent automatically.

**### External Calendar Integration**

Scheduled interviews are stored in the application's database.

However, the system does not currently integrate with external calendar platforms such as:

- Google Calendar

- Microsoft Outlook

**### Resume Upload and Parsing**

The current application stores basic candidate information such as:

- Name

- Email

- Source

- Notes

Resume upload, file storage, and automatic resume parsing have not been implemented.

**### Advanced Authentication Features**

The system currently focuses on the implemented recruiter and interviewer workflow.

More advanced features such as password reset, multi-factor authentication, and enterprise identity providers have not been implemented.

---

**## 8. Future Improvements**

If the system were expanded further, possible architectural improvements could include:

- Separating the frontend into smaller React components

- Introducing a dedicated API service layer in the frontend

- Adding automated notifications

- Integrating external calendar services

- Adding candidate accounts and portals

- Adding resume file storage

- Implementing more detailed role-based access control

- Adding automated tests for frontend workflows

- Improving database indexing for larger datasets


