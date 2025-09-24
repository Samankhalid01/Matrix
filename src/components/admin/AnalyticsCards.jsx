'use client';

const StatsCard = ({ title, value, trend, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
        </div>
        <div className={`text-2xl ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};

const AnalyticsCards = () => {
  const stats = [
    {
      title: 'Current Store Visitors',
      value: '24',
      trend: 12,
      icon: '👥'
    },
    {
      title: 'Today\'s Sales',
      value: '$2,456',
      trend: 8,
      icon: '💰'
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8/5',
      trend: 2,
      icon: '⭐'
    },
    {
      title: 'Alerts',
      value: '3',
      trend: -5,
      icon: '🔔'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default AnalyticsCards;
