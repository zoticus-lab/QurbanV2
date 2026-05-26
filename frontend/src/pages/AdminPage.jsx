import React, { useState } from 'react';
import { Download, Plus, AlertCircle, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { authService, couponService } from '../services/api';
import GenerateCoupons from '../components/Admin/GenerateCoupons';
import PrintCoupons from '../components/Admin/PrintCoupons';

export default function AdminPage() {
  const [generatedCount, setGeneratedCount] = useState(0);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');
  const [dangerConfirmText, setDangerConfirmText] = useState('');
  const [dangerPassword, setDangerPassword] = useState('');
  const [dangerLoading, setDangerLoading] = useState(false);

  const handleGenerationSuccess = (count) => {
    setGeneratedCount(count);
    setMessage({
      type: 'success',
      text: `${count} kupon berhasil dibuat`
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleError = (error) => {
    setMessage({
      type: 'error',
      text: error
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteAllCoupons = async () => {
    const requiredText = 'HAPUS SEMUA DATA';

    if (dangerConfirmText.trim() !== requiredText) {
      handleError(`Ketik persis "${requiredText}" untuk melanjutkan.`);
      return;
    }

    if (!dangerPassword.trim()) {
      handleError('Password wajib diisi untuk konfirmasi ulang.');
      return;
    }

    try {
      setDangerLoading(true);
      await authService.verifyPassword(dangerPassword);
      await couponService.deleteAllCoupons();

      setMessage({
        type: 'success',
        text: 'Semua data kupon berhasil dihapus'
      });
      setDangerConfirmText('');
      setDangerPassword('');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Gagal menghapus semua kupon'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setDangerLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Generate dan cetak kupon kurban</p>
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
          {message.type === 'error' && <AlertCircle size={24} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 sm:px-6 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'generate'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Plus size={20} className="inline mr-2" />
          Generate Kupon
        </button>
        <button
          onClick={() => setActiveTab('print')}
          className={`px-4 sm:px-6 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'print'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Download size={20} className="inline mr-2" />
          Cetak & Download
        </button>
        <button
          onClick={() => setActiveTab('danger')}
          className={`px-4 sm:px-6 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'danger'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <AlertTriangle size={20} className="inline mr-2" />
          Menu Admin
        </button>
      </div>

      {/* Content */}
      {activeTab === 'generate' && (
        <GenerateCoupons onSuccess={handleGenerationSuccess} onError={handleError} />
      )}

      {activeTab === 'print' && (
        <PrintCoupons />
      )}

      {activeTab === 'danger' && (
        <div className="bg-white rounded-2xl shadow-md border border-red-200 p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
              <Trash2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Menu Admin Berisiko Tinggi</h2>
              <p className="text-gray-600 mt-1">
                Area ini dipakai untuk tindakan permanen. Backup dulu dari menu Manajemen Kupon sebelum lanjut.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-yellow-800 font-semibold">
                <AlertTriangle size={18} />
                Peringatan
              </div>
              <ul className="text-sm text-yellow-900 space-y-2 list-disc list-inside">
                <li>Data kupon akan terhapus permanen dari database.</li>
                <li>Gunakan tombol backup di menu Manajemen Kupon sebelum melanjutkan.</li>
                <li>Aksi ini hanya boleh dipakai oleh admin yang benar-benar berwenang.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-4">
              <div className="flex items-center gap-2 text-red-800 font-semibold">
                <Lock size={18} />
                Konfirmasi Ganda
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ketik <span className="font-bold">HAPUS SEMUA DATA</span>
                </label>
                <input
                  type="text"
                  value={dangerConfirmText}
                  onChange={(e) => setDangerConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="HAPUS SEMUA DATA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password admin
                </label>
                <input
                  type="password"
                  value={dangerPassword}
                  onChange={(e) => setDangerPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Masukkan password ulang"
                />
              </div>

              <button
                onClick={handleDeleteAllCoupons}
                disabled={dangerLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold transition-colors"
              >
                <Trash2 size={18} />
                {dangerLoading ? 'Memproses...' : 'Hapus Semua Kupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
