# API Documentation - Shadhin Vote Monitor

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

Admin endpoints require JWT authentication via Bearer token.

```http
Authorization: Bearer <your-jwt-token>
```

---

## Public Endpoints

### 1. Submit Report

Submit a new incident report with media.

**Endpoint:** `POST /api/reports/submit`

**Content-Type:** `multipart/form-data`

**Rate Limit:** 3 requests per IP per hour

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| district | string | Yes | District name (from Bangladesh data) |
| constituency | string | Yes | Constituency name |
| votingCenterNumber | string | Yes | Voting center identifier (1-20 chars) |
| description | string | No | Incident description (max 300 chars) |
| gpsLatitude | number | No | GPS latitude (20.5-26.6) |
| gpsLongitude | number | No | GPS longitude (88.0-92.7) |
| media | file | Yes | Photo or video (JPG/PNG/MP4, max 20MB) |
| recaptchaToken | string | Yes | reCAPTCHA response token |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Report submitted successfully. It will be reviewed for verification.",
  "reportId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2026-02-11T07:30:00.000Z"
}
```

**Error Responses:**

```json
// 400 - Validation Error
{
  "error": "Validation Error",
  "message": "District, constituency, voting center number, and media file are required."
}

// 409 - Duplicate File
{
  "error": "Duplicate File",
  "message": "This file has already been submitted."
}

// 429 - Rate Limit Exceeded
{
  "error": "Too Many Requests",
  "message": "You have submitted too many reports. Please try again later.",
  "resetTime": "2026-02-11T08:30:00.000Z"
}
```

**Example (JavaScript):**

```javascript
const formData = new FormData();
formData.append('district', 'Dhaka');
formData.append('constituency', 'Dhaka-1');
formData.append('votingCenterNumber', 'VC-123');
formData.append('description', 'Witnessed irregularity at polling station');
formData.append('media', fileInput.files[0]);
formData.append('recaptchaToken', recaptchaResponse);

const response = await fetch('/api/reports/submit', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

---

### 2. List Reports (Public Feed)

Retrieve verified reports for public display.

**Endpoint:** `GET /api/reports/list`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| district | string | all | Filter by district |
| constituency | string | all | Filter by constituency |
| status | string | verified | Filter by status (verified/under_review/rejected) |
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 50) |
| sortBy | string | latest | Sort order (latest/oldest) |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "district": "Dhaka",
      "constituency": "Dhaka-1",
      "voting_center_number": "VC-123",
      "description": "Witnessed irregularity at polling station",
      "media_url": "https://s3.amazonaws.com/bucket/uploads/2026/02/file.jpg",
      "media_type": "image/jpeg",
      "media_thumbnail_url": "https://s3.amazonaws.com/bucket/uploads/2026/02/thumb_file.jpg",
      "status": "verified",
      "created_at": "2026-02-11T07:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "limit": 20,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Example (JavaScript):**

```javascript
const params = new URLSearchParams({
  district: 'Dhaka',
  constituency: 'Dhaka-1',
  status: 'verified',
  page: '1',
  limit: '20',
  sortBy: 'latest'
});

const response = await fetch(`/api/reports/list?${params}`);
const data = await response.json();
```

---

## Admin Endpoints

### 3. Admin Login

Authenticate admin user and receive JWT token.

**Endpoint:** `POST /api/admin/login`

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "username": "admin",
  "password": "your-secure-password"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin-uuid",
    "username": "admin",
    "role": "admin"
  }
}
```

**Error Response (401):**

```json
{
  "error": "Authentication Failed",
  "message": "Invalid credentials"
}
```

**Example (JavaScript):**

```javascript
const response = await fetch('/api/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'password'
  })
});

const data = await response.json();
localStorage.setItem('adminToken', data.token);
```

---

### 4. Get All Reports (Admin)

Retrieve all reports with full metadata (admin only).

**Endpoint:** `GET /api/admin/reports`

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| district | string | all | Filter by district |
| constituency | string | all | Filter by constituency |
| status | string | all | Filter by status (all/verified/under_review/rejected) |
| search | string | - | Search in district/constituency/voting center |
| page | number | 1 | Page number |
| limit | number | 50 | Items per page (max 100) |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "district": "Dhaka",
      "constituency": "Dhaka-1",
      "voting_center_number": "VC-123",
      "description": "Witnessed irregularity",
      "media_url": "https://s3.amazonaws.com/...",
      "media_type": "image/jpeg",
      "media_thumbnail_url": "https://s3.amazonaws.com/...",
      "file_size_bytes": 1048576,
      "status": "under_review",
      "ip_hash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      "gps_latitude": 23.8103,
      "gps_longitude": 90.4125,
      "created_at": "2026-02-11T07:30:00.000Z",
      "updated_at": "2026-02-11T07:30:00.000Z",
      "reviewed_by": null,
      "reviewed_at": null
    }
  ],
  "stats": {
    "total": 150,
    "under_review": 45,
    "verified": 100,
    "rejected": 5
  },
  "pagination": {
    "currentPage": 1,
    "limit": 50
  }
}
```

