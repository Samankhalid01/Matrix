import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { customerId, email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate QR code with customer email ONLY (plain text)
    const qrCodeDataURL = await QRCode.toDataURL(email, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL,
      customerId,
      email,
      message: 'QR code contains email address only'
    });

  } catch (error) {
    console.error('QR Code generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET all customers with QR codes
export async function GET() {
  try {
    const { data: customers, error } = await supabase
      .from('Customer')
      .select('id, name, email, customer_tier');

    if (error) throw error;

    // Generate QR codes for all customers
    const customersWithQR = await Promise.all(
      customers.map(async (customer) => {
        // QR code contains ONLY the email address (plain text)
        const qrCode = await QRCode.toDataURL(customer.email, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        return {
          ...customer,
          qrCode
        };
      })
    );

    return NextResponse.json({
      success: true,
      customers: customersWithQR
    });

  } catch (error) {
    console.error('QR Code generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
