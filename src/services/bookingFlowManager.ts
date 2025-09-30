import connectDB from '../lib/mongodb';
import mongoose from 'mongoose';

interface BookingSession {
  consultantId: string;
  consultantName: string;
  userId?: string;
  step: 'date_selection' | 'time_selection' | 'type_selection' | 'payment_selection' | 'confirmation' | 'processing' | 'complete';
  selectedDate?: string;
  selectedTime?: string;
  appointmentType?: 'online' | 'offline';
  paymentMethod?: string;
  lastActivity: number;
  receipt?: any;
}

interface BookingResponse {
  reply: string;
  isComplete: boolean;
  bookingData: BookingSession;
  processingPayment?: boolean;
}

export class BookingFlowManager {
  private sessions = new Map<string, BookingSession>();

  async processBookingStep(message: string, sessionId: string, currentSession: BookingSession): Promise<BookingResponse> {
    try {
      const { step } = currentSession;
      
      switch (step) {
        case 'date_selection':
          return await this.handleDateSelection(message, sessionId, currentSession);
        case 'time_selection':
          return await this.handleTimeSelection(message, sessionId, currentSession);
        case 'type_selection':
          return await this.handleTypeSelection(message, sessionId, currentSession);
        case 'payment_selection':
          return await this.handlePaymentSelection(message, sessionId, currentSession);
        case 'confirmation':
          return await this.handleConfirmation(message, sessionId, currentSession);
        case 'processing':
          return await this.handleProcessing(sessionId, currentSession);
        default:
          return this.handleError(currentSession);
      }
    } catch (error: any) {
      console.error('Booking flow error:', error);
      return this.handleError(currentSession);
    }
  }

  private async handleDateSelection(message: string, sessionId: string, session: BookingSession): Promise<BookingResponse> {
    const datePattern = /(\d{1,2})[\\/\-](\d{1,2})[\\/\-](\d{4})/;
    const match = message.match(datePattern);
    
    if (!match) {
      return {
        reply: "Please provide a valid date in DD/MM/YYYY format (e.g., 25/12/2024):",
        isComplete: false,
        bookingData: session
      };
    }
    
    const [, day, month, year] = match;
    const selectedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // Check if date is today or in future
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedDateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    if (selectedDateOnly < todayDateOnly) {
      return {
        reply: "Please select today's date or a future date. What date would you prefer?",
        isComplete: false,
        bookingData: session
      };
    }
    
    // If it's today, check if there's still time for booking (allow if before 11 PM)
    if (selectedDateOnly.getTime() === todayDateOnly.getTime()) {
      const currentHour = today.getHours();
      if (currentHour >= 23) {
        return {
          reply: "It's too late to book for today. Please select tomorrow or a future date:",
          isComplete: false,
          bookingData: session
        };
      }
    }
    
    const consultant = await this.getConsultant(session.consultantId);
    const timeSlots = this.generateTimeSlots(consultant, selectedDate);
    
    // Check if no slots are available
    if (timeSlots.length === 1 && timeSlots[0] === 'No slots available for today') {
      return {
        reply: `Sorry, no time slots are available for ${selectedDate} (too late in the day). Please select tomorrow or a future date:`,
        isComplete: false,
        bookingData: session
      };
    }
    
    const updatedSession = {
      ...session,
      selectedDate,
      step: 'time_selection' as const,
      lastActivity: Date.now()
    };
    
    return {
      reply: `Great! ${selectedDate} is available.\n\n🕐 Available time slots:\n${timeSlots.map((slot, i) => `${i + 1}. ${slot}`).join('\n')}\n\nPlease choose a time slot (1-${timeSlots.length}):`,
      isComplete: false,
      bookingData: updatedSession
    };
  }

