import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET single complaint from Supabase
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('Complaint')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      complaint: data,
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update complaint in Supabase
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data: complaint, error: fetchError } = await supabase
      .from('Complaint')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {};
    if (body.status) updateData.status = body.status;
    if (body.resolution_notes !== undefined) {
      updateData.resolution_notes = body.resolution_notes;
      updateData.status = 'resolved';
    }

    // Update complaint in Supabase
    const { data: updatedComplaint, error: updateError } = await supabase
      .from('Complaint')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE complaint from Supabase
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('Complaint')
      .delete()
      .eq('id', id)
      .select();

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
