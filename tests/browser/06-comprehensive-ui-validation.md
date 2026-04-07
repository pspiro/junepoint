# Browser Test 06: Comprehensive UI Validation — All Fields, Buttons, Menus

**Purpose:** Exhaustively test every UI element, form field, button, menu item, and workflow across all portals.

**Prerequisites:**
- All previous tests completed (accounts exist for all roles)
- Application running at `http://localhost:5173`

---

## Public Pages

### Home Page
- Navigate to `http://localhost:5173`
- **Test all navigation links:**
  - Click "Features" → verify scroll to features section
  - Click "How It Works" → verify scroll to how-it-works section
  - Click "Pricing" (if exists) → verify scroll or navigate
  - Click "Investors" → verify scroll or navigate
  - Click "Login" → verify redirect to `/login`
  - Click "Get Started" → verify redirect to `/signup`
- **Test hero section:**
  - Verify both CTA buttons are clickable
  - Click "Get Started as Broker" → verify redirect to `/signup`
  - Click "Login to Platform" → verify redirect to `/login`
- **Test feature cards:**
  - Verify all 6 feature cards are displayed
  - Hover over each card → verify hover effect
  - Click each card (if clickable) → verify action
- **Test loan program cards:**
  - Verify all 6 program cards are displayed (Bridge, DSCR, Fix & Flip, Long-Term Rental, Construction, Commercial)
  - Verify each card shows name and description
- **Test footer:**
  - Click each footer link → verify navigation or action
  - Verify copyright text is present

### Login Page
- Navigate to `/login`
- **Test form validation:**
  - Submit empty form → verify error messages appear
  - Enter invalid email format → verify email validation error
  - Enter valid email, wrong password → verify "invalid credentials" error
  - Enter valid credentials → verify successful login
- **Test "Forgot Password" link:**
  - Click link → verify redirect to `/forgot-password`
- **Test "Sign Up" link:**
  - Click link → verify redirect to `/signup`

### Sign-Up Page
- Navigate to `/signup`
- **Test form validation:**
  - Submit empty form → verify all required field errors appear
  - Enter mismatched passwords → verify "passwords must match" error
  - Enter invalid email → verify email validation error
  - Enter weak password → verify password strength error
  - Enter valid data → verify successful registration
- **Test all input fields:**
  - First Name: type, clear, type again
  - Last Name: type, clear, type again
  - Email: test auto-complete, paste, manual entry
  - Company Name: verify optional or required
  - Phone: test formatting (if auto-formatted)
  - Password: verify show/hide toggle works
  - Confirm Password: verify show/hide toggle works
- **Test Terms of Service checkbox:**
  - Try to submit without checking → verify error
  - Check box → verify submission allowed

### Forgot Password Page
- Navigate to `/forgot-password`
- **Test email submission:**
  - Enter invalid email → verify error
  - Enter valid email → verify success message
  - Verify "check your email" message appears
- **Test reset code entry (if multi-step):**
  - Enter invalid code → verify error
  - Enter valid code → verify password reset form appears
- **Test new password form:**
  - Enter weak password → verify error
  - Enter mismatched passwords → verify error
  - Enter valid password → verify success and redirect to login

---

## Broker Portal

### Broker Dashboard
- Login as broker
- Navigate to `/broker/dashboard`
- **Test all KPI cards:**
  - Verify "Active Loans" displays number
  - Verify "Submitted This Month" displays number
  - Verify "Awaiting Decision" displays number
  - Verify "Avg. AI Score" displays number or N/A
  - Click each card (if clickable) → verify navigation or action
- **Test alert/action items:**
  - Verify alerts are displayed (if any)
  - Click "Dismiss" on an alert → verify it disappears
  - Click alert item → verify navigation to relevant page
- **Test recent pipeline section:**
  - Verify last 5 loans are displayed
  - Click a loan → verify navigation to loan detail
- **Test quick action buttons:**
  - Click "New Loan" → verify redirect to `/broker/loans/new`
  - Click "Upload Document" → verify upload modal or redirect
  - Click "View Pipeline" → verify redirect to `/broker/pipeline`

