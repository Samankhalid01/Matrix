import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/utils/auth';

async function getProfile(request) {
  try {
    await connectDB();

    // Get user from database using ID from JWT token
    const user = await User.findById(request.user.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      storeName: user.storeName,
      storeAddress: user.storeAddress,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      role: user.role,
      lastLogin: user.lastLogin,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    return NextResponse.json(
      { user: userResponse },
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getProfile);