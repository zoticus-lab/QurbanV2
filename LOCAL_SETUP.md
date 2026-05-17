# Setup Local Development (Tanpa Docker)

## 🔧 Prerequisites

Pastikan sudah install:
1. **Node.js v18+** → https://nodejs.org/ (pilih LTS)
2. **MySQL 8.0+** → https://dev.mysql.com/downloads/mysql/

## 📋 Step-by-Step Setup

### Step 1: Setup MySQL Database

#### Opsi A: MySQL sudah terinstall
```powershell
# Buka MySQL Command Line Client atau gunakan MySQL Workbench
mysql -u root -p

# Masukkan password root MySQL Anda, kemudian jalankan:
CREATE DATABASE qurban_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Opsi B: Cek password MySQL
Jika lupa password MySQL root:
```powershell
# Gunakan password default atau reset
# Default password seringkali kosong atau "password"
mysql -u root

# Jika berhasil, set password:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
```

**📝 Catatan**: Jika MySQL password Anda berbeda, update di file `backend/.env` pada variabel `MYSQL_PASSWORD`

---

### Step 2: Setup Backend

```powershell
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Jalankan migration untuk create tables
npm run migrate

# Output yang diharapkan:
# ✓ Database tables created successfully
# ✓ Default admin user created: admin / admin123
```

Jika ada error pada step ini:
- Pastikan MySQL sudah running
- Pastikan database `qurban_db` sudah dibuat
- Pastikan credentials di `.env` sesuai dengan MySQL Anda

---

### Step 3: Start Backend Server

```powershell
# Di folder backend, jalankan:
npm run dev

# Output yang diharapkan:
# ✓ Server running on http://localhost:5000
```

Backend akan berjalan di: **http://localhost:5000**

---

### Step 4: Setup Frontend (Di terminal BARU)

```powershell
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install
```

---

### Step 5: Start Frontend Development Server

```powershell
# Di folder frontend, jalankan:
npm run dev

# Output yang diharapkan:
#   VITE v5.0.8  ready in XXX ms
#   ➜  Local:   http://localhost:5173/
```

Frontend akan berjalan di: **http://localhost:5173**

---

## ✅ Verifikasi Setup

Setelah semua berjalan, test dengan:

```powershell
# Test Backend Health Check
curl http://localhost:5000/api/health

# Respons yang diharapkan:
# {"status":"OK","timestamp":"2024-..."}
```

**Login dengan:**
- Username: `admin`
- Password: `admin123`

---

## 📂 Struktur Terminal

Anda perlu membuka **3 terminal** terpisah:

| Terminal | Perintah | Status |
|----------|----------|--------|
| Terminal 1 | `cd backend && npm run dev` | ✓ Server running on http://localhost:5000 |
| Terminal 2 | `cd frontend && npm run dev` | ✓ Local: http://localhost:5173/ |
| Terminal 3 | (MySQL running di background) | ✓ MySQL port 3306 |

---

## 🐛 Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:3306"
- MySQL tidak running
- **Solusi**: Buka MySQL Command Line Client atau MySQL Workbench

### Error: "Access denied for user 'root'@'localhost'"
- Password MySQL salah
- **Solusi**: Update `MYSQL_PASSWORD` di `backend/.env`

### Error: "Unknown database 'qurban_db'"
- Database belum dibuat
- **Solusi**: Jalankan SQL: `CREATE DATABASE qurban_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

### Frontend tidak bisa connect ke Backend
- CORS error mungkin muncul di browser console
- **Solusi**: Pastikan backend running di port 5000 dan `CORS_ORIGIN=http://localhost:5173`

### Port sudah digunakan
- Port 5000 (backend) atau 5173 (frontend) sudah dipakai aplikasi lain
- **Solusi**: 
  ```powershell
  # Cari aplikasi yang menggunakan port 5000
  netstat -ano | findstr :5000
  
  # Atau ubah PORT di backend/.env (misal: PORT=5001)
  ```

---

## 🔗 Useful Links

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health
- MySQL: localhost:3306

---

## 📝 Catatan Penting

1. **Jangan push `.env` ke Git** - file ini berisi password
2. `.env` sudah di `.gitignore` (seharusnya)
3. Untuk production, gunakan password MySQL yang kuat
4. Ubah `JWT_SECRET` di `.env` dengan random string yang panjang untuk security

---

**Selesai! Aplikasi Anda sekarang siap dijalankan secara lokal tanpa Docker.** 🎉
