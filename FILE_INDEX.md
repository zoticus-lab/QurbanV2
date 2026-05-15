# Project File Index & Manifest

## 📚 Documentation Files (Start Here!)

| File | Purpose | Read First? |
|------|---------|------------|
| [README.md](./README.md) | Main overview, features, tech stack | ✅ YES |
| [SETUP.md](./SETUP.md) | Step-by-step installation guide | ✅ YES |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Developer cheat sheet | ⭐ Bookmark |
| [BACKEND_API.md](./BACKEND_API.md) | API endpoints reference | For API dev |
| [FRONTEND_DOCS.md](./FRONTEND_DOCS.md) | Component documentation | For UI dev |

---

## 🛠️ Backend Files

### Configuration & Setup
- `backend/package.json` - Dependencies & scripts
- `backend/.env.example` - Environment template
- `backend/src/index.js` - Express app entry point
- `backend/src/database/config.js` - MySQL connection pool
- `backend/src/database/migrate.js` - Database initialization

### Core Logic
- `backend/src/models/CouponModel.js` - Data access layer
- `backend/src/controllers/CouponController.js` - Business logic
- `backend/src/routes/coupons.js` - Coupon endpoints
- `backend/src/routes/dashboard.js` - Dashboard endpoints

---

## 🎨 Frontend Files

### Setup & Configuration
- `frontend/package.json` - Dependencies & build scripts
- `frontend/vite.config.js` - Vite build configuration
- `frontend/tailwind.config.js` - Tailwind CSS configuration
- `frontend/postcss.config.js` - PostCSS plugins
- `frontend/index.html` - HTML template
- `frontend/src/main.jsx` - React entry point
- `frontend/src/index.css` - Global styles

### Main App
- `frontend/src/App.jsx` - Main app component with routing

### Pages
- `frontend/src/pages/DashboardPage.jsx` - Dashboard page
- `frontend/src/pages/ScannerPage.jsx` - QR scanner page
- `frontend/src/pages/AdminPage.jsx` - Admin panel page

### Components - Dashboard
- `frontend/src/components/Dashboard/StatisticCard.jsx` - Stat card
- `frontend/src/components/Dashboard/DistributionChart.jsx` - Chart

### Components - Scanner
- `frontend/src/components/Scanner/QRScanner.jsx` - QR reader
- `frontend/src/components/Scanner/RegistrationForm.jsx` - Registration
- `frontend/src/components/Scanner/CouponDetail.jsx` - Detail view

### Components - Admin
- `frontend/src/components/Admin/GenerateCoupons.jsx` - Generation form
- `frontend/src/components/Admin/PrintCoupons.jsx` - Print panel
- `frontend/src/components/Admin/CouponLayout.jsx` - Print layout

### Services & Hooks
- `frontend/src/services/api.js` - Axios API client
- `frontend/src/hooks/useAsync.js` - Custom hooks

---

## 🐳 Docker Files

### Docker Configuration
- `docker/Dockerfile.backend` - Backend container image
- `docker/Dockerfile.frontend` - Frontend container image
- `docker/nginx.conf` - Nginx web server config
- `docker-compose.yml` - Multi-container orchestration
- `.env.docker` - Docker environment variables

---

## 📊 Database

### Schema
- Table: `coupons` (primary data table)
- Table: `settings` (for configuration)
- Indexes on: qr_secret, status, no_urut
- Collation: utf8mb4_unicode_ci (full Unicode support)

### Initialization
- Run: `npm run migrate` (backend)
- Or: `docker exec qurban-backend npm run migrate` (Docker)

---

## 🗂️ Directory Tree

```
d:\Project\Web\Qurban/
│
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── database/
│   │   │   ├── config.js
│   │   │   └── migrate.js
│   │   ├── models/
│   │   │   └── CouponModel.js
│   │   ├── controllers/
│   │   │   └── CouponController.js
│   │   ├── routes/
│   │   │   ├── coupons.js
│   │   │   └── dashboard.js
│   │   ├── middleware/          (for future use)
│   │   └── utils/               (for future use)
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ScannerPage.jsx
│   │   │   └── AdminPage.jsx
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
│   │   │   └── api.js
│   │   └── hooks/
│   │       └── useAsync.js
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .gitignore
│   └── README.md
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
├── docker-compose.yml
├── .env.docker
├── README.md                    (Main documentation)
├── SETUP.md                     (Installation guide)
├── BACKEND_API.md              (API documentation)
├── FRONTEND_DOCS.md            (Frontend guide)
├── QUICK_REFERENCE.md          (Developer cheat sheet)
└── FILE_INDEX.md               (This file)
```

