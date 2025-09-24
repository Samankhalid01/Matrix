import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { notificationId } = params;
    
    const response = await fetch(`http://localhost:5000/surveillance/notifications/${notificationId}/read`, {
      method: 'POST'
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to mark notification as read' },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}