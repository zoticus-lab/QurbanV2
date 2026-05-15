import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function CouponDetail({ coupon, onConfirmPickup, onScanAgain }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (coupon.status === 'diambil') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-red-600 mt-1 flex-shrink-0" size={32} />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-red-900 mb-2">⚠️ Daging Sudah Diambil!</h3>
              <p className="text-red-800 text-lg">
                Kupon ini telah diambil pada: <strong>{formatDate(coupon.waktu_ambil)}</strong>
              </p>
              <p className="text-red-700 text-sm mt-2">
                Tidak dapat melakukan pengambilan ganda. Silakan scan kupon lain.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onScanAgain}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
        >
          ← Scan Kupon Lainnya
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
        <div>
          <h3 className="font-semibold text-green-900 mb-1">Kupon Sudah Terdaftar</h3>
          <p className="text-green-800 text-sm">Silakan konfirmasi pengambilan daging atau scan kupon lain.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
        {/* Detail Penerima */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Penerima</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Nomor Urut</p>
              <p className="text-2xl font-bold text-gray-900">#{coupon.no_urut}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-medium">Nama Penerima</p>
              <p className="text-xl font-semibold text-gray-900">{coupon.nama_penerima}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">RT</p>
                <p className="text-lg font-semibold text-gray-900">{coupon.rt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">RW</p>
                <p className="text-lg font-semibold text-gray-900">{coupon.rw}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-medium">Alamat</p>
              <p className="text-gray-900">{coupon.alamat}</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Status</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✓ {coupon.status === 'terdaftar' ? 'Terdaftar' : coupon.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            onClick={onConfirmPickup}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-all text-lg"
          >
            🎁 Konfirmasi Ambil Daging
          </button>
          <button
            onClick={onScanAgain}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-4 px-6 rounded-lg transition-all"
          >
            ← Scan Lagi
          </button>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>📌 Catatan:</strong> Klik "Konfirmasi Ambil" ketika penerima sudah mengambil daging mereka. Status akan berubah menjadi "Diambil" dan tidak dapat dirubah lagi.
          </p>
        </div>
      </div>
    </div>
  );
}
