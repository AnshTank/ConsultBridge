import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Consultancy from '../../../../models/Consultancy';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }
    
    const consultancy = await Consultancy.findOne({ 
      'contact.email': email,
      'contact.password': password
    });
    
    if (!consultancy) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        id: consultancy._id,
        name: consultancy.name,
        email: consultancy.contact.email
      }
    });
  } catch (error) {
    console.error('Error signing in consultancy:', error);
    return NextResponse.json(
      { success: false, error: 'Sign in failed' },
      { status: 500 }
    );
  }
}