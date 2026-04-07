# Browser Test 04: Investor Marketplace — Browse, Filter, Bid

**Purpose:** Test the investor portal from browsing the marketplace through submitting a bid on a closed loan.

**Prerequisites:**
- Database seeded with an investor account (check seed script for credentials)
- At least one loan in CLOSED or ON_MARKET status (may need to manually update a loan status in DB)
- Application running at `http://localhost:5173`

---

## Test Steps

### 1. Login as Investor
- Navigate to `http://localhost:5173/login`
- Enter investor credentials from seed data (e.g., `investor@example.com` / `Investor123!`)
- Click "Login"
- **Verify:** Redirected to `/investor/dashboard` or `/investor/marketplace`

### 2. Navigate to Marketplace
- If on dashboard, click "Marketplace" in sidebar
- **Verify:** URL changes to `/investor/marketplace`
- **Verify:** Marketplace page loads with loan listing
- **Verify:** Filter panel is visible on left or top
- **Verify:** Loan cards or table is displayed

### 3. Verify Marketplace Filters
- **Verify:** Filter controls are visible for:
  - Loan Program (Bridge, DSCR, Fix & Flip, etc.)
  - Minimum Yield
  - Maximum LTV
  - State/Location
  - Loan Amount Range
- **Verify:** "Apply Filters" or auto-filter functionality works

### 4. Filter by Loan Program
- Select "DSCR" from Loan Program filter
- Click "Apply Filters" if needed
- **Verify:** Loan list updates to show only DSCR loans
- **Verify:** Non-DSCR loans are hidden

### 5. Filter by LTV
- Set Maximum LTV to 75
- Apply filter
- **Verify:** Only loans with LTV ≤ 75 are displayed
- Clear filters
- **Verify:** All loans reappear

### 6. View Loan Card Details
- **Verify:** Each loan card displays:
  - Loan #
  - Loan Program
  - Loan Amount
  - Property Address
  - LTV
  - Yield or Interest Rate
  - AI Match Score (if investor criteria matching is implemented)
  - "View Details" button
- **Verify:** At least one loan is marked as "ON_MARKET" or "Available"

### 7. Open Loan Data Room
- Click "View Details" on a loan
- **Verify:** URL changes to `/investor/marketplace/[loanId]` or data room modal opens
- **Verify:** Data room page displays with tabs or sections:
  - Loan Summary
  - Property Details
  - Borrower Profile (anonymized or full depending on spec)
  - Financial Analysis
  - Documents
  - AI Analysis
- **Verify:** All sections load without errors

### 8. Review Loan Summary
- **Verify:** Loan summary shows:
  - Loan amount, program, term, interest rate
  - Origination date, maturity date
  - Current status (CLOSED, ON_MARKET)
  - LTV, DSCR (if applicable)

### 9. Review Property Details
- Click "Property Details" tab or section
- **Verify:** Property information is displayed:
  - Address
  - Property type
  - Appraised value
  - Occupancy type
  - Flood zone status

### 10. Review Documents
- Click "Documents" tab
- **Verify:** Document list is displayed
- **Verify:** Documents include: Appraisal, Title Report, Credit Memo, Closing Disclosure, etc.
- Click on a document to view/download
- **Verify:** Document opens in viewer or downloads

### 11. Review AI Analysis
- Click "AI Analysis" tab
- **Verify:** AI underwriting report is displayed
- **Verify:** Risk scores are visible (LTV, DSCR, Credit, Property, Borrower)
- **Verify:** AI recommendation is shown
- **Verify:** Credit memo is visible

### 12. Submit a Bid
- **Verify:** "Submit Bid" or "Make Offer" button is visible
- Click "Submit Bid"
- **Verify:** Bid form appears with fields:
  - Bid Amount (may default to loan amount or allow discount)
  - Yield/Rate (if negotiable)
  - Notes/Comments
- Fill in bid form:
  - Bid Amount: `500000` (or loan amount)
  - Yield: `8.5`
  - Notes: `Interested in purchasing this loan for portfolio diversification`
- Click "Submit Bid"
- **Verify:** Confirmation message appears
- **Verify:** Bid is recorded (status changes to "Bid Submitted" or similar)

### 13. Navigate to Portfolio
- Click "Portfolio" in sidebar
- **Verify:** URL changes to `/investor/portfolio`
- **Verify:** Portfolio page displays with tabs or sections:
  - Active Bids
  - Purchased Loans
  - Portfolio Summary

### 14. Verify Active Bids
- Click "Active Bids" tab
- **Verify:** Bid submitted in step 12 appears in the list
- **Verify:** Bid details are shown: Loan #, Bid Amount, Yield, Status (Pending, Accepted, Rejected)
- **Verify:** "Withdraw Bid" or "Edit Bid" button is visible

### 15. Verify Portfolio Summary
- Click "Portfolio Summary" tab or section
- **Verify:** Summary metrics are displayed:
  - Total Loans Purchased
  - Total Capital Deployed
  - Average Yield
  - Portfolio Performance (if implemented)
- **Verify:** No errors occur even if portfolio is empty

### 16. Configure Investor Criteria (if implemented)
- Navigate to investor settings or criteria page (check sidebar for "Criteria" or "Preferences")
- **Verify:** Criteria configuration form is displayed with fields:
  - Preferred Loan Programs (checkboxes)
  - Minimum Yield
  - Maximum LTV
  - Preferred States/Regions
  - Minimum/Maximum Loan Amount
- Update criteria:
  - Select "DSCR" and "Bridge Loan"
  - Set Minimum Yield to 7.5
  - Set Maximum LTV to 70
- Click "Save Criteria"
- **Verify:** Success message appears
- **Verify:** Criteria are saved (reload page and verify values persist)

### 17. Return to Marketplace and Verify Match Scores
- Navigate back to `/investor/marketplace`
- **Verify:** Loans now display AI Match Score based on saved criteria
- **Verify:** Loans matching criteria have higher match scores (e.g., 90%+)
- **Verify:** Non-matching loans have lower scores or are filtered out

### 18. Logout
- Click user menu and logout
- **Verify:** Redirected to login page
- **Verify:** Session cleared

---

## Expected Results
- Investor can login and access marketplace
- Filters work correctly to narrow loan listings
- Data room displays all loan details and documents
- Bids can be submitted successfully
- Portfolio page shows active bids and summary
- Investor criteria configuration works and affects match scores

## Notes
- Check if bid acceptance workflow is implemented (admin or automated)
- Verify document access permissions (investor should only see loans on market)
- Note any missing AI match score functionality
