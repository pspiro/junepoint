# Browser Test 03: Underwriter Workflow — Queue, Analysis, Decision

**Purpose:** Test the underwriter portal from viewing the queue through issuing a credit decision.

**Prerequisites:**
- Database seeded with an underwriter account (check seed script for credentials)
- At least one loan in SUBMITTED or IN_REVIEW status (created in Test 01)
- Application running at `http://localhost:5173`

---

## Test Steps

### 1. Login as Underwriter
- Navigate to `http://localhost:5173/login`
- Enter underwriter credentials from seed data (e.g., `underwriter@example.com` / `Underwriter123!`)
- Click "Login"
- **Verify:** MFA prompt appears (if MFA is enabled for underwriters)
- Enter MFA code if prompted (check seed script or use test code `123456` if dev mode)
- **Verify:** Redirected to `/underwriter/queue`

### 2. Verify Underwriter Queue
- **Verify:** URL is `/underwriter/queue`
- **Verify:** Queue table is displayed with columns: Loan #, Borrower, Program, Amount, AI Score, AI Recommendation, Days in Queue
- **Verify:** Filter/sort controls are visible (Program, AI Score range, Loan Amount, Days Waiting)
- **Verify:** At least one loan appears in the queue (the loan from Test 01)
- **Verify:** "Assign to Me" or "Review" button is visible for each loan

### 3. Filter Queue by Program
- Click Program filter dropdown
- Select "DSCR"
- **Verify:** Queue updates to show only DSCR loans
- **Verify:** Loan from Test 01 is visible (if it's a DSCR loan)
- Clear filter
- **Verify:** All loans reappear

### 4. Sort Queue by AI Score
- Click "AI Score" column header
- **Verify:** Loans re-sort by AI score (ascending or descending)
- Click again to reverse sort
- **Verify:** Sort order changes

### 5. Claim a Loan for Review
- Locate the loan created in Test 01 (borrower "John Doe")
- Click "Assign to Me" or "Review" button
- **Verify:** Loan moves to "My Active Reviews" section or status changes
- **Verify:** "Open Workspace" or similar button appears

### 6. Open Underwriting Workspace
- Click "Open Workspace" or click the loan row
- **Verify:** URL changes to `/underwriter/loans/[loanId]`
- **Verify:** Split-pane layout appears:
  - Left pane: Document viewer
  - Right pane: Tabbed analysis panel (AI Report, Conditions, Loan Data, Notes)
- **Verify:** Decision panel is visible at bottom with buttons: Approve, Conditionally Approve, Decline, Suspend

### 7. Review AI Report Tab
- **Verify:** "AI Report" tab is active by default
- **Verify:** AI analysis is displayed with sections:
  - Completeness Score
  - Risk Scores (LTV, DSCR, Credit, Property, Borrower)
  - Composite Score
  - AI Recommendation (Approve / Conditionally Approve / Decline)
  - Draft Credit Memo
- **Verify:** Scores are displayed as numbers or progress bars
- **Verify:** AI recommendation text is visible

### 8. View Documents in Left Pane
- **Verify:** Document list is visible in left pane
- Click on a document (if any were uploaded in Test 01)
- **Verify:** Document preview appears (PDF viewer or image)
- **Verify:** AI OCR extraction overlay or data appears (if implemented)
- **Verify:** Navigation between documents works

### 9. Switch to Conditions Tab
- Click "Conditions" tab in right pane
- **Verify:** Existing conditions list is displayed (may be empty)
- **Verify:** "Add Condition" button is visible
- Click "Add Condition"
- **Verify:** Form appears with fields: Type, Description, Due Date, Responsible Party

### 10. Add a New Condition
- Fill in condition form:
  - Type: `Prior to Funding`
  - Description: `Provide proof of hazard insurance`
  - Due Date: 7 days from today
  - Responsible Party: `Borrower`
- Click "Save" or "Add"
- **Verify:** Condition appears in the list
- **Verify:** Status shows "Outstanding" or "Pending"

### 11. Switch to Loan Data Tab
- Click "Loan Data" tab
- **Verify:** All loan fields are displayed (editable by underwriter)
- **Verify:** Fields include: Loan Amount, LTV, Term, Property Address, Borrower Info, etc.
- Edit one field (e.g., change LTV from 75 to 74)
- Click "Save" or field auto-saves
- **Verify:** Change is saved (no error)
- **Verify:** Edit is logged (if audit trail is visible)

### 12. Switch to Notes Tab
- Click "Notes" tab
- **Verify:** Internal notes section is displayed
- **Verify:** Text area for adding notes is visible
- Type a note: `Reviewed property appraisal. Value confirmed at $667k.`
- Click "Save Note"
- **Verify:** Note appears in the list with timestamp
- **Verify:** Note is marked as "Internal" (not visible to broker)

### 13. Issue a Conditional Approval Decision
- Scroll to decision panel at bottom
- **Verify:** Decision buttons are enabled: Approve, Conditionally Approve, Decline, Suspend
- Click "Conditionally Approve"
- **Verify:** Decision form expands or modal appears
- **Verify:** Credit memo editor is visible (pre-populated by AI)
- Edit credit memo: Add a sentence like `Loan approved subject to conditions listed below.`
- **Verify:** Conditions list is shown with checkboxes
- Check the condition created in step 10
- **Verify:** "Override Reason" field appears if AI recommendation was different
- If override reason is required, enter: `Manual review of property value`
- Click "Submit Decision"
- **Verify:** Confirmation prompt appears
- Confirm submission
- **Verify:** Success message appears
- **Verify:** Redirected to queue or loan detail page updates

### 14. Verify Decision is Recorded
- Navigate back to `/underwriter/queue`
- **Verify:** Loan no longer appears in "Awaiting Review" section
- **Verify:** Loan appears in "My Completed Reviews" or similar section
- **Verify:** Status shows "CONDITIONALLY_APPROVED"

### 15. View Decision from Broker Perspective
- Logout from underwriter account
- Login as the broker account from Test 01
- Navigate to `/broker/loans/[loanId]` (the same loan)
- **Verify:** Loan status shows "CONDITIONALLY_APPROVED"
- Click "Conditions" tab
- **Verify:** The condition "Provide proof of hazard insurance" is visible
- **Verify:** Status shows "Outstanding"
- **Verify:** Timeline tab shows "Decision issued by [Underwriter Name]"

### 16. Test Condition Satisfaction (Broker Side)
- In Conditions tab, locate the condition
- **Verify:** "Mark Satisfied" or "Upload Document" button is visible
- Click "Mark Satisfied" or upload a test document
- **Verify:** Condition status changes to "Satisfied" or "Under Review"

### 17. Logout
- Logout from broker account
- **Verify:** Redirected to login page

---

## Expected Results
- Underwriter can login with MFA
- Queue displays loans correctly with filtering and sorting
- Underwriting workspace loads with split-pane layout
- AI report displays all scores and recommendations
- Underwriter can add conditions, edit loan data, add notes
- Credit decision can be issued successfully
- Decision is visible to broker with correct status and conditions

## Notes
- Record any AI analysis errors or missing data
- Check if AI scores are realistic or placeholder values
- Verify override logging works if underwriter decision differs from AI recommendation
