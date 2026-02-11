-- Shadhin Vote Monitor Database Schema
-- PostgreSQL Database for Bangladesh Election Monitoring Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district VARCHAR(100) NOT NULL,
    constituency VARCHAR(100) NOT NULL,
    voting_center_number VARCHAR(50) NOT NULL,
    description TEXT CHECK (char_length(description) <= 300),
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image/jpeg', 'image/png', 'video/mp4')),
    media_thumbnail_url TEXT,
    file_size_bytes INTEGER NOT NULL,
    file_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash for duplicate detection
    status VARCHAR(20) NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'verified', 'rejected')),
    ip_hash VARCHAR(64) NOT NULL, -- SHA-256 hashed IP
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES admins(id),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Admins Table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'moderator' CHECK (role IN ('admin', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Rate Limiting Table (IP-based tracking)
CREATE TABLE rate_limits (
    id SERIAL PRIMARY KEY,
    ip_hash VARCHAR(64) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table (for admin actions)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admins(id),
    action VARCHAR(50) NOT NULL,
    report_id UUID REFERENCES reports(id),
    details JSONB,
    ip_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_reports_district ON reports(district);
CREATE INDEX idx_reports_constituency ON reports(constituency);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_file_hash ON reports(file_hash);
CREATE INDEX idx_reports_ip_hash ON reports(ip_hash);
CREATE INDEX idx_rate_limits_ip_hash ON rate_limits(ip_hash);
CREATE INDEX idx_rate_limits_window_start ON rate_limits(window_start);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_reports_district_constituency ON reports(district, constituency);
CREATE INDEX idx_reports_status_created_at ON reports(status, created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION clean_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits 
    WHERE window_start < CURRENT_TIMESTAMP - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql;

-- Insert default admin (password: ChangeMe123! - MUST be changed after first login)
-- Password hash generated with bcrypt, rounds=10
INSERT INTO admins (username, password_hash, role) 
VALUES ('admin', '$2a$10$YourBcryptHashHere', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Grant appropriate permissions (adjust based on your database user)
-- GRANT SELECT, INSERT, UPDATE ON reports TO your_app_user;
-- GRANT SELECT ON admins TO your_app_user;
-- GRANT SELECT, INSERT, DELETE ON rate_limits TO your_app_user;
-- GRANT SELECT, INSERT ON audit_logs TO your_app_user;
