# Admin Dashboard Documentation

## Overview

The Admin Dashboard provides a comprehensive interface for administrators to manage and monitor the AntiPhish fraud detection system. It includes tools for managing phishing URLs, reviewing user reports, viewing message submissions, and accessing system statistics.

## Access

**URL:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

**Authentication:** Requires login with valid user credentials. After logging in, navigate to `/admin.html`.

## Features

### 1. Statistics Cards

The dashboard displays four key metrics at the top:

- **Total Reports:** Number of user reports submitted
- **Known Phishing URLs:** Count of URLs in the phishing database
- **Message Submissions:** Total messages analyzed by users
- **Pending Reviews:** Number of reports waiting for review

### 2. User Reports

View and manage user-submitted reports of suspicious URLs.

**Features:**
- Filter by status (Open, In Review, Resolved, Rejected)
- View detailed report information
- Update report status (mark as resolved)
- See reporter information and timestamps

**Available Actions:**
- **View:** See full details of the report
- **Resolve:** Mark the report as resolved

### 3. Known Phishing URLs

Manage the database of known phishing URLs used for detection.

**Features:**
- Add new phishing URLs with metadata
- View all known phishing URLs
- Delete URLs from the database
- Track severity levels and sources

**Adding a URL:**
1. Click "Add URL" button
2. Fill in the form:
   - **URL** (required): The phishing URL
   - **Source:** Where the URL was discovered
   - **Severity:** Low, Medium, High, or Critical
   - **Notes:** Additional information
3. Click "Add URL" to save

### 4. Message Submissions

View all messages submitted by users for analysis.

**Features:**
- Filter by source (Email, SMS, Social Media, Other)
- View message content and analysis results
- See scam detection scores
- Review analysis explanations

**Information Displayed:**
- User who submitted the message
- Message source and sender
- Content preview
- Analysis score (0-100)
- Scam detection result (Yes/No)
- Submission timestamp

### 5. Statistics

View comprehensive system statistics and metrics.

**Metrics Available:**
- **Detection Rate:** Percentage of messages flagged as scam
- **Active Users:** Users who have submitted messages
- **Average Score:** Mean scam detection score
- **Recent Activity:** Submissions in the last 24 hours

## API Endpoints

All admin endpoints require authentication via JWT token.

### Phishing URLs

```
GET    /api/admin/phishing-urls       - List all phishing URLs
POST   /api/admin/phishing-urls       - Add new phishing URL
DELETE /api/admin/phishing-urls/:id   - Delete phishing URL
```

### Reports

```
GET    /api/admin/reports              - List all reports (optional ?status filter)
GET    /api/admin/reports/:id          - Get specific report details
PATCH  /api/admin/reports/:id          - Update report status
```

### Submissions

```
GET    /api/admin/submissions          - List all submissions (optional ?source filter)
GET    /api/admin/submissions/:id      - Get specific submission details
```

### Statistics

```
GET    /api/admin/statistics           - Get system statistics
```

## Usage Examples

### Adding a Phishing URL

**Request:**
```json
POST /api/admin/phishing-urls
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://fake-bank-login.com/verify",
  "domain": "fake-bank-login.com",
  "source": "user report",
  "severity": "high",
  "notes": "Impersonating major bank, collecting credentials"
}
```

**Response:**
```json
{
  "url": {
    "id": 1,
    "url": "https://fake-bank-login.com/verify",
    "domain": "fake-bank-login.com",
    "source": "user report",
    "severity": "high",
    "notes": "Impersonating major bank, collecting credentials",
    "created_at": "2025-11-21T06:00:00.000Z"
  }
}
```

### Updating Report Status

**Request:**
```json
PATCH /api/admin/reports/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved"
}
```

**Response:**
```json
{
  "report": {
    "id": 1,
    "status": "resolved",
    "reviewed_at": "2025-11-21T06:00:00.000Z",
    "moderator_id": 1
  }
}
```

## Navigation

Use the navigation tabs to switch between different sections:

- **User Reports:** Manage user-submitted reports
- **Known Phishing URLs:** Manage phishing URL database
- **Message Submissions:** View user message analyses
- **Statistics:** View system metrics

## Filters

### Reports Filter
- **All Status:** Show all reports
- **Open:** Only pending reports
- **In Review:** Reports being reviewed
- **Resolved:** Completed reports
- **Rejected:** Dismissed reports

### Submissions Filter
- **All Sources:** Show all submissions
- **Email:** Email messages only
- **SMS:** Text messages only
- **Social Media:** Social media messages
- **Other:** Other sources

## Security Notes

1. **Authentication Required:** All admin endpoints require valid JWT token
2. **Role-Based Access:** Currently, any authenticated user can access admin features. In production, implement proper role-based access control (RBAC)
3. **Audit Logging:** Consider implementing audit logs for admin actions
4. **Input Validation:** All user inputs are validated and sanitized

## Future Enhancements

Planned improvements for the admin dashboard:

1. **Role-Based Access Control:** Restrict admin features to users with admin role
2. **Bulk Operations:** Add/delete multiple URLs at once
3. **Export Functionality:** Export data to CSV/Excel
4. **Advanced Filters:** Date ranges, search functionality
5. **Real-time Updates:** WebSocket integration for live data
6. **Charts & Graphs:** Visual representations of statistics
7. **Email Notifications:** Alert admins of new reports
8. **User Management:** Manage user accounts and permissions
9. **Audit Logs:** Track all admin actions
10. **API Rate Limiting:** Protect endpoints from abuse

## Troubleshooting

### Cannot Access Dashboard
- Ensure you are logged in
- Check that the token is valid and not expired
- Verify the server is running on port 3000

### Data Not Loading
- Check browser console for errors
- Verify database connection
- Ensure migrations have been run
- Check that the JWT token is included in requests

### Permission Errors
- Verify authentication token is present in localStorage
- Check that the token hasn't expired
- Re-login if necessary

## Technical Details

### Frontend Files
- **HTML:** `/public/admin.html`
- **CSS:** `/public/css/admin.css`
- **JavaScript:** `/public/js/admin.js`

### Backend Files
- **Routes:** `/backend/src/routes/admin.js`
- **Controller:** `/backend/src/controllers/adminController.js`
- **Middleware:** `/backend/src/middleware/auth.js`

### Database Tables Used
- `reports` - User-submitted reports
- `suspicious_urls` - URLs under investigation
- `known_phishing_urls` - Confirmed phishing URLs
- `messages` - User-submitted messages
- `analyses` - Message analysis results
- `users` - User accounts

## Support

For issues or questions about the admin dashboard:
1. Check the main README.md for general setup instructions
2. Review the API documentation above
3. Check browser console for client-side errors
4. Check server logs for backend errors
5. Contact the development team for assistance

---

**Note:** This dashboard is designed for educational purposes as part of COMP1682 coursework. For production use, additional security hardening, performance optimization, and feature enhancements would be required.
