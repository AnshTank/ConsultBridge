import { NextRequest, NextResponse } from "next/server";
import { BookingManager } from "../../../../services/bookingManager";

const bookingManager = new BookingManager();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: "Session ID is required"
      }, { status: 400 });
    }

    // Simulate payment completion after 5 seconds
    // In a real app, this would check actual payment status
    return NextResponse.json({
      success: true,
      data: {
        status: 'completed',
        reply: "🎉 Booking Confirmed & Payment Successful!\n\n📋 Your appointment has been booked successfully!\n\n✅ Confirmation details sent!",
        needsBooking: false
      }
    });

  } catch (error) {
    console.error("Payment check error:", error);
    return NextResponse.json({
      success: false,
      error: "Error checking payment status"
    }, { status: 500 });
  }
}