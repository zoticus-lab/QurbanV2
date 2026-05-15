# Setup & Installation Guide - Sistem Manajemen Kurban

## 📋 Prerequisites

Sebelum memulai, pastikan Anda sudah memiliki:

### Opsi 1: Docker Setup (Recommended)
- ✅ Docker Desktop installed ([download](https://www.docker.com/products/docker-desktop))
- ✅ Docker Compose (included with Docker Desktop)
- ✅ Git (optional)
- ✅ Port 80, 3306, 5000 available

### Opsi 2: Local Development
- ✅ Node.js v18+ ([download](https://nodejs.org/))
- ✅ MySQL 8.0+ ([download](https://dev.mysql.com/downloads/mysql/))
- ✅ npm or yarn package manager
- ✅ Port 5000, 5173, 3306 available

## 🚀 Opsi 1: Quick Start dengan Docker Compose

### Step 1: Persiapan Project
```powershell
# Buka PowerShell sebagai Administrator
cd d:\Project\Web\Qurban

# Verifikasi file docker-compose.yml
dir docker-compose.yml

# Copy environment file
copy .env.docker .env
```

### Step 2: Build & Start Services
```powershell
# Build dan jalankan semua services
docker-compose up --build

# Tunggu hingga semua services siap (~1-2 menit)
# Anda akan melihat output:
# ✓ Server running on http://localhost:5000
# frontend_1   | ready in 500ms
```

### Step 3: Initialize Database
Di terminal baru:
```powershell
# Inisialisasi database schema
docker exec qurban-backend npm run migrate

# Output: ✓ Database tables created successfully
```

### Step 4: Akses Aplikasi
Buka browser dan navigate ke:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Database**: localhost:3306 (MySQL)

### Step 5: Test Aplikasi
```bash
# Generate test coupons
curl -X POST http://localhost:5000/api/coupons/generate \
  -H "Content-Type: application/json" \
  -d '{"count": 10}'

# Check dashboard
# Visit http://localhost/dashboard
```

### Step 6: Stop Services
```powershell
# Stop semua containers
docker-compose down

# Stop dan hapus volumes (reset database)
docker-compose down -v
```

### Useful Docker Commands
```powershell
# View all running containers
docker-compose ps

# View logs
docker-compose logs -f          # All services
docker-compose logs -f backend  # Backend only
docker-compose logs -f frontend # Frontend only

# Restart specific service
docker-compose restart backend

# Access MySQL console
docker exec -it qurban-mysql mysql -u root -p

# Run migration manually
docker exec qurban-backend npm run migrate
```

---

## 🏠 Opsi 2: Local Development Setup

### Step 1: Install Dependencies

#### Backend Setup
```powershell
# Navigate to backend
cd backend

# Install Node dependencies
npm install

# Expected: "up to date" message
```

#### Frontend Setup
```powershell
# Navigate to frontend (new terminal)
cd frontend

# Install Node dependencies
npm install

# Expected: "up to date" message
```

### Step 2: Setup MySQL Database

#### Option A: Manual MySQL Setup
```powershell
# 1. Open MySQL command line or MySQL Workbench

# 2. Create database dan user
mysql -u root -p

# In MySQL:
CREATE DATABASE qurban_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'qurban_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON qurban_db.* TO 'qurban_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Option B: MySQL Service Start
```powershell
# Windows - Start MySQL service
net start MySQL80

# Or via Services application
# Services → MySQL80 → Start
```

### Step 3: Configure Backend

```powershell
# Navigate to backend
cd backend

# Copy dan edit environment file
copy .env.example .env

# Edit .env dengan text editor (Notepad, VS Code)
# Pastikan settings:
# MYSQL_HOST=localhost
# MYSQL_USER=root (atau qurban_user)
# MYSQL_PASSWORD=your_password
# MYSQL_DATABASE=qurban_db
```

### Step 4: Initialize Database

```powershell
# Navigate to backend folder
cd backend

# Run migration script
npm run migrate

# Expected output:
# ✓ Database tables created successfully
```

### Step 5: Start Backend Server

```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Expected output:
# ✓ Server running on http://localhost:5000
```

### Step 6: Start Frontend Server

```powershell
# Terminal 2: Frontend
cd frontend
npm run dev

# Expected output:
# ✓ Local: http://localhost:5173
# ✓ Press q to quit
```

### Step 7: Open Application

```
Browser 1: http://localhost:5173 (Frontend with hot reload)
Browser 2: http://localhost:5000/api/health (Backend health check)
```

### Step 8: Test Locally

```powershell
# Generate test data via API
curl -X POST http://localhost:5000/api/coupons/generate `
  -H "Content-Type: application/json" `
  -d "{`"count`": 50}"

# Check dashboard
# Navigate to http://localhost:5173 → Dashboard
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```
# Development
NODE_ENV=development
PORT=5000
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=qurban_db
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env) - Optional
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sistem Manajemen Kurban
```

### Database Configuration

Edit `backend/.env`:
```
MYSQL_HOST=localhost          # MySQL server address
MYSQL_USER=root               # MySQL username
MYSQL_PASSWORD=your_password  # MySQL password
MYSQL_DATABASE=qurban_db      # Database name
```

---

## 📊 Verifikasi Instalasi

### Checklist
- [ ] Docker/Node.js terinstall
- [ ] MySQL running
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173/80)
- [ ] Database tables created
- [ ] API health check passed

### Health Checks

```powershell
# Backend health
curl http://localhost:5000/api/health

# Dashboard stats (should work)
curl http://localhost:5000/api/dashboard/stats

# Frontend (should show app)
# http://localhost:5173 atau http://localhost
```

---

## 🎯 First Steps After Setup

### 1. Generate Test Coupons
```
Admin Panel → Generate Kupon → Input 50 → Generate
(Or via API: POST /api/coupons/generate)
```

### 2. View Dashboard
```
Dashboard → Lihat statistik kupon
(Should show: Total: 50, Kosong: 50, Terdaftar: 0, Diambil: 0)
```

### 3. Test Scanner
```
Scanner → Scan QR code dari cetak
(Akan membuka registration form)
```

### 4. Complete Registration
```
Scanner → Isi form penerima → Submit
(Status berubah dari "Kosong" → "Terdaftar")
```

### 5. Confirm Pickup
```
Scanner → Lihat detail → Konfirmasi Ambil
(Status berubah dari "Terdaftar" → "Diambil")
```

---

## 🐛 Troubleshooting

### Docker Issues

#### Container tidak start
```powershell
# Check logs
docker-compose logs

# Rebuild
docker-compose down
docker-compose up --build

# Check port usage
netstat -ano | findstr :5000
netstat -ano | findstr :80
```

#### MySQL connection error
```powershell
# Restart MySQL container
docker-compose restart mysql

# Check MySQL is ready
docker-compose logs mysql | Select-String "ready"
```

### Local Development Issues

#### Backend connection failed
```powershell
# Check MySQL running
net status MySQL80

# Restart MySQL
net stop MySQL80
net start MySQL80

# Check port 5000 available
netstat -ano | findstr :5000
```

#### npm install fails
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

#### Frontend not loading
```powershell
# Check Vite running on 5173
netstat -ano | findstr :5173

# Clear Vite cache
rmdir /s /q frontend\node_modules\.vite

# Restart
npm run dev
```

#### QR Scanner not working
- ✅ Allow camera access in browser
- ✅ Check browser console for errors
- ✅ Test in different browser
- ✅ Ensure http://localhost:5173 (not IP)

### Database Issues

#### Reset database completely
```powershell
# Docker
docker-compose down -v
docker-compose up

# Local MySQL
mysql -u root -p qurban_db
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS settings;
# Then run migration again

npm run migrate
```

#### Check database
```powershell
# Docker
docker exec qurban-mysql mysql -u root -p qurban_db -e "SHOW TABLES;"

# Local
mysql -u root -p qurban_db -e "SHOW TABLES;"
SELECT COUNT(*) FROM coupons;
SELECT status, COUNT(*) FROM coupons GROUP BY status;
```

---

## 📝 File Structure Quick Reference

```
Qurban/
├── backend/               # Node.js + Express
│   ├── src/
│   │   ├── index.js      # Main server file
│   │   ├── database/     # MySQL config
│   │   ├── models/       # Data layer
│   │   ├── controllers/  # Business logic
│   │   └── routes/       # API endpoints
│   ├── package.json
│   └── .env              # Configuration
│
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── main.jsx      # Entry point
│   │   ├── App.jsx       # Main component
│   │   ├── pages/        # Page components
│   │   ├── components/   # UI components
│   │   └── services/     # API client
│   ├── package.json
│   └── vite.config.js
│
├── docker/               # Docker config
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
├── docker-compose.yml    # Container orchestration
├── README.md             # Main documentation
├── BACKEND_API.md        # API reference
└── FRONTEND_DOCS.md      # Frontend guide
```

---

## 🎓 Next Steps

1. **Explore Dashboard**: Review statistik dan grafik
2. **Test Scanner**: Scan QR code dengan kamera
3. **Generate Coupons**: Buat 100+ test coupons
4. **Print Coupons**: Download PDF dan cetak
5. **Test Flow**: Complete registration dan pickup
6. **Customize**: Update masjid name, colors, settings

---

## 📞 Need Help?

### Dokumentasi
- [README.md](./README.md) - Overview & features
- [BACKEND_API.md](./BACKEND_API.md) - API documentation
- [FRONTEND_DOCS.md](./FRONTEND_DOCS.md) - Frontend guide

### Debugging Tools
1. Browser DevTools (F12)
   - Network tab: Check API calls
   - Console: View error messages
   - Application: Check localStorage

2. Docker Logs
   ```
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs mysql
   ```

3. Database Query
   ```
   docker exec qurban-mysql mysql -u root -p qurban_db
   ```

### Common Errors & Solutions

| Error | Solution |
|-------|----------|
| Port already in use | `netstat -ano \| findstr :PORT` then `taskkill /PID <pid> /F` |
| Database connection refused | Check MySQL running, verify credentials |
| CORS error | Check CORS_ORIGIN in .env matches frontend URL |
| QR scanner permission denied | Allow camera access in browser settings |
| npm ERR! | Clear cache: `npm cache clean --force` |
| npm audit vulnerabilities | Run: `npm audit fix` |

---

**Last Updated**: May 15, 2026
**Version**: 1.0.0

Happy coding! 🚀
