import { SmartBookingOrchestrator } from './smartBookingOrchestrator';
import { BookingValidator } from './bookingValidator';

export class BookingFlowManager {
  private bookingOrchestrator: SmartBookingOrchestrator;
  private bookingValidator: BookingValidator;

  constructor() {
    this.bookingOrchestrator = new SmartBookingOrchestrator();
    this.bookingValidator = new BookingValidator();
  }

  // Main booking flow processor
  async processBookingFlow(
    message: string,
    currentState: string,
    bookingContext: any,
    consultancies: any[] = []
  ): Promise<{
    response: string;
    nextState: string;
    bookingData: any;
    needsInput: boolean;
    options?: any;
  }> {
    
    switch (currentState) {
      case 'initial':
        return await this.handleInitialBooking(message, consultancies);
      
      case 'booking_consultancy_selection':
        return await this.handleConsultancySelection(message, bookingContext);
      
      case 'booking_date_selection':
        return await this.handleDateSelection(message, bookingContext);
      
      case 'booking_time_selection':
        return await this.handleTimeSelection(message, bookingContext);
      
      case 'booking_type_selection':
        return await this.handleTypeSelection(message, bookingContext);
      
      case 'booking_confirmation':
        return await this.handleBookingConfirmation(message, bookingContext);
      
      case 'booking_payment_method':
        return await this.handlePaymentMethod(message, bookingContext);
      
      case 'booking_processing':
        return await this.handlePaymentProcessing(bookingContext);
      
      default:
        return await this.handleInitialBooking(message, consultancies);
    }
  }

  // Handle initial booking detection
  private async handleInitialBooking(message: string, consultancies: any[]): Promise<any> {
    const bookingIntent = await this.bookingOrchestrator.detectBookingIntent(message, consultancies);
    
    if (!bookingIntent.isBooking) {
      return {
        response: "I didn't detect a booking request. Could you please clarify what you'd like to book?",
        nextState: 'initial',
        bookingData: {},
        needsInput: true
      };
    }

    // If consultancy already identified
    if (bookingIntent.consultancy) {
      const availabilityData = await this.bookingValidator.getAvailableSlots(bookingIntent.consultancy._id);
      
      return {
        response: `Great! I'll help you book an appointment with **${bookingIntent.consultancy.name}**.\n\nLet's start with your preferred date. Here are the available dates:\n\n${this.formatAvailableDates(availabilityData.availableDates)}`,
        nextState: 'booking_date_selection',
        bookingData: {
          consultancy: bookingIntent.consultancy,
          availabilityData
        },
        needsInput: true,
        options: {
          type: 'date_picker',
          availableDates: availabilityData.availableDates
        }
      };
    }

    // If from consultancy suggestions, ask for selection
    if (consultancies.length > 0) {
      return {
        response: "Which consultancy would you like to book an appointment with?\n\n" + 
                 consultancies.map((c, i) => `${i + 1}. **${c.name}** - ${c.category}`).join('\n'),
        nextState: 'booking_consultancy_selection',
        bookingData: { availableConsultancies: consultancies },
        needsInput: true,
        options: {
          type: 'consultancy_selection',
          consultancies
        }
      };
    }

    return {
      response: "I'd be happy to help you book an appointment! Could you please specify which consultancy you'd like to book with?",
      nextState: 'booking_consultancy_selection',
      bookingData: {},
      needsInput: true
    };
  }

