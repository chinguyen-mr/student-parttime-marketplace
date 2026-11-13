# Script publish to git without docs markdown files
Write-Host "1. Reverting any tracked markdown in docs/..."
git checkout -- docs/*.md 2>$null

Write-Host "2. Staging core project code & assets (NO .md in docs/)..."
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
git add docs/architecture/*.drawio.svg 2>$null
git add package.json
git add vercel.json
git add docker-compose.yml
git add .gitignore
git add README.md
git add AGENTS.md
git add CLAUDE.md
git add DESIGN.md
git add PRODUCT.md

Write-Host "3. Unstaging any docs markdown just in case..."
git reset HEAD docs/*.md 2>$null
git reset HEAD docs/*/*.md 2>$null

Write-Host "4. Status of staged changes:"
git status --short

Write-Host "5. Committing changes..."
git commit -m "feat: complete student profile, reviews, and prepare Vercel deploy"

Write-Host "6. Pushing to remote..."
$currentBranch = (git branch --show-current).Trim()
Write-Host "Pushing to branch: $currentBranch"
git push origin $currentBranch

if ($currentBranch -ne "main") {
    Write-Host "Syncing to branch main for Vercel Production..."
    git checkout main
    git merge $currentBranch --ff-only
    if ($LASTEXITCODE -ne 0) {
        git merge $currentBranch -m "merge: sync latest changes from $currentBranch to main"
    }
    git push origin main
    git checkout $currentBranch
}

Write-Host "Done! Successfully prepared, committed, and pushed to GitHub for Vercel."
