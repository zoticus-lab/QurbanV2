import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function CouponDetail({ coupon, onConfirmPickup, onScanAgain, successHoldSeconds = 0, pickupFlowActive = false }) {
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

  const isDiambil = coupon.status === 'diambil';

  return (
    <div className="max-w-2xl mx-auto">
      {isDiambil ? (
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
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">Kupon Sudah Terdaftar</h3>
            <p className="text-green-800 text-sm">Silakan konfirmasi pengambilan daging atau scan kupon lain.</p>
          </div>
        </div>
      )}

      {pickupFlowActive && (
        <div className="bg-green-600 text-white rounded-lg p-5 mb-6 shadow-lg border border-green-700">
          <div className="flex items-start gap-3">
            <CheckCircle size={28} className="flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xl font-bold mb-1">Berhasil dikonfirmasi</h3>
              <p className="text-sm text-green-50">
                Data sudah disimpan. Kembali ke scanner dalam {successHoldSeconds} detik agar panitia sempat membaca.
              </p>
            </div>
          </div>
        </div>
      )}

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

          {coupon.photo_penerima && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-medium mb-2">Foto Penerima Kurban</p>
              <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-gray-50 flex justify-center">
                <img 
                  src={coupon.photo_penerima} 
                  alt={`Foto ${coupon.nama_penerima}`} 
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            </div>
          )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Status</p>
              <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isDiambil ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                ✓ {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {pickupFlowActive ? (
          <div className="pt-6 border-t border-gray-200 mt-6">
            <button
              disabled
              className="w-full bg-green-200 text-green-800 font-semibold py-4 px-6 rounded-lg transition-all text-lg shadow-md cursor-not-allowed opacity-90"
            >
              Menunggu kembali ke scanner...
            </button>
          </div>
        ) : isDiambil ? (
          <div className="pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onScanAgain}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all text-lg shadow-md"
            >
              ← Scan Kupon Lainnya
            </button>
          </div>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 mt-2">
              <button
                onClick={onConfirmPickup}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-all text-lg shadow-md"
              >
                🎁 Konfirmasi Ambil Daging
              </button>
              <button
                onClick={onScanAgain}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-lg transition-all"
              >
                ← Scan Lagi
              </button>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mt-6">
              <p className="text-sm text-yellow-800">
                <strong>📌 Catatan:</strong> Klik "Konfirmasi Ambil" ketika penerima sudah mengambil daging mereka. Status akan berubah menjadi "Diambil" dan tidak dapat dirubah lagi.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
