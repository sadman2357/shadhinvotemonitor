# Project Structure - Shadhin Vote Monitor

```
shadhin-vote-monitor/
│
├── 📄 Configuration Files
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Git ignore rules
│   ├── package.json                 # NPM dependencies
│   ├── next.config.js               # Next.js configuration
│   ├── next-i18next.config.js       # Internationalization config
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── Dockerfile                   # Production Docker image
│   └── docker-compose.yml           # Multi-container orchestration
│
├── 📚 Documentation
│   ├── README.md                    # Main documentation & quick start
│   ├── PROJECT_SUMMARY.md           # Complete project overview
│   ├── DEPLOYMENT.md                # Production deployment guide
│   ├── SECURITY.md                  # Security audit & measures
│   └── API.md                       # API documentation
│
├── 🎨 Frontend Components
│   └── components/
│       ├── Header.js                # Navigation header with language toggle
│       ├── Footer.js                # Footer with disclaimer
│       └── Layout.js                # Page layout wrapper
│
├── 📄 Pages (Next.js Routes)
│   └── pages/
│       ├── _app.js                  # App wrapper with i18n
│       ├── _document.js             # HTML document structure
│       ├── index.js                 # Homepage (Hero + Features)
│       ├── report.js                # Report submission form
│       ├── incidents.js             # Public incident feed
│       │
│       ├── admin/
│       │   └── index.js             # Admin dashboard (protected)
│       │
│       └── api/                     # Backend API Routes
│           ├── reports/
│           │   ├── submit.js        # POST - Submit new report
│           │   └── list.js          # GET - Fetch public reports
│           │
│           └── admin/
│               ├── login.js         # POST - Admin authentication
│               └── reports.js       # GET/PATCH - Manage reports
│
├── 🔧 Backend Libraries
│   └── lib/
│       ├── db.js                    # PostgreSQL connection pool
│       ├── auth.js                  # JWT authentication & bcrypt
│       ├── security.js              # Input validation & sanitization
│       ├── rateLimiter.js           # IP-based rate limiting
│       └── storage.js               # S3 upload & image processing
│
├── 🗄️ Database
│   └── database/
│       └── schema.sql               # Complete PostgreSQL schema
│                                    # - reports table
│                                    # - admins table
│                                    # - rate_limits table
│                                    # - audit_logs table
│                                    # - Indexes & triggers
│
├── 📊 Data
│   └── data/
│       └── bangladesh-data.js       # 64 districts + 300+ constituencies
│
├── 🌐 NGINX Configuration
│   └── nginx/
│       ├── nginx.conf               # Reverse proxy config
│       │                            # - SSL/HTTPS
│       │                            # - Rate limiting
│       │                            # - Security headers
│       │                            # - DDoS mitigation
│       └── ssl/                     # SSL certificates (user-provided)
│
├── 🎨 Styles
│   └── styles/
│       └── globals.css              # Global CSS + Tailwind
│                                    # - Bangladesh civic theme
│                                    # - Custom animations
│                                    # - Utility classes
│
├── 🌍 Translations
│   └── public/
│       └── locales/
│           ├── bn/                  # Bangla (বাংলা)
│           │   └── common.json      # All UI translations
│           │
│           └── en/                  # English
│               └── common.json      # All UI translations
│
└── 🛠️ Utility Scripts
    └── scripts/
        └── create-admin.js          # Create admin users
                                     # (Additional scripts can be added)

```

## File Count Summary

| Category | Count | Description |
|----------|-------|-------------|
| **Pages** | 7 | React pages (routes) |
| **API Routes** | 4 | Backend endpoints |
| **Components** | 3 | Reusable UI components |
| **Libraries** | 5 | Backend utilities |
| **Config Files** | 9 | Configuration |
| **Documentation** | 5 | Guides & docs |
| **Database** | 1 | Schema file |
| **Data** | 1 | Static data |
| **Styles** | 1 | Global CSS |
| **Translations** | 2 | i18n files |
| **Scripts** | 1 | Utility scripts |
| **NGINX** | 1 | Reverse proxy config |
| **Docker** | 2 | Containerization |
| **Total** | **42** | Core files |

