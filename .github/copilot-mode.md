# Fraud Detection System - Development Mode

## Project Overview
This is a fraud detection and reporting system built with Node.js, Express, and PostgreSQL. The system provides APIs for detecting and managing fraudulent transactions.

## Tech Stack
- **Backend**: Node.js with Express 5.x
- **Database**: PostgreSQL with Knex.js for migrations and query building
- **Environment**: dotenv for configuration management

## Project Structure
```
fraud-detection-system/
├── backend/
│   ├── src/
│   │   ├── index.js          # Main application entry point
│   │   └── db.js              # Database connection configuration
│   └── seeds/                 # Database seed files
├── migrations/                # Database migration files
├── knexfile.js               # Knex configuration
├── debug-env.js              # Environment debug utility
└── package.json              # Project dependencies
```

## Development Guidelines

### Backend Development
- Use async/await for asynchronous operations
- Implement proper error handling middleware in Express
- Follow RESTful API conventions for endpoints
- Use Knex query builder for database operations
- Validate all incoming request data

### Database Management
- Always create migrations for schema changes using `npm run migrate`
- Use descriptive migration filenames with timestamps
- Never modify existing migrations that have been run in production
- Use seeds for initial data setup
- Follow PostgreSQL naming conventions (snake_case for tables and columns)

### API Design Patterns
- Use HTTP status codes appropriately:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 404: Not Found
  - 500: Server Error
- Structure responses consistently:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Operation successful"
  }
  ```

### Security Best Practices
- Sanitize all user inputs to prevent SQL injection
- Use parameterized queries via Knex
- Implement rate limiting for API endpoints
- Validate and sanitize file uploads
- Use environment variables for sensitive data
- Implement proper authentication and authorization

### Error Handling
- Create custom error classes for different error types
- Use try-catch blocks for async operations
- Log errors with appropriate context
- Return user-friendly error messages
- Never expose sensitive information in error responses

### Testing Considerations
- Write unit tests for business logic
- Create integration tests for API endpoints
- Test database migrations and rollbacks
- Validate error handling scenarios
- Test edge cases and boundary conditions

## Common Commands
```bash
# Start development server
npm run dev

# Start production server
npm start

# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback
```

## Code Organization
- Keep route handlers thin, delegate business logic to service layers
- Use middleware for cross-cutting concerns (logging, authentication, validation)
- Organize code by feature/domain when the project grows
- Use dependency injection for better testability

## Database Schema Conventions
- Use singular names for tables (e.g., `transaction`, not `transactions`)
- Include `created_at` and `updated_at` timestamps
- Use UUID or auto-incrementing integers for primary keys
- Create indexes for frequently queried columns
- Define foreign key constraints for data integrity

## Fraud Detection Specific Guidelines
- Implement transaction monitoring algorithms
- Create audit trails for all fraud-related actions
- Use threshold-based detection rules
- Log all suspicious activities
- Implement real-time alert mechanisms
- Consider implementing machine learning models for pattern detection

## Performance Optimization
- Use database indexes strategically
- Implement pagination for large datasets
- Cache frequently accessed data
- Use connection pooling for database connections
- Monitor query performance and optimize slow queries

## Environment Variables
Ensure the following environment variables are set:
- `DATABASE_URL` or individual DB connection params
- `PORT` for server port
- `NODE_ENV` for environment (development/production)

## Git Workflow
- Create feature branches from `main`
- Use descriptive commit messages
- Test migrations before committing
- Keep commits atomic and focused
- Review code before merging

## Additional Resources
- Express.js documentation: https://expressjs.com/
- Knex.js documentation: http://knexjs.org/
- PostgreSQL documentation: https://www.postgresql.org/docs/