### Broker Pipeline
- Navigate to `/broker/pipeline`
- **Test search bar:**
  - Type loan number → verify filtering works
  - Type borrower name → verify filtering works
  - Clear search → verify all loans reappear
- **Test filter controls:**
  - Filter by Status → verify only matching loans appear
  - Filter by Loan Program → verify filtering works
  - Filter by Date Range → verify filtering works
  - Filter by AI Score Range → verify filtering works
  - Clear all filters → verify all loans reappear
- **Test table sorting:**
  - Click each column header → verify sort order changes
  - Click again → verify reverse sort
  - Test sorting on: Loan #, Borrower, Program, Amount, Status, AI Score, Days in Status
- **Test pagination:**
  - If more than one page, click "Next" → verify next page loads
  - Click page number → verify correct page loads
  - Click "Previous" → verify previous page loads
- **Test row actions:**
  - Click a loan row → verify navigation to loan detail
  - Hover over row → verify highlight effect

### Loan Detail — All Tabs
- Navigate to `/broker/loans/[loanId]`
- **Test Overview Tab:**
  - Verify loan summary is displayed
  - Verify borrower info is displayed
  - Verify property info is displayed
  - Verify status tracker is displayed
  - Verify AI completeness score is displayed
  - Click "View AI Analysis" (if button exists) → verify modal or navigation
- **Test Documents Tab:**
  - Verify document list is displayed
  - Click "Upload Document" → verify upload modal appears
  - Upload a file → verify upload progress and success
  - Click a document → verify preview or download
  - Click "Delete" on a document → verify confirmation and deletion
  - Verify AI classification label appears on each document
- **Test Conditions Tab:**
  - Verify conditions list is displayed
  - Verify each condition shows: description, type, status, due date
  - Click "Mark Satisfied" → verify status changes
  - Upload document for condition → verify attachment
- **Test Messages Tab:**
  - Verify message thread is displayed
  - Type a message → verify character count (if exists)
  - Click "Send" → verify message appears in thread
  - Verify timestamp is displayed
  - Verify sender name is displayed
  - Test scroll behavior with many messages
- **Test Timeline Tab:**
  - Verify all events are displayed chronologically
  - Verify each event shows: timestamp, description, actor
  - Verify events include: loan created, submitted, documents uploaded, status changes, decisions

### New Loan Wizard — All Steps
- Navigate to `/broker/loans/new`
- **Test Step 1 — Loan Details:**
  - Test all dropdowns: Loan Program, Purpose
  - Test all number inputs: Loan Amount, LTV, Term
  - Enter invalid values → verify validation errors
  - Click "Next" without filling → verify required field errors
  - Fill all fields → click "Next" → verify step 2 loads
  - Click "Back" → verify return to step 1 with data preserved
- **Test Step 2 — Property:**
  - Test address autocomplete (if implemented)
  - Test all dropdowns: Property Type, Occupancy, Flood Zone
  - Test number input: Property Value
  - Enter invalid data → verify errors
  - Click "Next" → verify step 3 loads
- **Test Step 3 — Borrower:**
  - Test "Select Existing Borrower" dropdown (if borrowers exist)
  - Test "Invite New Borrower" radio button
  - Enter borrower email, first name, last name
  - Click "Send Invitation" → verify success message
  - Click "Next" → verify step 4 loads
- **Test Step 4 — Financials:**
  - Test all number inputs: Annual Income, Total Assets, Total Liabilities, Monthly Rent
  - Enter invalid values → verify validation
  - Click "Next" → verify step 5 loads
- **Test Step 5 — Documents:**
  - Verify document upload zones for each required doc type
  - Upload multiple files → verify all appear in list
  - Delete an uploaded file → verify removal
  - Click "Skip for Now" → verify step 6 loads
- **Test Step 6 — Review & Submit:**
  - Verify all entered data is displayed in summary
  - Click "Edit" on a section → verify return to that step
  - Click "Save as Draft" → verify draft is saved and redirect
  - Click "Submit Loan" → verify confirmation and submission
- **Test wizard navigation:**
  - Test "Back" button on each step
  - Test "Save and Exit" (if exists)
  - Test progress indicator updates

---

## Borrower Portal