**Error Response (401):**

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Example (JavaScript):**

```javascript
const token = localStorage.getItem('adminToken');
const params = new URLSearchParams({
  status: 'under_review',
  page: '1',
  limit: '50'
});

const response = await fetch(`/api/admin/reports?${params}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

---

### 5. Update Report Status (Admin)

Approve, reject, or delete a report.

**Endpoint:** `PATCH /api/admin/reports`

**Authentication:** Required (Bearer token)

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "reportId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "approve"
}
```

**Actions:**
- `approve` - Change status to "verified"
- `reject` - Change status to "rejected"
- `delete` - Permanently delete report

**Success Response (200):**

```json
{
  "success": true,
  "message": "Report approved successfully.",
  "newStatus": "verified"
}
```

**Error Responses:**

```json
// 400 - Validation Error
{
  "error": "Validation Error",
  "message": "Report ID and action are required."
}

// 401 - Unauthorized
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Example (JavaScript):**

```javascript
const token = localStorage.getItem('adminToken');

const response = await fetch('/api/admin/reports', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reportId: '550e8400-e29b-41d4-a716-446655440000',
    action: 'approve'
  })
});

const data = await response.json();
```

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse.

### Public Endpoints
- **Report Submission:** 3 requests per IP per hour
- **List Reports:** 10 requests per second (burst: 20)

### Admin Endpoints
- **All Admin APIs:** 5 requests per second (burst: 10)

### Rate Limit Headers

```http
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 2026-02-11T08:30:00.000Z
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## Data Models

### Report Object

```typescript
interface Report {
  id: string;                    // UUID
  district: string;              // District name
  constituency: string;          // Constituency name
  voting_center_number: string;  // Voting center ID
  description: string | null;    // Optional description (max 300 chars)
  media_url: string;             // S3 URL to media file
  media_type: string;            // MIME type (image/jpeg, image/png, video/mp4)
  media_thumbnail_url: string | null; // Thumbnail URL (images only)
  file_size_bytes: number;       // File size in bytes
  file_hash: string;             // SHA-256 hash (for duplicate detection)
  status: 'under_review' | 'verified' | 'rejected';
  ip_hash: string;               // SHA-256 hashed IP (admin only)
  gps_latitude: number | null;   // Optional GPS latitude
  gps_longitude: number | null;  // Optional GPS longitude
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
  reviewed_by: string | null;    // Admin ID (admin only)
  reviewed_at: string | null;    // Review timestamp (admin only)
}
```

### Admin Object

```typescript
interface Admin {
  id: string;           // UUID
  username: string;     // Admin username
  role: 'admin' | 'moderator';
}
```

---

## Security Considerations

### File Upload Security
- Maximum file size: 20MB
- Allowed types: `image/jpeg`, `image/png`, `video/mp4`
- Files are scanned for type validation
- Files are stored in private S3 bucket
- Access via signed URLs only

### IP Privacy
- IP addresses are hashed using SHA-256 with salt
- Raw IPs are never stored in database
- Used only for rate limiting and abuse prevention

### Authentication
- JWT tokens expire after 24 hours
- Tokens include admin ID, username, and role
- All admin actions are logged in audit_logs table

---

## Testing

### Test Report Submission

```bash
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
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Test Get Reports (Admin)

```bash
curl -X GET "http://localhost:3000/api/admin/reports?status=under_review" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Changelog

### Version 1.0.0 (2026-02-11)
- Initial API release
- Report submission endpoint
- Public feed endpoint
- Admin authentication
- Admin report management

---

## Support

For API issues or questions:
- Check logs: `docker-compose logs -f app`
- Review security documentation: `SECURITY.md`
- Deployment guide: `DEPLOYMENT.md`

---

**API Version:** 1.0.0  
**Last Updated:** 2026-02-11
