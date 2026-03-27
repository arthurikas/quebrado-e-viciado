---
description: Deployment command for Easypanel releases via Custom Git.
---

# /deploy - Production Deployment via GitHub to Easypanel

$ARGUMENTS

---

## Purpose

This command handles production deployment by adding, committing, and pushing the code to GitHub using the custom Git executable required for this machine, allowing the user to then manually rebuild on Easypanel.

---

## Deployment Flow

1. **Pre-flight Check**: Verifies if there are any outstanding changes to commit.
2. **Commit Changes**: Uses the custom Git executable to stage (`add .`) and `commit` all changes.
3. **Push to GitHub**: Uses the custom Git executable to `push` the code to the repository.
4. **Easypanel Rebuild**: Instructs the user to go to the Easypanel dashboard and click "Rebuild".

---

## Mandatory Execution Script

The AI **MUST** use the custom git executable located in `git_location.txt` to execute the sequence.

```powershell
# 1. Read Git Location
$rawGitPath = Get-Content "git_location.txt" -Raw
$gitPath = $rawGitPath.Trim()

# 2. Add and Commit
& $gitPath add .
& $gitPath commit -m "chore: auto-deployment via /deploy command"

# 3. Push to Repository
& $gitPath push
```

---

## Output Format

Once the push is successful, the AI should respond exactly like this:

```markdown
## 🚀 Deployment Sent to GitHub

**All changes have been committed and pushed successfully!**

### Next Steps:
1. Open your [Easypanel Dashboard](https://app.easypanel.io)
2. Go to your project service
3. Click on the **Rebuild** / **Redeploy** button to apply the changes in production.
```
