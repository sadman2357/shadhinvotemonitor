# Vercel Deployment Guide - Shadhin Vote Monitor

## 🚀 Complete Vercel Deployment Guide

This guide will help you deploy the Shadhin Vote Monitor platform to Vercel in minutes.

---

## 📋 Prerequisites

1. **GitHub Account** - To host your code
2. **Vercel Account** - Sign up at https://vercel.com (free tier available)
3. **PostgreSQL Database** - Use one of these:
   - **Vercel Postgres** (recommended, integrated)
   - **Neon** (https://neon.tech - free tier)
   - **Supabase** (https://supabase.com - free tier)
   - **Railway** (https://railway.app)
4. **AWS S3 Account** - For media storage
5. **Google reCAPTCHA Keys** - Get from https://www.google.com/recaptcha/admin

---

## 🎯 Quick Deployment (5 Steps)

### Step 1: Push to GitHub

**Using GitHub Desktop (Easiest):**
1. Download GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop and sign in
3. Click **File** → **Add Local Repository**
4. Browse to: `C:\Users\user\.gemini\antigravity\scratch\shadhin-vote-monitor`
5. Click **Commit to main** (bottom left)
6. Click **Publish repository**
7. Name: `shadhin-vote-monitor`
8. Choose **Private** (recommended)
9. Click **Publish Repository**

✅ **Your code is now on GitHub!**

---

### Step 2: Setup Database (Choose One)

#### **Option A: Vercel Postgres (Recommended - Easiest)**

1. Go to https://vercel.com/dashboard
2. Click **Storage** → **Create Database**
3. Select **Postgres**
4. Name: `shadhin-vote-db`
5. Region: Choose closest to Bangladesh (Singapore recommended)
6. Click **Create**
7. **Copy the connection string** (you'll need this)

**Initialize Database:**
1. Click **Query** tab in Vercel Postgres dashboard
2. Copy the entire content from `database/schema.sql`
3. Paste and click **Run Query**

#### **Option B: Neon (Free Tier)**

1. Go to https://neon.tech
2. Sign up and create new project
3. Name: `shadhin-vote-monitor`
4. Region: Singapore
5. **Copy connection string**
6. Use their SQL Editor to run `database/schema.sql`

#### **Option C: Supabase (Free Tier)**

1. Go to https://supabase.com
2. Create new project
3. Name: `shadhin-vote-monitor`
4. Region: Singapore
5. **Copy connection string** (from Settings → Database)
6. Use SQL Editor to run `database/schema.sql`

---

### Step 3: Setup AWS S3

1. Go to AWS Console: https://console.aws.amazon.com/s3/
2. Click **Create bucket**
3. Bucket name: `shadhin-vote-media-[random-number]`
4. Region: `ap-southeast-1` (Singapore)
5. **Block all public access**: ✅ (keep checked)
6. Click **Create bucket**

**Create IAM User:**
1. Go to IAM: https://console.aws.amazon.com/iam/
2. Click **Users** → **Add users**
3. Username: `shadhin-vote-app`
4. Click **Next**
5. **Attach policies directly** → Select `AmazonS3FullAccess`
6. Click **Create user**
7. Click on the user → **Security credentials**
8. Click **Create access key**
9. Use case: **Application running outside AWS**
10. **Copy Access Key ID and Secret Access Key** (save securely!)

---

### Step 4: Setup reCAPTCHA

1. Go to: https://www.google.com/recaptcha/admin/create
2. Label: `Shadhin Vote Monitor`
3. reCAPTCHA type: **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
4. Domains: 
   - `localhost` (for testing)
   - `your-app.vercel.app` (add after deployment)
5. Click **Submit**
6. **Copy Site Key and Secret Key**

---

### Step 5: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub repository: `shadhin-vote-monitor`
4. Click **Import**

**Configure Environment Variables:**

Click **Environment Variables** and add these:

```env
# Database (from Step 2)
DATABASE_URL=postgresql://user:password@host:5432/database
DB_HOST=your-db-host.neon.tech
DB_PORT=5432
DB_NAME=shadhin_vote_monitor
DB_USER=your-username
DB_PASSWORD=your-password

# JWT Secret (generate new)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# AWS S3 (from Step 3)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET_NAME=shadhin-vote-media-xxxxx

# reCAPTCHA (from Step 4)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# App URL (will be provided by Vercel)
NEXT_PUBLIC_API_URL=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=3

# Security
IP_HASH_SALT=your-random-salt-string

# File Upload
MAX_FILE_SIZE=20971520
```

**Generate JWT Secret:**
```bash
# On Windows PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use: https://generate-secret.vercel.app/32
```

5. Click **Deploy**

⏳ **Wait 2-3 minutes for deployment...**

✅ **Your app is now live!**

---

## 🔧 Post-Deployment Setup

### 1. Update reCAPTCHA Domain

1. Go back to https://www.google.com/recaptcha/admin
2. Click on your site key
3. Add your Vercel domain: `your-app.vercel.app`
4. Save

### 2. Update NEXT_PUBLIC_API_URL

1. Go to Vercel dashboard → Your project
2. Click **Settings** → **Environment Variables**
3. Edit `NEXT_PUBLIC_API_URL`
4. Set to: `https://your-app.vercel.app`
5. Click **Save**
6. Go to **Deployments** → Click **...** → **Redeploy**

### 3. Create Admin User

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run script
vercel env pull .env.local
node scripts/create-admin.js
```

**Option B: Manually via Database**

1. Generate password hash:
   ```javascript
   // Run in browser console or Node.js
   const bcrypt = require('bcryptjs');
   const hash = bcrypt.hashSync('your-password', 10);
   console.log(hash);
   ```

2. Insert into database:
   ```sql
   INSERT INTO admins (username, password_hash, role)
   VALUES ('admin', 'your-bcrypt-hash', 'admin');
   ```

### 4. Test Your Deployment

Visit your Vercel URL:
- ✅ Homepage: `https://your-app.vercel.app`
- ✅ Report page: `https://your-app.vercel.app/report`
- ✅ Incidents: `https://your-app.vercel.app/incidents`
- ✅ Admin: `https://your-app.vercel.app/admin`

---

## 🎨 Custom Domain (Optional)

### Add Your Own Domain

1. Buy domain from Namecheap, GoDaddy, etc.
2. In Vercel dashboard → **Settings** → **Domains**
3. Add your domain: `votemonitor.com`
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-30 minutes)

---

## 📊 Vercel Features You Get

### Automatic Features
- ✅ **SSL/HTTPS** - Automatic and free
- ✅ **CDN** - Global edge network
- ✅ **Serverless Functions** - Auto-scaling API routes
- ✅ **Analytics** - Built-in performance monitoring
- ✅ **Preview Deployments** - Every git push gets a preview URL
- ✅ **Automatic Deployments** - Push to GitHub = Auto deploy

### Monitoring
- **Analytics**: Vercel dashboard → Analytics
- **Logs**: Vercel dashboard → Logs
- **Performance**: Vercel dashboard → Speed Insights

---

## 🔄 Making Updates

### Update Your Code

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push
   ```
3. **Vercel automatically deploys!** 🚀

### Rollback if Needed

1. Go to Vercel dashboard → **Deployments**
2. Find previous working deployment
3. Click **...** → **Promote to Production**

---

## 💰 Pricing & Limits

### Vercel Free Tier (Hobby)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless function executions: 100 GB-hours
- ✅ 1000 preview deployments
- ✅ Free SSL
- ⚠️ For personal/non-commercial use

### Vercel Pro ($20/month)
- ✅ Everything in Free
- ✅ 1 TB bandwidth
- ✅ Commercial use allowed
- ✅ Team collaboration
- ✅ Advanced analytics

**For 48-hour election monitoring**: Free tier should be sufficient!

### Database Costs
- **Vercel Postgres**: Free tier (256 MB storage)
- **Neon**: Free tier (3 GB storage)
- **Supabase**: Free tier (500 MB database)

### S3 Costs
- **Storage**: ~$0.023 per GB/month
- **Requests**: ~$0.0004 per 1000 requests
- **Estimated for 48 hours**: $1-5

---

## 🔐 Security Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] `.env` file NOT in GitHub (check .gitignore)
- [ ] Database initialized with schema
- [ ] Admin user created
- [ ] reCAPTCHA domain added
- [ ] S3 bucket configured
- [ ] Test report submission
- [ ] Test admin login
- [ ] Test both languages (Bangla/English)
- [ ] Test on mobile device
- [ ] Rate limiting working
- [ ] File upload working (test 20MB file)

---

## 🆘 Troubleshooting

### Build Fails

**Check Vercel build logs:**
1. Go to deployment
2. Click **Building** → View logs
3. Fix errors in code
4. Push to GitHub

**Common issues:**
- Missing dependencies → Check `package.json`
- TypeScript errors → Fix or add `// @ts-ignore`
- Environment variables → Check they're set in Vercel

### Database Connection Fails

1. Check `DATABASE_URL` in Vercel environment variables
2. Verify database is accessible from internet
3. Check database credentials
4. Test connection string locally

### File Upload Fails

1. Check S3 credentials in Vercel
2. Verify bucket exists and region is correct
3. Check IAM user has S3 permissions
4. Test with small file first

### reCAPTCHA Not Working

1. Check site key in Vercel environment variables
2. Verify domain is added in reCAPTCHA admin
3. Check both site key and secret key are correct

---

## 📈 Performance Optimization

### Vercel Automatically Handles:
- ✅ Image optimization
- ✅ Code splitting
- ✅ Compression
- ✅ Caching
- ✅ Edge network

### You Can Add:
1. **Vercel Analytics** (free)
   - Go to project → Analytics → Enable
2. **Speed Insights** (free)
   - Go to project → Speed Insights → Enable

---

## 🎯 Production Checklist

### Before 48-Hour Operation:

- [ ] **Test Everything**
  - [ ] Submit test report
  - [ ] Approve/reject reports
  - [ ] Test filters
  - [ ] Test pagination
  - [ ] Test both languages
  - [ ] Test on mobile

- [ ] **Monitor Setup**
  - [ ] Enable Vercel Analytics
  - [ ] Set up error tracking (Sentry - optional)
  - [ ] Configure uptime monitoring (UptimeRobot - free)

- [ ] **Backup Plan**
  - [ ] Database backup configured
  - [ ] Know how to rollback deployment
  - [ ] Have admin credentials saved securely

- [ ] **Team Ready**
  - [ ] Admin users created
  - [ ] Everyone knows login URL
  - [ ] Emergency contacts ready

---

## 🚀 Quick Start Summary

```bash
# 1. Push to GitHub (using GitHub Desktop)
# 2. Create Vercel account
# 3. Setup database (Vercel Postgres recommended)
# 4. Setup S3 bucket
# 5. Get reCAPTCHA keys
# 6. Deploy on Vercel (import from GitHub)
# 7. Add environment variables
# 8. Create admin user
# 9. Test everything
# 10. Go live!
```

**Total time: 30-45 minutes** ⏱️

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎉 You're Ready!

Your platform will be:
- ✅ **Live** on a global CDN
- ✅ **Secure** with automatic HTTPS
- ✅ **Scalable** with serverless functions
- ✅ **Fast** with edge optimization
- ✅ **Monitored** with built-in analytics

**Perfect for your 48-hour election monitoring mission!** 🇧🇩

---

**Next Steps:**
1. Follow Step 1 to push to GitHub
2. Follow Steps 2-5 to deploy on Vercel
3. Test everything
4. Go live!

Good luck! 🚀
