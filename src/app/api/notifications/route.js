import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper: Generate notifications from real product/sales data
async function generateAutoNotifications() {
  try {
    const notifications = [];

    // 1. Low stock notifications from products
    const { data: lowStockProducts } = await supabase
      .from('Product')
      .select('id, product_name, quantity, min_stock_threshold, category')
      .order('quantity', { ascending: true })
      .limit(20);

    for (const product of lowStockProducts || []) {
      const stock = product.quantity || 0;
      const threshold = product.min_stock_threshold || 10;
      
      if (stock <= threshold) {
        // Check if notification already exists
        const { data: existing } = await supabase
          .from('Notification')
          .select('id')
          .eq('notification_type', 'stock_alert')
          .ilike('title', `%${product.product_name}%`)
          .eq('is_read', false)
          .single();

        if (!existing) {
          const priority = stock === 0 ? 'critical' : stock <= 5 ? 'high' : 'medium';
          const { data: newNotif } = await supabase
            .from('Notification')
            .insert({
              recipient_type: 'admin',
              notification_type: 'stock_alert',
              title: stock === 0 
                ? `OUT OF STOCK: ${product.product_name}`
                : `Low Stock Alert: ${product.product_name}`,
              message: stock === 0 
                ? `${product.product_name} is completely out of stock! Immediate reorder required.`
                : `${product.product_name} has only ${stock} units remaining (threshold: ${threshold}). Consider reordering soon.`,
              priority,
              action_url: '/admin/inventory',
              metadata: { product_id: product.id, current_stock: stock, category: product.category },
              is_read: false
            })
            .select()
            .single();

          if (newNotif) notifications.push(newNotif);
        }
      }
    }

    // 2. High sales notifications from recent transactions
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentSales } = await supabase
      .from('TransactionItem')
      .select('product_name, quantity, total_price')
      .gte('created_at', yesterday.toISOString());

    // Aggregate sales by product
    const salesByProduct = {};
    for (const sale of recentSales || []) {
      if (!salesByProduct[sale.product_name]) {
        salesByProduct[sale.product_name] = { quantity: 0, revenue: 0 };
      }
      salesByProduct[sale.product_name].quantity += sale.quantity || 0;
      salesByProduct[sale.product_name].revenue += sale.total_price || 0;
    }

    // Find top sellers (more than 10 units in last 24h)
    for (const [productName, data] of Object.entries(salesByProduct)) {
      if (data.quantity >= 10) {
        const { data: existing } = await supabase
          .from('Notification')
          .select('id')
          .eq('notification_type', 'sales_milestone')
          .ilike('title', `%${productName}%`)
          .eq('is_read', false)
          .single();

        if (!existing) {
          const { data: newNotif } = await supabase
            .from('Notification')
            .insert({
              recipient_type: 'admin',
              notification_type: 'sales_milestone',
              title: `High Demand: ${productName}`,
              message: `${productName} sold ${data.quantity} units in the last 24 hours, generating $${data.revenue.toFixed(2)} in revenue. Consider increasing stock.`,
              priority: 'medium',
              action_url: '/admin/demand-prediction',
              metadata: { product_name: productName, units_sold: data.quantity, revenue: data.revenue },
              is_read: false
            })
            .select()
            .single();

          if (newNotif) notifications.push(newNotif);
        }
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error generating auto notifications:', error);
    return [];
  }
}

// GET: Fetch all notifications (with filters)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientType = searchParams.get('recipient_type'); // admin or customer
    const recipientId = searchParams.get('recipient_id');
    const isRead = searchParams.get('is_read'); // true/false
    const priority = searchParams.get('priority'); // low, medium, high, critical
    const limit = parseInt(searchParams.get('limit')) || 50;
    const autoGenerate = searchParams.get('auto_generate') !== 'false';

    // Auto-generate notifications from real data
    if (autoGenerate && recipientType === 'admin') {
      await generateAutoNotifications();
    }

    let query = supabase
      .from('Notification')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (recipientType) {
      query = query.eq('recipient_type', recipientType);
    }
    if (recipientId) {
      query = query.eq('recipient_id', recipientId);
    }
    if (isRead !== null && isRead !== undefined) {
      query = query.eq('is_read', isRead === 'true');
    }
    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('Notification')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('recipient_type', recipientType || 'admin');

    return NextResponse.json({
      success: true,
      notifications: data,
      unreadCount: unreadCount || 0,
      total: data.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new notification
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      recipient_type,
      recipient_id,
      notification_type,
      title,
      message,
      priority = 'medium',
      action_url,
      metadata
    } = body;

    // Validation
    if (!recipient_type || !notification_type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Notification')
      .insert([
        {
          recipient_type,
          recipient_id,
          notification_type,
          title,
          message,
          priority,
          action_url,
          metadata,
          is_read: false
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      notification: data,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Mark notification(s) as read
export async function PUT(request) {
  try {
    const body = await request.json();
    const { notificationIds, markAllAsRead, recipientType } = body;

    if (markAllAsRead) {
      // Mark all notifications as read for a recipient type
      const { data, error } = await supabase
        .from('Notification')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_type', recipientType || 'admin')
        .eq('is_read', false)
        .select();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `Marked ${data.length} notifications as read`,
        updatedCount: data.length
      });
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      const { data, error } = await supabase
        .from('Notification')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', notificationIds)
        .select();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Notifications marked as read',
        updated: data
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'No notification IDs provided' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a notification
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('Notification')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
