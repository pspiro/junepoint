---
description: Audit the current state of the build — check which workflow phases are complete, what's missing, and what the next step is
---

## Ground Rules
- Read actual files on disk — do not assume anything is complete without verifying
- Run all file checks in parallel
- Produce a concise, structured report — no fluff
- End with a single, unambiguous "Next Step" directive

---

## Step 1 — Read context files

Read the following files in parallel (skip gracefully if missing):
- `HANDOFF.md` — project overview and design decisions
- `docs/overview.md`, `docs/users.md`, `docs/pages.md`, `docs/messaging.md`
- `docs/database.md`, `docs/doc-mgt.md`, `docs/config.md`, `docs/structure.md`

---

## Step 2 — Audit the `prepare` phase

Check whether each expected output of the `prepare` workflow exists and is non-empty:

| Artifact | Expected path |
|---|---|
| Overview | `docs/overview.md` |
| Users & roles | `docs/users.md` |
| Pages & screens | `docs/pages.md` |
| API & messaging | `docs/messaging.md` |
| Database schema | `docs/database.md` |
| Document storage | `docs/doc-mgt.md` (may be absent if not needed) |
| Configuration | `docs/config.md` |
| Folder structure | `docs/structure.md` |
| Wireframes | `wireframes/*.jsx` — list which files exist |

For each item: mark ✅ complete, ⚠️ exists but appears incomplete/stub, or ❌ missing.

---

## Step 3 — Audit the `implement` phase

Check the following on disk in parallel:

**Project scaffold**
- Does `frontend/` contain a Vite/React project? (look for `package.json`, `src/`)
- Does `backend/` contain a Node/Express project? (look for `package.json`, `src/`)
- Does `shared/` contain TypeScript types?
- Does `database/` contain `migrate.sql` and a seed script?

**Dependencies**
- Do `frontend/node_modules` and `backend/node_modules` exist? (i.e., has `npm install` been run?)

**Environment config**
- Do `frontend/.env` and `backend/.env` exist?

**Database**
- Has the migration been applied? (Check `database/migrate.sql` exists; note whether you can verify a live DB without running commands)

**Backend**
- Are route files present in `backend/src/`? List key areas: auth, major resources.

**Frontend**
- Are page components present in `frontend/src/`? Do they map to the pages in `docs/pages.md`?

**Tests**
- Are any test files present (`*.test.ts`, `*.spec.ts`)?

For each item: mark ✅ done, ⚠️ partial, or ❌ not started.

---

## Step 4 — Check for known errors

Look for any of the following signals of past failures:
- `HANDOFF.md` or any doc mentioning errors, blockers, or TODOs
- Any `TODO`, `FIXME`, or `// stub` comments in source files (spot-check a few)
- Missing `.env` files or placeholder values like `YOUR_SECRET_HERE`

---

## Step 5 — Produce the status report

Output a report in this format:

```
## Project: [name from overview.md]

### Prepare Phase
[✅/⚠️/❌] overview.md
[✅/⚠️/❌] users.md
[✅/⚠️/❌] pages.md
[✅/⚠️/❌] messaging.md
[✅/⚠️/❌] database.md
[✅/⚠️/❌] doc-mgt.md
[✅/⚠️/❌] config.md
[✅/⚠️/❌] structure.md
[✅/⚠️/❌] wireframes (N files)

Prepare phase: COMPLETE / INCOMPLETE

### Implement Phase
[✅/⚠️/❌] Project scaffold (frontend / backend / shared / database)
[✅/⚠️/❌] Dependencies installed
[✅/⚠️/❌] .env files present
[✅/⚠️/❌] Database migration script
[✅/⚠️/❌] Backend routes
[✅/⚠️/❌] Frontend pages
[✅/⚠️/❌] Tests

Implement phase: NOT STARTED / IN PROGRESS (last completed step: N) / COMPLETE

### Known Issues
[list any errors, missing secrets, stubs found — or "None detected"]

### Next Step
[Single, specific directive: e.g., "Run /implement — prepare is complete and implementation has not started."
 or "Resume /implement at Step 5 — backend routes are missing."
 or "Run /prepare — docs/pages.md and docs/database.md are missing."]
```
