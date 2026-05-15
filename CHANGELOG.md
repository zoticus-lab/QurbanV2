# 📝 Changelog - Sistem Manajemen Kurban

## Version 1.1.0 - Authentication System (May 15, 2026)

### Added ✨

#### Backend
- **User Authentication System**
  - User model with bcrypt password hashing
  - JWT token-based authentication
  - Role-based access control (Admin & Scanner)
  - Auth middleware for route protection
  - User management endpoints (admin only)

- **New Database Table**
  - `users` table with fields: id, username, email, password_hash, role, is_active, last_login

- **New API Endpoints**
  - `POST /auth/login` - User login
  - `POST /auth/register` - Create new user
  - `GET /auth/profile` - Get current user profile
  - `POST /auth/change-password` - Change user password
  - `POST /auth/verify-token` - Verify token validity
  - `GET /auth/users` - List all users (admin only)
  - `POST /auth/users/{userId}/deactivate` - Deactivate user (admin only)

- **New Packages**
  - `bcrypt` v5.1.1 - Password hashing
  - `jsonwebtoken` v9.1.2 - JWT token generation & verification

- **Default Admin User**
  - Auto-created during migration
  - Username: `admin`
  - Password: `admin123`

#### Frontend
- **Login Page**
  - Username & password input
  - Error handling & messages
  - Loading state indicator
  - Demo credentials display
  - Show password toggle

- **Protected Routes**
  - Check authentication before rendering
  - Role-based access control
  - Auto-redirect to login if not authenticated
  - Handle token expiration

- **User Profile Section**
  - Display logged-in user info
  - Current role display
  - Logout button

- **API Client Enhancement**
  - Auto-attach JWT token to all requests
  - Handle token expiration & auto-logout
  - Interceptors for request/response

#### Documentation
- **AUTH.md** - Complete authentication guide
  - Database schema
  - API endpoints documentation
  - Frontend implementation
  - Security features
  - Testing instructions
  - Troubleshooting guide

### Changed 🔄

- **Backend Main File** (`src/index.js`)
  - Added auth routes
  - Protected coupon & dashboard routes with JWT verification
  - Import auth middleware

- **Frontend App** (`src/App.jsx`)
  - Added login state management
  - Conditional rendering based on authentication
  - User profile display in sidebar
  - Logout functionality
  - Role-based page access

- **API Service** (`services/api.js`)
  - Added auth service methods
  - Axios interceptors for token handling
  - Auto-redirect on token expiration

- **Database Migration** (`migrate.js`)
  - Added users table creation
  - Default admin user insertion
  - Updated console messages

- **Environment Files**
  - `.env.example` - Added JWT_SECRET
  - `.env.docker` - Added JWT_SECRET

### Security Features 🔒

- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ JWT token authentication (24-hour expiry)
- ✅ Role-based access control
- ✅ Token validation middleware
- ✅ Automatic token refresh & error handling
- ✅ No password leak in error messages
- ✅ Active user status checking
- ✅ Last login timestamp tracking

### Breaking Changes ⚠️

**All API endpoints now require authentication** except:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/verify-token`
- `GET /api/health`

**Header requirement for protected routes:**
```
Authorization: Bearer <jwt_token>
```

### Migration Guide 🔄

1. **Install new dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Update database schema:**
   ```bash
   npm run migrate
   ```
   
   Or with Docker:
   ```bash
   docker exec qurban-backend npm run migrate
   ```

3. **Update environment files:**
   ```bash
   copy .env.example .env
   # Update JWT_SECRET with strong random string
   ```

4. **Restart services:**
   ```bash
   # Local
   npm run dev

   # Docker
   docker-compose restart
   ```

5. **Login with default credentials:**
   ```
   Username: admin
   Password: admin123
   ```

6. **Change password immediately!**
   - Go to profile settings
   - Change password from admin123

### Testing Checklist ✅

- [ ] Login with admin/admin123
- [ ] Logout works properly
- [ ] Dashboard requires login
- [ ] Scanner requires login
- [ ] Admin page only visible to admin
- [ ] Cannot access API without token
- [ ] Token expires after 24 hours
- [ ] Password change works
- [ ] Create new scanner user
- [ ] Cannot modify other users (scanner role)
- [ ] Admin can view all users
- [ ] Admin can deactivate users

### Files Modified

#### Backend (7 files)
- `src/database/migrate.js` - Added users table
- `src/models/UserModel.js` - New file
- `src/controllers/AuthController.js` - New file
- `src/middleware/auth.js` - New file
- `src/routes/auth.js` - New file
- `src/index.js` - Updated with auth middleware
- `package.json` - Added bcrypt, jsonwebtoken

#### Frontend (3 files)
- `src/pages/LoginPage.jsx` - New file
- `src/App.jsx` - Updated with auth logic
- `src/services/api.js` - Updated with interceptors

#### Configuration (3 files)
- `.env.example` - Added JWT_SECRET
- `.env.docker` - Added JWT_SECRET
- `README.md` - Updated with auth info

#### Documentation (1 file)
- `AUTH.md` - New comprehensive auth guide

### Known Issues

None at this time.

### Upcoming Features 🚀

- [ ] Social login (Google, etc)
- [ ] Two-factor authentication (2FA)
- [ ] User activity logging
- [ ] Audit trail
- [ ] Session management
- [ ] Rate limiting on login
- [ ] Password reset via email
- [ ] User profile customization

### Support

For authentication-related issues, see [AUTH.md](./AUTH.md).

---

## Version 1.0.0 - Initial Release (May 15, 2026)

### Features
- ✅ Dashboard with real-time statistics
- ✅ QR Code scanner (html5-qrcode)
- ✅ Coupon management (3 states)
- ✅ Bulk coupon generation
- ✅ A4 layout printing (10 per page)
- ✅ PDF export
- ✅ Distribution progress charts
- ✅ Docker & Docker Compose setup
- ✅ Comprehensive documentation

### Components
- 10+ React components
- 15+ API endpoints
- Complete database schema
- Responsive UI with Tailwind CSS

---

**Last Updated**: May 15, 2026
