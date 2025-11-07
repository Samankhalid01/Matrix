'use client';

import { useState } from 'react';
import QRScanner from '@/components/QRScanner';

export default function TestQRPage() {
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (data) => {
    setScannedData(data);
    setIsScanning(false);
    console.log('Raw QR Data:', data);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed as JSON:', parsed);
    } catch (e) {
      console.log('Not JSON, plain text:', data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">QR Code Test Scanner</h1>
        <p className="text-gray-600 mb-6">Scan your customer QR code to see what data it contains</p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {!isScanning ? (
            <button
              onClick={() => setIsScanning(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Start Scanning
            </button>
          ) : (
            <QRScanner
              onScan={handleScan}
              onError={(error) => console.error('Scanner error:', error)}
              isActive={isScanning}
              scanType="customer"
            />
          )}
        </div>

        {scannedData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Scanned QR Data:</h2>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">Raw Data:</p>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                {scannedData}
              </pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Analysis:</p>
              <div className="text-sm space-y-2">
                {(() => {
                  try {
                    const parsed = JSON.parse(scannedData);
                    return (
                      <div>
                        <p className="text-green-600 font-bold">✓ Valid JSON</p>
                        <pre className="text-xs bg-white p-3 rounded border mt-2 overflow-x-auto">
                          {JSON.stringify(parsed, null, 2)}
                        </pre>
                        {parsed.qr_code && (
                          <p className="mt-2 text-blue-600">Found qr_code field: {parsed.qr_code}</p>
                        )}
                        {parsed.customer_id && (
                          <p className="mt-2 text-blue-600">Found customer_id: {parsed.customer_id}</p>
                        )}
                      </div>
                    );
                  } catch (e) {
                    return (
                      <div>
                        <p className="text-orange-600 font-bold">⚠ Plain Text (not JSON)</p>
                        <p className="mt-2">Length: {scannedData.length} characters</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            <button
              onClick={() => {
                setScannedData(null);
                setIsScanning(true);
              }}
              className="mt-4 w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Scan Another QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
