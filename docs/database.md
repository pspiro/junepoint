# CapitalFlow LMS — Database Schema

## Engine

**AWS Aurora PostgreSQL Serverless v2** (scales to zero when idle)
ORM: **Prisma** with TypeScript

## Conventions

- All IDs: `UUID` generated server-side (never auto-increment)
- All monetary values: `DECIMAL(12,2)` 
- All timestamps: `TIMESTAMP WITH TIME ZONE` (UTC), named `created_at` / `updated_at`
- Soft deletes via `is_active` boolean where applicable (users); physical deletes not used for auditable entities

---

## Enums

```sql
CREATE TYPE user_role AS ENUM ('BROKER','BORROWER','UNDERWRITER','TITLE','INVESTOR','ADMIN');

CREATE TYPE loan_status AS ENUM (
  'DRAFT','SUBMITTED','IN_REVIEW','CONDITIONALLY_APPROVED',
  'APPROVED','IN_CLOSING','CLOSED','ON_MARKET','SOLD','SUSPENDED','DECLINED'
);

CREATE TYPE loan_program AS ENUM (
  'BRIDGE','DSCR','FIX_FLIP','LONG_TERM_RENTAL','CONSTRUCTION','COMMERCIAL'
);

CREATE TYPE document_status AS ENUM ('PENDING','PROCESSING','ACCEPTED','REJECTED');

CREATE TYPE condition_status AS ENUM ('OPEN','SATISFIED','WAIVED');

CREATE TYPE condition_party AS ENUM ('BROKER','BORROWER','TITLE');

CREATE TYPE ai_analysis_type AS ENUM (
  'COMPLETENESS','UNDERWRITING','DOCUMENT_PROCESSING',
  'PROPERTY_RESEARCH','INVESTOR_MATCHING','CHAT'
);

CREATE TYPE credit_decision AS ENUM ('APPROVED','CONDITIONALLY_APPROVED','DECLINED','SUSPENDED');

CREATE TYPE ctc_status AS ENUM ('PENDING','RECEIVED','APPROVED');

CREATE TYPE bid_status AS ENUM ('PENDING','ACCEPTED','REJECTED','WITHDRAWN');
```

---

## Tables

### `users`
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255),            -- managed by Cognito; stored for reference
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  role            user_role NOT NULL,
  company_name    VARCHAR(255),
  phone           VARCHAR(30),
  mfa_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  cognito_sub     VARCHAR(255) UNIQUE,     -- Cognito user pool subject ID
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at   TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### `loans`
```sql
CREATE TABLE loans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_number         VARCHAR(20) UNIQUE NOT NULL,  -- human-readable, e.g. "CF-2025-00142"
  broker_id           UUID NOT NULL REFERENCES users(id),
  borrower_id         UUID REFERENCES users(id),
  assigned_uw_id      UUID REFERENCES users(id),    -- assigned underwriter
  program             loan_program NOT NULL,
  status              loan_status NOT NULL DEFAULT 'DRAFT',
  loan_amount         DECIMAL(12,2) NOT NULL,
  purpose             VARCHAR(500),
  ltv                 DECIMAL(5,2),                 -- loan-to-value ratio
  term_months         INTEGER,
  interest_rate       DECIMAL(5,4),                 -- stored as decimal e.g. 0.0875
  
  -- Property
  property_address    VARCHAR(500),
  property_city       VARCHAR(100),
  property_state      CHAR(2),
  property_zip        VARCHAR(10),
  property_type       VARCHAR(100),
  property_value      DECIMAL(12,2),
  occupancy_type      VARCHAR(50),
  flood_zone          VARCHAR(20),
  
  -- DSCR-specific
  monthly_rent        DECIMAL(10,2),
  dscr                DECIMAL(5,2),
  
  -- AI scores (updated by AI agents)
  ai_completeness_score   INTEGER,                  -- 0-100
  ai_risk_score           INTEGER,                  -- 0-100
  ai_recommendation       VARCHAR(50),              -- APPROVE / DECLINE / MANUAL_REVIEW
  
  -- Human decision
  credit_decision         credit_decision,
  credit_memo             TEXT,
  decided_by              UUID REFERENCES users(id),
  decided_at              TIMESTAMPTZ,
  ai_override_reason      TEXT,                     -- populated if human overrides AI
  
  -- Closing
  funded_at               TIMESTAMPTZ,
  wire_amount             DECIMAL(12,2),
  wire_date               DATE,
  wire_reference          VARCHAR(100),
  recording_number        VARCHAR(100),
  recording_date          DATE,
  
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loans_broker_id ON loans(broker_id);
CREATE INDEX idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX idx_loans_assigned_uw_id ON loans(assigned_uw_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_program ON loans(program);
```

