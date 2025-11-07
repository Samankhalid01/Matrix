'use client';
import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, Trash2, RefreshCw } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, stock, system
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchNotifications();
    fetchStockAlerts();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?recipient_type=admin');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockAlerts = async () => {
    try {
      const res = await fetch('/api/notifications/stock-alerts');
      const data = await res.json();
      if (data.success) {
        // Filter out resolved alerts, show pending and acknowledged
        const activeAlerts = data.alerts.filter(alert => 
          alert.status !== 'resolved' && alert.resolved !== true
        );
        setStockAlerts(activeAlerts);
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
    if (activeTab === 'system' && notif.notification_type === 'stock_alert') return false;
    if (filterPriority !== 'all' && notif.priority !== filterPriority) return false;
    return true;
  });

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
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-300 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex gap-2 ml-4">
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-8 h-8 text-blue-600" />
            Notifications Center
          </h1>
          <p className="text-gray-600 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchNotifications(); fetchStockAlerts(); }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={unreadCount === 0}
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Critical Stock Alerts Banner */}
      {stockAlerts.length > 0 && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              {stockAlerts.length} Critical Stock Alert{stockAlerts.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <div className="space-y-2">
            {stockAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="flex justify-between items-center bg-white p-3 rounded">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {alert.Product?.name || alert.Product?.product_name || 'Product'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {alert.alert_type === 'out_of_stock' ? 'OUT OF STOCK' : `Only ${alert.current_stock} units left`}
                  </p>
                  {alert.status === 'acknowledged' && (
                    <p className="text-xs text-green-600 mt-1">✓ Acknowledged</p>
                  )}
                </div>
                {alert.status !== 'acknowledged' && alert.status !== 'resolved' && (
                  <button
                    onClick={() => acknowledgeStockAlert(alert.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Acknowledge
                  </button>
                )}
                {alert.status === 'acknowledged' && (
                  <button
                    onClick={() => acknowledgeStockAlert(alert.id)}
                    className="px-3 py-1 bg-gray-300 text-gray-600 text-sm rounded cursor-not-allowed"
                    disabled
                  >
                    Acknowledged
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-2 px-4 ${activeTab === 'stock' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Stock Alerts ({notifications.filter(n => n.notification_type === 'stock_alert').length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-2 px-4 ${activeTab === 'system' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          System Notifications
        </button>
      </div>

      {/* Priority Filter */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 mr-2">Filter by Priority:</label>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-1 border rounded-lg bg-white text-gray-900"
        >
          <option value="all" className="text-gray-900">All</option>
          <option value="critical" className="text-gray-900">Critical</option>
          <option value="high" className="text-gray-900">High</option>
          <option value="medium" className="text-gray-900">Medium</option>
          <option value="low" className="text-gray-900">Low</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border-2 ${
                notif.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-300'
              } ${getPriorityColor(notif.priority)} hover:shadow-md transition`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {notif.priority === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                    {notif.is_read ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-600" />
                    )}
                    <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(notif.priority)}`}>
                      {notif.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{notif.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
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
