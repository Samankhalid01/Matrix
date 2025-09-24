import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      timestamp: new Date().toISOString(),
      status: 'Connected to MongoDB'
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'MongoDB connection failed',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}