# 🚀 VERCEL DEPLOYMENT - STEP BY STEP CHECKLIST

## ⏱️ Total Time: 30 minutes

---

## ✅ STEP 1: PUSH TO GITHUB (5 minutes)

### Download GitHub Desktop
1. Open browser and go to: **https://desktop.github.com/**
2. Click **Download for Windows**
3. Run the installer
4. Sign in with your GitHub account (or create one)

### Push Your Code
1. Open GitHub Desktop
2. Click **File** → **Add Local Repository**
3. Click **Choose...** button
4. Navigate to: `C:\Users\user\.gemini\antigravity\scratch\shadhin-vote-monitor`
5. Click **Select Folder**
6. Click **create a repository** (if prompted)
7. In the bottom-left corner:
   - Summary: `Initial commit: Complete platform`
   - Click **Commit to main**
8. Click **Publish repository** (top bar)
9. Repository name: `shadhin-vote-monitor`
10. **Uncheck** "Keep this code private" if you want it public, or keep checked for private
11. Click **Publish Repository**

✅ **DONE! Your code is on GitHub**

---

## ✅ STEP 2: SETUP DATABASE (5 minutes)

### Create Neon Account
1. Go to: **https://neon.tech**
2. Click **Sign up**
3. Choose **Continue with GitHub** (easiest)
4. Authorize Neon

### Create Database
1. Click **Create a project**
2. Project name: `shadhin-vote-monitor`
3. Region: **Singapore**
4. Click **Create project**

### Get Connection String
1. You'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx.neon.tech/neondb
   ```
2. **COPY THIS ENTIRE STRING** - Save it in Notepad!

### Load Database Schema
1. Click **SQL Editor** in the left sidebar
2. Open this file on your computer:
   `C:\Users\user\.gemini\antigravity\scratch\shadhin-vote-monitor\database\schema.sql`
3. Open it with Notepad
4. **Copy ALL the content** (Ctrl+A, Ctrl+C)
5. Paste into Neon SQL Editor
6. Click **Run** button

✅ **DONE! Database is ready**

---

## ✅ STEP 3: SETUP AWS S3 (10 minutes)

### Create S3 Bucket
1. Go to: **https://console.aws.amazon.com/s3/**
2. Sign in to AWS (or create account)
3. Click **Create bucket**
4. Bucket name: `shadhin-vote-media-2026` (or any unique name)
5. Region: **Asia Pacific (Singapore) ap-southeast-1**
6. Keep **"Block all public access"** CHECKED ✅
7. Scroll down and click **Create bucket**

### Create IAM User for Access
1. Go to: **https://console.aws.amazon.com/iam/**
2. Click **Users** (left sidebar)
3. Click **Create user**
4. User name: `shadhin-vote-app`
5. Click **Next**
6. Select **Attach policies directly**
7. Search for: `AmazonS3FullAccess`
8. Check the box next to it
9. Click **Next**
10. Click **Create user**

### Get Access Keys
1. Click on the user you just created: `shadhin-vote-app`
2. Click **Security credentials** tab
3. Scroll to **Access keys**
4. Click **Create access key**
5. Select: **Application running outside AWS**
6. Click **Next**
7. Click **Create access key**
8. **COPY BOTH KEYS** and save in Notepad:
   - Access key ID: `AKIA...`
   - Secret access key: `wJal...`
9. Click **Done**

✅ **DONE! S3 is ready**

---

## ✅ STEP 4: GET reCAPTCHA KEYS (3 minutes)

1. Go to: **https://www.google.com/recaptcha/admin/create**
2. Sign in with Google account
3. Fill in:
   - Label: `Shadhin Vote Monitor`
   - reCAPTCHA type: **reCAPTCHA v2**
   - Select: **"I'm not a robot" Checkbox**
4. Domains:
   - Add: `localhost`
   - (You'll add Vercel domain later)
5. Accept terms
6. Click **Submit**
7. **COPY BOTH KEYS** and save in Notepad:
   - Site key: `6Le...`
   - Secret key: `6Le...`

✅ **DONE! reCAPTCHA ready**

---

## ✅ STEP 5: DEPLOY TO VERCEL (7 minutes)

### Create Vercel Account
1. Go to: **https://vercel.com/signup**
2. Click **Continue with GitHub**
3. Authorize Vercel

### Import Project
1. Click **Add New...** → **Project**
2. Find your repository: `shadhin-vote-monitor`
3. Click **Import**

### Configure Build Settings
- Framework Preset: **Next.js** (should be auto-detected)
- Root Directory: `./` (leave as is)
- Build Command: Leave default
- Output Directory: Leave default

### Add Environment Variables

Click **Environment Variables** tab and add these **ONE BY ONE**:

**IMPORTANT: Copy these exactly, replacing values with yours from previous steps**

```
Name: DATABASE_URL
Value: [Paste your Neon connection string from Step 2]

Name: DB_HOST
Value: [Extract from connection string: ep-xxx.neon.tech]

Name: DB_PORT
Value: 5432

Name: DB_NAME
Value: neondb

Name: DB_USER
Value: [Extract from connection string: username part]

Name: DB_PASSWORD
Value: [Extract from connection string: password part]

