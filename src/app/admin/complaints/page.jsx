'use client';
import { useState, useEffect } from 'react';
import { 
  FiMessageSquare, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiClock, 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiTag,
  FiX,
  FiFilter
} from 'react-icons/fi';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/complaints' 
        : `/api/complaints?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (complaintId) => {
    if (!resolution.trim()) {
      alert('Please provide a resolution message');
      return;
    }

    try {
      setResolving(true);
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution_notes: resolution,
          status: 'resolved',
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Complaint resolved successfully!');
        setSelectedComplaint(null);
        setResolution('');
        fetchComplaints();
      } else {
        alert('Failed to resolve complaint');
      }
    } catch (error) {
      console.error('Error resolving complaint:', error);
      alert('Error resolving complaint');
    } finally {
      setResolving(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-400 bg-green-500/20 border-green-500';
      case 'in-progress': return 'text-blue-400 bg-blue-500/20 border-blue-500';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
      case 'closed': return 'text-gray-400 bg-gray-500/20 border-gray-500';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500';
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
      <div className="p-6 min-h-screen space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
              <FiMessageSquare className="text-purple-400" />
              Customer Complaints
            </h1>
            <p className="text-gray-300 mt-3">
              View and resolve customer complaints efficiently
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 shadow-2xl">
            <div className="text-center">
              <FiMessageSquare className="w-12 h-12 mx-auto text-purple-400 mb-3" />
              <p className="text-4xl font-bold text-white">{stats.total}</p>
              <p className="text-gray-300 mt-2 font-semibold">Total Complaints</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-yellow-500/20 p-6 shadow-2xl">
            <div className="text-center">
              <FiClock className="w-12 h-12 mx-auto text-yellow-400 mb-3" />
              <p className="text-4xl font-bold text-yellow-400">{stats.pending}</p>
              <p className="text-gray-300 mt-2 font-semibold">Pending</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-6 shadow-2xl">
            <div className="text-center">
              <FiAlertCircle className="w-12 h-12 mx-auto text-blue-400 mb-3" />
              <p className="text-4xl font-bold text-blue-400">{stats.inProgress}</p>
              <p className="text-gray-300 mt-2 font-semibold">In Progress</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-green-500/20 p-6 shadow-2xl">
            <div className="text-center">
              <FiCheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
              <p className="text-4xl font-bold text-green-400">{stats.resolved}</p>
              <p className="text-gray-300 mt-2 font-semibold">Resolved</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <FiFilter className="text-purple-400 w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Filter by Status</h3>
          </div>
          <div className="flex gap-3 flex-wrap">
            {['all', 'pending', 'resolved', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                  filter === status
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-purple-500/20'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints List */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FiMessageSquare className="text-purple-400" />
            Complaints ({complaints.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto"></div>
              <p className="text-gray-300 mt-4 font-semibold">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-16">
              <FiCheckCircle className="w-24 h-24 mx-auto text-green-400 mb-4" />
              <p className="text-white text-2xl font-bold">No complaints found</p>
              <p className="text-purple-400 mt-2">All clear!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="bg-gray-700/30 p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-white font-bold text-lg">
                          {complaint.subject || 'No Subject'}
                        </h3>
                        {complaint.priority && (
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority.toUpperCase()}
                          </span>
                        )}
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getStatusColor(complaint.status)}`}>
                          {complaint.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-purple-400 text-sm mb-3 flex items-center gap-2">
                        <FiUser className="w-4 h-4" />
                        {complaint.customerName}
                        <FiMail className="w-4 h-4 ml-2" />
                        {complaint.customerEmail}
                      </p>
                      <p className="text-gray-300 mb-3">{complaint.description}</p>
                      <p className="text-purple-400 text-sm flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        {new Date(complaint.createdAt).toLocaleString()}
                      </p>
                      {complaint.category && (
                        <p className="text-purple-400 text-sm mt-2 flex items-center gap-2">
                          <FiTag className="w-4 h-4" />
                          Category: {complaint.category.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>

                  {complaint.status === 'resolved' && complaint.resolution && (
                    <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl mt-4">
                      <p className="text-green-400 font-bold mb-2 flex items-center gap-2">
                        <FiCheckCircle className="w-5 h-5" />
                        Resolution
                      </p>
                      <p className="text-gray-300 text-sm">{complaint.resolution}</p>
                      <p className="text-green-400 text-xs mt-2">
                        Resolved by {complaint.resolvedBy} on {new Date(complaint.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setResolution('');
                        }}
                        className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-bold shadow-lg flex items-center gap-2 hover:scale-105"
                      >
                        <FiCheckCircle className="w-5 h-5" />
                        Resolve Complaint
                      </button>
                    )}
                    {complaint.status === 'resolved' && (
                      <button
                        onClick={() => handleStatusChange(complaint.id, 'closed')}
                        className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-200 font-bold shadow-lg flex items-center gap-2 hover:scale-105"
                      >
                        <FiX className="w-5 h-5" />
                        Close Complaint
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolution Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl shadow-2xl border border-purple-500/20 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FiMessageSquare className="text-purple-400" />
                  Resolve Complaint
                </h2>
                <button
                  onClick={() => {
                    setSelectedComplaint(null);
                    setResolution('');
                  }}
                  disabled={resolving}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  <FiX className="w-8 h-8" />
                </button>
              </div>
              
              <div className="mb-4 bg-gray-700/30 p-4 rounded-xl border border-purple-500/20">
                <p className="text-purple-400 font-bold mb-2">Subject:</p>
                <p className="text-white">{selectedComplaint.subject}</p>
              </div>

              <div className="mb-6 bg-gray-700/30 p-4 rounded-xl border border-purple-500/20">
                <p className="text-purple-400 font-bold mb-2">Description:</p>
                <p className="text-gray-300">{selectedComplaint.description}</p>
              </div>

              <div className="mb-6">
                <label className="block text-white font-bold mb-3 flex items-center gap-2">
                  <FiCheckCircle className="text-purple-400" />
                  Resolution Message *
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how this complaint was resolved..."
                  className="w-full bg-gray-700/50 border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px] placeholder-gray-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleResolve(selectedComplaint.id)}
                  disabled={resolving || !resolution.trim()}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4 rounded-2xl font-bold hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 hover:scale-105"
                >
                  <FiCheckCircle className="w-5 h-5" />
                  {resolving ? 'Resolving...' : 'Resolve Complaint'}
                </button>
                <button
                  onClick={() => {
                    setSelectedComplaint(null);
                    setResolution('');
                  }}
                  disabled={resolving}
                  className="bg-gray-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-gray-700 transition-all duration-200 shadow-lg hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
