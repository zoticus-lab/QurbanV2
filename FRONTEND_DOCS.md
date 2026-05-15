# Frontend Documentation

## Overview
Frontend Sistem Manajemen Kurban adalah aplikasi React yang dibangun dengan Vite dan Tailwind CSS. Aplikasi menyediakan interface untuk:
- Dashboard dengan statistik real-time
- Scanner QR Code (mobile-friendly)
- Admin panel untuk generate dan cetak kupon

## Tech Stack
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.3.6
- **Icons**: Lucide React 0.292.0
- **QR Code**: html5-qrcode 2.3.4, qrcode.js 1.0.0
- **PDF Export**: jsPDF 2.5.1, html2canvas 1.4.1
- **Charts**: Recharts 2.10.3
- **HTTP Client**: Axios 1.6.2

## Installation & Setup

### Prerequisites
- Node.js v18+
- npm or yarn

### Setup Steps

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:5173
```

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx                       # React entry point
│   ├── App.jsx                        # Main app component with routing
│   ├── index.css                      # Global styles
│   ├── pages/
│   │   ├── DashboardPage.jsx         # Dashboard page
│   │   ├── ScannerPage.jsx           # QR Scanner page
│   │   └── AdminPage.jsx             # Admin panel page
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── StatisticCard.jsx     # Stat card component
│   │   │   └── DistributionChart.jsx # Bar chart component
│   │   ├── Scanner/
│   │   │   ├── QRScanner.jsx         # QR scanner component
│   │   │   ├── RegistrationForm.jsx  # Registration form
│   │   │   └── CouponDetail.jsx      # Coupon detail display
│   │   └── Admin/
│   │       ├── GenerateCoupons.jsx   # Generate form
│   │       ├── PrintCoupons.jsx      # Print/export panel
│   │       └── CouponLayout.jsx      # Coupon layout for printing
│   ├── services/
│   │   └── api.js                    # Axios API client
│   └── hooks/
│       └── useAsync.js               # Custom async hooks
├── index.html                         # HTML template
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── package.json
└── .gitignore
```

## Component Documentation

### Pages

#### DashboardPage
Main dashboard page displaying statistics and progress.

**Features:**
- 4 statistics cards (Total, Active, Distributed, Remaining)
- Distribution progress chart
- Real-time statistics with 30-second auto-refresh
- Progress bars for each status

**Props:** None (fetches data from API)

**Usage:**
```jsx
import DashboardPage from './pages/DashboardPage';
<DashboardPage />
```

#### ScannerPage
QR code scanner interface for penerima kurban.

**Features:**
- Real-time QR code scanning
- Dynamic forms based on coupon status
- Registration form for new coupons
- Confirmation dialog for pickup
- Mobile-friendly interface

**States:**
- `scan`: QR scanner active
- `register`: Registration form (status: kosong)
- `detail`: Coupon details (status: terdaftar/diambil)

#### AdminPage
Admin panel for managing coupons.

**Features:**
- Generate multiple coupons
- Upload custom background image
- Print preview in A4 layout (10 per page)
- PDF download functionality

### Components

#### Dashboard Components

**StatisticCard**
```jsx
<StatisticCard
  icon={<PackageOpen size={28} />}
  label="Total Kupon"
  value={500}
  bgColor="bg-blue-50"
  iconColor="text-blue-600"
/>
```

**DistributionChart**
```jsx
<DistributionChart 
  data={[
    { status: 'kosong', count: 200 },
    { status: 'terdaftar', count: 150 },
    { status: 'diambil', count: 150 }
  ]}
/>
```

#### Scanner Components

**QRScanner**
```jsx
<QRScanner 
  onScanSuccess={(decodedText) => {
    console.log('Scanned:', decodedText);
  }}
/>
```

**RegistrationForm**
```jsx
<RegistrationForm
  qr_secret="abc123..."
  no_urut={1}
  onSubmit={(formData) => {
    // Handle form submission
  }}
  onCancel={() => {
    // Handle cancel
  }}
/>
```

**CouponDetail**
```jsx
<CouponDetail
  coupon={couponData}
  onConfirmPickup={() => {
    // Handle confirmation
  }}
  onScanAgain={() => {
    // Reset to scanner
  }}
/>
```

#### Admin Components

**GenerateCoupons**
```jsx
<GenerateCoupons
  onSuccess={(count) => {
    // Handle success
  }}
  onError={(error) => {
    // Handle error
  }}
/>
```

**PrintCoupons**
```jsx
<PrintCoupons />
```

**CouponLayout**
```jsx
<CouponLayout
  coupons={couponsArray}
  backgroundImage={imageDataUrl}
/>
```

## Services

### api.js
Centralized API client using Axios.

**Exported Methods:**