### `borrower_profiles`
Extended financial profile for a borrower on a specific loan.

```sql
CREATE TABLE borrower_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id           UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id),
  
  -- Identity
  ssn_last4         CHAR(4),
  date_of_birth     DATE,
  citizenship       VARCHAR(100),
  
  -- Address
  current_address   VARCHAR(500),
  current_city      VARCHAR(100),
  current_state     CHAR(2),
  current_zip       VARCHAR(10),
  years_at_address  INTEGER,
  
  -- Employment
  employer_name     VARCHAR(255),
  employment_type   VARCHAR(50),
  years_employed    INTEGER,
  annual_income     DECIMAL(12,2),
  
  -- Financials
  liquid_assets     DECIMAL(12,2),
  total_liabilities DECIMAL(12,2),
  monthly_expenses  DECIMAL(10,2),
  
  -- Status
  profile_complete  BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(loan_id, user_id)
);
```

### `documents`
```sql
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id         UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  uploaded_by     UUID NOT NULL REFERENCES users(id),
  
  file_name       VARCHAR(500) NOT NULL,
  s3_key          VARCHAR(1000) NOT NULL UNIQUE,
  s3_bucket       VARCHAR(255) NOT NULL,
  content_type    VARCHAR(100),
  file_size       BIGINT,
  
  doc_type        VARCHAR(100),               -- human-assigned category
  ai_classification VARCHAR(100),            -- AI-assigned category
  ai_confidence   DECIMAL(4,3),              -- 0.000 to 1.000
  status          document_status NOT NULL DEFAULT 'PENDING',
  rejection_reason VARCHAR(500),
  
  version         INTEGER NOT NULL DEFAULT 1, -- incremented on re-upload of same type
  replaces_doc_id UUID REFERENCES documents(id),
  
  -- Full-text search
  content_text    TEXT,                       -- OCR extracted text
  content_vector  TSVECTOR,                  -- PostgreSQL full-text search index
  
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at    TIMESTAMPTZ,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_loan_id ON documents(loan_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_content_vector ON documents USING GIN(content_vector);
```

### `conditions`
```sql
CREATE TABLE conditions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id           UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  created_by        UUID NOT NULL REFERENCES users(id),
  
  type              VARCHAR(100) NOT NULL,    -- e.g. "Income Verification", "Appraisal"
  description       TEXT NOT NULL,
  status            condition_status NOT NULL DEFAULT 'OPEN',
  responsible_party condition_party NOT NULL,
  due_date          DATE,
  linked_doc_id     UUID REFERENCES documents(id),
  
  satisfied_by      UUID REFERENCES users(id),
  satisfied_at      TIMESTAMPTZ,
  
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conditions_loan_id ON conditions(loan_id);
CREATE INDEX idx_conditions_status ON conditions(status);
```

### `ai_analyses`
Every AI agent run is stored in full.

```sql
CREATE TABLE ai_analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id         UUID NOT NULL REFERENCES loans(id),
  triggered_by    UUID REFERENCES users(id),  -- null if triggered by system/event
  
  analysis_type   ai_analysis_type NOT NULL,
  model_id        VARCHAR(100) NOT NULL,       -- e.g. "claude-sonnet-4-20250514"
  
  input_snapshot  JSONB NOT NULL,              -- full input sent to Claude
  output_raw      TEXT NOT NULL,               -- raw Claude response
  scores          JSONB,                       -- parsed scores: { ltv: 75, dscr: 62, ... }
  recommendation  VARCHAR(50),
  reasoning       TEXT,
  
  tokens_used     INTEGER,
  latency_ms      INTEGER,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_analyses_loan_id ON ai_analyses(loan_id);
CREATE INDEX idx_ai_analyses_type ON ai_analyses(analysis_type);
```

### `messages`
```sql
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id     UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at     TIMESTAMPTZ
);

CREATE INDEX idx_messages_loan_id ON messages(loan_id);
```

