import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { generateQRCodeDataURL } from '@/lib/qrcode';

// GET - Fetch all products
export async function GET() {
  try {
    await connectDB();
    
    const products = await Product.find({})
      .sort({ created_at: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(req) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { product_name, description, category_id, price, quantity, weight, images } = body;

    // Validate required fields
    if (!product_name || !category_id || !price) {
      return NextResponse.json(
        { success: false, message: 'Product name, category, and price are required' },
        { status: 400 }
      );
    }

    // Get the next product ID
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

    // Generate QR code data URL
    const productInfo = {
      id: product_id,
      name: product_name,
      price: price
    };
    const qrCode = await generateQRCodeDataURL(JSON.stringify(productInfo));

    // Create new product
    const newProduct = new Product({
      product_id: product_id,
      product_name,
      description,
      category_id,
      qr_code: qrCode,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 0,
      weight: parseFloat(weight) || 0,
      images: images || [],
      in_stock: parseInt(quantity) > 0
    });

    const savedProduct = await newProduct.save();

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Product with this ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create product', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(req) {
  try {
    await connectDB();
    
    const body = await req.json();
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
export async function DELETE(req) {
  try {
    await connectDB();
    
    // Get request body
    const body = await req.json();
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
      const { deleteFromCloudinary } = await import('../../../lib/cloudinary');
      
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