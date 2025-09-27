import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { generateQRCode } from '@/lib/qrcode';

export async function GET(request) {
  try {
    // Check if MONGODB_URI is available
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined');
      return NextResponse.json({ 
        success: false, 
        error: 'Database configuration error' 
      }, { status: 500 });
    }
    
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
      error: error.message || 'Failed to fetch products'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Check if MONGODB_URI is available
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined');
      return NextResponse.json({ 
        success: false, 
        error: 'Database configuration error' 
      }, { status: 500 });
    }
    
    await connectDB();
    const body = await request.json();
    
    // Validate required fields
    if (!body.product_name || !body.category_id || !body.price) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: product_name, category_id, price' 
      }, { status: 400 });
    }
    
    // Validate price is a valid number
    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Price must be a valid positive number' 
      }, { status: 400 });
    }
    
    // Get the highest product_id and increment by 1
    const lastProduct = await Product.findOne().sort({ product_id: -1 });
    let product_id = 1;

    if (lastProduct) {
      product_id = lastProduct.product_id + 1;
    } else {
      // If no products exist, start from 1
      const productCount = await Product.countDocuments();
      product_id = productCount + 1;
    }

    // Double-check for uniqueness (in case of race conditions)
    const existingProduct = await Product.findOne({ product_id });
    if (existingProduct) {
      // Find the next available ID
      const allIds = await Product.find({}, { product_id: 1 }).sort({ product_id: 1 });
      const usedIds = allIds.map(p => p.product_id);
      
      for (let i = 1; i <= usedIds.length + 1; i++) {
        if (!usedIds.includes(i)) {
          product_id = i;
          break;
        }
      }
    }

    console.log('Assigning product_id:', product_id);
    
    // Create QR code data with product_id as the primary identifier
    const qrData = {
      id: product_id,  // Use product_id as the main identifier
      name: body.product_name,
      price: price,
      category: body.category_id,
      store: "MATRIX_STORE_001",
      created: new Date().toISOString()
    };
    
    // Generate QR code using the compact JSON data
    const qr_code = await generateQRCode(JSON.stringify(qrData));
    
    const productData = {
      ...body,
      product_id,
      qr_code,
      price: price,
      quantity: parseInt(body.quantity) || 0,
      weight: body.weight ? parseFloat(body.weight) : undefined,
      in_stock: parseInt(body.quantity) > 0,
      imageUrl: body.images && body.images.length > 0 ? body.images[0].url : null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Remove undefined fields
    Object.keys(productData).forEach(key => {
      if (productData[key] === undefined) {
        delete productData[key];
      }
    });
    
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
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Validation error: ' + validationErrors.join(', ') 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create product'
    }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { product_id, ...updateData } = body;

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date();
    
    const updatedProduct = await Product.findOneAndUpdate(
      { product_id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request) {
  try {
    await connectDB();
    
    // Get request body
    const body = await request.json();
    const product_id = body.product_id;

    console.log('Delete request received for product_id:', product_id);

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // First, find the product to get image public IDs
    const productToDelete = await Product.findOne({ product_id: parseInt(product_id) });

    if (!productToDelete) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('Found product to delete:', productToDelete.product_name);

    // Delete images from Cloudinary if they exist
    if (productToDelete.images && productToDelete.images.length > 0) {
      const { deleteFromCloudinary } = await import('../lib/cloudinary');
      
      for (const image of productToDelete.images) {
        if (image.publicId) {
          try {
            await deleteFromCloudinary(image.publicId);
            console.log(`Deleted image from Cloudinary: ${image.publicId}`);
          } catch (cloudinaryError) {
            console.warn(`Failed to delete image from Cloudinary: ${image.publicId}`, cloudinaryError);
            // Continue with product deletion even if image deletion fails
          }
        }
      }
    }

    // Now delete the product from database
    const deletedProduct = await Product.findOneAndDelete({ product_id: parseInt(product_id) });

    return NextResponse.json({
      success: true,
      message: 'Product and associated images deleted successfully',
      data: deletedProduct
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product', error: error.message },
      { status: 500 }
    );
  }
}