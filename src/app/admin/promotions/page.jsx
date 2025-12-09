'use client';
import { useState, useEffect } from 'react';
import { Tag, TrendingUp, Users, Plus, Edit2, Trash2, Copy, RefreshCw, Gift, Calendar, Target, Award, Percent, DollarSign } from 'lucide-react';
import { AlertModal, ConfirmModal } from '@/components/Modal';


export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [customerSegments, setCustomerSegments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePromoId, setDeletePromoId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCopyModal, setShowCopyModal] = useState(false);

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

  const handleDeleteClick = (id) => {
    setDeletePromoId(id);
    setShowDeleteConfirm(true);
  };

  const deletePromotion = async () => {
    try {
      const res = await fetch(`/api/promotions?id=${deletePromoId}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMessage('Promotion deleted successfully!');
        setShowSuccessModal(true);
        fetchPromotions();
      }
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
    setSuccessMessage('Promo code copied to clipboard!');
    setShowCopyModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header Shimmer */}
        <div className="flex justify-between items-center animate-pulse">
          <div>
            <div className="h-8 bg-matrix-gray/50 rounded w-64 mb-2"></div>
            <div className="h-4 bg-matrix-gray/30 rounded w-80"></div>
          </div>
          <div className="h-10 bg-matrix-accent/30 rounded w-40"></div>
        </div>

        {/* Customer Segments Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-effect p-4 rounded-lg animate-pulse">
              <div className="h-5 bg-matrix-gray/50 rounded w-24 mb-2"></div>
              <div className="h-8 bg-matrix-gray/50 rounded w-16 mb-2"></div>
              <div className="h-4 bg-matrix-gray/30 rounded w-32"></div>
            </div>
          ))}
        </div>

        {/* Active Promotions Shimmer */}
        <div className="glass-effect rounded-lg p-6">
          <div className="h-6 bg-matrix-gray/50 rounded w-48 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-2 border-matrix-accent/20 bg-matrix-gray/20 p-4 rounded-lg animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-6 bg-matrix-gray/50 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-matrix-gray/30 rounded w-full mb-2"></div>
                    <div className="h-4 bg-matrix-gray/30 rounded w-64"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-matrix-gray/30 rounded"></div>
                    <div className="h-8 w-8 bg-matrix-gray/30 rounded"></div>
                    <div className="h-8 w-8 bg-matrix-gray/30 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Promotions Shimmer */}
        <div className="glass-effect rounded-lg p-6">
          <div className="h-6 bg-matrix-gray/50 rounded w-48 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="border border-matrix-accent/20 p-4 rounded-lg animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-6 bg-matrix-gray/50 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-matrix-gray/30 rounded w-full mb-2"></div>
                    <div className="h-4 bg-matrix-gray/30 rounded w-64"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-matrix-gray/30 rounded"></div>
                    <div className="h-8 w-8 bg-matrix-gray/30 rounded"></div>
                    <div className="h-8 w-8 bg-matrix-gray/30 rounded"></div>
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
    <div className="p-6 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Tag className="w-8 h-8 text-purple-400" />
            Promotions & Discounts
          </h1>
          <p className="text-gray-300 mt-2">Manage promotions and customer segmentation</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 font-bold transition-all hover:scale-105 shadow-lg shadow-purple-500/50"
        >
          <Plus className="w-5 h-5" />
          Create Promotion
        </button>
      </div>

      {/* Customer Segments Overview */}
      {customerSegments && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border border-yellow-500/30 shadow-2xl hover:scale-105 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-6 h-6 text-yellow-500" />
              <h3 className="font-bold text-yellow-400 text-lg">BRONZE</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {customerSegments.segments.byTier.BRONZE.count}
            </p>
            <p className="text-sm text-yellow-400/80 font-semibold">5% base discount</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-400/30 shadow-2xl hover:scale-105 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-6 h-6 text-gray-400" />
              <h3 className="font-bold text-gray-300 text-lg">SILVER</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {customerSegments.segments.byTier.SILVER.count}
            </p>
            <p className="text-sm text-gray-400/80 font-semibold">10% base discount</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border border-amber-400/30 shadow-2xl hover:scale-105 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-6 h-6 text-amber-400" />
              <h3 className="font-bold text-amber-300 text-lg">GOLD</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {customerSegments.segments.byTier.GOLD.count}
            </p>
            <p className="text-sm text-amber-400/80 font-semibold">15% base discount</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-400/30 shadow-2xl hover:scale-105 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h3 className="font-bold text-purple-300 text-lg">PLATINUM</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {customerSegments.segments.byTier.PLATINUM.count}
            </p>
            <p className="text-sm text-purple-400/80 font-semibold">20% base discount</p>
          </div>
        </div>
      )}

      {/* Active Promotions */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-purple-400" />
          Active Promotions
        </h2>
        <div className="space-y-3">
          {promotions.filter(p => p.is_active).length === 0 ? (
            <p className="text-white/60 text-center py-4">No active promotions</p>
          ) : (
            promotions.filter(p => p.is_active).map(promo => (
              <div key={promo.id} className="border-2 border-[#A855F7]/30 bg-[#A855F7]/5 p-4 rounded-lg transition-all hover:border-[#7B1FA2]">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{promo.name}</h3>
                      {promo.code && (
                        <button
                          onClick={() => copyPromoCode(promo.code)}
                          className="px-2 py-1 bg-[#A855F7]/20 text-[#A855F7] text-sm rounded flex items-center gap-1 hover:bg-[#A855F7]/30 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          {promo.code}
                        </button>
                      )}
                      {promo.target_tier && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                          {promo.target_tier} Only
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 mb-2">{promo.description}</p>
                    <div className="flex gap-4 text-sm text-white/60">
                      <span className="font-semibold text-[#A855F7]">
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
                      className="p-2 text-matrix-accent hover:bg-matrix-accent/10 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => togglePromoStatus(promo)}
                      className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded hover:bg-yellow-500/30 transition-colors"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={() => handleDeleteClick(promo.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500/30 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Gift className="w-8 h-8 text-purple-400" />
                {selectedPromo ? 'Edit Promotion' : 'Create New Promotion'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Promo Code (Optional)</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="SUMMER2024"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Promotion Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Summer Sale 2024"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Get amazing discounts on all products..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Discount Type *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Discount Value *</label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                    required
                    step="0.01"
                    min="0"
                    placeholder="20"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Target Tier</label>
                  <select
                    value={formData.target_tier}
                    onChange={(e) => setFormData({...formData, target_tier: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    <option value="">All Tiers</option>
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Min Purchase (Rs.)</label>
                  <input
                    type="number"
                    value={formData.min_purchase_amount}
                    onChange={(e) => setFormData({...formData, min_purchase_amount: e.target.value})}
                    step="0.01"
                    min="0"
                    placeholder="1000"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Max Discount (Rs.)</label>
                  <input
                    type="number"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({...formData, max_discount_amount: e.target.value})}
                    step="0.01"
                    min="0"
                    placeholder="500"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    min="1"
                    placeholder="100"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    min={formData.start_date}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  id="is_active"
                  className="w-5 h-5 rounded border-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-purple-300 cursor-pointer">
                  Activate this promotion immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/50"
                >
                  {selectedPromo ? 'Update' : 'Create'} Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={deletePromotion}
        title="Delete Promotion"
        message="Are you sure you want to delete this promotion? This action cannot be undone."
        confirmVariant="danger"
      />
      <AlertModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={successMessage}
        variant="success"
      />
      <AlertModal 
        isOpen={showCopyModal} 
        onClose={() => setShowCopyModal(false)}
        title="Copied"
        message={successMessage}
        variant="success"
      />
    </div>
  );
}
