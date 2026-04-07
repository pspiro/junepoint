# CapitalFlow LMS — AI Handoff Document
## Complete Project Context for Continuation

---

## 1. WHAT THIS PROJECT IS

**CapitalFlow LMS** is a full-lifecycle private mortgage lending platform being built from scratch. It is a multi-sided SaaS application connecting:

- **Mortgage Brokers** — originate loans, submit applications, upload documents, track pipeline
- **Borrowers** — complete personal info, upload financial documents, track loan status
- **Human Underwriters** — analyze loan files, set conditions, issue credit decisions
- **AI Underwriter Agent** — automated first-pass risk scoring and application analysis
- **Title Clerks** — manage closing documents, track conditions-to-close
- **Investors** — browse closed loans for purchase, manage portfolio
- **Email Intake Agent** — receives documents via email, classifies and routes them to loan files

The lending company is the platform operator. Brokers and investors are B2B customers. Borrowers are end users invited by brokers.

---

## 2. DESIGN DECISIONS ALREADY MADE

### Business Logic
- Loan lifecycle states: `DRAFT → SUBMITTED → IN_REVIEW → CONDITIONALLY_APPROVED → APPROVED → IN_CLOSING → CLOSED → ON_MARKET → SOLD` (plus `SUSPENDED` and `DECLINED`)
- Brokers create loan applications. Borrowers are invited via magic link to self-complete
- AI runs completeness check first, then full underwriting analysis, before human UW reviews
- Human underwriter always makes the final credit decision — AI produces a scored recommendation only
- Documents can arrive via portal upload or inbound email (auto-classified by AI)
- Closed loans can be listed on an investor marketplace for purchase

### Loan Programs Supported
- Bridge Loan
- DSCR (Debt Service Coverage Ratio)
- Fix & Flip
- Long-Term Rental
- Construction
- Commercial

### AI Strategy
- AI model: **Claude (Anthropic)** — `claude-sonnet-4-20250514`
- AI has **web search tool access** for property research and market analysis
- AI agents are event-driven (triggered by SQS queue messages)
- Every AI analysis is stored in full with input snapshot, output, scores, and reasoning
- Human underwriters can override AI decisions — overrides are logged
- Fair lending: all AI decisions stored for audit/compliance review

### Authentication
- **AWS Cognito** for all users
- MFA required for internal users (underwriters, title, admin)
- Magic link / OTP for borrowers (lower friction)
- JWT tokens, 1-hour access token, 30-day refresh

### Key Design Principles
1. AI-first: AI assistance available on every screen, contextually aware
2. Role-gated: Each user type sees only their relevant data
3. Document-centric: Documents are first-class entities with AI classification and version history
4. Event-driven: All state changes emit events for agents and audit trail
5. No hardcoded credentials anywhere — all secrets in AWS Secrets Manager

---

## 3. COMPLETE TECHNICAL STACK

### Frontend
- **React 18** with TypeScript
- **Vite** build tool
- **React Router v6** for routing
- **TanStack Query** for data fetching/caching
- **Zustand** for global state
- **Tailwind CSS** for styling
- **AWS Amplify** for Cognito auth integration
- **Axios** for HTTP client

### Backend
- **AWS Lambda** (Node.js 20) — one function per service domain
- **TypeScript** throughout
- **Prisma ORM** for database access
- **AWS API Gateway HTTP API** for routing
- **Zod** for runtime validation

### Database
- **AWS Aurora PostgreSQL Serverless v2** — scales to zero when idle
- **Prisma** schema and migrations
- **AWS ElastiCache Redis** — sessions and queue state

### Infrastructure
- **AWS CDK v2** (TypeScript) — all infrastructure as code
- **CloudFront** CDN — serves frontend + proxies API
- **S3** — frontend static assets + encrypted document storage
- **SQS** — async job queues (AI analysis, email intake, notifications, document processing)
- **SES** — email sending and receiving
- **Secrets Manager** — all credentials
- **CloudWatch + X-Ray** — observability
- **WAF** — web application firewall

### AI / Agents
- **Anthropic Claude API** (`@anthropic-ai/sdk`)
- Web search tool enabled on underwriting and research agents
- Agents run as Lambda functions triggered by SQS

