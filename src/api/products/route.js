import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { generateQRCode } from '@/lib/qrcode';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { product_name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category_id: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return NextResponse.json({ 
      success: true, 
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (!body.product_name || !body.category_id || !body.price) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: product_name, category_id, price' 
      }, { status: 400 });
    }
    
    const lastProduct = await Product.findOne().sort({ product_id: -1 });
    const product_id = lastProduct ? lastProduct.product_id + 1 : 1;
    
    const qrData = {
      product_id,
      product_name: body.product_name,
      price: body.price,
      category_id: body.category_id,
      description: body.description,
      images: body.images || [],
      timestamp: new Date().toISOString(),
      store_id: "MATRIX_STORE_001"
    };
    
    const qr_code = await generateQRCode(JSON.stringify(qrData));
    
    const productData = {
      ...body,
      product_id,
      qr_code,
      price: parseFloat(body.price),
      quantity: parseInt(body.quantity) || 0,
      weight: parseFloat(body.weight) || 0,
      in_stock: parseInt(body.quantity) > 0,
      imageUrl: body.images && body.images.length > 0 ? body.images[0].url : null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const product = new Product(productData);
    await product.save();
    
    return NextResponse.json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    console.error('Products POST error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product with this name or ID already exists' 
      }, { status: 409 });
    }
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}