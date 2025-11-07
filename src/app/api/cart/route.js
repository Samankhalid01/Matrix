import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Add product to cart
export async function POST(request) {
  try {
    const { customerId, productId, quantity = 1 } = await request.json();

    if (!customerId || !productId) {
      return Response.json(
        { success: false, error: 'Customer ID and Product ID are required' },
        { status: 400 }
      );
    }

    // Verify active session exists
    const { data: session, error: sessionError } = await supabase
      .from('ShoppingSession')
      .select('*')
      .eq('customer_id', customerId)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return Response.json(
        { success: false, error: 'No active shopping session. Please scan customer QR code first.' },
        { status: 400 }
      );
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('Product')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return Response.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product already in cart
    const { data: existingCartItem } = await supabase
      .from('Cart')
      .select('*')
      .eq('customer_id', customerId)
      .eq('product_id', productId)
      .single();

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      const newTotalPrice = product.price * newQuantity;

      const { data: updatedItem, error: updateError } = await supabase
        .from('Cart')
        .update({
          quantity: newQuantity,
          total_price: newTotalPrice
        })
        .eq('id', existingCartItem.id)
        .select()
        .single();

      if (updateError) {
        console.error('Cart update error:', updateError);
        return Response.json(
          { success: false, error: 'Failed to update cart' },
          { status: 500 }
        );
      }

      return Response.json({
        success: true,
        message: 'Cart updated',
        cartItem: updatedItem,
        product
      });
    }

    // Add new item to cart
    const totalPrice = product.price * quantity;

    const { data: newCartItem, error: insertError } = await supabase
      .from('Cart')
      .insert([
        {
          customer_id: customerId,
          product_id: productId,
          quantity: quantity,
          unit_price: product.price,
          total_price: totalPrice
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Cart insert error:', insertError);
      return Response.json(
        { success: false, error: 'Failed to add to cart' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Product added to cart',
      cartItem: newCartItem,
      product
    });

  } catch (error) {
    console.error('Cart API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get cart items for customer
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return Response.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get cart items with product details
    const { data: cartItems, error } = await supabase
      .from('Cart')
      .select(`
        *,
        Product (*)
      `)
      .eq('customer_id', customerId);

    if (error) {
      console.error('Get cart error:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch cart' },
        { status: 500 }
      );
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.total_price || 0), 0);

    return Response.json({
      success: true,
      cartItems,
      total,
      itemCount: cartItems.length
    });

  } catch (error) {
    console.error('Get cart error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Update cart item quantity
export async function PUT(request) {
  try {
    const { cartItemId, quantity } = await request.json();

    if (!cartItemId || quantity === undefined) {
      return Response.json(
        { success: false, error: 'Cart item ID and quantity are required' },
        { status: 400 }
      );
    }

    // Get cart item with product details
    const { data: cartItem } = await supabase
      .from('Cart')
      .select(`
        *,
        Product (price)
      `)
      .eq('id', cartItemId)
      .single();

    if (!cartItem) {
      return Response.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    const newTotalPrice = cartItem.Product.price * quantity;

    const { data: updatedItem, error } = await supabase
      .from('Cart')
      .update({
        quantity: quantity,
        total_price: newTotalPrice
      })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) {
      console.error('Update cart item error:', error);
      return Response.json(
        { success: false, error: 'Failed to update cart item' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Cart item updated',
      cartItem: updatedItem
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete cart item
export async function DELETE(request) {
  try {
    const { cartItemId } = await request.json();

    if (!cartItemId) {
      return Response.json(
        { success: false, error: 'Cart item ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('Cart')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      console.error('Delete cart item error:', error);
      return Response.json(
        { success: false, error: 'Failed to delete cart item' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (error) {
    console.error('Delete cart item error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
