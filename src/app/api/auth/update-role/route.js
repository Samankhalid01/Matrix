import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'customer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or customer' },
        { status: 400 }
      );
    }

    // Update user role in Supabase
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ role: role, updated_at: new Date().toISOString() })
      .eq('email', email.toLowerCase())
      .select('id, email, role, first_name, last_name')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'User role updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}