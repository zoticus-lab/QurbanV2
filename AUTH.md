# 🔐 Authentication & Login System

## Overview

Sistem login dengan JWT (JSON Web Token) untuk keamanan aplikasi. Fitur ini melindungi semua endpoint API dan membatasi akses berdasarkan role pengguna.

## Features

- ✅ User login dengan username & password
- ✅ Password hashing dengan bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control (Admin & Scanner)
- ✅ Token auto-refresh & expiration handling
- ✅ Session management
- ✅ Password change functionality
- ✅ User management (admin only)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'scanner') DEFAULT 'scanner',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
)
```

## Default Credentials

Setelah migration, database akan dibuat dengan default user:

```
Username: admin
Password: admin123
Role: admin
```

⚠️ **PENTING**: Ubah password setelah login pertama kali!

## Authentication Flow

### Login Process
```
1. User masukkan username & password di login page
2. Frontend POST ke /api/auth/login
3. Backend verify credentials
4. Generate JWT token (24 hours)
5. Return token & user info
6. Frontend simpan token ke localStorage
7. Redirect ke dashboard
```

### Request with Token
```
1. Frontend baca token dari localStorage
2. Attach token ke header: Authorization: Bearer <token>
3. Backend verify token via middleware
4. Process request jika valid
5. Return 401 jika token invalid/expired
6. Frontend auto-logout & redirect ke login
```

## API Endpoints

### Public Endpoints (No Auth Required)

#### Login
```
POST /api/auth/login

Request:
{
  "username": "admin",
  "password": "admin123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@qurban.local",
    "role": "admin"
  }
}

Error (401):
{
  "error": "Invalid credentials"
}
```

#### Register User
```
POST /api/auth/register

Request:
{
  "username": "scanner1",
  "email": "scanner@qurban.local",
  "password": "password123",
  "role": "scanner"  // optional, default: "scanner"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "username": "scanner1",
    "email": "scanner@qurban.local",
    "role": "scanner"
  }
}
```

#### Verify Token
```
POST /api/auth/verify-token

Request:
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@qurban.local",
    "role": "admin",
    "iat": 1715775600,
    "exp": 1715862000
  }
}

Error (401):
{
  "error": "Invalid token"
}
```

### Protected Endpoints (Require Token)

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@qurban.local",
    "role": "admin",
    "is_active": true,
    "last_login": "2026-05-15T10:30:00Z",
    "created_at": "2026-05-15T09:00:00Z"
  }
}
```

#### Change Password
```
POST /api/auth/change-password
Authorization: Bearer <token>

Request:
{
  "oldPassword": "admin123",
  "newPassword": "newpassword123"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Admin-Only Endpoints

#### List All Users
```
GET /api/auth/users
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@qurban.local",
      "role": "admin",
      "is_active": true,
      "last_login": "2026-05-15T10:30:00Z",
      "created_at": "2026-05-15T09:00:00Z"
    },
    {
      "id": 2,
      "username": "scanner1",
      "email": "scanner@qurban.local",
      "role": "scanner",
      "is_active": true,
      "last_login": null,
      "created_at": "2026-05-15T10:00:00Z"
    }
  ]
}
```

#### Deactivate User
```
POST /api/auth/users/{userId}/deactivate
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "message": "User deactivated successfully"
}
```

## Frontend Implementation

### Login Page
- Input username & password
- Error handling
- Loading state
- Demo credentials display
- Password visibility toggle

### Protected Routes
```javascript
// Check authentication
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

if (!token) {
  // Redirect to login
}

// Check role-based access
if (currentPage === 'admin' && user.role !== 'admin') {
  // Show access denied
}
```

### API Client Setup
```javascript
// Automatically add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Backend Implementation

### User Model (UserModel.js)
```javascript
UserModel.getByUsername(username)         // Get user by username
UserModel.getByEmail(email)               // Get user by email
UserModel.getById(id)                     // Get user by ID
UserModel.verifyPassword(plainPass, hash) // Verify password
UserModel.create(username, email, pass)   // Create new user
UserModel.updateLastLogin(id)             // Update last login time
UserModel.changePassword(id, newPass)     // Change password
UserModel.deactivate(id)                  // Deactivate user
```

