# Shadhin Vote Monitor

**Production-Ready Civic Reporting Platform for Bangladesh National Election Monitoring**

A secure, scalable, full-stack platform for anonymous citizen reporting of electoral irregularities during Bangladesh national elections.

## 🚀 Features

### Core Functionality
- **Anonymous Report Submission** with photo/video upload (max 20MB)
- **Public Incident Feed** with verified reports
- **Secure Admin Dashboard** for report moderation
- **Bilingual Support** (বাংলা/English) with i18n
- **GPS Location Detection** (optional)
- **Real-time Filtering** by district and constituency

### Security & Anti-Abuse
- ✅ Rate limiting (3 uploads per IP per hour)
- ✅ reCAPTCHA verification
- ✅ File type & size validation (server + client)
- ✅ Duplicate file detection (SHA-256 hash)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (input sanitization)
- ✅ CSRF protection
- ✅ IP hashing (privacy-preserving)
- ✅ JWT-based admin authentication
- ✅ Helmet.js security headers
- ✅ HTTPS enforcement
- ✅ DDoS mitigation (NGINX rate limiting)

### Media Handling
- Image optimization & compression
- Automatic watermarking ("Citizen Submitted – Unverified")
- Thumbnail generation
- S3-compatible storage
- Signed URLs for secure access

## 📋 Tech Stack

### Frontend
- **Next.js 14** (React framework with SSR)
- **Tailwind CSS** (utility-first styling)
- **next-i18next** (internationalization)
- **React Google reCAPTCHA**

### Backend
- **Next.js API Routes** (serverless functions)
- **Node.js + Express middleware**
- **PostgreSQL** (relational database)
- **AWS S3** (media storage)

### Security
- **bcryptjs** (password hashing)
- **jsonwebtoken** (JWT authentication)
- **Helmet.js** (security headers)
- **validator** (input validation)
- **crypto** (hashing & encryption)

### DevOps
- **Docker & Docker Compose**
- **NGINX** (reverse proxy)
- **PostgreSQL 15**

## 🗄️ Database Schema

### Tables
1. **reports** - Citizen submissions
2. **admins** - Admin users
3. **rate_limits** - IP-based rate limiting
4. **audit_logs** - Admin action tracking

See `database/schema.sql` for complete schema with indexes.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- AWS S3 account (or S3-compatible storage)
- Google reCAPTCHA keys

### 1. Clone & Install

```bash
cd shadhin-vote-monitor
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shadhin_vote_monitor

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=your-secret-key-here

# AWS S3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=your-bucket

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# App URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Create database
createdb shadhin_vote_monitor

# Run schema
psql -d shadhin_vote_monitor -f database/schema.sql
```

### 4. Create Admin User

```bash
node scripts/create-admin.js
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🐳 Docker Deployment

### Production Deployment with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:
- **App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **NGINX**: http://localhost:80 (redirects to HTTPS)

### SSL Certificate Setup

For production, use Let's Encrypt:

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
```

## 📁 Project Structure

```
shadhin-vote-monitor/
├── components/          # React components
│   ├── Header.js
│   ├── Footer.js
│   └── Layout.js
├── data/               # Static data (districts, constituencies)
│   └── bangladesh-data.js
├── database/           # Database schema
│   └── schema.sql
├── lib/                # Utility libraries
│   ├── auth.js         # Authentication
│   ├── db.js           # Database connection
│   ├── rateLimiter.js  # Rate limiting
│   ├── security.js     # Security utilities
│   └── storage.js      # S3 media handling
├── nginx/              # NGINX configuration
│   └── nginx.conf
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   ├── admin/
│   │   └── reports/
│   ├── admin/          # Admin dashboard
│   ├── index.js        # Homepage
│   ├── report.js       # Report submission
│   └── incidents.js    # Public feed
├── public/             # Static assets
│   └── locales/        # Translations (bn, en)
├── styles/             # Global styles
│   └── globals.css
├── .env.example        # Environment template
├── docker-compose.yml  # Docker orchestration
├── Dockerfile          # Production container
├── next.config.js      # Next.js config
├── package.json        # Dependencies
└── README.md           # This file
```

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET
- [ ] Configure reCAPTCHA keys
- [ ] Set up SSL certificates
- [ ] Configure AWS S3 bucket policies
- [ ] Enable database backups
- [ ] Set up monitoring & logging
- [ ] Review NGINX rate limits
- [ ] Test rate limiting
- [ ] Verify HTTPS enforcement
- [ ] Check CORS configuration
- [ ] Review admin access controls

