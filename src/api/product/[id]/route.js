import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request, { params }) {
  try {
    const productId = params.id;

    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product ID is required' 
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

    // Return formatted product data
    return NextResponse.json({ 
      success: true, 
      data: {
        id: product.product_id,
        name: product.product_name,
        description: product.description,
        category: product.category_id,
        price: product.price,
        quantity: product.quantity,
        weight: product.weight,
        in_stock: product.in_stock,
        images: product.images || [],
        qr_code: product.qr_code,
        created_at: product.created_at,
        updated_at: product.updated_at
      }
    });

  } catch (error) {
    console.error('Product lookup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch product'
    }, { status: 500 });
  }
}