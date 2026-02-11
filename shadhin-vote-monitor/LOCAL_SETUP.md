# 🚀 Run Shadhin Vote Monitor Locally

## Quick Start (5 Minutes)

### Step 1: Install Node.js Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

### Step 2: Set Up Environment Variables

Copy the example file:

```powershell
Copy-Item .env.example .env.local
```

Then edit `.env.local` with these MINIMAL settings for local testing:

```env
# Database (we'll skip for frontend preview)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shadhin_vote_monitor
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret (any string for local)
JWT_SECRET=local-dev-secret-key-12345678901234567890

# AWS S3 (dummy for local preview)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
S3_BUCKET_NAME=dummy

# reCAPTCHA (Google test keys)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

# App URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=3

# Security
IP_HASH_SALT=local-salt

# Environment
NODE_ENV=development
```

### Step 3: Run Development Server

```powershell
npm run dev
```

### Step 4: Open Browser

Visit: **http://localhost:3000**

## ✅ What You'll See

- ✅ **Homepage** - Hero section, features, stats
- ✅ **Report Page** - Full submission form with file upload
- ✅ **Incidents Feed** - Public reports display
- ✅ **Admin Dashboard** - Login and management UI
- ✅ **Language Toggle** - Switch between Bangla/English
- ✅ **Responsive Design** - Mobile-friendly

## ⚠️ Note

Without database setup, the API routes won't work, but you can see the complete frontend UI.

## 🔧 Full Setup with Database

If you want full functionality:

### Option 1: Use Docker (Recommended)

```powershell
# Start PostgreSQL only
docker run --name shadhin-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=shadhin_vote_monitor -p 5432:5432 -d postgres:15-alpine

# Wait 5 seconds
Start-Sleep -Seconds 5

# Run schema
Get-Content database\schema.sql | docker exec -i shadhin-postgres psql -U postgres -d shadhin_vote_monitor

# Update .env.local with:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shadhin_vote_monitor

# Run app
npm run dev
```

### Option 2: Install PostgreSQL Locally

1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Install and set password
3. Create database: `shadhin_vote_monitor`
4. Run schema from `database/schema.sql`
5. Update `.env.local` with your credentials
6. Run `npm run dev`

## 🎯 Quick Commands

```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📱 Pages to Visit

- **Homepage**: http://localhost:3000
- **Report**: http://localhost:3000/report
- **Incidents**: http://localhost:3000/incidents
- **Admin**: http://localhost:3000/admin

## 🔐 Test Admin Login

If you set up the database, create an admin:

```powershell
node scripts\create-admin.js
```

Then login at: http://localhost:3000/admin

---

**Ready to see your platform!** 🚀