## 🛡️ Anti-Abuse Measures

1. **Rate Limiting**: 3 uploads per IP per hour
2. **reCAPTCHA**: Human verification
3. **Duplicate Detection**: SHA-256 file hashing
4. **File Validation**: Type, size, content checks
5. **Input Sanitization**: XSS prevention
6. **IP Hashing**: Privacy-preserving tracking
7. **Admin Moderation**: All reports reviewed before publication

## 📊 Monitoring & Logging

### Application Logs
```bash
# Docker logs
docker-compose logs -f app

# NGINX logs
docker-compose logs -f nginx
```

### Database Monitoring
```sql
-- Check report counts
SELECT status, COUNT(*) FROM reports GROUP BY status;

-- Recent submissions
SELECT * FROM reports ORDER BY created_at DESC LIMIT 10;

-- Rate limit activity
SELECT ip_hash, request_count FROM rate_limits WHERE window_start > NOW() - INTERVAL '1 hour';
```

### Audit Logs
```sql
-- Admin actions
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;
```

## 🔧 Maintenance

### Database Backup
```bash
# Backup
pg_dump shadhin_vote_monitor > backup_$(date +%Y%m%d).sql

# Restore
psql shadhin_vote_monitor < backup_20260211.sql
```

### Clean Old Rate Limits
```sql
-- Run periodically (or set up cron job)
DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '2 hours';
```

### Media Storage Cleanup
```bash
# List orphaned files (files in S3 not in database)
node scripts/cleanup-orphaned-media.js
```

## 🌐 Localization

Add new languages:

1. Create translation file: `public/locales/{lang}/common.json`
2. Update `next-i18next.config.js`
3. Add language option in Header component

## 📱 Mobile Responsiveness

The platform is fully responsive and mobile-first:
- Touch-friendly UI
- Optimized forms for mobile
- Responsive image/video display
- Mobile-optimized navigation

## ⚡ Performance

- **SSR**: Server-side rendering for fast initial load
- **Image Optimization**: Sharp for compression
- **Caching**: NGINX static file caching
- **Database Indexing**: Optimized queries
- **CDN Ready**: Static assets can be served from CDN

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
psql -h localhost -U your_user -d shadhin_vote_monitor
```

### File Upload Failures
- Check S3 credentials in `.env`
- Verify bucket permissions
- Check file size limits (20MB max)

### reCAPTCHA Not Working
- Verify site key in `.env`
- Check domain whitelist in Google reCAPTCHA console

## 📄 License

This project is for civic monitoring purposes. Use responsibly.

## 🤝 Contributing

This is a mission-critical election monitoring platform. All contributions must:
1. Pass security review
2. Include tests
3. Follow existing code style
4. Not introduce vulnerabilities

## 📞 Support

For urgent issues during the 48-hour monitoring period:
- Check logs: `docker-compose logs -f`
- Database status: `docker-compose ps`
- Restart services: `docker-compose restart`

## ⚠️ Important Notes

1. **48-Hour Operation**: This platform is designed for short-term, high-traffic operation
2. **Moderation Required**: All reports must be reviewed before publication
3. **Privacy**: IP addresses are hashed, never stored in plain text
4. **Backup**: Set up automated database backups before deployment
5. **Monitoring**: Monitor server resources during high traffic periods

---

**Built for transparent democracy in Bangladesh 🇧🇩**
