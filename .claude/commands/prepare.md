---
description: Prepare to build a new application from scratch — gather requirements, produce spec docs, and create the folder structure before any coding begins
---

## Ground Rules
- Lines beginning with `//` are commented out — ignore them entirely
- When told to "consider" something: reason through it; if confident, proceed; if unclear, ask one or two focused questions before continuing
- Every decision or discovered fact must be saved to the appropriate `.md` spec file — do not keep knowledge only in memory
- Run independent steps in parallel using subagents wherever possible
- PostgreSQL 16 is installed at `C:\Program Files\PostgreSQL\16`
- Operate in full auto mode — proceed through all steps without asking for permission unless genuinely blocked

---

## Step 1 — Read all existing documentation

Read this entire workflow file first. Then read every existing document in the project folder. For each document, consider:
- Is the intent clear?
- Does it contradict anything else? If so, ask questions or note the conflict and resolve it using best judgment, then document the resolution.

## Step 2 — Clarify the application

Confirm with the user (if not already clear) what application is being built. Establish: the domain, the core purpose, and the primary user actions. Save a short `overview.md` with a 2–3 sentence description of the application.

## Step 3 — Define users and roles

Determine the user model:
- Users authenticate with **email and password** (email is the username)
- First name is required at registration
- Identify whether multiple user roles are needed (e.g., admin, regular user, read-only) and what each role can access
- Save the full user and role model to `docs/users.md`

## Step 4 — Define pages and screens

Identify all pages the application needs:
- Public pages: home page, login page, sign-up page, and whatever other pages are required
- The home page must be bright, colorful, and include all standard sections (hero, features, CTA, footer, etc.)
- Internal pages (post-login): enumerate every screen needed based on the application's purpose
- For each page, specify: purpose, key UI sections, user actions, and access role(s) required
- Save the full page inventory and specs to `docs/pages.md`
- Utilize the 'ui-agent' agent to create a robust wireframe (JSX) for each page; generate multiple wireframes in parallel

## Step 5 — Define the API and messaging

For every page defined in Step 4 and for every piece of functionality required by the spec:
- Identify what data the frontend needs from the backend
- Define the REST API endpoints (method, path, request body, response shape)
- Determine whether any real-time communication is needed (e.g., notifications, live updates) and whether WebSockets are justified, or if polling is sufficient
- Save the full API and messaging spec to `docs/messaging.md`

## Step 6 — Design the database schema

Based on the pages, users, and API:
- Identify all entities and their fields
- Define relationships (one-to-many, many-to-many, etc.)
- Specify data types, constraints, and indexes
- Include a `users` table with at minimum: `id`, `email`, `password_hash`, `first_name`, `role`, `created_at`
- Save the full schema (as SQL DDL or a clear table-by-table spec) to `docs/database.md`

## Step 7 — Assess document storage needs

Consider whether the application requires file/document storage:
- If yes: files are stored on the local filesystem for now (S3 migration is future work); file metadata (name, path, uploader, upload date, linked entity) is stored in the database
- Consider whether full-text search of document contents is needed and, if so, how to implement it (e.g., PostgreSQL `tsvector`, a search index)
- Save the document management plan to `docs/doc-mgt.md` (skip this file if the application has no document storage needs)

## Step 8 — Define configuration

Identify all configurable aspects of the system:
- What values should not be hardcoded (ports, database connection, API base URL, secret keys, feature flags, etc.)
- Frontend environment variables (e.g., API base URL) go in `.env` files
- Backend environment variables (e.g., DB connection string, JWT secret, port) go in `.env` files
- Store non-secret configuration in a plaintext config file where appropriate
- Save the full configuration plan to `docs/config.md`

## Step 9 — Create the folder structure

Create the directory layout for the project. The structure must include:
- `frontend/` — React application
- `backend/` — Node.js REST API
- `shared/` — TypeScript types and interfaces shared between frontend and backend
- `database/` — migration scripts and seed data
- `docs/` — all `.md` spec files produced in this workflow

Create the folder structure on disk (empty directories with `.gitkeep` if needed). Save the directory tree to `docs/structure.md`.

## Step 10 — Review and confirm readiness

Review all spec documents produced:
- `docs/overview.md`
- `docs/users.md`
- `docs/pages.md`
- `docs/messaging.md`
- `docs/database.md`
- `docs/doc-mgt.md` (if applicable)
- `docs/config.md`
- `docs/structure.md`

Flag any gaps, contradictions, or unresolved questions. Once all documents are complete and consistent, the preparation phase is done and the `implement` workflow can begin.

---

// Later (for down the road, ignore this section for now)
// * Add login with Gmail or Facebook (OAuth)
// * Admin Dashboard — standalone UI for viewing/editing configuration and managing users
// * Let the admin dashboard communicate with the server via its own API routes
// * Mobile-responsive layout (desktop-first for now)

// let the whole admin module be a separate step, frontend and backend together
// the broker project was created on claude website and then transferred via the HANDOFF.md file which worked really well when picked up by claud code