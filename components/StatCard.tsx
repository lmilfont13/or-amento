
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
};

export default StatCard;
