# Browser Test 01: Core Broker Flow — Registration, Login, New Loan

**Purpose:** Test the primary broker workflow from registration through creating and submitting a loan application.

**Prerequisites:**
- Application is running at `http://localhost:5173`
- Backend is running at `http://localhost:3001`
- Database is seeded with test data

---

## Test Steps

### 1. Navigate to Home Page
- Open `http://localhost:5173`
- **Verify:** Page loads without errors
- **Verify:** Navigation bar is visible with "CapitalFlow" logo
- **Verify:** Hero section displays with headline containing "Private Lending" or similar
- **Verify:** "Get Started" and "Login" buttons are visible

### 2. Navigate to Sign-Up Page
- Click "Get Started" button in hero section
- **Verify:** URL changes to `/signup`
- **Verify:** Sign-up form is displayed with fields: First Name, Last Name, Email, Company Name, Phone, Password, Confirm Password
- **Verify:** "Create Account" button is visible
- **Verify:** Link to login page is visible

### 3. Register New Broker Account
- Fill in the form:
  - First Name: `Test`
  - Last Name: `Broker`
  - Email: `testbroker+[timestamp]@example.com` (use current timestamp to ensure uniqueness)
  - Company Name: `Test Lending LLC`
  - Phone: `555-123-4567`
  - Password: `TestBroker123!`
  - Confirm Password: `TestBroker123!`
- Check the "Terms of Service" checkbox if present
- Click "Create Account"
- **Verify:** No validation errors appear
- **Verify:** Either redirected to login page with success message, or automatically logged in and redirected to broker dashboard

### 4. Login (if not auto-logged in)
- If on login page, enter:
  - Email: the email used in step 3
  - Password: `TestBroker123!`
- Click "Login"
- **Verify:** Redirected to `/broker/dashboard`

### 5. Verify Broker Dashboard Loads
- **Verify:** URL is `/broker/dashboard`
- **Verify:** Left sidebar is visible with navigation items (Dashboard, Pipeline, New Loan, Documents, Messages)
- **Verify:** Top bar shows user avatar/menu and notifications bell
- **Verify:** KPI cards are displayed (Active Loans, Submitted This Month, etc.)
- **Verify:** "New Loan" button or quick action is visible

### 6. Navigate to New Loan Wizard
- Click "New Loan" button (in sidebar or quick actions)
- **Verify:** URL changes to `/broker/loans/new`
- **Verify:** Step 1 of wizard is displayed with title "Loan Details" or similar
- **Verify:** Form fields are visible: Loan Program dropdown, Loan Amount, Purpose, LTV, Term

### 7. Complete Step 1 — Loan Details
- Select Loan Program: `DSCR`
- Enter Loan Amount: `500000`
- Enter Purpose: `Purchase`
- Enter LTV: `75`
- Enter Term: `30`
- Click "Next" or "Continue"
- **Verify:** No validation errors
- **Verify:** Step 2 is displayed

### 8. Complete Step 2 — Property Information
- Enter Property Address: `123 Main St, Austin, TX 78701`
- Select Property Type: `Single Family`
- Enter Property Value: `667000`
- Select Occupancy: `Investment`
- Select Flood Zone: `No` or `X`
- Click "Next"
- **Verify:** Step 3 is displayed

### 9. Complete Step 3 — Borrower Information
- Choose "Invite New Borrower" option
- Enter Borrower Email: `testborrower+[timestamp]@example.com`
- Enter Borrower First Name: `John`
- Enter Borrower Last Name: `Doe`
- Click "Next" or "Send Invitation"
- **Verify:** Success message appears (magic link sent)
- **Verify:** Step 4 is displayed

### 10. Complete Step 4 — Financials
- Enter Annual Income: `120000`
- Enter Total Assets: `250000`
- Enter Total Liabilities: `50000`
- Enter Monthly Rent (for DSCR): `3500`
- Click "Next"
- **Verify:** Step 5 is displayed

### 11. Complete Step 5 — Documents (Optional Upload)
- **Verify:** Document upload zone is visible
- **Verify:** List of required document types is shown
- Click "Next" or "Skip for Now"
- **Verify:** Step 6 (Review & Submit) is displayed

### 12. Review and Submit Loan
- **Verify:** Summary of all entered data is displayed
- **Verify:** All sections (Loan Details, Property, Borrower, Financials) show correct values
- Click "Submit Loan" or "Submit for Review"
- **Verify:** Success message appears
- **Verify:** Redirected to loan detail page (`/broker/loans/[loanId]`) or pipeline

### 13. Verify Loan Appears in Pipeline
- Navigate to `/broker/pipeline` (click "Pipeline" in sidebar)
- **Verify:** Newly created loan appears in the table
- **Verify:** Loan status badge shows "SUBMITTED" or "IN_REVIEW"
- **Verify:** Borrower name "John Doe" is displayed
- **Verify:** Loan amount "$500,000" is displayed
- **Verify:** AI Score column exists (may be empty or show initial score)

### 14. Open Loan Detail Page
- Click on the newly created loan row
- **Verify:** URL changes to `/broker/loans/[loanId]`
- **Verify:** Loan detail page loads with tabs: Overview, Documents, Conditions, Messages, Timeline
- **Verify:** Overview tab shows loan summary
- **Verify:** Status tracker is visible
- **Verify:** Property address "123 Main St, Austin, TX 78701" is displayed

### 15. Test Document Upload
- Click "Documents" tab
- **Verify:** Document list is displayed (may be empty)
- **Verify:** "Upload Document" button is visible
- Click "Upload Document"
- **Verify:** Upload modal or zone appears
- Select a test file (any PDF or image)
- **Verify:** File uploads successfully
- **Verify:** Document appears in the list with AI classification status

### 16. Test Messages Tab
- Click "Messages" tab
- **Verify:** Message thread interface is displayed
- **Verify:** Text input field and "Send" button are visible
- Type a test message: `This is a test message from the broker`
- Click "Send"
- **Verify:** Message appears in the thread
- **Verify:** Timestamp is displayed

### 17. Verify Timeline Tab
- Click "Timeline" tab
- **Verify:** Event log is displayed
- **Verify:** At least one event is shown (e.g., "Loan created", "Loan submitted")
- **Verify:** Events show timestamp and description

### 18. Logout
- Click user avatar/menu in top bar
- Click "Logout" or "Sign Out"
- **Verify:** Redirected to login page or home page
- **Verify:** Session is cleared (attempting to navigate to `/broker/dashboard` redirects to login)

---

## Expected Results
- All steps complete without errors
- Broker can register, login, create a loan, and interact with all core features
- Data persists correctly across page navigations
- UI is responsive and all interactive elements work

## Notes
- Record any console errors
- Note any UI elements that don't match the wireframe design
- Check network tab for failed API calls
