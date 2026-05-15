import React, { useState, useEffect } from 'react';
import { Home, QrCode, BarChart3, Settings, LogOut, User } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (currentPage === 'admin' && currentUser?.role !== 'admin') {
      return (
        <div className="p-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            🔒 Anda tidak memiliki akses ke halaman Admin
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'scanner':
        return <ScannerPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-gradient-to-b from-green-700 to-green-800 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Qurban</h1>
          <p className="text-green-200 text-sm">Sistem Manajemen Kurban</p>
        </div>

        <div className="space-y-2 flex-1">
          <NavButton
            icon={<Home size={20} />}
            label="Dashboard"
            active={currentPage === 'dashboard'}
            onClick={() => setCurrentPage('dashboard')}
          />
          <NavButton
            icon={<QrCode size={20} />}
            label="Scanner"
            active={currentPage === 'scanner'}
            onClick={() => setCurrentPage('scanner')}
          />
          {currentUser?.role === 'admin' && (
            <NavButton
              icon={<Settings size={20} />}
              label="Admin"
              active={currentPage === 'admin'}
              onClick={() => setCurrentPage('admin')}
            />
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="border-t border-green-600 pt-4 space-y-3">
          <div className="px-4 py-3 bg-green-700 rounded-lg">
            <p className="text-xs text-green-200 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-white">{currentUser?.username}</p>
            <p className="text-xs text-green-200">{currentUser?.role}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-green-100 hover:bg-red-600 rounded-lg transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <div className="text-green-200 text-xs pt-4">
          <p>© 2026 Sistem Kurban</p>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
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
