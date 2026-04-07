# Browser Test 05: Admin Portal — User Management

**Purpose:** Test the admin portal's user management functionality including creating, editing, and deactivating users.

**Prerequisites:**
- Database seeded with an admin account (check seed script for credentials)
- Application running at `http://localhost:5173`

---

## Test Steps

### 1. Login as Admin
- Navigate to `http://localhost:5173/login`
- Enter admin credentials from seed data (e.g., `admin@example.com` / `Admin123!`)
- Click "Login"
- **Verify:** MFA prompt appears (admins require MFA)
- Enter MFA code (check seed script or use test code `123456` if dev mode)
- **Verify:** Redirected to `/admin/dashboard`

### 2. Verify Admin Dashboard
- **Verify:** URL is `/admin/dashboard`
- **Verify:** Admin sidebar is visible with navigation: Dashboard, Users, Loan Assignment, Platform Config
- **Verify:** Dashboard displays platform-wide metrics:
  - Total Users
  - Total Loans
  - Active Brokers
  - Active Underwriters
  - Loans Pending Assignment
- **Verify:** Quick action buttons are visible

### 3. Navigate to User Management
- Click "Users" in sidebar
- **Verify:** URL changes to `/admin/users`
- **Verify:** User management page loads with user table
- **Verify:** Table columns include: Name, Email, Role, Company, Status (Active/Inactive), Created Date, Actions

### 4. Verify User Table Displays All Users
- **Verify:** At least the following users appear (from seed data):
  - Admin user (yourself)
  - Test broker from Test 01
  - Seeded underwriter
  - Seeded investor
- **Verify:** Each row shows correct role badge (BROKER, UNDERWRITER, INVESTOR, ADMIN)

### 5. Filter Users by Role
- **Verify:** Role filter dropdown is visible
- Select "BROKER" from role filter
- **Verify:** Table updates to show only brokers
- **Verify:** Underwriter and investor users are hidden
- Clear filter
- **Verify:** All users reappear

### 6. Search for a User
- **Verify:** Search input field is visible
- Type the email of the test broker from Test 01 (e.g., `testbroker@example.com`)
- **Verify:** Table updates to show only matching user
- **Verify:** Other users are hidden
- Clear search
- **Verify:** All users reappear

### 7. Create a New Underwriter User
- Click "Create User" or "Add User" button
- **Verify:** User creation form appears (modal or new page)
- **Verify:** Form fields are visible:
  - First Name
  - Last Name
  - Email
  - Role (dropdown)
  - Company Name (optional)
  - Phone (optional)
  - MFA Required (checkbox, auto-checked for certain roles)
- Fill in the form:
  - First Name: `Jane`
  - Last Name: `Smith`
  - Email: `janesmith@example.com`
  - Role: `UNDERWRITER`
  - Company Name: `CapitalFlow LMS`
  - Phone: `555-987-6543`
  - MFA Required: checked (should be auto-checked for underwriter)
- Click "Create User" or "Save"
- **Verify:** Success message appears
- **Verify:** User appears in the table
- **Verify:** Status shows "Active"
- **Verify:** MFA column shows "Enabled"

### 8. Edit an Existing User
- Locate the newly created user "Jane Smith"
- Click "Edit" button in Actions column
- **Verify:** Edit form appears with pre-populated data
- Change phone number to `555-111-2222`
- Change company name to `CapitalFlow Underwriting`
- Click "Save Changes"
- **Verify:** Success message appears
- **Verify:** User row updates with new values

### 9. Deactivate a User
- Locate a test user (not the admin account)
- Click "Deactivate" or "Disable" button in Actions column
- **Verify:** Confirmation prompt appears
- Confirm deactivation
- **Verify:** User status changes to "Inactive"
- **Verify:** User row is grayed out or marked as inactive

### 10. Reactivate a User
- Locate the deactivated user
- Click "Activate" or "Enable" button
- **Verify:** User status changes back to "Active"
- **Verify:** User row is no longer grayed out

### 11. Test Role Change
- Locate a broker user
- Click "Edit"
- Change role from "BROKER" to "INVESTOR"
- **Verify:** Warning message appears (role change may affect access)
- Confirm change
- Click "Save"
- **Verify:** User role updates to "INVESTOR"
- **Verify:** User's access permissions change (verify by logging in as that user in a separate test)

### 12. Delete a User (if implemented)
- Locate a test user (not critical accounts)
- Click "Delete" button if available
- **Verify:** Strong confirmation prompt appears
- Confirm deletion
- **Verify:** User is removed from the table
- **Verify:** User cannot login anymore

### 13. Test Bulk Actions (if implemented)
- Select multiple users using checkboxes
- **Verify:** Bulk action menu appears
- Select "Deactivate Selected" or similar
- **Verify:** Confirmation prompt appears
- Confirm action
- **Verify:** All selected users are deactivated

### 14. View User Activity Log (if implemented)
- Click on a user row or "View Details"
- **Verify:** User detail page or modal appears
- **Verify:** Activity log is displayed showing:
  - Login history
  - Actions performed
  - Loans created/reviewed (depending on role)
- **Verify:** Timestamps are accurate

### 15. Test Pagination
- **Verify:** If more than 10-20 users exist, pagination controls appear
- Click "Next Page" or page number
- **Verify:** Table updates to show next set of users
- **Verify:** Page indicator updates

### 16. Export User List (if implemented)
- **Verify:** "Export" or "Download CSV" button is visible
- Click "Export"
- **Verify:** CSV file downloads
- Open CSV file
- **Verify:** All users are included with correct data

### 17. Logout
- Click user menu and logout
- **Verify:** Redirected to login page

---

## Expected Results
- Admin can login with MFA
- User table displays all users with correct roles and statuses
- Filtering and search work correctly
- New users can be created with all required fields
- Users can be edited, deactivated, reactivated
- Role changes are saved and affect user permissions
- Bulk actions work if implemented
- User activity logs display correctly

## Notes
- Verify MFA is enforced for admin login
- Check if password reset functionality exists for admin to reset user passwords
- Note any missing audit trail features