  private async handleTimeSelection(message: string, sessionId: string, session: BookingSession): Promise<BookingResponse> {
    const consultant = await this.getConsultant(session.consultantId);
    const timeSlots = this.generateTimeSlots(consultant, session.selectedDate);
    
    const slotNumber = parseInt(message.trim());
    if (slotNumber >= 1 && slotNumber <= timeSlots.length) {
      const selectedTime = timeSlots[slotNumber - 1];
      
      // Check for conflicts
      const hasConflict = await this.checkTimeConflict(session.selectedDate!, selectedTime, session.userId);
      
      if (hasConflict) {
        return {
          reply: `⚠️ You already have an appointment at ${selectedTime} on ${session.selectedDate}.\n\nPlease choose a different time slot:\n${timeSlots.map((slot, i) => `${i + 1}. ${slot}`).join('\n')}`,
          isComplete: false,
          bookingData: session
        };
      }
      
      const updatedSession = {
        ...session,
        selectedTime,
        step: 'type_selection' as const,
        lastActivity: Date.now()
      };
      
      return {
        reply: `Perfect! You've selected ${selectedTime} on ${session.selectedDate}.\n\n📍 **How would you prefer to meet?**\n\n1. 💻 Online consultation (Video call)\n2. 🏢 In-person meeting\n\nPlease choose 1 or 2:`,
        isComplete: false,
        bookingData: updatedSession
      };
    }
    
    return {
      reply: `Please select a valid time slot (1-${timeSlots.length}) or choose from:\n${timeSlots.map((slot, i) => `${i + 1}. ${slot}`).join('\n')}`,
      isComplete: false,
      bookingData: session
    };
  }

  private async handleTypeSelection(message: string, sessionId: string, session: BookingSession): Promise<BookingResponse> {
    const choice = message.trim();
    let appointmentType: 'online' | 'offline';
    let typeText: string;
    
    if (choice === '1' || choice.toLowerCase().includes('online')) {
      appointmentType = 'online';
      typeText = 'Online consultation';
    } else if (choice === '2' || choice.toLowerCase().includes('person')) {
      appointmentType = 'offline';
      typeText = 'In-person meeting';
    } else {
      return {
        reply: "Please choose 1 for Online or 2 for In-person meeting:",
        isComplete: false,
        bookingData: session
      };
    }
    
    const updatedSession = {
      ...session,
      appointmentType,
      step: 'payment_selection' as const,
      lastActivity: Date.now()
    };
    
    return {
      reply: `Great! You've chosen ${typeText}.\n\n💳 **How would you like to pay?**\n\n1. 💳 Credit/Debit Card\n2. 🏦 Bank Transfer\n3. 📱 Digital Wallet (PayPal/UPI)\n\nPlease choose 1, 2, or 3:`,
      isComplete: false,
      bookingData: updatedSession
    };
  }

  private async handlePaymentSelection(message: string, sessionId: string, session: BookingSession): Promise<BookingResponse> {
    const choice = message.trim();
    let paymentMethod: string;
    
    if (choice === '1' || choice.toLowerCase().includes('card')) {
      paymentMethod = 'Credit Card';
    } else if (choice === '2' || choice.toLowerCase().includes('bank')) {
      paymentMethod = 'Bank Transfer';
    } else if (choice === '3' || choice.toLowerCase().includes('wallet')) {
      paymentMethod = 'Digital Wallet';
    } else {
      return {
        reply: "Please choose 1 for Card, 2 for Bank Transfer, or 3 for Digital Wallet:",
        isComplete: false,
        bookingData: session
      };
    }
    
    const consultant = await this.getConsultant(session.consultantId);
    const updatedSession = {
      ...session,
      paymentMethod,
      step: 'confirmation' as const,
      lastActivity: Date.now()
    };
    
    return {
      reply: `Perfect! Here's your booking summary:\n\n👨💼 Consultant: ${session.consultantName}\n📅 Date: ${session.selectedDate}\n🕐 Time: ${session.selectedTime}\n💰 Rate: $${consultant?.price || '100'}/hour\n📍 Type: ${session.appointmentType === 'online' ? 'Online consultation' : 'In-person meeting'}\n💳 Payment: ${paymentMethod}\n\nConfirm booking? (yes/no)`,
      isComplete: false,
      bookingData: updatedSession
    };
  }

