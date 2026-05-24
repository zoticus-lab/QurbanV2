import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, Save, SkipForward, Upload, Image as ImageIcon, X } from 'lucide-react';

export default function RegistrationFormPage() {
  const [currentCoupon, setCurrentCoupon] = useState(null);
  const [formData, setFormData] = useState({
    nama_penerima: '',
    rt: '',
    rw: '',
    alamat: '',
    photo_penerima: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    remaining: 0
  });
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE = '/api'; // Gunakan relative path agar Vite Proxy bisa menangani HTTPS ke HTTP
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Load next unregistered coupon
  useEffect(() => {
    loadNextCoupon();
  }, []);

  const loadNextCoupon = async () => {
    try {
      setLoading(true);
      // Get all coupons and find first unregistered one
      const response = await axios.get(`${API_BASE}/coupons?limit=1000`, config);
      
      if (response.data.success && response.data.data.data) {
        const coupons = response.data.data.data;
        
        // Calculate stats
        const registered = coupons.filter(c => c.status !== 'kosong').length;
        setStats({
          total: coupons.length,
          registered: registered,
          remaining: coupons.length - registered
        });

        // Find first unregistered coupon (status = 'kosong')
        const unregistered = coupons.find(c => c.status === 'kosong');
        
        if (unregistered) {
          setCurrentCoupon(unregistered);
          setFormData({
            nama_penerima: unregistered.nama_penerima || '',
            rt: unregistered.rt || '',
            rw: unregistered.rw || '',
                alamat: unregistered.alamat || '',
                photo_penerima: unregistered.photo_penerima || null
          });
          setSuccessMessage('');
        } else {
          setCurrentCoupon(null);
        }
      }
    } catch (error) {
      console.error('Error loading coupon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, photo_penerima: compressedDataUrl }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentCoupon) return;

    // Validation
    if (!formData.nama_penerima.trim()) {
      alert('Nama penerima harus diisi');
      return;
    }
    if (!formData.alamat.trim()) {
      alert('Alamat harus diisi');
      return;
    }

    try {
      setSaving(true);
      
      // Update coupon with registration data
      await axios.put(
        `${API_BASE}/coupons/${currentCoupon.id}`,
        {
          status: 'terdaftar',
          nama_penerima: formData.nama_penerima.trim(),
          rt: formData.rt.trim(),
          rw: formData.rw.trim(),
          alamat: formData.alamat.trim(),
          photo_penerima: formData.photo_penerima
        },
        config
      );

      setSuccessMessage(`✅ Kupon #${currentCoupon.no_urut} berhasil didaftarkan ke ${formData.nama_penerima}`);
      
      // Load next coupon after delay
      setTimeout(() => {
        loadNextCoupon();
      }, 1500);

    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Gagal menyimpan kupon: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!currentCoupon) return;
    
    setSuccessMessage(`⏭️ Kupon #${currentCoupon.no_urut} dilewati`);
    
    setTimeout(() => {
      loadNextCoupon();
    }, 1000);
  };

  const handleClear = () => {
    setFormData({
      nama_penerima: '',
      rt: '',
      rw: '',
    alamat: '',
    photo_penerima: null
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Pendaftaran Kupon</h1>
          <p className="text-gray-600">Daftarkan penerima kupon secara berurutan dari nomor urut terkecil</p>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Total Kupon</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-100 rounded-lg shadow p-4">
            <p className="text-sm text-green-700 font-medium mb-1">Terdaftar</p>
            <p className="text-3xl font-bold text-green-700">{stats.registered}</p>
          </div>
          <div className="bg-blue-100 rounded-lg shadow p-4">
            <p className="text-sm text-blue-700 font-medium mb-1">Sisa Daftar</p>
            <p className="text-3xl font-bold text-blue-700">{stats.remaining}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress Pendaftaran</span>
            <span className="text-sm font-bold text-green-600">
              {stats.total > 0 ? Math.round((stats.registered / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.registered / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {currentCoupon ? (
          <>
            {/* Current Coupon Info */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Kupon Saat Ini</p>
                  <h2 className="text-4xl font-bold text-blue-600">#{currentCoupon.no_urut}</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">QR Secret</p>
                  <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded break-all">
                    {currentCoupon.qr_secret}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    name="nama_penerima"
                    value={formData.nama_penerima}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap penerima"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RT
                    </label>
                    <input
                      type="text"
                      name="rt"
                      value={formData.rt}
                      onChange={handleInputChange}
                      placeholder="RT"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RW
                    </label>
                    <input
                      type="text"
                      name="rw"
                      value={formData.rw}
                      onChange={handleInputChange}
                      placeholder="RW"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat *
                  </label>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat lengkap"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Penerima (Opsional)
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition flex flex-col items-center justify-center min-h-[160px] overflow-hidden group">
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              {formData.photo_penerima ? (
                <>
                  <img src={formData.photo_penerima} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  <button type="button" onClick={(e) => { e.preventDefault(); setFormData(prev => ({...prev, photo_penerima: null})); }} className="relative z-20 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-md">
                    <X size={20} />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="text-gray-400 mb-2" size={32} />
                  <span className="text-sm font-medium text-gray-600">Pilih Foto / Ambil Gambar</span>
                </>
              )}
            </div>
          </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-700 font-medium">{successMessage}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 min-w-0 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  <Save size={20} />
                  {saving ? 'Menyimpan...' : 'Simpan & Lanjut'}
                </button>

                <button
                  onClick={handleSkip}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium transition-all sm:shrink-0"
                >
                  <SkipForward size={20} />
                  Lewati
                </button>

                <button
                  onClick={handleClear}
                  className="inline-flex items-center justify-center gap-2 self-start sm:self-auto px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-all text-sm sm:text-base sm:shrink-0"
                >
                  <X size={16} />
                  Bersihkan
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="mb-4 text-5xl">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Semua Kupon Terdaftar!</h3>
            <p className="text-gray-600 mb-6">
              Congratulations! Semua {stats.total} kupon telah berhasil didaftarkan kepada penerimanya.
            </p>
            <button
              onClick={loadNextCoupon}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
