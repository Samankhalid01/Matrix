import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET: Fetch stock alerts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, acknowledged, resolved
    const alertType = searchParams.get('alert_type'); // out_of_stock, low_stock

    let query = supabase
      .from('StockAlert')
      .select(`
        *,
        Product:product_id (
          id,
          product_name,
          price,
          current_stock,
          min_stock_threshold,
          category
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (alertType) {
      query = query.eq('alert_type', alertType);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get counts by status
    const { data: statusCounts } = await supabase
      .from('StockAlert')
      .select('status')
      .then(({ data }) => {
        const counts = {
          pending: 0,
          acknowledged: 0,
          resolved: 0,
          total: data?.length || 0
        };
        data?.forEach(alert => {
          counts[alert.status]++;
        });
        return { data: counts };
      });

    return NextResponse.json({
      success: true,
      alerts: data,
      statusCounts: statusCounts || { pending: 0, acknowledged: 0, resolved: 0, total: 0 },
      total: data.length
    });
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update stock alert status
export async function PUT(request) {
  try {
    const body = await request.json();
    const { alertId, status, acknowledgedBy } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { success: false, error: 'Alert ID and status required' },
        { status: 400 }
      );
    }

    const updateData = { status };

    if (status === 'acknowledged' || status === 'resolved') {
      // Only set acknowledged_by if a valid UUID is provided
      if (acknowledgedBy && acknowledgedBy.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        updateData.acknowledged_by = acknowledgedBy;
      }
      updateData.acknowledged_at = new Date().toISOString();
    }
    
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('StockAlert')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      alert: data,
      message: `Alert ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating stock alert:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
