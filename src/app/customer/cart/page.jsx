'use client';

import { useState, useEffect } from 'react';

export default function CustomerCartPage() {
  const [customerId, setCustomerId] = useState('');
  const [customerQR, setCustomerQR] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCart = async () => {
    if (!customerId) {
      setError('Please enter your customer ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cart?customerId=${customerId}`);
      const data = await response.json();

      if (data.success) {
        setCartItems(data.cartItems);
      } else {
        setError(data.error || 'Failed to load cart');
      }
    } catch (err) {
      console.error('Cart load error:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  return (
      <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] rounded-xl shadow-2xl border-2 border-[#A855F7] p-8 mb-6">
              <h1 className="text-3xl font-bold text-[#A855F7] mb-2 drop-shadow-lg">My Shopping Cart</h1>
              <p className="text-white">View your scanned products</p>
            </div>

        {/* Customer ID Input */}
          <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] rounded-xl shadow-xl border-2 border-[#A855F7] p-6 mb-6">
            <label className="block text-[#A855F7] font-medium mb-2">
              Enter Your Customer ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Customer ID (UUID)"
                className="border border-[#A855F7] bg-[#232136] text-white rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              />
              <button
                onClick={loadCart}
                className="bg-[#A855F7] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#7B1FA2] transition-all duration-200"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load Cart'}
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Cart Items</h2>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Your cart is empty</p>
              <p className="text-sm mt-2">Scanned products will appear here</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    {item.Product?.images && item.Product.images[0] && (
                      <img
                        src={item.Product.images[0]}
                        alt={item.Product.product_name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {item.Product?.product_name || 'Product'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.Product?.description}
                      </p>
                      <p className="text-gray-700 mt-1">
                        <span className="font-medium">${item.unit_price}</span> × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${item.total_price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Items:</span>
                  <span className="font-medium text-gray-800">{cartItems.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Total:</span>
                  <span className="text-3xl font-bold text-green-600">
                    ${calculateTotal()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
