# Hindalco Industry - Machine QR Code Management System

## Project Overview

A comprehensive web application designed for Hindalco Industry to manage industrial machines and equipment using QR codes. The system serves as a digital library for machines, where each piece of equipment is assigned a unique QR code. When scanned, these codes provide instant access to machine details, maintenance records, warranty information, and tutorial videos.

## System Architecture

### Frontend Architecture

- Single Page Application (SPA) built with React.js
- Component-based architecture for reusability
- Context API for state management
- Protected routes with Supabase authentication
- Responsive design with CSS Modules

### Backend Architecture

- RESTful API with Node.js and Express
- MongoDB for document-based data storage
- Supabase for authentication and video content management
- Rate limiting and CORS protection

## Key Features

### QR Code Management

- Unique QR code generation for each machine
- Instant access to machine information via QR scan
- Digital profiles for equipment tracking
- Bulk QR code generation and export

### User Roles and Permissions

- Administrator
  - Full system access and management
  - User management and role assignment
  - System configuration and settings
- Maintainer
  - Update maintenance records
  - Add/edit machine details
  - Upload tutorial videos
  - Track maintenance history

### Machine Information Management

- Detailed machine specifications
- Maintenance history tracking
- Location and status monitoring
- Video tutorials for operation
- Document attachment support

## Authentication Flow

1. User initiates login through Supabase authentication
2. Supabase handles authentication and returns JWT
3. Frontend stores token securely
4. Backend validates token on protected routes
5. Role-based access control enforced through Supabase policies

## Video Storage Implementation

- Videos stored in Supabase storage buckets
- Automatic video compression and optimization
- Secure access control with Supabase policies
- Direct upload from frontend with presigned URLs

## Technology Stack

### Frontend

- React.js for interactive UI
- React Router for navigation
- Axios for API communication
- QRCode.react for QR code generation
- React Icons for UI elements
- CSS Modules for styling

### Backend

- Node.js & Express for server
- MongoDB for database
- Supabase for authentication and video storage

## Security Features

- Role-based access control (RBAC) through Supabase policies
- JWT-based authentication via Supabase
- Row Level Security (RLS) policies
- CORS configuration
- Rate limiting
- SSL/TLS encryption
- SQL injection protection
- Secure password hashing
- Input validation and sanitization

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- MongoDB account
- Clerk account
- Supabase account

### Backend Setup

1. Clone the repository
2. Navigate to backend directory:
   ```bash
   cd qr-device-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create .env file and configure:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   MONGODB_URI=your_mongodb_connection_string
   FRONTEND_URL=your_frontend_url
   PORT=7349
   ```
5. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd qr-device-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create .env file and configure:
   ```env
   VITE_API_BASE_URL=your_backend_url
   VITE_CORS_ORIGIN=your_frontend_url
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your repository
3. Configure environment variables
4. Deploy the application

### Frontend Deployment (Vercel)

1. Push code to GitHub repository
2. Import project to Vercel
3. Configure environment variables
4. Deploy the application

### Post-Deployment

- Configure CORS settings
- Set up SSL certificates
- Configure domain settings
- Test all functionality
- Monitor application metrics
