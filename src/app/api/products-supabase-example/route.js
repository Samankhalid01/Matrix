import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all products or search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products,
      total: count,
      limit,
      offset
    });

  } catch (error) {
    console.error('GET products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      category, 
      stockQuantity, 
      sku,
      imageUrl,
      cloudinaryId 
    } = body;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    // Insert product into Supabase
    const { data: product, error } = await supabase
      .from('products')
      .insert([
        {
          name: name.trim(),
          description: description?.trim(),
          price: parseFloat(price),
          category: category?.trim(),
          stock_quantity: parseInt(stockQuantity || 0),
          sku: sku?.trim(),
          image_url: imageUrl,
          cloudinary_id: cloudinaryId
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stockQuantity: product.stock_quantity,
        sku: product.sku,
        imageUrl: product.image_url,
        cloudinaryId: product.cloudinary_id,
        createdAt: product.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('POST product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
      name, 
      description, 
      price, 
      category, 
      stockQuantity, 
      sku,
      imageUrl,
      cloudinaryId 
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category.trim();
    if (stockQuantity !== undefined) updateData.stock_quantity = parseInt(stockQuantity);
    if (sku) updateData.sku = sku.trim();
    if (imageUrl) updateData.image_url = imageUrl;
    if (cloudinaryId) updateData.cloudinary_id = cloudinaryId;

    // Update product in Supabase
    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stockQuantity: product.stock_quantity,
        sku: product.sku,
        imageUrl: product.image_url,
        cloudinaryId: product.cloudinary_id,
        updatedAt: product.updated_at
      }
    });

  } catch (error) {
    console.error('PUT product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Delete product from Supabase
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('DELETE product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