  // Handle consultancy selection
  private async handleConsultancySelection(message: string, bookingContext: any): Promise<any> {
    const { availableConsultancies } = bookingContext;
    
    // Try to match selection
    let selectedConsultancy = null;
    
    // Check for number selection
    const numberMatch = message.match(/(\d+)/);
    if (numberMatch && availableConsultancies) {
      const index = parseInt(numberMatch[1]) - 1;
      if (index >= 0 && index < availableConsultancies.length) {
        selectedConsultancy = availableConsultancies[index];
      }
    }
    
    // Try fuzzy matching directly
    if (!selectedConsultancy) {
      selectedConsultancy = await this.fuzzyMatchConsultancyDirect(message);
    }

    if (!selectedConsultancy) {
      return {
        response: "I couldn't identify the consultancy. Please select by number or specify the name clearly.",
        nextState: 'booking_consultancy_selection',
        bookingData: bookingContext,
        needsInput: true
      };
    }

    const availabilityData = await this.bookingValidator.getAvailableSlots(selectedConsultancy._id);
    
    return {
      response: `Perfect! I'll help you book with **${selectedConsultancy.name}**.\n\nPlease select your preferred date:\n\n${this.formatAvailableDates(availabilityData.availableDates)}`,
      nextState: 'booking_date_selection',
      bookingData: {
        consultancy: selectedConsultancy,
        availabilityData
      },
      needsInput: true,
      options: {
        type: 'date_picker',
        availableDates: availabilityData.availableDates
      }
    };
  }

  // Handle date selection
  private async handleDateSelection(message: string, bookingContext: any): Promise<any> {
    const { consultancy, availabilityData } = bookingContext;
    
    // Extract date from message
    const selectedDate = this.extractDate(message, availabilityData.availableDates);
    
    if (!selectedDate) {
      return {
        response: "Please select a valid date from the available options:\n\n" + 
                 this.formatAvailableDates(availabilityData.availableDates),
        nextState: 'booking_date_selection',
        bookingData: bookingContext,
        needsInput: true
      };
    }

    const availableSlots = availabilityData.availableSlots[selectedDate] || [];
    
    return {
      response: `Great! You selected **${this.formatDate(selectedDate)}**.\n\nNow please choose your preferred time:\n\n${this.formatTimeSlots(availableSlots)}`,
      nextState: 'booking_time_selection',
      bookingData: {
        ...bookingContext,
        selectedDate,
        availableSlots
      },
      needsInput: true,
      options: {
        type: 'time_picker',
        availableSlots
      }
    };
  }

  // Handle time selection
  private async handleTimeSelection(message: string, bookingContext: any): Promise<any> {
    const { consultancy, selectedDate, availableSlots } = bookingContext;
    
    const selectedTime = this.extractTime(message, availableSlots);
    
    if (!selectedTime) {
      return {
        response: "Please select a valid time from the available slots:\n\n" + 
                 this.formatTimeSlots(availableSlots),
        nextState: 'booking_time_selection',
        bookingData: bookingContext,
        needsInput: true
      };
    }

    return {
      response: `Perfect! You selected **${selectedTime}** on **${this.formatDate(selectedDate)}**.\n\nWould you prefer an **online** or **offline** consultation?`,
      nextState: 'booking_type_selection',
      bookingData: {
        ...bookingContext,
        selectedTime
      },
      needsInput: true,
      options: {
        type: 'consultation_type',
        options: ['online', 'offline']
      }
    };
  }

  // Handle consultation type selection
  private async handleTypeSelection(message: string, bookingContext: any): Promise<any> {
    const consultationType = message.toLowerCase().includes('offline') ? 'offline' : 'online';
    
    const { consultancy, selectedDate, selectedTime } = bookingContext;
    
    return {
      response: `Excellent! Here's your booking summary:\n\n` +
               `**Consultancy:** ${consultancy.name}\n` +
               `**Date:** ${this.formatDate(selectedDate)}\n` +
               `**Time:** ${selectedTime}\n` +
               `**Type:** ${consultationType.charAt(0).toUpperCase() + consultationType.slice(1)}\n` +
               `**Duration:** 1 hour\n` +
               `**Fee:** ₹${consultancy.price || 1500}\n\n` +
               `Please confirm to proceed with the booking.`,
      nextState: 'booking_confirmation',
      bookingData: {
        ...bookingContext,
        consultationType,
        fee: consultancy.price || 1500
      },
      needsInput: true,
      options: {
        type: 'confirmation',
        options: ['confirm', 'cancel']
      }
    };
  }

