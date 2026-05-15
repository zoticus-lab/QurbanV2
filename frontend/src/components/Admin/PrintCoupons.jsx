import React, { useState, useRef } from 'react';
import { Download, Upload, Loader } from 'lucide-react';
import { couponService } from '../../services/api';
import CouponLayout from './CouponLayout';

export default function PrintCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const fileInputRef = useRef(null);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response = await couponService.getAllCoupons(500, 0);
      setCoupons(response.data.data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data kupon');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPDF = () => {
    const couponLayout = document.getElementById('coupon-layout');
    if (!couponLayout) return;

    const html2canvas = window.html2canvas;
    const jsPDF = window.jsPDF;

    if (!html2canvas || !jsPDF) {
      alert('Library PDF tidak tersedia. Pastikan html2canvas dan jsPDF sudah dimuat.');
      return;
    }

    html2canvas(couponLayout, { scale: 2 }).then((canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save('kupon-kurban.pdf');
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontrol Cetak</h3>

            <button
              onClick={loadCoupons}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all mb-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Loading...
                </>
              ) : (
                '📥 Muat Data Kupon'
              )}
            </button>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Background Image (Opsional)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 transition-colors"
              >
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Klik untuk upload gambar</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              {backgroundImage && (
                <p className="text-sm text-green-600 mt-2">✓ Gambar sudah diupload</p>
              )}
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={coupons.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download PDF A4
            </button>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <strong>Layout:</strong> 10 kupon per lembar (2 kolom x 5 baris)
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
              {error}
            </div>
          )}

          {coupons.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preview Kupon ({coupons.length} total)
              </h3>
              <div id="coupon-layout">
                <CouponLayout coupons={coupons} backgroundImage={backgroundImage} />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
              <p className="text-gray-500">Belum ada kupon. Klik "Muat Data Kupon" untuk memulai.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
