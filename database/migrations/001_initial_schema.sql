-- CapitalFlow LMS — Initial Schema
-- PostgreSQL 16

-- Enums
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

-- Users
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255),
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  role            user_role NOT NULL,
  company_name    VARCHAR(255),
  phone           VARCHAR(30),
  mfa_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  cognito_sub     VARCHAR(255) UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at   TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Loans
CREATE TABLE loans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_number         VARCHAR(20) UNIQUE NOT NULL,
  broker_id           UUID NOT NULL REFERENCES users(id),
  borrower_id         UUID REFERENCES users(id),
  assigned_uw_id      UUID REFERENCES users(id),
  program             loan_program NOT NULL,
  status              loan_status NOT NULL DEFAULT 'DRAFT',
  loan_amount         DECIMAL(12,2) NOT NULL,
  purpose             VARCHAR(500),
  ltv                 DECIMAL(5,2),
  term_months         INTEGER,
  interest_rate       DECIMAL(5,4),

  property_address    VARCHAR(500),
  property_city       VARCHAR(100),
  property_state      CHAR(2),
  property_zip        VARCHAR(10),
  property_type       VARCHAR(100),
  property_value      DECIMAL(12,2),
  occupancy_type      VARCHAR(50),
  flood_zone          VARCHAR(20),

  monthly_rent        DECIMAL(10,2),
  dscr                DECIMAL(5,2),

  ai_completeness_score   INTEGER,
  ai_risk_score           INTEGER,
  ai_recommendation       VARCHAR(50),

  credit_decision         credit_decision,
  credit_memo             TEXT,
  decided_by              UUID REFERENCES users(id),
  decided_at              TIMESTAMPTZ,
  ai_override_reason      TEXT,

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

-- Borrower profiles
CREATE TABLE borrower_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id           UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id),
  ssn_last4         CHAR(4),
  date_of_birth     DATE,
  citizenship       VARCHAR(100),
  current_address   VARCHAR(500),
  current_city      VARCHAR(100),
  current_state     CHAR(2),
  current_zip       VARCHAR(10),
  years_at_address  INTEGER,
  employer_name     VARCHAR(255),
  employment_type   VARCHAR(50),
  years_employed    INTEGER,
  annual_income     DECIMAL(12,2),
  liquid_assets     DECIMAL(12,2),
  total_liabilities DECIMAL(12,2),
  monthly_expenses  DECIMAL(10,2),
  profile_complete  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(loan_id, user_id)
);

-- Documents
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id         UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  uploaded_by     UUID NOT NULL REFERENCES users(id),
  file_name       VARCHAR(500) NOT NULL,
  s3_key          VARCHAR(1000) NOT NULL UNIQUE,
  s3_bucket       VARCHAR(255) NOT NULL,
  content_type    VARCHAR(100),
  file_size       BIGINT,
  doc_type        VARCHAR(100),
  ai_classification VARCHAR(100),
  ai_confidence   DECIMAL(4,3),
  status          document_status NOT NULL DEFAULT 'PENDING',
  rejection_reason VARCHAR(500),
  version         INTEGER NOT NULL DEFAULT 1,
  replaces_doc_id UUID REFERENCES documents(id),
  content_text    TEXT,
  content_vector  TSVECTOR,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_loan_id ON documents(loan_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_content_vector ON documents USING GIN(content_vector);

-- Conditions
CREATE TABLE conditions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id           UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  created_by        UUID NOT NULL REFERENCES users(id),
  type              VARCHAR(100) NOT NULL,
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

-- AI Analyses
CREATE TABLE ai_analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id         UUID NOT NULL REFERENCES loans(id),
  triggered_by    UUID REFERENCES users(id),
  analysis_type   ai_analysis_type NOT NULL,
  model_id        VARCHAR(100) NOT NULL,
  input_snapshot  JSONB NOT NULL,
  output_raw      TEXT NOT NULL,
  scores          JSONB,
  recommendation  VARCHAR(50),
  reasoning       TEXT,
  tokens_used     INTEGER,
  latency_ms      INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_analyses_loan_id ON ai_analyses(loan_id);
CREATE INDEX idx_ai_analyses_type ON ai_analyses(analysis_type);

-- Messages
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id     UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at     TIMESTAMPTZ
);

CREATE INDEX idx_messages_loan_id ON messages(loan_id);

-- Notifications
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  loan_id     UUID REFERENCES loans(id),
  type        VARCHAR(100) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Loan Events (immutable audit trail)
CREATE TABLE loan_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id     UUID NOT NULL REFERENCES loans(id),
  actor_id    UUID REFERENCES users(id),
  actor_type  VARCHAR(50),
  event_type  VARCHAR(100) NOT NULL,
  from_status loan_status,
  to_status   loan_status,
  payload     JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loan_events_loan_id ON loan_events(loan_id);
CREATE INDEX idx_loan_events_created_at ON loan_events(created_at);

-- Closing Checklists
CREATE TABLE closing_checklists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id         UUID NOT NULL UNIQUE REFERENCES loans(id) ON DELETE CASCADE,
  appraisal_received      ctc_status NOT NULL DEFAULT 'PENDING',
  title_commitment        ctc_status NOT NULL DEFAULT 'PENDING',
  insurance_binder        ctc_status NOT NULL DEFAULT 'PENDING',
  flood_cert              ctc_status NOT NULL DEFAULT 'PENDING',
  survey                  ctc_status NOT NULL DEFAULT 'PENDING',
  loan_docs_signed        ctc_status NOT NULL DEFAULT 'PENDING',
  wire_confirmed          ctc_status NOT NULL DEFAULT 'PENDING',
  recording_confirmed     ctc_status NOT NULL DEFAULT 'PENDING',
  custom_items    JSONB NOT NULL DEFAULT '[]',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Investor Criteria
CREATE TABLE investor_criteria (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  programs        loan_program[],
  min_amount      DECIMAL(12,2),
  max_amount      DECIMAL(12,2),
  max_ltv         DECIMAL(5,2),
  min_yield       DECIMAL(5,4),
  states          CHAR(2)[],
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Investor Listings
CREATE TABLE investor_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id         UUID NOT NULL UNIQUE REFERENCES loans(id),
  asking_price    DECIMAL(12,2) NOT NULL,
  yield           DECIMAL(5,4) NOT NULL,
  ai_summary      TEXT,
  listed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sold_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Investor Bids
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

-- Audit Logs
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(200) NOT NULL,
  resource    VARCHAR(100),
  resource_id UUID,
  payload     JSONB,
  ip_address  INET,
  user_agent  VARCHAR(500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Config / Feature Flags table
CREATE TABLE platform_config (
  key         VARCHAR(100) PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO platform_config (key, value) VALUES
  ('ai_underwriting_enabled', 'true'),
  ('investor_marketplace_enabled', 'true'),
  ('email_intake_enabled', 'true'),
  ('property_research_agent_enabled', 'false'),
  ('investor_matching_agent_enabled', 'false');
