
import { NextRequest } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Appointment from "../../../../models/Appointment";
import Consultancy from "../../../../models/Consultancy";
import { MemoryService } from "../../../../services/memoryService";
import { BookingService } from "../../../../services/bookingService";

const memoryService = new MemoryService();
const bookingService = new BookingService();

function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').trim().slice(0, 2000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const consultancyId = sanitizeInput(body.consultancyId);
    const userId = sanitizeInput(body.userId);
    const sessionId = sanitizeInput(body.sessionId || '');
    const appointmentDetails = body.appointmentDetails || {};

    if (!consultancyId || !userId || !appointmentDetails) {
      return new Response(JSON.stringify({
        success: false,
        error: "Consultancy ID, User ID, and appointment details are required",
        data: null
      }), { status: 400 });
    }

    // Validate required appointment fields
    if (!appointmentDetails.date || !appointmentDetails.time) {
      return new Response(JSON.stringify({
        success: false,
        error: "Date and time are required for booking",
        data: null
      }), { status: 400 });
    }

    // Use advanced booking service with validation
    const bookingRequest = {
      consultancyId,
      userId,
      date: sanitizeInput(appointmentDetails.date),
      time: sanitizeInput(appointmentDetails.time),
      duration: appointmentDetails.duration || 60,
      type: (sanitizeInput(appointmentDetails.type || 'online') === 'offline' ? 'offline' : 'online') as 'online' | 'offline',
      notes: sanitizeInput(appointmentDetails.notes || '')
    };

    // Validate booking first
    const validation = await bookingService.validateBooking(bookingRequest);

    if (!validation.isValid) {
      return new Response(JSON.stringify({
        success: false,
        error: "Booking validation failed.",
        message: validation.conflicts?.length
          ? `Conflicts: ${validation.conflicts.join(', ')}`
          : "No available slots.",
        suggestions: validation.suggestions,
        availableSlots: validation.availableSlots,
        data: null
      }), { status: 409 });
    }

    // Create booking
    const result = await bookingService.createBooking(bookingRequest);

    if (!result.success) {
      return new Response(JSON.stringify({
        success: false,
        error: "Booking failed.",
        message: result.message,
        data: null
      }), { status: 400 });
    }

    // Get consultancy details
    await connectDB();
    const consultancy = await Consultancy.findById(consultancyId);

    // Save booking confirmation to chat history
    if (sessionId) {
      await memoryService.saveConversation(
        sessionId,
        `Book appointment with ${consultancy?.name}`,
        result.message,
        userId,
        {
          booking: result.appointment,
          consultancy,
          bookingValidation: validation
        }
      );
    }

    return new Response(JSON.stringify({
      success: true,
      error: null,
      data: {
        appointment: result.appointment,
        consultancy: consultancy ? {
          _id: consultancy._id,
          name: consultancy.name,
          category: consultancy.category
        } : null,
        validation
      },
      message: result.message
    }), { status: 200 });

  } catch (error) {
    let errMsg = 'Unknown error';
    let errStack = '';
    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof (error as any).message === 'string') {
        errMsg = (error as any).message;
      }
      if ('stack' in error && typeof (error as any).stack === 'string') {
        errStack = (error as any).stack.split('\n')[0];
      }
    }
    console.error("Booking API error:", errMsg, errStack);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to create booking. Please try again.",
      data: null
    }), { status: 500 });
  }
}