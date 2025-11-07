'use client';

import { useState } from 'react';

export default function AddCustomerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    customer_tier: 'GOLD'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          address: '',
          customer_tier: 'GOLD'
        });
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (result?.customer?.qrCodeImage) {
      const link = document.createElement('a');
      link.href = result.customer.qrCodeImage;
      link.download = `${result.customer.name}_QR.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">➕ Add New Customer</h1>
          <p className="text-gray-600 mt-2">
            Create a customer and generate their QR code (contains email)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email * (will be in QR code)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="customer@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password (optional)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Address (optional)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Customer Tier
                </label>
                <select
                  value={formData.customer_tier}
                  onChange={(e) => setFormData({ ...formData, customer_tier: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="BRONZE">🥉 Bronze</option>
                  <option value="SILVER">🥈 Silver</option>
                  <option value="GOLD">🥇 Gold</option>
                  <option value="PLATINUM">💎 Platinum</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : '➕ Create Customer & Generate QR'}
              </button>
            </form>
          </div>

          {/* Right: Result */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📋 Result</h2>
            
            {!result && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">📱</div>
                <p>Fill the form and submit to create a customer</p>
              </div>
            )}

            {result && result.success && (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-900 mb-2">✅ Customer Created!</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {result.customer.name}</p>
                    <p><strong>Email:</strong> {result.customer.email}</p>
                    <p><strong>ID:</strong> <code className="text-xs">{result.customer.id}</code></p>
                  </div>
                </div>

                {result.customer.qrCodeImage && (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-2">QR Code (contains email):</p>
                    <img 
                      src={result.customer.qrCodeImage} 
                      alt="Customer QR Code"
                      className="mx-auto border-4 border-gray-200 rounded-lg shadow-lg"
                    />
                    <button
                      onClick={downloadQR}
                      className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                    >
                      💾 Download QR Code
                    </button>
                  </div>
                )}

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>✨ Next Steps:</strong>
                  </p>
                  <ol className="list-decimal list-inside text-sm text-blue-900 mt-2 space-y-1">
                    <li>Download the QR code above</li>
                    <li>Print or save it to your phone</li>
                    <li>Go to <strong>QR Shopping</strong> in sidebar</li>
                    <li>Scan this QR code to start shopping!</li>
                  </ol>
                </div>
              </div>
            )}

            {result && !result.success && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-900 mb-2">❌ Error</h3>
                <p className="text-sm text-red-800">{result.error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/admin/scan-shopping"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 mr-4"
          >
            📱 Go to QR Shopping
          </a>
          <a 
            href="/admin/customers"
            className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700"
          >
            👥 View All Customers
          </a>
        </div>
      </div>
    </div>
  );
}
