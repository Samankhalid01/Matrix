import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Hardcoded admin credentials
const ADMIN_USERNAME = 'Saman';
const ADMIN_PASSWORD = '1234';
const ADMIN_EMAIL = 'admin@matrix.com';

export async function POST(request) {
  try {
    // Parse request body
    const { username, password } = await request.json();

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check hardcoded admin credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Admin user object
    const user = {
      id: 1,
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      role: 'admin',
      first_name: 'Saman',
      last_name: 'Admin'
    };

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Prepare user response
    const userResponse = {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      fullName: `${user.first_name} ${user.last_name}`,
      role: user.role
    };

    // Create response with token in httpOnly cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: userResponse,
        token
      },
      { status: 200 }
    );

    // Set httpOnly cookie for security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE(request) {
  try {
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
    response.cookies.delete('auth-token');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
