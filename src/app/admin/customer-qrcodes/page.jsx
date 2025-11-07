'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';

export default function CustomerQRCodesPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers/qrcode');
      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.customers);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const downloadQRCode = (customer) => {
    const link = document.createElement('a');
    link.href = customer.qrCode;
    link.download = `${customer.email.replace(/[^a-z0-9]/gi, '_')}_qrcode.png`;
    link.click();
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'PLATINUM': return 'bg-gray-800 text-white';
      case 'GOLD': return 'bg-yellow-500 text-white';
      case 'SILVER': return 'bg-gray-400 text-white';
      case 'BRONZE': return 'bg-orange-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          {/* Header Shimmer */}
          <div className="mb-6 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>

          {/* Stats Shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-300 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Customer Grid Shimmer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center">
                  <div className="w-48 h-48 bg-gray-300 rounded"></div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-blue-200 rounded"></div>
                  <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Customer QR Codes</h1>
          <p className="text-gray-600 mt-2">
            View and download unique QR codes for all customers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">PLATINUM</p>
            <p className="text-2xl font-bold text-gray-900">
              {customers.filter(c => c.customer_tier === 'PLATINUM').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm">GOLD</p>
            <p className="text-2xl font-bold text-gray-900">
              {customers.filter(c => c.customer_tier === 'GOLD').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-400">
            <p className="text-gray-600 text-sm">SILVER & BRONZE</p>
            <p className="text-2xl font-bold text-gray-900">
              {customers.filter(c => ['SILVER', 'BRONZE'].includes(c.customer_tier)).length}
            </p>
          </div>
        </div>

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getTierColor(customer.customer_tier)}`}>
                  {customer.customer_tier}
                </span>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center">
                <img 
                  src={customer.qrCode} 
                  alt={`QR Code for ${customer.name}`}
                  className="w-48 h-48"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => downloadQRCode(customer)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  📥 Download
                </button>
                <button
                  onClick={() => setSelectedCustomer(customer)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  👁️ View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tier:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getTierColor(selectedCustomer.customer_tier)}`}>
                        {selectedCustomer.customer_tier}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer ID:</span>
                      <span className="ml-2 font-mono text-xs">{selectedCustomer.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="font-semibold text-gray-900 mb-2">QR Code</h3>
                  <img 
                    src={selectedCustomer.qrCode} 
                    alt={`QR Code for ${selectedCustomer.name}`}
                    className="w-64 h-64"
                  />
                  <button
                    onClick={() => downloadQRCode(selectedCustomer)}
                    className="mt-4 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors font-medium"
                  >
                    📥 Download QR Code
                  </button>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">QR Code Data</h4>
                <p className="text-sm text-gray-600 mb-2">This QR code contains:</p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                  <li><strong>Email address ONLY</strong> (plain text)</li>
                  <li>Example: {selectedCustomer.email}</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  Scan this code to get the customer's email address for automatic check-in and personalized offers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
