import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
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
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  register: (username, email, password, role = 'scanner') => 
    api.post('/auth/register', { username, email, password, role }),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { oldPassword, newPassword }),
  
  listUsers: () => 
    api.get('/auth/users'),
  
  deactivateUser: (userId) => 
    api.post(`/auth/users/${userId}/deactivate`),
  
  verifyToken: (token) => 
    api.post('/auth/verify-token', { token }),
};

// Coupon endpoints
export const couponService = {
  generateCoupons: (count) => 
    api.post('/coupons/generate', { count }),
  
  getCoupon: (qr_secret) => 
    api.get(`/coupons/${qr_secret}`),
  
  getAllCoupons: (limit = 100, offset = 0) => 
    api.get('/coupons', { params: { limit, offset } }),
  
  registerCoupon: (qr_secret, nama_penerima, rt, rw, alamat) => 
    api.post('/coupons/register', { qr_secret, nama_penerima, rt, rw, alamat }),
  
  confirmPickup: (qr_secret) => 
    api.post('/coupons/confirm-pickup', { qr_secret }),
  
  getQRImage: (qr_secret) => 
    api.get(`/coupons/qr/${qr_secret}`),
};

// Dashboard endpoints
export const dashboardService = {
  getStatistics: () => 
    api.get('/dashboard/stats'),
};

// Health check
export const healthCheck = () => 
  api.get('/health');

export default api;
