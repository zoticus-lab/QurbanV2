import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { couponService } from '../services/api';
import QRScanner from '../components/Scanner/QRScanner';
import RegistrationForm from '../components/Scanner/RegistrationForm';
import CouponDetail from '../components/Scanner/CouponDetail';

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [step, setStep] = useState('scan'); // scan, register, detail
  const [successPopup, setSuccessPopup] = useState({ visible: false, seconds: 0, title: '' });
  const successTimerRef = useRef(null);
  const successIntervalRef = useRef(null);

  const clearSuccessTimers = () => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    if (successIntervalRef.current) {
      clearInterval(successIntervalRef.current);
      successIntervalRef.current = null;
    }
  };

  const returnToScanner = () => {
    clearSuccessTimers();
    setScanResult(null);
    setCouponData(null);
    setStep('scan');
    setMessage(null);
    setSuccessPopup({ visible: false, seconds: 0, title: '' });
  };

  const handleScanSuccess = async (decodedText) => {
    setLoading(true);
    setScanResult(decodedText);
    
    try {
      const response = await couponService.getCoupon(decodedText);
      setCouponData(response.data.data);
      
      if (response.data.data.status === 'kosong') {
        setStep('register');
      } else {
        setStep('detail');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Kupon tidak ditemukan'
      });
      setScanResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (formData) => {
    setLoading(true);
    try {
      const response = await couponService.registerCoupon(
        scanResult,
        formData.nama_penerima,
        formData.rt,
        formData.rw,
        formData.alamat
      );
      
      setCouponData(response.data.data);
      setMessage({
        type: 'success',
        text: 'Kupon berhasil didaftarkan'
      });
      
      successTimerRef.current = setTimeout(returnToScanner, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Gagal mendaftarkan kupon'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async () => {
    setLoading(true);
    try {
      const response = await couponService.confirmPickup(scanResult);
      
      setCouponData(response.data.data);
      clearSuccessTimers();
      const duration = 6;
      setSuccessPopup({
        visible: true,
        seconds: duration,
        title: 'DAGING BERHASIL DIKONFIRMASI'
      });
      setMessage({
        type: 'success',
        text: 'Pengambilan daging berhasil dikonfirmasi.'
      });

      successIntervalRef.current = setInterval(() => {
        setSuccessPopup((prev) => {
          if (!prev.visible) return prev;
          const nextSeconds = prev.seconds - 1;
          if (nextSeconds <= 0) {
            clearSuccessTimers();
            returnToScanner();
            return { visible: false, seconds: 0, title: '' };
          }
          return { ...prev, seconds: nextSeconds };
        });
      }, 1000);

      successTimerRef.current = setTimeout(returnToScanner, duration * 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Gagal mengkonfirmasi pengambilan'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    returnToScanner();
  };

  useEffect(() => {
    return () => clearSuccessTimers();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Scanner QR</h1>
        <p className="text-gray-600 mt-2">Scan kupon untuk registrasi atau konfirmasi pengambilan</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
            <p className="text-gray-600">Memproses...</p>
          </div>
        </div>
      )}

      {!loading && step === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Scan QR Code</h2>
            <QRScanner onScanSuccess={handleScanSuccess} />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Informasi Scanner</h3>
            <div className="space-y-3 text-gray-700">
              <p>📱 Gunakan kamera untuk memindai QR code pada kupon</p>
              <p>✅ Jika kupon belum terdaftar, sistem akan membuka form registrasi</p>
              <p>📝 Isi data penerima (Nama, RT, RW, Alamat)</p>
              <p>🎁 Klik "Konfirmasi Ambil" ketika pengambilan daging</p>
              <p>⚠️ Sistem akan mencegah pengambilan ganda</p>
            </div>
          </div>
        </div>
      )}

      {!loading && step === 'register' && scanResult && couponData && (
        <RegistrationForm
          qr_secret={scanResult}
          no_urut={couponData.no_urut}
          onSubmit={handleRegistration}
          onCancel={handleReset}
        />
      )}

      {!loading && step === 'detail' && scanResult && couponData && (
        <CouponDetail
          coupon={couponData}
          onConfirmPickup={handleConfirmPickup}
          onScanAgain={handleReset}
          pickupFlowActive={successPopup.visible}
        />
      )}

      {successPopup.visible && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-6 sm:p-7 text-center shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto">
            <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckCircle size={42} />
            </div>
            <h2 className="text-3xl sm:text-2xl font-black text-green-700 mb-3 leading-tight">
              {successPopup.title}
            </h2>
            <p className="text-gray-700 mb-5 text-base sm:text-sm leading-relaxed">
              Konfirmasi berhasil disimpan. Layar akan kembali ke scanner dalam{' '}
              <span className="font-bold text-gray-900 text-lg">{successPopup.seconds}</span>{' '}
              detik.
            </p>
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-600 transition-all duration-1000 ease-linear"
                style={{ width: `${(successPopup.seconds / 6) * 100}%` }}
              />
            </div>
            <p className="mt-4 text-xs sm:text-[11px] text-gray-500">
              Mohon tunggu sebentar sampai otomatis kembali ke scanner.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
