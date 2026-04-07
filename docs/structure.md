# CapitalFlow LMS — Folder Structure

```
capitalflow/                              # C:/dev/june3/
│
├── HANDOFF.md                            # Project context document (source of truth)
│
├── docs/                                 # All spec documents (this workflow's output)
│   ├── overview.md                       # App description and AI strategy
│   ├── users.md                          # User roles and auth model
│   ├── pages.md                          # All pages with sections and user actions
│   ├── messaging.md                      # REST API endpoints and SSE spec
│   ├── database.md                       # Full SQL schema (all 14 tables)
│   ├── doc-mgt.md                        # Document storage, upload flow, full-text search
│   ├── config.md                         # All environment variables and secrets
│   └── structure.md                      # This file
│
├── wireframes/                           # Interactive JSX wireframes (all portals)
│   ├── home.jsx                          # Public marketing / landing page
│   ├── login.jsx                         # Login page
│   ├── broker-dashboard.jsx              # Broker dashboard
│   ├── broker-pipeline.jsx               # Broker pipeline (loan list)
│   ├── broker-loan-detail.jsx            # Loan detail — broker view (tabbed)
│   ├── broker-new-loan.jsx               # 6-step new loan wizard
│   ├── borrower-dashboard.jsx            # Borrower progress/action dashboard
│   ├── borrower-documents.jsx            # Borrower document upload
│   ├── underwriter-queue.jsx             # UW queue and assignment
│   ├── underwriter-workspace.jsx         # Split-pane UW workspace (most complex)
│   ├── investor-marketplace.jsx          # Loan marketplace listing
│   ├── investor-dashboard.jsx            # Investor portfolio dashboard
│   └── admin-users.jsx                   # Admin user management
│
├── frontend/                             # React 18 SPA (TypeScript, Vite)
│   ├── .env.example                      # Frontend env var template
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── package.json
│   └── src/
│       ├── App.tsx                       # Root app, routing, auth context
│       ├── main.tsx                      # Vite entry point
│       ├── lib/
│       │   ├── api.ts                    # Typed Axios API client (all endpoints)
│       │   ├── auth.ts                   # Cognito/Amplify auth helpers
│       │   └── queryClient.ts            # TanStack Query client config
│       ├── store/                        # Zustand global state stores
│       │   ├── authStore.ts              # Current user, tokens
│       │   └── notificationStore.ts      # Unread count, SSE connection
│       ├── hooks/                        # React Query hooks per API domain
│       │   ├── useLoans.ts
│       │   ├── useDocuments.ts
│       │   ├── useUnderwriting.ts
│       │   ├── useMessages.ts
│       │   └── useNotifications.ts
│       ├── components/                   # Shared/reusable UI components
│       │   ├── ui/                       # Design system primitives
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Modal.tsx
│       │   │   └── Skeleton.tsx
│       │   ├── layout/
│       │   │   ├── AppShell.tsx          # Sidebar + topbar shell
│       │   │   ├── Sidebar.tsx           # Role-specific nav
│       │   │   └── Topbar.tsx            # User menu + notifications bell
│       │   ├── LoanStatusBadge.tsx
│       │   ├── DocumentUpload.tsx        # Drag-and-drop upload component
│       │   ├── AIAssistantPanel.tsx      # Floating AI chat panel
│       │   └── NotificationDropdown.tsx
│       └── pages/
│           ├── public/
│           │   ├── HomePage.tsx
│           │   ├── LoginPage.tsx
│           │   ├── SignUpPage.tsx
│           │   ├── ForgotPasswordPage.tsx
│           │   └── MagicLinkPage.tsx
│           ├── broker/
│           │   ├── BrokerDashboard.tsx
│           │   ├── PipelinePage.tsx
│           │   ├── LoanDetailPage.tsx
│           │   ├── NewLoanPage.tsx
│           │   ├── DocumentsPage.tsx
│           │   └── MessagesPage.tsx
│           ├── borrower/
│           │   ├── BorrowerDashboard.tsx
│           │   ├── PersonalInfoPage.tsx
│           │   ├── BorrowerDocumentsPage.tsx
│           │   └── ClosingReviewPage.tsx
│           ├── underwriter/
│           │   ├── UWQueuePage.tsx
│           │   ├── UWWorkspacePage.tsx
│           │   ├── ConditionsPage.tsx
│           │   └── CreditMemoPage.tsx
│           ├── title/
│           │   ├── TitleDashboard.tsx
│           │   ├── ClosingCoordinatorPage.tsx
│           │   ├── TitleDocumentsPage.tsx
│           │   └── PostClosingPage.tsx
│           ├── investor/
│           │   ├── InvestorDashboard.tsx
│           │   ├── MarketplacePage.tsx
│           │   ├── DataRoomPage.tsx
│           │   └── PortfolioPage.tsx
│           └── admin/
│               ├── AdminDashboard.tsx
│               ├── UserManagementPage.tsx
│               ├── LoanAssignmentPage.tsx
│               └── PlatformConfigPage.tsx
│
├── backend/                              # AWS Lambda functions (Node.js 20, TypeScript)
│   ├── .env.example                      # Backend env var template (local dev)
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma                 # Prisma ORM schema (all 14 models)
│   │   └── migrations/                   # Prisma migration history
│   └── src/
│       ├── middleware/
│       │   └── handler.ts                # Base Lambda handler, auth, DB connection, response helpers
│       ├── api/                          # HTTP API Lambda handlers (one per domain)
│       │   ├── auth.ts                   # Login, logout, refresh, magic-link, forgot/reset
│       │   ├── loans.ts                  # Loan CRUD, state machine, assignment
│       │   ├── documents.ts              # Presigned URL, confirm upload, CRUD, search
│       │   ├── users.ts                  # Profile, invite borrower, admin user management
│       │   ├── underwriting.ts           # UW data, decision, conditions
│       │   ├── closing.ts                # Closing checklist, CTCs, fund
│       │   ├── investor.ts               # Marketplace, portfolio, bids, criteria
│       │   ├── messages.ts               # Per-loan message threads
│       │   └── notifications.ts          # Notification CRUD + SSE stream
│       └── agents/                       # Async AI worker Lambdas (SQS-triggered)
│           ├── aiWorker.ts               # Completeness check, UW analysis, chat, property research
│           ├── emailWorker.ts            # Email intake, attachment routing
│           └── documentWorker.ts         # OCR, AI extraction per document type
│
├── shared/                               # TypeScript types shared between frontend and backend
│   ├── package.json
│   ├── tsconfig.json
│   └── types/
│       ├── user.ts                       # User, UserRole enums
│       ├── loan.ts                       # Loan, LoanStatus, LoanProgram enums
│       ├── document.ts                   # Document, DocumentStatus
│       ├── condition.ts                  # Condition, ConditionStatus
│       ├── notification.ts               # Notification types
│       ├── ai.ts                         # AIAnalysis, AIAnalysisType
│       └── api.ts                        # API request/response shapes
│
├── database/                             # Migration scripts and seed data
│   ├── migrations/                       # Raw SQL migrations (in addition to Prisma)
│   │   └── 001_initial_schema.sql        # Full DDL from database.md
│   └── seeds/
│       ├── 01_admin_user.sql             # Initial admin user
│       ├── 02_test_broker.sql            # Dev/test broker account
│       └── 03_sample_loans.sql           # Sample loan data for development
│
└── infrastructure/                       # AWS CDK v2 (TypeScript)
    ├── cdk.json
    ├── package.json
    ├── tsconfig.json
    ├── bin/
    │   └── capitalflow.ts                # CDK app entry point
    └── lib/
        └── capitalflow-stack.ts          # Complete AWS stack definition
```

## Key Dependency Notes

- `frontend/` depends on `shared/` for type definitions
- `backend/` depends on `shared/` for type definitions
- `infrastructure/` is standalone (CDK deploys the backend, creates all resources)
- `database/migrations/` mirrors `backend/prisma/migrations/` — keep in sync
- Wireframes are standalone JSX; no imports from the main codebase
