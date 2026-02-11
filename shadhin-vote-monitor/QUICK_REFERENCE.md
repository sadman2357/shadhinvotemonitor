# Quick Reference Guide - Shadhin Vote Monitor

## 🚀 Common Commands

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Docker Operations

```bash
# Build and start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f nginx

# Restart services
docker-compose restart

# Rebuild images
docker-compose build --no-cache

# Check service status
docker-compose ps

# Execute command in container
docker-compose exec app sh
docker-compose exec postgres psql -U shadhin_admin -d shadhin_vote_monitor
```

### Database Operations

```bash
# Connect to database
psql -h localhost -U shadhin_admin -d shadhin_vote_monitor

# Run schema
psql -h localhost -U shadhin_admin -d shadhin_vote_monitor -f database/schema.sql

# Backup database
pg_dump -h localhost -U shadhin_admin shadhin_vote_monitor > backup.sql

# Restore database
psql -h localhost -U shadhin_admin shadhin_vote_monitor < backup.sql

# Docker database backup
docker-compose exec -T postgres pg_dump -U shadhin_admin shadhin_vote_monitor > backup.sql

# Docker database restore
cat backup.sql | docker-compose exec -T postgres psql -U shadhin_admin shadhin_vote_monitor
```

### Admin Management

```bash
# Create new admin user
node scripts/create-admin.js

# Change admin password (re-run create script with same username)
node scripts/create-admin.js
```

---

## 📊 Useful SQL Queries

### Report Statistics

```sql
-- Count by status
SELECT status, COUNT(*) as count 
FROM reports 
GROUP BY status;

-- Recent submissions
SELECT id, district, constituency, status, created_at 
FROM reports 
ORDER BY created_at DESC 
LIMIT 20;

-- Reports by district
SELECT district, COUNT(*) as count 
FROM reports 
GROUP BY district 
ORDER BY count DESC;

-- Hourly submission rate
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as submissions
FROM reports
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### Rate Limiting

```sql
-- Active rate limits
SELECT ip_hash, request_count, window_start 
FROM rate_limits 
WHERE window_start > NOW() - INTERVAL '1 hour'
ORDER BY request_count DESC;

-- Clean old rate limits
DELETE FROM rate_limits 
WHERE window_start < NOW() - INTERVAL '2 hours';

-- Top uploaders (by IP hash)
SELECT ip_hash, COUNT(*) as uploads 
FROM reports 
GROUP BY ip_hash 
ORDER BY uploads DESC 
LIMIT 10;
```

### Admin Activity

```sql
-- Recent admin actions
SELECT 
  a.username,
  al.action,
  al.created_at
FROM audit_logs al
JOIN admins a ON al.admin_id = a.id
ORDER BY al.created_at DESC
LIMIT 20;

-- Admin login history
SELECT username, last_login 
FROM admins 
ORDER BY last_login DESC;
```

### Data Cleanup

```sql
-- Find reports without media
SELECT id, created_at 
FROM reports 
WHERE media_url IS NULL;

-- Delete rejected reports older than 7 days
DELETE FROM reports 
WHERE status = 'rejected' 
AND created_at < NOW() - INTERVAL '7 days';
```

---

## 🔧 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs

# Check disk space
df -h

# Clean Docker
docker system prune -a

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Test connection
docker-compose exec postgres pg_isready -U shadhin_admin
```

### NGINX Issues

```bash
# Test NGINX config
docker-compose exec nginx nginx -t

# Reload NGINX
docker-compose exec nginx nginx -s reload

# Check NGINX logs
docker-compose logs nginx
```

### Application Errors

```bash
# Check application logs
docker-compose logs app

# Restart application
docker-compose restart app

# Check environment variables
docker-compose exec app env | grep -E 'DB_|AWS_|JWT_'
```

### File Upload Failures

```bash
# Check S3 credentials
# Verify in .env file

# Test S3 connection (AWS CLI)
aws s3 ls s3://your-bucket-name --region ap-southeast-1

# Check file size limits
# Max: 20MB (configured in .env)
```

---

## 🔐 Security Tasks

### Change Admin Password

```bash
# Run admin creation script with existing username
node scripts/create-admin.js
# Enter existing username
# Enter new password
```

### Rotate JWT Secret

```bash
# 1. Generate new secret
openssl rand -hex 32

# 2. Update .env
JWT_SECRET=<new-secret>

# 3. Restart application
docker-compose restart app

# Note: This will invalidate all existing tokens
```

