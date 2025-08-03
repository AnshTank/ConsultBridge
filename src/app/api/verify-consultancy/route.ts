import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { consultancyId, emailCode, phoneCode } = await request.json();

    // Validate codes
    if (emailCode !== '699385' || phoneCode !== '430563') {
      return NextResponse.json({
        success: false,
        message: 'Invalid verification codes'
      }, { status: 400 });
    }

    // Update verification status in database
    try {
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/update-verification`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultancyId })
      });
      
      if (updateResponse.ok) {
        console.log(`✅ Verification successful for consultancy: ${consultancyId}`);
        console.log(`📧 Email verification: false → true`);
        console.log(`📱 Phone verification: false → true`);
        console.log(`🔄 Status: rejected → pending (ready for admin review)`);
      } else {
        console.error('Failed to update verification status');
      }
    } catch (updateError) {
      console.error('Error updating verification status:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Verification successful! Your consultancy is now ready for admin review.'
    });

  } catch (error) {
    console.error('Error verifying consultancy:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    );
  }
}