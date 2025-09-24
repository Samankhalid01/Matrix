import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CustomerPresence from '@/models/CustomerPresence';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status'); // 'active', 'all'
    
    let query = {};
    if (status === 'active') {
      query.is_currently_in_store = true;
    }
    
    const total = await CustomerPresence.countDocuments(query);
    const customers = await CustomerPresence.find(query)
      .sort({ entry_time: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return NextResponse.json({ 
      success: true, 
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Customer ID is required' 
      }, { status: 400 });
    }
    
    const result = await CustomerPresence.deleteMany({ 
      customer_id: customerId 
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} records for customer ${customerId}` 
    });
  } catch (error) {
    console.error('Customers DELETE error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}