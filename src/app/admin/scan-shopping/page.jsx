'use client';

import { useState, useEffect } from 'react';
import QRScanner from '@/components/QRScanner';

export default function ScanShoppingPage() {
  const [activeSession, setActiveSession] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [scanMode, setScanMode] = useState('customer'); // 'customer' or 'product'
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState(null);

  // Load cart when session is active
  useEffect(() => {
    if (customer) {
      loadCart();
    }
  }, [customer]);

  const loadCart = async () => {
    try {
      const response = await fetch(`/api/cart?customerId=${customer.id}`);
      const data = await response.json();

      if (data.success) {
        setCartItems(data.cartItems);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const handleCustomerQRScan = async (qrData) => {
    try {
      setIsScanning(false);
      showMessage('Processing customer QR code...', 'info');

      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerQrCode: qrData })
      });

      const data = await response.json();

      if (data.success) {
        setActiveSession(data.session);
        setCustomer(data.customer);
        setScanMode('product');
        showMessage(`Welcome ${data.customer.customer_name}! Ready to scan products.`, 'success');
      } else {
        showMessage(data.error || 'Failed to start session', 'error');
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Customer scan error:', error);
      showMessage('Failed to process customer QR code', 'error');
      setIsScanning(true);
    }
  };

  const handleProductQRScan = async (qrData) => {
    try {
      setIsScanning(false);
      showMessage('Processing product...', 'info');

      console.log('📦 Raw QR Data:', qrData);

      // Parse QR code data (assuming JSON format)
      let productId;
      try {
        const parsed = JSON.parse(qrData);
        productId = parsed.id || parsed.productId;
        console.log('📦 Parsed JSON, Product ID:', productId);
      } catch {
        // If not JSON, assume it's just the product ID
        productId = qrData;
        console.log('📦 Direct Product ID:', productId);
      }

      console.log('📦 Sending to API - Customer ID:', customer.id, 'Product ID:', productId);

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          productId: productId,
          quantity: 1
        })
      });

      const data = await response.json();
      console.log('📦 API Response:', data);

      if (data.success) {
        showMessage(`✓ ${data.product.product_name} added to cart!`, 'success');
        await loadCart();
        // Ready for next scan
        setTimeout(() => setIsScanning(true), 1500);
      } else {
        console.error('❌ Failed to add product:', data.error);
        showMessage(data.error || 'Failed to add product', 'error');
        setTimeout(() => setIsScanning(true), 2000);
      }
    } catch (error) {
      console.error('Product scan error:', error);
      showMessage('Failed to process product QR code', 'error');
      setTimeout(() => setIsScanning(true), 2000);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      const response = await fetch('/api/session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('Session ended. Cart saved for customer.', 'success');
        setActiveSession(null);
        setCustomer(null);
        setCartItems([]);
        setScanMode('customer');
        setIsScanning(true);
      } else {
        showMessage('Failed to end session', 'error');
      }
    } catch (error) {
      console.error('End session error:', error);
      showMessage('Failed to end session', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">QR Shopping Scanner</h1>
          <p className="text-gray-600 mt-2">Scan customer QR code, then scan products</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' :
            message.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Scanner */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {scanMode === 'customer' ? '1. Scan Customer QR' : '2. Scan Product QR'}
              </h2>
              
              {customer && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                  <p className="text-sm text-green-800 font-semibold">
                    <strong>Customer:</strong> {customer.name || customer.customer_name}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Email:</strong> {customer.email}
                  </p>
                  {customer.address && (
                    <p className="text-sm text-green-700">
                      <strong>Address:</strong> {customer.address}
                    </p>
                  )}
                </div>
              )}
            </div>

            {!isScanning && !customer && (
              <div className="text-center py-8">
                <button
                  onClick={() => setIsScanning(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Start Scanning Customer
                </button>
              </div>
            )}

            {isScanning && (
              <QRScanner
                onScan={scanMode === 'customer' ? handleCustomerQRScan : handleProductQRScan}
                onError={(error) => showMessage(error, 'error')}
                isActive={isScanning}
                scanType={scanMode}
              />
            )}

            {customer && !isScanning && (
              <div className="text-center py-8">
                <button
                  onClick={() => setIsScanning(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition mb-3"
                >
                  Scan Next Product
                </button>
                <button
                  onClick={handleEndSession}
                  className="block w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                >
                  End Session
                </button>
              </div>
            )}
          </div>

          {/* Right: Cart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Shopping Cart</h2>
            
            {!customer ? (
              <div className="text-center text-gray-500 py-12">
                <p>Scan customer QR code to start</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p>Cart is empty</p>
                <p className="text-sm mt-2">Scan products to add them</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border border-gray-200 rounded p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {item.Product?.product_name || 'Product'}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${item.unit_price} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          ${item.total_price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${calculateTotal()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {cartItems.length} item(s)
                  </p>
                  
                  {/* End Session Button in Cart */}
                  <button
                    onClick={handleEndSession}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold shadow-md hover:shadow-lg"
                  >
                    🛑 End Session & Save Cart
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Cart will be saved for customer
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
