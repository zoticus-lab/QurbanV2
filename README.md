# 🎁 Sistem Manajemen Kurban

Aplikasi fullstack untuk mengelola distribusi kurban dengan QR Code, scanner mobile, dan dashboard statistik real-time.

## 📋 Spesifikasi Sistem

### Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, Lucide React Icons
- **Backend**: Node.js (Express), MySQL 2 Driver
- **Tools**: QRCode.js, jsPDF, html2canvas, html5-qrcode
- **Deployment**: Docker & Docker Compose

### Database Schema
```sql
CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  qr_secret VARCHAR(255) UNIQUE NOT NULL,
  no_urut INT UNIQUE NOT NULL,
  nama_penerima VARCHAR(255),
  rt VARCHAR(50),
  rw VARCHAR(50),
  alamat TEXT,
  status ENUM('kosong', 'terdaftar', 'diambil') DEFAULT 'kosong',
  waktu_ambil TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

## 🚀 Quick Start

### Opsi 1: Dengan Docker Compose (Recommended)

#### Prerequisites
- Docker & Docker Compose installed
- Port 80, 3306, 5000 tersedia

#### Setup & Run
```bash
# 1. Clone/navigate to project
cd d:\Project\Web\Qurban

# 2. Copy environment file
copy .env.docker .env

# 3. Build dan jalankan dengan Docker Compose
docker-compose up --build

# Jika frontend diakses dari IP host, pastikan CORS_ORIGIN berisi origin tersebut
# contoh: CORS_ORIGIN=http://localhost,http://127.0.0.1,http://100.64.168.127

# 4. Tunggu hingga semua service sehat (~30-60 detik)

# 5. Akses aplikasi
Frontend: http://localhost (port 80)
Backend API: http://localhost:5000 (port 5000)
MySQL: localhost:3306

# 6. Inisialisasi database (jika diperlukan)
docker exec qurban-backend npm run migrate

# 7. Stop services
docker-compose down

# 8. View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Opsi 2: Local Development (Manual)

#### Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm or yarn

#### Backend Setup
```bash
# Navigate to backend
cd backend

# Copy environment file
copy .env.example .env

# Update .env dengan konfigurasi MySQL lokal
# MYSQL_HOST=localhost
# MYSQL_USER=root
# MYSQL_PASSWORD=your_password

# Install dependencies
npm install

# Initialize database
npm run migrate

# Start development server
npm run dev

# Server akan berjalan di http://localhost:5000
```

#### Frontend Setup (di terminal baru)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Akses aplikasi di http://localhost:5173
```

## 📁 Struktur Project

```
Qurban/
├── backend/
│   ├── src/
│   │   ├── index.js                 # Main entry point
│   │   ├── database/
│   │   │   ├── config.js            # MySQL connection pool
│   │   │   └── migrate.js           # Database initialization
│   │   ├── models/
│   │   │   └── CouponModel.js       # Data access layer
│   │   ├── controllers/
│   │   │   └── CouponController.js  # Business logic
│   │   ├── routes/
│   │   │   ├── coupons.js          # Coupon endpoints
│   │   │   └── dashboard.js        # Dashboard endpoints
│   │   └── utils/                   # Utility functions
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                # Entry point
│   │   ├── App.jsx                 # Main app component
│   │   ├── index.css               # Global styles
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx   # Dashboard
│   │   │   ├── ScannerPage.jsx     # Scanner interface
│   │   │   └── AdminPage.jsx       # Admin panel
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── StatisticCard.jsx
│   │   │   │   └── DistributionChart.jsx
│   │   │   ├── Scanner/
│   │   │   │   ├── QRScanner.jsx
│   │   │   │   ├── RegistrationForm.jsx
│   │   │   │   └── CouponDetail.jsx
│   │   │   └── Admin/
│   │   │       ├── GenerateCoupons.jsx
│   │   │       ├── PrintCoupons.jsx
│   │   │       └── CouponLayout.jsx
│   │   ├── services/
│   │   │   └── api.js              # API client
│   │   └── hooks/
│   │       └── useAsync.js         # Custom hooks
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── package.json
│   └── .gitignore
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
├── docker-compose.yml
├── .env.docker
└── README.md
```

## 📖 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: http://localhost/api
```

### Authentication
Semua API endpoints (kecuali login) memerlukan JWT token:

```
Authorization: Bearer <token>
```

Default credentials setelah setup:
```
Username: admin
Password: admin123
```

⚠️ **PENTING**: Ubah password setelah login pertama!

 Dokumentasi authentication tambahan sudah dihapus bersama file terpisah.

### Endpoints

#### 1. Generate Coupons
```
POST /coupons/generate
Content-Type: application/json

Body:
{
  "count": 50  // Jumlah kupon (1-1000)
}

Response:
{
  "success": true,
  "message": "50 coupons generated successfully",
  "data": [
    { "qr_secret": "abc123...", "no_urut": 1 },
    ...
  ]
}
```

