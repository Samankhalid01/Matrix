'use client';

import { useState, useEffect } from 'react';
import QRScanner from '@/components/QRScanner';

export default function DebugCustomerQR() {
  const [scannedData, setScannedData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/debug-customers');
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data) => {
    setScannedData(data);
    setIsScanning(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const updateCustomerQR = async (customerId, newQRCode) => {
    if (!confirm(`Update customer ${customerId} QR code to: ${newQRCode}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/customers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customerId,
          qr_code: newQRCode
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Customer QR code updated successfully!');
        loadCustomers();
        setScannedData(null);
      } else {
        alert('❌ Failed to update: ' + data.error);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🔍 Debug Customer QR Codes</h1>
          <p className="text-gray-600 mt-2">
            Scan your customer QR code and match it with your database
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Scanner */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📱 Scan Customer QR Code</h2>
            
            {!isScanning && !scannedData && (
              <button
                onClick={() => setIsScanning(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Start Scanner
              </button>
            )}

            {isScanning && (
              <div>
                <QRScanner onScan={handleQRScan} />
                <button
                  onClick={() => setIsScanning(false)}
                  className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
                >
                  Stop Scanner
                </button>
              </div>
            )}

            {scannedData && (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-900 mb-2">✅ QR Code Scanned!</h3>
                  <div className="bg-white p-3 rounded border border-green-200 font-mono text-sm break-all text-gray-900">
                    {scannedData}
                  </div>
                  <button
                    onClick={() => copyToClipboard(scannedData)}
                    className="mt-2 text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    📋 Copy to Clipboard
                  </button>
                </div>

                <button
                  onClick={() => { setScannedData(null); setIsScanning(true); }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Scan Another
                </button>
              </div>
            )}
          </div>

          {/* Right: Customers List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">👥 Customers in Database</h2>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading customers...</div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No customers found. Add customers first!
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {customers.map((customer) => (
                  <div 
                    key={customer.id}
                    className={`border-2 rounded-lg p-4 ${
                      scannedData && scannedData.trim().toLowerCase() === customer.email.toLowerCase()
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{customer.name}</h3>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        {customer.address && (
                          <p className="text-sm text-gray-600">📍 {customer.address}</p>
                        )}
                        {customer.customer_tier && (
                          <p className="text-xs text-blue-600 font-semibold mt-1">
                            🎯 Tier: {customer.customer_tier}
                          </p>
                        )}
                        
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 font-semibold">QR Code Contains:</p>
                          <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all text-gray-900">
                            {customer.email}
                          </div>
                        </div>

                        {scannedData && scannedData.trim().toLowerCase() === customer.email.toLowerCase() && (
                          <div className="mt-2 text-sm font-semibold text-green-600">
                            ✅ MATCH! This is the correct customer
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => copyToClipboard(customer.email)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="Copy email"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">📖 How to Fix "Customer Not Found" Error:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-900">
            <li>Click <strong>"Start Scanner"</strong> above</li>
            <li>Hold your customer QR code (test_qr2.png) to the camera</li>
            <li>The scanned value will appear in green box</li>
            <li>Look at the customers list on the right</li>
            <li>Find the customer that should match your QR code</li>
            <li>Click <strong>"🔄 Update to Scanned QR"</strong> to sync the database</li>
            <li>Go back to <strong>/admin/scan-shopping</strong> and scan again - it will work!</li>
          </ol>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="/admin/scan-shopping"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            ← Back to QR Shopping
          </a>
        </div>
      </div>
    </div>
  );
}
