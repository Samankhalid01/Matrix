import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET: Fetch all notifications (with filters)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientType = searchParams.get('recipient_type'); // admin or customer
    const recipientId = searchParams.get('recipient_id');
    const isRead = searchParams.get('is_read'); // true/false
    const priority = searchParams.get('priority'); // low, medium, high, critical
    const limit = parseInt(searchParams.get('limit')) || 50;

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