  // Handle booking confirmation
  private async handleBookingConfirmation(message: string, bookingContext: any): Promise<any> {
    const isConfirmed = message.toLowerCase().includes('confirm') || message.toLowerCase().includes('yes');
    
    if (!isConfirmed) {
      return {
        response: "Booking cancelled. Is there anything else I can help you with?",
        nextState: 'completed',
        bookingData: {},
        needsInput: false
      };
    }

    return {
      response: `Great! Your booking is confirmed. Now let's proceed with payment.\n\nPlease select your preferred payment method:\n\n1. **Credit/Debit Card**\n2. **UPI**\n3. **Net Banking**\n4. **Wallet**`,
      nextState: 'booking_payment_method',
      bookingData: bookingContext,
      needsInput: true,
      options: {
        type: 'payment_method',
        options: ['card', 'upi', 'netbanking', 'wallet']
      }
    };
  }

  // Handle payment method selection
  private async handlePaymentMethod(message: string, bookingContext: any): Promise<any> {
    const paymentMethods = {
      '1': 'Credit/Debit Card',
      '2': 'UPI',
      '3': 'Net Banking',
      '4': 'Wallet',
      'card': 'Credit/Debit Card',
      'upi': 'UPI',
      'netbanking': 'Net Banking',
      'wallet': 'Wallet'
    };

    const selectedMethod = (paymentMethods as any)[message.toLowerCase()] || (paymentMethods as any)[message.trim()];
    
    if (!selectedMethod) {
      return {
        response: "Please select a valid payment method:\n\n1. Credit/Debit Card\n2. UPI\n3. Net Banking\n4. Wallet",
        nextState: 'booking_payment_method',
        bookingData: bookingContext,
        needsInput: true
      };
    }

    return {
      response: `Processing payment via **${selectedMethod}**...\n\nPlease wait while we validate your payment details.`,
      nextState: 'booking_processing',
      bookingData: {
        ...bookingContext,
        paymentMethod: selectedMethod
      },
      needsInput: false
    };
  }

