import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consultancy from '@/models/Consultancy';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { consultancyId, emailCode, phoneCode } = await request.json();
    
    console.log('Verification attempt:', {
      consultancyId,
      emailCode: emailCode,
      phoneCode: phoneCode
    });
    
    const consultancy = await Consultancy.findById(consultancyId);
    if (!consultancy) {
      return NextResponse.json(
        { success: false, error: 'Consultancy not found' },
        { status: 404 }
      );
    }
    
    const now = new Date();
    
    // Check email code
    if (!consultancy.verification.emailCode || 
        !consultancy.verification.emailCodeExpiry ||
        consultancy.verification.emailCodeExpiry < now) {
      return NextResponse.json(
        { success: false, error: 'Email verification code expired' },
        { status: 400 }
      );
    }
    
    console.log('Email code comparison:', {
      stored: consultancy.verification.emailCode,
      provided: emailCode,
      match: consultancy.verification.emailCode.toString() === emailCode.toString()
    });
    
    if (consultancy.verification.emailCode.toString() !== emailCode.toString()) {
      return NextResponse.json(
        { success: false, error: 'Invalid email verification code' },
        { status: 400 }
      );
    }
    
    // Check phone code
    if (!consultancy.verification.phoneCode || 
        !consultancy.verification.phoneCodeExpiry ||
        consultancy.verification.phoneCodeExpiry < now) {
      return NextResponse.json(
        { success: false, error: 'Phone verification code expired' },
        { status: 400 }
      );
    }
    
    console.log('Phone code comparison:', {
      stored: consultancy.verification.phoneCode,
      provided: phoneCode,
      match: consultancy.verification.phoneCode.toString() === phoneCode.toString()
    });
    
    if (consultancy.verification.phoneCode.toString() !== phoneCode.toString()) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone verification code' },
        { status: 400 }
      );
    }
    
    // Mark as verified
    await Consultancy.findByIdAndUpdate(consultancyId, {
      'verification.emailVerified': true,
      'verification.phoneVerified': true,
      'verification.emailCode': undefined,
      'verification.phoneCode': undefined,
      'verification.emailCodeExpiry': undefined,
      'verification.phoneCodeExpiry': undefined
    });
    
    return NextResponse.json({
      success: true,
      message: 'Verification completed successfully'
    });
    
  } catch (error) {
    console.error('Error verifying codes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify codes' },
      { status: 500 }
    );
  }
}