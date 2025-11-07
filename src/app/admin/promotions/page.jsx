'use client';
import { useState, useEffect } from 'react';
import { Tag, TrendingUp, Users, Plus, Edit2, Trash2, Copy, RefreshCw } from 'lucide-react';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [customerSegments, setCustomerSegments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    target_tier: '',
    min_purchase_amount: '',
    max_discount_amount: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    usage_limit: '',
    is_active: true
  });

  useEffect(() => {
    fetchPromotions();
    fetchCustomerSegments();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/promotions');
      const data = await res.json();
      if (data.success) {
        setPromotions(data.promotions);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerSegments = async () => {
    try {
      const res = await fetch('/api/analytics/customer-segments');
      const data = await res.json();
      if (data.success) {
        setCustomerSegments(data);
      }
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = selectedPromo ? 'PUT' : 'POST';
      const body = selectedPromo ? { ...formData, id: selectedPromo.id } : formData;

      const res = await fetch('/api/promotions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        fetchPromotions();
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const deletePromotion = async (id) => {
    if (!confirm('Delete this promotion?')) return;
    try {
      const res = await fetch(`/api/promotions?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const togglePromoStatus = async (promo) => {
    try {
      const res = await fetch('/api/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promo.id, is_active: !promo.is_active })
      });
      if (res.ok) fetchPromotions();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const editPromotion = (promo) => {
    setSelectedPromo(promo);
    setFormData({
      code: promo.code || '',
      name: promo.name,
      description: promo.description || '',
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      target_tier: promo.target_tier || '',
      min_purchase_amount: promo.min_purchase_amount || '',
      max_discount_amount: promo.max_discount_amount || '',
      start_date: promo.start_date?.split('T')[0] || '',
      end_date: promo.end_date?.split('T')[0] || '',
      usage_limit: promo.usage_limit || '',
      is_active: promo.is_active
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      target_tier: '',
      min_purchase_amount: '',
      max_discount_amount: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      usage_limit: '',
      is_active: true
    });
    setSelectedPromo(null);
  };

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Promo code copied!');
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Shimmer */}
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div>
            <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-80"></div>
          </div>
          <div className="h-10 bg-blue-200 rounded w-40"></div>
        </div>

        {/* Customer Segments Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-300 animate-pulse">
              <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>

        {/* Active Promotions Shimmer */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-2 border-gray-200 bg-gray-50 p-4 rounded-lg animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Promotions Shimmer */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 p-4 rounded-lg animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <Tag className="w-8 h-8 text-blue-600" />
            Promotions & Discounts
          </h1>
          <p className="text-gray-600 mt-1">Manage promotions and customer segmentation</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Promotion
        </button>
      </div>

      {/* Customer Segments Overview */}
      {customerSegments && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-300">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-yellow-700" />
              <h3 className="font-semibold text-yellow-900">BRONZE</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {customerSegments.segments.byTier.BRONZE.count}
            </p>
            <p className="text-sm text-yellow-700">5% base discount</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-200 p-4 rounded-lg border border-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">SILVER</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {customerSegments.segments.byTier.SILVER.count}
            </p>
            <p className="text-sm text-gray-700">10% base discount</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-200 p-4 rounded-lg border border-amber-400">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-amber-700" />
              <h3 className="font-semibold text-amber-900">GOLD</h3>
            </div>
            <p className="text-2xl font-bold text-amber-900">
              {customerSegments.segments.byTier.GOLD.count}
            </p>
            <p className="text-sm text-amber-700">15% base discount</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-200 p-4 rounded-lg border border-purple-400">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-700" />
              <h3 className="font-semibold text-purple-900">PLATINUM</h3>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {customerSegments.segments.byTier.PLATINUM.count}
            </p>
            <p className="text-sm text-purple-700">20% base discount</p>
          </div>
        </div>
      )}

      {/* Active Promotions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Active Promotions</h2>
        <div className="space-y-3">
          {promotions.filter(p => p.is_active).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active promotions</p>
          ) : (
            promotions.filter(p => p.is_active).map(promo => (
              <div key={promo.id} className="border-2 border-green-300 bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{promo.name}</h3>
                      {promo.code && (
                        <button
                          onClick={() => copyPromoCode(promo.code)}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          {promo.code}
                        </button>
                      )}
                      {promo.target_tier && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          {promo.target_tier} Only
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{promo.description}</p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span className="font-semibold text-green-700">
                        {promo.discount_type === 'percentage' 
                          ? `${promo.discount_value}% OFF` 
                          : `$${promo.discount_value} OFF`}
                      </span>
                      {promo.min_purchase_amount && (
                        <span>Min: ${promo.min_purchase_amount}</span>
                      )}
                      {promo.usage_limit && (
                        <span>Used: {promo.usage_count}/{promo.usage_limit}</span>
                      )}
                      {promo.end_date && (
                        <span>Expires: {new Date(promo.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editPromotion(promo)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => togglePromoStatus(promo)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded hover:bg-yellow-200"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={() => deletePromotion(promo.id)}
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

      {/* Inactive/Expired Promotions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Inactive Promotions</h2>
        <div className="space-y-3">
          {promotions.filter(p => !p.is_active).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No inactive promotions</p>
          ) : (
            promotions.filter(p => !p.is_active).map(promo => (
              <div key={promo.id} className="border border-gray-300 bg-gray-50 p-4 rounded-lg opacity-60">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">{promo.name}</h3>
                    <p className="text-sm text-gray-600">{promo.description}</p>
                  </div>
                  <button
                    onClick={() => togglePromoStatus(promo)}
                    className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                  >
                    Activate
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedPromo ? 'Edit Promotion' : 'Create New Promotion'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Promo Code (Optional)</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="SUMMER2024"
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Promotion Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border rounded text-gray-900"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Discount Type *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                    className="w-full p-2 border rounded text-gray-900"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                    required
                    step="0.01"
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Target Tier</label>
                  <select
                    value={formData.target_tier}
                    onChange={(e) => setFormData({...formData, target_tier: e.target.value})}
                    className="w-full p-2 border rounded text-gray-900"
                  >
                    <option value="">All Tiers</option>
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Min Purchase ($)</label>
                  <input
                    type="number"
                    value={formData.min_purchase_amount}
                    onChange={(e) => setFormData({...formData, min_purchase_amount: e.target.value})}
                    step="0.01"
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Max Discount ($)</label>
                  <input
                    type="number"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({...formData, max_discount_amount: e.target.value})}
                    step="0.01"
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  id="is_active"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-900">Active Immediately</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedPromo ? 'Update' : 'Create'} Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