  private async handleConfirmation(message: string, sessionId: string, session: BookingSession): Promise<BookingResponse> {
    const response = message.toLowerCase().trim();
    
    if (['yes', 'y', 'confirm', 'ok', 'sure'].includes(response)) {
      const updatedSession = {
        ...session,
        step: 'processing' as const,
        lastActivity: Date.now()
      };
      
      return {
        reply: "🔄 Processing your booking and payment...\n\nPlease wait while I confirm your appointment.",
        isComplete: false,
        bookingData: updatedSession,
        processingPayment: true
      };
    }
    
    if (['no', 'n', 'cancel'].includes(response)) {
      return {
        reply: "Booking cancelled. Would you like to:\n• Choose a different time\n• Select another consultant\n• Start over",
        isComplete: true,
        bookingData: session
      };
    }
    
    return {
      reply: "Please confirm your booking by typing 'yes' or 'no':",
      isComplete: false,
      bookingData: session
    };
  }

  private async handleProcessing(sessionId: string, session: BookingSession): Promise<BookingResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const appointmentId = await this.createAppointment(session);
      const consultant = await this.getConsultant(session.consultantId);
      
      return {
        reply: `✅ Booking Confirmed!\n\nAppointment ID: ${appointmentId}\n👨💼 Consultant: ${session.consultantName}\n📅 Date: ${session.selectedDate}\n🕐 Time: ${session.selectedTime}\n📍 Type: ${session.appointmentType === 'online' ? 'Online consultation' : 'In-person meeting'}\n💳 Payment: ${session.paymentMethod}\n\nYou'll receive a confirmation email shortly.`,
        isComplete: true,
        bookingData: { ...session, step: 'complete' }
      };
    } catch (error: any) {
      return {
        reply: "❌ Booking failed. Please try again or contact support.",
        isComplete: true,
        bookingData: session
      };
    }
  }

  private handleError(session: BookingSession): BookingResponse {
    return {
      reply: "Something went wrong with your booking. Please start over by telling me which consultant you'd like to book with.",
      isComplete: true,
      bookingData: session
    };
  }

  private async getConsultant(consultantId: string): Promise<any> {
    try {
      await connectDB();
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database not connected');
      const consultanciesCollection = db.collection('consultancies');
      return await consultanciesCollection.findOne({ _id: new mongoose.Types.ObjectId(consultantId) });
    } catch (error: any) {
      console.error('Get consultant error:', error);
      return null;
    }
  }

  private generateTimeSlots(consultant: any, selectedDate?: string): string[] {
    const hours = consultant?.availability?.hours || '9:00 AM - 6:00 PM';
    const [startTime, endTime] = hours.split(' - ');
    const slots = [];
    let start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    
    // If booking for today, only show slots after current time + 1 hour buffer
    if (selectedDate) {
      const [day, month, year] = selectedDate.split('/');
      const selectedDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const selectedDateOnly = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate());
      
      if (selectedDateOnly.getTime() === todayDateOnly.getTime()) {
        const currentHour = today.getHours();
        const minAvailableHour = currentHour + 1; // 1 hour buffer
        start = Math.max(start, minAvailableHour);
      }
    }
    
    for (let hour = start; hour < end; hour++) {
      slots.push(this.formatHour(hour));
    }
    return slots.length > 0 ? slots : ['No slots available for today'];
  }

  private parseTime(timeStr: string): number {
    const [time, period] = timeStr.split(' ');
    const [hours] = time.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    return hour24;
  }

  private formatHour(hour: number): string {
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${hour12}:00 ${period}`;
  }

  private async createAppointment(session: BookingSession): Promise<string> {
    try {
      await connectDB();
      
      // Import the Appointment model
      const Appointment = (await import('../models/Appointment')).default;
      
      const [day, month, year] = session.selectedDate!.split('/');
      const appointmentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      console.log('Creating appointment with data:', {
        consultancyId: session.consultantId,
        consultancyName: session.consultantName,
        clientId: session.userId || 'anonymous',
        clientName: 'User',
        clientEmail: 'user@example.com',
        clientPhone: '+1234567890',
        appointmentDate,
        appointmentTime: session.selectedTime,
        appointmentType: session.appointmentType || 'online',
        status: 'pending'
      });
      
      // Get user data from Clerk
      let clientName = 'User';
      let clientEmail = 'user@example.com';
      let clientPhone = '+1234567890';
      
      if (session.userId && session.userId !== 'anonymous') {
        try {
          const { clerkClient } = await import('@clerk/nextjs/server');
          const user = await clerkClient.users.getUser(session.userId);
          clientName = (user as any).fullName || user.firstName || 'User';
          clientEmail = user.emailAddresses[0]?.emailAddress || 'user@example.com';
          clientPhone = user.phoneNumbers[0]?.phoneNumber || '+1234567890';
        } catch (error: any) {
          console.error('Error fetching user data from Clerk:', error);
        }
      }
      
      const appointment = new Appointment({
        consultancyId: session.consultantId,
        consultancyName: session.consultantName,
        clientId: session.userId || 'anonymous',
        clientName,
        clientEmail,
        clientPhone,
        appointmentDate,
        appointmentTime: session.selectedTime,
        appointmentType: session.appointmentType || 'online',
        status: 'pending'
      });
      
      const savedAppointment = await appointment.save();
      console.log('Appointment saved successfully:', savedAppointment._id, savedAppointment);
      return (savedAppointment._id as any).toString();
    } catch (error: any) {
      console.error('Create appointment error:', error);
      console.error('Error details:', error?.message);
      throw error;
    }
  }

  async completePaymentProcessing(session: BookingSession): Promise<{ reply: string; bookingData: BookingSession }> {
    try {
      const appointmentId = await this.createAppointment(session);
      const consultant = await this.getConsultant(session.consultantId);
      
      // Generate receipt
      const receipt = {
        id: `CB-${appointmentId.slice(-8).toUpperCase()}`,
        clientName: 'User',
        consultancyName: session.consultantName,
        date: session.selectedDate,
        time: session.selectedTime,
        appointmentType: session.appointmentType || 'online',
        amount: consultant?.price || '100',
        paymentMethod: session.paymentMethod || 'Credit Card'
      };
      
      return {
        reply: `✅ Payment Successful!\n\nBooking Submitted!\nAppointment ID: ${appointmentId}\n👨💼 Consultant: ${session.consultantName}\n📅 Date: ${session.selectedDate}\n🕐 Time: ${session.selectedTime}\n📍 Type: ${session.appointmentType === 'online' ? 'Online consultation' : 'In-person meeting'}\n💳 Payment: ${session.paymentMethod}\n\n⏳ Status: Pending consultant approval\nYou'll receive a confirmation email once approved.`,
        bookingData: { ...session, step: 'complete', receipt }
      };
    } catch (error: any) {
      return {
        reply: "❌ Payment failed. Please try booking again.",
        bookingData: session
      };
    }
  }

  private async checkTimeConflict(date: string, time: string, userId?: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      await connectDB();
      const Appointment = (await import('../models/Appointment')).default;
      
      // Convert date format
      const [day, month, year] = date.split('/');
      const appointmentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      const existingAppointment = await Appointment.findOne({
        clientId: userId,
        appointmentDate: {
          $gte: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate()),
          $lt: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate() + 1)
        },
        appointmentTime: time,
        status: { $in: ['pending', 'confirmed'] }
      });
      
      return !!existingAppointment;
    } catch (error: any) {
      console.error('Conflict check error:', error);
      return false;
    }
  }
}