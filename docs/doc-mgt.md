# CapitalFlow LMS — Document Management

## Overview

Documents are a first-class entity in CapitalFlow. Every loan has a document packet that evolves throughout the lifecycle. Documents arrive via:
1. **Portal upload** — broker or borrower uploads through the web UI
2. **Email intake** — borrowers or third parties email documents to an intake address; the Email Intake Agent classifies and routes them

## Storage Architecture

- **File storage:** AWS S3 (encrypted at rest with SSE-KMS)
  - Bucket: `capitalflow-documents-{env}`
  - Key structure: `loans/{loanId}/{documentId}/{fileName}`
  - Access: private (no public access); all downloads via presigned URLs (15-minute TTL)
- **Metadata storage:** PostgreSQL `documents` table (see `database.md`)
- **Future:** S3-compatible migration path; no local filesystem

## Upload Flow

1. **Client requests presigned URL:** `POST /api/documents/presigned-url` → backend generates S3 presigned PUT URL + creates a `PENDING` document record
2. **Client uploads directly to S3:** browser `PUT` to presigned URL (bypasses Lambda; supports large files)
3. **Client confirms upload:** `POST /api/loans/:loanId/documents` → backend verifies S3 object exists, sets status to `PROCESSING`, enqueues `DOC_PROCESSING` SQS message
4. **Document worker processes:** Lambda picks up SQS message, runs OCR + AI classification, updates document record to `ACCEPTED` or flags for review

## AI Document Classification

Every uploaded document is automatically classified by Claude:
- **Input:** File content (text extracted via OCR for PDFs, or base64 for images)
- **Output:** `docType` (e.g. "Bank Statement", "W-2", "Tax Return", "Appraisal Report", "Purchase Agreement"), `aiConfidence` (0–1), extracted key data as JSON
- **Stored in:** `documents.ai_classification`, `documents.ai_confidence`, `documents.content_text`

### Supported Document Types
- Bank Statement
- W-2 / 1099
- Personal Tax Return (1040)
- Business Tax Return
- Pay Stub
- Employment Verification Letter
- Appraisal Report
- Purchase Agreement / Sales Contract
- Title Commitment
- Insurance Binder
- Flood Certificate
- Survey
- Closing Disclosure
- Promissory Note
- Deed of Trust
- Entity Documents (LLC/Corp)

## Email Intake Agent

- **Receiving address:** `intake@capitalflow.io` (SES inbound)
- **SES rule:** Saves inbound email to `capitalflow-email-{env}` S3 bucket, enqueues SQS message
- **Email Worker Lambda:** Parses email, extracts attachments, runs loan matching logic:
  1. Loan ID in subject line (e.g. "CF-2025-00142")
  2. Borrower email address match
  3. Most recent active loan for this email
- **On match:** Attachments saved to `capitalflow-documents-{env}` S3, `documents` records created, AI classification triggered, confirmation email sent to sender
- **On no match:** Email forwarded to admin for manual routing

## Full-Text Search

- PostgreSQL `tsvector` column on `documents.content_vector`
- Populated by Document Worker after OCR extraction
- Search query: `WHERE content_vector @@ plainto_tsquery('english', $1)`
- Enables underwriters to search document content (e.g., "find all bank statements mentioning Chase")
- API: `GET /api/loans/:loanId/documents?search=text` uses `tsvector` index

## Document Versioning

- Re-uploading the same document type creates a new `documents` record
- `replaces_doc_id` links back to the prior version
- `version` integer increments automatically
- Prior versions remain in S3 and are accessible but marked as superseded
- UI shows current version by default with "View History" option

## Access Control

| Role | Can Upload | Can Download | Can Reclassify | Can Delete |
|------|-----------|-------------|----------------|------------|
| BROKER | Own loans | Own loans | No | No |
| BORROWER | Own loan | Own loan | No | No |
| UNDERWRITER | Any loan | Any loan | Yes | No |
| TITLE | IN_CLOSING loans | IN_CLOSING loans | No | No |
| INVESTOR | Loans they bid on (limited set) | Closing docs only | No | No |
| ADMIN | Any | Any | Yes | Yes (audit logged) |

No documents are physically deleted. Admin deletes set `status = 'REJECTED'` and are audit-logged.
