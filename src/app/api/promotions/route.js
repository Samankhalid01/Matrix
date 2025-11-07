import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET: Fetch all promotions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');
    const targetTier = searchParams.get('target_tier');

    let query = supabase
      .from('Promotion')
      .select('*')
      .order('created_at', { ascending: false });

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }
    if (targetTier) {
      query = query.or(`target_tier.eq.${targetTier},target_tier.is.null`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get active promotions count
    const { count: activeCount } = await supabase
      .from('Promotion')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString());

    return NextResponse.json({
      success: true,
      promotions: data,
      activeCount: activeCount || 0,
      total: data.length
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new promotion
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      code,
      name,
      description,
      discount_type,
      discount_value,
      target_tier,
      min_purchase_amount,
      max_discount_amount,
      start_date,
      end_date,
      usage_limit,
      is_active = true
    } = body;

    // Validation
    if (!name || !discount_type || !discount_value) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Promotion')
      .insert([
        {
          code,
          name,
          description,
          discount_type,
          discount_value,
          target_tier,
          min_purchase_amount,
          max_discount_amount,
          start_date: start_date || new Date().toISOString(),
          end_date,
          usage_limit,
          is_active,
          usage_count: 0
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      promotion: data,
      message: 'Promotion created successfully'
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update a promotion
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Promotion ID required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Promotion')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      promotion: data,
      message: 'Promotion updated successfully'
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a promotion
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const promotionId = searchParams.get('id');

    if (!promotionId) {
      return NextResponse.json(
        { success: false, error: 'Promotion ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('Promotion')
      .delete()
      .eq('id', promotionId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
