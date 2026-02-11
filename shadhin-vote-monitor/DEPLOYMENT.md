# Deployment Guide - Shadhin Vote Monitor

## Production Deployment on VPS

### Prerequisites
- Ubuntu 20.04+ VPS with at least 2GB RAM
- Domain name pointed to your VPS IP
- Root or sudo access

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (for admin script)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL client tools
sudo apt-get install -y postgresql-client
```

### Step 2: Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/shadhin-vote-monitor
cd /opt/shadhin-vote-monitor

# Upload your code (use git, scp, or rsync)
# Example with git:
git clone <your-repo-url> .

# Or upload via SCP from local machine:
# scp -r shadhin-vote-monitor/ user@your-server:/opt/
```

### Step 3: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Critical Settings:**

```env
# Database (use strong passwords!)
DB_NAME=shadhin_vote_monitor
DB_USER=shadhin_admin
DB_PASSWORD=<generate-strong-password>

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=<your-generated-secret>

# AWS S3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
S3_BUCKET_NAME=shadhin-vote-media

# reCAPTCHA (get from https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<your-site-key>
RECAPTCHA_SECRET_KEY=<your-secret-key>

# Production URL
NEXT_PUBLIC_API_URL=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=3

# Security
IP_HASH_SALT=<generate-random-salt>
```

### Step 4: SSL Certificate Setup

```bash
# Install Certbot
sudo apt-get install certbot

# Stop any service on port 80
sudo systemctl stop nginx 2>/dev/null || true

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Create SSL directory
mkdir -p nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Set permissions
sudo chmod 644 nginx/ssl/cert.pem
sudo chmod 600 nginx/ssl/key.pem
```

### Step 5: AWS S3 Bucket Setup

```bash
# Create S3 bucket (via AWS CLI or Console)
aws s3 mb s3://shadhin-vote-media --region ap-southeast-1

# Set bucket policy (private by default)
# Configure CORS if needed
```

**S3 Bucket Policy (example):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAppAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/shadhin-app"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::shadhin-vote-media/*"
    }
  ]
}
```

### Step 6: Build and Deploy

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 7: Database Initialization

```bash
# Wait for PostgreSQL to be ready
sleep 10

# Initialize database schema
docker-compose exec postgres psql -U shadhin_admin -d shadhin_vote_monitor -f /docker-entrypoint-initdb.d/schema.sql

# Or from host:
# psql -h localhost -U shadhin_admin -d shadhin_vote_monitor -f database/schema.sql
```

### Step 8: Create Admin User

```bash
# Install dependencies for script
npm install

# Run admin creation script
node scripts/create-admin.js
```

### Step 9: Firewall Configuration

```bash
# Install UFW
sudo apt-get install ufw

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 10: Monitoring Setup

```bash
# Create log directory
mkdir -p logs

# Set up log rotation
sudo nano /etc/logrotate.d/shadhin-vote
```

**Log rotation config:**

```
/opt/shadhin-vote-monitor/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
```

### Step 11: Automated Backups

```bash
# Create backup script
nano /opt/shadhin-vote-monitor/scripts/backup.sh
```

**Backup script:**

```bash
#!/bin/bash
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

```bash
# Make executable
chmod +x /opt/shadhin-vote-monitor/scripts/backup.sh

# Add to crontab (run every 6 hours)
crontab -e
# Add: 0 */6 * * * /opt/shadhin-vote-monitor/scripts/backup.sh >> /var/log/shadhin-backup.log 2>&1
```

### Step 12: Health Monitoring

```bash
# Create health check script
nano /opt/shadhin-vote-monitor/scripts/health-check.sh
```

**Health check script:**

```bash
#!/bin/bash

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "ERROR: Services are down!"
    docker-compose up -d
    # Send alert (configure email/SMS)
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: Disk usage is at ${DISK_USAGE}%"
    # Send alert
fi

# Check database connection
if ! docker-compose exec -T postgres pg_isready -U shadhin_admin; then
    echo "ERROR: Database is not responding!"
    # Send alert
fi
```

```bash
# Make executable
chmod +x /opt/shadhin-vote-monitor/scripts/health-check.sh

# Add to crontab (run every 5 minutes)
# */5 * * * * /opt/shadhin-vote-monitor/scripts/health-check.sh >> /var/log/shadhin-health.log 2>&1
```

## Performance Tuning

### PostgreSQL Optimization

Edit `docker-compose.yml` to add PostgreSQL tuning:

```yaml
postgres:
  command: postgres -c shared_buffers=256MB -c max_connections=200
```

### NGINX Tuning

For high traffic, adjust `nginx/nginx.conf`:

```nginx
worker_processes auto;
worker_connections 2048;
```

## Security Hardening

### 1. Disable Root Login

```bash
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

### 2. Install Fail2Ban

```bash
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Enable Automatic Security Updates

```bash
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Failed

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a

# Clean old logs
find /var/log -name "*.log" -mtime +7 -delete
```

## Scaling for High Traffic

### Horizontal Scaling

Use a load balancer with multiple app instances:

```yaml
# docker-compose.yml
services:
  app1:
    # ... same config
  app2:
    # ... same config
  
  nginx:
    # Update upstream to include both
```

### Database Read Replicas

For very high traffic, set up PostgreSQL read replicas.

### CDN Integration

Serve static assets via CDN (CloudFlare, AWS CloudFront).

## Monitoring Dashboard

Consider installing:
- **Grafana** + **Prometheus** for metrics
- **Sentry** for error tracking
- **Uptime Robot** for uptime monitoring

## Pre-Launch Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] All environment variables set correctly
- [ ] Admin user created
- [ ] Database backups configured
- [ ] Firewall rules applied
- [ ] Health monitoring active
- [ ] Rate limiting tested
- [ ] File upload tested (20MB files)
- [ ] reCAPTCHA working
- [ ] Both languages (Bangla/English) working
- [ ] Mobile responsiveness verified
- [ ] Load testing completed
- [ ] Backup restoration tested
- [ ] Monitoring alerts configured

## Emergency Procedures

### Service Down

```bash
docker-compose restart
```

### Database Corruption

```bash
# Restore from latest backup
gunzip -c /opt/backups/shadhin-vote/db_latest.sql.gz | \
  docker-compose exec -T postgres psql -U shadhin_admin shadhin_vote_monitor
```

### DDoS Attack

```bash
# Increase rate limits temporarily
# Edit nginx/nginx.conf
# Restart NGINX
docker-compose restart nginx
```

## Post-Election Cleanup

After the 48-hour monitoring period:

```bash
# Export all data
docker-compose exec -T postgres pg_dump -U shadhin_admin shadhin_vote_monitor > final_export.sql

# Archive media files
aws s3 sync s3://shadhin-vote-media ./media-archive/

# Shutdown services
docker-compose down

# Keep backups for legal/archival purposes
```

---

**Deployment completed! Monitor closely during the 48-hour period.**
