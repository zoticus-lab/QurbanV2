import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Download, Edit2, Trash2, Save, X, Eye, Image as ImageIcon } from 'lucide-react';

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCouponQR, setSelectedCouponQR] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [backingUpPdf, setBackingUpPdf] = useState(false);
  const [backingUpExcel, setBackingUpExcel] = useState(false);

  const API_BASE = '/api'; // Gunakan relative path agar Vite Proxy bisa menangani HTTPS ke HTTP
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Load coupons
  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/coupons?limit=500`, config);
      if (response.data.success) {
        setCoupons(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewQRCode = async (coupon) => {
    setSelectedCouponQR(coupon);
    setShowQRModal(true);
    setQrImageUrl(null);
    
    try {
      const qrSecret = coupon.qr_secret;
      const fullUrl = `${API_BASE}/coupons/qr/${qrSecret}`;
      const token = localStorage.getItem('token');
      
      // Fetch JSON response that contains qr_image data URL
      const response = await axios({
        method: 'get',
        url: fullUrl,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.qr_image) {
        setQrImageUrl(response.data.qr_image);
      } else {
        throw new Error('No QR image in response');
      }
      
    } catch (error) {
      console.error('Error loading QR:', error.message);
      setQrImageUrl('error');
    }
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setSelectedCouponQR(null);
    setQrImageUrl(null);
  };

  const startEdit = (coupon) => {
    setEditingId(coupon.id);
    setEditFormData({ ...coupon });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    try {
      const response = await axios.put(
        `${API_BASE}/coupons/${editingId}`,
        editFormData,
        config
      );
      
      if (response.data.success) {
        // Update local state
        setCoupons(coupons.map(c => c.id === editingId ? response.data.data : c));
        setEditingId(null);
        setEditFormData({});
        alert('✅ Kupon berhasil diupdate');
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert('❌ Gagal mengupdate kupon: ' + error.response?.data?.error);
    }
  };

  const deleteCoupon = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/coupons/${id}`,
        config
      );
      
      if (response.data.success) {
        setCoupons(coupons.filter(c => c.id !== id));
        setDeleteConfirmId(null);
        alert('✅ Kupon berhasil dihapus');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('❌ Gagal menghapus kupon: ' + error.response?.data?.error);
    }
  };

  const fetchAllCouponsForBackup = async () => {
    const response = await axios.get(`${API_BASE}/coupons`, {
      ...config,
      params: { limit: 10000, offset: 0 }
    });

    return response.data?.data?.data || [];
  };

  const escapeCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const downloadBlob = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    try {
      setBackingUpExcel(true);
      const allCoupons = await fetchAllCouponsForBackup();

      const headers = ['No Urut', 'Status', 'Nama Penerima', 'RT', 'RW', 'Alamat', 'Waktu Ambil', 'QR Secret'];
      const rows = allCoupons.map((coupon) => [
        coupon.no_urut,
        coupon.status,
        coupon.nama_penerima || '-',
        coupon.rt || '-',
        coupon.rw || '-',
        coupon.alamat || '-',
        coupon.waktu_ambil ? new Date(coupon.waktu_ambil).toLocaleString('id-ID') : '-',
        coupon.qr_secret || '-',
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsvValue).join(','))
        .join('\n');

      downloadBlob(csv, `backup-kupon-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
      alert(`✅ Backup Excel/CSV berhasil diunduh (${allCoupons.length} kupon)`);
    } catch (error) {
      console.error('Error exporting coupons to CSV:', error);
      alert('❌ Gagal export Excel/CSV: ' + (error.response?.data?.error || error.message));
    } finally {
      setBackingUpExcel(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setBackingUpPdf(true);
      const allCoupons = await fetchAllCouponsForBackup();
      const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4', compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const columns = [
        { key: 'no_urut', label: 'No', width: 12 },
        { key: 'status', label: 'Status', width: 20 },
        { key: 'nama_penerima', label: 'Nama Penerima', width: 38 },
        { key: 'rt_rw', label: 'RT/RW', width: 16 },
        { key: 'alamat', label: 'Alamat', width: 90 },
        { key: 'waktu_ambil', label: 'Waktu Ambil', width: 40 },
        { key: 'qr_secret', label: 'QR Secret', width: 51 },
      ];

      const drawHeader = () => {
        pdf.setFillColor(34, 197, 94);
        pdf.rect(margin, 10, pageWidth - margin * 2, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('Backup Data Kupon', margin + 4, 18);
        pdf.setFontSize(9);
        pdf.text(`Total data: ${allCoupons.length} kupon`, pageWidth - margin - 45, 18);
        pdf.setTextColor(0, 0, 0);
      };

      const drawTableHeader = (startY) => {
        let x = margin;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        columns.forEach((column) => {
          pdf.setFillColor(229, 231, 235);
          pdf.rect(x, startY, column.width, 8, 'F');
          pdf.rect(x, startY, column.width, 8);
          pdf.text(column.label, x + 1.5, startY + 5.5);
          x += column.width;
        });
      };

      const drawRow = (coupon, startY) => {
        const values = [
          String(coupon.no_urut ?? '-'),
          String(coupon.status ?? '-'),
          coupon.nama_penerima || '-',
          coupon.rt || coupon.rw ? `${coupon.rt || '-'} / ${coupon.rw || '-'}` : '-',
          coupon.alamat || '-',
          coupon.waktu_ambil ? new Date(coupon.waktu_ambil).toLocaleString('id-ID') : '-',
          coupon.qr_secret || '-',
        ];

        const lineSets = values.map((value, index) => pdf.splitTextToSize(String(value), columns[index].width - 2));
        const rowHeight = Math.max(...lineSets.map((lines) => lines.length)) * 4.5 + 3;

        if (startY + rowHeight > pageHeight - margin) {
          pdf.addPage();
          drawHeader();
          drawTableHeader(24);
          startY = 32;
        }

        let x = margin;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        columns.forEach((column, index) => {
          pdf.rect(x, startY, column.width, rowHeight);
          pdf.text(lineSets[index], x + 1.2, startY + 4);
          x += column.width;
        });

        return startY + rowHeight;
      };

      drawHeader();
      drawTableHeader(24);

      let currentY = 32;
      allCoupons.forEach((coupon) => {
        currentY = drawRow(coupon, currentY);
      });

      pdf.save(`backup-kupon-${new Date().toISOString().slice(0, 10)}.pdf`);
      alert(`✅ Backup PDF berhasil diunduh (${allCoupons.length} kupon)`);
    } catch (error) {
      console.error('Error exporting coupons to PDF:', error);
      alert('❌ Gagal backup PDF: ' + (error.response?.data?.error || error.message));
    } finally {
      setBackingUpPdf(false);
    }
  };

  // Filter coupons
  const filteredCoupons = coupons.filter(coupon => {
    const matchSearch = 
      coupon.no_urut?.toString().includes(searchTerm) ||
      coupon.nama_penerima?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.qr_secret?.includes(searchTerm);
    
    const matchStatus = filterStatus === '' || coupon.status === filterStatus;
    
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    const colors = {
      kosong: 'bg-gray-100 text-gray-800 border border-gray-300',
      terdaftar: 'bg-blue-100 text-blue-800 border border-blue-300',
      diambil: 'bg-green-100 text-green-800 border border-green-300',
    };
    return colors[status] || colors.kosong;
  };

  const getStatusLabel = (status) => {
    const labels = {
      kosong: '🔵 Kosong',
      terdaftar: '🔵 Terdaftar',
      diambil: '🟢 Diambil',
    };
    return labels[status] || status;
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Manajemen Kupon</h1>
          <p className="text-gray-600 mt-2">Lihat, edit, dan hapus kupon yang sudah dicetak</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleDownloadPDF}
            disabled={backingUpPdf || coupons.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg shadow transition-colors font-medium w-full sm:w-auto"
          >
            <Download size={18} />
            {backingUpPdf ? 'Membuat PDF...' : 'Backup PDF'}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={backingUpExcel || coupons.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg shadow transition-colors font-medium w-full sm:w-auto"
          >
            <Download size={18} />
            {backingUpExcel ? 'Mengekspor...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Cari (No Urut / Nama / QR Secret)
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ketik untuk mencari..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Semua Status</option>
              <option value="kosong">Kosong</option>
              <option value="terdaftar">Terdaftar</option>
              <option value="diambil">Diambil</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
              <p className="font-semibold text-gray-700">
                {filteredCoupons.length} dari {coupons.length} kupon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading kupon...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>📭 Tidak ada kupon yang ditemukan</p>
          </div>
        ) : (
          <>
            <div className="md:hidden p-4 space-y-3">
              {filteredCoupons.map((coupon) => (
                <div key={coupon.id} className="border border-gray-200 rounded-xl p-4 shadow-sm bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500">No Urut</p>
                      <p className="font-mono text-lg font-bold text-gray-900">{coupon.no_urut}</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(coupon.status)}`}>
                      {getStatusLabel(coupon.status)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">Nama Penerima</p>
                      <p className="font-medium text-gray-900">{coupon.nama_penerima || '-'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">RT/RW</p>
                        <p>{coupon.rt ? `${coupon.rt}/${coupon.rw}` : '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Waktu Ambil</p>
                        <p>{coupon.waktu_ambil ? new Date(coupon.waktu_ambil).toLocaleString('id-ID') : '-'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Alamat</p>
                      <p className="line-clamp-2">{coupon.alamat || '-'}</p>
                    </div>
                    {coupon.photo_penerima && (
                      <button onClick={() => setSelectedPhoto(coupon.photo_penerima)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-bold transition-colors">
                        <ImageIcon size={14} /> Lihat Foto
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => viewQRCode(coupon)}
                      className="inline-flex items-center justify-center flex-1 min-w-[90px] px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      <Eye size={16} className="mr-1" /> QR
                    </button>
                    <button
                      onClick={() => startEdit(coupon)}
                      className="inline-flex items-center justify-center flex-1 min-w-[90px] px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Edit2 size={16} className="mr-1" /> Edit
                    </button>
                    {deleteConfirmId === coupon.id ? (
                      <div className="flex flex-1 min-w-[180px] gap-2">
                        <button
                          onClick={() => deleteCoupon(coupon.id)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Ya
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                        >
                          Tidak
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(coupon.id)}
                        className="inline-flex items-center justify-center flex-1 min-w-[90px] px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        <Trash2 size={16} className="mr-1" /> Hapus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">No Urut</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nama Penerima</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">RT/RW</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Alamat</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Waktu Ambil</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCoupons.map((coupon) => (
                  <React.Fragment key={coupon.id}>
                    {editingId === coupon.id ? (
                      // Edit Row
                      <tr className="bg-blue-50">
                        <td className="px-6 py-4 text-sm text-gray-700 font-mono">{coupon.no_urut}</td>
                        <td className="px-6 py-4">
                          <select
                            value={editFormData.status || ''}
                            onChange={(e) => handleEditChange('status', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="kosong">Kosong</option>
                            <option value="terdaftar">Terdaftar</option>
                            <option value="diambil">Diambil</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editFormData.nama_penerima || ''}
                            onChange={(e) => handleEditChange('nama_penerima', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Nama"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editFormData.rt || ''}
                              onChange={(e) => handleEditChange('rt', e.target.value)}
                              className="w-1/2 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="RT"
                            />
                            <input
                              type="text"
                              value={editFormData.rw || ''}
                              onChange={(e) => handleEditChange('rw', e.target.value)}
                              className="w-1/2 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="RW"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editFormData.alamat || ''}
                            onChange={(e) => handleEditChange('alamat', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Alamat"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            <Save size={16} className="mr-1" />
                            Simpan
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                          >
                            <X size={16} className="mr-1" />
                            Batal
                          </button>
                        </td>
                      </tr>
                    ) : (
                      // View Row
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-700">{coupon.no_urut}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusBadge(coupon.status)}`}>
                            {getStatusLabel(coupon.status)}
                          </span>
                        </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="font-medium text-gray-900">{coupon.nama_penerima || '-'}</span>
                      {coupon.photo_penerima && (
                        <button onClick={() => setSelectedPhoto(coupon.photo_penerima)} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-xs font-bold transition-colors shadow-sm" title="Lihat Foto Penerima">
                          <ImageIcon size={14} /> Lihat Foto
                        </button>
                      )}
                    </div>
                  </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {coupon.rt ? `${coupon.rt}/${coupon.rw}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={coupon.alamat}>
                          {coupon.alamat || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {coupon.waktu_ambil ? new Date(coupon.waktu_ambil).toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => viewQRCode(coupon)}
                            className="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                          >
                            <Eye size={16} className="mr-1" />
                            QR
                          </button>
                          <button
                            onClick={() => startEdit(coupon)}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            <Edit2 size={16} className="mr-1" />
                            Edit
                          </button>
                          {deleteConfirmId === coupon.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => deleteCoupon(coupon.id)}
                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                              >
                                Ya
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                              >
                                Tidak
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(coupon.id)}
                              className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              <Trash2 size={16} className="mr-1" />
                              Hapus
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">📱 QR Code Kupon</h2>
              <button
                onClick={closeQRModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {selectedCouponQR && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">No Urut</p>
                  <p className="text-lg font-bold text-gray-900">{selectedCouponQR.no_urut}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium mt-1 ${getStatusBadge(selectedCouponQR.status)}`}>
                    {getStatusLabel(selectedCouponQR.status)}
                  </span>
                </div>

                {selectedCouponQR.nama_penerima && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Penerima</p>
                    <p className="text-gray-900">{selectedCouponQR.nama_penerima}</p>
                  </div>
                )}

                <div className="flex justify-center bg-white p-4 rounded border border-gray-200">
                  {!qrImageUrl || qrImageUrl === 'error' ? (
                    <div className="w-64 h-64 flex items-center justify-center bg-red-50 rounded">
                      <div className="text-center">
                        <p className="text-red-600 font-semibold">❌ Gagal memuat QR Code</p>
                        <p className="text-sm text-red-500 mt-2">Silakan coba lagi</p>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={qrImageUrl} 
                      alt="QR Code" 
                      className="w-64 h-64"
                      onError={() => {
                        console.error('Failed to display QR image');
                        setQrImageUrl('error');
                      }}
                    />
                  )}
                </div>

                <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                  <p className="font-mono text-xs break-all">{selectedCouponQR.qr_secret}</p>
                </div>

                <button
                  onClick={closeQRModal}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Penjelasan Status:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>🔵 <strong>Kosong</strong> - Kupon baru, belum ada data penerima</li>
          <li>🔵 <strong>Terdaftar</strong> - Kupon sudah diisi data penerima, menunggu pengambilan</li>
          <li>🟢 <strong>Diambil</strong> - Kupon sudah diambil (daging diterima)</li>
        </ul>
      </div>

  {/* Modal View Foto */}
  {selectedPhoto && (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
      <div className="relative max-w-2xl w-full bg-white rounded-xl shadow-2xl p-2" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setSelectedPhoto(null)}
          className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow-lg z-10 transition-colors"
        >
          <X size={24} />
        </button>
        <img src={selectedPhoto} alt="Foto Penerima" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
      </div>
    </div>
  )}

      {/* Modal Konfirmasi Hapus Semua */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hapus Semua Kupon?</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus <strong>seluruh ({coupons.length})</strong> data kupon? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                disabled={deletingAll}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={deleteAllCoupons}
                disabled={deletingAll}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {deletingAll ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus Semua'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
