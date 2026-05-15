import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function RegistrationForm({ qr_secret, no_urut, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nama_penerima: '',
    rt: '',
    rw: '',
    alamat: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nama_penerima.trim()) newErrors.nama_penerima = 'Nama harus diisi';
    if (!formData.rt.trim()) newErrors.rt = 'RT harus diisi';
    if (!formData.rw.trim()) newErrors.rw = 'RW harus diisi';
    if (!formData.alamat.trim()) newErrors.alamat = 'Alamat harus diisi';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Registrasi Kupon Baru</h3>
          <p className="text-blue-800 text-sm">Kupon #{no_urut} belum pernah didaftarkan. Silakan isi data penerima kurban.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Penerima Kurban *
          </label>
          <input
            type="text"
            name="nama_penerima"
            value={formData.nama_penerima}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.nama_penerima ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Masukkan nama penerima"
          />
          {errors.nama_penerima && (
            <p className="text-red-600 text-sm mt-1">{errors.nama_penerima}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RT *
            </label>
            <input
              type="text"
              name="rt"
              value={formData.rt}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.rt ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Contoh: 01"
            />
            {errors.rt && <p className="text-red-600 text-sm mt-1">{errors.rt}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RW *
            </label>
            <input
              type="text"
              name="rw"
              value={formData.rw}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.rw ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Contoh: 01"
            />
            {errors.rw && <p className="text-red-600 text-sm mt-1">{errors.rw}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alamat Lengkap *
          </label>
          <textarea
            name="alamat"
            value={formData.alamat}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
              errors.alamat ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            rows="4"
            placeholder="Masukkan alamat lengkap penerima kurban"
          ></textarea>
          {errors.alamat && <p className="text-red-600 text-sm mt-1">{errors.alamat}</p>}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
          >
            ✓ Daftarkan Kupon
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all"
          >
            ✕ Batal
          </button>
        </div>
      </form>
    </div>
  );
}