### Deployment
- Primary region: `us-east-1`
- No local machine needed — entire deployment done via **AWS CloudShell** (browser terminal)
- One command deploys everything: `cdk deploy --all`

---

## 4. PROJECT FOLDER STRUCTURE

```
capitalflow/
│
├── infrastructure/                    # AWS CDK infrastructure (TypeScript)
│   ├── bin/
│   │   └── capitalflow.ts             # CDK app entry point
│   ├── lib/
│   │   └── capitalflow-stack.ts       # COMPLETE AWS stack definition
│   ├── cdk.json                       # CDK config
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                           # Lambda functions (TypeScript)
│   ├── prisma/
│   │   └── schema.prisma              # COMPLETE database schema
│   ├── src/
│   │   ├── middleware/
│   │   │   └── handler.ts             # Base Lambda handler, auth, DB connection
│   │   ├── api/                       # HTTP API Lambda handlers
│   │   │   ├── auth.ts                # Login, magic link, JWT issuance
│   │   │   ├── loans.ts               # Loan CRUD, state machine
│   │   │   ├── documents.ts           # S3 upload flow, document management
│   │   │   ├── users.ts               # User profiles, borrower invite
│   │   │   ├── underwriting.ts        # UW queue, conditions, decisions
│   │   │   ├── closing.ts             # Closing checklist, CTCs, funding
│   │   │   ├── investor.ts            # Marketplace, portfolio, bids
│   │   │   ├── messages.ts            # Per-loan messaging threads
│   │   │   └── notifications.ts       # In-app notification management
│   │   └── agents/                    # Async AI worker Lambdas
│   │       ├── aiWorker.ts            # Completeness check + UW analysis + chat
│   │       ├── emailWorker.ts         # Email intake, attachment routing
│   │       └── documentWorker.ts      # OCR, deeper AI extraction per document
│   └── package.json
│
├── frontend/                          # React SPA (TypeScript)
│   ├── src/
│   │   ├── App.tsx                    # Root app, routing, auth context
│   │   ├── lib/
│   │   │   └── api.ts                 # Typed API client (all endpoints)
│   │   ├── components/
│   │   │   └── ui.tsx                 # Shared UI component library
│   │   └── pages/
│   │       ├── LoginPage.tsx          # Auth screen
│   │       └── MagicLinkPage.tsx      # Borrower magic link entry
│   └── package.json
│
├── docs/
│   ├── AWS_ARCHITECTURE.md            # Architecture diagram + cost estimate
│   └── DEPLOYMENT_GUIDE.md           # Step-by-step deploy guide (CloudShell)
│
└── wireframes/                        # UI mockups (React/JSX, interactive)
    ├── lending-platform-design.jsx    # Full system design spec (all screens described)
    └── broker-portal.jsx              # Complete interactive broker portal mockup
```

---

## 5. DATABASE SCHEMA SUMMARY

All models defined in `backend/prisma/schema.prisma`:

| Model | Purpose |
|-------|---------|
| `User` | All user types (broker, borrower, UW, title, investor, admin) |
| `Loan` | Core loan record with all fields, AI scores, human decision |
| `BorrowerProfile` | Borrower financial/identity profile, linked to loan |
| `Document` | Uploaded files with AI classification, S3 key, version history |
| `Condition` | Loan approval conditions with status tracking |
| `AIAnalysis` | Full record of every AI agent run — input, output, scores, reasoning |
| `Message` | Per-loan communication threads between all parties |
| `Notification` | In-app and email notification records |
| `LoanEvent` | Immutable audit log — every state change, action, actor |
| `ClosingChecklist` | All CTCs, signing, wire, recording status per loan |
| `InvestorCriteria` | Each investor's loan purchase preferences |
| `InvestorListing` | Closed loans listed for sale with AI summary |
| `InvestorBid` | Bids submitted by investors |
| `AuditLog` | System-wide security audit trail |

---

## 6. API ENDPOINTS (ALL DEFINED)

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/magic-link

GET    /api/loans
POST   /api/loans
GET    /api/loans/{loanId}
PUT    /api/loans/{loanId}
POST   /api/loans/{loanId}/submit
POST   /api/loans/{loanId}/events          (status transitions)

