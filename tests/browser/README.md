# Browser Test Suite for CapitalFlow LMS

This directory contains comprehensive browser automation test scripts designed to be executed by Claude for Chrome.

## Test Files

### 01-core-broker-flow.md
**Duration:** ~15-20 minutes  
**Coverage:** Broker registration, login, loan creation, document upload, messaging  
**Prerequisites:** Clean database or seeded with minimal data  
**Key Workflows:**
- New broker registration
- Login authentication
- 6-step loan wizard completion
- Document upload and AI classification
- Message thread interaction
- Pipeline view

### 02-borrower-magic-link-flow.md
**Duration:** ~10-15 minutes  
**Coverage:** Borrower portal access, profile completion, document upload  
**Prerequisites:** Test 01 completed (loan with invited borrower exists)  
**Key Workflows:**
- Magic link authentication
- Personal information form completion
- Document upload with AI classification
- Dashboard action items

### 03-underwriter-workflow.md
**Duration:** ~15-20 minutes  
**Coverage:** Underwriter queue, workspace, AI analysis, credit decision  
**Prerequisites:** Seeded underwriter account, loan in SUBMITTED status  
**Key Workflows:**
- Queue filtering and sorting
- Loan assignment
- AI report review
- Condition management
- Credit decision issuance
- Override logging

### 04-investor-marketplace.md
**Duration:** ~10-15 minutes  
**Coverage:** Marketplace browsing, data room, bid submission, portfolio  
**Prerequisites:** Seeded investor account, loan in CLOSED/ON_MARKET status  
**Key Workflows:**
- Marketplace filtering
- Data room document review
- Bid submission
- Portfolio management
- Investor criteria configuration

### 05-admin-user-management.md
**Duration:** ~10-15 minutes  
**Coverage:** Admin portal, user CRUD operations, role management  
**Prerequisites:** Seeded admin account  
**Key Workflows:**
- User creation (all roles)
- User editing and role changes
- User activation/deactivation
- Bulk actions
- Activity log review

### 06-comprehensive-ui-validation.md
**Duration:** ~60-90 minutes  
**Coverage:** Exhaustive testing of every UI element, form field, button, menu  
**Prerequisites:** All previous tests completed, all role accounts exist  
**Key Workflows:**
- Every public page element
- Every broker portal feature
- Every borrower portal feature
- Every underwriter portal feature
- Every investor portal feature
- Every admin portal feature
- Cross-portal features (notifications, user menu)
- Responsive design validation

## Running the Tests

### Prerequisites
1. Application must be running locally:
   - Backend: `http://localhost:3001`
   - Frontend: `http://localhost:5173`
   - PostgreSQL: running on port 5432
2. Database seeded with test data (run seed script)
3. Claude for Chrome extension installed and active

### Execution Order
Run tests in numerical order (01 → 06) for best results:
1. Test 01 creates the broker account and loan used in subsequent tests
2. Test 02 uses the borrower invitation from Test 01
3. Test 03 uses the loan created in Test 01
4. Test 04 requires a loan in CLOSED status (may need manual DB update)
5. Test 05 is independent but benefits from users created in Tests 01-04
6. Test 06 is comprehensive and should be run last

### Using Claude for Chrome
1. Open the test file in your browser or IDE
2. Activate Claude for Chrome
3. Paste the entire test script into Claude
4. Instruct Claude: "Execute this browser test script step by step. Navigate to each URL, interact with each element, and verify each assertion. Report any failures or errors."
5. Claude will control your browser and execute each step
6. Monitor progress and note any failures

### Alternative: Manual Execution
If not using Claude for Chrome, these scripts can be executed manually:
1. Open the test file
2. Follow each step in order
3. Manually verify each assertion
4. Record any failures in a separate document

## Test Data

### Seeded Accounts (from seed script)
- **Admin:** `admin@example.com` / `Admin123!`
- **Underwriter:** `underwriter@example.com` / `Underwriter123!`
- **Investor:** `investor@example.com` / `Investor123!`
- **Broker:** Created in Test 01 (`testbroker+[timestamp]@example.com`)
- **Borrower:** Created in Test 01 (magic link access)

### Test Loan Data
- **Loan Program:** DSCR
- **Loan Amount:** $500,000
- **Property:** 123 Main St, Austin, TX 78701
- **Borrower:** John Doe
- **LTV:** 75%
- **Term:** 30 years

## Reporting Issues

When a test fails, record:
1. **Test file and step number**
2. **Expected behavior** (from "Verify:" statements)
3. **Actual behavior** (what happened instead)
4. **Console errors** (if any)
5. **Network errors** (check browser DevTools Network tab)
6. **Screenshot** (if UI issue)

Create an issue in the project tracker with:
- Title: `[Test XX] Brief description of failure`
- Body: Include all information from above
- Labels: `bug`, `testing`, `[portal-name]`

## Coverage Summary

| Portal | Pages Tested | Features Tested | Estimated Coverage |
|--------|--------------|-----------------|-------------------|
| Public | 4 | 15+ | 95% |
| Broker | 5 | 40+ | 90% |
| Borrower | 3 | 15+ | 95% |
| Underwriter | 3 | 25+ | 85% |
| Investor | 3 | 20+ | 90% |
| Admin | 3 | 20+ | 85% |

**Overall Estimated Coverage:** ~90% of user-facing functionality

## Notes

- Tests assume AI features are functional (classification, analysis, scoring)
- Some tests may fail if AI services are down or slow
- MFA codes in test environment may be hardcoded to `123456` (check seed script)
- Magic link tokens expire after 24 hours (check backend config)
- File uploads require actual files (use any PDF or image for testing)
- Some features may not be implemented yet (mark as "Not Implemented" in results)

## Maintenance

Update these tests when:
- New features are added to the spec
- UI changes significantly
- API endpoints change
- User roles or permissions change
- Workflows are modified

Last updated: April 7, 2026
