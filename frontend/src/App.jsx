import React, { useState, useEffect } from 'react';
import { Home, QrCode, BarChart3, Settings, LogOut, User, FileText, ClipboardList, Menu, X, Wallet } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import AdminPage from './pages/AdminPage';
import CouponManagementPage from './pages/CouponManagementPage';
import RegistrationFormPage from './pages/RegistrationFormPage';
import LoginPage from './pages/LoginPage';
import FinancePage from './pages/FinancePage';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user, token) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    // Check role-based access
    if ((currentPage === 'admin' || currentPage === 'coupons' || currentPage === 'registration' || currentPage === 'finance') && currentUser?.role !== 'admin') {
      return (
        <div className="p-4 md:p-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            🔒 Anda tidak memiliki akses ke halaman ini
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'scanner':
        return <ScannerPage />;
      case 'registration':
        return <RegistrationFormPage />;
      case 'admin':
        return <AdminPage />;
      case 'coupons':
        return <CouponManagementPage />;
      case 'finance':
        return <FinancePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-green-700 text-white flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Qurban</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-green-600 rounded-lg transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-green-700 to-green-800 text-white p-6 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Qurban</h1>
            <p className="text-green-200 text-sm">Sistem Manajemen Kurban</p>
          </div>
          <button 
            className="md:hidden text-green-200 hover:text-white p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          <NavButton
            icon={<Home size={20} />}
            label="Dashboard"
            active={currentPage === 'dashboard'}
            onClick={() => handleNavClick('dashboard')}
          />
          <NavButton
            icon={<QrCode size={20} />}
            label="Scanner"
            active={currentPage === 'scanner'}
            onClick={() => handleNavClick('scanner')}
          />
          {currentUser?.role === 'admin' && (
            <>
              <NavButton
                icon={<ClipboardList size={20} />}
                label="Pendaftaran Kupon"
                active={currentPage === 'registration'}
                onClick={() => handleNavClick('registration')}
              />
              <NavButton
                icon={<Wallet size={20} />}
                label="Buku Kas (Keuangan)"
                active={currentPage === 'finance'}
                onClick={() => handleNavClick('finance')}
              />
              <NavButton
                icon={<FileText size={20} />}
                label="Manajemen Kupon"
                active={currentPage === 'coupons'}
                onClick={() => handleNavClick('coupons')}
              />
              <NavButton
                icon={<Settings size={20} />}
                label="Admin"
                active={currentPage === 'admin'}
                onClick={() => handleNavClick('admin')}
              />
            </>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="border-t border-green-600 pt-4 space-y-3 mt-4">
          <div className="px-4 py-3 bg-green-700 rounded-lg">
            <p className="text-xs text-green-200 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">{currentUser?.username}</p>
            <p className="text-xs text-green-200 capitalize">{currentUser?.role}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-green-100 hover:bg-red-600 rounded-lg transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <div className="text-green-200 text-xs pt-4 text-center">
          <p>© 2026 Sistem Kurban</p>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto md:pt-0 pt-16 h-full">
        {renderPage()}
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        active
          ? 'bg-white text-green-700 font-semibold'
          : 'text-green-100 hover:bg-green-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default App;
