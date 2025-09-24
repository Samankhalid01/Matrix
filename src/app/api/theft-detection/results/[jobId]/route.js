import { NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

export async function GET(request, { params }) {
  try {
    const { jobId } = params;
    
    const response = await fetch(`${PYTHON_SERVICE_URL}/results/${jobId}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Results not found' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}