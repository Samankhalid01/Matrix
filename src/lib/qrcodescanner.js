// QR Code Scanner and Decoder utilities

export const decodeQRData = (qrCodeContent) => {
  try {
    const data = JSON.parse(qrCodeContent);
    
    // Validate that it's a Matrix store QR code
    if (data.store === "MATRIX_STORE_001" && data.id) {
      return {
        isValid: true,
        productId: data.id,
        productName: data.name,
        price: data.price,
        category: data.category,
        store: data.store,
        url: data.url,
        created: data.created,
        updated: data.updated
      };
    } else {
      return {
        isValid: false,
        error: 'Not a valid Matrix store QR code'
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid QR code format'
    };
  }
};

export const validateProductQR = async (qrData) => {
  try {
    const decodedData = decodeQRData(qrData);
    
    if (!decodedData.isValid) {
      return decodedData;
    }

    // Verify product exists in database
    const response = await fetch(`/api/product/${decodedData.productId}`);
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return {
          isValid: true,
          product: result.data,
          qrData: decodedData
        };
      }
    }
    
    return {
      isValid: false,
      error: 'Product not found in database'
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate QR code: ' + error.message
    };
  }
};

export const generateProductURL = (productId) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/product/${productId}`;
};

export const scanQRCode = async (file) => {
  // This would integrate with a QR code scanning library
  // For now, this is a placeholder for future implementation
  return new Promise((resolve, reject) => {
    // Integration with libraries like:
    // - qr-scanner
    // - jsQR
    // - QuaggaJS
    reject(new Error('QR code scanning not implemented yet'));
  });
};