### `notifications`
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  loan_id     UUID REFERENCES loans(id),
  type        VARCHAR(100) NOT NULL,   -- e.g. "LOAN_STATUS_CHANGE", "NEW_MESSAGE"
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

### `loan_events`
Immutable audit trail — append-only, never updated or deleted.

```sql
CREATE TABLE loan_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id     UUID NOT NULL REFERENCES loans(id),
  actor_id    UUID REFERENCES users(id),  -- null for system/AI events
  actor_type  VARCHAR(50),                -- 'USER' | 'AI_AGENT' | 'SYSTEM'
  event_type  VARCHAR(100) NOT NULL,      -- e.g. "STATUS_CHANGE", "DOCUMENT_UPLOADED"
  from_status loan_status,
  to_status   loan_status,
  payload     JSONB,                      -- event-specific data
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loan_events_loan_id ON loan_events(loan_id);
CREATE INDEX idx_loan_events_created_at ON loan_events(created_at);
```

### `closing_checklists`
```sql
CREATE TABLE closing_checklists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id         UUID NOT NULL UNIQUE REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Standard CTC items tracked as columns for easy querying
  appraisal_received      ctc_status NOT NULL DEFAULT 'PENDING',
  title_commitment        ctc_status NOT NULL DEFAULT 'PENDING',
  insurance_binder        ctc_status NOT NULL DEFAULT 'PENDING',
  flood_cert              ctc_status NOT NULL DEFAULT 'PENDING',
  survey                  ctc_status NOT NULL DEFAULT 'PENDING',
  loan_docs_signed        ctc_status NOT NULL DEFAULT 'PENDING',
  wire_confirmed          ctc_status NOT NULL DEFAULT 'PENDING',
  recording_confirmed     ctc_status NOT NULL DEFAULT 'PENDING',
  
  -- Custom CTCs stored as JSONB array
  custom_items    JSONB NOT NULL DEFAULT '[]',
  
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `investor_criteria`
```sql
CREATE TABLE investor_criteria (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  programs        loan_program[],          -- preferred programs
  min_amount      DECIMAL(12,2),
  max_amount      DECIMAL(12,2),
  max_ltv         DECIMAL(5,2),
  min_yield       DECIMAL(5,4),
  states          CHAR(2)[],              -- allowed property states
  
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `investor_listings`
```sql
CREATE TABLE investor_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id         UUID NOT NULL UNIQUE REFERENCES loans(id),
  
  asking_price    DECIMAL(12,2) NOT NULL,
  yield           DECIMAL(5,4) NOT NULL,
  ai_summary      TEXT,                    -- AI-generated investment summary
  
  listed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sold_at         TIMESTAMPTZ,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `investor_bids`
```sql
CREATE TABLE investor_bids (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID NOT NULL REFERENCES investor_listings(id),
  investor_id     UUID NOT NULL REFERENCES users(id),
  
  bid_amount      DECIMAL(12,2) NOT NULL,
  terms           TEXT,
  status          bid_status NOT NULL DEFAULT 'PENDING',
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investor_bids_listing_id ON investor_bids(listing_id);
CREATE INDEX idx_investor_bids_investor_id ON investor_bids(investor_id);
```

### `audit_logs`
System-wide security audit trail (separate from loan_events).

```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(200) NOT NULL,   -- e.g. "USER_LOGIN", "DECISION_ISSUED", "AI_OVERRIDE"
  resource    VARCHAR(100),            -- entity type acted upon
  resource_id UUID,
  payload     JSONB,
  ip_address  INET,
  user_agent  VARCHAR(500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## Relationships Summary

```
users (1) ──< loans (many) via broker_id
users (1) ──< loans (many) via borrower_id
users (1) ──< loans (many) via assigned_uw_id
loans (1) ──< borrower_profiles (many, 1 per borrower per loan)
loans (1) ──< documents (many)
loans (1) ──< conditions (many)
loans (1) ──< ai_analyses (many)
loans (1) ──< messages (many)
loans (1) ──< loan_events (many)
loans (1) ──  closing_checklists (1:1)
loans (1) ──  investor_listings (1:1)
investor_listings (1) ──< investor_bids (many)
users (1) ──  investor_criteria (1:1)
users (1) ──< notifications (many)
```
