import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { meetingId, userRole, userName, userId } = await request.json();
    
    if (!meetingId || !userRole || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const meetingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/meeting/${meetingId}?role=${userRole}&name=${encodeURIComponent(userName)}&userId=${userId || ''}`;
    
    return NextResponse.json({ 
      success: true, 
      meetingUrl,
      meetingId,
      userRole 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join meeting' }, { status: 500 });
  }
}