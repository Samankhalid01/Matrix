import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to generate embedding
async function generateEmbedding(productData) {
  try {
    const embeddingsServiceUrl = process.env.PYTHON_EMBEDDINGS_SERVICE_URL || 'http://localhost:8000';
    
    const response = await fetch(`${embeddingsServiceUrl}/embed/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: productData.product_name,
        description: productData.description || '',
        category: productData.category || '',
        tags: productData.tags || ''
      })
    });

    if (!response.ok) {
      console.warn('Embedding service not available, skipping embeddings');
      return null;
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.warn('Failed to generate embedding:', error.message);
    return null;
  }
}

// GET - Fetch all products or search with pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const inStock = searchParams.get('inStock');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    let query = supabase
      .from('Product')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Search by name or description
    if (search) {
      query = query.or(`product_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter by category
    if (category) {
      query = query.eq('catergory', category);
    }

    // Filter by stock status
    if (inStock !== null && inStock !== undefined) {
      query = query.eq('in_stock', inStock === 'true');
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const hasMore = offset + products.length < total;

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      total: total,
      page: page,
      limit: limit,
      hasMore: hasMore
    });

  } catch (error) {
    console.error('GET products error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new product with Cloudinary image upload
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      product_name, 
      description, 
      catergory, // Note: using 'catergory' to match your schema typo
      price, 
      quantity, 
      weight,
      tags,
      images // Array of base64 or URLs
    } = body;

    // Validate required fields
    if (!product_name || !price || !weight) {
      return NextResponse.json(
        { success: false, error: 'Product name, price, and weight are required' },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    let uploadedImageUrls = [];
    if (images && images.length > 0) {
      console.log(`📤 Uploading ${images.length} images to Cloudinary...`);
      
      for (const image of images) {
        try {
          // Check if image is an object with dataUrl or if it's a string
          const imageData = typeof image === 'string' ? image : image.dataUrl || image.data;
          
          if (!imageData) {
            console.error('Invalid image format:', typeof image);
            continue;
          }

          const result = await cloudinary.uploader.upload(imageData, {
            folder: 'matrix-products',
            resource_type: 'auto'
          });
          uploadedImageUrls.push(result.secure_url);
          console.log(`✅ Image uploaded: ${result.secure_url}`);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
    }

    // Generate embedding
    console.log('🔄 Generating product embedding...');
    const embedding = await generateEmbedding({
      product_name,
      description,
      category: catergory,
      tags
    });

    if (embedding) {
      console.log('✅ Embedding generated successfully');
    } else {
      console.log('⚠️ Embedding not generated (service may be offline)');
    }

    // Insert product into Supabase (QR code will be generated on-demand based on product ID)
    const { data: product, error } = await supabase
      .from('Product')
      .insert([
        {
          product_name: product_name.trim(),
          description: description?.trim(),
          catergory: catergory?.trim(),
          price: parseInt(price),
          quantity: parseInt(quantity || 0),
          weight: parseInt(weight),
          images: uploadedImageUrls,
          tags: tags?.trim(),
          in_stock: (quantity || 0) > 0,
          embedding: embedding
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product,
      embedding_generated: !!embedding
    }, { status: 201 });

  } catch (error) {
    console.error('POST product error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id,
      product_name, 
      description, 
      catergory,
      price, 
      quantity, 
      weight,
      tags,
      images
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {};
    if (product_name) updateData.product_name = product_name.trim();
    if (description) updateData.description = description.trim();
    if (catergory) updateData.catergory = catergory.trim();
    if (price) updateData.price = parseInt(price);
    if (weight) updateData.weight = parseInt(weight);
    if (tags) updateData.tags = tags.trim();
    
    if (quantity !== undefined) {
      updateData.quantity = parseInt(quantity);
      updateData.in_stock = parseInt(quantity) > 0;
    }

    // Handle image uploads if new images provided
    if (images && images.length > 0) {
      let uploadedImageUrls = [];
      for (const image of images) {
        if (image.startsWith('http')) {
          // Already a URL, keep it
          uploadedImageUrls.push(image);
        } else {
          // Upload new image
          try {
            const result = await cloudinary.uploader.upload(image, {
              folder: 'matrix-products',
              resource_type: 'auto'
            });
            uploadedImageUrls.push(result.secure_url);
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
          }
        }
      }
      updateData.images = uploadedImageUrls;
    }

    // Regenerate embedding if content changed
    if (product_name || description || catergory || tags) {
      console.log('🔄 Regenerating product embedding...');
      const embedding = await generateEmbedding({
        product_name: product_name || body.product_name,
        description: description || body.description,
        category: catergory || body.catergory,
        tags: tags || body.tags
      });
      if (embedding) {
        updateData.embedding = embedding;
        console.log('✅ Embedding regenerated');
      }
    }

    // Update product in Supabase
    const { data: product, error } = await supabase
      .from('Product')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('PUT product error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('DELETE request - ID:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Convert ID to integer
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete product with ID:', productId);

    // First check if product exists
    const { data: existingProduct, error: checkError } = await supabaseAdmin
      .from('Product')
      .select('id, images')
      .eq('id', productId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking product existence:', checkError);
      return NextResponse.json(
        { success: false, error: `Database error: ${checkError.message}` },
        { status: 500 }
      );
    }

    if (!existingProduct) {
      console.error('Product not found with ID:', productId);
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('Product found:', existingProduct);

    // Delete images from Cloudinary
    if (existingProduct?.images && existingProduct.images.length > 0) {
      console.log('Deleting images from Cloudinary:', existingProduct.images);
      for (const imageUrl of existingProduct.images) {
        try {
          // Extract public_id from Cloudinary URL
          const matches = imageUrl.match(/\/matrix-products\/(.+)\./);
          if (matches && matches[1]) {
            await cloudinary.uploader.destroy(`matrix-products/${matches[1]}`);
            console.log('Deleted image:', matches[1]);
          }
        } catch (deleteError) {
          console.error('Failed to delete image from Cloudinary:', deleteError);
        }
      }
    }

    // Delete product from Supabase (use admin client to bypass RLS)
    const { error } = await supabaseAdmin
      .from('Product')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { success: false, error: `Failed to delete product: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Product deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('DELETE product error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
