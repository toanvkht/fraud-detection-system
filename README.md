# Fraud Detection and Reporting System (AntiPhish)

A comprehensive web application for detecting and reporting phishing attempts and online fraud. Built with Node.js, Express, PostgreSQL, and vanilla JavaScript.

## Features

### Frontend
- **Home Page**: Landing page with fraud detection introduction and quick security check tool
- **Education Page**: Comprehensive phishing awareness content with interactive quiz
- **Quick Analysis**: Guest users can perform basic heuristic analysis on suspicious messages
- **Admin Dashboard**: Comprehensive admin interface for managing reports, URLs, and viewing statistics
- **Responsive Design**: Mobile-friendly interface with modern styling

### Backend
- **User Authentication**: JWT-based auth system with bcrypt password hashing
- **Message Analysis**: AI-powered phishing detection (heuristic-based, ready for ML integration)
- **Analysis History**: Track and retrieve past analyses
- **Admin Panel**: Manage known phishing URLs database, user reports, and submissions
- **RESTful API**: Clean API endpoints for all operations

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Knex.js migrations
- **Authentication**: JWT, bcrypt
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Validation**: express-validator

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fraud-detection-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in:
   - `DB_PASSWORD` - Your PostgreSQL password
   - `JWT_SECRET` - A secure random string for JWT signing

4. **Create database**
   ```bash
   createdb antiphish_dev
   # Or using psql:
   # psql -U postgres -c "CREATE DATABASE antiphish_dev;"
   ```

5. **Run migrations**
   ```bash
   npx knex migrate:latest --knexfile ./knexfile.js
   ```

6. **Seed database (optional)**
   ```bash
   npx knex seed:run --knexfile ./knexfile.js
   ```

7. **Start the server**
   ```bash
   npm run dev
   ```

8. **Access the application**
   - Home: http://localhost:3000/
   - Education: http://localhost:3000/education.html
   - Admin Dashboard: http://localhost:3000/admin.html (requires login)
   - API Health: http://localhost:3000/api

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
  ```json
  { "email": "user@example.com", "password": "securepass", "name": "John Doe" }
  ```
- `POST /api/auth/login` - Login user
  ```json
  { "email": "user@example.com", "password": "securepass" }
  ```

### Messages & Analysis
- `POST /api/messages` - Submit message for analysis (requires auth)
  ```json
  { "content": "message content", "source": "email", "sender": "sender@example.com" }
  ```
- `GET /api/analyses` - Get user's analysis history (requires auth)

### Admin (requires auth)
- `GET /api/admin/phishing-urls` - List known phishing URLs
- `POST /api/admin/phishing-urls` - Add phishing URL
- `DELETE /api/admin/phishing-urls/:id` - Remove phishing URL
- `GET /api/admin/reports` - Get all user reports (optional status filter)
- `GET /api/admin/reports/:id` - Get specific report details
- `PATCH /api/admin/reports/:id` - Update report status
- `GET /api/admin/submissions` - Get all message submissions (optional source filter)
- `GET /api/admin/submissions/:id` - Get specific submission details
- `GET /api/admin/statistics` - Get system statistics

For detailed admin dashboard documentation, see [ADMIN_DASHBOARD.md](ADMIN_DASHBOARD.md)

## Project Structure

```
fraud-detection-system/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app configuration
│   │   ├── server.js              # Server entry point
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/            # Auth middleware
│   │   ├── routes/                # API routes
│   │   └── services/              # Business logic
│   └── seeds/                     # Database seeds
├── migrations/                     # Database migrations
├── public/                         # Frontend files
│   ├── index.html                 # Home page
│   ├── education.html             # Education page
│   ├── css/                       # Stylesheets
│   └── js/                        # Frontend JavaScript
├── knexfile.js                    # Knex configuration
└── package.json                   # Dependencies
```

## Features in Detail

### Phishing Detection
The system analyzes messages for:
- Suspicious URLs (shortened links, IP addresses, non-HTTPS)
- Urgency keywords and social engineering tactics
- Requests for sensitive information
- Grammar and spelling issues
- Known phishing URL database matching

### Education Page
Comprehensive learning resources including:
- Types of phishing attacks (Email, SMS, Voice, Spear, Whaling, Clone)
- Red flags to watch for
- Real-world examples with analysis
- Security best practices
- Interactive 5-question quiz

### Quick Check Tool
- Available to all users (no login required)
- Guest users: Basic heuristic analysis
- Authenticated users: Full AI-powered analysis with detailed reports
- Risk scoring (0-100 scale)
- Actionable recommendations

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for auto-restart on file changes.

### Database Operations
```bash
# Run new migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Run seeds
npm run seed
```

## Known Limitations & Future Improvements

### Current Limitations
- Admin endpoints do not enforce admin-only access (needs role checks)
- Scam detector is heuristic-only (ready for ML/LLM integration)
- No rate limiting on API endpoints
- Guest users get limited analysis features

### Planned Enhancements
- Integrate ML/LLM microservice for advanced detection
- Add role-based access control (RBAC)
- Implement background job queue (BullMQ + Redis) for heavy traffic
- Add real-time notifications
- Expand to browser extension
- Add reporting and statistics dashboard
- Implement user reputation system
- Multi-language support

## Security Considerations

- Passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens for stateless authentication
- Environment variables for sensitive data
- Input validation using express-validator
- CORS enabled for cross-origin requests
- SQL injection protection via Knex query builder

## Contributing

This is a COMP1682 academic project. For contributions or issues, please contact the project team.

## License

This project is created for educational purposes as part of COMP1682 coursework.

## Project Team

Built for COMP1682 - Web Application Development

---

**Note**: This system is designed for educational purposes and demonstration. For production use, additional security hardening, testing, and optimization would be required.