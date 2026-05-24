import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Upload, Image as ImageIcon, Save, List, Eye, X, Printer, Edit2, Trash2 } from 'lucide-react';
import { financeService } from '../services/api';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'pemasukan', 'pengeluaran'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [useQty, setUseQty] = useState(false);

  const initialForm = {
    type: 'pemasukan',
    title: '',
    amount: '',
    qty: 1,
    transaction_date: new Date().toISOString().split('T')[0],
    category: '',
    proof_image: null,
    goods_image: null
  };
  const [formData, setFormData] = useState(initialForm);
  const [editFormData, setEditFormData] = useState(initialForm);
  const [customCategory, setCustomCategory] = useState('');
  const [editCustomCategory, setEditCustomCategory] = useState('');

  const pemasukanCategories = ['Kas RT / RW', 'Iuran Warga / Ibu-Ibu', 'Donasi / Sukarela'];
  const pengeluaranCategories = ['Perlengkapan & Alat', 'Wadah Daging', 'Konsumsi', 'Operasional'];
  const getCategoriesByType = (type) => (type === 'pemasukan' ? pemasukanCategories : pengeluaranCategories);

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

  const handleFileConvert = (e, fieldName, setTargetForm = setFormData) => {
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
          setTargetForm(prev => ({ ...prev, [fieldName]: compressedDataUrl }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (transaction) => {
    const categories = getCategoriesByType(transaction.type);
    const categoryIsKnown = categories.includes(transaction.category);
    const normalizedDate = String(transaction.transaction_date).split('T')[0];

    setEditingTransaction(transaction);
    setEditCustomCategory(categoryIsKnown ? '' : transaction.category);
    setEditFormData({
      type: transaction.type,
      title: transaction.title,
      amount: String(transaction.amount),
      qty: 1,
      transaction_date: normalizedDate,
      category: categoryIsKnown ? transaction.category : 'Lainnya...',
      proof_image: transaction.proof_image || null,
      goods_image: transaction.goods_image || null
    });
  };

  const closeEditModal = () => {
    setEditingTransaction(null);
    setEditFormData(initialForm);
    setEditCustomCategory('');
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
      setFormData(initialForm);
      setCustomCategory('');
      setUseQty(false);
      setActiveTab('list');
    } catch (error) {
      alert('❌ Gagal menyimpan data: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    if (!editingTransaction) return;

    const finalCategory = editFormData.category === 'Lainnya...' ? editCustomCategory : editFormData.category;
    if (!editFormData.title || !editFormData.amount || !finalCategory) return alert('Lengkapi data wajib!');

    setEditSaving(true);
    try {
      await financeService.updateTransaction(editingTransaction.id, {
        ...editFormData,
        amount: Number(editFormData.amount),
        category: finalCategory
      });
      alert('✅ Data transaksi berhasil diperbarui!');
      closeEditModal();
      await loadTransactions();
    } catch (error) {
      alert('❌ Gagal memperbarui data: ' + error.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    // Hapus langsung tanpa konfirmasi pop-up
    if (!transaction?.id) return;
    setDeletingId(transaction.id);
    try {
      await financeService.deleteTransaction(transaction.id);
      alert('✅ Data transaksi berhasil dihapus!');
      await loadTransactions();
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Gagal menghapus data: ' + (error?.response?.data?.error || error.message));
    } finally {
      setDeletingId(null);
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

    const stripQtySuffix = (title) => String(title || '').replace(/\s*\(x\s*\d+\)\s*$/i, '').trim();
    const extractQtyFromTitle = (title) => {
      const match = String(title || '').match(/\(x\s*(\d+)\)\s*$/i);
      const qty = match ? Number(match[1]) : 1;
      return Number.isFinite(qty) && qty > 0 ? qty : 1;
    };
    const guessUnitLabel = (title, type) => {
      if (type === 'pemasukan') return 'trx';

      const lowerTitle = String(title || '').toLowerCase();
      const unitMatchers = [
        [/\bbox\b/, 'box'],
        [/\bsachet\b/, 'sachet'],
        [/\bpcs\b/, 'pcs'],
        [/\bpack\b|\bpck\b/, 'pack'],
        [/\bdus\b/, 'dus'],
        [/\bkarung\b/, 'karung'],
        [/\bbotol\b/, 'botol'],
        [/\bkantong\b/, 'kantong'],
        [/\bbungkus\b/, 'bungkus'],
        [/\blusin\b/, 'lusin'],
        [/\bkg\b|\bkilo\b/, 'kg'],
        [/\bltr\b|\bliter\b/, 'liter'],
        [/\bset\b/, 'set']
      ];

      for (const [pattern, label] of unitMatchers) {
        if (pattern.test(lowerTitle)) return label;
      }

      return 'pcs';
    };
    const buildAttachmentCell = (transaction) => {
      const attachments = [];
      if (transaction.proof_image) attachments.push({ label: 'Bukti', src: transaction.proof_image });
      if (transaction.goods_image) attachments.push({ label: 'Barang', src: transaction.goods_image });

      if (!attachments.length) {
        return '<span class="muted">-</span>';
      }

      return `
        <div class="attachment-images">
          ${attachments.map((item) => `
            <div class="attachment-item">
              <img src="${item.src}" alt="${item.label}" />
              <div class="label">${item.label}</div>
            </div>
          `).join('')}
        </div>
      `;
    };

    const buildRows = (type) => transactions
      .filter((transaction) => transaction.type === type)
      .map((transaction, index) => {
        const amount = Number(transaction.amount) || 0;
        const description = stripQtySuffix(transaction.title) || transaction.title || '-';
        const note = transaction.notes || transaction.keterangan || transaction.category || '-';
        const qty = type === 'pengeluaran' ? extractQtyFromTitle(transaction.title) : 1;
        const unitLabel = guessUnitLabel(transaction.title, type);
        const unitPrice = qty > 0 ? amount / qty : amount;

        return `
          <tr>
            <td class="center">${index + 1}</td>
            <td>
              <div class="row-title">${description}</div>
              <div class="row-subtitle">${transaction.category || '-'}</div>
            </td>
            <td class="center">${qty} ${unitLabel}</td>
            <td class="right">${formatRupiah(unitPrice)}</td>
            <td class="right">${formatRupiah(amount)}</td>
            <td>${note}</td>
          </tr>
        `;
      })
      .join('');

    const buildAttachmentRows = (type) => transactions
      .filter((transaction) => transaction.type === type)
      .filter((transaction) => transaction.proof_image || transaction.goods_image)
      .map((transaction, index) => {
        const description = stripQtySuffix(transaction.title) || transaction.title || '-';

        return `
          <tr>
            <td class="center">${index + 1}</td>
            <td>${description}</td>
            <td>${buildAttachmentCell(transaction)}</td>
          </tr>
        `;
      })
      .join('');

    const incomeRowsHtml = buildRows('pemasukan');
    const expenseRowsHtml = buildRows('pengeluaran');
    const incomeAttachmentRowsHtml = buildAttachmentRows('pemasukan');
    const expenseAttachmentRowsHtml = buildAttachmentRows('pengeluaran');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Keuangan Kurban</title>
          <style>
            @page { size: A4 portrait; margin: 14mm; }
            * { box-sizing: border-box; }
            body { font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.35; margin: 0; padding: 0; }
            .page { width: 100%; }
            .header { border: 2px solid #111; padding: 14px 16px; margin-bottom: 12px; }
            .header-top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
            .title-block h1 { margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; }
            .title-block p { margin: 4px 0 0; font-size: 12px; color: #444; }
            .meta { text-align: right; font-size: 12px; color: #333; line-height: 1.4; }
            .meta strong { display: block; font-size: 13px; color: #111; margin-bottom: 2px; }
            .note { margin-top: 8px; font-size: 11px; color: #555; background: #f6f6f6; border: 1px solid #d9d9d9; padding: 8px 10px; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
            .summary-card { border: 1.5px solid #111; padding: 10px 12px; }
            .summary-card span { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #555; }
            .summary-card strong { display: block; margin-top: 4px; font-size: 15px; }
            .section { margin-bottom: 16px; page-break-inside: avoid; }
            .section h2 { margin: 0 0 8px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.3px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #111; padding: 8px 7px; font-size: 11px; vertical-align: top; }
            th { background: #f1f1f1; text-align: center; text-transform: uppercase; font-size: 10px; }
            .center { text-align: center; }
            .right { text-align: right; white-space: nowrap; }
            .muted { color: #666; }
            .row-title { font-weight: 700; margin-bottom: 2px; }
            .row-subtitle { font-size: 10px; color: #555; }
            .attachment-table img { width: 110px; height: 110px; object-fit: contain; border: 1px solid #111; background: #fff; padding: 2px; display: block; }
            .attachment-images { display: flex; flex-wrap: wrap; gap: 8px; }
            .attachment-item { width: 110px; }
            .attachment-item .label { margin-top: 4px; font-size: 10px; text-align: center; }
            .empty-row { text-align: center; color: #666; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div class="header-top">
                <div class="title-block">
                  <h1>Laporan Keuangan Kepanitiaan Kurban</h1>
                  <p>Dicetak pada ${new Date().toLocaleString('id-ID')}</p>
                </div>
                <div class="meta">
                  <strong>Bendahara Panitia</strong>
                  <span>Rekap pemasukan, pengeluaran, dan lampiran foto</span>
                </div>
              </div>
              <div class="note">
                Satuan menampilkan jumlah barang atau transaksi. Jika tidak ada satuan khusus, sistem akan memakai pcs sebagai default.
              </div>
            </div>

            <div class="summary-grid">
              <div class="summary-card">
                <span>Total Pemasukan</span>
                <strong>${formatRupiah(totalPemasukan)}</strong>
              </div>
              <div class="summary-card">
                <span>Total Pengeluaran</span>
                <strong>${formatRupiah(totalPengeluaran)}</strong>
              </div>
              <div class="summary-card">
                <span>Sisa Saldo Akhir</span>
                <strong>${formatRupiah(saldo)}</strong>
              </div>
            </div>

            <section class="section">
              <h2>Tabel Pemasukan</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 6%;">No</th>
                    <th style="width: 28%;">Deskripsi / Nama Pemasukan</th>
                    <th style="width: 12%;">Satuan</th>
                    <th style="width: 18%;">Harga Satuan</th>
                    <th style="width: 18%;">Total</th>
                    <th style="width: 18%;">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  ${incomeRowsHtml || '<tr><td colspan="6" class="empty-row">Belum ada data pemasukan</td></tr>'}
                </tbody>
              </table>
            </section>

            <section class="section">
              <h2>Tabel Pengeluaran</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 6%;">No</th>
                    <th style="width: 28%;">Deskripsi / Nama Pengeluaran</th>
                    <th style="width: 12%;">Satuan</th>
                    <th style="width: 18%;">Harga Satuan</th>
                    <th style="width: 18%;">Total</th>
                    <th style="width: 18%;">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  ${expenseRowsHtml || '<tr><td colspan="6" class="empty-row">Belum ada data pengeluaran</td></tr>'}
                </tbody>
              </table>
            </section>

            <section class="section">
              <h2>Lampiran Foto Pemasukan</h2>
              <table class="attachment-table">
                <thead>
                  <tr>
                    <th style="width: 6%;">No</th>
                    <th style="width: 34%;">Deskripsi</th>
                    <th style="width: 60%;">Lampiran Foto</th>
                  </tr>
                </thead>
                <tbody>
                  ${incomeAttachmentRowsHtml || '<tr><td colspan="3" class="empty-row">Belum ada lampiran foto pemasukan</td></tr>'}
                </tbody>
              </table>
            </section>

            <section class="section">
              <h2>Lampiran Foto Pengeluaran</h2>
              <table class="attachment-table">
                <thead>
                  <tr>
                    <th style="width: 6%;">No</th>
                    <th style="width: 34%;">Deskripsi</th>
                    <th style="width: 60%;">Lampiran Foto</th>
                  </tr>
                </thead>
                <tbody>
                  ${expenseAttachmentRowsHtml || '<tr><td colspan="3" class="empty-row">Belum ada lampiran foto pengeluaran</td></tr>'}
                </tbody>
              </table>
            </section>
          </div>
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 900); };
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
              <>
              <div className="md:hidden p-4 space-y-3">
                {transactions.map((t) => (
                  <div key={t.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Tanggal</p>
                        <p className="font-medium text-gray-900">{new Date(t.transaction_date).toLocaleDateString('id-ID')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.type === 'pemasukan' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Keterangan</p>
                        <p className="font-semibold text-gray-900 break-words">{t.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Kategori</p>
                        <p><span className="bg-gray-100 px-2 py-1 rounded text-xs">{t.category}</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Nominal</p>
                        <p className="font-bold">
                          {t.type === 'pemasukan'
                            ? <span className="text-green-600">+{formatRupiah(t.amount)}</span>
                            : <span className="text-red-600">-{formatRupiah(t.amount)}</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Bukti</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {t.proof_image ? (
                            <button 
                              onClick={() => setSelectedImage(t.proof_image)}
                              className="text-blue-600 flex items-center gap-1 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md transition-colors font-medium"
                            >
                              <Eye size={16}/> Bukti
                            </button>
                          ) : <span className="text-gray-500">-</span>}
                          {t.goods_image && (
                            <button 
                              onClick={() => setSelectedImage(t.goods_image)}
                              className="text-purple-600 flex items-center gap-1 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-md transition-colors font-medium"
                            >
                              <Eye size={16}/> Barang
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openEditModal(t);
                        }}
                        className="flex-1 min-w-[110px] inline-flex items-center justify-center gap-1 bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-2 rounded-md transition-colors font-medium"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === t.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteTransaction(t);
                        }}
                        className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-md transition-colors font-medium ${deletingId === t.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 size={16} /> {deletingId === t.id ? 'Menghapus...' : 'Hapus'}
                      </button>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && <div className="p-8 text-center text-gray-500">Belum ada riwayat transaksi.</div>}
              </div>

              <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-700 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-sm">Tanggal</th>
                    <th className="p-4 font-semibold text-sm">Keterangan</th>
                    <th className="p-4 font-semibold text-sm">Kategori</th>
                    <th className="p-4 font-semibold text-sm">Masuk / Keluar</th>
                    <th className="p-4 font-semibold text-sm">Bukti</th>
                    <th className="p-4 font-semibold text-sm">Aksi</th>
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
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openEditModal(t);
                            }}
                            className="flex items-center gap-1 bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-md transition-colors font-medium"
                          >
                            <Edit2 size={16} /> Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === t.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteTransaction(t);
                            }}
                            className={`flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors font-medium ${deletingId === t.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            <Trash2 size={16} /> {deletingId === t.id ? 'Menghapus...' : 'Hapus'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada riwayat transaksi.</td></tr>}
                </tbody>
              </table>
              </div>
              </>
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
                      {getCategoriesByType(activeTab).map(c => <option key={c} value={c}>{c}</option>)}
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
                      <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileConvert(e, 'proof_image', setFormData)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
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

      {/* Modal Edit Transaksi */}
      {editingTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={closeEditModal}>
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Transaksi</h3>
                <p className="text-sm text-gray-600">Perbarui data histori transaksi buku kas.</p>
              </div>
              <button
                onClick={closeEditModal}
                className="rounded-full p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateTransaction} className="p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Transaksi</label>
                    <select
                      value={editFormData.type}
                      onChange={(e) => {
                        const nextType = e.target.value;
                        const nextCategories = getCategoriesByType(nextType);
                        setEditFormData(prev => ({
                          ...prev,
                          type: nextType,
                          category: nextCategories[0]
                        }));
                        setEditCustomCategory('');
                      }}
                      className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="pemasukan">Pemasukan</option>
                      <option value="pengeluaran">Pengeluaran</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Judul / Keterangan</label>
                    <input
                      type="text"
                      required
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal (Rp)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
                      <input
                        type="date"
                        required
                        value={editFormData.transaction_date}
                        onChange={(e) => setEditFormData({ ...editFormData, transaction_date: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                      <select
                        required={!editCustomCategory}
                        value={editFormData.category}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, category: e.target.value });
                          if (e.target.value !== 'Lainnya...') setEditCustomCategory('');
                        }}
                        className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {getCategoriesByType(editFormData.type).map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="Lainnya...">Lainnya... (Ketik Sendiri)</option>
                      </select>
                      {editFormData.category === 'Lainnya...' && (
                        <input
                          type="text"
                          required
                          placeholder="Ketik kategori baru..."
                          value={editCustomCategory}
                          onChange={(e) => setEditCustomCategory(e.target.value)}
                          className="w-full mt-2 p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800">Lampiran & Dokumentasi</p>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Upload Bukti Transaksi (Opsional)</label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-100 transition flex flex-col items-center justify-center min-h-[120px] overflow-hidden group">
                      <input type="file" accept="image/*" onChange={(e) => handleFileConvert(e, 'proof_image', setEditFormData)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {editFormData.proof_image ? (
                        <img src={editFormData.proof_image} alt="Bukti" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                      ) : (
                        <Upload className="text-gray-400 mb-2" size={24} />
                      )}
                      <span className="text-sm font-medium text-gray-700 bg-white/80 px-2 py-1 rounded relative z-0 pointer-events-none">
                        {editFormData.proof_image ? 'Klik untuk mengganti foto' : 'Pilih Foto / Ambil Gambar'}
                      </span>
                    </div>
                  </div>

                  {editFormData.type === 'pengeluaran' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2 mt-4">Upload Foto Barang Fisik / Kegiatan (Opsional)</label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-100 transition flex flex-col items-center justify-center min-h-[120px] overflow-hidden group">
                        <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileConvert(e, 'goods_image', setEditFormData)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {editFormData.goods_image ? (
                          <img src={editFormData.goods_image} alt="Barang" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                        ) : (
                          <ImageIcon className="text-gray-400 mb-2" size={24} />
                        )}
                        <span className="text-sm font-medium text-gray-700 bg-white/80 px-2 py-1 rounded relative z-0 pointer-events-none">
                          {editFormData.goods_image ? 'Klik untuk mengganti foto' : 'Pilih Foto / Ambil Gambar'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
                <button type="button" onClick={closeEditModal} className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editSaving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
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