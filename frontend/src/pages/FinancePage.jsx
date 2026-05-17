import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Upload, Image as ImageIcon, Save, List, Eye, X, Printer } from 'lucide-react';
import { financeService } from '../services/api';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'pemasukan', 'pengeluaran'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [useQty, setUseQty] = useState(false);

  const initialForm = {
    title: '',
    amount: '',
    qty: 1,
    transaction_date: new Date().toISOString().split('T')[0],
    category: '',
    proof_image: null,
    goods_image: null
  };
  const [formData, setFormData] = useState(initialForm);
  const [customCategory, setCustomCategory] = useState('');

  const pemasukanCategories = ['Kas RT / RW', 'Iuran Warga / Ibu-Ibu', 'Donasi / Sukarela'];
  const pengeluaranCategories = ['Perlengkapan & Alat', 'Wadah Daging', 'Konsumsi', 'Operasional'];

  useEffect(() => {
    if (activeTab === 'list') {
      loadTransactions();
    } else {
      // Set default category depending on form
      setFormData({ 
        ...initialForm, 
        category: activeTab === 'pemasukan' ? pemasukanCategories[0] : pengeluaranCategories[0] 
      });
      setCustomCategory('');
      setUseQty(false);
    }
  }, [activeTab]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await financeService.getTransactions();
      setTransactions(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileConvert = (e, fieldName) => {
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

          // Kompresi ke format JPEG dengan kualitas 70%
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, [fieldName]: compressedDataUrl }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalCategory = formData.category === 'Lainnya...' ? customCategory : formData.category;
    if (!formData.title || !formData.amount || !finalCategory) return alert('Lengkapi data wajib!');

    setSaving(true);
    try {
      const finalAmount = activeTab === 'pengeluaran' ? Number(formData.amount) * Number(formData.qty) : Number(formData.amount);
      const finalTitle = activeTab === 'pengeluaran' && Number(formData.qty) > 1 
        ? `${formData.title} (x${formData.qty})` 
        : formData.title;

      await financeService.addTransaction({
        ...formData,
        title: finalTitle,
        amount: finalAmount,
        category: finalCategory,
        type: activeTab
      });
      alert(`✅ Data ${activeTab} berhasil disimpan!`);
      setActiveTab('list');
    } catch (error) {
      alert('❌ Gagal menyimpan data: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // Calculate summary
  const totalPemasukan = transactions.filter(t => t.type === 'pemasukan').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalPengeluaran = transactions.filter(t => t.type === 'pengeluaran').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const saldo = totalPemasukan - totalPengeluaran;

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up diblokir oleh browser. Harap izinkan pop-up (Allow Pop-ups) untuk mencetak.');
      return;
    }

    let rowsHtml = '';
    transactions.forEach((t, index) => {
      const date = new Date(t.transaction_date).toLocaleDateString('id-ID');
      const type = t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
      const amountStr = formatRupiah(t.amount);
      
      let imagesHtml = '';
      if (t.proof_image) {
        imagesHtml += `<div style="margin-bottom: 8px;"><strong>Bukti:</strong><br/><img src="${t.proof_image}" alt="Bukti"/></div>`;
      }
      if (t.goods_image) {
        imagesHtml += `<div><strong>Barang:</strong><br/><img src="${t.goods_image}" alt="Barang"/></div>`;
      }

      rowsHtml += `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${date}</td>
          <td><strong>${t.title}</strong><br/>Kategori: ${t.category}<br/>Jenis: ${type}</td>
          <td class="amount">${amountStr}</td>
          <td class="text-center">
            <div class="img-container">
              ${imagesHtml || '-'}
            </div>
          </td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Keuangan Kurban</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body { font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.4; margin: 0; padding: 0; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
            .header p { margin: 5px 0 0 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            th, td { border: 1px solid #000; padding: 10px; vertical-align: top; font-size: 13px; }
            th { background-color: #fff; font-weight: bold; text-align: center; text-transform: uppercase; }
            .amount { text-align: right; white-space: nowrap; }
            .text-center { text-align: center; }
            .img-container img { max-width: 140px; max-height: 140px; object-fit: contain; border: 1px solid #000; padding: 2px; }
            .summary-box { width: 350px; margin-left: auto; border: 2px solid #000; page-break-inside: avoid; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #000; font-size: 14px; }
            .summary-row:last-child { border-bottom: none; font-weight: bold; border-top: 2px solid #000; }
            .footer { margin-top: 50px; text-align: right; page-break-inside: avoid; }
            .signature-area { display: inline-block; text-align: center; width: 200px; }
            .signature-name { margin-top: 80px; font-weight: bold; text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Keuangan Kepanitiaan Kurban</h1>
            <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 15%;">Tanggal</th>
                <th style="width: 35%;">Keterangan Transaksi</th>
                <th style="width: 20%;">Nominal</th>
                <th style="width: 25%;">Lampiran</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="5" class="text-center">Belum ada transaksi</td></tr>'}
            </tbody>
          </table>
          <div class="summary-box">
            <div class="summary-row">
              <span>Total Pemasukan:</span>
              <span>${formatRupiah(totalPemasukan)}</span>
            </div>
            <div class="summary-row">
              <span>Total Pengeluaran:</span>
              <span>${formatRupiah(totalPengeluaran)}</span>
            </div>
            <div class="summary-row">
              <span>Sisa Saldo Akhir:</span>
              <span>${formatRupiah(saldo)}</span>
            </div>
          </div>
          <div class="footer">
            <div class="signature-area">
              <p>Mengetahui,</p>
              <p style="margin-bottom: 80px;">Bendahara Panitia</p>
              <p class="signature-name">( ........................................ )</p>
            </div>
          </div>
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 800); };
          </script>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">💰 Buku Kas Kepanitiaan</h1>
        <p className="text-gray-600 mt-2">Catat pemasukan dana dan pengeluaran belanja secara transparan.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white rounded-lg shadow overflow-hidden">
        <button onClick={() => setActiveTab('list')} className={`flex-1 py-4 font-semibold transition-colors flex justify-center items-center gap-2 ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
          <List size={20} /> Histori Transaksi
        </button>
        <button onClick={() => setActiveTab('pemasukan')} className={`flex-1 py-4 font-semibold transition-colors flex justify-center items-center gap-2 ${activeTab === 'pemasukan' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
          <ArrowDownCircle size={20} /> Form Pemasukan
        </button>
        <button onClick={() => setActiveTab('pengeluaran')} className={`flex-1 py-4 font-semibold transition-colors flex justify-center items-center gap-2 ${activeTab === 'pengeluaran' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
          <ArrowUpCircle size={20} /> Form Pengeluaran
        </button>
      </div>

      {/* TAB 1: LIST HISTORI & SUMMARY */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <p className="text-sm text-gray-600 font-medium">Total Pemasukan</p>
              <p className="text-2xl font-bold text-green-600">{formatRupiah(totalPemasukan)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <p className="text-sm text-gray-600 font-medium">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-600">{formatRupiah(totalPengeluaran)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 font-medium">Sisa Saldo Kas</p>
              <p className="text-3xl font-black text-blue-700">{formatRupiah(saldo)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 mb-2 gap-4">
            <h2 className="text-xl font-bold text-gray-800">Riwayat Transaksi</h2>
            <button onClick={handlePrintPDF} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm shadow-sm w-full sm:w-auto justify-center">
              <Printer size={18}/> Cetak Laporan (PDF)
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? <p className="p-8 text-center text-gray-500">Memuat data...</p> : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-700 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-sm">Tanggal</th>
                    <th className="p-4 font-semibold text-sm">Keterangan</th>
                    <th className="p-4 font-semibold text-sm">Kategori</th>
                    <th className="p-4 font-semibold text-sm">Masuk / Keluar</th>
                    <th className="p-4 font-semibold text-sm">Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-600">{new Date(t.transaction_date).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 text-sm font-medium text-gray-900">{t.title}</td>
                      <td className="p-4 text-sm text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{t.category}</span></td>
                      <td className="p-4 font-bold">
                        {t.type === 'pemasukan' 
                          ? <span className="text-green-600">+{formatRupiah(t.amount)}</span> 
                          : <span className="text-red-600">-{formatRupiah(t.amount)}</span>}
                      </td>
                      <td className="p-4 text-sm flex items-center gap-2">
                        {t.proof_image ? (
                          <button 
                            onClick={() => setSelectedImage(t.proof_image)}
                            className="text-blue-600 flex items-center gap-1 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors font-medium"
                          >
                            <Eye size={16}/> Bukti
                          </button>
                        ) : '-'}
                        {t.goods_image && (
                          <button 
                            onClick={() => setSelectedImage(t.goods_image)}
                            className="text-purple-600 flex items-center gap-1 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-md transition-colors font-medium"
                          >
                            <Eye size={16}/> Barang
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">Belum ada riwayat transaksi.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2 & 3: FORM INPUT */}
      {(activeTab === 'pemasukan' || activeTab === 'pengeluaran') && (
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kiri: Info Dasar */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Judul / Keterangan {activeTab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</label>
                  <input 
                    type="text" required
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder={activeTab === 'pemasukan' ? "Contoh: Subsidi Kas RT 03" : "Contoh: Beli kantong plastik kiloan"}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {activeTab === 'pengeluaran' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" id="useQty" 
                        checked={useQty} 
                        onChange={(e) => {
                          setUseQty(e.target.checked);
                          if (!e.target.checked) setFormData({...formData, qty: 1}); // reset qty saat dimatikan
                        }} 
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="useQty" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Pembelian banyak barang? (Gunakan Harga Satuan & Qty)
                      </label>
                    </div>
                    
                    {useQty ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Harga Satuan (Rp)</label>
                          <input 
                            type="number" required min="0"
                            value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                            placeholder="Contoh: 15000"
                            className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah (Qty)</label>
                          <input 
                            type="number" required min="1"
                            value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})}
                            placeholder="Contoh: 5"
                            className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {formData.amount && formData.qty && (
                          <div className="col-span-2 text-sm bg-gray-50 border border-gray-200 p-3 rounded-lg flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Total Nominal:</span>
                            <span className="text-lg font-bold text-red-600">{formatRupiah(formData.amount * formData.qty)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal (Rp)</label>
                        <input 
                          type="number" required min="0"
                          value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                          placeholder="Contoh: 500000"
                          className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal (Rp)</label>
                    <input 
                      type="number" required min="0"
                      value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                      placeholder="Contoh: 500000"
                      className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
                    <input 
                      type="date" required
                      value={formData.transaction_date} onChange={e => setFormData({...formData, transaction_date: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                    <select 
                      required={!customCategory} 
                      value={formData.category} 
                      onChange={e => {
                        setFormData({...formData, category: e.target.value});
                        if (e.target.value !== 'Lainnya...') setCustomCategory('');
                      }}
                      className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {activeTab === 'pemasukan' 
                        ? pemasukanCategories.map(c => <option key={c} value={c}>{c}</option>)
                        : pengeluaranCategories.map(c => <option key={c} value={c}>{c}</option>)
                      }
                      <option value="Lainnya...">Lainnya... (Ketik Sendiri)</option>
                    </select>
                    {formData.category === 'Lainnya...' && (
                      <input 
                        type="text" required
                        placeholder="Ketik kategori baru..."
                        value={customCategory} onChange={e => setCustomCategory(e.target.value)}
                        className="w-full mt-2 p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Kanan: Upload Bukti */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-800">Lampiran & Dokumentasi</p>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    1. {activeTab === 'pemasukan' ? 'Upload Bukti Transfer / Foto Uang (Opsional)' : 'Upload Foto Bon / Nota / Amplop Gaji (Opsional)'}
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-100 transition flex flex-col items-center justify-center min-h-[120px] overflow-hidden group">
                    <input type="file" accept="image/*" onChange={(e) => handleFileConvert(e, 'proof_image')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {formData.proof_image ? (
                      <img src={formData.proof_image} alt="Bukti" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                    ) : (
                      <Upload className="text-gray-400 mb-2" size={24} />
                    )}
                    <span className="text-sm font-medium text-gray-700 bg-white/80 px-2 py-1 rounded relative z-0 pointer-events-none">
                      {formData.proof_image ? 'Klik untuk mengganti foto' : 'Pilih Foto / Ambil Gambar'}
                    </span>
                  </div>
                </div>

                {activeTab === 'pengeluaran' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2 mt-4">
                      2. Upload Foto Barang Fisik / Kegiatan (Opsional)
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-100 transition flex flex-col items-center justify-center min-h-[120px] overflow-hidden group">
                      <input type="file" accept="image/*" onChange={(e) => handleFileConvert(e, 'goods_image')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {formData.goods_image ? (
                        <img src={formData.goods_image} alt="Barang" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                      ) : (
                        <ImageIcon className="text-gray-400 mb-2" size={24} />
                      )}
                      <span className="text-sm font-medium text-gray-700 bg-white/80 px-2 py-1 rounded relative z-0 pointer-events-none">
                        {formData.goods_image ? 'Klik untuk mengganti foto' : 'Pilih Foto / Ambil Gambar'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button 
                type="submit" disabled={saving}
                className={`w-full flex justify-center items-center gap-2 py-3 rounded-lg text-white font-bold transition-all ${
                  activeTab === 'pemasukan' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                <Save size={20} />
                {saving ? 'Menyimpan Data...' : `Simpan ${activeTab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} Baru`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal View Gambar */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow-lg z-10 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>
            <div className="p-2 bg-gray-100 rounded-xl overflow-hidden max-h-[85vh] flex justify-center">
              <img src={selectedImage} alt="Preview Gambar" className="max-w-full h-auto object-contain rounded-lg shadow-sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}