'use client';
import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, Trash2, RefreshCw, Package, TrendingUp, ShoppingCart, AlertCircle, Info } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [theftAlerts, setTheftAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, stock, sales, system
  const [filterPriority, setFilterPriority] = useState('all');
  const [statusCounts, setStatusCounts] = useState({ pending: 0, acknowledged: 0, resolved: 0, total: 0, critical: 0, low_stock: 0 });

  useEffect(() => {
    fetchNotifications();
    fetchStockAlerts();
    fetchTheftAlerts();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?recipient_type=admin&auto_generate=true');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTheftAlerts = async () => {
    try {
      const res = await fetch('/api/theft-alerts?limit=50');
      const data = await res.json();
      if (data.success) {
        setTheftAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching theft alerts:', error);
    }
  };

  const fetchStockAlerts = async () => {
    try {
      const res = await fetch('/api/notifications/stock-alerts?auto_generate=true');
      const data = await res.json();
      if (data.success) {
        // Filter out resolved alerts, show pending and acknowledged
        const activeAlerts = (data.alerts || []).filter(alert => 
          alert.status !== 'resolved' && alert.resolved !== true
        );
        setStockAlerts(activeAlerts);
        setStatusCounts(data.statusCounts || { pending: 0, acknowledged: 0, resolved: 0, total: 0, critical: 0, low_stock: 0 });
      }
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true, recipientType: 'admin' })
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const res = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const acknowledgeStockAlert = async (alertId) => {
    try {
      console.log('Acknowledging alert:', alertId);
      const res = await fetch('/api/notifications/stock-alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          alertId, 
          status: 'resolved'
          // Note: acknowledged_by expects UUID, so we'll set it in the API
        })
      });
      
      const data = await res.json();
      console.log('Acknowledge response:', data);
      
      if (res.ok && data.success) {
        // Refresh both alerts and notifications
        await fetchStockAlerts();
        await fetchNotifications();
      } else {
        console.error('Failed to acknowledge:', data.error);
        alert('Failed to acknowledge alert: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      alert('Error acknowledging alert: ' + error.message);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'stock' && notif.notification_type !== 'stock_alert') return false;
    if (activeTab === 'sales' && notif.notification_type !== 'sales_milestone') return false;
    if (activeTab === 'system' && (notif.notification_type === 'stock_alert' || notif.notification_type === 'sales_milestone')) return false;
    if (filterPriority !== 'all' && notif.priority !== filterPriority) return false;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'stock_alert': return <Package className="w-5 h-5 text-red-400" />;
      case 'sales_milestone': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'order': return <ShoppingCart className="w-5 h-5 text-blue-400" />;
      default: return <Info className="w-5 h-5 text-purple-400" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Shimmer */}
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64"></div>
          <div className="h-10 bg-blue-200 rounded w-32"></div>
        </div>

        {/* Filters Shimmer */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Notifications Shimmer */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-2 border-[#A855F7]/30 rounded-lg shadow-sm p-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-5 bg-[#A855F7]/20 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[#A855F7]/10 rounded w-full mb-2"></div>
                  <div className="h-3 bg-[#A855F7]/10 rounded w-32"></div>
                </div>
                <div className="flex gap-2 ml-4">
                  <div className="h-8 w-20 bg-[#A855F7]/10 rounded"></div>
                  <div className="h-8 w-8 bg-[#A855F7]/10 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-purple-400" />
            Notifications Center
          </h1>
          <p className="text-gray-300 mt-2 font-semibold">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { fetchNotifications(); fetchStockAlerts(); fetchTheftAlerts(); }}
            className="px-5 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 flex items-center gap-2 border border-purple-500/30 transition-all hover:scale-105 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-[#A855F7] text-white rounded-lg hover:bg-[#7B1FA2]"
            disabled={unreadCount === 0}
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Critical Theft Alerts Banner */}
      {theftAlerts.length > 0 && (
        <div className="mb-6 bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/30 border-2 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
            <h2 className="text-xl font-bold text-red-400">
              🚨 {theftAlerts.length} Theft Alert{theftAlerts.length !== 1 ? 's' : ''} Detected
            </h2>
          </div>
          <div className="space-y-3">
            {theftAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex justify-between items-start bg-red-500/10 border border-red-500/30 p-4 rounded-lg hover:bg-red-500/20 transition-all">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse mt-1"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-white text-lg">Suspicious Activity Detected</p>
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                        CRITICAL
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-red-300 font-semibold">📧 Customer Email:</span>
                        <span className="text-white font-mono bg-red-900/40 px-3 py-1 rounded border border-red-500/40">
                          {alert.customer_email}
                        </span>
                      </div>
                      {alert.theft_confidence && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-300 font-semibold">⚠️ Theft Confidence:</span>
                          <span className="text-yellow-400 font-bold">
                            {(alert.theft_confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {alert.reid_confidence && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-300 font-semibold">🎯 Re-ID Confidence:</span>
                          <span className="text-yellow-400 font-bold">
                            {(alert.reid_confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {alert.camera_id && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-300 font-semibold">📹 Camera:</span>
                          <span className="text-white">{alert.camera_id}</span>
                        </div>
                      )}
                      {alert.track_id && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-300 font-semibold">🔢 Track ID:</span>
                          <span className="text-white">#{alert.track_id}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-red-300" />
                        <span className="text-red-200 text-sm">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {alert.frame_path && (
                  <button
                    onClick={() => window.open(alert.frame_path, '_blank')}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    View Frame
                  </button>
                )}
              </div>
            ))}
            {theftAlerts.length > 5 && (
              <p className="text-center text-red-300 text-sm pt-2 font-semibold">
                ⚠️ + {theftAlerts.length - 5} more theft alerts - Review immediately!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Critical Stock Alerts Banner */}
      {stockAlerts.length > 0 && (
        <div className="mb-6 bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-2 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-red-400">
              {stockAlerts.length} Critical Stock Alert{stockAlerts.length !== 1 ? 's' : ''}
            </h2>
            <span className="text-sm text-white/60 ml-2">
              ({statusCounts.critical || 0} out of stock, {statusCounts.low_stock || 0} low stock)
            </span>
          </div>
          <div className="space-y-2">
            {stockAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex justify-between items-center bg-[#A855F7]/10 border border-[#A855F7]/30 p-3 rounded">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${alert.alert_type === 'out_of_stock' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                  <div>
                    <p className="font-medium text-white">
                      {alert.Product?.product_name || alert.Product?.name || 'Unknown Product'}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`${alert.alert_type === 'out_of_stock' ? 'text-red-400 font-bold' : 'text-yellow-400'}`}>
                        {alert.alert_type === 'out_of_stock' ? '⚠️ OUT OF STOCK' : `⚡ ${alert.current_stock} units left`}
                      </span>
                      {alert.Product?.category && (
                        <span className="text-white/50">• {alert.Product.category}</span>
                      )}
                      {alert.Product?.price && (
                        <span className="text-white/50">• ${parseFloat(alert.Product.price).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
                {alert.status === 'acknowledged' ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded">
                    ✓ Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => acknowledgeStockAlert(alert.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))}
            {stockAlerts.length > 5 && (
              <p className="text-center text-white/60 text-sm pt-2">
                + {stockAlerts.length - 5} more alerts
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-[#A855F7]/30 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'all' ? 'border-b-2 border-[#A855F7] text-[#A855F7]' : 'text-white/60'}`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-2 px-4 whitespace-nowrap flex items-center gap-1 ${activeTab === 'stock' ? 'border-b-2 border-[#A855F7] text-[#A855F7]' : 'text-white/60'}`}
        >
          <Package className="w-4 h-4" />
          Stock Alerts ({notifications.filter(n => n.notification_type === 'stock_alert').length})
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-2 px-4 whitespace-nowrap flex items-center gap-1 ${activeTab === 'sales' ? 'border-b-2 border-[#A855F7] text-[#A855F7]' : 'text-white/60'}`}
        >
          <TrendingUp className="w-4 h-4" />
          Sales Alerts ({notifications.filter(n => n.notification_type === 'sales_milestone').length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-2 px-4 whitespace-nowrap flex items-center gap-1 ${activeTab === 'system' ? 'border-b-2 border-[#A855F7] text-[#A855F7]' : 'text-white/60'}`}
        >
          <Info className="w-4 h-4" />
          System
        </button>
      </div>

      {/* Priority Filter */}
      <div className="mb-4">
        <label className="text-sm text-white/70 mr-2">Filter by Priority:</label>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-1 border border-[#A855F7]/30 rounded-lg bg-[#232136] text-white"
        >
          <option value="all" className="text-white bg-[#232136]">All</option>
          <option value="critical" className="text-white bg-[#232136]">Critical</option>
          <option value="high" className="text-white bg-[#232136]">High</option>
          <option value="medium" className="text-white bg-[#232136]">Medium</option>
          <option value="low" className="text-white bg-[#232136]">Low</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-2 border-[#A855F7]/30 rounded-lg">
            <Bell className="w-12 h-12 text-[#A855F7] mx-auto mb-2" />
            <p className="text-white/60">No notifications found</p>
            <p className="text-white/40 text-sm mt-1">Check back later for updates on stock levels and sales</p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                notif.is_read 
                  ? 'bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-[#A855F7]/20 opacity-80' 
                  : 'bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] border-[#A855F7]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {getNotificationIcon(notif.notification_type)}
                    {notif.priority === 'critical' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    {notif.is_read ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                    )}
                    <h3 className="font-semibold text-white">{notif.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(notif.priority)}`}>
                      {notif.priority}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300">
                      {notif.notification_type?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-white/80 mb-2">{notif.message}</p>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                    {notif.action_url && (
                      <a href={notif.action_url} className="text-purple-400 hover:underline">
                        View Details →
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded hover:bg-green-500/30 transition"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

