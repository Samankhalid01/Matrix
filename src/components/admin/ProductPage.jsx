'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { generateQRCodeDataURL } from '@/lib/qrcode';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    if (files.length > 4) {
      alert('Maximum 4 images allowed');
      return;
    }

    setUploadingImages(true);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({ ...prev, images: data.images }));
      } else {
        alert(data.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const setPrimaryImage = (indexToPrimary) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, index) => ({
        ...img,
        isPrimary: index === indexToPrimary
      }))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      alert('Please upload at least one product image');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProducts([data.data, ...products]);
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
        alert('Product added successfully!');
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const generateAndShowQR = async (product) => {
    try {
      setLoading(true);
      const qrData = {
        product_id: product.product_id,
        product_name: product.product_name,
        price: product.price,
        category_id: product.category_id,
        description: product.description,
        images: product.images || [],
        timestamp: new Date().toISOString(),
        store_id: "MATRIX_STORE_001"
      };
      
      const qrCodeDataURL = await generateQRCodeDataURL(JSON.stringify(qrData));
      setQrCodeUrl(qrCodeDataURL);
      setSelectedProduct(product);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = `qr-${selectedProduct.product_name.replace(/\s+/g, '-')}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary);
      return primaryImage ? primaryImage.url : product.images[0].url;
    }
    return product.imageUrl || '/placeholder-image.jpg';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            Add Product
          </button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Add Product Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Product</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name *"
                    value={formData.product_name}
                    onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Category ID *"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <textarea
                  placeholder="Product Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price *"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Weight (kg)"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Multiple Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Images (Up to 4 images) *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    max="4"
                    onChange={handleMultipleImageUpload}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={uploadingImages}
                  />
                  {uploadingImages && (
                    <p className="text-blue-500 text-sm mt-2">Uploading images...</p>
                  )}
                  
                  {/* Image Preview Grid */}
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image.url} 
                            alt={`Product image ${index + 1}`} 
                            className={`w-full h-24 object-cover rounded-lg border-2 ${
                              image.isPrimary ? 'border-blue-500' : 'border-gray-300'
                            }`} 
                          />
                          {image.isPrimary && (
                            <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                              Primary
                            </span>
                          )}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                          {!image.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              className="absolute bottom-1 left-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Set Primary
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        product_name: '',
                        description: '',
                        category_id: '',
                        price: '',
                        quantity: '',
                        weight: '',
                        images: []
                      });
                    }}
                    className="px-6 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                    disabled={loading || uploadingImages}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    disabled={loading || uploadingImages || formData.images.length === 0}
                  >
                    {loading ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={getImageUrl(product)}
                  alt={product.product_name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                {product.images && product.images.length > 1 && (
                  <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    +{product.images.length - 1} more
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{product.product_name}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
              
              <div className="space-y-1 text-sm mb-4">
                <p><span className="font-medium">Price:</span> ${product.price}</p>
                <p><span className="font-medium">Quantity:</span> {product.quantity}</p>
                <p><span className="font-medium">Category:</span> {product.category_id}</p>
                <p><span className="font-medium">Stock Status:</span> 
                  <span className={`ml-1 ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </p>
              </div>
              
              <button
                onClick={() => generateAndShowQR(product)}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-4">Start by adding your first product to the inventory.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Your First Product
            </button>
          </div>
        )}

        {/* QR Code Modal */}
        {selectedProduct && qrCodeUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">QR Code for {selectedProduct.product_name}</h3>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Scan this QR code to add the product to cart
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={downloadQRCode}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Download QR Code
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setQrCodeUrl('');
                  }}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;