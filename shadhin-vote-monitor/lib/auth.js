const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('./db');
const { hashIP } = require('./security');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Authenticate admin user
 */
const authenticateAdmin = async (username, password, ip) => {
    try {
        const result = await query(
            'SELECT id, username, password_hash, role, is_active FROM admins WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Invalid credentials' };
        }

        const admin = result.rows[0];

        if (!admin.is_active) {
            return { success: false, message: 'Account is disabled' };
        }

        const isValidPassword = await comparePassword(password, admin.password_hash);

        if (!isValidPassword) {
            // Log failed attempt
            await logAuditEvent(admin.id, 'failed_login', null, { reason: 'invalid_password' }, ip);
            return { success: false, message: 'Invalid credentials' };
        }

        // Update last login
        await query(
            'UPDATE admins SET last_login = NOW() WHERE id = $1',
            [admin.id]
        );

        // Generate token
        const token = generateToken({
            id: admin.id,
            username: admin.username,
            role: admin.role
        });

        // Log successful login
        await logAuditEvent(admin.id, 'login', null, {}, ip);

        return {
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role
            }
        };

    } catch (error) {
        console.error('Authentication error:', error);
        return { success: false, message: 'Authentication failed' };
    }
};

/**
 * Middleware to protect routes
 */
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
        }

        // Verify admin still exists and is active
        const result = await query(
            'SELECT id, username, role, is_active FROM admins WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0 || !result.rows[0].is_active) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid user' });
        }

        // Attach admin info to request
        req.admin = result.rows[0];
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Log audit event
 */
const logAuditEvent = async (adminId, action, reportId, details, ip) => {
    try {
        const ipHash = hashIP(ip);
        await query(
            `INSERT INTO audit_logs (admin_id, action, report_id, details, ip_hash)
       VALUES ($1, $2, $3, $4, $5)`,
            [adminId, action, reportId, JSON.stringify(details), ipHash]
        );
    } catch (error) {
        console.error('Audit log error:', error);
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    authenticateAdmin,
    requireAuth,
    logAuditEvent
};