Name: JWT_SECRET
Value: [Go to https://generate-secret.vercel.app/32 and paste the result]

Name: AWS_REGION
Value: ap-southeast-1

Name: AWS_ACCESS_KEY_ID
Value: [Your AWS Access Key from Step 3]

Name: AWS_SECRET_ACCESS_KEY
Value: [Your AWS Secret Key from Step 3]

Name: S3_BUCKET_NAME
Value: shadhin-vote-media-2026

Name: NEXT_PUBLIC_RECAPTCHA_SITE_KEY
Value: [Your reCAPTCHA Site Key from Step 4]

Name: RECAPTCHA_SECRET_KEY
Value: [Your reCAPTCHA Secret Key from Step 4]

Name: NEXT_PUBLIC_API_URL
Value: https://your-app.vercel.app

Name: RATE_LIMIT_WINDOW_MS
Value: 3600000

Name: RATE_LIMIT_MAX_REQUESTS
Value: 3

Name: IP_HASH_SALT
Value: random-salt-string-12345

Name: MAX_FILE_SIZE
Value: 20971520

Name: NODE_ENV
Value: production
```

### Deploy!
1. Click **Deploy** button
2. Wait 2-3 minutes...
3. You'll see: **Congratulations! 🎉**
4. **COPY YOUR VERCEL URL** (e.g., `shadhin-vote-monitor.vercel.app`)

✅ **DONE! Your app is LIVE!**

---

## ✅ STEP 6: POST-DEPLOYMENT (5 minutes)

### Update reCAPTCHA Domain
1. Go back to: **https://www.google.com/recaptcha/admin**
2. Click on your site: `Shadhin Vote Monitor`
3. In **Domains** section, add your Vercel URL (without https://):
   - Example: `shadhin-vote-monitor.vercel.app`
4. Click **Save**

### Update API URL in Vercel
1. In Vercel dashboard, go to your project
2. Click **Settings** tab
3. Click **Environment Variables**
4. Find `NEXT_PUBLIC_API_URL`
5. Click the **...** menu → **Edit**
6. Change value to: `https://[your-actual-vercel-url].vercel.app`
7. Click **Save**
8. Go to **Deployments** tab
9. Click **...** on the latest deployment → **Redeploy**
10. Check **Use existing Build Cache**
11. Click **Redeploy**

### Create Admin User
1. Go back to Neon: **https://console.neon.tech**
2. Click your project: `shadhin-vote-monitor`
3. Click **SQL Editor**
4. First, generate a password hash:
   - Go to: **https://bcrypt-generator.com/**
   - Enter your desired admin password
   - Rounds: **10**
   - Click **Generate Hash**
   - Copy the hash (starts with `$2a$10$...`)
5. Back in Neon SQL Editor, paste this (replace the hash):
   ```sql
   INSERT INTO admins (username, password_hash, role)
   VALUES ('admin', '$2a$10$YOUR_HASH_HERE', 'admin');
   ```
6. Click **Run**

✅ **DONE! Admin user created**

---

## 🎉 TEST YOUR DEPLOYMENT

### Visit Your Site
Open these URLs (replace with your Vercel URL):

1. **Homepage**: `https://your-app.vercel.app`
   - Should see: Hero section, features, language toggle

2. **Report Page**: `https://your-app.vercel.app/report`
   - Should see: Form with district/constituency dropdowns

3. **Incidents Feed**: `https://your-app.vercel.app/incidents`
   - Should see: Empty feed (no reports yet)

4. **Admin Dashboard**: `https://your-app.vercel.app/admin`
   - Login with: username `admin` and your password
   - Should see: Dashboard with statistics

### Test Full Flow
1. Go to Report page
2. Fill in the form:
   - Select district and constituency
   - Enter voting center number
   - Upload a test image
   - Complete reCAPTCHA
   - Submit
3. Login to Admin dashboard
4. Find your report
5. Click **Approve**
6. Go to Incidents feed
7. Your report should appear!

---

## ✅ FINAL CHECKLIST

- [ ] Code pushed to GitHub ✅
- [ ] Neon database created ✅
- [ ] Database schema loaded ✅
- [ ] S3 bucket created ✅
- [ ] IAM user created with keys ✅
- [ ] reCAPTCHA keys obtained ✅
- [ ] Deployed to Vercel ✅
- [ ] All environment variables added ✅
- [ ] reCAPTCHA domain updated ✅
- [ ] API URL updated and redeployed ✅
- [ ] Admin user created ✅
- [ ] Tested homepage ✅
- [ ] Tested report submission ✅
- [ ] Tested admin login ✅
- [ ] Tested report approval ✅
- [ ] Tested incidents feed ✅

---

## 💰 TOTAL COST

- Vercel: **FREE** ✅
- Neon Database: **FREE** ✅
- reCAPTCHA: **FREE** ✅
- AWS S3: **~$1-5** for 48 hours 💵

**Total: $1-5** 🎉

---

## 🆘 TROUBLESHOOTING

### Build Failed on Vercel
- Check the build logs in Vercel
- Verify all environment variables are set
- Make sure no typos in variable names

### Database Connection Error
- Verify DATABASE_URL is correct
- Check that schema was run successfully in Neon
- Test connection in Neon SQL Editor

### File Upload Not Working
- Check S3 credentials are correct
- Verify bucket name matches
- Check bucket region is `ap-southeast-1`

### reCAPTCHA Error
- Make sure domain is added in reCAPTCHA admin
- Verify both site key and secret key are correct
- Ensure using reCAPTCHA v2 (checkbox type)

---

## 🎯 YOU'RE LIVE!

Your **Shadhin Vote Monitor** platform is now:
- ✅ Live on the internet
- ✅ Secured with HTTPS
- ✅ Running on global CDN
- ✅ Auto-scaling
- ✅ Production-ready

**Share your URL and start monitoring!** 🇧🇩

---

**Need help? Check `VERCEL_DEPLOYMENT.md` for detailed troubleshooting.**
