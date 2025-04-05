# Hindalco Machine QR Device Management System

## Authentication Setup

### Environment Variables

#### Frontend (.env)

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=https://hindalco-machine.onrender.com
```

#### Backend (.env)

```
CLERK_SECRET_KEY=your_clerk_secret_key
MONGODB_URI=your_mongodb_uri
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### User Roles

The system supports three user roles:

1. **User**: Basic access to view devices and their information
2. **Maintainer**: Can perform maintenance operations and warranty updates
3. **Administrator**: Full access to all system features

### Role-Based Access Control

The application implements role-based access control through:

- Backend middleware for route protection
- Frontend components that conditionally render based on user roles
- Clerk authentication integration for secure user management

### Setup Steps

1. Create a Clerk application at https://clerk.com
2. Obtain your Clerk publishable key and secret key
3. Set up the environment variables in both frontend and backend
4. Install dependencies:

   ```bash
   # Frontend
   cd qr-device-frontend
   npm install

   # Backend
   cd qr-device-backend
   npm install
   ```

5. Start the development servers:

   ```bash
   # Frontend
   npm run dev

   # Backend
   npm run dev
   ```

### Security Notes

- Never commit .env files to version control
- Always use environment variables for sensitive information
- Implement proper error handling for authentication failures
- Regularly rotate authentication keys and secrets
