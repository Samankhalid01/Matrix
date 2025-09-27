import QRCode from 'qrcode';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    // Generate QR code with only product ID
    const qrCodeDataUrl = await QRCode.toDataURL(productId.toString(), {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      productId: productId
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}