## Key Directories

### `/pages` - Application Routes
All user-facing pages and API endpoints. Next.js automatically creates routes based on file structure.

### `/components` - Reusable UI
Shared React components used across multiple pages.

### `/lib` - Backend Logic
Core business logic, database operations, authentication, and security utilities.

### `/database` - Schema
Complete database structure with tables, indexes, and triggers.

### `/nginx` - Reverse Proxy
Production-ready NGINX configuration with security hardening.

### `/public/locales` - Internationalization
Complete translations for Bangla and English.

## Technology Stack by Directory

```
Frontend (Client-Side)
├── /pages/*.js          → Next.js + React
├── /components/*.js     → React components
├── /styles/*.css        → Tailwind CSS
└── /public/locales/*.json → i18next

Backend (Server-Side)
├── /pages/api/*.js      → Next.js API routes
├── /lib/*.js            → Node.js utilities
└── /database/*.sql      → PostgreSQL

Infrastructure
├── /nginx/*.conf        → NGINX
├── Dockerfile           → Docker
└── docker-compose.yml   → Docker Compose
```

## Development Workflow

```
1. Edit code in /pages, /components, or /lib
2. Styles in /styles/globals.css
3. Translations in /public/locales
4. Database changes in /database/schema.sql
5. Test locally: npm run dev
6. Deploy: docker-compose up -d
```

## Production Files

```
Required for deployment:
├── .env (from .env.example)
├── All source files
├── database/schema.sql
├── nginx/nginx.conf
├── nginx/ssl/cert.pem (SSL certificate)
├── nginx/ssl/key.pem (SSL private key)
└── Docker files
```

## File Sizes (Approximate)

| File Type | Total Size |
|-----------|------------|
| JavaScript | ~150 KB |
| CSS | ~20 KB |
| JSON | ~30 KB |
| SQL | ~10 KB |
| Config | ~15 KB |
| Docs | ~50 KB |
| **Total** | **~275 KB** |

*Note: Excludes node_modules (~200 MB) and Docker images*

## Dependencies

### Production Dependencies (package.json)
- next (14.1.0)
- react (18.2.0)
- pg (8.11.3) - PostgreSQL
- bcryptjs (2.4.3) - Password hashing
- jsonwebtoken (9.0.2) - JWT auth
- aws-sdk (2.1543.0) - S3 storage
- sharp (0.33.2) - Image processing
- validator (13.11.0) - Input validation
- next-i18next (15.2.0) - i18n
- react-google-recaptcha (3.1.0) - CAPTCHA

### Dev Dependencies
- typescript (5.3.3)
- tailwindcss (3.4.1)
- eslint (8.56.0)

## Environment Variables Required

```
Database (5 vars)
├── DATABASE_URL
├── DB_HOST
├── DB_PORT
├── DB_NAME
└── DB_PASSWORD

AWS S3 (4 vars)
├── AWS_REGION
├── AWS_ACCESS_KEY_ID
├── AWS_SECRET_ACCESS_KEY
└── S3_BUCKET_NAME

Security (2 vars)
├── JWT_SECRET
└── IP_HASH_SALT

reCAPTCHA (2 vars)
├── NEXT_PUBLIC_RECAPTCHA_SITE_KEY
└── RECAPTCHA_SECRET_KEY

App Config (3 vars)
├── NODE_ENV
├── NEXT_PUBLIC_API_URL
└── PORT

Total: 16 environment variables
```

## Build Output

```
Production build creates:
├── .next/                # Next.js build output
│   ├── static/          # Static assets
│   ├── server/          # Server-side code
│   └── standalone/      # Standalone server
└── node_modules/        # Dependencies
```

---

**Total Project Size**: ~275 KB (source code)  
**With Dependencies**: ~200 MB  
**Docker Image**: ~500 MB  
**Database**: Scales with data
