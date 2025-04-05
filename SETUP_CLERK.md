# Setting Up Clerk Authentication with Role-Based Access Control

Follow these steps to set up Clerk authentication and role-based access control in the Hindalco Machine QR Device Management System.

## 1. Create a Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click "Add Application"
3. Name your application (e.g., "Hindalco Machine QR")
4. Choose "Sign up/Sign in" as the authentication type

## 2. Configure JWT Templates

1. In your Clerk Dashboard, go to JWT Templates
2. Create a new template or modify the default one
3. Add the following claim:

```json
{
  "role": {
    "type": "string",
    "enum": ["user", "maintainer", "administrator"]
  }
}
```

## 3. Set Up Environment Variables

### Frontend (.env)

```
VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
VITE_API_BASE_URL=your_backend_url
```

### Backend (.env)

```
CLERK_SECRET_KEY=your_secret_key
```

## 4. Assign Roles to Users

1. Go to the Clerk Dashboard
2. Navigate to Users section
3. Select a user
4. Add a public metadata field:
   - Key: `role`
   - Value: One of `["user", "maintainer", "administrator"]`

## 5. Testing Role-Based Access

1. Sign in with different user accounts
2. Verify that:
   - Users can view devices
   - Maintainers can add maintenance records
   - Administrators can modify warranty information

## Role Permissions

- **User**
  - View devices and their details
  - Scan QR codes
- **Maintainer**
  - All User permissions
  - Add maintenance records
  - Update device status
- **Administrator**
  - All Maintainer permissions
  - Modify warranty information
  - Manage user roles
  - Add/remove devices

## Troubleshooting

- If roles are not working, check:
  1. JWT template configuration
  2. User metadata in Clerk Dashboard
  3. Environment variables
  4. Backend role middleware
