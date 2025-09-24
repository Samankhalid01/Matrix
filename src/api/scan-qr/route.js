import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { ShoppingCart, CartItem } from '@/models/ShoppingCart';
import CustomerPresence from '@/models/CustomerPresence';

export async function POST(request) {
  try {
    await connectDB();
    const { qrData, customerId } = await request.json();
    
    if (!qrData || !customerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'QR data and customer ID are required' 
      }, { status: 400 });
    }
    
    // Parse QR code data
    let productData;
    try {
      productData = JSON.parse(qrData);
    } catch (parseError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid QR code format' 
      }, { status: 400 });
    }
    
    const product = await Product.findOne({ product_id: productData.product_id });
    
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    if (!product.in_stock || product.quantity <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product is out of stock' 
      }, { status: 400 });
    }
    
    // Create or get active shopping cart
    let cart = await ShoppingCart.findOne({ 
      customer_id: customerId, 
      is_active: true 
    });
    
    if (!cart) {
      const lastCart = await ShoppingCart.findOne().sort({ cart_id: -1 });
      const cart_id = lastCart ? lastCart.cart_id + 1 : 1;
      
      cart = new ShoppingCart({
        cart_id,
        customer_id: customerId,
        session_id: `session_${Date.now()}_${customerId}`,
        is_active: true
      });
      await cart.save();
    }
    
    // Add item to cart or update quantity
    let cartItem = await CartItem.findOne({ 
      cart_id: cart.cart_id.toString(), 
      product_id: product.product_id.toString() 
    });
    
    if (cartItem) {
      cartItem.quantity += 1;
      cartItem.total_price = cartItem.quantity * cartItem.unit_price;
      cartItem.added_at = new Date();
      await cartItem.save();
    } else {
      const lastCartItem = await CartItem.findOne().sort({ cart_item_id: -1 });
      const cart_item_id = lastCartItem ? lastCartItem.cart_item_id + 1 : 1;
      
      cartItem = new CartItem({
        cart_item_id,
        cart_id: cart.cart_id.toString(),
        product_id: product.product_id.toString(),
        quantity: 1,
        unit_price: product.price,
        total_price: product.price
      });
      await cartItem.save();
    }
    
    // Update customer presence/session
    const lastPresence = await CustomerPresence.findOne().sort({ presence_id: -1 });
    const presence_id = lastPresence ? lastPresence.presence_id + 1 : 1;
    
    await CustomerPresence.findOneAndUpdate(
      { customer_id: customerId, is_currently_in_store: true },
      { 
        presence_id,
        session_data: { 
          cart_id: cart.cart_id,
          last_scan: new Date(),
          total_items: await CartItem.countDocuments({ 
            cart_id: cart.cart_id.toString() 
          }),
          last_product_scanned: product.product_name
        },
        updated_at: new Date()
      },
      { 
        upsert: true,
        new: true
      }
    );
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        product, 
        cartItem, 
        cart,
        message: `${product.product_name} added to cart successfully` 
      } 
    });
  } catch (error) {
    console.error('QR Scan error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}