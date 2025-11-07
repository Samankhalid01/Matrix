import QRCode from 'qrcode';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return Response.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Generate QR code data for product
    const qrData = JSON.stringify({
      id: parseInt(productId),
      productId: parseInt(productId),
      store: 'MATRIX_STORE_001',
      type: 'product'
    });

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return Response.json({
      success: true,
      qrCode: qrCodeImage,
      productId
    });

  } catch (error) {
    console.error('Product QR generation error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