### Block Malicious IP

```bash
# Add to NGINX config
# Edit nginx/nginx.conf
deny <IP_ADDRESS>;

# Reload NGINX
docker-compose exec nginx nginx -s reload
```

### Review Security Logs

```bash
# Failed login attempts
docker-compose exec postgres psql -U shadhin_admin -d shadhin_vote_monitor \
  -c "SELECT * FROM audit_logs WHERE action = 'failed_login' ORDER BY created_at DESC LIMIT 20;"

# Suspicious rate limit hits
docker-compose exec postgres psql -U shadhin_admin -d shadhin_vote_monitor \
  -c "SELECT ip_hash, request_count FROM rate_limits WHERE request_count >= 3;"
```

---

## 📈 Monitoring

### Check System Resources

```bash
# Disk usage
df -h

# Memory usage
free -h

# Docker stats
docker stats

# Database size
docker-compose exec postgres psql -U shadhin_admin -d shadhin_vote_monitor \
  -c "SELECT pg_size_pretty(pg_database_size('shadhin_vote_monitor'));"
```

### Application Health

```bash
# Check if app is responding
curl http://localhost:3000

# Check API health
curl http://localhost:3000/api/reports/list

# Check admin endpoint (requires token)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/admin/reports
```

### Database Performance

```sql
-- Slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;

-- Index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 🔄 Backup & Restore

### Automated Backup Script

```bash
#!/bin/bash
# Save as: scripts/backup.sh

BACKUP_DIR="/opt/backups/shadhin-vote"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U shadhin_admin shadhin_vote_monitor > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Manual Backup

```bash
# Database
docker-compose exec -T postgres pg_dump -U shadhin_admin shadhin_vote_monitor | gzip > backup_$(date +%Y%m%d).sql.gz

# Media files (if stored locally)
tar -czf media_backup_$(date +%Y%m%d).tar.gz uploads/

# Environment
cp .env .env.backup
```

### Restore from Backup

```bash
# Database
gunzip -c backup_20260211.sql.gz | docker-compose exec -T postgres psql -U shadhin_admin shadhin_vote_monitor

# Verify
docker-compose exec postgres psql -U shadhin_admin -d shadhin_vote_monitor -c "SELECT COUNT(*) FROM reports;"
```

---

## 🌐 Domain & SSL

### Setup SSL Certificate

```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy to project
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Set permissions
sudo chmod 644 nginx/ssl/cert.pem
sudo chmod 600 nginx/ssl/key.pem

# Restart NGINX
docker-compose restart nginx
```

### Renew SSL Certificate

```bash
# Renew (run before expiry)
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Restart NGINX
docker-compose restart nginx
```

---

## 📱 Testing

### Test Report Submission

```bash
# With curl
curl -X POST http://localhost:3000/api/reports/submit \
  -F "district=Dhaka" \
  -F "constituency=Dhaka-1" \
  -F "votingCenterNumber=VC-123" \
  -F "description=Test report" \
  -F "media=@test-image.jpg" \
  -F "recaptchaToken=test-token"
```

### Test Admin Login

```bash
# Login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Save token from response
TOKEN="<your-jwt-token>"

# Test admin endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/reports
```

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test homepage
ab -n 1000 -c 10 http://localhost:3000/

# Test API
ab -n 100 -c 5 http://localhost:3000/api/reports/list
```

---

## 🎯 Quick Fixes

### Reset Everything

```bash
# WARNING: This deletes all data!
docker-compose down -v
docker system prune -a
rm -rf node_modules
npm install
docker-compose up -d
```

### Clear Rate Limits

```sql
-- Clear all rate limits
DELETE FROM rate_limits;
```

### Reset Admin Password

```bash
# Run admin creation script
node scripts/create-admin.js
# Use same username, new password
```

### Clear All Reports

```sql
-- WARNING: Deletes all reports!
TRUNCATE reports CASCADE;
```

---

## 📞 Emergency Contacts

```
Technical Lead: [Your contact]
Database Admin: [Your contact]
Security Team: [Your contact]
AWS Support: [Your AWS support]
```

---

## 🔗 Quick Links

- **Documentation**: `/README.md`
- **API Docs**: `/API.md`
- **Security**: `/SECURITY.md`
- **Deployment**: `/DEPLOYMENT.md`
- **Project Summary**: `/PROJECT_SUMMARY.md`

---

**Last Updated**: 2026-02-11  
**Version**: 1.0.0
