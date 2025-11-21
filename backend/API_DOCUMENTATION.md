# AntiPhish Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents
1. [Authentication](#authentication-endpoints)
2. [Messages](#message-endpoints)
3. [Analyses](#analysis-endpoints)
4. [Admin](#admin-endpoints)
5. [Error Responses](#error-responses)

---

## Authentication Endpoints

### 1. Sign Up
Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Validation Rules:**
- `email`: Valid email format, required
- `password`: Minimum 6 characters, required
- `name`: Optional, max 255 characters

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- 400: Email already registered
- 400: Validation errors

---

### 2. Login
Authenticate existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- 400: Invalid credentials
- 400: Validation errors

---

## Message Endpoints

### 1. Create Message & Analyze
Submit a message for phishing analysis.

**Endpoint:** `POST /api/messages`

**Authentication:** Required

**Request Body:**
```json
{
  "content": "URGENT: Your account has been suspended. Click here to verify: http://suspicious-link.com",
  "source": "email",
  "sender": "noreply@suspicious.com",
  "meta": {
    "subject": "Account Suspended",
    "timestamp": "2025-11-01T10:00:00Z"
  }
}
```

**Fields:**
- `content` (required): Message content to analyze (1-10000 chars)
- `source` (optional): One of: `email`, `sms`, `social_media`, `messaging_app`, `website`, `other`
- `sender` (optional): Sender information (max 500 chars)
- `meta` (optional): Additional metadata as JSON object

**Success Response (200):**
```json
{
  "message": {
    "id": 123,
    "user_id": 1,
    "content": "URGENT: Your account has been...",
    "source": "email",
    "sender": "noreply@suspicious.com",
    "meta": {},
    "created_at": "2025-11-01T10:00:00Z"
  },
  "analysis": {
    "is_scam": true,
    "is_phishing": true,
    "score": 0.85,
    "risk_score": 85,
    "explanation": {
      "keywords": ["urgent", "suspended", "verify", "click here"],
      "patterns": ["Urgency language detected", "Contains 1 URL(s)"],
      "suspicious_urls": [
        {
          "url": "http://suspicious-link.com",
          "reasons": ["Non-secure HTTP connection", "Suspicious top-level domain"]
        }
      ],
      "known_phishing_matches": [],
      "findings": [
        "Found 4 suspicious keyword(s): urgent, suspended, verify, click here",
        "Urgency language detected",
        "Contains 1 URL(s)"
      ],
      "risk_score": 85,
      "recommendation": "HIGH RISK: Do not interact with this message. Delete immediately and report as phishing."
    }
  }
}
```

---

### 2. List User Messages
Get all messages for the authenticated user.

**Endpoint:** `GET /api/messages`

**Authentication:** Required

**Success Response (200):**
```json
{
  "messages": [
    {
      "id": 123,
      "user_id": 1,
      "content": "Message content...",
      "source": "email",
      "sender": "sender@example.com",
      "created_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

### 3. Get Single Message
Get a specific message by ID.

**Endpoint:** `GET /api/messages/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: Message ID (integer)

**Success Response (200):**
```json
{
  "message": {
    "id": 123,
    "user_id": 1,
    "content": "Message content...",
    "source": "email",
    "sender": "sender@example.com",
    "meta": {},
    "created_at": "2025-11-01T10:00:00Z"
  },
  "analysis": {
    "id": 456,
    "message_id": 123,
    "is_scam": true,
    "score": 0.85,
    "explanation": {},
    "created_at": "2025-11-01T10:00:00Z"
  }
}
```

**Error Responses:**
- 404: Message not found

---

## Analysis Endpoints

### 1. List User Analyses
Get all analyses for the authenticated user with pagination.

**Endpoint:** `GET /api/analyses`

**Authentication:** Required

**Query Parameters:**
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 20, min: 1, max: 100)

**Example:** `GET /api/analyses?page=2&limit=10`

**Success Response (200):**
```json
{
  "analyses": [
    {
      "id": 456,
      "message_id": 123,
      "is_scam": true,
      "score": 0.85,
      "explanation": {},
      "created_at": "2025-11-01T10:00:00Z",
      "content": "Message content...",
      "source": "email",
      "sender": "sender@example.com"
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### 2. Get Single Analysis
Get a specific analysis by ID.

**Endpoint:** `GET /api/analyses/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: Analysis ID (integer)

**Success Response (200):**
```json
{
  "analysis": {
    "id": 456,
    "message_id": 123,
    "is_scam": true,
    "score": 0.85,
    "explanation": {
      "keywords": ["urgent", "verify"],
      "patterns": ["Urgency language detected"],
      "suspicious_urls": [],
      "known_phishing_matches": [],
      "findings": [],
      "risk_score": 85,
      "recommendation": "HIGH RISK: Do not interact..."
    },
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-01T10:00:00Z",
    "content": "Message content...",
    "source": "email",
    "sender": "sender@example.com",
    "meta": {}
  }
}
```

**Error Responses:**
- 404: Analysis not found

---

### 3. Get User Statistics
Get analysis statistics for the authenticated user.

**Endpoint:** `GET /api/analyses/statistics`

**Authentication:** Required

**Success Response (200):**
```json
{
  "statistics": {
    "total": 150,
    "scams": 45,
    "safe": 105,
    "scamPercentage": "30.00",
    "averageScore": "0.42",
    "recentAnalyses": 23,
    "topSources": [
      { "source": "email", "count": 80 },
      { "source": "sms", "count": 35 },
      { "source": "social_media", "count": 20 }
    ]
  }
}
```

---

### 4. Delete Analysis
Delete a specific analysis.

**Endpoint:** `DELETE /api/analyses/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: Analysis ID (integer)

**Success Response (200):**
```json
{
  "ok": true,
  "message": "Analysis deleted successfully"
}
```

**Error Responses:**
- 404: Analysis not found

---

## Admin Endpoints

### 1. List Known Phishing URLs
Get all known phishing URLs from the database.

**Endpoint:** `GET /api/admin/phishing-urls`

**Authentication:** Required

**Success Response (200):**
```json
{
  "urls": [
    {
      "id": 1,
      "url": "http://malicious-site.com",
      "domain": "malicious-site.com",
      "source": "PhishTank",
      "severity": "high",
      "notes": "Known credential harvesting site",
      "created_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

### 2. Add Phishing URL
Add a new known phishing URL to the database.

**Endpoint:** `POST /api/admin/phishing-urls`

**Authentication:** Required

**Request Body:**
```json
{
  "url": "http://phishing-site.com",
  "source": "Manual Report",
  "notes": "Reported by multiple users"
}
```

**Validation Rules:**
- `url`: Valid URL with protocol, required
- `source`: Optional, max 255 characters
- `notes`: Optional, max 1000 characters

**Success Response (200):**
```json
{
  "url": {
    "id": 1,
    "url": "http://phishing-site.com",
    "domain": "phishing-site.com",
    "source": "Manual Report",
    "notes": "Reported by multiple users",
    "created_at": "2025-11-01T10:00:00Z"
  }
}
```

**Error Responses:**
- 400: URL already exists
- 400: Validation errors

---

### 3. Delete Phishing URL
Remove a phishing URL from the database.

**Endpoint:** `DELETE /api/admin/phishing-urls/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: Phishing URL ID (integer)

**Success Response (200):**
```json
{
  "ok": true
}
```

**Error Responses:**
- 404: URL not found

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required",
      "value": "invalid-email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token",
  "message": "The provided authentication token is invalid"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Cannot GET /api/invalid-endpoint",
  "path": "/api/invalid-endpoint"
}
```

### 409 Conflict
```json
{
  "error": "Duplicate entry",
  "message": "A record with this information already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "ServerError",
  "message": "Internal server error"
}
```

---

## Rate Limiting
Currently no rate limiting is implemented. This should be added for production use.

## Pagination
Endpoints that support pagination use the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default varies by endpoint)

## Risk Score Interpretation
Risk scores range from 0-100:
- **0-24**: MINIMAL RISK
- **25-49**: LOW RISK
- **50-74**: MEDIUM RISK
- **75-100**: HIGH RISK

## Detection Features

### Keyword Analysis
The system checks for suspicious keywords in both Vietnamese and English, including:
- Financial terms (banking, transfer, account)
- Urgency words (urgent, immediately, now)
- Verification requests (OTP, confirm, verify)
- Prize/lottery terms (winner, prize, congratulations)

### URL Analysis
URLs are analyzed for:
- Shortened URLs (bit.ly, tinyurl, etc.)
- IP addresses instead of domain names
- Non-HTTPS connections
- Suspicious TLDs (.xyz, .top, .click, etc.)
- Typosquatting patterns (multiple hyphens, numbers in domain)

### Pattern Detection
Messages are scanned for:
- Long numeric sequences (phone/account numbers)
- Excessive capitalization
- Multiple URLs
- Excessive punctuation
- Urgency language

### Database Matching
All extracted URLs are checked against the known phishing URLs database for immediate identification.

---

## Development Notes

### Environment Variables Required
```env
DB_HOST=your_database_host
DB_PORT=5432
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
PORT=3000
```

### Testing with cURL

**Sign Up:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Analyze Message:**
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content":"URGENT: Click here http://bit.ly/suspicious","source":"email"}'
```

**Get Analyses:**
```bash
curl http://localhost:3000/api/analyses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Future Enhancements
- Rate limiting per user/IP
- WebSocket support for real-time analysis
- Machine learning model integration
- Advanced URL reputation checking (SafeBrowsing API)
- Email header analysis
- Image-based phishing detection
- Multi-language support expansion
- Batch analysis endpoint
- Export analysis reports (PDF/CSV)
- Webhook notifications for high-risk detections
