'use client';

import { useState, useEffect } from 'react';
import QRScanner from '@/components/QRScanner';
import { 
  FiCamera, 
  FiUser, 
  FiShoppingCart, 
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrash2,
  FiLogOut,
  FiDollarSign
} from 'react-icons/fi';

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

      console.log('========================================');
      console.log('📦 PRODUCT QR SCAN STARTED');
      console.log('📦 Raw QR Data:', qrData);
      console.log('📦 Data Type:', typeof qrData);
      console.log('📦 Data Length:', qrData?.length);

      // NEW: Parse JSON format with product_id, product_name, price
      let productId;
      let productName;
      let productPrice;

      try {
        const parsed = JSON.parse(qrData);
        console.log('📦 Parsed JSON:', parsed);
        
        // Extract product_id from JSON
        productId = parsed.product_id || parsed.id || parsed.productId;
        productName = parsed.product_name || parsed.name;
        productPrice = parsed.price;
        
        console.log('📦 Extracted Data:');
        console.log('   - Product ID:', productId);
        console.log('   - Product Name:', productName);
        console.log('   - Price:', productPrice);

        if (!productId) {
          throw new Error('No product_id found in QR data');
        }

      } catch (parseError) {
        console.error('❌ Failed to parse QR as JSON:', parseError.message);
        console.log('📦 Attempting direct ID extraction...');
        
        // Fallback: try to extract numeric ID
        const numMatch = qrData.match(/\d+/);
        if (numMatch) {
          productId = parseInt(numMatch[0]);
          console.log('📦 Extracted numeric ID:', productId);
        } else {
          console.error('❌ Could not extract product ID from:', qrData);
          showMessage('Invalid product QR code - no product ID found', 'error');
          setTimeout(() => setIsScanning(true), 2000);
          return;
        }
      }

      console.log('� Sending to Cart API:');
      console.log('   - Customer ID:', customer.id);
      console.log('   - Product ID:', productId);
      console.log('   - Quantity:', 1);
      console.log('========================================');

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
      
      console.log('========================================');
      console.log('📦 CART API RESPONSE');
      console.log('Status:', response.status);
      console.log('Success:', data.success);
      console.log('Data:', data);
      console.log('========================================');

      if (data.success) {
        const displayName = productName || data.product?.product_name || 'Product';
        showMessage(`✓ ${displayName} added to cart!`, 'success');
        await loadCart();
        // Ready for next scan
        setTimeout(() => setIsScanning(true), 1500);
      } else {
        console.error('❌ API Error:', data.error);
        showMessage(data.error || 'Failed to add product', 'error');
        setTimeout(() => setIsScanning(true), 2000);
      }
    } catch (error) {
      console.error('========================================');
      console.error('❌ PRODUCT SCAN ERROR');
      console.error('Error:', error);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('========================================');
      showMessage('Failed to process product QR code: ' + error.message, 'error');
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

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      const response = await fetch(`/api/cart?cartItemId=${cartItemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        showMessage('Item removed from cart', 'success');
        await loadCart();
      } else {
        showMessage(data.error || 'Failed to remove item', 'error');
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      showMessage('Failed to remove item', 'error');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg flex items-center gap-3">
          <FiCamera className="text-purple-400" />
          QR Shopping Scanner
        </h1>
        <p className="text-gray-300 mt-2">Scan customer QR code to start, then scan products to add them to cart</p>
      </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-slide-down ${
            message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
            message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
            'bg-blue-500/10 text-blue-400 border-blue-500/30'
          }`}>
            {message.type === 'success' ? <FiCheckCircle className="w-5 h-5 flex-shrink-0" /> :
             message.type === 'error' ? <FiXCircle className="w-5 h-5 flex-shrink-0" /> :
             <FiAlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Scanner */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                {scanMode === 'customer' ? (
                  <>
                    <FiUser className="text-purple-400" />
                    <span>Step 1: Scan Customer QR</span>
                  </>
                ) : (
                  <>
                    <FiPackage className="text-pink-400" />
                    <span>Step 2: Scan Product QR</span>
                  </>
                )}
              </h2>
              
              {customer && (
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <FiUser className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Active Customer</p>
                      <p className="text-lg font-bold text-white">{customer.name || customer.customer_name}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300 flex items-center gap-2">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-green-400">{customer.email}</span>
                    </p>
                    {customer.address && (
                      <p className="text-gray-300 flex items-center gap-2">
                        <span className="text-gray-400">Address:</span>
                        <span className="text-green-400">{customer.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!isScanning && !customer && (
              <div className="text-center py-12">
                <div className="mb-6">
                  <FiCamera className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                  <p className="text-gray-400 mb-6">Ready to start scanning</p>
                </div>
                <button
                  onClick={() => setIsScanning(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/50 font-semibold flex items-center gap-2 mx-auto hover:scale-105"
                >
                  <FiCamera className="w-5 h-5" />
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
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50 font-semibold flex items-center gap-2 mx-auto mb-4 hover:scale-105"
                >
                  <FiPackage className="w-5 h-5" />
                  Scan Next Product
                </button>
                <button
                  onClick={handleEndSession}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all font-semibold flex items-center gap-2 justify-center hover:scale-105"
                >
                  <FiLogOut className="w-5 h-5" />
                  End Session
                </button>
              </div>
            )}
          </div>

          {/* Right: Cart */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FiShoppingCart className="text-purple-400" />
              Shopping Cart
            </h2>
            
            {!customer ? (
              <div className="text-center py-16">
                <FiShoppingCart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">Scan customer QR code to start</p>
                <p className="text-gray-500 text-sm mt-2">Customer must be identified before shopping</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16">
                <FiPackage className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">Cart is empty</p>
                <p className="text-gray-500 text-sm mt-2">Scan products to add them to cart</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border border-purple-500/20 rounded-2xl p-4 bg-gray-700/20 hover:bg-gray-700/30 transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <FiPackage className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white mb-1">
                          {item.Product?.product_name || 'Product'}
                        </p>
                        <p className="text-sm text-gray-400">
                          <span className="text-purple-400">${item.unit_price}</span> × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <p className="font-bold text-xl text-white">
                          ${item.total_price}
                        </p>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all hover:scale-110"
                          title="Remove from cart"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-purple-500/20 pt-6">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white font-semibold">${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-purple-500/20">
                      <span className="text-gray-400 text-sm">{cartItems.length} item(s)</span>
                      <span className="text-green-400 text-sm">Tax included</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white flex items-center gap-2">
                        <FiDollarSign className="text-purple-400" />
                        Total
                      </span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ${calculateTotal()}
                      </span>
                    </div>
                  </div>
                  
                  {/* End Session Button in Cart */}
                  <button
                    onClick={handleEndSession}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-4 rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all font-bold shadow-lg shadow-red-500/50 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <FiLogOut className="w-5 h-5" />
                    End Session & Save Cart
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                    <FiCheckCircle className="w-3 h-3" />
                    Cart will be saved for customer
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
    </div>
  );
}
