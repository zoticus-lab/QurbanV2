# 🚀 Quick Reference Guide

## One-Liner Commands

### Docker Setup
```bash
# Full stack in one command
docker-compose up --build

# Stop everything
docker-compose down

# Reset everything (delete data)
docker-compose down -v

# View live logs
docker-compose logs -f
```

### Local Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Terminal 3: Database init (one time only)
cd backend && npm run migrate
```

## API Quick Tests

### Login & Auth
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Save token
$token = "your_token_here"

# Verify token
curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Authorization: Bearer $token"

# Get profile
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $token"

# Change password
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"admin123","newPassword":"newpass123"}'
```

### Generate Test Data
```bash
# Need token first!
$token = "your_token_here"

# Generate 50 coupons
curl -X POST http://localhost:5000/api/coupons/generate \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

### Check Health
```bash
# Backend health
curl http://localhost:5000/api/health

# Get statistics
curl http://localhost:5000/api/dashboard/stats
```

### Scanner Test (PowerShell)
```powershell
# Save QR secret from generate response, then:
$qrSecret = "your_qr_secret_here"

# Get coupon
curl -X GET "http://localhost:5000/api/coupons/$qrSecret"

# Register
curl -X POST http://localhost:5000/api/coupons/register `
  -H "Content-Type: application/json" `
  -d @- <<'EOF'
{
  "qr_secret": "$qrSecret",
  "nama_penerima": "Test User",
  "rt": "01",
  "rw": "02",
  "alamat": "Test Address"
}
EOF

# Confirm pickup
curl -X POST http://localhost:5000/api/coupons/confirm-pickup `
  -H "Content-Type: application/json" `
  -d "{`"qr_secret`": `"$qrSecret`"}"
```

## Database Quick Queries

### Docker MySQL
```bash
docker exec qurban-mysql mysql -u root -p qurban_db
```

### Local MySQL
```bash
mysql -u root -p qurban_db
```

### Useful Queries
```sql
-- View all coupons
SELECT * FROM coupons LIMIT 10;

-- Statistics
SELECT status, COUNT(*) FROM coupons GROUP BY status;

-- Find by QR secret
SELECT * FROM coupons WHERE qr_secret = 'abc123...';

-- Reset database
DELETE FROM coupons;

-- Check table structure
DESCRIBE coupons;
```

## Development Workflow

### Adding New API Endpoint

1. **Create Controller Method** (backend/src/controllers/CouponController.js)
```javascript
static async newMethod(req, res) {
  try {
    // Your logic
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

2. **Add Route** (backend/src/routes/coupons.js)
```javascript
router.post('/new-endpoint', CouponController.newMethod);
```

3. **Update Model if needed** (backend/src/models/CouponModel.js)
```javascript
static async newQuery() {
  const conn = await pool.getConnection();
  try {
    // Your query
    return result;
  } finally {
    conn.release();
  }
}
```

4. **Add Service Client** (frontend/src/services/api.js)
```javascript
export const couponService = {
  newMethod: (params) => api.post('/coupons/new-endpoint', params),
};
```

5. **Use in Component**
```javascript
const response = await couponService.newMethod(data);
```

### Adding New Frontend Component

1. **Create Component** (frontend/src/components/Feature/MyComponent.jsx)
```jsx
export default function MyComponent({ prop1, prop2 }) {
  return <div>Component</div>;
}
```

2. **Import in Page** (frontend/src/pages/SomePage.jsx)
```jsx
import MyComponent from '../components/Feature/MyComponent';
```

3. **Use Component**
```jsx
<MyComponent prop1={value1} prop2={value2} />
```

## File Editing Tips

### Environment Files
- Backend: `backend/.env`
- Frontend: `frontend/.env` (optional)
- Docker: `.env.docker`

### Configuration Files
- Vite: `frontend/vite.config.js`
- Tailwind: `frontend/tailwind.config.js`
- Docker: `docker-compose.yml`

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| Port 5000 in use | `lsof -i :5000` then `kill -9 <PID>` |
| Database locked | Restart MySQL service |
| React components not updating | Check for missing `useState` import |
| API 404 error | Verify route exists in `routes/` folder |
| CORS error | Check `CORS_ORIGIN` in `.env` |
| Camera access denied | Check browser permissions |
| PDF won't generate | Install html2canvas: `npm install html2canvas` |

## Performance Commands

```bash
# Check what's taking up space
docker system df

# Clean up unused images
docker image prune

# Remove all stopped containers
docker container prune

# View Docker resource usage
docker stats
```

## Useful Tools

- **API Testing**: Postman, Insomnia, curl
- **Database GUI**: MySQL Workbench, DBeaver
- **Code Editor**: VS Code (recommended)
- **Browser Dev Tools**: Chrome DevTools (F12)
- **QR Code Generator**: Online tool or `qrcode` library

## Resource Limits

### Docker Container Resources
```yaml
services:
  backend:
    mem_limit: 512M      # Memory limit
    memswap_limit: 512M  # No swap
    cpus: '1'            # CPU limit
```

## Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations run
- [ ] API health check passes
- [ ] Frontend builds without errors
- [ ] Docker images built successfully
- [ ] All containers healthy
- [ ] SSL/HTTPS configured (production)
- [ ] Backups automated
- [ ] Monitoring enabled
- [ ] Error logging configured

## URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Development frontend |
| Frontend Prod | http://localhost | Production frontend |
| Backend | http://localhost:5000 | API server |
| MySQL | localhost:3306 | Database |
| Health Check | http://localhost:5000/api/health | Server status |
| API Base | http://localhost:5000/api | API endpoints |

## Git Commands (if using version control)

```bash
# Initialize repo
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Sistem Manajemen Kurban"

# Create branch for feature
git checkout -b feature/new-feature

# Merge back to main
git checkout main
git merge feature/new-feature
```

## Testing Endpoints with Postman

1. **Import Collection**
   - Open Postman
   - Create new collection
   - Add requests:

```
POST http://localhost:5000/api/coupons/generate
{
  "count": 50
}

GET http://localhost:5000/api/coupons?limit=10

GET http://localhost:5000/api/dashboard/stats
```

2. **Set up Environment Variables**
   - BASE_URL: http://localhost:5000
   - QR_SECRET: abc123...

## Monitoring Commands

```bash
# Watch Docker logs in real-time
watch docker-compose ps

# Check CPU/Memory
docker stats

# View network
docker network ls
docker network inspect qurban-network

# Check volumes
docker volume ls
docker volume inspect qurban_mysql_data
```

---

**Last Updated**: May 15, 2026

💡 **Pro Tip**: Bookmark this file for quick reference!