```javascript
// Coupon services
couponService.generateCoupons(count)
couponService.getCoupon(qr_secret)
couponService.getAllCoupons(limit, offset)
couponService.registerCoupon(qr_secret, nama_penerima, rt, rw, alamat)
couponService.confirmPickup(qr_secret)
couponService.getQRImage(qr_secret)

// Dashboard services
dashboardService.getStatistics()

// Health check
healthCheck()
```

## Custom Hooks

### useAsync
Generic hook for async operations.

```javascript
const { execute, status, value, error } = useAsync(asyncFunction, immediate);

// Statuses: 'idle', 'pending', 'success', 'error'
```

### useFetch
Hook for data fetching.

```javascript
const { data, loading, error } = useFetch(url);
```

## Styling

### Tailwind CSS Classes

Common utility classes used throughout:
```css
/* Colors */
bg-green-600, bg-blue-50, bg-red-50, text-gray-900

/* Spacing */
p-6, px-4, py-3, gap-4, mb-8

/* Typography */
text-4xl, font-bold, font-semibold, text-center

/* Layout */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4
flex items-center justify-between
rounded-lg shadow-md
```

### Custom Colors
Configured in `tailwind.config.js`:
```javascript
colors: {
  primary: '#10b981',    // Green
  secondary: '#8b5cf6',  // Purple
}
```

## API Integration

### Configuration
API base URL configured in Vite proxy:
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  }
}
```

### Error Handling
All API calls include error handling:
```javascript
try {
  const response = await couponService.getCoupon(qrSecret);
  // Handle success
} catch (error) {
  const errorMsg = error.response?.data?.error || 'Unknown error';
  // Handle error
}
```

## Mobile Responsiveness

Responsive design using Tailwind breakpoints:
- `sm`: 640px (mobile)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)

Example:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Responsive grid */}
</div>
```

## Performance Optimization

1. **Code Splitting**: Vite automatically splits code by route
2. **Image Optimization**: Inline SVGs with Lucide React
3. **CSS Purging**: Tailwind automatically purges unused CSS
4. **Lazy Loading**: React components lazy load on route change

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

**Note:** QR Scanner requires camera access

## Development Tips

### Hot Module Replacement (HMR)
Vite provides fast HMR - changes are reflected instantly.

### Debugging
1. Open DevTools (F12)
2. Check Network tab for API calls
3. Check Console for errors
4. Use React DevTools browser extension

### Adding New Pages
```jsx
// 1. Create page component
// src/pages/NewPage.jsx

// 2. Import in App.jsx
// import NewPage from './pages/NewPage';

// 3. Add to routing switch
// case 'newpage': return <NewPage />;

// 4. Add nav button in sidebar
// <NavButton label="New Page" ... />
```

### Adding New API Endpoints
```javascript
// 1. Add method in src/services/api.js
export const newService = {
  doSomething: (params) => api.post('/new-endpoint', params),
};

// 2. Use in component
// import { newService } from '../services/api';
// const response = await newService.doSomething(data);
```

## Deployment

### Docker
```bash
# Build and run frontend
docker build -f docker/Dockerfile.frontend -t qurban-frontend .
docker run -p 80:80 qurban-frontend
```

### Docker Compose
```bash
docker-compose up frontend
```

### Nginx Configuration
Static files served via Nginx with:
- API proxy to backend
- React Router fallback
- Cache headers for assets
- Gzip compression

## Testing Checklist

- [ ] Dashboard loads with statistics
- [ ] Statistics refresh every 30 seconds
- [ ] QR Scanner works on mobile
- [ ] Can scan valid QR code
- [ ] Registration form validates input
- [ ] Can confirm pickup
- [ ] Cannot double-confirm pickup
- [ ] Admin can generate coupons
- [ ] Print layout displays correctly
- [ ] PDF downloads successfully
- [ ] Navigation between pages works
- [ ] Error messages display clearly
- [ ] Responsive on mobile/tablet

## Troubleshooting

### QR Scanner Not Working
- Allow camera access when prompted
- Use HTTPS in production
- Check browser console for errors
- Ensure `html5-qrcode` is installed

### API Calls Failing
- Check backend is running (`npm run dev` in backend folder)
- Verify API base URL in vite.config.js
- Check Network tab in DevTools
- Look for CORS errors

### Styling Issues
- Clear browser cache
- Rebuild: `npm run build`
- Check Tailwind config
- Verify CSS file imports

### PDF Generation Issues
- Install `html2canvas`: `npm install html2canvas`
- Check browser console for errors
- Ensure jsPDF is loaded

## Environment Variables

Create `.env` file if needed:
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME="Sistem Manajemen Kurban"
```

Access in components:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

**Last Updated**: May 15, 2026
**Version**: 1.0.0
