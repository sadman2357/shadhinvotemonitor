const crypto = require('crypto');
const validator = require('validator');

/**
 * Hash IP address using SHA-256
 * Never store raw IP addresses for privacy
 */
const hashIP = (ip) => {
    const salt = process.env.IP_HASH_SALT || 'default-salt-change-in-production';
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
};

/**
 * Hash file content using SHA-256 for duplicate detection
 */
const hashFile = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;

    // Remove any HTML tags
    let sanitized = validator.stripLow(input);
    sanitized = validator.escape(sanitized);

    return sanitized.trim();
};

/**
 * Validate file type
 */
const validateFileType = (mimetype, allowedTypes) => {
    return allowedTypes.includes(mimetype);
};

/**
 * Validate file size
 */
const validateFileSize = (size, maxSize) => {
    return size <= maxSize;
};

/**
 * Validate district name
 */
const validateDistrict = (district, validDistricts) => {
    return validDistricts.includes(district);
};

/**
 * Validate constituency
 */
const validateConstituency = (constituency, district, bangladeshData) => {
    const validConstituencies = bangladeshData[district] || [];
    return validConstituencies.includes(constituency);
};

/**
 * Validate voting center number format
 */
const validateVotingCenter = (centerNumber) => {
    // Allow alphanumeric and hyphens, 1-20 characters
    const pattern = /^[A-Za-z0-9\-]{1,20}$/;
    return pattern.test(centerNumber);
};

/**
 * Validate GPS coordinates
 */
const validateGPS = (lat, lon) => {
    // Bangladesh approximate bounds
    // Latitude: 20.5° to 26.6° N
    // Longitude: 88.0° to 92.7° E
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) return false;

    return (
        latNum >= 20.5 && latNum <= 26.6 &&
        lonNum >= 88.0 && lonNum <= 92.7
    );
};

/**
 * Validate description length and content
 */
const validateDescription = (description) => {
    if (!description) return true; // Optional field

    if (typeof description !== 'string') return false;
    if (description.length > 300) return false;

    // Check for script injection attempts
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, // onclick=, onerror=, etc.
        /<iframe/i,
        /<object/i,
        /<embed/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(description));
};

/**
 * Generate secure random token
 */
const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Constant-time string comparison to prevent timing attacks
 */
const secureCompare = (a, b) => {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }

    if (a.length !== b.length) {
        return false;
    }

    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

/**
 * Extract real IP from request (considering proxies)
 */
const getClientIP = (req) => {
    // Check various headers in order of preference
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // Take the first IP if multiple are present
        return forwarded.split(',')[0].trim();
    }

    return (
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket?.remoteAddress ||
        'unknown'
    );
};

module.exports = {
    hashIP,
    hashFile,
    sanitizeInput,
    validateFileType,
    validateFileSize,
    validateDistrict,
    validateConstituency,
    validateVotingCenter,
    validateGPS,
    validateDescription,
    generateToken,
    secureCompare,
    getClientIP
};
