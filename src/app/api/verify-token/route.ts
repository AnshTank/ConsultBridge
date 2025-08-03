import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, type, consultancyId } = await request.json();

    // For demo purposes, just return success
    console.log(`✅ Verification successful for ${type} with token: ${token}`);
    console.log(`🏢 Consultancy ID: ${consultancyId}`);

    return NextResponse.json({
      success: true,
      message: `Your ${type === 'email' ? 'email address' : 'phone number'} has been successfully verified!`,
      consultancyName: 'Demo Consultancy'
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during verification. Please try again.',
        expired: false
      },
      { status: 500 }
    );
  }
}