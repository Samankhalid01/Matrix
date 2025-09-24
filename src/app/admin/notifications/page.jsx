'use client';
import AlertNotification from '@/components/admin/AlertNotification';

const mockAlerts = [
  {
    type: 'theft',
    title: 'Suspicious Activity Detected',
    description: 'Possible theft attempt detected in Aisle 3',
    time: '5 minutes ago',
    videoUrl: '/video/incident-123'
  },
  {
    type: 'stock',
    title: 'Low Stock Alert',
    description: 'Electronics section - Smartphones running low on stock',
    time: '10 minutes ago'
  },
  {
    type: 'system',
    title: 'System Update Required',
    description: 'New security patch available for installation',
    time: '1 hour ago'
  },
  {
    type: 'theft',
    title: 'Security Alert',
    description: 'Unusual activity detected near jewelry section',
    time: '2 hours ago',
    videoUrl: '/video/incident-124'
  },
  {
    type: 'stock',
    title: 'Restocking Required',
    description: 'Fresh produce section needs restocking',
    time: '3 hours ago'
  }
];

const NotificationsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
            Mark All as Read
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">All Notifications</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">24</p>
          <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Security Alerts</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">5</p>
          <p className="text-sm text-gray-500 mt-1">2 high priority</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Stock Alerts</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">8</p>
          <p className="text-sm text-gray-500 mt-1">Needs attention</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">System Updates</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">2</p>
          <p className="text-sm text-gray-500 mt-1">Available now</p>
        </div>
      </div>

      <AlertNotification alerts={mockAlerts} />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
        <div className="space-y-4">
          {[
            { title: 'Security Alerts', description: 'Get notified about suspicious activities' },
            { title: 'Stock Alerts', description: 'Get notified when items are running low' },
            { title: 'System Updates', description: 'Get notified about system updates' },
            { title: 'Customer Activities', description: 'Get notified about important customer activities' }
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{setting.title}</h3>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
