# Backend API Documentation

## Overview
Backend API untuk Sistem Manajemen Kurban dibangun dengan Express.js dan MySQL. API menyediakan endpoints untuk:
- Generate dan manage kupon
- Registrasi penerima kurban
- Konfirmasi pengambilan daging
- Dashboard statistik

## Tech Stack
- **Framework**: Express.js 4.18.2
- **Database**: MySQL 2 (mysql2 driver)
- **QR Code**: qrcode 1.5.3
- **PDF Export**: jsPDF 2.5.1
- **CORS**: cors 2.8.5
- **Environment**: dotenv 16.3.1

## Installation

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm or yarn

### Setup Steps

```bash
# 1. Navigate ke backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
copy .env.example .env

# 4. Update .env dengan MySQL credentials
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=qurban_db

# 5. Initialize database
npm run migrate

# 6. Start development server
npm run dev

# 7. Start production server
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── index.js                      # Express app entry point
│   ├── database/
│   │   ├── config.js                 # MySQL connection pool
│   │   └── migrate.js                # Database schema creation
│   ├── models/
│   │   └── CouponModel.js            # Coupon data access layer
│   ├── controllers/
│   │   └── CouponController.js       # Coupon business logic
│   ├── routes/
│   │   ├── coupons.js                # Coupon endpoints
│   │   └── dashboard.js              # Dashboard endpoints
│   ├── middleware/                   # Custom middleware (if needed)
│   └── utils/                        # Utility functions (if needed)
├── package.json
├── .env.example                      # Environment template
└── README.md                          # This file
```

## Database Schema

### Coupons Table
```sql
CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  qr_secret VARCHAR(255) UNIQUE NOT NULL,
  no_urut INT NOT NULL UNIQUE,
  nama_penerima VARCHAR(255),
  rt VARCHAR(50),
  rw VARCHAR(50),
  alamat TEXT,
  status ENUM('kosong', 'terdaftar', 'diambil') DEFAULT 'kosong',
  waktu_ambil TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_qr_secret (qr_secret),
  INDEX idx_status (status),
  INDEX idx_no_urut (no_urut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
```

### Settings Table (for future use)
```sql
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) UNIQUE NOT NULL,
  value_text LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
```

## API Endpoints

### Base URL
```
Development: http://localhost:5000/api
Production: http://localhost/api
```

### Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-05-15T10:30:00Z"
}
```

### Coupon Management

#### Generate Multiple Coupons
```
POST /coupons/generate
Content-Type: application/json

Request Body:
{
  "count": 50
}

Response (201):
{
  "success": true,
  "message": "50 coupons generated successfully",
  "data": [
    {
      "qr_secret": "a1b2c3d4e5f6...",
      "no_urut": 1
    },
    {
      "qr_secret": "f6e5d4c3b2a1...",
      "no_urut": 2
    }
  ]
}

Error (400):
{
  "error": "Invalid count. Please provide between 1 and 1000 coupons."
}
```

#### Get Single Coupon
```
GET /coupons/:qr_secret

Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "qr_secret": "a1b2c3d4e5f6...",
    "no_urut": 1,
    "nama_penerima": "Ahmad Ridho",
    "rt": "01",
    "rw": "02",
    "alamat": "Jl. Merdeka No. 10, Jakarta",
    "status": "kosong",
    "waktu_ambil": null,
    "created_at": "2026-05-15T10:00:00Z",
    "updated_at": "2026-05-15T10:00:00Z"
  }
}

Error (404):
{
  "error": "Coupon not found"
}
```

#### Get All Coupons (Paginated)
```
GET /coupons?limit=100&offset=0

Query Parameters:
- limit: Number (default: 100, max: 1000)
- offset: Number (default: 0)

Response (200):
{
  "success": true,
  "data": {
    "data": [
      { ...coupon_object },
      { ...coupon_object }
    ],
    "total": 500
  }
}
```

#### Register Coupon
```
POST /coupons/register
Content-Type: application/json

Request Body:
{
  "qr_secret": "a1b2c3d4e5f6...",
  "nama_penerima": "Ahmad Ridho",
  "rt": "01",
  "rw": "02",
  "alamat": "Jl. Merdeka No. 10, Jakarta"
}

Response (200):
{
  "success": true,
  "message": "Coupon registered successfully",
  "data": {
    "qr_secret": "a1b2c3d4e5f6...",
    "nama_penerima": "Ahmad Ridho",
    "rt": "01",
    "rw": "02",
    "alamat": "Jl. Merdeka No. 10, Jakarta",
    "status": "terdaftar"
  }
}

