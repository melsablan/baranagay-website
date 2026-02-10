# Barangay NIT Website - Tech Stack

## Overview
A full-stack web application for the Barangay NIT (Barangay Office) built with React frontend and Flask backend, featuring an AI-powered chatbot and certificate management system.

---

## Backend Stack

### Framework & Core
- **Flask** (v3.0.0) - Python web framework
- **Python** - Backend language
- **Gunicorn** (v21.2.0) - WSGI HTTP Server for production deployment

### Database
- **MySQL** (via `mysql-connector-python` v9.1.0)
- **AWS RDS** - Managed database hosted on AWS (Region: `ap-southeast-1`)
  - Database: `barangay_nit`
  - Endpoint: `database-1.cl4cgs2gwz6r.ap-southeast-1.rds.amazonaws.com`

### Authentication & Security
- **Flask-JWT-Extended** (v4.6.0) - JWT token-based authentication
- **PyJWT** (v2.8.0) - JWT encoding/decoding
- **Werkzeug** (v3.0.1) - Security utilities (password hashing)

### API & CORS
- **Flask-CORS** (v4.0.0) - Cross-Origin Resource Sharing support

### File & Data Processing
- **ReportLab** (v4.0.7) - PDF certificate generation
- **Pillow** (v10.1.0) - Image processing
- **python-dotenv** (v1.0.0) - Environment variable management

### Email Service
- **Gmail SMTP** for email notifications
  - Used for certificate approvals, rejections, and appointment confirmations

---

## Frontend Stack

### Framework & Core
- **React** (v19.2.0) - UI library
- **React-DOM** (v19.2.0) - DOM rendering
- **React Router DOM** (v7.10.0) - Client-side routing

### Styling
- **Tailwind CSS** (v4.1.17) - Utility-first CSS framework
- **Tailwind** (v4.0.0) - Tailwind framework
- **PostCSS** (v8.5.6) - CSS processing
- **Autoprefixer** (v10.4.22) - CSS vendor prefixing

### UI Components
- **Lucide React** (v0.555.0) - Icon library

### Build & Development
- **React Scripts** (v5.0.1) - Create React App build scripts

### Testing
- **@testing-library/react** (v16.3.0) - Component testing
- **@testing-library/jest-dom** (v6.9.1) - DOM matchers
- **@testing-library/dom** (v10.4.1) - DOM testing
- **@testing-library/user-event** (v13.5.0) - User interaction simulation

### Utilities
- **Web Vitals** (v2.1.4) - Performance metrics

---

## External Services & APIs

### AI & Chatbot
- **Google Gemini API** (v2.5-flash-preview-09-2025)
  - Used for "Kapitan Bot" - AI-powered chatbot assistant
  - Handles certificate inquiries, permits, health information, and barangay services
  - Environment Variable: `REACT_APP_GEMINI_API_KEY`

### Cloud Infrastructure
- **AWS (Amazon Web Services)**
  - RDS (Relational Database Service) for MySQL database
  - Supports scalable, managed database hosting

---

## Architecture Overview

```
Barangay NIT Website
├── Frontend (React + Tailwind CSS)
│   ├── Pages: Home, About, Services, News, FAQ, Contact
│   ├── Components: Forms, Chatbot, Admin Dashboard
│   └── Services: API integration, Status tracking
│
├── Backend (Flask + Python)
│   ├── Authentication (JWT tokens)
│   ├── Database (AWS RDS MySQL)
│   ├── File Processing (PDF, Images)
│   ├── Email Notifications (Gmail SMTP)
│   └── API Endpoints (RESTful)
│
└── External Services
    ├── Google Gemini API (Chatbot)
    └── AWS RDS (Database)
```

---

## Key Features Enabled by Tech Stack

1. **Chatbot** - Google Gemini API provides intelligent conversational assistant
2. **Certificate Management** - PDF generation with ReportLab, database tracking
3. **Appointment Booking** - Form submission, email notifications, status tracking
4. **Admin Dashboard** - JWT authentication, secure admin operations
5. **Email Notifications** - Automated responses via Gmail SMTP
6. **Responsive UI** - Tailwind CSS for mobile-friendly design
7. **Production Ready** - Gunicorn + Flask for scalable deployment

---

## Environment Configuration

Required environment variables (see `.env` file):

**Database:**
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

**Email:**
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`

**Frontend:**
- `REACT_APP_GEMINI_API_KEY` - Google Gemini API key for chatbot

---

## Deployment

- **Backend**: Runs with Gunicorn WSGI server
- **Frontend**: Built to static files and served via backend
- **Database**: Managed AWS RDS service in ap-southeast-1 region
- **Hosting**: Can be deployed to AWS EC2, Heroku, or similar platforms

