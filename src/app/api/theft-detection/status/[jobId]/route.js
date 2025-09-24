import { NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

export async function GET(request, { params }) {
  try {
    const { jobId } = params;
    
    const response = await fetch(`${PYTHON_SERVICE_URL}/status/${jobId}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Status check failed' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}