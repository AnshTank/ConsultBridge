import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { consultancyId, type, email, phone, rejectionReason } = await request.json();

    const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify/${verificationToken}?type=${type}&consultancy=${consultancyId}`;
    
    // Add rejection reason to verification link if exists
    if (rejectionReason) {
      verificationLink += `&reason=${encodeURIComponent(rejectionReason)}`;
    }

    // For demo: Change status to pending when verification link is sent
    console.log(`🔄 Changing consultancy ${consultancyId} status to PENDING`);
    console.log(`📧 ${type.toUpperCase()} verification required before login`);
    
    if (rejectionReason) {
      console.log(`📝 Rejection reason included: ${rejectionReason}`);
    }
    
    if (type === 'email') {
      console.log(`📧 Email verification link sent to: ${email}`);
      console.log(`🔗 Verification link: ${verificationLink}`);
    } else if (type === 'phone') {
      console.log(`📱 SMS verification link sent to: ${phone}`);
      console.log(`🔗 Verification link: ${verificationLink}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Verification link sent to ${type}. Status changed to pending - consultancy must verify before login.`,
      verificationLink,
      statusChanged: true
    });

  } catch (error) {
    console.error('Error sending verification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send verification' },
      { status: 500 }
    );
  }
}