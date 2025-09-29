
import { NextRequest, NextResponse } from "next/server";
import { IntelligentChatbot } from "../../../services/intelligentChatbot";
import { BookingFlowManager } from "../../../services/bookingFlowManager";

const chatbot = new IntelligentChatbot();
const bookingManager = new BookingFlowManager();

// Session storage for booking flows (TODO: Replace with Redis/DB in production)
const bookingSessions = new Map<string, any>();

// Cleanup old sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  bookingSessions.forEach((session, sessionId) => {
    if (session.lastActivity && (now - session.lastActivity) > 30 * 60 * 1000) {
      bookingSessions.delete(sessionId);
    }
  });
}, 30 * 60 * 1000);

// Periodic payment processing completion check
setInterval(async () => {
  bookingSessions.forEach(async (session, sessionId) => {
    if (session.step === 'processing' && session.lastActivity && (Date.now() - session.lastActivity) > 8000) {
      try {
        await bookingManager.completePaymentProcessing(session);
        bookingSessions.delete(sessionId);
      } catch (error) {
        console.error('Payment completion error:', error);
        bookingSessions.delete(sessionId);
      }
    }
  });
}, 5000); // Check every 5 seconds

// Remove the global setTimeout as we now handle it per session

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

    // Check if user is signed in for booking operations
    if (!userId) {
      // Check if this is a booking-related message
      const bookingKeywords = ['book', 'appointment', 'schedule', 'reserve', 'confirm booking', 'payment'];
      const isBookingIntent = bookingKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );
      
      if (isBookingIntent) {
        return NextResponse.json({
          success: true,
          error: null,
          data: {
            reply: "I'd be happy to help you book an appointment! However, you'll need to sign in first to complete your booking. Please sign in and then let me know which consultancy you'd like to book with.",
            consultancies: [],
            actionType: 'auth_required',
            needsBooking: false,
            sessionId
          }
        });
      }
    }

    // Check if user is signed in for booking operations
    if (!userId) {
      const bookingKeywords = ['book', 'appointment', 'schedule', 'reserve', 'confirm booking', 'payment'];
      const isBookingIntent = bookingKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );
      
      if (isBookingIntent) {
        return NextResponse.json({
          success: true,
          error: null,
          data: {
            reply: "Please sign in first to complete your booking.",
            consultancies: [],
            actionType: 'auth_required',
            needsBooking: false,
            sessionId
          }
        });
      }
    }

    // Check if user is signed in for booking operations
    if (!userId) {
      const bookingKeywords = ['book', 'appointment', 'schedule', 'reserve', 'confirm booking', 'payment'];
      const isBookingIntent = bookingKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );
      
      if (isBookingIntent) {
        return NextResponse.json({
          success: true,
          error: null,
          data: {
            reply: "Please sign in first to complete your booking.",
            consultancies: [],
            actionType: 'auth_required',
            needsBooking: false,
            sessionId
          }
        });
      }
    }

    // Check if user is in booking flow
    const bookingSession = bookingSessions.get(sessionId);
    console.log('Checking booking session:', sessionId, bookingSession?.step);
    
    if (bookingSession && bookingSession.step && bookingSession.step !== 'complete') {
      if (!userId) {
        bookingSessions.delete(sessionId);
        return NextResponse.json({
          success: true,
          error: null,
          data: {
            reply: "Please sign in again to continue with your booking.",
            consultancies: [],
            actionType: 'auth_required',
            needsBooking: false,
            sessionId
          }
        });
      }
      if (!userId) {
        bookingSessions.delete(sessionId);
        return NextResponse.json({
          success: true,
          error: null,
          data: {
            reply: "Please sign in again to continue with your booking.",
            consultancies: [],
            actionType: 'auth_required',
            needsBooking: false,
            sessionId
          }
        });
      }
      // Ensure user is still signed in during booking flow
      if (!userId) {
        bookingSessions.delete(sessionId);
        return NextResponse.json({
          success: true,
          error: null,
          data: {
            reply: "Your session has expired. Please sign in again to continue with your booking.",
            consultancies: [],
            actionType: 'auth_required',
            needsBooking: false,
            sessionId
          }
        });
      }
      console.log('Continuing booking flow, step:', bookingSession.step);
      // Update last activity
      bookingSession.lastActivity = Date.now();
      bookingSessions.set(sessionId, bookingSession);
      try {
        // Handle payment processing completion
        if (bookingSession.step === 'processing') {
          // Check if enough time has passed (4 seconds)
          const timeSinceStart = Date.now() - (bookingSession.lastActivity || Date.now());
          
          if (timeSinceStart > 4000) {
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
                paymentReceipt: completionResult.bookingData.receipt,
                sessionId
              }
            });
          } else {
            // Still processing, return processing status with animation
            return NextResponse.json({
              success: true,
              error: null,
              data: {
                reply: "",
                consultancies: [],
                actionType: 'book',
                needsBooking: true,
                bookingData: bookingSession,
                processingPayment: true,
                paymentSteps: [
                  { step: 1, text: "Validating payment details", icon: "🔒", delay: 0 },
                  { step: 2, text: "Processing secure transaction", icon: "💳", delay: 1000 },
                  { step: 3, text: "Confirming appointment slot", icon: "📅", delay: 2000 },
                  { step: 4, text: "Generating confirmation", icon: "✅", delay: 3000 }
                ],
                sessionId
              }
            });
          }
        }
        
        // Handle booking step  
        const bookingResult = await bookingManager.processBookingStep(userMessage, sessionId, {
          ...bookingSession,
          userId: userId || bookingSession.userId,
          lastActivity: Date.now()
        });
        
        // Check if payment processing should start
        if (bookingResult.processingPayment) {
          const sessionData = {
            ...bookingResult.bookingData,
            userId: userId || bookingResult.bookingData.userId,
            lastActivity: Date.now()
          };
          bookingSessions.set(sessionId, sessionData);
          
          // Auto-complete payment processing after 4 seconds
          setTimeout(async () => {
            try {
              const currentSession = bookingSessions.get(sessionId);
              if (currentSession && currentSession.step === 'processing') {
                console.log('Auto-completing payment for session:', sessionId);
                const completionResult = await bookingManager.completePaymentProcessing(currentSession);
                bookingSessions.delete(sessionId);
              }
            } catch (error) {
              console.error('Auto-completion error for session', sessionId, ':', error);
              bookingSessions.delete(sessionId);
            }
          }, 4000);
          
          return NextResponse.json({
            success: true,
            error: null,
            data: {
              reply: "",
              consultancies: [],
              actionType: 'book',
              needsBooking: true,
              bookingData: bookingResult.bookingData,
              processingPayment: true,
              paymentSteps: [
                { step: 1, text: "Validating payment details", icon: "🔒", delay: 0 },
                { step: 2, text: "Processing secure transaction", icon: "💳", delay: 1000 },
                { step: 3, text: "Confirming appointment slot", icon: "📅", delay: 2000 },
                { step: 4, text: "Generating confirmation", icon: "✅", delay: 3000 }
              ],
              sessionId
            }
          });
        }
        
        if (bookingResult.isComplete) {
          bookingSessions.delete(sessionId);
        } else {
          bookingSessions.set(sessionId, {
            ...bookingResult.bookingData,
            userId: userId || bookingResult.bookingData.userId,
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
        userId: userId || result.bookingData.userId,
        lastActivity: Date.now()
      };
      bookingSessions.set(sessionId, sessionData);
      console.log('Booking session saved:', sessionId, sessionData.step, 'userId:', sessionData.userId);
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