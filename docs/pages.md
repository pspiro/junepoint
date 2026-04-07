# CapitalFlow LMS — Pages & Screens

## Design System

- **Primary:** indigo-600 / indigo-700
- **Success/CTA:** emerald-500 / emerald-600
- **Warning:** amber-500
- **Danger:** red-500
- **Info:** sky-500
- **Background:** gray-50 (app shell), white (cards)
- **Typography:** font-sans; headings font-bold; body text-gray-700
- **Border radius:** rounded-xl (cards), rounded-lg (buttons/inputs), rounded-2xl (modals)
- **Shadows:** shadow-sm (cards), shadow-md (dropdowns/modals)
- **Style:** bright, colorful, modern SaaS — not banking-conservative

## Layout Shell (Authenticated Pages)

All authenticated pages share:
- **Left sidebar:** w-64, bg-indigo-900, white text, role-specific navigation links
- **Top bar:** h-16, bg-white, border-b, app name left + user avatar/menu + notifications bell right
- **Content area:** flex-1, bg-gray-50, p-6, overflow-auto

---

## Public Pages

### 1. Home / Marketing Page
- **Route:** `/`
- **Access:** Public (unauthenticated)
- **Purpose:** Introduce CapitalFlow to potential broker and investor customers; drive sign-up
- **Sections:**
  - Sticky nav bar with logo, nav links (Features, How It Works, Pricing, Investors), Login and Get Started buttons
  - Hero section: bold headline, subheadline, two CTA buttons (Get Started as Broker, Login to Platform), hero illustration/dashboard screenshot
  - Features section: 6 feature cards with icons (AI Underwriting, Multi-Portal Access, Document Management, Investor Marketplace, Audit Trail, Real-Time Notifications)
  - How It Works section: 4-step process diagram (Broker Applies → AI Reviews → Underwriter Decides → Investor Buys)
  - Loan Programs section: cards for each of the 6 supported programs
  - Social proof / stats section: key metrics (loans processed, avg. time-to-decision, capital deployed)
  - CTA banner: "Ready to streamline your lending operation?"
  - Footer: links, copyright, legal
- **User actions:** Click Get Started (→ /signup), Click Login (→ /login), scroll through sections

### 2. Login Page
- **Route:** `/login`
- **Access:** Public
- **Purpose:** Email/password authentication for all user types except borrowers
- **Sections:**
  - Centered card with logo
  - Email and password fields
  - "Forgot password?" link
  - Login button
  - Link to sign-up for new brokers
  - MFA prompt (shown after credentials verified for MFA-required roles)
- **User actions:** Enter credentials, submit, handle MFA code entry, navigate to forgot password / sign-up

### 3. Sign-Up Page (Broker Registration)
- **Route:** `/signup`
- **Access:** Public
- **Purpose:** Broker self-registration
- **Sections:**
  - Centered card with logo
  - Fields: First Name, Last Name, Email, Company Name, Phone, Password, Confirm Password
  - Terms of service checkbox
  - Create Account button
  - Link back to login
- **User actions:** Fill form, submit, handle validation errors

### 4. Borrower Magic Link Landing
- **Route:** `/magic/:token`
- **Access:** Public (token validates on server)
- **Purpose:** Borrower entry point from email magic link
- **Sections:**
  - Validating token state (spinner)
  - Success state: welcome message with broker's name, "Access Your Loan Portal" button
  - Error state: expired/invalid link with contact info
- **User actions:** Click through to borrower portal; request new link if expired

### 5. Forgot Password
- **Route:** `/forgot-password`
- **Access:** Public
- **Purpose:** Password reset via Cognito
- **Sections:** Email input, submit button, confirmation message
- **User actions:** Enter email, submit, check email, enter reset code + new password

---

## Broker Portal

### 6. Broker Dashboard
- **Route:** `/broker/dashboard`
- **Access:** BROKER
- **Purpose:** At-a-glance KPIs, alerts, and pipeline health
- **Sections:**
  - KPI cards: Active Loans, Submitted This Month, Awaiting Decision, Avg. AI Score
  - Alert/action items: loans needing attention (missing docs, conditions outstanding)
  - Recent pipeline: last 5 loans with status badge and AI score
  - AI insight panel: auto-generated portfolio summary
  - Quick action buttons: New Loan, Upload Document, View Pipeline