### Borrower Dashboard
- Login as borrower (via magic link)
- Navigate to `/borrower/dashboard`
- **Test loan status progress bar:**
  - Verify all stages are displayed
  - Verify current stage is highlighted
  - Verify completed stages are marked
- **Test action items:**
  - Click each action item → verify navigation
  - Verify action items update when tasks are completed
- **Test document upload status:**
  - Verify progress indicator (e.g., "3 of 5 documents uploaded")
  - Click "Upload Documents" → verify navigation to `/borrower/documents`

### Borrower Profile
- Navigate to `/borrower/profile`
- **Test all form fields:**
  - Full Legal Name: type, clear, type
  - SSN: verify masking (shows `***-**-6789`)
  - DOB: test date picker
  - Address: test all fields (street, city, state, zip)
  - Citizenship: test dropdown
  - Employer: type, clear, type
  - Annual Income: test number input
  - Employment Type: test dropdown
- **Test co-borrower toggle:**
  - Toggle on → verify co-borrower fields appear
  - Fill co-borrower fields
  - Toggle off → verify fields disappear
- **Test form validation:**
  - Submit with missing required fields → verify errors
  - Enter invalid SSN format → verify error
  - Enter future DOB → verify error
- **Test save functionality:**
  - Click "Save" → verify success message
  - Reload page → verify data persists

### Borrower Documents
- Navigate to `/borrower/documents`
- **Test each document type section:**
  - Pay Stubs: upload, verify, delete, re-upload
  - Tax Returns: upload, verify, delete, re-upload
  - Bank Statements: upload, verify, delete, re-upload
  - (Test all other required doc types)
- **Test drag-and-drop:**
  - Drag file onto upload zone → verify upload
  - Drag multiple files → verify all upload
- **Test file browser:**
  - Click "Browse" → verify file picker opens
  - Select file → verify upload
- **Test AI classification:**
  - Verify classification label appears after upload
  - Verify correct classification (or "Unclassified" if AI fails)
- **Test document status:**
  - Verify status badge: Pending, Uploaded, Accepted, Rejected
  - If rejected, verify "Re-upload" button appears

---

## Underwriter Portal

### Underwriter Queue
- Login as underwriter
- Navigate to `/underwriter/queue`
- **Test all filter controls:**
  - Program filter → verify filtering
  - AI Score range slider → verify filtering
  - Loan Amount range → verify filtering
  - Days Waiting filter → verify filtering
  - Clear all filters → verify reset
- **Test sorting:**
  - Sort by AI Score → verify order
  - Sort by Days in Queue → verify order
  - Sort by Loan Amount → verify order
- **Test queue actions:**
  - Click "Assign to Me" → verify loan moves to "My Active Reviews"
  - Click "Review" → verify navigation to workspace

### Underwriting Workspace
- Navigate to `/underwriter/loans/[loanId]`
- **Test document viewer (left pane):**
  - Click each document → verify preview loads
  - Test zoom controls (if exists)
  - Test page navigation for multi-page PDFs
  - Verify AI OCR overlay (if implemented)
- **Test AI Report tab:**
  - Verify all scores are displayed
  - Verify AI recommendation is shown
  - Verify credit memo is displayed
  - Test "Expand" on each score section
- **Test Conditions tab:**
  - Click "Add Condition" → verify form appears
  - Fill and save → verify condition appears
  - Edit a condition → verify changes save
  - Delete a condition → verify removal
- **Test Loan Data tab:**
  - Edit each editable field → verify save
  - Enter invalid data → verify validation
  - Verify audit log appears (if implemented)
- **Test Notes tab:**
  - Add a note → verify it appears
  - Edit a note (if allowed) → verify changes
  - Delete a note (if allowed) → verify removal
- **Test decision panel:**
  - Click "Approve" → verify form expands
  - Click "Conditionally Approve" → verify conditions list appears
  - Click "Decline" → verify reason field appears
  - Click "Suspend" → verify reason field appears
  - Submit decision → verify confirmation and success

---

## Investor Portal

### Investor Marketplace
- Login as investor
- Navigate to `/investor/marketplace`
- **Test all filters:**
  - Loan Program → verify filtering
  - Minimum Yield → verify filtering
  - Maximum LTV → verify filtering
  - State → verify filtering
  - Loan Amount Range → verify filtering
