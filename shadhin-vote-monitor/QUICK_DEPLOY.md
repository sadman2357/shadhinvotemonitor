# Vercel Quick Start - Shadhin Vote Monitor

## 🚀 Deploy in 5 Minutes

### Step 1: Push to GitHub (2 minutes)

**Using GitHub Desktop (Easiest):**

1. **Download GitHub Desktop**: https://desktop.github.com/
2. **Install and sign in** with your GitHub account
3. **Add repository**:
   - Click **File** → **Add Local Repository**
   - Browse to: `C:\Users\user\.gemini\antigravity\scratch\shadhin-vote-monitor`
   - Click **Add Repository**
4. **Commit**:
   - Bottom left: Enter message: `Initial commit: Complete platform`
   - Click **Commit to main**
5. **Publish**:
   - Click **Publish repository**
   - Name: `shadhin-vote-monitor`
   - Choose **Private** ✅
   - Click **Publish Repository**

✅ **Done! Code is on GitHub**

---

### Step 2: Setup Database (5 minutes)

**Recommended: Neon (Free & Easy)**

1. Go to: https://neon.tech
2. Sign up (use GitHub account for quick signup)
3. Click **Create Project**
4. Name: `shadhin-vote-monitor`
5. Region: **Singapore**
6. Click **Create Project**
7. **Copy the connection string** (starts with `postgresql://`)
8. Click **SQL Editor** (left sidebar)
9. Open `database/schema.sql` from your project
10. Copy ALL content and paste in SQL Editor
11. Click **Run**

✅ **Database ready!**

---

### Step 3: Setup S3 (5 minutes)

**Quick AWS S3 Setup:**

1. Go to: https://console.aws.amazon.com/s3/
2. Click **Create bucket**
3. Name: `shadhin-vote-media-2026` (must be unique)
4. Region: **Asia Pacific (Singapore) ap-southeast-1**
5. Keep "Block all public access" ✅
6. Click **Create bucket**

**Create Access Keys:**

1. Go to: https://console.aws.amazon.com/iam/
2. Click **Users** → **Create user**
3. Name: `shadhin-vote-app`
4. Click **Next** → **Attach policies directly**
5. Search and select: `AmazonS3FullAccess`
6. Click **Create user**
7. Click on user → **Security credentials** tab
8. Click **Create access key**
9. Select: **Application running outside AWS**
10. Click **Create access key**
11. **COPY both keys** (Access Key ID and Secret Access Key)

✅ **S3 ready!**

---

### Step 4: Get reCAPTCHA Keys (2 minutes)

