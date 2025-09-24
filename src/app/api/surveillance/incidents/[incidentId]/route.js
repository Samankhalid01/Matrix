import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import SurveillanceIncident from '@/models/SurveillanceIncident';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { incidentId } = params;
    const incident = await SurveillanceIncident.findOne({ incident_id: incidentId });

    if (!incident) {
      return NextResponse.json(
        { success: false, error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: incident
    });

  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { incidentId } = params;
    const body = await request.json();
    const { verdict, notes } = body;

    if (!verdict || !['confirmed_theft', 'false_alarm'].includes(verdict)) {
      return NextResponse.json(
        { success: false, error: 'Invalid verdict' },
        { status: 400 }
      );
    }

    const incident = await SurveillanceIncident.findOneAndUpdate(
      { incident_id: incidentId },
      {
        admin_reviewed: true,
        admin_verdict: verdict,
        review_notes: notes || '',
        reviewed_at: new Date(),
        status: verdict === 'confirmed_theft' ? 'confirmed' : 'false_alarm'
      },
      { new: true }
    );

    if (!incident) {
      return NextResponse.json(
        { success: false, error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: incident,
      message: `Incident reviewed as ${verdict}`
    });

  } catch (error) {
    console.error('Error reviewing incident:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to review incident' },
      { status: 500 }
    );
  }
}