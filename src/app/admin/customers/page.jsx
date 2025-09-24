'use client';
import CustomerTable from '@/components/admin/CustomerTable';

const mockCustomers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    lastVisit: '2 hours ago',
    totalSpent: '1,234'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'inactive',
    lastVisit: '1 day ago',
    totalSpent: '2,345'
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    status: 'flagged',
    lastVisit: '3 hours ago',
    totalSpent: '3,456'
  }
];

const CustomersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Total Customers</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">1,234</p>
          <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Active Now</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">56</p>
          <p className="text-sm text-gray-500 mt-1">In store</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Average Spend</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">$123</p>
          <p className="text-sm text-gray-500 mt-1">Per visit</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Flagged</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">3</p>
          <p className="text-sm text-gray-500 mt-1">Requires review</p>
        </div>
      </div>

      <CustomerTable customers={mockCustomers} />
    </div>
  );
};

export default CustomersPage;
