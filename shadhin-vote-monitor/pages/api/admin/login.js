const { authenticateAdmin } = require('../../../lib/auth');
const { getClientIP } = require('../../../lib/security');

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username, password } = req.body;

        // Validate inputs
        if (!username || !password) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Username and password are required.'
            });
        }

        // Get client IP
        const clientIP = getClientIP(req);

        // Authenticate
        const result = await authenticateAdmin(username, password, clientIP);

        if (!result.success) {
            return res.status(401).json({
                error: 'Authentication Failed',
                message: result.message
            });
        }

        // Return success with token
        return res.status(200).json({
            success: true,
            token: result.token,
            admin: result.admin
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Login failed. Please try again later.'
        });
    }
}
