import React, { useEffect, useState } from 'react';
import { PackageOpen, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { dashboardService } from '../services/api';
import StatisticCard from '../components/Dashboard/StatisticCard';
import DistributionChart from '../components/Dashboard/DistributionChart';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getStatistics();
        setStats(response.data.statistics);
        setProgress(response.data.progress);
      } catch (err) {
        setError('Failed to fetch statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  const kosongCount = stats?.kosong || 0;
  const terdaftarCount = stats?.terdaftar || 0;
  const diambilCount = stats?.diambil || 0;
  const totalCount = stats?.total_coupons || 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Ringkasan Distribusi Kurban</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatisticCard
          icon={<PackageOpen size={28} />}
          label="Total Kupon"
          value={totalCount}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatisticCard
          icon={<Clock size={28} />}
          label="Sisa Antrean"
          value={kosongCount}
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatisticCard
          icon={<CheckCircle size={28} />}
          label="Kupon Aktif"
          value={terdaftarCount}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatisticCard
          icon={<TrendingUp size={28} />}
          label="Daging Tersalurkan"
          value={diambilCount}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Grafik Progress Distribusi
        </h2>
        {progress && <DistributionChart data={progress} />}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Persentase Distribusi</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Terdaftar</span>
                <span className="font-semibold">
                  {totalCount > 0 ? ((terdaftarCount / totalCount) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: totalCount > 0 ? ((terdaftarCount / totalCount) * 100) : 0 + '%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Diambil</span>
                <span className="font-semibold">
                  {totalCount > 0 ? ((diambilCount / totalCount) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: totalCount > 0 ? ((diambilCount / totalCount) * 100) : 0 + '%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Kosong</span>
                <span className="font-semibold">
                  {totalCount > 0 ? ((kosongCount / totalCount) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: totalCount > 0 ? ((kosongCount / totalCount) * 100) : 0 + '%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Status Distribusi</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Total Kupon</span>
              <span className="text-2xl font-bold text-blue-600">{totalCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Kupon Aktif (Terdaftar)</span>
              <span className="text-2xl font-bold text-green-600">{terdaftarCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Daging Tersalurkan</span>
              <span className="text-2xl font-bold text-purple-600">{diambilCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">Sisa Antrean</span>
              <span className="text-2xl font-bold text-yellow-600">{kosongCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
