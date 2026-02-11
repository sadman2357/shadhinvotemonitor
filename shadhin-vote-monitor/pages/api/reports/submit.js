const multer = require('multer');
const { query } = require('../../../lib/db');
const { processMedia } = require('../../../lib/storage');
const {
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
    getClientIP
} = require('../../../lib/security');
const RateLimiter = require('../../../lib/rateLimiter');
const { bangladeshData, getDistricts } = require('../../../data/bangladesh-data');

// Configure multer for file upload (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520'), // 20MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'video/mp4'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and MP4 are allowed.'));
        }
    }
}).single('media');

// Rate limiter instance
const rateLimiter = new RateLimiter({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '3'),
    message: 'You have submitted too many reports. Please try again later.'
});

/**
 * Verify reCAPTCHA token
 */
const verifyRecaptcha = async (token) => {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${secretKey}&response=${token}`
        });

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
    }
};

/**
 * Check for duplicate file
 */
const checkDuplicate = async (fileHash) => {
    const result = await query(
        'SELECT id FROM reports WHERE file_hash = $1 LIMIT 1',
        [fileHash]
    );

    return result.rows.length > 0;
};

export const config = {
    api: {
        bodyParser: false, // Disable default body parser for file upload
    },
};

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get client IP
        const clientIP = getClientIP(req);

        // Check rate limit
        const rateLimitResult = await rateLimiter.checkRateLimit(clientIP);

        if (!rateLimitResult.allowed) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: rateLimitResult.message,
                resetTime: rateLimitResult.resetTime
            });
        }

        // Parse multipart form data
        await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        // Validate required fields
        const {
            district,
            constituency,
            votingCenterNumber,
            description,
            gpsLatitude,
            gpsLongitude,
            recaptchaToken
        } = req.body;

        if (!district || !constituency || !votingCenterNumber || !req.file) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'District, constituency, voting center number, and media file are required.'
            });
        }

        // Verify reCAPTCHA
        if (!recaptchaToken) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'reCAPTCHA verification is required.'
            });
        }

        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'reCAPTCHA verification failed.'
            });
        }

        // Validate district
        const validDistricts = getDistricts();
        if (!validateDistrict(district, validDistricts)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid district selected.'
            });
        }

        // Validate constituency
        if (!validateConstituency(constituency, district, bangladeshData)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid constituency for the selected district.'
            });
        }

        // Validate voting center number
        if (!validateVotingCenter(votingCenterNumber)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid voting center number format.'
            });
        }

        // Validate GPS coordinates if provided
        if (gpsLatitude && gpsLongitude) {
            if (!validateGPS(gpsLatitude, gpsLongitude)) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Invalid GPS coordinates.'
                });
            }
        }

        // Validate description if provided
        if (description && !validateDescription(description)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid description. Please check length and content.'
            });
        }

        // Validate file
        const file = req.file;
        if (!validateFileSize(file.size, parseInt(process.env.MAX_FILE_SIZE || '20971520'))) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'File size exceeds the maximum limit of 20MB.'
            });
        }

        // Check for duplicate file
        const fileHash = hashFile(file.buffer);
        const isDuplicate = await checkDuplicate(fileHash);

        if (isDuplicate) {
            return res.status(409).json({
                error: 'Duplicate File',
                message: 'This file has already been submitted.'
            });
        }

        // Process and upload media
        const mediaResult = await processMedia(file);

        // Sanitize inputs
        const sanitizedDescription = description ? sanitizeInput(description) : null;
        const sanitizedVotingCenter = sanitizeInput(votingCenterNumber);

        // Hash IP address
        const ipHash = hashIP(clientIP);

        // Insert into database
        const insertResult = await query(
            `INSERT INTO reports (
        district, 
        constituency, 
        voting_center_number, 
        description, 
        media_url, 
        media_type, 
        media_thumbnail_url,
        file_size_bytes,
        file_hash,
        ip_hash,
        gps_latitude,
        gps_longitude,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, created_at`,
            [
                district,
                constituency,
                sanitizedVotingCenter,
                sanitizedDescription,
                mediaResult.url,
                file.mimetype,
                mediaResult.thumbnailUrl,
                mediaResult.size,
                fileHash,
                ipHash,
                gpsLatitude || null,
                gpsLongitude || null,
                'under_review'
            ]
        );

        const report = insertResult.rows[0];

        // Return success response
        return res.status(201).json({
            success: true,
            message: 'Report submitted successfully. It will be reviewed for verification.',
            reportId: report.id,
            createdAt: report.created_at
        });

    } catch (error) {
        console.error('Report submission error:', error);

        // Handle specific errors
        if (error.message.includes('Invalid file type')) {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.message
            });
        }

        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to submit report. Please try again later.'
        });
    }
}
