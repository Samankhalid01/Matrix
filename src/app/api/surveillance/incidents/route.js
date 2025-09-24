import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import SurveillanceIncident from '@/models/SurveillanceIncident';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    let filter = {};
    if (status === 'flagged') {
      filter.flagged = true;
    } else if (status === 'pending') {
      filter.status = 'pending_review';
    } else if (status === 'reviewed') {
      filter.admin_reviewed = true;
    } else if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    
    const incidents = await SurveillanceIncident.find(filter)
      .sort({ detected_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SurveillanceIncident.countDocuments(filter);
    const flagged = await SurveillanceIncident.countDocuments({ flagged: true });
    const pending = await SurveillanceIncident.countDocuments({ status: 'pending_review' });

    return NextResponse.json({
      success: true,
      data: {
        incidents,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: incidents.length,
          total_items: total
        },
        stats: {
          total,
          flagged,
          pending_review: pending
        }
      }
    });

  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const incident = new SurveillanceIncident(body);
    await incident.save();

    return NextResponse.json({
      success: true,
      data: incident
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}