---

## 🚀 Quick Start

### The Fastest Way to Run
```bash
# One command to rule them all
docker-compose up --build

# In another terminal
docker exec qurban-backend npm run migrate

# Open browser
http://localhost
```

### Manual Local Setup
```bash
# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: Frontend
cd frontend && npm install && npm run dev

# Terminal 3: Database (one time)
cd backend && npm run migrate
```

See [SETUP.md](./SETUP.md) for detailed instructions.

---

## 🔑 Key Concepts

### Project Architecture
- **3-Tier Architecture**: Frontend → Backend API → Database
- **REST API**: Express.js with JSON responses
- **Real-time Stats**: Automatic refresh every 30 seconds
- **Mobile-First**: Responsive design with Tailwind CSS
- **Container-Ready**: Docker Compose for production

### Data Flow

**Generation:**
```
Admin → Generate Form → API → Database (create coupons with qr_secret & no_urut)
```

**Registration:**
```
User Scan → QRScanner → Get Coupon (status: kosong) → Registration Form → 
API Update (status: terdaftar) → Store nama_penerima, rt, rw, alamat
```

**Pickup:**
```
User Scan → QRScanner → Get Coupon (status: terdaftar) → Detail View → 
Confirm Button → API Update (status: diambil, waktu_ambil) → 
Display Success/Error
```

### Status States
```
kosong → terdaftar → diambil
(empty)  (registered) (taken)
```

---

## 📋 Feature Checklist

- ✅ Dashboard with statistics cards
- ✅ Distribution progress chart (Recharts)
- ✅ Real-time statistics refresh
- ✅ QR Code generation with unique secrets
- ✅ Auto-incrementing coupon numbers
- ✅ Bulk coupon generation (1-1000)
- ✅ Mobile-friendly QR scanner
- ✅ Dynamic form based on coupon status
- ✅ Registration form with validation
- ✅ Coupon detail display
- ✅ Pickup confirmation
- ✅ A4 layout printing (10 per page)
- ✅ Background image upload
- ✅ PDF export functionality
- ✅ Database schema & migrations
- ✅ Comprehensive API endpoints
- ✅ Docker & Docker Compose setup
- ✅ Complete documentation

---

## 🛠️ Development Tips

### Adding Features
1. Backend: Add controller method + route
2. Frontend: Create component + API call
3. Test via API first (Postman/curl)
4. Integrate into frontend component

### Database Changes
1. Edit `backend/src/database/migrate.js`
2. Run: `npm run migrate`
3. Or Docker: `docker exec qurban-backend npm run migrate`

### Styling Changes
1. Edit `frontend/src/index.css` or component classes
2. Changes hot-reload automatically in dev
3. Build with: `npm run build` (production)

### API Testing
```bash
# All tools in QUICK_REFERENCE.md
curl http://localhost:5000/api/health
```

---

## 📖 Documentation Guide

| Task | Read This |
|------|-----------|
| Getting started | README.md |
| Installation | SETUP.md |
| API development | BACKEND_API.md |
| UI development | FRONTEND_DOCS.md |
| Quick answers | QUICK_REFERENCE.md |
| File locations | This file |

---

## 🎯 Next Steps

1. **Install**: Follow [SETUP.md](./SETUP.md)
2. **Run**: Use Docker or local development
3. **Test**: Generate test coupons & try features
4. **Customize**: Update masjid name, colors, settings
5. **Deploy**: Use Docker Compose in production
6. **Monitor**: Check logs & database

---

## 📞 Support Resources

- **Errors**: Check browser console (F12)
- **Logs**: `docker-compose logs -f`
- **Database**: Check tables with SQL queries
- **API**: Test endpoints in Postman
- **Performance**: Monitor with `docker stats`

---

## 📝 Version & Updates

- **Current Version**: 1.0.0
- **Created**: May 15, 2026
- **Last Updated**: May 15, 2026
- **Status**: Production Ready ✅

---

## 🎁 What You Get

✅ Fully functional fullstack application
✅ Clean, modular, maintainable code
✅ Comprehensive documentation
✅ Docker setup for easy deployment
✅ Mobile-friendly UI
✅ Real-time statistics dashboard
✅ QR code scanning & processing
✅ PDF export functionality
✅ Complete API documentation
✅ Developer cheat sheet

---

**Happy Coding! 🚀**

Start with [README.md](./README.md) → [SETUP.md](./SETUP.md) → Code!
