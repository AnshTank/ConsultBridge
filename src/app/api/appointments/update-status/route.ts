import { NextResponse } from 'next/server';
import { AppointmentStatusUpdater } from '../../../../services/appointmentStatusUpdater';

export async function POST() {
  try {
    await AppointmentStatusUpdater.updateExpiredAppointments();
    
    return NextResponse.json({
      success: true,
      message: 'Expired appointments updated successfully'
    });
  } catch (error) {
    console.error('Update status API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update appointment statuses'
    }, { status: 500 });
  }
}