  // Handle payment processing (dummy)
  private async handlePaymentProcessing(bookingContext: any): Promise<any> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      const receiptId = `CB${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      return {
        response: `🎉 **Payment Successful!**\n\nYour appointment has been booked successfully.`,
        nextState: 'booking_completed',
        bookingData: {
          ...bookingContext,
          receiptId,
          status: 'confirmed',
          paymentStatus: 'completed'
        },
        needsInput: false,
        options: {
          type: 'booking_receipt',
          receiptData: {
            id: receiptId,
            consultancyName: bookingContext.consultancy.name,
            date: bookingContext.selectedDate,
            time: bookingContext.selectedTime,
            type: bookingContext.consultationType,
            amount: bookingContext.fee,
            paymentMethod: bookingContext.paymentMethod,
            status: 'Confirmed'
          }
        }
      };
    } else {
      return {
        response: `❌ **Payment Failed**\n\nThere was an issue processing your payment. Please try again or contact support.`,
        nextState: 'booking_payment_method',
        bookingData: bookingContext,
        needsInput: true
      };
    }
  }

  // Direct fuzzy matching for consultancy names
  private async fuzzyMatchConsultancyDirect(name: string): Promise<any | null> {
    try {
      console.log('🔍 Direct fuzzy matching for:', name);
      const response = await fetch('/api/consultancies');
      const data = await response.json();
      const consultancies = data.consultancies || [];
      console.log('📊 Found consultancies:', consultancies.length, consultancies.map((c: any) => c.name));

      // First try exact match (case insensitive)
      for (const consultancy of consultancies) {
        if (consultancy.name.toLowerCase() === name.toLowerCase()) {
          console.log('✅ Exact match found:', consultancy.name);
          return consultancy;
        }
      }

      // Then try partial match and typo tolerance
      for (const consultancy of consultancies) {
        const consultancyLower = consultancy.name.toLowerCase();
        const nameLower = name.toLowerCase();
        
        // Partial match
        if (consultancyLower.includes(nameLower) || nameLower.includes(consultancyLower)) {
          console.log('✅ Partial match found:', consultancy.name);
          return consultancy;
        }
        
        // Handle common typos (double letters)
        const nameWithoutDoubles = nameLower.replace(/(.)\1+/g, '$1');
        const consultancyWithoutDoubles = consultancyLower.replace(/(.)\1+/g, '$1');
        
        if (nameWithoutDoubles === consultancyWithoutDoubles) {
          console.log('✅ Typo match found:', consultancy.name);
          return consultancy;
        }
      }

      // Finally try fuzzy matching
      let bestMatch = null;
      let bestScore = 0;
      const normalizedInput = this.normalizeConsultancyName(name.toLowerCase());
      console.log('🔄 Normalized input:', normalizedInput);

      for (const consultancy of consultancies) {
        const normalizedConsultancy = this.normalizeConsultancyName(consultancy.name.toLowerCase());
        const score = this.calculateSimilarity(normalizedInput, normalizedConsultancy);
        
        console.log(`🔍 Comparing "${normalizedInput}" vs "${normalizedConsultancy}" (${consultancy.name}): ${score.toFixed(3)}`);
        
        if (score > bestScore && score > 0.3) {
          bestScore = score;
          bestMatch = consultancy;
          console.log(`✅ New best match: ${consultancy.name} (${score.toFixed(3)})`);
        }
      }

      console.log('🏆 Final result:', bestMatch ? `${bestMatch.name} (${bestScore.toFixed(3)})` : 'No match');
      return bestMatch;
    } catch (error) {
      console.error('Error fuzzy matching consultancy:', error);
      return null;
    }
  }

  private normalizeConsultancyName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '') // Remove spaces
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .replace(/(consultancy|consultant|consulting|llp|ltd|pvt|private|limited)$/i, ''); // Remove common suffixes
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Utility methods
  private formatAvailableDates(dates: string[]): string {
    return dates.slice(0, 7).map((date, i) => 
      `${i + 1}. **${this.formatDate(date)}**`
    ).join('\n');
  }

  private formatTimeSlots(slots: string[]): string {
    return slots.map((slot, i) => 
      `${i + 1}. **${this.formatTime(slot)}**`
    ).join('\n');
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  private formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  private extractDate(message: string, availableDates: string[]): string | null {
    console.log('🗓️ Extracting date from:', message, 'Available:', availableDates);
    
    // Try number selection first
    const numberMatch = message.match(/(\d+)/);
    if (numberMatch) {
      const index = parseInt(numberMatch[1]) - 1;
      if (index >= 0 && index < availableDates.length) {
        console.log('✅ Number match found:', availableDates[index]);
        return availableDates[index];
      }
    }

    // Try various date formats
    const lowerMessage = message.toLowerCase();
    for (const date of availableDates) {
      const formattedDate = this.formatDate(date).toLowerCase();
      const shortDate = date.split('T')[0]; // YYYY-MM-DD format
      
      if (lowerMessage.includes(formattedDate) || 
          lowerMessage.includes(date) ||
          lowerMessage.includes(shortDate) ||
          message.includes(date.split('T')[0])) {
        console.log('✅ Date match found:', date);
        return date;
      }
    }

    console.log('❌ No date match found');
    return null;
  }

  private extractTime(message: string, availableSlots: string[]): string | null {
    // Try number selection first
    const numberMatch = message.match(/(\d+)/);
    if (numberMatch) {
      const index = parseInt(numberMatch[1]) - 1;
      if (index >= 0 && index < availableSlots.length) {
        return availableSlots[index];
      }
    }

    // Try time matching
    for (const slot of availableSlots) {
      const formattedTime = this.formatTime(slot).toLowerCase();
      if (message.toLowerCase().includes(formattedTime) || 
          message.toLowerCase().includes(slot)) {
        return slot;
      }
    }

    return null;
  }
}