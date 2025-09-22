export class BookingManager {
  private bookingSessions: Map<string, any> = new Map();

  async processBookingStep(message: string, sessionId: string, currentData?: any): Promise<{
    reply: string;
    nextStep: string | null;
    bookingData: any;
    isComplete: boolean;
    processingPayment?: boolean;
  }> {
    const session = this.bookingSessions.get(sessionId) || currentData || {};
    
    // Save session data
    this.bookingSessions.set(sessionId, session);
    
    switch (session.step) {
      case 'date':
        return this.handleDateInput(message, session);
      case 'time':
        return await this.handleTimeInput(message, session);
      case 'type':
        return this.handleTypeInput(message, session);
      case 'payment':
        return await this.handlePaymentInput(message, session);
      default:
        return this.handleInitialBooking(message, session);
    }
  }

  private handleDateInput(message: string, session: any) {
    const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const match = message.match(datePattern);
    
    if (!match) {
      return {
        reply: "Please provide a valid date in DD/MM/YYYY format (e.g., 25/12/2024):",
        nextStep: 'date',
        bookingData: session,
        isComplete: false
      };
    }
    
    const [, day, month, year] = match;
    const inputDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (inputDate < today) {
      return {
        reply: "Please select a future date. What date would you prefer?",
        nextStep: 'date',
        bookingData: session,
        isComplete: false
      };
    }
    
    // Check if it's a weekday (Monday-Friday)
    const dayOfWeek = inputDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return {
        reply: `${message} is a ${dayNames[dayOfWeek]}. We're only available Monday to Friday. Please choose a weekday:`,
        nextStep: 'date',
        bookingData: session,
        isComplete: false
      };
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const updatedSession = {
      ...session,
      date: message,
      appointmentDate: inputDate,
      step: 'time'
    };
    
    return {
      reply: `Perfect! ${message} (${dayNames[dayOfWeek]}) is available.\n\nWhat time would you prefer? Available hours: 9:00 AM - 6:00 PM:`,
      nextStep: 'time',
      bookingData: updatedSession,
      isComplete: false
    };
  }

  private async handleTimeInput(message: string, session: any) {
    const timePattern = /(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?/i;
    const match = message.match(timePattern);
    
    if (!match) {
      return {
        reply: "Please provide a valid time (e.g., 10:00 AM, 2:30 PM):",
        nextStep: 'time',
        bookingData: session,
        isComplete: false
      };
    }
    
    // Validate business hours (9 AM - 6 PM)
    let hour = parseInt(match[1]);
    const minute = match[2] ? parseInt(match[2]) : 0;
    const period = match[3]?.toUpperCase();
    
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    if (hour < 9 || hour >= 18) {
      return {
        reply: "Please choose a time between 9:00 AM and 6:00 PM:",
        nextStep: 'time',
        bookingData: session,
        isComplete: false
      };
    }
    
    // Check for conflicts with existing appointments
    const conflict = await this.checkTimeConflict(session.userId, session.appointmentDate, message);
    if (conflict) {
      return {
        reply: `You already have an appointment at ${message} on ${session.date}. Please choose a different time:`,
        nextStep: 'time',
        bookingData: session,
        isComplete: false
      };
    }
    
    const updatedSession = {
      ...session,
      time: message,
      step: 'type'
    };
    
    return {
      reply: `Perfect! ${message} on ${session.date}.\n\nHow would you prefer to meet?\n• Online (Video call)\n• Offline (In-person at office)`,
      nextStep: 'type',
      bookingData: updatedSession,
      isComplete: false
    };
  }
  
  private async checkTimeConflict(userId: string, appointmentDate: Date, time: string): Promise<boolean> {
    try {
      const connectDB = (await import('../lib/mongodb')).default;
      const mongoose = (await import('mongoose')).default;
      
      await connectDB();
      const db = mongoose.connection.db;
      if (!db) return false;
      
      const appointmentsCollection = db.collection('appointments');
      const startOfDay = new Date(appointmentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(appointmentDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const existingAppointment = await appointmentsCollection.findOne({
        clientId: userId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        appointmentTime: time,
        status: { $in: ['pending', 'confirmed'] }
      });
      
      return !!existingAppointment;
    } catch (error) {
      console.error('Error checking time conflict:', error);
      return false;
    }
  }

  private handleTypeInput(message: string, session: any) {
    const lowerMsg = message.toLowerCase();
    let consultationType = '';
    
    if (lowerMsg.includes('online') || lowerMsg.includes('video')) {
      consultationType = 'online';
    } else if (lowerMsg.includes('offline') || lowerMsg.includes('person') || lowerMsg.includes('office')) {
      consultationType = 'offline';
    } else {
      return {
        reply: "Please choose:\n• Type 'online' for video consultation\n• Type 'offline' for in-person meeting",
        nextStep: 'type',
        bookingData: session,
        isComplete: false
      };
    }
    
    const updatedSession = {
      ...session,
      consultationType,
      step: 'payment'
    };
    
    return {
      reply: `Perfect! ${consultationType.charAt(0).toUpperCase() + consultationType.slice(1)} consultation selected.\n\nHow would you like to pay?\n• Credit/Debit Card\n• UPI\n• Net Banking`,
      nextStep: 'payment',
      bookingData: updatedSession,
      isComplete: false
    };
  }
  
  private async handlePaymentInput(message: string, session: any) {
    const lowerMsg = message.toLowerCase();
    let paymentMethod = '';
    
    if (lowerMsg.includes('card') || lowerMsg.includes('credit') || lowerMsg.includes('debit')) {
      paymentMethod = 'Card';
    } else if (lowerMsg.includes('upi')) {
      paymentMethod = 'UPI';
    } else if (lowerMsg.includes('net') || lowerMsg.includes('banking')) {
      paymentMethod = 'Net Banking';
    } else {
      return {
        reply: "Please choose a payment method:\n• Card\n• UPI\n• Net Banking",
        nextStep: 'payment',
        bookingData: session,
        isComplete: false
      };
    }
    
    // Return processing state to trigger animation
    return {
      reply: "Processing payment...",
      nextStep: null,
      bookingData: { 
        ...session, 
        paymentMethod,
        step: 'processing'
      },
      isComplete: false,
      processingPayment: true
    };
  }
  
  async completePaymentProcessing(session: any): Promise<{
    reply: string;
    nextStep: string | null;
    bookingData: any;
    isComplete: boolean;
  }> {
    // Save booking to database
    const bookingResult = await this.saveBookingToDatabase(session, session.paymentMethod);
    
    if (!bookingResult.success) {
      return {
        reply: "Sorry, there was an error processing your booking. Please try again.",
        nextStep: 'payment',
        bookingData: session,
        isComplete: false
      };
    }
    
    const receipt = {
      id: bookingResult.appointmentId,
      amount: session.consultantPrice || '100',
      paymentMethod: session.paymentMethod,
      clientName: session.clientName || 'User',
      consultancyName: session.consultantName,
      appointmentType: session.consultationType || 'Online',
      date: session.date,
      time: session.time
    };
    
    return {
      reply: `🎉 Booking Confirmed & Payment Successful!\n\n📋 Appointment Details:\n• Consultant: ${session.consultantName}\n• Date: ${session.date}\n• Time: ${session.time}\n• Type: ${session.consultationType || 'Online'}\n• Amount: ₹${receipt.amount}\n• Payment: ${session.paymentMethod}\n\n✅ Confirmation email sent!`,
      nextStep: null,
      bookingData: { ...session, receipt, step: 'complete' },
      isComplete: true
    };
  }

  private async saveBookingToDatabase(session: any, paymentMethod: string) {
    try {
      const connectDB = (await import('../lib/mongodb')).default;
      const mongoose = (await import('mongoose')).default;
      
      await connectDB();
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database connection failed');
      
      const appointmentsCollection = db.collection('appointments');
      
      const appointment = {
        clientId: session.userId,
        consultancyId: session.consultant,
        consultancyName: session.consultantName,
        appointmentDate: session.appointmentDate,
        appointmentTime: session.time,
        appointmentType: session.consultationType || 'online',
        status: 'confirmed',
        paymentMethod,
        amount: session.consultantPrice || '100',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await appointmentsCollection.insertOne(appointment);
      
      return {
        success: true,
        appointmentId: result.insertedId.toString()
      };
    } catch (error) {
      console.error('Error saving booking:', error);
      return { success: false };
    }
  }

  private handleInitialBooking(message: string, session: any) {
    return {
      reply: "Let's start booking your consultation. Please provide your preferred date (DD/MM/YYYY):",
      nextStep: 'date',
      bookingData: { ...session, step: 'date' },
      isComplete: false
    };
  }

  saveBookingSession(sessionId: string, data: any) {
    this.bookingSessions.set(sessionId, data);
  }

  clearBookingSession(sessionId: string) {
    this.bookingSessions.delete(sessionId);
  }
}