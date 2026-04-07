# CapitalFlow LMS — API & Messaging Spec

## Transport

- **REST API** via AWS API Gateway HTTP API → Lambda
- **Base URL:** `https://{cloudfront-domain}/api`
- **Authentication:** Bearer JWT in `Authorization` header for all protected routes
- **Content-Type:** `application/json` for all requests/responses

## Real-Time Communication

**Decision: Server-Sent Events (SSE) for notifications; polling for everything else.**

- Real-time use case: in-app notification badge count updates and new message alerts
- SSE endpoint: `GET /api/notifications/stream` — keeps connection open, pushes notification events
- All other data (loan status, document status, AI analysis results): client polls via React Query with 10–30 second intervals
- WebSockets are not justified for this use case (SSE is simpler, one-directional, and sufficient)

---

## Auth Endpoints

### `POST /api/auth/login`
Login with email/password (non-borrower users).

**Request:**
```json
{ "email": "string", "password": "string", "mfaCode": "string?" }
```
**Response:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 3600,
  "user": { "id": "uuid", "email": "string", "firstName": "string", "role": "BROKER|UNDERWRITER|..." }
}
```

### `POST /api/auth/logout`
Invalidate refresh token.

**Request:** `{}` (auth header required)
**Response:** `{ "ok": true }`

### `POST /api/auth/refresh`
Exchange refresh token for new access token.

**Request:** `{ "refreshToken": "string" }`
**Response:** `{ "accessToken": "string", "expiresIn": 3600 }`

### `POST /api/auth/magic-link`
Validate a borrower magic link token.

**Request:** `{ "token": "string" }`
**Response:** `{ "accessToken": "string", "refreshToken": "string", "expiresIn": 3600, "user": { ... } }`

### `POST /api/auth/forgot-password`
Trigger Cognito password reset flow.

**Request:** `{ "email": "string" }`
**Response:** `{ "ok": true }`

### `POST /api/auth/reset-password`
Confirm new password with reset code.

**Request:** `{ "email": "string", "code": "string", "newPassword": "string" }`
**Response:** `{ "ok": true }`

---

## User Endpoints

### `GET /api/users/me`
Get current user profile.

**Response:** `{ "id": "uuid", "email": "string", "firstName": "string", "lastName": "string", "role": "string", "companyName": "string?", "phone": "string?", "mfaEnabled": boolean }`

### `PUT /api/users/me`
Update current user profile.

**Request:** `{ "firstName": "string?", "lastName": "string?", "companyName": "string?", "phone": "string?" }`
**Response:** Updated user object

### `GET /api/users/:userId`
Get a user by ID. Admin or same user only.

**Response:** User object

### `POST /api/users/invite`
Broker invites a borrower. Sends magic link email.

**Request:** `{ "email": "string", "firstName": "string", "lastName": "string", "loanId": "uuid" }`
**Response:** `{ "borrowerId": "uuid", "inviteSent": true }`

### `GET /api/users` *(Admin only)*
List all users with optional filters.

**Query params:** `?role=BROKER&isActive=true&page=1&limit=25`
**Response:** `{ "users": [...], "total": number, "page": number }`

### `POST /api/users` *(Admin only)*
Create a new internal user.

**Request:** `{ "email": "string", "firstName": "string", "lastName": "string", "role": "UNDERWRITER|TITLE|INVESTOR|ADMIN", "companyName": "string?" }`
**Response:** Created user object

### `PUT /api/users/:userId` *(Admin only)*
Update any user (admin use).

**Request:** Partial user fields + `{ "isActive": boolean? }`
**Response:** Updated user object

---

## Loan Endpoints

### `GET /api/loans`
List loans visible to the current user (role-filtered).

**Query params:** `?status=IN_REVIEW&program=DSCR&page=1&limit=25&sortBy=createdAt&sortDir=desc`
**Response:** `{ "loans": [...], "total": number }`

### `POST /api/loans`
Create a new loan (Broker only).

**Request:** `{ "program": "BRIDGE|DSCR|FIX_FLIP|...", "loanAmount": number, "purpose": "string", "propertyAddress": "string", "propertyType": "string", "propertyValue": number, "borrowerId": "uuid?" }`
**Response:** Created loan object with `id`

### `GET /api/loans/:loanId`
Get full loan detail (role-filtered field access).

**Response:** Full loan object including borrower profile, conditions, AI scores, human decision

### `PUT /api/loans/:loanId`
Update loan fields (Broker while DRAFT; Underwriter while IN_REVIEW).

**Request:** Partial loan fields
**Response:** Updated loan object

### `POST /api/loans/:loanId/submit`
Submit a loan for review (Broker → DRAFT to SUBMITTED).

**Request:** `{}`
**Response:** `{ "loanId": "uuid", "status": "SUBMITTED" }` — triggers COMPLETENESS_CHECK SQS message

### `POST /api/loans/:loanId/events`
Trigger a loan state transition.

**Request:** `{ "transition": "string", "note": "string?" }`
Valid transitions per role enforced server-side.
**Response:** Updated loan with new status + created LoanEvent

### `POST /api/loans/:loanId/assign` *(Admin/Underwriter)*
Assign loan to an underwriter.

**Request:** `{ "underwriterId": "uuid" }`
**Response:** Updated loan object

---

## Document Endpoints

### `POST /api/documents/presigned-url`
Get an S3 presigned URL for direct browser-to-S3 upload.

**Request:** `{ "loanId": "uuid", "fileName": "string", "contentType": "string", "fileSize": number }`
**Response:** `{ "uploadUrl": "string", "documentId": "uuid", "key": "string" }`

### `POST /api/loans/:loanId/documents`
Confirm a completed S3 upload and trigger AI document processing.

**Request:** `{ "documentId": "uuid" }`
**Response:** Confirmed document object — triggers DOC_PROCESSING SQS message

### `GET /api/loans/:loanId/documents`
List all documents for a loan.

**Response:** `{ "documents": [{ "id": "uuid", "fileName": "string", "docType": "string", "aiClassification": "string?", "status": "string", "uploadedAt": "string", "uploadedBy": "uuid", "s3Key": "string" }] }`

### `GET /api/loans/:loanId/documents/:docId`
Get document metadata + presigned download URL.

**Response:** Document object + `{ "downloadUrl": "string" }`

### `PUT /api/loans/:loanId/documents/:docId`
Update document metadata (type reclassification, status).

**Request:** `{ "docType": "string?", "status": "ACCEPTED|REJECTED?", "rejectionReason": "string?" }`
**Response:** Updated document object

### `GET /api/documents` *(Broker — cross-loan)*
Get all documents across a broker's loans.

**Query params:** `?loanId=uuid&docType=string&page=1&limit=25`
**Response:** `{ "documents": [...], "total": number }`

---

## Underwriting Endpoints

### `GET /api/loans/:loanId/underwriting`
Get full underwriting data: AI analyses, conditions, human decision.

**Response:**
```json
{
  "aiAnalyses": [{ "id": "uuid", "type": "COMPLETENESS|UNDERWRITING", "scores": {}, "recommendation": "string", "reasoning": "string", "createdAt": "string" }],
  "conditions": [...],
  "decision": { "outcome": "APPROVED|CONDITIONALLY_APPROVED|DECLINED|SUSPENDED?", "creditMemo": "string", "decidedBy": "uuid", "decidedAt": "string" }
}
```

### `POST /api/loans/:loanId/underwriting/decision`
Issue a credit decision (Underwriter only).

**Request:** `{ "outcome": "APPROVED|CONDITIONALLY_APPROVED|DECLINED|SUSPENDED", "creditMemo": "string", "conditionIds": ["uuid"], "aiOverrideReason": "string?" }`
**Response:** Updated loan with decision

### `GET /api/loans/:loanId/conditions`
Get all conditions for a loan.

**Response:** `{ "conditions": [{ "id": "uuid", "type": "string", "description": "string", "status": "OPEN|SATISFIED|WAIVED", "responsibleParty": "BROKER|BORROWER|TITLE", "dueDate": "string?", "linkedDocId": "uuid?" }] }`

### `POST /api/loans/:loanId/conditions`
Add a condition.

**Request:** `{ "type": "string", "description": "string", "responsibleParty": "BROKER|BORROWER|TITLE", "dueDate": "string?" }`
**Response:** Created condition object

### `PUT /api/loans/:loanId/conditions/:condId`
Update condition status or fields.

**Request:** `{ "status": "SATISFIED|WAIVED?", "linkedDocId": "uuid?" }`
**Response:** Updated condition object

---

## Closing Endpoints

### `GET /api/loans/:loanId/closing`
Get closing checklist and CTC status.

**Response:** `{ "checklist": [{ "id": "uuid", "item": "string", "status": "PENDING|RECEIVED|APPROVED", "linkedDocId": "uuid?" }], "wireConfirmed": boolean, "recordingComplete": boolean, "fundedAt": "string?" }`

### `POST /api/loans/:loanId/closing/ctc`
Add or update a condition-to-close item.

**Request:** `{ "item": "string", "status": "PENDING|RECEIVED|APPROVED", "linkedDocId": "uuid?" }`
**Response:** Updated CTC item

### `POST /api/loans/:loanId/closing/fund`
Mark loan as funded (Title only, all CTCs must be APPROVED).

**Request:** `{ "wireAmount": number, "wireDate": "string", "wireReference": "string" }`
**Response:** Updated loan with `status: "CLOSED"` — triggers INVESTOR_MATCHING SQS message

---

## Investor Endpoints

### `GET /api/marketplace`
List loans available for purchase.

**Query params:** `?program=DSCR&minAmount=500000&maxAmount=2000000&minYield=8&maxLTV=75&page=1&limit=25`
**Response:** `{ "listings": [{ "id": "uuid", "loanId": "uuid", "program": "string", "amount": number, "ltv": number, "yield": number, "aiSummary": "string", "matchScore": number, "daysOnMarket": number }], "total": number }`

### `GET /api/marketplace/:loanId`
Full due diligence view for one listing.

**Response:** Full listing object with anonymized borrower profile, financial metrics, available document manifest

### `POST /api/marketplace/:loanId/bid`
Submit a bid.

**Request:** `{ "bidAmount": number, "terms": "string?" }`
**Response:** Created bid object

### `GET /api/portfolio`
Get investor's purchased loan portfolio.

**Response:** `{ "loans": [...], "summary": { "totalDeployed": number, "interestEarned": number, "activeCount": number } }`

### `GET /api/investor/criteria`
Get investor's purchase criteria.

**Response:** Criteria object

### `PUT /api/investor/criteria`
Update investor's purchase criteria.

**Request:** `{ "programs": ["string"], "minAmount": number, "maxAmount": number, "maxLTV": number, "minYield": number, "states": ["string"] }`
**Response:** Updated criteria object

---

## Messages Endpoints

### `GET /api/loans/:loanId/messages`
Get message thread for a loan.

**Response:** `{ "messages": [{ "id": "uuid", "body": "string", "sender": { "id": "uuid", "firstName": "string", "role": "string" }, "sentAt": "string", "readAt": "string?" }] }`

### `POST /api/loans/:loanId/messages`
Send a message.

**Request:** `{ "body": "string" }`
**Response:** Created message object

---

## Notifications Endpoints

### `GET /api/notifications`
Get current user's notifications (paginated).

**Query params:** `?unreadOnly=true&page=1&limit=25`
**Response:** `{ "notifications": [{ "id": "uuid", "type": "string", "title": "string", "body": "string", "isRead": boolean, "loanId": "uuid?", "createdAt": "string" }], "unreadCount": number }`

### `PUT /api/notifications/:id/read`
Mark a notification read.

**Response:** `{ "ok": true }`

### `PUT /api/notifications/read-all`
Mark all notifications read.

**Response:** `{ "ok": true }`

### `GET /api/notifications/stream`
SSE stream for real-time notification pushes.

**Response:** SSE stream, events: `{ "type": "NEW_NOTIFICATION", "data": { notification object } }`

---

## AI Endpoints

### `POST /api/ai/chat`
Contextual AI chat assistant.

**Request:** `{ "message": "string", "loanId": "uuid?", "conversationHistory": [{ "role": "user|assistant", "content": "string" }] }`
**Response:** `{ "reply": "string", "citations": ["string"]? }`

### `POST /api/ai/analyze/:loanId`
Manually trigger AI analysis on a loan (Underwriter/Admin only).

**Request:** `{ "analysisType": "COMPLETENESS|UNDERWRITING|PROPERTY_RESEARCH" }`
**Response:** `{ "jobId": "uuid", "queued": true }` — async, result stored in AIAnalysis table

### `GET /api/ai/analyses/:loanId`
Get all AI analyses for a loan.

**Response:** `{ "analyses": [{ "id": "uuid", "type": "string", "scores": {}, "recommendation": "string", "reasoning": "string", "createdAt": "string" }] }`
