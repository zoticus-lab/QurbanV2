import React, { useState } from 'react';
import { Download, Plus, AlertCircle } from 'lucide-react';
import { couponService } from '../services/api';
import GenerateCoupons from '../components/Admin/GenerateCoupons';
import PrintCoupons from '../components/Admin/PrintCoupons';

export default function AdminPage() {
  const [generatedCount, setGeneratedCount] = useState(0);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');

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
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-6 py-3 font-semibold border-b-2 transition-all ${
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
          className={`px-6 py-3 font-semibold border-b-2 transition-all ${
            activeTab === 'print'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Download size={20} className="inline mr-2" />
          Cetak & Download
        </button>
      </div>

      {/* Content */}
      {activeTab === 'generate' && (
        <GenerateCoupons onSuccess={handleGenerationSuccess} onError={handleError} />
      )}

      {activeTab === 'print' && (
        <PrintCoupons />
      )}
    </div>
  );
}
