---
description: Implement the application — set up the project, build the database, backend, and frontend, seed test data, start servers, and iterate until everything works
---

## Ground Rules
- The `prepare` workflow must be fully complete before starting this workflow — all spec docs must exist in `docs/`
- Lines beginning with `//` are commented out — ignore them entirely
- Run independent steps in parallel using subagents wherever possible
- PostgreSQL 16 is installed at `C:\Program Files\PostgreSQL\16`
- Operate in full auto mode — proceed through all steps without asking for permission unless genuinely blocked
- This is a local development environment; dummy/seed data is expected and encouraged
- **Implement only what is in the spec** — do not invent features, UI copy, pricing models, trial periods, marketing claims, or flows that do not appear in `docs/` or `wireframes/`. If something feels natural to add but is not specified, leave it out.

---

## Step 1 — Read all spec documents

Read every file produced by the prepare workflow before writing any code:
- `docs/overview.md` — what the application is
- `docs/structure.md` — the folder layout to follow
- `docs/users.md` — user roles and auth model
- `docs/pages.md` — every page, its purpose, and required role access
- `docs/messaging.md` — all REST API endpoints, request/response shapes, and any WebSocket needs
- `docs/database.md` — full schema (tables, fields, types, relationships, indexes)
- `docs/config.md` — all environment variables and configuration values
- `docs/doc-mgt.md` — file storage plan (if applicable)

If any spec doc is missing or incomplete, stop and flag it before proceeding.

## Step 2 — Initialize the project structure

Following `docs/structure.md`, scaffold the project:
- `frontend/` — initialize a Vite + React + TypeScript project (`npm create vite`)
- `backend/` — initialize a Node.js + TypeScript project (`npm init`, install Express, `ts-node`, etc.)
- `shared/` — initialize a plain TypeScript package for types shared between frontend and backend
- `database/` — create folder for migration SQL files and seed scripts

Install all dependencies. Create `.env` files for both `frontend/` and `backend/` based on `docs/config.md`. Do not hardcode any value that belongs in `.env`.

## Step 3 — Create shared TypeScript types

In `shared/`, define TypeScript interfaces and types for:
- All API request and response shapes from `docs/messaging.md`
- All data models (entities) from `docs/database.md`
- User roles and auth token payload from `docs/users.md`

Both the frontend and backend should import from `shared/` — do not duplicate type definitions.

## Step 4 — Set up the database

Using PostgreSQL at `C:\Program Files\PostgreSQL\16`:
- Create the application database (e.g., `CREATE DATABASE appname;`)
- Write the DDL migration in `database/migrate.sql` from the schema in `docs/database.md`
- Run the migration to create all tables
- Verify all tables and relationships were created correctly

## Step 5 — Build the backend

Implement the Node.js + Express REST API:
- Load all config from `.env` (never hardcode secrets or ports)
- Implement authentication: `POST /auth/register` (requires first name, email, password), `POST /auth/login`, `POST /auth/logout`, JWT issuance and validation middleware
- Implement all endpoints defined in `docs/messaging.md`, organized by resource
- Enforce role-based access on every protected endpoint per `docs/users.md`
- If `docs/doc-mgt.md` exists and requires file storage: implement file upload endpoints, store files on the local filesystem, save metadata to the database
- If `docs/messaging.md` requires WebSockets: add a WebSocket server alongside Express

All routes must return consistent JSON response shapes matching the types defined in `shared/`.

## Step 6 — Seed the database with dummy data

Create a seed script at `database/seed.ts` (or `seed.sql`) that inserts realistic dummy data:
- At least one user per role defined in `docs/users.md`
- Enough records across all tables to exercise every page and endpoint
- Print the test credentials (email + password) to the console when the seed runs

Run the seed script and confirm data is present.

## Step 7 — Build the frontend
Implement the React application:
- Set up React Router with routes for every page in `docs/pages.md`
- Implement protected routes: redirect unauthenticated users to login; enforce role-based page access
- Build every page listed in `docs/pages.md` with full functionality (not placeholder stubs)
- For every page that has a corresponding wireframe in `wireframes/`, use it as the design reference — match its layout, sections, labels, and UI copy exactly; do not add, remove, or rename elements
- The home page must be bright, colorful, and include all standard sections (hero, features, CTA, footer)
- Connect all pages to the backend via the API client, using the shared types from `shared/`
- Load the API base URL and any other config from `.env` (via `VITE_` prefix)
- Implement login and sign-up flows using the auth endpoints from Step 5

## Step 7a — Create Tests

### Backend API Tests
- Write API tests for every endpoint defined in `docs/messaging.md` using Jest or Mocha
- Test coverage requirements:
  - All authentication endpoints (register, login, logout, token refresh)
  - All CRUD operations for each resource
  - Role-based access control (verify unauthorized users get 403)
  - Input validation (verify invalid data returns 400 with error messages)
  - Error handling (verify 404, 500 responses)
- Save tests in `backend/src/__tests__/` or `backend/tests/`
- Run `npm test` in `backend/` — all tests must pass before Step 8
- If tests fail, fix the backend code and re-run until all pass

### Frontend Browser Tests
- Generate browser automation test scripts in `tests/browser/` for execution by Claude for Chrome
- Create separate test files:
  - `01-core-broker-flow.md` — broker registration, login, loan creation (main workflow)
  - `02-borrower-magic-link-flow.md` — borrower portal access and document upload
  - `03-underwriter-workflow.md` — underwriter queue, analysis, decision
  - `04-investor-marketplace.md` — investor marketplace browsing and bidding
  - `05-admin-user-management.md` — admin user CRUD operations
  - `06-comprehensive-ui-validation.md` — exhaustive testing of all UI elements
- Each test script must include:
  - Prerequisites section (what must exist before running)
  - Numbered test steps with URLs and actions
  - Verification assertions after each step (e.g., "**Verify:** Page loads without errors")
  - Expected results section
- Tests must collectively cover every page in `docs/pages.md`
- For each page, include verification steps that check: loads without console errors, displays as described in `docs/pages.md`, all interactive elements work
- Create a `tests/browser/README.md` with:
  - Overview of each test file
  - Execution instructions for Claude for Chrome
  - Prerequisites (application running, database seeded)
  - Coverage summary
- Do not attempt to execute the browser tests — they are artifacts for later use by Claude for Chrome

## Step 8 — Start both servers

Start the backend and frontend servers:
- Backend: `npm run dev` in `backend/` (confirm it is listening on the configured port)
- Frontend: `npm run dev` in `frontend/` (confirm it opens in the browser)

Navigate to every page in the app. For each page:
- Verify it loads without console errors
- Verify it displays and behaves as described in `docs/pages.md`
- Verify API calls succeed and return the expected data

