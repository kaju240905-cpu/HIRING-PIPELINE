

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