### Auth Controller (AuthController.js)
```javascript
AuthController.login()           // Handle login
AuthController.register()        // Create new user
AuthController.getProfile()      // Get current user
AuthController.changePassword()  // Change password
AuthController.listUsers()       // List all users (admin)
AuthController.deactivateUser()  // Deactivate user (admin)
AuthController.verifyToken()     // Verify token validity
```

### Auth Middleware (middleware/auth.js)
```javascript
verifyToken    // Verify JWT token
requireAdmin   // Check admin role
requireScanner // Check scanner role
```

## Security Features

1. **Password Hashing**
   - Bcrypt with 10 salt rounds
   - Never store plain passwords

2. **JWT Tokens**
   - Expires in 24 hours
   - Signed with SECRET_KEY
   - Contains user info (id, username, role)

3. **Token Storage**
   - Stored in localStorage
   - Sent with every API request
   - Auto-removed on expiration

4. **Role-Based Access**
   - Admin: Can access all features
   - Scanner: Can only scan & view dashboard

5. **Error Handling**
   - No credential leak in error messages
   - Proper HTTP status codes
   - Token validation on every request

## Environment Variables

Add to `.env`:
```
JWT_SECRET=your-super-secret-key-change-in-production-use-random-string
```

⚠️ **IMPORTANT**: Change JWT_SECRET to a strong random string in production!

Generate strong secret:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Random -SetSeed $(Get-Date).Ticks).ToString()))
```

## Testing Authentication

### 1. Test Login with cURL
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. Save Token & Use in Request
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Token Expiration
```bash
# Try old/invalid token
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer invalid_token"
```

## Best Practices

### For Users
- ✅ Change default password immediately
- ✅ Use strong passwords (min 6 chars, with special chars)
- ✅ Keep token secret (never share)
- ✅ Logout when done using application

### For Developers
- ✅ Never log passwords
- ✅ Use HTTPS in production
- ✅ Change JWT_SECRET in production
- ✅ Implement rate limiting on login
- ✅ Add user activity logging
- ✅ Implement token refresh logic

### For Production
- ✅ Use strong JWT_SECRET (random 32+ chars)
- ✅ Enable HTTPS/TLS
- ✅ Implement rate limiting
- ✅ Add user audit logs
- ✅ Regular security updates
- ✅ Backup & restore procedures
- ✅ Monitor failed login attempts

## Troubleshooting

### "Invalid credentials"
- Check username exists
- Verify password is correct
- Ensure user is active (is_active = true)

### "No token provided"
- Token not sent in Authorization header
- Check localStorage has token
- Login again if expired

### "Token expired"
- Token is older than 24 hours
- Need to login again
- App auto-redirects to login page

### Cannot access admin page
- User role is 'scanner'
- Create admin user via register
- Contact admin to change role

## Files Changed

### Backend
- `backend/src/database/migrate.js` - Added users table
- `backend/src/models/UserModel.js` - User data access
- `backend/src/controllers/AuthController.js` - Auth logic
- `backend/src/middleware/auth.js` - JWT verification
- `backend/src/routes/auth.js` - Auth endpoints
- `backend/src/index.js` - Protected routes
- `backend/package.json` - Added bcrypt, jsonwebtoken

### Frontend
- `frontend/src/pages/LoginPage.jsx` - Login UI
- `frontend/src/App.jsx` - Auth state & routes
- `frontend/src/services/api.js` - Token handling

## Next Steps

1. Install new dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Initialize database with new schema:
   ```bash
   npm run migrate
   ```

3. Update environment file:
   ```bash
   copy .env.example .env
   # Update JWT_SECRET
   ```

4. Test login:
   - Navigate to http://localhost:5173
   - Login with admin/admin123
   - Change password immediately

5. Create scanner users:
   - Register new users with role 'scanner'
   - Share credentials with operators

---

**Last Updated**: May 15, 2026
**Version**: 1.0.0
