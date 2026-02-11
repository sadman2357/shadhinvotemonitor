const { query } = require('../../../lib/db');
const { requireAuth, logAuditEvent } = require('../../../lib/auth');
const { sanitizeInput, getClientIP } = require('../../../lib/security');

async function handler(req, res) {
    // Only allow GET and PATCH requests
    if (!['GET', 'PATCH'].includes(req.method)) {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // GET - Fetch all reports for admin
        if (req.method === 'GET') {
            const {
                district,
                constituency,
                status,
                search,
                page = '1',
                limit = '50'
            } = req.query;

            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
            const offset = (pageNum - 1) * limitNum;

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
          file_size_bytes,
          status,
          ip_hash,
          gps_latitude,
          gps_longitude,
          created_at,
          updated_at,
          reviewed_by,
          reviewed_at
        FROM reports
        WHERE 1=1
      `;

            const queryParams = [];
            let paramCount = 0;

            if (status && status !== 'all') {
                paramCount++;
                queryText += ` AND status = $${paramCount}`;
                queryParams.push(status);
            }

            if (district && district !== 'all') {
                paramCount++;
                queryText += ` AND district = $${paramCount}`;
                queryParams.push(sanitizeInput(district));
            }

            if (constituency && constituency !== 'all') {
                paramCount++;
                queryText += ` AND constituency = $${paramCount}`;
                queryParams.push(sanitizeInput(constituency));
            }

            if (search) {
                paramCount++;
                queryText += ` AND (district ILIKE $${paramCount} OR constituency ILIKE $${paramCount} OR voting_center_number ILIKE $${paramCount})`;
                queryParams.push(`%${sanitizeInput(search)}%`);
            }

            queryText += ' ORDER BY created_at DESC';

            paramCount++;
            queryText += ` LIMIT $${paramCount}`;
            queryParams.push(limitNum);

            paramCount++;
            queryText += ` OFFSET $${paramCount}`;
            queryParams.push(offset);

            const result = await query(queryText, queryParams);

            // Get counts by status
            const statsResult = await query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM reports
        GROUP BY status
      `);

            const stats = {
                total: 0,
                under_review: 0,
                verified: 0,
                rejected: 0
            };

            statsResult.rows.forEach(row => {
                stats[row.status] = parseInt(row.count);
                stats.total += parseInt(row.count);
            });

            return res.status(200).json({
                success: true,
                data: result.rows,
                stats,
                pagination: {
                    currentPage: pageNum,
                    limit: limitNum
                }
            });
        }

        // PATCH - Update report status
        if (req.method === 'PATCH') {
            const { reportId, action } = req.body;

            if (!reportId || !action) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Report ID and action are required.'
                });
            }

            const validActions = ['approve', 'reject', 'delete'];
            if (!validActions.includes(action)) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Invalid action.'
                });
            }

            const clientIP = getClientIP(req);

            if (action === 'delete') {
                // Delete report
                await query('DELETE FROM reports WHERE id = $1', [reportId]);

                // Log action
                await logAuditEvent(
                    req.admin.id,
                    'delete_report',
                    reportId,
                    { action: 'delete' },
                    clientIP
                );

                return res.status(200).json({
                    success: true,
                    message: 'Report deleted successfully.'
                });
            }

            // Update status
            const newStatus = action === 'approve' ? 'verified' : 'rejected';

            await query(
                `UPDATE reports 
         SET status = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
         WHERE id = $3`,
                [newStatus, req.admin.id, reportId]
            );

            // Log action
            await logAuditEvent(
                req.admin.id,
                action === 'approve' ? 'approve_report' : 'reject_report',
                reportId,
                { newStatus },
                clientIP
            );

            return res.status(200).json({
                success: true,
                message: `Report ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
                newStatus
            });
        }

    } catch (error) {
        console.error('Admin reports error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Operation failed.'
        });
    }
}

// Wrap with auth middleware
export default async function protectedHandler(req, res) {
    await requireAuth(req, res, () => handler(req, res));
}
