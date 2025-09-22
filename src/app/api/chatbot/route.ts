
import { NextRequest, NextResponse } from "next/server";
import { SmartChatbot } from "../../../services/smartChatbot";
import { BookingManager } from "../../../services/bookingManager";

const chatbot = new SmartChatbot();
const bookingManager = new BookingManager();

// Session storage for booking flows (TODO: Replace with Redis/DB in production)
const bookingSessions = new Map<string, any>();

// Cleanup old sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of bookingSessions.entries()) {
    if (session.lastActivity && (now - session.lastActivity) > 30 * 60 * 1000) {
      bookingSessions.delete(sessionId);
    }
  }
}, 30 * 60 * 1000);

// Periodic payment processing completion check
setInterval(async () => {
  for (const [sessionId, session] of bookingSessions.entries()) {
    if (session.step === 'processing' && session.lastActivity && (Date.now() - session.lastActivity) > 8000) {
      try {
        await bookingManager.completePaymentProcessing(session);
        bookingSessions.delete(sessionId);
      } catch (error) {
        console.error('Payment completion error:', error);
        bookingSessions.delete(sessionId);
      }
    }
  }
}, 5000); // Check every 5 seconds

// Auto-complete payment processing after delay
setTimeout(async () => {
  for (const [sessionId, session] of bookingSessions.entries()) {
    if (session.step === 'processing') {
      try {
        await bookingManager.completePaymentProcessing(session);
        bookingSessions.delete(sessionId);
      } catch (error) {
        console.error('Auto-completion error:', error);
        bookingSessions.delete(sessionId);
      }
    }
  }
}, 8000); // Complete after 8 seconds

function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').trim().slice(0, 2000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = sanitizeInput(body.message);
    const userId = sanitizeInput(body.userId || '');
    const sessionId = sanitizeInput(body.sessionId || `session_${Date.now()}`);

    if (!userMessage) {
      return NextResponse.json({
        success: false,
        error: "Message is required",
        data: null
      }, { status: 400 });
    }

    // Check if user is in booking flow
    const bookingSession = bookingSessions.get(sessionId);
    console.log('Checking booking session:', sessionId, bookingSession?.step);
    
    if (bookingSession && bookingSession.step && bookingSession.step !== 'complete') {
      console.log('Continuing booking flow, step:', bookingSession.step);
      // Update last activity
      bookingSession.lastActivity = Date.now();
      bookingSessions.set(sessionId, bookingSession);
      try {
        // Handle payment processing completion
        if (bookingSession.step === 'processing') {
          const completionResult = await bookingManager.completePaymentProcessing(bookingSession);
          bookingSessions.delete(sessionId);
          
          return NextResponse.json({
            success: true,
            error: null,
            data: {
              reply: completionResult.reply,
              consultancies: [],
              actionType: 'book',
              needsBooking: false,
              bookingData: completionResult.bookingData,
              sessionId
            }
          });
        }
        
        // Handle booking step  
        const bookingResult = await bookingManager.processBookingStep(userMessage, sessionId, {
          ...bookingSession,
          lastActivity: Date.now()
        });
        
        // Check if payment processing should start
        if (bookingResult.processingPayment) {
          bookingSessions.set(sessionId, bookingResult.bookingData);
          
          return NextResponse.json({
            success: true,
            error: null,
            data: {
              reply: bookingResult.reply,
              consultancies: [],
              actionType: 'book',
              needsBooking: true,
              bookingData: bookingResult.bookingData,
              processingPayment: true,
              sessionId
            }
          });
        }
        
        if (bookingResult.isComplete) {
          bookingSessions.delete(sessionId);
        } else {
          bookingSessions.set(sessionId, {
            ...bookingResult.bookingData,
            lastActivity: Date.now()
          });
        }
        
        return NextResponse.json({
          success: true,
          error: null,
          data: {
            reply: bookingResult.reply,
            consultancies: [],
            actionType: 'book',
            needsBooking: !bookingResult.isComplete,
            bookingData: bookingResult.bookingData,
            sessionId
          }
        });
      } catch (bookingError) {
        console.error("Booking process error:", bookingError);
        bookingSessions.delete(sessionId); // Clear corrupted session
        return NextResponse.json({
          success: false,
          error: "Booking process failed. Please start over.",
          data: null
        }, { status: 500 });
      }
    }
    
    // Process regular message
    let result;
    try {
      result = await chatbot.processMessage(userMessage, userId, sessionId);
    } catch (chatbotError) {
      console.error("Chatbot process error:", chatbotError);
      return NextResponse.json({
        success: false,
        error: "I'm having trouble processing your request. Please try again.",
        data: null
      }, { status: 500 });
    }
    
    // If booking initiated, save session with timestamp
    if (result.needsBooking && result.bookingData) {
      const sessionData = {
        ...result.bookingData,
        lastActivity: Date.now()
      };
      bookingSessions.set(sessionId, sessionData);
      console.log('Booking session saved:', sessionId, sessionData.step);
    }

    return NextResponse.json({
      success: true,
      error: null,
      data: {
        ...result,
        sessionId
      }
    });

  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json({
      success: false,
      error: "Sorry, I encountered an error. Please try again.",
      data: null
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: "Method not allowed",
    data: null
  }, { status: 405 });
}