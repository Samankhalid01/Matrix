'use client';
import { useState } from 'react';

const AlertNotification = ({ alerts }) => {
  const [filter, setFilter] = useState('all');

  const getAlertTypeStyle = (type) => {
    switch (type) {
      case 'theft':
        return 'bg-red-100 text-red-800';
      case 'stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'system':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = alerts?.filter(alert => {
    return filter === 'all' || alert.type === filter;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Alerts & Notifications</h2>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Alerts</option>
            <option value="theft">Theft Detection</option>
            <option value="stock">Stock Alerts</option>
            <option value="system">System Alerts</option>
          </select>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {filteredAlerts?.map((alert, index) => (
          <div key={index} className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAlertTypeStyle(alert.type)}`}>
                  {alert.type}
                </span>
                <h3 className="ml-4 text-sm font-medium">{alert.title}</h3>
              </div>
              <span className="text-sm text-gray-500">{alert.time}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{alert.description}</p>
            {alert.type === 'theft' && alert.videoUrl && (
              <div className="mt-4">
                <button className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                  View Recording
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertNotification;