#### 2. Get Single Coupon
```
GET /coupons/:qr_secret

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "qr_secret": "abc123...",
    "no_urut": 1,
    "nama_penerima": "Ahmad",
    "rt": "01",
    "rw": "02",
    "alamat": "Jl. Merdeka No. 10",
    "status": "kosong" | "terdaftar" | "diambil",
    "waktu_ambil": null
  }
}
```

#### 3. Register Coupon
```
POST /coupons/register
Content-Type: application/json

Body:
{
  "qr_secret": "abc123...",
  "nama_penerima": "Ahmad",
  "rt": "01",
  "rw": "02",
  "alamat": "Jl. Merdeka No. 10"
}

Response: Updated coupon data with status 'terdaftar'
```

#### 4. Confirm Pickup
```
POST /coupons/confirm-pickup
Content-Type: application/json

Body:
{
  "qr_secret": "abc123..."
}

Response: Updated coupon data with status 'diambil' and waktu_ambil
```

#### 5. Get All Coupons
```
GET /coupons?limit=100&offset=0

Response:
{
  "success": true,
  "data": {
    "data": [...],
    "total": 500
  }
}
```

#### 6. Get Dashboard Statistics
```
GET /dashboard/stats

Response:
{
  "success": true,
  "data": {
    "statistics": {
      "total_coupons": 500,
      "kosong": 200,
      "terdaftar": 150,
      "diambil": 150
    },
    "progress": [
      { "status": "kosong", "count": 200 },
      { "status": "terdaftar", "count": 150 },
      { "status": "diambil", "count": 150 }
    ]
  }
}
```

#### 7. Get QR Code Image
```
GET /coupons/qr/:qr_secret

Response:
{
  "success": true,
  "qr_image": "data:image/png;base64,..."
}
```

#### 8. Health Check
```
GET /health

Response:
{
  "status": "OK",
  "timestamp": "2026-05-15T10:30:00Z"
}
```

## 🎯 Fitur Utama

### 1. Dashboard
- 📊 Statistik real-time (Total Kupon, Aktif, Tersalurkan, Sisa)
- 📈 Grafik progress distribusi
- 🔄 Refresh otomatis setiap 30 detik
- 📐 Persentase distribusi dengan progress bar

### 2. Scanner QR (Mobile Friendly)
**Status "Kosong":**
- Tampilkan form registrasi
- Input: Nama, RT, RW, Alamat
- Simpan → Status jadi "Terdaftar"

**Status "Terdaftar":**
- Tampilkan detail penerima
- Tombol "Konfirmasi Ambil"
- Klik → Status jadi "Diambil"

**Status "Diambil":**
- Peringatan MERAH "Daging Sudah Diambil pada [Waktu]"
- Tidak bisa melakukan perubahan
- Arahkan user untuk scan kupon lain

### 3. Admin Panel
- ✨ Generate kupon massal (auto-increment no_urut)
- 🎨 Upload background image (opsional)
- 📄 Layout A4: 10 kupon per lembar (2 kolom × 5 baris)
- 🎫 QR Code + Nomor Urut + Format teks
- 📥 Download PDF siap cetak

## 🔧 Development

### Environment Variables

**Backend (.env)**
```
NODE_ENV=development
PORT=5000
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=qurban_db
CORS_ORIGIN=http://localhost:5173
```

**Docker (.env.docker)**
```
NODE_ENV=production
PORT=5000
MYSQL_HOST=mysql
MYSQL_USER=qurban_user
MYSQL_PASSWORD=password
MYSQL_DATABASE=qurban_db
CORS_ORIGIN=http://localhost
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Docker Compose akan handle sisanya
cd ..
docker-compose up --build
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
docker-compose ps

# Check logs
docker-compose logs mysql

# Restart services
docker-compose restart
```

### Frontend Not Loading
```bash
# Clear browser cache
# Try different port
docker-compose down
docker-compose up
```

### QR Scanner Not Working
- ✅ Pastikan browser meminta akses camera
- ✅ Gunakan HTTPS di production
- ✅ Test di mobile browser yang support

### API Timeout
```bash
# Increase Docker memory
# Set memory limit di docker-compose.yml
```

## 📝 Notes

### Database Considerations
- Backup database secara berkala
- Monitor query performance
- Implement index pada frequently queried columns

### Security
- Gunakan HTTPS di production
- Validate semua input di backend
- Implement rate limiting
- Store sensitive data di environment variables

### Performance
- Frontend images optimized (Tailwind)
- Backend query optimized (indexes)
- Docker health checks enabled
- Nginx caching configured

## 📞 Support

Untuk bantuan teknis atau pertanyaan:
1. Check documentation di folder docs/
2. Review API documentation di atas
3. Check browser console untuk errors
4. Review docker logs: `docker-compose logs`

## 📄 License

Proprietary - Sistem Manajemen Kurban 2026

---

**Created**: May 15, 2026
**Last Updated**: May 15, 2026
**Version**: 1.0.0
