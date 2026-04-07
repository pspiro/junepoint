# GitHub Setup Instructions for CapitalFlow LMS

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `capitalflow-lms`
3. Description: `Private mortgage lending platform with AI underwriting`
4. Visibility: Private (recommended) or Public
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Initialize Local Git Repository

Open PowerShell in `C:\dev\june3` and run:

```powershell
# Initialize git if not already done
git init

# Create .gitignore if it doesn't exist
if (!(Test-Path .gitignore)) {
    @"
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/
shared/node_modules/
infrastructure/node_modules/
wireframes/node_modules/

# Environment variables
.env
.env.local
.env.*.local
frontend/.env
frontend/.env.local
backend/.env
backend/.env.local

# Build outputs
frontend/dist/
backend/dist/
shared/dist/
*.tsbuildinfo

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Test coverage
coverage/

# Database
*.db
*.sqlite

# Secrets
*.pem
*.key
contact.json
"@ | Out-File -FilePath .gitignore -Encoding utf8
}

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: CapitalFlow LMS - Private mortgage lending platform"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/capitalflow-lms.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify Upload

1. Go to `https://github.com/YOUR_USERNAME/capitalflow-lms`
2. Verify all files are present
3. Check that `.env` files are NOT uploaded (should be in .gitignore)

## Step 4: Set Up Branch Protection (Optional)

1. Go to repository Settings → Branches
2. Add rule for `main` branch
3. Enable "Require pull request reviews before merging"
4. Enable "Require status checks to pass before merging"

## Step 5: Add Repository Secrets (for CI/CD later)

1. Go to Settings → Secrets and variables → Actions
2. Add secrets:
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL` (for test database)
   - Any other secrets from `docs/config.md`

## Notes

- Never commit `.env` files or secrets
- Use `.env.example` files to document required environment variables
- Consider adding GitHub Actions for automated testing (see `.github/workflows/`)