- **User actions:** Click loan → loan detail, click New Loan, dismiss alerts

### 7. Broker Pipeline (Loan List)
- **Route:** `/broker/pipeline`
- **Access:** BROKER
- **Purpose:** Full pipeline table with filtering and sorting
- **Sections:**
  - Search bar + filter row (status, loan program, date range, AI score range)
  - Sortable data table: Loan #, Borrower, Program, Loan Amount, Status badge, AI Score, Days in Status, Actions
  - Pagination
  - Empty state for new brokers
- **User actions:** Filter/search, sort columns, click row → loan detail, click New Loan

### 8. Loan Detail — Broker View
- **Route:** `/broker/loans/:loanId`
- **Access:** BROKER (own loans only)
- **Purpose:** Full loan file view; 5-tab layout
- **Tabs:**
  - **Overview:** Loan summary, borrower info, property info, status tracker, AI completeness score, human decision
  - **Documents:** Document list with AI classification, upload new docs, view/download
  - **Conditions:** Conditions list with status; mark conditions satisfied
  - **Messages:** Threaded conversation with underwriter
  - **Timeline:** Immutable event log (state changes, uploads, decisions)
- **User actions:** Switch tabs, upload doc, send message, submit loan (if DRAFT), view AI analysis

### 9. New Loan Application — 6-Step Wizard
- **Route:** `/broker/loans/new`
- **Access:** BROKER
- **Purpose:** Create a new loan application
- **Steps:**
  1. **Loan Details:** Program type, loan amount, purpose, LTV, term
  2. **Property:** Address, type, value, occupancy, flood zone
  3. **Borrower:** Select existing borrower or invite new (email → magic link sent)
  4. **Financials:** Income, assets, liabilities, DSCR inputs if applicable
  5. **Documents:** Upload required docs with AI classification feedback
  6. **Review & Submit:** Full summary; submit triggers AI completeness check
- **User actions:** Navigate steps forward/back, fill all fields, upload docs, submit, save as draft

### 10. Broker Documents (Cross-Pipeline View)
- **Route:** `/broker/documents`
- **Access:** BROKER
- **Purpose:** View all documents across all their loans
- **Sections:**
  - Filter by loan, doc type, upload date, status
  - Document table: name, loan #, type (AI classified), uploaded date, status
- **User actions:** Filter, click doc → open/download, upload new doc

