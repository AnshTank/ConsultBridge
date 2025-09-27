import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '../lib/mongodb';
import Consultancy from '../models/Consultancy';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

interface ChatResponse {
  reply: string;
  consultancies: any[];
  actionType: 'greeting' | 'search' | 'book' | 'info' | 'view_bookings' | 'signin_help';
  needsBooking: boolean;
  bookingData?: any;
  bookings?: any[];
  requiresAuth?: boolean;
  authMessage?: string;
}

export class SmartChatbot {
  private sessionContexts = new Map<string, any>();

  async processMessage(message: string, userId?: string, sessionId?: string): Promise<ChatResponse> {
    try {
      // Clear any previous context for this session to avoid bleeding
      if (sessionId) {
        this.sessionContexts.delete(sessionId);
      }
      
      // Step 1: Analyze intent with AI
      const intent = await this.analyzeIntent(message);
      
      // Step 2: Handle based on intent
      switch (intent.type) {
        case 'greeting':
          return this.handleGreeting();
        case 'career_help':
          return await this.handleCareerHelp(intent);
        case 'search':
          return await this.handleSearch(intent);
        case 'view_bookings':
          return await this.handleViewBookings(userId);
        case 'signin_help':
          return this.handleSignInHelp();
        case 'booking':
          return await this.handleBooking(intent, message, userId, sessionId);
        default:
          return await this.handleSearch(intent);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        reply: "I'm having trouble understanding. Could you rephrase your request?",
        consultancies: [],
        actionType: 'info',
        needsBooking: false
      };
    }
  }

