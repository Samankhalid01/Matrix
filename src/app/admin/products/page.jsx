'use client';
import { useState, useEffect } from 'react';
import ProductModal from '@/components/admin/ProductModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { AlertModal, ConfirmModal } from '@/components/Modal';
import { 
  FiPackage, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiDownload,
  FiImage,
  FiDollarSign,
  FiBox,
  FiTag,
  FiLayers,
  FiCheckCircle,
  FiAlertCircle,
  FiX
} from 'react-icons/fi';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedProductQR, setSelectedProductQR] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PRODUCTS_PER_PAGE = 12;
  
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: ''
  });
  
  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success', // 'success' or 'error'
    message: ''
  });
  
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    catergory: '', // matches your schema's spelling
    price: '',
    quantity: '',
    weight: '', // required in schema
    tags: '',
    images: []
  });

  const showModal = (type, message) => {
    setModal({ isOpen: true, type, message });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: 'success', message: '' });
  };

  useEffect(() => {
    checkConnection();
    fetchProducts();
  }, []);

  // Check Supabase connection
  const checkConnection = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('error');
    }
  };

  const fetchProducts = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch(`/api/products?page=${page}&limit=${PRODUCTS_PER_PAGE}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const result = await response.json();
      if (result.success) {
        if (append) {
          setProducts(prev => [...prev, ...(result.data || [])]);
        } else {
          setProducts(result.data || []);
        }
        setTotalProducts(result.total || 0);
        setHasMore(result.hasMore || false);
        setCurrentPage(page);
      } else {
        throw new Error(result.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showModal('error', 'Failed to load products: ' + error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreProducts = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(currentPage + 1, true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 4) {
      showModal('error', 'Maximum 4 images allowed');
      return;
    }

    // Check current images count
    const currentImageCount = formData.images ? formData.images.length : 0;
    if (currentImageCount + files.length > 4) {
      showModal('error', `You can only upload ${4 - currentImageCount} more image(s)`);
      return;
    }

    setUploading(true);
    const formDataObj = new FormData();
    
    for (let file of files) {
      formDataObj.append('files', file);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });

      const result = await response.json();
      
      if (result.success) {
        // Extract filenames from the API response and format as objects
        const imageObjects = result.files.map((file, index) => ({
          url: file.url.replace('/uploads/', ''),
          alt: file.originalName,
          isPrimary: index === 0 && (!formData.images || formData.images.length === 0)
        }));
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...imageObjects]
        }));
        showModal('success', `${files.length} image(s) uploaded successfully!`);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showModal('error', 'Failed to upload images: ' + error.message);
    } finally {
      setUploading(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields according to Supabase schema
    if (!formData.product_name?.trim()) {
      showModal('error', 'Product name is required');
      return;
    }
    if (!formData.catergory?.trim()) {
      showModal('error', 'Category is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showModal('error', 'Valid price is required');
      return;
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      showModal('error', 'Weight is required');
      return;
    }
    if (!formData.images || formData.images.length === 0) {
      showModal('error', 'At least one product image is required');
      return;
    }
    
    setLoading(true);

    try {
      const url = '/api/products';
      const method = showEditForm ? 'PUT' : 'POST';
      
      // Prepare data to match Supabase schema exactly
      const submitData = {
        product_name: formData.product_name.trim(),
        description: formData.description?.trim() || null,
        catergory: formData.catergory.trim(), // note the typo matches your schema
        price: parseInt(formData.price), // bigint in schema
        quantity: parseInt(formData.quantity) || 0, // bigint in schema
        weight: parseInt(formData.weight), // bigint, required in schema
        tags: formData.tags?.trim() || null,
        images: formData.images.map(img => typeof img === 'string' ? img : img.url), // array of strings
        in_stock: (parseInt(formData.quantity) || 0) > 0
      };

      if (showEditForm) {
        submitData.id = editingProduct.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        showModal('success', showEditForm ? 'Product updated successfully!' : 'Product added successfully!');
        resetForm();
        fetchProducts();
      } else {
        throw new Error(result.error || result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showModal('error', 'Failed to save product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      description: product.description || '',
      catergory: product.catergory || '',
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      weight: product.weight ? product.weight.toString() : '',
      tags: product.tags || '',
      images: product.images || []
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleDelete = async (productId) => {
    try {
      // Use query parameter instead of body for DELETE request
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        showModal('success', 'Product deleted successfully!');
        fetchProducts();
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showModal('error', 'Failed to delete product: ' + error.message);
    } finally {
      // Close delete confirmation modal
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (product) => {
    setDeleteModal({
      isOpen: true,
      productId: product.id,
      productName: product.product_name
    });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: '' });
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deleteModal.productId) {
      handleDelete(deleteModal.productId);
    }
  };

  const handleShowQR = async (product) => {
    try {
      const response = await fetch(`/api/qrcode/product?productId=${product.id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedProductQR({
          ...product,
          qrCodeImage: data.qrCode
        });
        setShowQRModal(true);
      } else {
        showModal('error', 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      showModal('error', 'Failed to generate QR code');
    }
  };

  const handleDownloadQR = () => {
    if (!selectedProductQR?.qrCodeImage) return;

    const link = document.createElement('a');
    link.href = selectedProductQR.qrCodeImage;
    link.download = `${selectedProductQR.product_name}_QR.png`;
    link.click();
  };

  const downloadQRCode = async (product) => {
    try {
      if (product.qr_code) {
        // Convert data URL to blob and download
        const response = await fetch(product.qr_code);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${product.product_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        showModal('error', 'QR code not available for this product');
      }
    } catch (error) {
      console.error('QR download error:', error);
      showModal('error', 'Failed to download QR code');
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      description: '',
      catergory: '',
      price: '',
      quantity: '',
      weight: '',
      tags: '',
      images: []
    });
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingProduct(null);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6 min-h-screen space-y-8">
      {/* Header with Connection Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
            <FiPackage className="text-purple-400" />
            Product Management
          </h1>
          <div className="flex items-center gap-6 mt-3">
            <p className="text-gray-300">Manage your store inventory and product information</p>
            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full border border-purple-500/20">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm text-gray-400">
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'error' ? 'Connection Error' : 'Checking...'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {setShowAddForm(true); setShowEditForm(false);}}
          disabled={connectionStatus !== 'connected'}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
        >
          <FiPlus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Loading State */}
      {loading && !showAddForm && !showEditForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 animate-pulse">
              <div className="aspect-square bg-gray-700/30 rounded-t-3xl"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-700/50 rounded-xl w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-700/30 rounded-lg w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-700/30 rounded-lg w-full mb-2"></div>
                <div className="h-4 bg-gray-700/30 rounded-lg w-2/3 mb-4"></div>
                <div className="flex justify-between items-center pt-4 border-t border-purple-500/20">
                  <div className="h-8 bg-gray-700/50 rounded-xl w-24"></div>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 bg-gray-700/30 rounded-xl"></div>
                    <div className="h-10 w-10 bg-gray-700/30 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Products Grid */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 hover:border-purple-500/40 transition-all shadow-2xl group hover:scale-105 duration-300">
                    <div className="aspect-square bg-gray-700/30 rounded-t-3xl overflow-hidden relative">
                      {product.images && product.images.length > 0 ? (
                        <>
                          <img
                            src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                            alt={typeof product.images[0] === 'string' ? product.product_name : product.images[0].alt || product.product_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            <div className="bg-purple-500/20 backdrop-blur-md border border-purple-500/30 rounded-full p-2">
                              <FiImage className="w-4 h-4 text-purple-400" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <FiPackage className="w-20 h-20" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-white mb-2 truncate text-lg">
                        {product.product_name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                        {product.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-purple-500/20">
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="w-5 h-5 text-purple-400" />
                          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            ₨{product.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
                          <FiBox className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-gray-300 font-medium">
                            {product.quantity}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/30 hover:scale-105"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleShowQR(product)}
                          className="border border-purple-500/30 text-purple-400 py-2.5 px-3 rounded-xl hover:bg-purple-500/10 transition-all text-sm font-medium flex items-center justify-center gap-1.5 hover:scale-105"
                        >
                          <FiDownload className="w-4 h-4" />
                          QR
                        </button>
                        <button 
                          onClick={() => openDeleteModal(product)}
                          className="bg-red-600/20 border border-red-500/30 text-red-400 py-2.5 px-3 rounded-xl hover:bg-red-600/30 transition-all text-sm font-medium flex items-center justify-center hover:scale-105"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More Button */}
              {!loading && products.length > 0 && hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg shadow-purple-500/50 flex items-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-5 h-5" />
                        Load More Products ({products.length} of {totalProducts})
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/20">
              <div className="mb-6">
                <FiPackage className="w-24 h-24 mx-auto text-purple-400/40 mb-4" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No products found</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Get started by adding your first product to the inventory</p>
              {connectionStatus === 'connected' && (
                <button
                  onClick={() => {setShowAddForm(true); setShowEditForm(false);}}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg shadow-purple-500/50 flex items-center gap-2 mx-auto hover:scale-105"
                >
                  <FiPlus className="w-5 h-5" />
                  Add Your First Product
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Product Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-purple-500/20 shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {showEditForm ? <FiEdit2 className="w-6 h-6" /> : <FiPlus className="w-6 h-6" />}
                  {showEditForm ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={resetForm} className="text-white/80 hover:text-white transition-colors">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FiTag className="text-purple-400" />
                  Product Name *
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700/50 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FiLayers className="text-purple-400" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 bg-gray-700/50 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <FiDollarSign className="text-purple-400" />
                    Price * (₨)
                  </label>
                  <input
                    type="number"
                    step="1"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700/50 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <FiBox className="text-purple-400" />
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700/50 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <FiPackage className="text-purple-400" />
                    Weight * (grams)
                  </label>
                  <input
                    type="number"
                    step="1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700/50 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FiLayers className="text-purple-400" />
                  Category *
                </label>
                <input
                  type="text"
                  name="catergory"
                  value={formData.catergory}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700/50 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="e.g., electronics, food, clothing"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FiTag className="text-purple-400" />
                  Product Tags (Keywords for Search & Recommendations)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700/50 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="e.g., chocolate, sweet, cold, dessert, icecream (comma separated)"
                />
                <p className="text-xs text-gray-400 mt-2 flex items-start gap-2">
                  <FiAlertCircle className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <span>Add keywords that describe this product (like Instagram hashtags). Examples: flavor, type, temperature, occasion. Used for product recommendations.</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FiImage className="text-purple-400" />
                  Product Images (Max 4)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-3 bg-gray-700/50 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-purple-400 text-sm mt-2 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    Uploading images...
                  </p>
                )}
                
                {/* Display uploaded images */}
                {formData.images && formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-300 mb-3">Uploaded Images ({formData.images.length}/4):</p>
                    <div className="grid grid-cols-4 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={typeof image === 'string' ? image : image.url}
                            alt={typeof image === 'string' ? `Product ${index + 1}` : image.alt || `Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl border-2 border-purple-500/30 group-hover:border-purple-500/60 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-700 text-white py-3.5 rounded-xl hover:bg-gray-600 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 font-semibold shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      {showEditForm ? 'Update Product' : 'Add Product'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedProductQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-purple-500/20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FiDownload className="text-purple-400" />
                  Product QR Code
                </h2>
                <p className="text-gray-300 mt-2 font-semibold">
                  {selectedProductQR.product_name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ID: {selectedProductQR.id}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedProductQR(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-2xl mb-6">
                <img
                  src={selectedProductQR.qrCodeImage}
                  alt="Product QR Code"
                  className="mx-auto"
                />
              </div>
              <button
                onClick={handleDownloadQR}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2 hover:scale-105"
              >
                <FiDownload className="w-5 h-5" />
                Download QR Code
              </button>
              <p className="text-sm text-gray-400 mt-4 flex items-center justify-center gap-2">
                <FiAlertCircle className="w-4 h-4" />
                Print this QR code and attach it to the product
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        message={modal.message}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        productName={deleteModal.productName}
      />
    </div>
  );
}
