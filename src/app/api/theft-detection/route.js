import { NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

// POST - Upload video to Python service
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('video');
    
    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Forward to Python service
    const pythonFormData = new FormData();
    pythonFormData.append('video', file);

    const response = await fetch(`${PYTHON_SERVICE_URL}/upload`, {
      method: 'POST',
      body: pythonFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Upload failed' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get all processing jobs (if needed for admin dashboard)
export async function GET() {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/health`);
    const data = await response.json();
    
    return NextResponse.json({
      service_status: data,
      message: 'Theft detection service status'
    });
  } catch (error) {
    console.error('Service check error:', error);
    return NextResponse.json({ 
      error: 'Unable to connect to theft detection service',
      service_status: { status: 'offline' }
    }, { status: 503 });
  }
}