1. Go to: https://www.google.com/recaptcha/admin/create
2. Label: `Shadhin Vote Monitor`
3. Type: **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
4. Domains: 
   - Add: `localhost`
   - (You'll add Vercel domain later)
5. Accept terms → Click **Submit**
6. **Copy Site Key and Secret Key**

✅ **reCAPTCHA ready!**

---

### Step 5: Deploy to Vercel (10 minutes)

1. Go to: https://vercel.com/signup
2. Sign up with **GitHub** (easiest)
3. Click **Add New** → **Project**
4. **Import** your `shadhin-vote-monitor` repository
5. Click **Import**

**Configure Project:**

- Framework Preset: **Next.js** (auto-detected)
- Root Directory: `./` (leave as is)
- Build Command: `npm run build` (auto-filled)

**Add Environment Variables:**

Click **Environment Variables** and add these **ONE BY ONE**:

```
DATABASE_URL = [paste your Neon connection string]
DB_HOST = [your-db-host from Neon]
DB_PORT = 5432
DB_NAME = shadhin_vote_monitor
DB_USER = [from Neon connection string]
DB_PASSWORD = [from Neon connection string]

JWT_SECRET = [generate: use any 32+ character random string]

AWS_REGION = ap-southeast-1
AWS_ACCESS_KEY_ID = [from Step 3]
AWS_SECRET_ACCESS_KEY = [from Step 3]
S3_BUCKET_NAME = shadhin-vote-media-2026

NEXT_PUBLIC_RECAPTCHA_SITE_KEY = [from Step 4]
RECAPTCHA_SECRET_KEY = [from Step 4]

NEXT_PUBLIC_API_URL = https://your-app.vercel.app

RATE_LIMIT_WINDOW_MS = 3600000
RATE_LIMIT_MAX_REQUESTS = 3

IP_HASH_SALT = [any random string]
MAX_FILE_SIZE = 20971520
NODE_ENV = production
```

**Generate JWT Secret:**
- Visit: https://generate-secret.vercel.app/32
- Copy the generated secret

6. Click **Deploy**

⏳ **Wait 2-3 minutes...**

🎉 **Your app is LIVE!**

---

### Step 6: Post-Deployment (5 minutes)

**Update reCAPTCHA:**

1. Copy your Vercel URL (e.g., `your-app.vercel.app`)
2. Go to: https://www.google.com/recaptcha/admin
3. Click your site
4. Add domain: `your-app.vercel.app`
5. Save

**Update API URL:**

1. In Vercel dashboard → Your project
2. **Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_API_URL`
4. Click **Edit**
5. Change to: `https://your-actual-vercel-url.vercel.app`
6. Save
7. Go to **Deployments** tab
8. Click **...** on latest → **Redeploy**

**Create Admin User:**

Use Neon SQL Editor:

```sql
-- First, generate password hash at: https://bcrypt-generator.com/
-- Use 10 rounds, enter your password, copy the hash

INSERT INTO admins (username, password_hash, role)
VALUES ('admin', '$2a$10$YOUR_BCRYPT_HASH_HERE', 'admin');
```

✅ **All done!**

---

## 🎯 Test Your Deployment

Visit these URLs (replace with your Vercel URL):

- ✅ Homepage: `https://your-app.vercel.app`
- ✅ Report: `https://your-app.vercel.app/report`
- ✅ Incidents: `https://your-app.vercel.app/incidents`
- ✅ Admin: `https://your-app.vercel.app/admin`

**Test:**
1. Submit a test report
2. Login to admin
3. Approve the report
4. Check incidents feed

---

## 🔄 Making Updates

**After making code changes:**

1. Commit in GitHub Desktop
2. Click **Push origin**
3. Vercel automatically redeploys! 🚀

---

## 💰 Costs

**Free Tier (Sufficient for 48 hours):**
- Vercel: FREE
- Neon Database: FREE (3 GB)
- S3: ~$1-5 for 48 hours
- reCAPTCHA: FREE

**Total: ~$1-5** 💵

---

## 🆘 Quick Troubleshooting

**Build failed?**
- Check Vercel logs
- Verify all environment variables are set
- Check for typos in variable names

**Database connection error?**
- Verify DATABASE_URL is correct
- Check database is accessible from internet
- Verify schema was run successfully

**File upload not working?**
- Check S3 credentials
- Verify bucket name is correct
- Check bucket region matches AWS_REGION

**reCAPTCHA error?**
- Verify domain is added in reCAPTCHA admin
- Check both site key and secret key
- Make sure using v2 checkbox type

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Full Guide**: See `VERCEL_DEPLOYMENT.md`

---

## ✅ Checklist

- [ ] Code pushed to GitHub
- [ ] Database created and schema loaded
- [ ] S3 bucket created with access keys
- [ ] reCAPTCHA keys obtained
- [ ] Deployed to Vercel
- [ ] Environment variables added
- [ ] reCAPTCHA domain updated
- [ ] API URL updated and redeployed
- [ ] Admin user created
- [ ] Tested report submission
- [ ] Tested admin login
- [ ] Tested both languages

---

**Total Time: ~30 minutes**

**You're ready to monitor elections! 🇧🇩**
