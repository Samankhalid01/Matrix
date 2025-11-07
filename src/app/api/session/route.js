import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Start a new shopping session for a customer
export async function POST(request) {
  try {
    const { customerQrCode } = await request.json();

    if (!customerQrCode) {
      return Response.json(
        { success: false, error: 'Customer QR code is required' },
        { status: 400 }
      );
    }

    console.log('Received QR code:', customerQrCode);

    // QR code contains customer email
    let emailToSearch = customerQrCode.trim();
    let customerIdToSearch = null;
    
    // Try to parse if it's JSON
    try {
      const parsed = JSON.parse(customerQrCode);
      if (parsed.email) {
        emailToSearch = parsed.email;
      } else if (parsed.id) {
        customerIdToSearch = parsed.id;
      }
    } catch (e) {
      // Not JSON, treat as plain email
      emailToSearch = customerQrCode.trim();
    }

    console.log('Searching for customer with email:', emailToSearch);

    // Find customer by email or ID
    let customer = null;
    let customerError = null;

    if (customerIdToSearch) {
      const result = await supabase
        .from('Customer')
        .select('*')
        .eq('id', customerIdToSearch)
        .single();
      customer = result.data;
      customerError = result.error;
    } else {
      const result = await supabase
        .from('Customer')
        .select('*')
        .eq('email', emailToSearch)
        .single();
      customer = result.data;
      customerError = result.error;
    }

    console.log('Customer search result:', { customer, customerError });

    if (customerError || !customer) {
      // Try searching all customers to debug
      const { data: allCustomers } = await supabase
        .from('Customer')
        .select('id, name, email')
        .limit(5);
      
      console.log('Available customers (first 5):', allCustomers);
      
      return Response.json(
        { 
          success: false, 
          error: 'Customer not found. Please check the email in QR code.',
          debug: {
            receivedQR: customerQrCode,
            searchedEmail: emailToSearch,
            availableCustomers: allCustomers?.map(c => c.email) || []
          }
        },
        { status: 404 }
      );
    }

    // Check if there's already an active session
    const { data: existingSession } = await supabase
      .from('ShoppingSession')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('is_active', true)
      .single();

    if (existingSession) {
      return Response.json({
        success: true,
        message: 'Session already exists',
        session: existingSession,
        customer
      });
    }

    // Create new session
    const { data: newSession, error: sessionError } = await supabase
      .from('ShoppingSession')
      .insert([
        {
          customer_id: customer.id,
          is_active: true
        }
      ])
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return Response.json(
        { success: false, error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Shopping session started',
      session: newSession,
      customer
    });

  } catch (error) {
    console.error('Session API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get active session
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return Response.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const { data: session, error } = await supabase
      .from('ShoppingSession')
      .select(`
        *,
        Customer (*)
      `)
      .eq('customer_id', customerId)
      .eq('is_active', true)
      .single();

    if (error || !session) {
      return Response.json(
        { success: false, error: 'No active session found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Get session error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// End session
export async function DELETE(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return Response.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ShoppingSession')
      .update({
        is_active: false,
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('End session error:', error);
      return Response.json(
        { success: false, error: 'Failed to end session' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Session ended',
      session: data
    });

  } catch (error) {
    console.error('Delete session error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
