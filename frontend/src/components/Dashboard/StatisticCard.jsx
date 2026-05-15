import React from 'react';

export default function StatisticCard({ icon, label, value, bgColor, iconColor }) {
  return (
    <div className={`${bgColor} rounded-lg p-6 flex items-start gap-4`}>
      <div className={`${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
