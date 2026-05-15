import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { couponService } from '../../services/api';

export default function GenerateCoupons({ onSuccess, onError }) {
  const [count, setCount] = useState('10');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const numCount = parseInt(count);
    if (isNaN(numCount) || numCount < 1 || numCount > 1000) {
      onError('Jumlah kupon harus antara 1 dan 1000');
      return;
    }

    setLoading(true);
    try {
      const response = await couponService.generateCoupons(numCount);
      onSuccess(numCount);
      setCount('10');
    } catch (error) {
      onError(error.response?.data?.error || 'Gagal membuat kupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Buat Kupon Baru</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Kupon yang Ingin Dibuat
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              placeholder="Contoh: 50"
            />
            <p className="text-xs text-gray-500 mt-2">Maksimal 1000 kupon per sekali generate</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Membuat Kupon...
              </>
            ) : (
              'Generate Kupon'
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Nomor urut kupon akan otomatis increment</li>
            <li>• Setiap kupon mendapat QR code unik</li>
            <li>• Status awal kupon adalah "Kosong"</li>
            <li>• Kupon dapat dicetak setelah dibuat</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Informasi Proses</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Sebelum Generate</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>✓ Pastikan database sudah terhubung</li>
              <li>✓ Tentukan jumlah kupon yang akan dibuat</li>
              <li>✓ Siapkan background image jika diperlukan</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <h4 className="font-semibold text-green-900 mb-2">✅ Setelah Generate</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Kupon siap untuk dicetak</li>
              <li>✓ Dapat dicetak dalam layout A4 (10 per lembar)</li>
              <li>✓ QR code sudah terintegrasi otomatis</li>
              <li>✓ Format: [No]/RW[rw]/RT[rt]/[Tgl]/[Nama Masjid]</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