GET    /api/loans/{loanId}/documents
POST   /api/loans/{loanId}/documents       (confirm upload)
GET    /api/loans/{loanId}/documents/{docId}
PUT    /api/loans/{loanId}/documents/{docId}
POST   /api/documents/presigned-url        (S3 direct upload)

GET    /api/users/me
PUT    /api/users/me
GET    /api/users/{userId}
POST   /api/users/invite                   (broker invites borrower)

GET    /api/loans/{loanId}/underwriting
POST   /api/loans/{loanId}/underwriting/decision
GET    /api/loans/{loanId}/conditions
POST   /api/loans/{loanId}/conditions
PUT    /api/loans/{loanId}/conditions/{condId}

GET    /api/loans/{loanId}/closing
POST   /api/loans/{loanId}/closing/ctc
POST   /api/loans/{loanId}/closing/fund

GET    /api/marketplace
GET    /api/portfolio
POST   /api/marketplace/{loanId}/bid

GET    /api/loans/{loanId}/messages
POST   /api/loans/{loanId}/messages

GET    /api/notifications
PUT    /api/notifications/{id}/read

POST   /api/ai/chat
POST   /api/ai/analyze/{loanId}
```

---

## 7. AI AGENTS (ALL DESIGNED AND PARTIALLY IMPLEMENTED)

### Agent 1: Completeness & Intake Agent
- **File:** `backend/src/agents/aiWorker.ts` → `runCompletenessCheck()`
- **Trigger:** SQS message `type: "COMPLETENESS_CHECK"` — fired when loan is submitted
- **Output:** Completeness score 0–100, missing items list, data inconsistencies, flags
- **Status:** ✅ Implemented

### Agent 2: AI Underwriting Agent
- **File:** `backend/src/agents/aiWorker.ts` → `runUnderwritingAnalysis()`
- **Trigger:** SQS message `type: "UNDERWRITING_ANALYSIS"` — fired after completeness passes
- **Output:** Risk scores by category, composite score, recommendation, suggested conditions, draft credit memo
- **Features:** Has web search tool access for comp research and market data
- **Status:** ✅ Implemented

### Agent 3: Email Intake Agent
- **File:** `backend/src/agents/emailWorker.ts`
- **Trigger:** SQS from SES — fires when email arrives at intake address
- **Output:** Attachments classified, uploaded to S3, linked to correct loan, confirmation sent
- **Matching logic:** Loan ID in subject → borrower email match → recent active loan
- **Status:** ✅ Implemented

### Agent 4: Document Processing Agent
- **File:** `backend/src/agents/documentWorker.ts`
- **Trigger:** SQS `doc-processing-queue` after any document upload
- **Output:** Deeper data extraction per document type (bank statement income, tax return income, etc.)
- **Status:** ✅ Implemented (scaffold)

### Agent 5: Property Research Agent
- **Status:** 🔲 NOT YET IMPLEMENTED
- **Planned:** On-demand agent invoked by broker or underwriter
- **Capabilities:** Pull public records, run comps, estimate value, analyze rental market, flood zone, neighborhood trends
- **Where to add:** New function in `aiWorker.ts`, new API route `POST /api/ai/property-research`

### Agent 6: Investor Matching Agent
- **Status:** 🔲 NOT YET IMPLEMENTED
- **Planned:** Runs when loan is marked CLOSED and post-closing docs complete
- **Capabilities:** Score loan against each investor's criteria, auto-generate marketplace listing, notify matched investors
- **Where to add:** New SQS message type in `aiWorker.ts`, triggered from `closing.ts` on fund confirmation

### Agent 7: Contextual Chat Assistant
- **File:** `backend/src/agents/aiWorker.ts` → `handleChatRequest()`
- **Trigger:** Direct HTTP call `POST /api/ai/chat`
- **Features:** Context-aware (knows current loan), web search enabled, can draft messages
- **Status:** ✅ Implemented

---

## 8. WHAT IS COMPLETE

### ✅ Fully Done
- Complete AWS infrastructure (CDK) — VPC, RDS, Redis, Lambda, API Gateway, CloudFront, S3, Cognito, SQS, SES, WAF, CloudWatch
- Complete database schema (Prisma) — all 14 models with relationships and enums
- Backend middleware — Lambda handler base, JWT auth, DB pooling, response helpers
- All API Lambda handlers — auth, loans, documents, users, underwriting, closing, investor, messages, notifications
- AI agents — completeness check, underwriting analysis (with web search), email intake, document processing, chat assistant
- Frontend API client — typed client for all endpoints
- Frontend app shell — routing, auth context, login pages
- Deployment guide — complete step-by-step from zero to live using AWS CloudShell only
- System design spec — all screens and workflows documented (interactive JSX wireframe)
- Broker portal UI — fully interactive React mockup with all screens

### 🔲 Not Yet Built
- Borrower portal screens (UI only — API exists)
- Underwriter workspace screens (UI only — API exists)
- Title clerk portal screens (UI only — API exists)
- Investor portal screens (UI only — API exists)
- Admin portal (user management, loan assignment, reporting)
- Property Research Agent (Agent 5)
- Investor Matching Agent (Agent 6)
- Frontend state management (Zustand stores)
- React Query hooks for each API endpoint
- Document upload component with drag-and-drop
- AI assistant floating panel (frontend component)
- Real-time notifications (WebSocket or polling)
- Credit pull integration (soft pull API)
- E-signature integration (DocuSign or Notarize.com)
- Wire/ACH payment integration
- Automated testing (unit + integration)
- CI/CD pipeline (GitHub Actions → CDK deploy)

---

## 9. SCREENS DESIGNED (WIREFRAMES EXIST)

All screens are documented in `wireframes/lending-platform-design.jsx` (interactive spec).
The broker portal has a fully interactive mockup in `wireframes/broker-portal.jsx`.

### Broker Portal (wireframe complete)
1. Dashboard — KPIs, alerts, pipeline status, AI insight
2. My Pipeline — loan table with filters, status badges, AI scores
3. Loan Detail — 5 tabs: Overview, Documents, Conditions, Messages, Timeline
4. New Loan Application — 6-step wizard (Loan Details → Property → Borrower → Financials → Documents → Review)
5. Documents — cross-pipeline document view
6. Messages — threaded inbox
7. Settings

### Borrower Portal (spec only, no code)
1. Welcome & Identity Verification
2. Borrower Dashboard — progress tracker, action items
3. Personal Information Form
4. Document Upload Center
5. Closing Disclosure Review

### Underwriter Portal (spec only, no code)
1. Underwriter Queue
2. Underwriting Workspace — split-pane with document viewer + AI report
3. Condition Management
4. Credit Memo & Decision

### Title Clerk Portal (spec only, no code)
1. Title Dashboard
2. Title Document Management
3. Closing Coordinator View
4. Post-Closing Upload

### Investor Portal (spec only, no code)
1. Investor Dashboard
2. Loan Marketplace
3. Due Diligence Data Room
4. Portfolio Management

### Admin Portal (not yet designed)
- User management
- Loan assignment
- Reporting and analytics
- Platform configuration

---

## 10. ENVIRONMENT VARIABLES NEEDED

### Backend Lambda functions (set via CDK — already wired)
```
NODE_ENV                    dev | prod
DB_SECRET_ARN               ARN of RDS credentials in Secrets Manager
JWT_SECRET_ARN              ARN of JWT signing secret
ANTHROPIC_KEY_ARN           ARN of Anthropic API key
DOCUMENTS_BUCKET            S3 bucket name for loan documents
EMAIL_BUCKET                S3 bucket name for inbound emails
COGNITO_USER_POOL_ID        Cognito user pool ID
COGNITO_CLIENT_ID           Cognito app client ID
REDIS_HOST                  ElastiCache endpoint
REDIS_PORT                  6379
AI_ANALYSIS_QUEUE_URL       SQS queue URL
NOTIFICATION_QUEUE_URL      SQS queue URL
DOC_PROCESSING_QUEUE_URL    SQS queue URL
```

### Frontend (.env.production)
```
VITE_API_URL                https://your-cloudfront-url.cloudfront.net
VITE_COGNITO_USER_POOL_ID   us-east-1_XXXXXXXX
VITE_COGNITO_CLIENT_ID      xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_REGION         us-east-1
```

### Secrets to set manually after deploy (in Secrets Manager)
```
capitalflow/{env}/anthropic-api-key    { "key": "sk-ant-..." }
```
All other secrets are auto-generated by CDK.

---

## 11. RECOMMENDED NEXT STEPS (IN ORDER)

1. **Build Borrower Portal UI** — simplest portal, good for testing the full application flow end-to-end
2. **Build Underwriter Workspace UI** — most complex screen, where the most value is delivered
3. **Add Property Research Agent** — high-value AI feature, straightforward to add
4. **Build Investor Matching Agent** — enables the loan sale revenue stream
5. **Build Admin Portal** — needed before going live (user management, loan assignment)
6. **Add document upload component** — drag-and-drop, progress bar, real-time AI classification feedback
7. **Add real-time notifications** — WebSocket or SQS long-polling
8. **Write automated tests** — Jest for backend, React Testing Library for frontend
9. **Set up CI/CD** — GitHub Actions: push to main → build → CDK deploy → invalidate CloudFront
10. **Integrate e-signature** — DocuSign or Notarize.com for closing documents
11. **Production domain setup** — Route53, ACM certificate, CloudFront custom domain

---

## 12. IMPORTANT ARCHITECTURAL NOTES FOR AI CONTINUATION

- **Lambda cold starts:** All Lambdas share a `getPrisma()` singleton that reuses DB connections across warm invocations. Do not create new PrismaClient instances per request.
- **Document upload flow:** Three-step process — (1) get presigned URL from backend, (2) PUT directly to S3 from browser (bypasses Lambda size limits), (3) POST confirmation to backend to trigger AI processing. Do not try to proxy files through Lambda.
- **AI job queue:** All AI analysis is async via SQS. Never call the Anthropic API synchronously from an HTTP request handler — always enqueue and return immediately. The `aiWorker` Lambda picks up the job.
- **State machine:** Loan status transitions are enforced by `VALID_TRANSITIONS` in `loans.ts`. Do not bypass this — add new transitions there if needed.
- **Role access pattern:** Every API handler checks `user.role` before returning data. The pattern is established in `loans.ts` — follow it for all new endpoints.
- **Secrets:** Never use `process.env` for API keys or passwords. Always use `getSecret(arn)` from `handler.ts` which fetches from Secrets Manager and caches in memory.
- **Audit trail:** Every significant action should create a `LoanEvent` record. This is the immutable audit log used for compliance.
- **AI analysis storage:** Every AI call stores its full input and output in the `AIAnalysis` table. This is required for fair lending compliance and debugging. Do not skip this.

---

## 13. FILE CONTENTS REFERENCE

All source files are included in the zip. Key files to read first when continuing:

1. `backend/prisma/schema.prisma` — understand the data model before writing any new code
2. `backend/src/middleware/handler.ts` — understand the base pattern before writing new Lambda handlers
3. `backend/src/api/loans.ts` — the reference implementation for API handlers
4. `backend/src/agents/aiWorker.ts` — the reference implementation for AI agents
5. `infrastructure/lib/capitalflow-stack.ts` — understand what AWS resources exist before adding more
6. `docs/DEPLOYMENT_GUIDE.md` — deploy using AWS CloudShell, no local machine needed
7. `wireframes/lending-platform-design.jsx` — interactive spec for all screens (open in a React environment)
8. `wireframes/broker-portal.jsx` — fully interactive broker portal mockup

---

## 14. CONVENTIONS TO FOLLOW

- All backend files use `createHandler([routes])` pattern from `middleware/handler.ts`
- All new API routes must be added to both the handler file AND `infrastructure/lib/capitalflow-stack.ts` routes array
- TypeScript strict mode is on — no `any` types except where explicitly needed
- All monetary values stored as `Decimal` in Postgres (`@db.Decimal(12,2)`)
- All IDs are UUIDs generated with `uuid()` — never use auto-increment integers
- Dates are stored as `DateTime` (UTC) in Postgres — always use `new Date()` not string dates
- Error responses use the helpers: `error()`, `unauthorized()`, `forbidden()`, `notFound()`, `serverError()`
- SQS messages always include `loanId` and `triggeredBy` fields
- New agents follow the pattern in `aiWorker.ts`: validate input → call Claude → store in AIAnalysis table → update loan record → enqueue any follow-up jobs

---

*This document was generated at the end of the initial build session. The zip file contains all source code. Feed this document to the next AI assistant to continue development without losing context.*
