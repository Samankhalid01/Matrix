'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SubmitComplaintPage() {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          customerId: '',
          customerName: '',
          customerEmail: '',
          subject: '',
          description: '',
          category: 'other',
          priority: 'medium',
        });
      } else {
        setError(data.error || 'Failed to submit complaint');
      }
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
      console.error('Error submitting complaint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] rounded-xl shadow-2xl border-2 border-[#A855F7] p-8 mb-6">
          <h1 className="text-3xl font-bold text-[#A855F7] mb-2 drop-shadow-lg">
            💬 Submit a Complaint
          </h1>
          <p className="text-white">
            We're here to help. Please describe your issue and we'll get back to you soon.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/20 border-2 border-green-500 p-6 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <p className="text-green-400 font-bold text-lg">Complaint Submitted Successfully!</p>
                <p className="text-white">We'll review your complaint and get back to you soon.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 p-4 rounded-xl mb-6">
            <p className="text-red-400">❌ {error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#181028] via-[#232136] to-[#2a1439] rounded-xl shadow-2xl border-2 border-[#A855F7] p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Customer ID */}
            <div>
              <label className="block text-[#A855F7] font-semibold mb-2">
                Customer ID *
              </label>
              <input
                type="text"
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
                placeholder="Your customer ID"
                className="w-full bg-[#232136] border-2 border-[#A855F7] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-[#A855F7] font-semibold mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className="w-full bg-[#232136] border-2 border-[#A855F7] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[#A855F7] font-semibold mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="w-full bg-[#232136] border-2 border-[#A855F7] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[#A855F7] font-semibold mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-[#232136] border-2 border-[#A855F7] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              >
                <option value="product">Product Issue</option>
                <option value="service">Service Issue</option>
                <option value="billing">Billing Issue</option>
                <option value="delivery">Delivery Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[#A855F7] font-semibold mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-[#232136] border-2 border-[#A855F7] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-[#A855F7] font-semibold mb-2">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Brief summary of your complaint"
              className="w-full bg-[#232136] border-2 border-[#A855F7] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-[#A855F7] font-semibold mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Please provide detailed information about your complaint..."
              className="w-full bg-[#232136] border-2 border-[#A855F7] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A855F7] min-h-[150px]"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-[#A855F7] to-[#7B1FA2] text-white px-6 py-4 rounded-lg font-semibold hover:from-[#7B1FA2] hover:to-[#A855F7] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </span>
              ) : (
                '📤 Submit Complaint'
              )}
            </button>
            <Link
              href="/customer/my-complaints"
              className="bg-[#232136] text-white px-6 py-4 rounded-lg font-semibold hover:bg-[#2a1439] transition-all duration-200 flex items-center justify-center"
            >
              📋 View My Complaints
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