### 11. Broker Messages (Inbox)
- **Route:** `/broker/messages`
- **Access:** BROKER
- **Purpose:** Unified message inbox across all loans
- **Sections:**
  - Left panel: conversation list (loan #, last message preview, unread badge)
  - Right panel: active thread with send input
- **User actions:** Select conversation, send message, mark read

---

## Borrower Portal

### 12. Borrower Dashboard
- **Route:** `/borrower/dashboard`
- **Access:** BORROWER
- **Purpose:** Loan progress tracker and action item list
- **Sections:**
  - Loan status progress bar (visual step-through of lifecycle stages)
  - Action items: what the borrower still needs to complete
  - Document upload status: what's been received and what's still needed
  - Contact info: assigned broker's details
- **User actions:** Click action item, navigate to upload, view status

### 13. Borrower Personal Information
- **Route:** `/borrower/profile`
- **Access:** BORROWER
- **Purpose:** Complete personal and financial identity information
- **Sections:**
  - Personal: full legal name, SSN (masked), DOB, address, citizenship
  - Employment: employer, income, employment type
  - Co-borrower toggle (if applicable)
  - Save / mark complete button
- **User actions:** Fill fields, save progress, mark complete

### 14. Borrower Document Upload
- **Route:** `/borrower/documents`
- **Access:** BORROWER
- **Purpose:** Upload required financial documents
- **Sections:**
  - Required documents checklist with status (Pending / Uploaded / Accepted / Rejected)
  - Drag-and-drop upload zone per document type
  - Uploaded file list with AI classification result and status
- **User actions:** Drag-drop or browse to upload, view classification, re-upload if rejected

### 15. Closing Disclosure Review
- **Route:** `/borrower/closing`
- **Access:** BORROWER (only when loan is IN_CLOSING or later)
- **Purpose:** Borrower reviews and acknowledges closing documents
- **Sections:**
  - Document list: closing disclosure, promissory note, deed of trust (inline viewer or download)
  - Acknowledge button per document
  - Overall "Ready to Close" status indicator
- **User actions:** View doc, acknowledge, contact broker if questions

---

## Underwriter Portal

### 16. Underwriter Queue
- **Route:** `/underwriter/queue`
- **Access:** UNDERWRITER
- **Purpose:** Prioritized list of loans awaiting underwriting
- **Sections:**
  - Filter/sort: program, AI score, loan amount, days waiting
  - Queue table: Loan #, Borrower, Program, Amount, AI Score, AI Recommendation, Days in Queue, Assign to Me button
  - My Active Reviews: loans I'm currently working
- **User actions:** Filter, sort, claim a loan, open loan in workspace

### 17. Underwriting Workspace
- **Route:** `/underwriter/loans/:loanId`
- **Access:** UNDERWRITER
- **Purpose:** Core underwriting screen — most complex page in the system
- **Layout:** Split pane
  - **Left pane:** Document viewer (PDF/image inline) with AI OCR extraction overlay
  - **Right pane:** tabbed analysis panel
    - AI Report: completeness score, risk scores by category (LTV, DSCR, credit, property, borrower), composite score, recommendation, draft credit memo
    - Conditions: existing conditions, add new condition, update status
    - Loan Data: all loan and borrower fields editable by UW
    - Notes: internal UW notes (not visible to broker)
- **Decision panel (bottom):** Approve / Conditionally Approve / Decline / Suspend buttons + notes field + submit decision
- **User actions:** Browse documents, read AI analysis, override AI fields (logged), add/edit conditions, write notes, issue decision

### 18. Condition Management
- **Route:** `/underwriter/loans/:loanId/conditions`
- **Access:** UNDERWRITER
- **Purpose:** Manage all conditions for a loan
- **Sections:**
  - Add condition (type, description, due date, responsible party)
  - Conditions table: description, type, status, responsible party, due date, last updated
  - Bulk actions: mark satisfied, request additional info
- **User actions:** Add condition, update status, bulk update, link doc to condition

### 19. Credit Memo & Decision
- **Route:** `/underwriter/loans/:loanId/decision`
- **Access:** UNDERWRITER
- **Purpose:** Finalize and issue the credit decision
- **Sections:**
  - Credit memo editor (rich text): pre-populated by AI, editable by UW
  - Decision selector: Approve / Conditionally Approve / Decline / Suspend
  - Conditions to attach to this decision
  - AI recommendation vs. human decision comparison (if override)
  - Override reason (required if overriding AI recommendation)
  - Submit decision button
- **User actions:** Edit credit memo, select decision, attach conditions, note override reason, submit

---

## Title Clerk Portal

### 20. Title Dashboard
- **Route:** `/title/dashboard`
- **Access:** TITLE
- **Purpose:** Title clerk's overview of loans in closing
- **Sections:**
  - Active closing loans: status, CTCs outstanding, days to target close
  - Urgent items: overdue conditions, missing documents
  - Quick links: upload docs, update CTC status
- **User actions:** Click loan → closing coordinator view, mark items done

### 21. Closing Coordinator View
- **Route:** `/title/loans/:loanId`
- **Access:** TITLE
- **Purpose:** Manage all conditions-to-close for a specific loan
- **Sections:**
  - Closing checklist: all CTCs with status (Pending / Received / Approved)
  - Document upload zone: upload closing docs linked to specific CTCs
  - Wire confirmation: record wire amount, date, account last 4
  - Recording info: record number, date, county
  - Fund loan button (final action)
- **User actions:** Update CTC status, upload docs, record wire, mark funded

### 22. Title Document Management
- **Route:** `/title/documents`
- **Access:** TITLE
- **Purpose:** View all title-related docs across active closings
- **Sections:** Same structure as Broker Documents view but filtered to title/closing doc types
- **User actions:** Filter, view, upload, link to closing

### 23. Post-Closing Upload
- **Route:** `/title/loans/:loanId/post-closing`
- **Access:** TITLE
- **Purpose:** Upload post-closing documents (recorded deed, final title policy)
- **Sections:** Document type checklist, upload zone, confirmation submit
- **User actions:** Upload docs by type, submit complete package

---

## Investor Portal

### 24. Investor Dashboard
- **Route:** `/investor/dashboard`
- **Access:** INVESTOR
- **Purpose:** Portfolio summary and marketplace highlights
- **Sections:**
  - Portfolio KPIs: total deployed, # loans held, avg. yield, total interest received
  - Active marketplace listings matched to investor criteria
  - Recent activity: bids placed, loans purchased
  - Investor criteria card: summary of current purchase preferences with Edit button
- **User actions:** Click loan → marketplace detail, click portfolio loan → data room, edit criteria

### 25. Loan Marketplace
- **Route:** `/investor/marketplace`
- **Access:** INVESTOR
- **Purpose:** Browse closed loans available for purchase
- **Sections:**
  - Filter/search: program, loan amount range, yield range, LTV range, state
  - Loan cards/table: Loan #, program, amount, LTV, DSCR, yield, AI summary snippet, days on market, Bid button
  - AI-match score: how well this loan matches investor's criteria
- **User actions:** Filter, view loan detail, open data room, submit bid

### 26. Loan Due Diligence Data Room
- **Route:** `/investor/marketplace/:loanId`
- **Access:** INVESTOR
- **Purpose:** Full diligence view for a specific loan listing
- **Sections:**
  - Loan summary: all financial metrics, property info, borrower profile (anonymized)
  - AI-generated investment summary
  - Document list: available closing docs, appraisal, title policy
  - Bid submission form: amount, terms
  - Current bid status if already bid
- **User actions:** Read summary, download docs, submit or update bid

### 27. Investor Portfolio
- **Route:** `/investor/portfolio`
- **Access:** INVESTOR
- **Purpose:** Manage purchased loans
- **Sections:**
  - Portfolio table: Loan #, program, original amount, outstanding balance, interest earned, status
  - Performance summary chart
  - Export to CSV button
- **User actions:** View loan details, export data

---

## Admin Portal

### 28. Admin Dashboard
- **Route:** `/admin/dashboard`
- **Access:** ADMIN
- **Purpose:** Platform-wide overview
- **Sections:**
  - System KPIs: total users, active loans, loans this month, capital in pipeline
  - Recent activity log: last 20 system events
  - Loans needing assignment: unassigned loans in IN_REVIEW state
- **User actions:** Click loan to assign, navigate to user management

### 29. User Management
- **Route:** `/admin/users`
- **Access:** ADMIN
- **Purpose:** Create, view, edit, and deactivate all platform users
- **Sections:**
  - Filter by role, status (active/inactive)
  - Users table: name, email, role badge, company, status, last login, Actions (Edit, Deactivate)
  - Add User button → modal: first name, last name, email, role, company
  - Edit User modal: same fields + reset password option
- **User actions:** Filter, add user, edit user, deactivate user, reset password

### 30. Loan Assignment
- **Route:** `/admin/loans`
- **Access:** ADMIN
- **Purpose:** Assign submitted loans to underwriters
- **Sections:**
  - Unassigned loans table: Loan #, broker, program, amount, submitted date
  - Assign UW dropdown per row (shows all active underwriters with current workload count)
  - All loans view: full pipeline with all status types, filter/search
- **User actions:** Assign loan to underwriter, reassign, view loan detail

### 31. Platform Configuration
- **Route:** `/admin/config`
- **Access:** ADMIN
- **Purpose:** Manage platform settings and feature flags
- **Sections:**
  - Email intake settings: inbound email address, routing rules
  - Notification templates: edit email notification text
  - Feature flags: enable/disable beta features
  - AI configuration: default model, temperature (display only)
- **User actions:** Update settings, save changes
