'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyComplaintsPage() {
  const [customerId, setCustomerId] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchMyComplaints = async () => {
    if (!customerId.trim()) {
      alert('Please enter your Customer ID');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/complaints?customerId=${customerId}`);
      const data = await response.json();

      if (data.success) {
        setComplaints(data.complaints);
        setSearched(true);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] rounded-xl shadow-2xl border-2 border-[#A855F7] p-8 mb-6">
          <h1 className="text-3xl font-bold text-[#A855F7] mb-2 drop-shadow-lg">
            📋 My Complaints
          </h1>
          <p className="text-white">
            Track the status of your submitted complaints
          </p>
        </div>

        {/* Search */}
        <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] rounded-xl shadow-2xl border-2 border-[#A855F7] p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Enter your Customer ID"
              className="flex-1 bg-[#232136] border-2 border-[#A855F7] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
            />
            <button
              onClick={fetchMyComplaints}
              disabled={loading}
              className="bg-gradient-to-r from-[#A855F7] to-[#7B1FA2] text-white px-8 py-3 rounded-lg font-semibold hover:from-[#7B1FA2] hover:to-[#A855F7] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
            <Link
              href="/customer/submit-complaint"
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all duration-200 flex items-center gap-2"
            >
              ➕ New Complaint
            </Link>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] rounded-xl shadow-2xl border-2 border-[#A855F7] p-6">
            <h2 className="text-xl font-semibold text-[#A855F7] mb-6">
              Your Complaints ({complaints.length})
            </h2>

            {complaints.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">📭</p>
                <p className="text-white text-xl">No complaints found</p>
                <p className="text-[#A855F7] mt-2">You haven't submitted any complaints yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className="bg-[#232136] p-6 rounded-lg border-2 border-[#A855F7]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-2">
                          {complaint.subject}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(complaint.status)} inline-block`}>
                          {complaint.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-[#A855F7]">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-white mb-3">{complaint.description}</p>

                    {complaint.status === 'resolved' && complaint.resolution && (
                      <div className="bg-green-500/20 border-2 border-green-500 p-4 rounded-lg mt-4">
                        <p className="text-green-400 font-semibold mb-2">✅ Resolution</p>
                        <p className="text-white text-sm">{complaint.resolution}</p>
                        <p className="text-green-400 text-xs mt-2">
                          Resolved on {new Date(complaint.resolvedAt).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {complaint.status === 'pending' && (
                      <div className="bg-yellow-500/20 border-2 border-yellow-500 p-3 rounded-lg mt-4">
                        <p className="text-yellow-400 text-sm">⏳ Your complaint is pending review</p>
                      </div>
                    )}

                    {complaint.status === 'in-progress' && (
                      <div className="bg-blue-500/20 border-2 border-blue-500 p-3 rounded-lg mt-4">
                        <p className="text-blue-400 text-sm">🔄 We're working on resolving your complaint</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
