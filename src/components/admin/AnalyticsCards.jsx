'use client';

const StatsCard = ({ title, value, trend, icon, color = 'purple' }) => {
  const trendPositive = trend > 0;
  return (
    <div className="relative bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] p-6 rounded-xl shadow-2xl border-2 border-[#A855F7] overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg`} style={{background: {
        purple: 'linear-gradient(180deg,#a855f7,#8b5cf6)',
        blue: 'linear-gradient(180deg,#60a5fa,#3b82f6)',
        green: 'linear-gradient(180deg,#86efac,#10b981)',
        yellow: 'linear-gradient(180deg,#fde68a,#f59e0b)'
      }[color]}} />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="text-2xl font-semibold mt-2 text-white">{value}</p>
        </div>
        <div className={`text-2xl ${trendPositive ? 'text-green-400' : 'text-red-400'}`}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center relative z-10">
          <span className={`text-sm ${trendPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trendPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-sm text-gray-400 ml-2">vs last month</span>
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
      
    },
    {
      title: 'Today\'s Sales',
      value: '$2,456',
      trend: 8,
      
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8/5',
      trend: 2,
      
    },
    {
      title: 'Alerts',
      value: '3',
      trend: -5,
      
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
