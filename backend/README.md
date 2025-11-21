# AntiPhish Backend API

Comprehensive backend API for the fraud detection and reporting system.

## Features Overview

### ✅ Completed Backend Features

1. **Authentication System**
   - JWT-based authentication
   - Secure password hashing with bcrypt
   - User registration and login
   - Token expiration management

2. **Message Analysis**
   - Submit messages/URLs for phishing detection
   - Real-time analysis with heuristic algorithms
   - Vietnamese and English keyword detection
   - URL pattern analysis and reputation checking

3. **Analysis Management**
   - Full CRUD operations for analyses
   - Pagination support
   - User-specific analysis history
   - Statistical insights (total, scam count, average score)
   - Top sources tracking

4. **Admin Panel**
   - Known phishing URLs database management
   - Add/remove phishing URLs
   - URL lookup and matching

5. **Advanced Detection Engine**
   - Keyword analysis (Vietnamese + English)
   - URL pattern detection (shortened URLs, IP addresses, suspicious TLDs)
   - Typosquatting detection
   - Risk scoring (0-100 scale)
   - Known database matching
   - Detailed recommendations

6. **Middleware & Validation**
   - Input validation for all endpoints
   - Global error handling
   - Request logging
   - Authentication middleware
   - Async error wrapping

7. **Database Layer**
   - Knex.js query builder
   - PostgreSQL with SSL support
   - Database service layer for abstraction
   - Connection pooling

## Project Structure

```
backend/
├── src/
│   ├── app.js                      # Express app configuration
│   ├── server.js                   # Server entry point
│   ├── db.js                       # Database connection (Knex)
│   ├── controllers/
│   │   ├── authController.js       # Authentication logic
│   │   ├── messageController.js    # Message handling
│   │   ├── analysisController.js   # Analysis CRUD + statistics
│   │   └── adminController.js      # Admin operations
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication
│   │   ├── validation.js           # Input validation rules
│   │   └── errorHandler.js         # Global error handling
│   ├── routes/
│   │   ├── auth.js                 # Auth routes
│   │   ├── messages.js             # Message routes
│   │   ├── analyses.js             # Analysis routes
│   │   └── admin.js                # Admin routes
│   └── services/
│       ├── scamDetector.js         # Phishing detection engine
│       └── databaseService.js      # Database abstraction layer
├── API_DOCUMENTATION.md            # Complete API documentation
└── README.md                       # This file
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Messages
- `POST /api/messages` - Submit message for analysis
- `GET /api/messages` - List user messages
- `GET /api/messages/:id` - Get single message

### Analyses
- `GET /api/analyses` - List analyses (with pagination)
- `GET /api/analyses/statistics` - Get user statistics
- `GET /api/analyses/:id` - Get single analysis
- `DELETE /api/analyses/:id` - Delete analysis

### Admin
- `GET /api/admin/phishing-urls` - List known phishing URLs
- `POST /api/admin/phishing-urls` - Add phishing URL
- `DELETE /api/admin/phishing-urls/:id` - Remove phishing URL

## Detection Features

### 1. Keyword Analysis
Detects suspicious keywords in multiple languages:

**Vietnamese:**
- Financial: chuyển khoản, vay tiền, ngân hàng, số tài khoản
- Security: khóa tài khoản, otp, mã xác nhận
- Urgency: gấp, khẩn, nhanh
- Scam indicators: lừa đảo, trúng thưởng

**English:**
- Urgency: urgent, immediately, act now, limited time
- Verification: verify, confirm, suspended
- Sensitive data: password, credit card, social security, bank account
- Lottery/prizes: winner, prize, congratulations

### 2. URL Analysis
- **Shortened URLs**: bit.ly, tinyurl, goo.gl, t.co
- **IP Addresses**: Direct IP instead of domain names
- **Non-HTTPS**: Insecure HTTP connections
- **Suspicious TLDs**: .xyz, .top, .work, .click, .link
- **Typosquatting**: Multiple hyphens, numbers in domains

### 3. Pattern Detection
- Long numeric sequences (account/phone numbers)
- Excessive capitalization
- Multiple URLs in single message
- Excessive punctuation (!!!, ???)
- Urgency language patterns

### 4. Database Matching
All extracted URLs are checked against the known phishing URLs database for immediate high-risk identification.

## Risk Scoring

Messages receive a risk score from 0-100:

- **0-24**: MINIMAL RISK
- **25-49**: LOW RISK
- **50-74**: MEDIUM RISK
- **75-100**: HIGH RISK

## Installation & Setup

### Prerequisites
- Node.js v14+
- PostgreSQL v12+
- npm or yarn

### Environment Variables
Create a `.env` file:
```env
# Database
DB_HOST=your_database_host
DB_PORT=5432
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_SSL=true

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

### Installation Steps
```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

## API Usage Examples

### 1. Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"John Doe"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### 3. Analyze Message
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "URGENT: Click here to verify your account http://bit.ly/suspicious",
    "source": "email"
  }'
```

### 4. Get Statistics
```bash
curl http://localhost:3000/api/analyses/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Features

1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Minimum 6 characters password requirement

2. **JWT Authentication**
   - Stateless authentication
   - Configurable expiration
   - Secure token signing

3. **Input Validation**
   - express-validator for all inputs
   - Sanitization and normalization
   - Detailed validation error messages

4. **Error Handling**
   - Global error handler
   - No sensitive data leakage
   - Proper HTTP status codes

5. **Database Security**
   - SQL injection protection via Knex query builder
   - SSL/TLS database connections
   - Connection pooling

## Performance Optimizations

- Database connection pooling (min: 2, max: 10)
- Pagination for large datasets
- Indexed database columns
- Efficient JOIN queries
- Request logging for monitoring

## Future Enhancements

### Planned Features
1. Rate limiting per user/IP
2. Machine learning model integration
3. WebSocket support for real-time updates
4. Advanced URL reputation checking (Google SafeBrowsing API)
5. Email header analysis
6. Image-based phishing detection
7. Batch analysis endpoint
8. Export reports (PDF/CSV)
9. Webhook notifications
10. Admin dashboard with analytics

### Security Enhancements
1. Role-based access control (RBAC)
2. Two-factor authentication (2FA)
3. API key management
4. Request throttling
5. IP whitelisting/blacklisting

## Testing

### Manual Testing
Use the provided curl examples in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Automated Testing (TODO)
```bash
npm test
```

## Monitoring & Logging

Currently includes:
- Request logging (timestamp, method, path)
- Error logging to console
- Database query logging (development mode)

**TODO:** Integrate with logging services (Winston, Morgan)

## Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Enable SSL/TLS
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Enable CORS for specific origins only
- [ ] Set up reverse proxy (Nginx)
- [ ] Configure firewall rules
- [ ] Set up CI/CD pipeline

## License

This project is created for educational purposes as part of COMP1682 coursework.

## Support

For issues and questions, please refer to:
- [API Documentation](./API_DOCUMENTATION.md)
- Project repository issues
- Course instructor

---

**Built with ❤️ for COMP1682 - Web Application Development**
