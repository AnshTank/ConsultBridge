import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const { consultancyId, verificationNote, verificationType, contact } = await request.json();

    const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verification?consultancy=${consultancyId}&note=${encodeURIComponent(verificationNote)}`;

    // Update consultancy status to pending in database
    try {
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/consultancies/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultancyId,
          status: 'rejected',
          rejectionReason: verificationNote
        })
      });
      
      if (updateResponse.ok) {
        console.log(`✅ Status updated to REJECTED for consultancy ${consultancyId}`);
      }
    } catch (updateError) {
      console.error('Error updating status:', updateError);
    }

    console.log(`📝 Verification note sent to ${consultancyId}:`);
    console.log(`📧 Type: ${verificationType.toUpperCase()}`);
    console.log(`📞 Contact: ${contact}`);
    console.log(`📄 Note: ${verificationNote}`);
    console.log(`🔗 Verification link: ${verificationLink}`);
    console.log(`🔄 Status changed to: REJECTED`);

    return NextResponse.json({ 
      success: true, 
      message: `Verification note sent via ${verificationType}. Status changed to rejected - consultancy must verify to resubmit.`,
      verificationLink
    });

  } catch (error) {
    console.error('Error sending verification note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send verification note' },
      { status: 500 }
    );
  }
}