'use client';
import { useState, useEffect } from 'react';
import AlertNotification from '@/components/admin/AlertNotification';
import { AlertModal } from '@/components/Modal';

const NotificationsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    security: 0,
    stock: 0,
    system: 0
  });

  useEffect(() => {
    loadAllNotifications();
  }, []);

  const loadAllNotifications = async () => {
    setLoading(true);
    try {
      // Fetch all three API endpoints in parallel for better performance
      const [notificationsResult, stockAlertsResult, theftAlertsResult] = await Promise.all([
        fetch('/api/surveillance/notifications').then(res => res.json()),
        fetch('/api/notifications/stock-alerts').then(res => res.json()),
        fetch('/api/theft-alerts').then(res => res.json())
      ]);

      // Process surveillance notifications + theft alerts
      let allSecurityAlerts = [];
      
      if (notificationsResult.success) {
        const formattedAlerts = (notificationsResult.notifications || []).map(n => ({
          type: 'theft',
          title: 'Suspicious Activity Detected',
          description: n.description || 'Security alert',
          time: new Date(n.timestamp).toLocaleString(),
          videoUrl: n.video_path
        }));
        allSecurityAlerts = [...allSecurityAlerts, ...formattedAlerts];
      }

      // Add theft alerts from backend
      if (theftAlertsResult.success) {
        const formattedTheftAlerts = (theftAlertsResult.alerts || []).map(alert => ({
          type: 'theft',
          title: '🚨 Theft Detected',
          description: `Suspicious activity detected for customer: ${alert.customer_email} | Confidence: ${(alert.theft_confidence * 100).toFixed(1)}% | Camera: ${alert.camera_id || 'main'}`,
          time: new Date(alert.timestamp).toLocaleString(),
          videoUrl: alert.frame_path || null,
          email: alert.customer_email,
          confidence: alert.theft_confidence,
          reid_confidence: alert.reid_confidence,
          track_id: alert.track_id
        }));
        allSecurityAlerts = [...allSecurityAlerts, ...formattedTheftAlerts];
      }

      setAlerts(allSecurityAlerts);

      // Process stock alerts
      if (stockAlertsResult.success) {
        const formattedStockAlerts = (stockAlertsResult.alerts || []).map(alert => ({
          type: 'stock',
          title: alert.alert_type === 'out-of-stock' ? 'Out of Stock Alert' : 'Low Stock Alert',
          description: `${alert.product_name} - ${alert.message}`,
          time: new Date(alert.created_at).toLocaleString()
        }));
        setStockAlerts(formattedStockAlerts);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const allAlerts = [...alerts, ...stockAlerts].sort((a, b) => 
    new Date(b.time) - new Date(a.time)
  );

  useEffect(() => {
    setStats({
      total: allAlerts.length,
      security: alerts.length,
      stock: stockAlerts.length,
      system: 0
    });
  }, [alerts, stockAlerts, allAlerts.length]);

  const handleMarkAllAsRead = () => {
    setSuccessMessage('All notifications marked as read!');
    setShowSuccessModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-matrix-gray rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-effect p-6 rounded-lg">
                <div className="h-6 bg-matrix-gray rounded w-32 mb-3"></div>
                <div className="h-10 bg-matrix-gray-light rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-matrix-white/60 mt-2">Manage all your alerts and notifications</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-matrix-accent border border-matrix-accent/30 rounded-lg hover:bg-matrix-accent/10 transition-colors"
          >
            Mark All as Read
          </button>
          <button className="px-4 py-2 bg-matrix-accent hover:bg-matrix-accent-dark text-black font-medium rounded-lg transition-colors">
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-effect p-6 rounded-lg hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-matrix-blue/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-matrix-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-matrix-white/70">All Notifications</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-matrix-white/50 mt-2">Total alerts</p>
        </div>

        <div className="glass-effect p-6 rounded-lg hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-matrix-red/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-matrix-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-matrix-white/70">Security Alerts</h3>
          </div>
          <p className="text-4xl font-bold text-matrix-red">{stats.security}</p>
          <p className="text-sm text-matrix-white/50 mt-2">Surveillance incidents</p>
        </div>

        <div className="glass-effect p-6 rounded-lg hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-matrix-yellow/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-matrix-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-matrix-white/70">Stock Alerts</h3>
          </div>
          <p className="text-4xl font-bold text-matrix-yellow">{stats.stock}</p>
          <p className="text-sm text-matrix-white/50 mt-2">Needs attention</p>
        </div>

        <div className="glass-effect p-6 rounded-lg hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-matrix-white/70">System Updates</h3>
          </div>
          <p className="text-4xl font-bold text-green-500">{stats.system}</p>
          <p className="text-sm text-matrix-white/50 mt-2">Available now</p>
        </div>
      </div>

      <AlertNotification alerts={allAlerts} />

      <div className="glass-effect p-6 rounded-lg hover-lift">
        <h2 className="text-2xl font-semibold text-white mb-6">Notification Settings</h2>
        <div className="space-y-4">
          {[
            { title: 'Security Alerts', description: 'Get notified about suspicious activities', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )},
            { title: 'Stock Alerts', description: 'Get notified when items are running low', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            )},
            { title: 'System Updates', description: 'Get notified about system updates', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )},
            { title: 'Customer Activities', description: 'Get notified about important customer activities', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-matrix-gray/30 rounded-lg hover:bg-matrix-gray/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="text-matrix-accent">{setting.icon}</div>
                <div>
                  <h3 className="font-medium text-white">{setting.title}</h3>
                  <p className="text-sm text-matrix-white/60">{setting.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-matrix-gray-light peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-matrix-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-matrix-gray-light after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-matrix-accent"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={successMessage}
        variant="success"
      />
    </div>
  );
};

export default NotificationsPage;
