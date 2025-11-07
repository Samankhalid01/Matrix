import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Create a new customer with QR code
export async function POST(request) {
  try {
    const { name, email, password, address, customer_tier } = await request.json();

    if (!name || !email) {
      return Response.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Insert customer (QR code will be the email)
    const { data: customer, error: insertError } = await supabase
      .from('Customer')
      .insert([
        {
          name,
          email,
          password,
          address,
          customer_tier,
          '2FA_enabled': false,
          in_store: false,
          is_fraud: false
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Customer creation error:', insertError);
      return Response.json(
        { success: false, error: insertError.message || 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Generate QR code image containing the email
    const qrCodeImage = await QRCode.toDataURL(email, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    return Response.json({
      success: true,
      message: 'Customer created successfully',
      customer: {
        ...customer,
        qrCodeImage
      }
    });

  } catch (error) {
    console.error('Customer API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get all customers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (customerId) {
      // Get specific customer with QR code
      const { data: customer, error } = await supabase
        .from('Customer')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error || !customer) {
        return Response.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }

      // Generate QR code image with customer email
      const qrCodeImage = await QRCode.toDataURL(customer.email, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2
      });

      return Response.json({
        success: true,
        customer: {
          ...customer,
          qrCodeImage
        }
      });
    }

    // Get all customers
    const { data: customers, error } = await supabase
      .from('Customer')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get customers error:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      customers
    });

  } catch (error) {
    console.error('Customer GET error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Update customer
export async function PUT(request) {
  try {
    const { id, customer_name, email, phone, qr_code } = await request.json();

    if (!id) {
      return Response.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const updates = {};
    if (customer_name) updates.customer_name = customer_name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (qr_code !== undefined) updates.qr_code = qr_code;

    const { data: customer, error } = await supabase
      .from('Customer')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Customer update error:', error);
      return Response.json(
        { success: false, error: 'Failed to update customer' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Customer updated successfully',
      customer
    });

  } catch (error) {
    console.error('Customer PUT error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
