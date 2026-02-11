# GitHub Setup Guide - Shadhin Vote Monitor

## 📋 Prerequisites

1. **Git installed** on your computer
2. **GitHub account** created
3. **GitHub CLI** (optional, but recommended)

---

## 🚀 Method 1: Using Git Command Line (Recommended)

### Step 1: Initialize Git Repository

```bash
# Navigate to project directory
cd C:\Users\user\.gemini\antigravity\scratch\shadhin-vote-monitor

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Shadhin Vote Monitor - Complete civic reporting platform"
```

### Step 2: Create GitHub Repository

**Option A: Via GitHub Website**
1. Go to https://github.com/new
2. Repository name: `shadhin-vote-monitor`
3. Description: `Production-ready civic reporting platform for Bangladesh national election monitoring`
4. Choose **Private** (recommended for security) or **Public**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

**Option B: Via GitHub CLI** (if installed)
```bash
# Login to GitHub (first time only)
gh auth login

# Create repository (private)
gh repo create shadhin-vote-monitor --private --source=. --remote=origin

# OR create public repository
gh repo create shadhin-vote-monitor --public --source=. --remote=origin
```

### Step 3: Connect Local Repository to GitHub

```bash
# Add GitHub as remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/shadhin-vote-monitor.git

# Verify remote
git remote -v
```

### Step 4: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your GitHub password)

---

## 🔑 Method 2: Using GitHub Desktop (Easiest for Beginners)

### Step 1: Install GitHub Desktop
Download from: https://desktop.github.com/

### Step 2: Add Repository
1. Open GitHub Desktop
2. Click **File** → **Add Local Repository**
3. Browse to: `C:\Users\user\.gemini\antigravity\scratch\shadhin-vote-monitor`
4. Click **Add Repository**

### Step 3: Create Initial Commit
1. You'll see all files listed
2. Add commit message: `Initial commit: Complete civic reporting platform`
3. Click **Commit to main**

### Step 4: Publish to GitHub
1. Click **Publish repository**
2. Name: `shadhin-vote-monitor`
3. Description: `Production-ready civic reporting platform for Bangladesh`
4. Choose **Private** or **Public**
5. Click **Publish Repository**

---

## 🔐 Creating a Personal Access Token (for HTTPS)

If using HTTPS and git asks for password:

1. Go to: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Note: `Shadhin Vote Monitor`
4. Expiration: Choose duration (90 days recommended)
5. Scopes: Select **repo** (full control of private repositories)
6. Click **Generate token**
7. **COPY THE TOKEN** (you won't see it again!)
8. Use this token as your password when pushing

---

## 🔒 Security: Protecting Sensitive Data

### IMPORTANT: Before Pushing

Make sure `.env` is in `.gitignore` (already done ✅)

**Verify:**
```bash
# Check if .env is ignored
git status

# .env should NOT appear in the list
# If it does, add to .gitignore:
echo .env >> .gitignore
git add .gitignore
git commit -m "Ensure .env is ignored"
```

### Files Already Protected (in .gitignore)
- ✅ `.env` (environment variables)
- ✅ `.env.local`
- ✅ `.env.production`
- ✅ `node_modules/` (dependencies)
- ✅ `.next/` (build files)
- ✅ `uploads/` (local uploads)

---

## 📝 Recommended Repository Settings

### 1. Add Repository Description
```
Production-ready, full-stack civic reporting platform for Bangladesh national election monitoring. Features anonymous reporting, admin moderation, bilingual support (Bangla/English), and comprehensive security measures.
```

### 2. Add Topics (Tags)
- `election-monitoring`
- `civic-tech`
- `bangladesh`
- `nextjs`
- `postgresql`
- `docker`
- `security`
- `typescript`

### 3. Add README Badges (Optional)

Add to top of README.md:
```markdown
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)
```

### 4. Enable Security Features
1. Go to repository **Settings** → **Security**
2. Enable **Dependabot alerts**
3. Enable **Dependabot security updates**
4. Enable **Secret scanning**

---

## 📂 Repository Structure on GitHub

After pushing, your repository will contain:

```
shadhin-vote-monitor/
├── 📄 README.md (main documentation)
├── 📄 LICENSE (add if needed)
├── 📁 components/
├── 📁 data/
├── 📁 database/
├── 📁 lib/
├── 📁 pages/
├── 📁 public/
├── 📁 scripts/
├── 📁 styles/
├── 📁 nginx/
├── 🐳 Dockerfile
├── 🐳 docker-compose.yml
├── 📦 package.json
└── 📚 Documentation files
```

---

## 🔄 Future Updates

### Making Changes and Pushing

```bash
# 1. Make your changes to files

# 2. Check what changed
git status

# 3. Add changed files
git add .

# 4. Commit with message
git commit -m "Description of changes"

# 5. Push to GitHub
git push
```

### Creating Branches (Recommended for Features)

```bash
# Create new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch to GitHub
git push -u origin feature/new-feature

# Then create Pull Request on GitHub
```

---

## 🌐 Cloning on Another Machine

```bash
# Clone repository
git clone https://github.com/YOUR-USERNAME/shadhin-vote-monitor.git

# Navigate to directory
cd shadhin-vote-monitor

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# Then run: npm run dev
```

---

## ⚠️ Important Security Notes

### DO NOT COMMIT:
- ❌ `.env` file (contains secrets)
- ❌ `node_modules/` (too large)
- ❌ Database backups with real data
- ❌ SSL certificates
- ❌ AWS credentials
- ❌ JWT secrets
- ❌ Admin passwords

### SAFE TO COMMIT:
- ✅ `.env.example` (template without secrets)
- ✅ Source code
- ✅ Documentation
- ✅ Configuration files
- ✅ Database schema (without data)
- ✅ Docker files

---

## 🎯 Quick Command Reference

```bash
# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Your message"

# Push
git push

# Pull latest changes
git pull

# View commit history
git log --oneline

# Create branch
git checkout -b branch-name

# Switch branch
git checkout main

# View remotes
git remote -v
```

---

## 🆘 Troubleshooting

### "Permission denied (publickey)"
**Solution**: Use HTTPS instead of SSH, or set up SSH keys
```bash
# Change to HTTPS
git remote set-url origin https://github.com/YOUR-USERNAME/shadhin-vote-monitor.git
```

### "Failed to push some refs"
**Solution**: Pull first, then push
```bash
git pull origin main --rebase
git push
```

### "Large files detected"
**Solution**: Remove from git history
```bash
# Remove file from git (keeps local copy)
git rm --cached large-file.zip

# Add to .gitignore
echo "large-file.zip" >> .gitignore

# Commit
git commit -m "Remove large file"
```

### Accidentally Committed .env
**Solution**: Remove from history
```bash
# Remove from git
git rm --cached .env

# Add to .gitignore
echo .env >> .gitignore

# Commit
git commit -m "Remove .env from repository"

# Force push (if already pushed)
git push --force
```

---

## 📞 Additional Resources

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **GitHub CLI**: https://cli.github.com/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

**Ready to push your code to GitHub!** 🚀

Choose Method 1 (Command Line) or Method 2 (GitHub Desktop) and follow the steps above.