- **Test loan cards:**
  - Verify all displayed data is correct
  - Click "View Details" → verify navigation
  - Verify AI Match Score (if implemented)
- **Test sorting:**
  - Sort by Yield → verify order
  - Sort by LTV → verify order
  - Sort by Match Score → verify order

### Investor Data Room
- Navigate to `/investor/marketplace/[loanId]`
- **Test all tabs:**
  - Loan Summary → verify all data displays
  - Property Details → verify all data displays
  - Borrower Profile → verify data (check if anonymized)
  - Financial Analysis → verify calculations
  - Documents → verify all docs are accessible
  - AI Analysis → verify AI report displays
- **Test document viewer:**
  - Click each document → verify preview or download
  - Verify restricted documents are not accessible (if any)
- **Test bid submission:**
  - Click "Submit Bid" → verify form appears
  - Fill bid form → verify validation
  - Submit bid → verify success

### Investor Portfolio
- Navigate to `/investor/portfolio`
- **Test Active Bids tab:**
  - Verify all bids are displayed
  - Click "Withdraw Bid" → verify confirmation and removal
  - Click "Edit Bid" (if exists) → verify edit form
- **Test Purchased Loans tab:**
  - Verify purchased loans are displayed (if any)
  - Click a loan → verify navigation to loan detail
- **Test Portfolio Summary:**
  - Verify all metrics are calculated correctly
  - Test chart/graph interactions (if exists)

---

## Admin Portal

### Admin Dashboard
- Login as admin
- Navigate to `/admin/dashboard`
- **Test all metric cards:**
  - Verify all numbers are accurate
  - Click each card (if clickable) → verify navigation
- **Test quick actions:**
  - Click "Create User" → verify modal or navigation
  - Click "Assign Loan" → verify navigation

### Admin User Management
- Navigate to `/admin/users`
- **Test all table interactions:**
  - Sort by each column → verify order
  - Filter by role → verify filtering
  - Search by name/email → verify filtering
  - Select multiple users → verify bulk actions appear
- **Test user creation:**
  - Fill all fields → verify validation
  - Submit → verify user is created
- **Test user editing:**
  - Edit each field → verify changes save
  - Change role → verify confirmation
- **Test user deactivation:**
  - Deactivate → verify confirmation
  - Verify user status changes

### Admin Loan Assignment
- Navigate to `/admin/loans` or `/admin/assignment`
- **Test loan list:**
  - Verify unassigned loans are displayed
  - Verify assigned loans show assignee
- **Test assignment:**
  - Select a loan → verify underwriter dropdown appears
  - Select underwriter → click "Assign" → verify success
  - Verify loan moves to assigned section

### Admin Platform Config
- Navigate to `/admin/config`
- **Test feature flags:**
  - Toggle each flag → verify save
  - Reload page → verify flags persist
- **Test configuration fields:**
  - Edit each field → verify validation
  - Save → verify success

---

## Cross-Portal Tests

### Notifications
- **Test notification bell (all portals):**
  - Click bell → verify dropdown appears
  - Verify unread count is accurate
  - Click a notification → verify navigation
  - Click "Mark All Read" → verify count resets

### User Menu
- **Test user menu (all portals):**
  - Click avatar → verify dropdown appears
  - Click "Profile" → verify navigation
  - Click "Settings" → verify navigation
  - Click "Logout" → verify logout and redirect

### Responsive Design
- **Test all pages at different screen sizes:**
  - Desktop (1920x1080)
  - Laptop (1366x768)
  - Tablet (768x1024)
  - Mobile (375x667)
- **Verify:**
  - Sidebar collapses on mobile
  - Tables become scrollable or stack
  - Forms remain usable
  - No horizontal scroll

---

## Expected Results
- All UI elements are functional
- All forms validate correctly
- All buttons and links work
- All menus and dropdowns operate correctly
- All workflows complete successfully
- No console errors
- No broken layouts or styling issues

## Notes
- Record every bug, broken link, or non-functional element
- Take screenshots of any UI inconsistencies
- Note any features from the spec that are missing
