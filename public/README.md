# AntiPhish Frontend

This directory contains the frontend web application for the Fraud Detection and Reporting System.

## Pages

### 1. Home Page (index.html)
The landing page for the AntiPhish system featuring:

- **Hero Section**: Eye-catching introduction with key statistics
- **Features Section**: Four key features of the system
  - AI-Powered Analysis
  - Real-Time Protection
  - Detailed Reports
  - Community Database
- **Quick Security Check**: Interactive form allowing users to analyze suspicious messages, emails, or URLs
  - Works for both authenticated and guest users
  - Guest users get basic heuristic analysis
  - Authenticated users get full AI-powered analysis
- **How It Works**: 3-step process visualization
- **Call-to-Action**: Encourages user sign-up

### 2. Education Page (education.html)
Comprehensive phishing awareness and education page featuring:

- **What is Phishing**: Introduction to phishing attacks and their impact
- **Types of Phishing**: 6 common attack types with examples
  - Email Phishing
  - SMS Phishing (Smishing)
  - Voice Phishing (Vishing)
  - Spear Phishing
  - Whaling
  - Clone Phishing
- **Red Flags Section**: 8 warning signs to watch for with examples
  - Suspicious sender addresses
  - Generic greetings
  - Urgency tactics
  - Suspicious links
  - Poor grammar
  - Unexpected attachments
  - Personal information requests
  - Too-good-to-be-true offers
- **Real-World Examples**: 3 detailed phishing attempt examples with analysis
- **Security Best Practices**: 6 actionable security practices
- **What To Do If Targeted**: Step-by-step guidance for handling phishing attempts
- **Interactive Quiz**: 5-question quiz to test knowledge with explanations

## Features

### Quick Check Analysis
The home page includes a quick check tool that:
- Accepts message content or URLs
- Provides basic heuristic analysis for non-authenticated users
- Detects:
  - Suspicious URLs (shortened URLs, IP addresses, non-HTTPS)
  - Urgency keywords
  - Sensitive information requests
  - Grammar issues
- Calculates risk scores and provides recommendations
- Encourages account creation for advanced features

### Interactive Education
The education page includes:
- Smooth scrolling navigation
- Interactive quiz with immediate feedback
- Highlighted examples with color-coded risk levels
- Comprehensive coverage of phishing tactics

## Styling

The application uses a modern, responsive design with:
- Custom CSS variables for consistent theming
- Gradient accents (purple/blue)
- Card-based layouts
- Smooth transitions and hover effects
- Mobile-responsive grid layouts
- Professional color scheme:
  - Primary: Blue (#2563eb)
  - Success: Green (#10b981)
  - Warning: Orange (#f59e0b)
  - Danger: Red (#ef4444)

## JavaScript Functionality

### main.js
- Authentication state management
- Quick check form handling
- Basic heuristic analysis for guest users
- API integration for authenticated users
- Dynamic UI updates based on auth status
- Smooth scrolling for anchor links

### education.js
- Interactive quiz functionality
- 5 questions with explanations
- Score tracking and final results
- Smooth scrolling for table of contents
- Section highlighting on scroll
- Answer validation and feedback

## Integration with Backend

The frontend integrates with the backend API:
- `POST /api/messages` - Submit messages for analysis
- `GET /api/analyses` - Retrieve analysis history (authenticated)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication

## Running the Application

The backend serves these static files automatically. Simply start the server:

```bash
npm run dev
```

Then visit:
- Home: http://localhost:3000/
- Education: http://localhost:3000/education.html
- API Health: http://localhost:3000/api

## File Structure

```
public/
├── index.html           # Home page
├── education.html       # Education page
├── css/
│   └── styles.css      # All styles for both pages
├── js/
│   ├── main.js         # Home page functionality
│   └── education.js    # Education page functionality
└── images/             # Placeholder for future images
```

## Future Enhancements

Potential additions:
- Dashboard page for authenticated users
- Login/signup pages
- User profile management
- Analysis history view
- Reporting functionality
- Admin panel
- Dark mode toggle
- Multi-language support
