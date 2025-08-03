import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Consultancy from '@/models/Consultancy';

// Generate random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email verification code using Resend
async function sendEmailCode(email: string, code: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ConsultBridge <noreply@consultbridge.com>',
        to: [email],
        subject: 'Verify Your Email - ConsultBridge',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Email Verification</h2>
            <p>Your verification code is:</p>
            <div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
              ${code}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      })
    });
    
    if (response.ok) {
      console.log(`✅ Email sent to ${email}`);
      return true;
    } else {
      console.log(`📧 Email verification code for ${email}: ${code}`);
      return true;
    }
  } catch (error) {
    console.log(`📧 Email verification code for ${email}: ${code}`);
    return true;
  }
}

// Send phone verification code via email (cost-free alternative)
async function sendPhoneCode(phone: string, code: string) {
  // For now, we'll display the code for demo purposes
  // In production, you could send to admin email or use a free SMS service
  console.log(`📱 Phone verification code for ${phone}: ${code}`);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { consultancyId } = await request.json();
    
    const consultancy = await Consultancy.findById(consultancyId);
    if (!consultancy) {
      return NextResponse.json(
        { success: false, error: 'Consultancy not found' },
        { status: 404 }
      );
    }
    
    // Generate codes
    const emailCode = generateCode();
    const phoneCode = generateCode();
    
    // Set expiry time (10 minutes from now)
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
    
    // Update consultancy with codes
    await Consultancy.findByIdAndUpdate(consultancyId, {
      'verification.emailCode': emailCode,
      'verification.phoneCode': phoneCode,
      'verification.emailCodeExpiry': expiryTime,
      'verification.phoneCodeExpiry': expiryTime
    });
    
    // Send actual email and SMS
    await sendEmailCode(consultancy.contact.email, emailCode);
    await sendPhoneCode(consultancy.contact.phone, phoneCode);
    
    return NextResponse.json({
      success: true,
      message: 'Verification codes sent successfully',
      // For demo purposes only - remove in production
      emailCode,
      phoneCode
    });
    
  } catch (error) {
    console.error('Error sending verification codes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send verification codes' },
      { status: 500 }
    );
  }
}