import { NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

export async function POST() {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/demo`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Demo processing failed' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Demo processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}