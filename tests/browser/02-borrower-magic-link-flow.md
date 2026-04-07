# Browser Test 02: Borrower Magic Link Flow

**Purpose:** Test the borrower experience from receiving a magic link invitation through completing their profile and uploading documents.

**Prerequisites:**
- Test 01 completed (broker account exists with a loan that has an invited borrower)
- Application running at `http://localhost:5173`
- Access to the magic link token (check backend logs or database for the token generated in Test 01)

---

## Test Steps

### 1. Obtain Magic Link Token
- Check backend console logs or database for the magic link token sent to `testborrower+[timestamp]@example.com`
- Construct the magic link URL: `http://localhost:5173/magic/[token]`

### 2. Navigate to Magic Link
- Open the magic link URL in browser
- **Verify:** Page loads without errors
- **Verify:** "Validating..." or spinner appears briefly
- **Verify:** Success message appears with broker's name
- **Verify:** "Access Your Loan Portal" button is visible

### 3. Access Borrower Portal
- Click "Access Your Loan Portal"
- **Verify:** Redirected to `/borrower/dashboard`
- **Verify:** Borrower dashboard loads
- **Verify:** Loan status progress bar is visible
- **Verify:** Action items list is displayed

### 4. Verify Dashboard Content
- **Verify:** Loan status shows current stage (e.g., "Application Submitted")
- **Verify:** Action items include "Complete Personal Information" and "Upload Documents"
- **Verify:** Broker contact information is displayed
- **Verify:** Sidebar shows navigation: Dashboard, Profile, Documents, Closing

### 5. Navigate to Personal Information
- Click "Complete Personal Information" action item or "Profile" in sidebar
- **Verify:** URL changes to `/borrower/profile`
- **Verify:** Form is displayed with sections: Personal, Employment
- **Verify:** Fields visible: Full Legal Name, SSN (masked input), DOB, Address, Citizenship, Employer, Income, Employment Type

### 6. Complete Personal Information
- Fill in the form:
  - Full Legal Name: `John Michael Doe`
  - SSN: `123-45-6789` (will be masked)
  - DOB: `01/15/1985`
  - Address: `456 Oak Ave, Austin, TX 78702`
  - Citizenship: `US Citizen`
  - Employer: `Tech Corp Inc`
  - Annual Income: `120000`
  - Employment Type: `Full-Time W2`
- Click "Save" or "Mark Complete"
- **Verify:** Success message appears
- **Verify:** Form data persists on page reload

### 7. Navigate to Document Upload
- Click "Documents" in sidebar or return to dashboard and click "Upload Documents"
- **Verify:** URL changes to `/borrower/documents`
- **Verify:** Required documents checklist is displayed
- **Verify:** Document types shown: Pay Stubs, Tax Returns, Bank Statements, etc.
- **Verify:** Each document type shows status: Pending, Uploaded, Accepted, or Rejected

### 8. Upload Pay Stub
- Locate "Pay Stubs" section
- **Verify:** Drag-and-drop zone or "Browse" button is visible
- Upload a test PDF file (any PDF, name it `paystub.pdf`)
- **Verify:** Upload progress indicator appears
- **Verify:** File appears in uploaded list
- **Verify:** AI classification result appears (e.g., "Classified as: Pay Stub")
- **Verify:** Status changes to "Uploaded" or "Under Review"

### 9. Upload Tax Return
- Locate "Tax Returns" section
- Upload a test PDF file (name it `tax_return.pdf`)
- **Verify:** Upload succeeds
- **Verify:** AI classification appears
- **Verify:** Document appears in the list

### 10. Upload Bank Statement
- Locate "Bank Statements" section
- Upload a test PDF file (name it `bank_statement.pdf`)
- **Verify:** Upload succeeds
- **Verify:** All three uploaded documents are visible in their respective sections

### 11. Return to Dashboard
- Click "Dashboard" in sidebar
- **Verify:** Action items list is updated
- **Verify:** "Complete Personal Information" is marked complete or removed
- **Verify:** Document upload status shows progress (e.g., "3 of 5 documents uploaded")

### 12. Verify Closing Section (if loan is not yet in closing)
- Click "Closing" in sidebar
- **Verify:** URL changes to `/borrower/closing`
- **Verify:** Message appears: "Closing documents not yet available" or similar
- **Verify:** No errors occur

### 13. Test Re-Upload (Rejected Document Simulation)
- Return to `/borrower/documents`
- **Verify:** Each uploaded document has a "Re-upload" or "Replace" button
- Click "Re-upload" on one of the documents
- Upload a different test file
- **Verify:** New file replaces the old one
- **Verify:** AI re-classifies the document

### 14. Logout
- Click user menu in top bar
- Click "Logout"
- **Verify:** Redirected to home page or login page
- **Verify:** Attempting to access `/borrower/dashboard` redirects to login or shows "unauthorized"

### 15. Re-Login via Magic Link
- Use the same magic link URL from step 2
- **Verify:** Magic link still works (or shows "already used" if single-use)
- **Verify:** If multi-use, borrower is logged back in
- **Verify:** All previously entered data is still present

---

## Expected Results
- Borrower can access portal via magic link
- Personal information form saves correctly
- Document uploads work and AI classification appears
- Dashboard reflects completion status
- Data persists across sessions

## Notes
- Check if magic links are single-use or multi-use
- Verify SSN masking works correctly (shows `***-**-6789`)
- Note any AI classification errors or timeouts
