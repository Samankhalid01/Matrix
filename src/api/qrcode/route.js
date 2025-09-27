import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { generateQRCode, generateQRCodeDataURL } from '@/lib/qrcode';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const format = searchParams.get('format') || 'svg'; // svg or png

    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: 'product_id is required' 
      }, { status: 400 });
    }

    await connectDB();
    
    // Find product by product_id (not _id)
    const product = await Product.findOne({ product_id: parseInt(productId) });
    
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }

    // Create QR code data
    const qrData = {
      id: product.product_id,
      name: product.product_name,
      price: product.price,
      category: product.category_id,
      store: "MATRIX_STORE_001",
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/product/${product.product_id}`
    };

    let qrCode;
    if (format === 'png') {
      qrCode = await generateQRCodeDataURL(JSON.stringify(qrData));
    } else {
      qrCode = await generateQRCode(JSON.stringify(qrData));
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        product_id: product.product_id,
        product_name: product.product_name,
        qr_code: qrCode,
        qr_data: qrData,
        format: format
      }
    });

  } catch (error) {
    console.error('QR Code generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to generate QR code'
    }, { status: 500 });
  }
}

// POST - Regenerate QR code for existing product
export async function POST(request) {
  try {
    const body = await request.json();
    const { product_id, format = 'svg' } = body;

    if (!product_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'product_id is required' 
      }, { status: 400 });
    }

    await connectDB();
    
    const product = await Product.findOne({ product_id: parseInt(product_id) });
    
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }

    // Create updated QR code data
    const qrData = {
      id: product.product_id,
      name: product.product_name,
      price: product.price,
      category: product.category_id,
      store: "MATRIX_STORE_001",
      updated: new Date().toISOString(),
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/product/${product.product_id}`
    };

    let qrCode;
    if (format === 'png') {
      qrCode = await generateQRCodeDataURL(JSON.stringify(qrData));
    } else {
      qrCode = await generateQRCode(JSON.stringify(qrData));
    }

    // Update the product with new QR code
    await Product.findOneAndUpdate(
      { product_id: parseInt(product_id) },
      { 
        qr_code: qrCode,
        updated_at: new Date()
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'QR code regenerated successfully',
      data: {
        product_id: product.product_id,
        product_name: product.product_name,
        qr_code: qrCode,
        qr_data: qrData,
        format: format
      }
    });

  } catch (error) {
    console.error('QR Code regeneration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to regenerate QR code'
    }, { status: 500 });
  }
}