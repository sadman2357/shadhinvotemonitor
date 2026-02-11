const { query } = require('./db');
const { hashIP } = require('./security');

/**
 * Rate Limiter Middleware
 * Limits requests per IP address to prevent abuse
 */
class RateLimiter {
    constructor(options = {}) {
        this.windowMs = options.windowMs || 3600000; // 1 hour default
        this.maxRequests = options.maxRequests || 3;
        this.message = options.message || 'Too many requests, please try again later.';
    }

    async checkRateLimit(ip) {
        const ipHash = hashIP(ip);
        const windowStart = new Date(Date.now() - this.windowMs);

        try {
            // Clean old records first
            await query(
                'DELETE FROM rate_limits WHERE window_start < $1',
                [windowStart]
            );

            // Check current rate limit
            const result = await query(
                `SELECT request_count, window_start 
         FROM rate_limits 
         WHERE ip_hash = $1 AND window_start >= $2
         ORDER BY window_start DESC
         LIMIT 1`,
                [ipHash, windowStart]
            );

            if (result.rows.length === 0) {
                // First request in this window
                await query(
                    'INSERT INTO rate_limits (ip_hash, request_count, window_start) VALUES ($1, 1, NOW())',
                    [ipHash]
                );
                return { allowed: true, remaining: this.maxRequests - 1 };
            }

            const record = result.rows[0];

            if (record.request_count >= this.maxRequests) {
                const resetTime = new Date(record.window_start.getTime() + this.windowMs);
                return {
                    allowed: false,
                    remaining: 0,
                    resetTime,
                    message: this.message
                };
            }

            // Increment counter
            await query(
                'UPDATE rate_limits SET request_count = request_count + 1 WHERE ip_hash = $1 AND window_start = $2',
                [ipHash, record.window_start]
            );

            return {
                allowed: true,
                remaining: this.maxRequests - record.request_count - 1
            };

        } catch (error) {
            console.error('Rate limit check error:', error);
            // Fail open in case of database error (but log it)
            return { allowed: true, remaining: 0 };
        }
    }

    middleware() {
        return async (req, res, next) => {
            const ip = req.ip || req.connection.remoteAddress;
            const result = await this.checkRateLimit(ip);

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', this.maxRequests);
            res.setHeader('X-RateLimit-Remaining', result.remaining);

            if (!result.allowed) {
                res.setHeader('X-RateLimit-Reset', result.resetTime.toISOString());
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: result.message,
                    resetTime: result.resetTime
                });
            }

            next();
        };
    }
}

module.exports = RateLimiter;
