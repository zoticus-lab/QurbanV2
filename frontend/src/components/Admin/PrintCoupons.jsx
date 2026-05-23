import React, { useState, useRef } from 'react';
import { Download, Upload, Loader, Settings2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { couponService } from '../../services/api';
import CouponLayout from './CouponLayout';
import defaultBackground from '../../assets/coupon-default-bg.svg';

export default function PrintCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(defaultBackground);
  const [printScope, setPrintScope] = useState('all');
  const fileInputRef = useRef(null);

  // State untuk kustomisasi kupon
  const [couponTitle, setCouponTitle] = useState('KUPON KURBAN');
  const [titleSize, setTitleSize] = useState(24);
  const [masjidName, setMasjidName] = useState('Masjid An-Nur');
  const [couponDate, setCouponDate] = useState(new Date().toLocaleDateString('id-ID'));
  const [eventTime, setEventTime] = useState('08:00 - Selesai');
  const [eventAddress, setEventAddress] = useState('Halaman Masjid An-Nur');
  const [qrSize, setQrSize] = useState(60);
  const [qrPosition, setQrPosition] = useState('top'); // 'top' atau 'bottom'
  const [panitiaRt, setPanitiaRt] = useState('07');
  const [panitiaRw, setPanitiaRw] = useState('04');
  const [bgOpacity, setBgOpacity] = useState(20); // Default transparan 20%
  const [bgSize, setBgSize] = useState(100); // Default ukuran 100%

  const couponsToPrint = printScope === 'page' ? coupons.slice(0, 10) : coupons;

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response = await couponService.getAllCoupons(500, 0);
      // API response structure: { success: true, data: { data: [...], total: 19 } }
      setCoupons(response.data.data.data);
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

  const resetBackground = () => {
    setBackgroundImage(defaultBackground);
  };

  const handleDownloadPDF = async () => {
    const pages = document.querySelectorAll('.coupon-page');
    if (!pages || pages.length === 0) {
      alert('Layout tidak ditemukan');
      return;
    }

    try {
      setGeneratingPdf(true);

      // Wait for fonts to be ready (helps with text rendering)
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

      // Convert mm to px using 96dpi assumption
      const mmToPx = (mm) => Math.round(mm * (96 / 25.4));
      const pxWidth = mmToPx(pdfWidth);
      const pxHeight = mmToPx(pdfHeight);

      for (let i = 0; i < pages.length; i++) {
        // Original page size
        const pageEl = pages[i];
        const pageWidth = pageEl.scrollWidth;
        const pageHeight = pageEl.scrollHeight;

        // Create offscreen wrapper sized to A4 in pixels
        const wrapper = document.createElement('div');
        wrapper.style.width = pxWidth + 'px';
        wrapper.style.height = pxHeight + 'px';
        wrapper.style.boxSizing = 'border-box';
        wrapper.style.background = '#ffffff';
        wrapper.style.position = 'fixed';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '0';

        // Clone and place inside an inner container we can scale
        const inner = document.createElement('div');
        inner.style.transformOrigin = 'top left';
        inner.style.width = pageWidth + 'px';
        inner.style.height = pageHeight + 'px';
        inner.style.boxSizing = 'border-box';

        const clone = pageEl.cloneNode(true);
        // Ensure clone has same display width for proper scaling
        clone.style.width = pageWidth + 'px';
        clone.style.boxSizing = 'border-box';

        inner.appendChild(clone);
        wrapper.appendChild(inner);
        document.body.appendChild(wrapper);

        // Compute scale to fit A4 area
        const scale = Math.min(pxWidth / pageWidth, pxHeight / pageHeight);
        // Apply scale (do not scale further by DPR; let html2canvas capture at higher quality via scale option)
        inner.style.transform = `scale(${scale})`;

        // Calculate final canvas pixel size to request from html2canvas
        const canvasWidth = Math.round(pageWidth * scale);
        const canvasHeight = Math.round(pageHeight * scale);

        const dpr = Math.max(1, window.devicePixelRatio || 1);

        const canvas = await html2canvas(wrapper, {
          scale: dpr,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: canvasWidth,
          height: canvasHeight,
          windowWidth: canvasWidth,
          windowHeight: canvasHeight,
        });

        document.body.removeChild(wrapper);

        const imgData = canvas.toDataURL('image/png', 1.0);

        // Draw image to PDF centered
        const imgProps = pdf.getImageProperties(imgData);
        const imgRatio = imgProps.width / imgProps.height;
        const pageRatio = pdfWidth / pdfHeight;
        let drawWidth = pdfWidth;
        let drawHeight = pdfHeight;
        if (imgRatio > pageRatio) {
          drawHeight = pdfWidth / imgRatio;
        } else {
          drawWidth = pdfHeight * imgRatio;
        }
        const offsetX = (pdfWidth - drawWidth) / 2;
        const offsetY = (pdfHeight - drawHeight) / 2;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', offsetX, offsetY, drawWidth, drawHeight);
      }

      pdf.save('kupon-kurban.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF: ' + (error.message || error));
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Fallback: use browser print (better rendering for complex CSS)
  const handlePrintBrowser = async () => {
    const layout = document.getElementById('coupon-layout');
    if (!layout) {
      alert('Layout tidak ditemukan');
      return;
    }

    const clone = layout.cloneNode(true);
    const wrapper = document.createElement('div');
    wrapper.className = 'print-area';
    wrapper.style.width = '210mm';
    wrapper.style.height = '297mm';
    wrapper.style.boxSizing = 'border-box';
    wrapper.appendChild(clone);

    const style = document.createElement('style');
    style.id = 'print-area-style';
    style.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        .print-area, .print-area * { visibility: visible !important; }
        .print-area { position: absolute !important; left: 0; top: 0; width: 210mm; height: 297mm; }
        @page { size: A4; margin: 10mm; }
      }
    `;

    document.body.appendChild(style);
    document.body.appendChild(wrapper);

    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      window.print();
    } finally {
      // cleanup after print
      document.body.removeChild(wrapper);
      const s = document.getElementById('print-area-style');
      if (s) document.body.removeChild(s);
    }
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

            {/* Panel Kustomisasi */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Settings2 size={18} className="text-gray-700" />
                <h4 className="font-semibold text-gray-800">Kustomisasi Kupon</h4>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 border-b border-gray-200 pb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mode Cetak</label>
                    <select
                      value={printScope}
                      onChange={(e) => setPrintScope(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">Seluruh voucher</option>
                      <option value="page">1 halaman pertama</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={resetBackground}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Pakai background default
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-b border-gray-200 pb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Judul Kupon</label>
                    <input
                      type="text"
                      value={couponTitle}
                      onChange={(e) => setCouponTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ukuran Judul (px)</label>
                    <input
                      type="number"
                      value={titleSize}
                      onChange={(e) => setTitleSize(parseInt(e.target.value) || 24)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Penyelenggara</label>
                  <input
                    type="text"
                    value={masjidName}
                    onChange={(e) => setMasjidName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Alamat / Lokasi</label>
                  <input
                    type="text"
                    value={eventAddress}
                    onChange={(e) => setEventAddress(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Acara</label>
                  <input
                    type="text"
                    value={couponDate}
                    onChange={(e) => setCouponDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Jam Mulai</label>
                    <input
                      type="text"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Panitia RT</label>
                    <input
                      type="text"
                      value={panitiaRt}
                      onChange={(e) => setPanitiaRt(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Panitia RW</label>
                    <input
                      type="text"
                      value={panitiaRw}
                      onChange={(e) => setPanitiaRw(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ukuran QR (px)</label>
                    <input
                      type="number"
                      value={qrSize}
                      onChange={(e) => setQrSize(parseInt(e.target.value) || 40)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Posisi QR</label>
                    <select value={qrPosition} onChange={(e) => setQrPosition(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500">
                      <option value="top">Atas</option>
                      <option value="bottom">Bawah</option>
                      <option value="hidden">Sembunyikan</option>
                    </select>
                  </div>
                </div>

                {backgroundImage && (
                  <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Opacity BG ({bgOpacity}%)</label>
                      <input 
                        type="range" min="5" max="100" 
                        value={bgOpacity} 
                        onChange={(e) => setBgOpacity(e.target.value)} 
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Ukuran BG ({bgSize}%)</label>
                      <input 
                        type="range" min="20" max="150" 
                        value={bgSize} 
                        onChange={(e) => setBgSize(e.target.value)} 
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={coupons.length === 0 || generatingPdf}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {generatingPdf ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Membuat PDF...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download PDF A4
                </>
              )}
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
                <CouponLayout 
                  coupons={couponsToPrint} 
                  backgroundImage={backgroundImage} 
                  couponTitle={couponTitle}
                  titleSize={titleSize}
                  masjidName={masjidName}
                  couponDate={couponDate}
                  eventTime={eventTime}
                  eventAddress={eventAddress}
                  qrSize={qrSize}
                  qrPosition={qrPosition}
                  panitiaRt={panitiaRt}
                  panitiaRw={panitiaRw}
                  bgOpacity={bgOpacity}
                  bgSize={bgSize}
                />
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
