'use client';
import { useState, useEffect, useRef } from 'react';

export default function TheftDetectionPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ camera_active: false, streaming: false, active_customers: 0 });
  const [detections, setDetections] = useState([]);
  const [activeCustomers, setActiveCustomers] = useState([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const videoRef = useRef(null);

  const API_BASE = 'http://localhost:5002';

  // Check system health
  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setStatus(data);
      setIsRunning(data.camera_active);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  // Start camera
  const handleStart = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch(`${API_BASE}/start`, { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setIsRunning(true);
        setMessage({ text: '✅ Camera started successfully!', type: 'success' });
        checkHealth();
      } else {
        setMessage({ text: `❌ ${data.message}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: '❌ Failed to start camera', type: 'error' });
    }
    setLoading(false);
  };

  // Stop camera
  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stop`, { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setIsRunning(false);
        setMessage({ text: '🛑 Camera stopped', type: 'success' });
        checkHealth();
      }
    } catch (error) {
      setMessage({ text: '❌ Failed to stop camera', type: 'error' });
    }
    setLoading(false);
  };

  // Register customer
  const handleRegisterCustomer = async () => {
    if (!customerEmail) {
      setMessage({ text: '❌ Please enter customer email', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ text: `✅ ${data.message}`, type: 'success' });
        setCustomerEmail('');
        fetchActiveCustomers();
      } else {
        setMessage({ text: `❌ ${data.message}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: '❌ Failed to register customer', type: 'error' });
    }
    setLoading(false);
  };

  // Fetch detections
  const fetchDetections = async () => {
    try {
      const res = await fetch(`${API_BASE}/detections`);
      const data = await res.json();
      setDetections(data.detections || []);
    } catch (error) {
      console.error('Failed to fetch detections:', error);
    }
  };

  // Fetch active customers
  const fetchActiveCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/active-customers`);
      const data = await res.json();
      setActiveCustomers(data.customers || []);
    } catch (error) {
      console.error('Failed to fetch active customers:', error);
    }
  };

  // Poll for updates
  useEffect(() => {
    checkHealth();
    const interval = setInterval(() => {
      checkHealth();
      if (isRunning) {
        fetchDetections();
        fetchActiveCustomers();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              Theft Detection System
            </h1>
            <p className="text-gray-400">Real-time theft detection with customer identification</p>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              message.type === 'success' 
                ? 'bg-green-900/20 border-green-500 text-green-400'
                : 'bg-red-900/20 border-red-500 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-2 border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Camera Status</p>
                  <p className="text-2xl font-bold text-white">
                    {status.camera_active ? '🟢 Active' : '🔴 Inactive'}
                  </p>
                </div>
                <div className="text-4xl">🎥</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-2 border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active Customers</p>
                  <p className="text-2xl font-bold text-white">{status.active_customers}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-2 border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Detections</p>
                  <p className="text-2xl font-bold text-white">{detections.length}</p>
                </div>
                <div className="text-4xl">🚨</div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Camera Controls */}
            <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-2 border-purple-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🎮 Camera Controls</h2>
              
              <div className="flex gap-4">
                <button
                  onClick={handleStart}
                  disabled={loading || isRunning}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading && !isRunning ? '⏳ Starting...' : '▶ Start Camera'}
                </button>
                
                <button
                  onClick={handleStop}
                  disabled={loading || !isRunning}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading && isRunning ? '⏳ Stopping...' : '⏹ Stop Camera'}
                </button>
              </div>
            </div>

            {/* Customer Registration via QR */}
            <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-2 border-purple-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">📱 QR Code Registration</h2>
              
              <div className="text-center py-6">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-white text-lg mb-2">Scan Customer QR Code</p>
                <p className="text-gray-400 text-sm">
                  {isRunning ? (
                    <>
                      ✅ Camera is running - Point customer's QR code at camera
                      <br />
                      <span className="text-purple-400">Auto-registers when detected (captures 10 frames)</span>
                    </>
                  ) : (
                    <>
                      ⚠ Start camera first to enable QR scanning
                    </>
                  )}
                </p>
              </div>
              
              <div className="bg-purple-900/20 border-2 border-purple-500/30 rounded-lg p-4">
                <p className="text-gray-300 text-sm">
                  <span className="font-bold text-purple-400">How it works:</span>
                  <br />
                  1. Customer shows QR code to camera
                  <br />
                  2. System auto-detects and verifies customer in database
                  <br />
                  3. Captures 10 frames for face & body embeddings
                  <br />
                  4. Customer registered and tracked automatically
                </p>
              </div>
            </div>
          </div>

          {/* Live Video Feed - UPDATED: QR (Left) & Tracking (Right) side-by-side */}
          {isRunning && (
            <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-2 border-purple-500/30 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">📹 Live Feed</h2>
              <div className="bg-black rounded-lg overflow-hidden border-2 border-purple-500/50">
                <div className="flex flex-col lg:flex-row w-full">
                  {/* Left: QR scan pane */}
                  <div className="w-full lg:w-1/2 border-r border-purple-700/30 p-2">
                    <div className="text-sm text-gray-300 mb-2">QR Entry (Left)</div>
                    <img
                      ref={videoRef}
                      src={`${API_BASE}/feed/qr`}
                      alt="QR Entry Feed"
                      className="w-full h-auto"
                    />
                  </div>

                  {/* Right: Tracking pane */}
                  <div className="w-full lg:w-1/2 p-2">
                    <div className="text-sm text-gray-300 mb-2">Tracking (Right)</div>
                    <img
                      src={`${API_BASE}/feed/tracking`}
                      alt="Tracking Feed"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detection History & Active Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Detection History */}
            <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-2 border-purple-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🚨 Recent Detections</h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {detections.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No detections yet</p>
                ) : (
                  detections.slice().reverse().map((det, idx) => (
                    <div key={idx} className="bg-red-900/20 border-2 border-red-500 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-red-400 font-bold text-lg">{det.email}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(det.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          THEFT
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Confidence:</span>
                          <span className="text-white font-semibold ml-2">{(det.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">ReID Score:</span>
                          <span className="text-white font-semibold ml-2">{(det.reid_score * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      {det.alert_id && (
                        <p className="text-purple-400 text-xs mt-2">Alert ID: {det.alert_id}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Customers */}
            <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-2 border-purple-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">👥 Active Customers</h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeCustomers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active customers</p>
                ) : (
                  activeCustomers.map((customer, idx) => (
                    <div key={idx} className="bg-green-900/20 border-2 border-green-500 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-green-400 font-bold text-lg">{customer.email}</p>
                          <p className="text-gray-400 text-sm">
                            Last seen: {new Date(customer.last_seen * 1000).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}