  private async analyzeIntent(message: string) {
    const lowerMsg = message.toLowerCase();
    
    // Quick pattern matching first
    if (this.isGreeting(lowerMsg)) {
      return { type: 'greeting', category: null, details: null };
    }
    
    if (this.isCareerHelp(lowerMsg)) {
      return { type: 'career_help', category: 'career', details: this.extractCareerDetails(lowerMsg) };
    }
    
    if (this.isViewBookingsRequest(lowerMsg)) {
      return { type: 'view_bookings', category: null, details: null };
    }
    
    if (this.isSignInHelp(lowerMsg)) {
      return { type: 'signin_help', category: null, details: null };
    }
    
    if (this.isBookingRequest(lowerMsg)) {
      return { type: 'booking', category: null, details: this.extractBookingDetails(lowerMsg) };
    }
    
    // Use AI for complex intent analysis
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Analyze this user message and return JSON:
        
Message: "${message}"

Return:
{
  "type": "search|career_help|booking|view_bookings|signin_help|info",
  "category": "legal|business|finance|technology|healthcare|career|null",
  "confidence": 0.0-1.0,
  "keywords": ["key", "words"]
}

Rules:
- If mentions "show/view/my bookings" -> type: "view_bookings"
- If says "ya please help", "yes help", "help me sign in" -> type: "signin_help"
- If mentions job, interview, career, employment -> type: "career_help", category: "career"
- If mentions book, appointment, schedule (but NOT show/view) -> type: "booking"
- If asks for consultants in specific field -> type: "search"
- Return only valid JSON`;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text().replace(/```json\n?|```\n?/g, '').trim();
        return JSON.parse(aiResponse);
      } catch (error) {
        console.error('AI analysis failed:', error);
      }
    }
    
    // Fallback to category detection
    const category = this.detectCategory(lowerMsg);
    return { type: 'search', category, details: null };
  }

  private isGreeting(msg: string): boolean {
    return /^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings)/.test(msg);
  }

  private isCareerHelp(msg: string): boolean {
    const careerKeywords = ['interview', 'job', 'career', 'employment', 'failed', 'rejected', 'job search'];
    return careerKeywords.some(keyword => msg.includes(keyword));
  }

  private isBookingRequest(msg: string): boolean {
    // Don't treat "show/view bookings" as booking requests
    if (/\b(show|view|display|see|check|my)\s+(booking|appointment)s?\b/.test(msg)) {
      return false;
    }
    return /\b(book|schedule|appointment|available|when can)\b/.test(msg);
  }

  private isViewBookingsRequest(msg: string): boolean {
    return /\b(show|view|display|see|check|my)\s+(booking|appointment)s?\b/.test(msg);
  }

  private isSignInHelp(msg: string): boolean {
    const signInKeywords = ['ya please help', 'yes please help', 'help me sign in', 'help with sign in', 'yes help', 'ya help'];
    return signInKeywords.some(keyword => msg.includes(keyword));
  }

  private extractCareerDetails(msg: string) {
    const details: any = {};
    if (msg.includes('interview')) details.issue = 'interview';
    if (msg.includes('failed') || msg.includes('rejected')) details.status = 'failed';
    if (/\d+\s*months?/.test(msg)) {
      const match = msg.match(/(\d+)\s*months?/);
      if (match) details.duration = match[1] + ' months';
    }
    return details;
  }

  private extractBookingDetails(msg: string) {
    const details: any = {};
    // Extract consultant name
    const consultantMatch = msg.match(/book\s+(.+?)(?:\s|$)/i);
    if (consultantMatch) details.consultant = consultantMatch[1];
    return details;
  }

  private detectCategory(msg: string): string | null {
    const categories = {
      legal: ['legal', 'law', 'lawyer', 'attorney', 'court', 'contract'],
      business: ['business', 'startup', 'strategy', 'management', 'company'],
      finance: ['finance', 'financial', 'money', 'investment', 'tax', 'accounting'],
      technology: ['tech', 'software', 'app', 'website', 'development', 'coding'],
      healthcare: ['health', 'medical', 'doctor', 'wellness', 'therapy'],
      career: ['career', 'job', 'employment', 'interview', 'resume', 'work']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => msg.includes(keyword))) {
        return category;
      }
    }
    return null;
  }

  private handleGreeting(): ChatResponse {
    return {
      reply: "Hello! I'm Shaan, your AI consultant finder. I help connect you with verified experts across Legal, Business, Finance, Technology, Healthcare, and Career fields. What can I help you with today?",
      consultancies: [],
      actionType: 'greeting',
      needsBooking: false
    };
  }

  private async handleCareerHelp(intent: any): Promise<ChatResponse> {
    const { details } = intent;
    
    let reply = "I understand you're facing career challenges. ";
    
    if (details?.issue === 'interview' && details?.status === 'failed') {
      reply += "Interview setbacks are tough, but they're learning opportunities! ";
    }
    
    reply += "Let me connect you with career consultants who can provide personalized guidance.";
    
    // Search for career consultants
    const consultancies = await this.searchConsultancies('career');
    
    if (consultancies.length > 0) {
      const displayCount = Math.min(consultancies.length, 3);
      reply += `\n\nI found ${displayCount} career experts who can help:`;
      return {
        reply,
        consultancies: consultancies.slice(0, 3),
        actionType: 'search',
        needsBooking: false
      };
    } else {
      return {
        reply: "I understand you're facing career challenges. Let me search for career consultants in our database. One moment please...",
        consultancies: [],
        actionType: 'search',
        needsBooking: false
      };
    }
  }

  private async handleSearch(intent: any): Promise<ChatResponse> {
    const { category } = intent;
    
    if (!category) {
      // If no specific category, search all consultancies
      const consultancies = await this.searchConsultancies('');
      if (consultancies.length > 0) {
        const displayCount = Math.min(consultancies.length, 3);
        return {
          reply: `I found ${displayCount} verified consultants for you:`,
          consultancies: consultancies.slice(0, 3),
          actionType: 'search',
          needsBooking: false
        };
      }
      return {
        reply: "I'd love to help you find the right consultant! Could you tell me what type of expertise you need? (Legal, Business, Finance, Technology, Healthcare, or Career)",
        consultancies: [],
        actionType: 'info',
        needsBooking: false
      };
    }
    
    const consultancies = await this.searchConsultancies(category);
    
    if (consultancies.length > 0) {
      const categoryName = category || 'expert';
      const displayCount = Math.min(consultancies.length, 3);
      const reply = `Great! I found ${displayCount} ${categoryName} consultants for you:`;
      return {
        reply,
        consultancies: consultancies.slice(0, 3),
        actionType: 'search',
        needsBooking: false
      };
    } else {
      return {
        reply: `I'm searching for consultants in our database. Let me check our verified experts for you...`,
        consultancies: [],
        actionType: 'search',
        needsBooking: false
      };
    }
  }

  private async handleBooking(intent: any, message: string, userId?: string, sessionId?: string): Promise<ChatResponse> {
    const { details } = intent;
    
    if (!details?.consultant) {
      return {
        reply: "I'd be happy to help you book an appointment! Which consultant would you like to book with?",
        consultancies: [],
        actionType: 'book',
        needsBooking: true
      };
    }
    
    // Find the consultant
    const consultant = await this.findConsultantByName(details.consultant);
    
    if (!consultant) {
      return {
        reply: `I couldn't find a consultant named "${details.consultant}". Could you check the spelling or choose from the list above?`,
        consultancies: [],
        actionType: 'book',
        needsBooking: true
      };
    }
    
    // Get actual availability from consultant data
    const availableDays = this.getAvailableDays(consultant);
    const availableHours = consultant.availability?.hours || '9:00 AM - 6:00 PM';
    
    return {
      reply: `Perfect! I'll help you book with ${consultant.name}.\n\n📅 **Available Days:** ${availableDays}\n🕐 **Available Hours:** ${availableHours}\n💰 **Rate:** ₹${consultant.price || consultant.pricing?.hourlyRate || 'Contact for pricing'}/hour\n\nPlease provide your preferred date (format: DD/MM/YYYY):`,
      consultancies: [],
      actionType: 'book',
      needsBooking: true,
      bookingData: { 
        consultant: consultant._id, 
        consultantName: consultant.name, 
        consultantPrice: consultant.price || consultant.pricing?.hourlyRate || '100',
        userId: userId,
        step: 'date',
        availableDays: consultant.availability?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    };
  }

  private async searchConsultancies(category: string): Promise<any[]> {
    try {
      await connectDB();
      
      const categoryMap: { [key: string]: string[] } = {
        career: ['Career Consultation', 'Career', 'HR'],
        business: ['Business Strategy', 'Business'],
        legal: ['Legal Advisory', 'Legal'],
        finance: ['Financial Services', 'Finance'],
        technology: ['Technology', 'Tech'],
        healthcare: ['Health & Wellness', 'Healthcare']
      };
      
      const searchTerms = categoryMap[category] || [category];
      
      let consultancies = await Consultancy.find({
        status: 'verified',
        category: { $in: searchTerms.map(term => new RegExp(term, 'i')) }
      })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(5)
      .lean();
      
      // If no results, try broader search
      if (consultancies.length === 0) {
        consultancies = await Consultancy.find({
          status: 'verified'
        })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(3)
        .lean();
      }
      
      return consultancies;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  private handleSignInHelp(): ChatResponse {
    return {
      reply: "I'll help you sign in! Click the button below to access your account and view your bookings.",
      consultancies: [],
      actionType: 'signin_help',
      needsBooking: false,
      requiresAuth: true,
      authMessage: "Click to sign in and access your bookings"
    };
  }

  private async handleViewBookings(userId?: string): Promise<ChatResponse> {
    if (!userId) {
      return {
        reply: "To view your bookings, please sign in first. I can help you with that!",
        consultancies: [],
        actionType: 'view_bookings',
        needsBooking: false,
        requiresAuth: true,
        authMessage: "Sign in required to view your bookings"
      };
    }

    try {
      // Get user bookings from database
      const bookings = await this.getUserBookings(userId);
      
      if (bookings.length === 0) {
        return {
          reply: "You don't have any active bookings.\n\nWould you like me to help you find a consultant and book a new appointment?",
          consultancies: [],
          actionType: 'view_bookings',
          needsBooking: false,
          bookings: []
        };
      }

      let reply = `📅 Your Active Bookings (${bookings.length}):\n\n`;
      bookings.forEach((booking, i) => {
        const statusIcon = booking.status === 'Confirmed' ? '✅' : '⏳';
        reply += `${i + 1}. ${booking.consultancyName}\n`;
        reply += `   📅 ${booking.date} at ${booking.time}\n`;
        reply += `   📍 ${booking.type} consultation\n`;
        reply += `   ${statusIcon} ${booking.status}\n\n`;
      });

      return {
        reply,
        consultancies: [],
        actionType: 'view_bookings',
        needsBooking: false,
        bookings
      };
    } catch (error) {
      console.error('View bookings error:', error);
      return {
        reply: "I'm having trouble retrieving your bookings. Please try again.",
        consultancies: [],
        actionType: 'info',
        needsBooking: false
      };
    }
  }

  private async getUserBookings(userId: string): Promise<any[]> {
    try {
      await connectDB();
      
      // Update expired appointments first
      const { AppointmentStatusUpdater } = await import('./appointmentStatusUpdater');
      await AppointmentStatusUpdater.updateExpiredAppointments();
      
      // Use direct MongoDB collection access
      const mongoose = (await import('mongoose')).default;
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }
      
      const appointmentsCollection = db.collection('appointments');
      const consultanciesCollection = db.collection('consultancies');
      const now = new Date();
      
      // Fetch recent 3 appointments that are confirmed or pending and not expired
      const appointments = await appointmentsCollection.find({
        clientId: userId,
        status: { $in: ['confirmed', 'pending'] },
        appointmentDate: { $gte: now }
      })
      .sort({ appointmentDate: 1 })
      .limit(3)
      .toArray();
      
      const totalCount = await appointmentsCollection.countDocuments({
        clientId: userId,
        status: { $in: ['confirmed', 'pending'] },
        appointmentDate: { $gte: now }
      });
      
      // Format appointments for display with consultancy names
      const formattedAppointments = [];
      for (const apt of appointments) {
        let consultancyName = apt.consultancyName || 'Unknown Consultancy';
        
        // If consultancyName not stored, fetch from consultancies collection
        if (!consultancyName && apt.consultancyId) {
          try {
            const consultancy = await consultanciesCollection.findOne({
              _id: new mongoose.Types.ObjectId(apt.consultancyId)
            });
            consultancyName = consultancy?.name || 'Unknown Consultancy';
          } catch (err) {
            console.log('Error fetching consultancy name:', err);
          }
        }
        
        formattedAppointments.push({
          id: apt._id,
          consultancyName,
          date: new Date(apt.appointmentDate).toLocaleDateString('en-GB'),
          time: apt.appointmentTime,
          type: apt.appointmentType || 'Online',
          status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
        });
      }
      
      return formattedAppointments;
      
    } catch (error) {
      console.error('Get user bookings error:', error);
      return [];
    }
  }

  private getAvailableDays(consultant: any): string {
    if (!consultant.availability?.days || consultant.availability.days.length === 0) {
      return 'Monday to Friday';
    }
    
    const days = consultant.availability.days;
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Sort days according to week order
    const sortedDays = days.sort((a: string, b: string) => {
      return dayOrder.indexOf(a) - dayOrder.indexOf(b);
    });
    
    if (sortedDays.length <= 2) {
      return sortedDays.join(' and ');
    } else if (sortedDays.length === dayOrder.length) {
      return 'All days';
    } else {
      return sortedDays.slice(0, -1).join(', ') + ' and ' + sortedDays[sortedDays.length - 1];
    }
  }

  private async findConsultantByName(name: string): Promise<any> {
    try {
      await connectDB();
      
      const consultant = await Consultancy.findOne({
        name: { $regex: name, $options: 'i' },
        status: 'verified'
      }).lean();
      
      return consultant;
    } catch (error) {
      console.error('Find consultant error:', error);
      return null;
    }
  }
}