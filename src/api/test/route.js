import { NextResponse } from 'next/server';

// Simple test version to verify route recognition
export async function GET() {
  console.log('🔍 Simple GET test');
  return NextResponse.json({ 
    success: true, 
    message: 'API route is working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  console.log('🎨 Simple POST test');
  return NextResponse.json({ 
    success: true, 
    message: 'POST endpoint is working!',
    timestamp: new Date().toISOString()
  });
}