Error (404):
{
  "error": "Coupon not found"
}

Error (400):
{
  "error": "Coupon cannot be registered. Current status: terdaftar"
}
```

#### Confirm Pickup
```
POST /coupons/confirm-pickup
Content-Type: application/json

Request Body:
{
  "qr_secret": "a1b2c3d4e5f6..."
}

Response (200):
{
  "success": true,
  "message": "Pickup confirmed",
  "data": {
    "id": 1,
    "qr_secret": "a1b2c3d4e5f6...",
    "no_urut": 1,
    "nama_penerima": "Ahmad Ridho",
    "status": "diambil",
    "waktu_ambil": "2026-05-15T14:30:00Z"
  }
}

Error (400):
{
  "error": "Cannot confirm pickup. Current status: diambil"
}
```

#### Get QR Code Image
```
GET /coupons/qr/:qr_secret

Response (200):
{
  "success": true,
  "qr_image": "data:image/png;base64,iVBORw0KGgo..."
}
```

### Dashboard

#### Get Dashboard Statistics
```
GET /dashboard/stats

Response (200):
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
      {
        "status": "kosong",
        "count": 200
      },
      {
        "status": "terdaftar",
        "count": 150
      },
      {
        "status": "diambil",
        "count": 150
      }
    ]
  }
}
```

## Error Handling

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP Status Codes:
- `200`: OK - Request successful
- `201`: Created - Resource created
- `400`: Bad Request - Invalid input
- `404`: Not Found - Resource doesn't exist
- `500`: Internal Server Error - Server error

## Database Query Examples

### Generate 50 Coupons
```bash
curl -X POST http://localhost:5000/api/coupons/generate \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

### Scan and Get Coupon
```bash
curl -X GET http://localhost:5000/api/coupons/a1b2c3d4e5f6
```

### Register Penerima
```bash
curl -X POST http://localhost:5000/api/coupons/register \
  -H "Content-Type: application/json" \
  -d '{
    "qr_secret": "a1b2c3d4e5f6",
    "nama_penerima": "Ahmad Ridho",
    "rt": "01",
    "rw": "02",
    "alamat": "Jl. Merdeka No. 10"
  }'
```

### Confirm Pickup
```bash
curl -X POST http://localhost:5000/api/coupons/confirm-pickup \
  -H "Content-Type: application/json" \
  -d '{"qr_secret": "a1b2c3d4e5f6"}'
```

## Performance Tips

1. **Database Indexing**: Indices sudah di-setup pada:
   - `qr_secret` (UNIQUE)
   - `status` (untuk filtering)
   - `no_urut` (untuk sorting)

2. **Connection Pooling**: MySQL connection pool dengan max 10 connections

3. **Caching**: Implement Redis untuk statistics jika scale large

4. **Pagination**: Gunakan limit/offset untuk query coupon besar

## Security Notes

1. ✅ Input validation di semua endpoints
2. ✅ SQL injection prevention (prepared statements)
3. ✅ CORS protection enabled
4. ✅ Error messages tidak expose internal details
5. ❌ TODO: Add authentication/authorization
6. ❌ TODO: Add rate limiting
7. ❌ TODO: Add request logging

## Deployment

### Docker
```bash
docker build -f docker/Dockerfile.backend -t qurban-backend .
docker run -p 5000:5000 \
  -e MYSQL_HOST=mysql \
  -e MYSQL_USER=qurban_user \
  -e MYSQL_PASSWORD=password \
  qurban-backend
```

### Docker Compose
```bash
docker-compose up backend
```

## Monitoring & Logs

### View Logs
```bash
# All containers
docker-compose logs

# Backend only
docker-compose logs backend

# Follow logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Database Stats
```bash
mysql -u qurban_user -p qurban_db
SELECT COUNT(*) as total FROM coupons;
SELECT status, COUNT(*) FROM coupons GROUP BY status;
```

## Support & Troubleshooting

### Database Connection Issues
```bash
# Check MySQL service
docker ps | grep mysql

# Restart MySQL
docker-compose restart mysql

# Check database
docker exec qurban-mysql mysql -u root -p qurban_db -e "SELECT 1"
```

### Port Already in Use
```bash
# Change port in docker-compose.yml
# Or kill process:
lsof -i :5000
kill -9 <PID>
```

### Reset Database
```bash
# Delete data (keep schema)
docker exec qurban-mysql mysql -u root -p qurban_db -e "DELETE FROM coupons;"

# Full reset
docker-compose down -v
docker-compose up
```

---

**Last Updated**: May 15, 2026
**Version**: 1.0.0
