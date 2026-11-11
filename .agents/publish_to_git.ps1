# Script publish to git without docs markdown files
Write-Host "1. Reverting any tracked markdown in docs/..."
git checkout -- docs/PROJECT_DOCUMENTATION_CHANGELOG.md docs/PROJECT_SETUP_GAP_REGISTER.md docs/README_ENVIRONMENT_AUDIT.md docs/README_SETUP_VERIFICATION.md 2>$null

Write-Host "2. Staging core project files..."
git add 02_database/
git add 03_backend/
git add 04_frontend/
git add api/
git add infrastructure/
git add scripts/
git add e2e_scripts/
git add .agents/
git add .claude/
git add .ai/
git add docs/architecture/*.drawio.svg
git add package.json
git add vercel.json
git add docker-compose.yml
git add .gitignore
git add README.md
git add AGENTS.md
git add CLAUDE.md
git add DESIGN.md
git add PRODUCT.md

Write-Host "3. Status of staged changes:"
git status --short

Write-Host "4. Committing..."
git commit -m "feat(deploy): config Vercel fullstack, registration redesign and UI improvements"

Write-Host "5. Pushing to GitHub (origin/main)..."
git push origin main

Write-Host "Done! Successfully pushed to GitHub."

