'use client';

import { useState, useEffect } from 'react';
import { AlertModal, ConfirmModal } from '@/components/Modal';
import { 
  FiUsers, 
  FiPlus, 
  FiMail, 
  FiPhone,
  FiUser,
  FiDownload,
  FiX,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: ''
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const CUSTOMERS_PER_PAGE = 8;

  useEffect(() => {
    loadCustomers();
  }, [currentPage]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers?page=${currentPage}&limit=${CUSTOMERS_PER_PAGE}`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers);
        setTotalCustomers(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setModalMessage('Customer created successfully!');
        setShowSuccessModal(true);
        setFormData({ customer_name: '', email: '', phone: '' });
        setShowForm(false);
        setSelectedCustomer(data.customer);
        loadCustomers();
      } else {
        setModalMessage('Failed to create customer: ' + data.error);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setModalMessage('Failed to create customer');
      setShowErrorModal(true);
    }
  };

  const handleViewQR = async (customerId) => {
    try {
      const response = await fetch(`/api/customers?id=${customerId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedCustomer(data.customer);
      }
    } catch (error) {
      console.error('Failed to get customer QR:', error);
    }
  };

  const handleDownloadQR = () => {
    if (!selectedCustomer?.qrCodeImage) return;

    const customerName = selectedCustomer.name || selectedCustomer.customer_name || 'customer';
    const link = document.createElement('a');
    link.href = selectedCustomer.qrCodeImage;
    link.download = `${customerName.replace(/\s+/g, '_')}_QR.png`;
    link.click();
  };

  return (
    <div className="p-6 min-h-screen space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
              <FiUsers className="text-purple-400" />
              Customers
            </h1>
            <p className="text-gray-300 mt-2">Manage customer accounts and QR codes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/50 flex items-center gap-2 hover:scale-105"
          >
            {showForm ? (
              <>
                <FiX className="w-5 h-5" />
                Cancel
              </>
            ) : (
              <>
                <FiPlus className="w-5 h-5" />
                New Customer
              </>
            )}
          </button>
        </div>

        {/* Create Customer Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FiUser className="text-purple-400" />
              Create New Customer
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-300 font-semibold mb-2 flex items-center gap-2">
                  <FiUser className="text-purple-400" />
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                  placeholder="Enter customer name"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-2 flex items-center gap-2">
                  <FiMail className="text-purple-400" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-2 flex items-center gap-2">
                  <FiPhone className="text-purple-400" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2 hover:scale-105"
              >
                <FiCheckCircle className="w-5 h-5" />
                Create Customer & Generate QR Code
              </button>
            </form>
          </div>
        )}

        {/* Selected Customer QR Code */}
        {selectedCustomer && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-3">
                  <FiUser className="text-purple-400" />
                  {selectedCustomer.name || selectedCustomer.customer_name || 'Customer'}
                </h2>
                {selectedCustomer.email && (
                  <p className="text-gray-300 flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-purple-400" />
                    {selectedCustomer.email}
                  </p>
                )}
                {(selectedCustomer.address || selectedCustomer.phone) && (
                  <p className="text-gray-300 flex items-center gap-2 mt-1">
                    <FiPhone className="w-4 h-4 text-purple-400" />
                    {selectedCustomer.address || selectedCustomer.phone}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-3">
                  ID: {selectedCustomer.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center">
              <div className="bg-white p-4 rounded-2xl inline-block mb-6">
                <img
                  src={selectedCustomer.qrCodeImage}
                  alt="Customer QR Code"
                  className="mx-auto"
                />
              </div>
              <button
                onClick={handleDownloadQR}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg shadow-purple-500/50 flex items-center gap-2 mx-auto hover:scale-105"
              >
                <FiDownload className="w-5 h-5" />
                Download QR Code
              </button>
              <p className="text-sm text-gray-400 mt-4 flex items-center justify-center gap-2">
                <FiAlertCircle className="w-4 h-4" />
                Customer can scan this QR code at checkout
              </p>
            </div>
          </div>
        )}

        {/* Customers List */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-purple-500/20">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiUsers className="text-purple-400" />
              All Customers ({totalCustomers})
            </h2>
          </div>
          <table className="min-w-full divide-y divide-purple-500/20">
            <thead className="bg-gray-700/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4" />
                    Contact
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    Created
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-5 bg-gray-700/50 rounded-xl w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-700/30 rounded-lg w-40 mb-2"></div>
                        <div className="h-3 bg-gray-700/20 rounded-lg w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-700/30 rounded-lg w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-10 w-32 bg-gray-700/30 rounded-xl"></div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <FiUsers className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">No customers yet</p>
                    <p className="text-gray-500 text-sm mt-2">Create your first customer to get started</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-purple-500/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {customer.name || customer.customer_name || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">{customer.email || '-'}</div>
                      <div className="text-sm text-gray-500">{customer.address || customer.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewQR(customer.id)}
                        className="bg-purple-500/20 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-xl hover:bg-purple-500/30 transition-all font-medium flex items-center gap-2 hover:scale-105"
                      >
                        <FiDownload className="w-4 h-4" />
                        View QR
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-purple-500/20 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {((currentPage - 1) * CUSTOMERS_PER_PAGE) + 1} to {Math.min(currentPage * CUSTOMERS_PER_PAGE, totalCustomers)} of {totalCustomers} customers
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-500/20"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg'
                            : 'bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-500/20"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <AlertModal 
          isOpen={showSuccessModal} 
          onClose={() => setShowSuccessModal(false)} 
          title="Success" 
          message={modalMessage} 
          variant="success" 
        />
        <AlertModal 
          isOpen={showErrorModal} 
          onClose={() => setShowErrorModal(false)} 
          title="Error" 
          message={modalMessage} 
          variant="error" 
        />
      </div>
  );
}
