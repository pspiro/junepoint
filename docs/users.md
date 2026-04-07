# CapitalFlow LMS — Users & Roles

## Authentication

- All users authenticate with **email and password** via AWS Cognito
- MFA is **required** for internal users: underwriters, title clerks, admins
- Borrowers use **magic link / OTP** (lower friction — no password required)
- JWT tokens: 1-hour access token, 30-day refresh token
- Session strategy: AWS Amplify on frontend + Cognito JWT verification in Lambda middleware

## Registration

- **Brokers** register directly via the public sign-up page
- **Borrowers** are invited by their broker via magic link email; they complete identity and profile on first visit
- **Internal users** (underwriters, title, admin) are created by an admin via the Admin Portal
- **Investors** are onboarded by the admin

## User Roles

### `BROKER`
- Originates loan applications
- Invites borrowers to self-complete their portion
- Uploads documents on behalf of borrowers
- Tracks pipeline status and AI scores
- Communicates with underwriters via per-loan message threads
- Access: Broker Portal only

### `BORROWER`
- Receives magic link invitation from broker
- Completes personal information and financial details
- Uploads financial documents (pay stubs, tax returns, bank statements)
- Reviews and acknowledges closing disclosures
- Tracks their own loan status
- Access: Borrower Portal only (limited to their own loan)

### `UNDERWRITER`
- Reviews submitted loan files in a queue
- Reads AI underwriting analysis and can override AI recommendations
- Sets approval conditions
- Issues credit decisions (approve / conditionally approve / decline / suspend)
- All overrides of AI decisions are logged for compliance
- Access: Underwriter Portal; MFA required

### `TITLE`
- Manages closing documents and conditions-to-close (CTCs)
- Tracks signing, wire confirmation, and recording status
- Uploads post-closing documents
- Access: Title Portal; MFA required

### `INVESTOR`
- Browses closed loans listed on the marketplace
- Reviews loan due diligence data rooms
- Submits bids to purchase loans
- Manages their portfolio of purchased loans
- Configures loan purchase criteria (used by the Investor Matching Agent)
- Access: Investor Portal

### `ADMIN`
- Manages all users (create, deactivate, assign roles)
- Assigns loans to underwriters
- Views platform-wide reporting and analytics
- Configures platform settings
- Access: Admin Portal; MFA required

## Users Table Minimum Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `email` | String | Unique; used as username |
| `password_hash` | String | Managed by Cognito; stored for reference |
| `first_name` | String | Required at registration |
| `last_name` | String | Required at registration |
| `role` | Enum | BROKER, BORROWER, UNDERWRITER, TITLE, INVESTOR, ADMIN |
| `company_name` | String | Optional; broker's firm or investor's firm |
| `phone` | String | Optional |
| `mfa_enabled` | Boolean | Required true for UNDERWRITER, TITLE, ADMIN |
| `is_active` | Boolean | Soft-delete / deactivation flag |
| `created_at` | DateTime | UTC |
| `last_login_at` | DateTime | UTC |
