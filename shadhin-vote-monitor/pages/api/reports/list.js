const { query } = require('../../../lib/db');
const { sanitizeInput } = require('../../../lib/security');

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            district,
            constituency,
            status = 'verified', // Default to only show verified reports
            page = '1',
            limit = '20',
            sortBy = 'latest'
        } = req.query;

        // Validate and sanitize inputs
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20)); // Max 50 per page
        const offset = (pageNum - 1) * limitNum;

        // Build query
        let queryText = `
      SELECT 
        id,
        district,
        constituency,
        voting_center_number,
        description,
        media_url,
        media_type,
        media_thumbnail_url,
        status,
        created_at
      FROM reports
      WHERE 1=1
    `;

        const queryParams = [];
        let paramCount = 0;

        // Filter by status (only show verified by default for public feed)
        if (status) {
            paramCount++;
            queryText += ` AND status = $${paramCount}`;
            queryParams.push(status);
        }

        // Filter by district
        if (district && district !== 'all') {
            paramCount++;
            queryText += ` AND district = $${paramCount}`;
            queryParams.push(sanitizeInput(district));
        }

        // Filter by constituency
        if (constituency && constituency !== 'all') {
            paramCount++;
            queryText += ` AND constituency = $${paramCount}`;
            queryParams.push(sanitizeInput(constituency));
        }

        // Sort order
        if (sortBy === 'oldest') {
            queryText += ' ORDER BY created_at ASC';
        } else {
            queryText += ' ORDER BY created_at DESC';
        }

        // Pagination
        paramCount++;
        queryText += ` LIMIT $${paramCount}`;
        queryParams.push(limitNum);

        paramCount++;
        queryText += ` OFFSET $${paramCount}`;
        queryParams.push(offset);

        // Execute query
        const result = await query(queryText, queryParams);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) FROM reports WHERE 1=1';
        const countParams = [];
        let countParamNum = 0;

        if (status) {
            countParamNum++;
            countQuery += ` AND status = $${countParamNum}`;
            countParams.push(status);
        }

        if (district && district !== 'all') {
            countParamNum++;
            countQuery += ` AND district = $${countParamNum}`;
            countParams.push(sanitizeInput(district));
        }

        if (constituency && constituency !== 'all') {
            countParamNum++;
            countQuery += ` AND constituency = $${countParamNum}`;
            countParams.push(sanitizeInput(constituency));
        }

        const countResult = await query(countQuery, countParams);
        const totalCount = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalCount / limitNum);

        // Return response
        return res.status(200).json({
            success: true,
            data: result.rows,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPreviousPage: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Fetch reports error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch reports.'
        });
    }
}
