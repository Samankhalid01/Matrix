import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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

    console.log('🎨 Generating QR code for product ID:', productId);

    // Get product details from database
    const { data: product, error } = await supabase
      .from('Product')
      .select('id, product_name, price')
      .eq('id', productId)
      .single();

    if (error || !product) {
      console.error('❌ Product not found:', productId);
      return Response.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // NEW FORMAT: JSON with 3 attributes
    const qrData = JSON.stringify({
      product_id: product.id,
      product_name: product.product_name,
      price: product.price
    });

    console.log('🎨 QR Data (JSON):', qrData);

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log('✅ QR code generated successfully');

    return Response.json({
      success: true,
      qrCode: qrCodeImage,
      productId: product.id,
      productName: product.product_name,
      price: product.price,
      qrData: qrData
    });

  } catch (error) {
    console.error('❌ Product QR generation error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
