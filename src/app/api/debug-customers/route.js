import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    // Get all customers
    const { data: customers, error } = await supabase
      .from('Customer')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      customers: customers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        address: c.address,
        customer_tier: c.customer_tier,
        in_store: c.in_store,
        created_at: c.created_at
      }))
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
