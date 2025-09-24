'use client';
import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    category_id: '',
    price: '',
    quantity: '',
    weight: '',
    images: []
  });

  useEffect(() => {
    checkConnection();
    fetchProducts();
  }, []);

  // Check MongoDB connection
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const result = await response.json();
      if (result.success) {
        setProducts(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products: ' + error.message);
    } finally {
      setLoading(false);
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
      alert('Maximum 4 images allowed');
      return;
    }

    // Check current images count
    const currentImageCount = formData.images ? formData.images.length : 0;
    if (currentImageCount + files.length > 4) {
      alert(`You can only upload ${4 - currentImageCount} more image(s)`);
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
        alert(`${files.length} image(s) uploaded successfully!`);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images: ' + error.message);
    } finally {
      setUploading(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = showEditForm ? '/api/products' : '/api/products';
      const method = showEditForm ? 'PUT' : 'POST';
      const submitData = showEditForm ? { ...formData, product_id: editingProduct.product_id } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(showEditForm ? 'Product updated successfully!' : 'Product added successfully!');
        resetForm();
        fetchProducts();
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      description: product.description || '',
      category_id: product.category_id,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      weight: product.weight ? product.weight.toString() : '',
      images: product.images || []
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productId }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Product deleted successfully!');
        fetchProducts();
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product: ' + error.message);
    }
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
        alert('QR code not available for this product');
      }
    } catch (error) {
      console.error('QR download error:', error);
      alert('Failed to download QR code');
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      description: '',
      category_id: '',
      price: '',
      quantity: '',
      weight: '',
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
    <div className="p-6">
      {/* Header with Connection Status */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-600">Manage your store inventory and product information</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {connectionStatus === 'connected' ? 'MongoDB Connected' : 
                 connectionStatus === 'error' ? 'Connection Error' : 'Checking...'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {setShowAddForm(true); setShowEditForm(false);}}
          disabled={connectionStatus !== 'connected'}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          + Add New Product
        </button>
      </div>

      {/* Loading State */}
      {loading && !showAddForm && !showEditForm ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 mt-4">Loading products...</p>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`/uploads/${typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}`}
                        alt={typeof product.images[0] === 'string' ? product.product_name : product.images[0].alt || product.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">
                      {product.product_name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-green-600">
                        ₨{product.price}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Qty: {product.quantity}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => downloadQRCode(product)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        QR
                      </button>
                      <button 
                        onClick={() => handleDelete(product.product_id)}
                        className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first product to the inventory</p>
              {connectionStatus === 'connected' && (
                <button
                  onClick={() => {setShowAddForm(true); setShowEditForm(false);}}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Product
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Product Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showEditForm ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price * (₨)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category ID *
                </label>
                <input
                  type="text"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., electronics, food, clothing"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (Max 4)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-blue-600 text-sm mt-2">Uploading images...</p>
                )}
                
                {/* Display uploaded images */}
                {formData.images && formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`/uploads/${typeof image === 'string' ? image : image.url}`}
                            alt={typeof image === 'string' ? `Product ${index + 1}` : image.alt || `Product ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 font-medium"
                >
                  {loading ? 'Saving...' : showEditForm ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
