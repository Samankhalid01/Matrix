import { NextResponse } from 'next/server';
import SurveillanceNotification from '@/models/SurveillanceNotification';
import connectDB from '@/config/database';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    let filter = {};
    if (unreadOnly) {
      filter.read = false;
    }

    const skip = (page - 1) * limit;
    
    const notifications = await SurveillanceNotification.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SurveillanceNotification.countDocuments(filter);
    const unread = await SurveillanceNotification.countDocuments({ read: false });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        total,
        unread
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const notification = new SurveillanceNotification(body);
    await notification.save();

    return NextResponse.json({
      success: true,
      data: notification
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}