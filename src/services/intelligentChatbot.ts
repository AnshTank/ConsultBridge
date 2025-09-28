import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '../lib/mongodb';
import mongoose from 'mongoose';

// Try multiple API key environment variables
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.AI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Debug API key
if (API_KEY) {
  console.log('AI API Key found:', API_KEY.substring(0, 10) + '...');
  console.log('Using gemini-2.5-flash model for AI responses');
} else {
  console.log('AI API Key not found. Checked: GEMINI_API_KEY, GOOGLE_AI_API_KEY, AI_API_KEY');
}

interface ChatResponse {
  reply: string;
  consultancies: any[];
  actionType: 'greeting' | 'search' | 'book' | 'info' | 'view_bookings' | 'signin_help';
  needsBooking: boolean;
  bookingData?: any;
  requiresAuth?: boolean;
}

export class IntelligentChatbot {
  private sessionMemory = new Map<string, any>();

  async processMessage(message: string, userId?: string, sessionId?: string): Promise<ChatResponse> {
    try {
      // Get session context
      const context = this.getSessionContext(sessionId);
      
      // Step 1: Intent Recognition
      const intent = await this.recognizeIntent(message, context);
      
      // Log intent decision for debugging
      console.log(`🧠 Intent detected: ${intent.type} (confidence: ${intent.confidence})`);
      if (intent.type === 'personal_counseling') {
        console.log('🤖 Using AI for empathetic response');
      } else {
        console.log('⚙️ Using structured business logic');
      }
      
      // Step 2: Process based on intent
      switch (intent.type) {
        case 'greeting':
          return this.handleGreeting();
        case 'search_consultancy':
          return await this.handleConsultancySearch(intent);
        case 'book_appointment':
          // Clear personal counseling context if switching from personal to business
          if (intent.clearPersonalContext && sessionId) {
            this.sessionMemory.delete(sessionId);
          }
          return await this.initiateBooking(intent, userId, sessionId);
        case 'view_bookings':
          return await this.handleViewBookings(userId);
        case 'signin_help':
          return this.handleSignInHelp();
        case 'personal_counseling':
          return await this.handlePersonalCounseling(message, intent, sessionId);
        case 'search_consultancy':
          // Clear personal counseling context if switching from personal to business
          if (intent.clearPersonalContext && sessionId) {
            this.sessionMemory.delete(sessionId);
          }
          return await this.handleConsultancySearch(intent);
        case 'general_query':
          return await this.handleGeneralQuery(message, intent);
        default:
          return await this.handleFallback(message);
      }
    } catch (error) {
      console.error('Chatbot processing error:', error);
      return this.handleError();
    }
  }

  private async recognizeIntent(message: string, context: any) {
    const lowerMsg = message.toLowerCase().trim();
    
    // Check for business/booking intent first (higher priority than personal counseling)
    if (this.isBookingRequest(lowerMsg) || this.isBusinessRequest(lowerMsg)) {
      // Clear personal counseling context when switching to business
      return { 
        type: this.isBookingRequest(lowerMsg) ? 'book_appointment' : 'search_consultancy',
        confidence: 0.9,
        consultantName: this.extractConsultantName(lowerMsg),
        category: this.detectCategory(lowerMsg),
        clearPersonalContext: true
      };
    }
    
    // Check if we're in an ongoing personal counseling conversation
    if (context.inPersonalCounseling || this.isPersonalProblem(lowerMsg)) {
      return { 
        type: 'personal_counseling', 
        confidence: 0.9,
        originalMessage: message,
        context: context
      };
    }
    
    // Quick pattern matching for common intents
    if (this.isGreeting(lowerMsg)) {
      return { type: 'greeting', confidence: 0.9 };
    }
    
    if (this.isBookingRequest(lowerMsg)) {
      return { 
        type: 'book_appointment', 
        confidence: 0.8,
        consultantName: this.extractConsultantName(lowerMsg),
        dateProvided: /\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(lowerMsg)
      };
    }
    
    if (this.isViewBookingsRequest(lowerMsg)) {
      return { type: 'view_bookings', confidence: 0.9 };
    }
    
    if (this.isSignInRequest(lowerMsg)) {
      return { type: 'signin_help', confidence: 0.9 };
    }
    
    // Use AI for complex intent recognition
    if (genAI) {
      try {
        const aiIntent = await this.getAIIntent(message, context);
        if (aiIntent && aiIntent.confidence > 0.7) {
          return aiIntent;
        }
      } catch (error: any) {
        console.log('AI service temporarily unavailable, using fallback logic');
        // Continue with fallback logic instead of failing
      }
    }
    

    
    // Fallback to category detection
    const category = this.detectCategory(lowerMsg);
    if (category) {
      return { 
        type: 'search_consultancy', 
        category, 
        confidence: 0.6,
        originalMessage: message
      };
    }
    
    return { type: 'general_query', confidence: 0.5 };
  }

  private async getAIIntent(message: string, context: any, retries = 2): Promise<any> {
    const model = genAI!.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
    
    const prompt = `Analyze this user message and determine the intent. Return JSON only.

Message: "${message}"
Context: ${JSON.stringify(context)}

Categories available: Legal Advisory, Business Strategy, Financial Services, Technology, Career Consultation, Health & Wellness

Return:
{
  "type": "greeting|search_consultancy|book_appointment|view_bookings|signin_help|general_query",
  "category": "legal|business|finance|technology|career|health|null",
  "confidence": 0.0-1.0,
  "consultantName": "name if mentioned or null",
  "keywords": ["extracted", "keywords"]
}

Rules:
- If asking for consultants/experts in a field -> "search_consultancy"
- If wants to book/schedule appointment -> "book_appointment"  
- If wants to see bookings -> "view_bookings"
- If needs sign in help -> "signin_help"
- If greeting -> "greeting"
- Otherwise -> "general_query"`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text().replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(response);
    } catch (error: any) {
      if (retries > 0 && (error.status === 503 || error.status === 429)) {
        console.log(`AI service unavailable, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return this.getAIIntent(message, context, retries - 1);
      }
      throw error;
    }
  }

  private isGreeting(msg: string): boolean {
    return /^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings|hola)/.test(msg);
  }

  private isBookingRequest(msg: string): boolean {
    // Check for booking keywords
    const hasBookingKeyword = /\b(book|schedule|appointment|available|when can|reserve|want to book|i want too book)\b/.test(msg);
    // Check for date patterns (DD/MM/YYYY or similar)
    const hasDatePattern = /\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(msg);
    // Don't treat "show/view bookings" as booking requests
    const isViewRequest = /\b(show|view|display|see|check|my)\s+(booking|appointment)s?\b/.test(msg);
    
    return (hasBookingKeyword || hasDatePattern) && !isViewRequest;
  }

  private isBusinessRequest(msg: string): boolean {
    const businessKeywords = /\b(consultancy|consultant|legal|business|finance|tech|career|health|find|search|need|looking for|approach)\b/.test(msg);
    const serviceKeywords = /\b(advice|help|service|expert|professional|specialist)\b/.test(msg);
    return businessKeywords && serviceKeywords;
  }

  private isViewBookingsRequest(msg: string): boolean {
    return /\b(show|view|display|see|check|my)\s+(booking|appointment)s?\b/.test(msg);
  }

  private isSignInRequest(msg: string): boolean {
    return /\b(sign\s?in|login|log\s?in|help.*sign|account)\b/.test(msg);
  }

  private extractConsultantName(msg: string): string | null {
    // Try to extract from "book with [name]" pattern
    let match = msg.match(/book\s+(?:with\s+)?([a-zA-Z\s]+?)(?:\s|$|for|at)/i);
    if (match) return match[1].trim();
    
    // Try to extract from "[name]" at start if it looks like a consultant name
    match = msg.match(/^([a-zA-Z\s]+?)\s*(?:\d|$)/i);
    if (match && match[1].length > 3) return match[1].trim();
    
    return null;
  }

  private detectCategory(msg: string): string | null {
    const categories = {
      legal: ['legal', 'law', 'lawyer', 'attorney', 'court', 'contract', 'litigation'],
      business: ['business', 'startup', 'strategy', 'management', 'company', 'entrepreneur'],
      finance: ['finance', 'financial', 'money', 'investment', 'tax', 'accounting', 'wealth'],
      technology: ['tech', 'software', 'app', 'website', 'development', 'coding', 'digital'],
      career: ['career', 'job', 'employment', 'interview', 'resume', 'work', 'professional'],
      health: ['health', 'medical', 'doctor', 'wellness', 'therapy', 'mental', 'fitness', 'counseling', 'relationship', 'stress', 'anxiety']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => msg.includes(keyword))) {
        return category;
      }
    }
    return null;
  }

  private isPersonalProblem(msg: string): boolean {
    const personalKeywords = ['family', 'wife', 'husband', 'marriage', 'divorce', 'relationship', 'fight', 'fought', 'problem', 'issue', 'stress', 'anxiety', 'depression', 'conflict', 'cheat', 'cheating', 'trust', 'argue', 'argument', 'continue discussing', 'talk about', 'tell me more'];
    return personalKeywords.some(keyword => msg.includes(keyword));
  }

  private handleGreeting(): ChatResponse {
    return {
      reply: "Hello! I'm your AI consultant finder 🤖\n\nI can help you:\n• Find expert consultants in Legal, Business, Finance, Tech, Career & Health\n• Book appointments with verified professionals\n• View your existing bookings\n\nWhat can I help you with today?",
      consultancies: [],
      actionType: 'greeting',
      needsBooking: false
    };
  }

  private async handleConsultancySearch(intent: any): Promise<ChatResponse> {
    const { category } = intent;
    
    try {
      const consultancies = await this.searchConsultancies(category);
      
      if (consultancies.length > 0) {
        const categoryName = this.getCategoryDisplayName(category);
        const displayCount = Math.min(consultancies.length, 3);
        let reply = `Found ${consultancies.length} verified ${categoryName} consultants. Here are the top ${displayCount}:`;
        
        // Add empathetic message for family/relationship issues
        if (category === 'legal' && (intent.originalMessage?.includes('family') || intent.originalMessage?.includes('wife') || intent.originalMessage?.includes('marriage'))) {
          reply = `I understand family issues can be very stressful. Here are the top ${displayCount} legal experts who specialize in family matters:`;
        } else if (category === 'health' && (intent.originalMessage?.includes('relationship') || intent.originalMessage?.includes('stress'))) {
          reply = `Relationship challenges are tough. Here are the top ${displayCount} counseling professionals who can help:`;
        }
        
        return {
          reply,
          consultancies: consultancies.slice(0, 3),
          actionType: 'search',
          needsBooking: false
        };
      } else {
        return {
          reply: `I'm searching for ${this.getCategoryDisplayName(category)} consultants in our database...`,
          consultancies: [],
          actionType: 'search',
          needsBooking: false
        };
      }
    } catch (error) {
      return this.handleError();
    }
  }

  private async initiateBooking(intent: any, userId?: string, sessionId?: string): Promise<ChatResponse> {
    const { consultantName } = intent;
    
    if (!consultantName) {
      return {
        reply: "I'd be happy to help you book an appointment! Which consultant would you like to book with? You can choose from the list above or tell me their name.",
        consultancies: [],
        actionType: 'book',
        needsBooking: true
      };
    }
    
    // Find consultant
    const consultant = await this.findConsultantByName(consultantName);
    
    if (!consultant) {
      return {
        reply: `I couldn't find a consultant named "${consultantName}". Could you check the spelling or choose from the consultants shown above?`,
        consultancies: [],
        actionType: 'book',
        needsBooking: true
      };
    }
    
    // Store booking context
    if (sessionId) {
      this.sessionMemory.set(sessionId, {
        consultant: consultant,
        step: 'date_selection',
        timestamp: Date.now()
      });
    }
    
    return {
      reply: `Perfect! Let's book with ${consultant.name}.\n\n📅 Available: ${this.formatAvailability(consultant)}\n💰 Rate: $${consultant.price || '100'}/hour\n\nWhat date would you prefer? (Format: DD/MM/YYYY)`,
      consultancies: [],
      actionType: 'book',
      needsBooking: true,
      bookingData: {
        consultantId: consultant._id,
        consultantName: consultant.name,
        step: 'date_selection'
      }
    };
  }

  private async handleViewBookings(userId?: string): Promise<ChatResponse> {
    if (!userId) {
      return {
        reply: "To view your bookings, please sign in first.",
        consultancies: [],
        actionType: 'view_bookings',
        needsBooking: false,
        requiresAuth: true
      };
    }

    try {
      const bookings = await this.getUserBookings(userId);
      
      if (bookings.length === 0) {
        return {
          reply: "You don't have any active bookings.\n\nWould you like me to help you find a consultant and book an appointment?",
          consultancies: [],
          actionType: 'view_bookings',
          needsBooking: false
        };
      }

      let reply = `📅 Your Active Bookings (${bookings.length}):\n\n`;
      bookings.forEach((booking, i) => {
        reply += `${i + 1}. ${booking.consultantName}\n`;
        reply += `   📅 ${booking.date} at ${booking.time}\n`;
        reply += `   📍 ${booking.type}\n`;
        reply += `   ✅ ${booking.status}\n\n`;
      });

      return {
        reply,
        consultancies: [],
        actionType: 'view_bookings',
        needsBooking: false
      };
    } catch (error) {
      return this.handleError();
    }
  }

  private handleSignInHelp(): ChatResponse {
    return {
      reply: "I'll help you sign in! Click the sign-in button to access your account and view your bookings.",
      consultancies: [],
      actionType: 'signin_help',
      needsBooking: false,
      requiresAuth: true
    };
  }

  private async handlePersonalCounseling(message: string, intent: any, sessionId?: string): Promise<ChatResponse> {
    const lowerMsg = message.toLowerCase();
    const context = intent.context || {};
    
    // Set counseling context for future messages
    if (sessionId) {
      this.sessionMemory.set(sessionId, {
        ...context,
        inPersonalCounseling: true,
        lastTopic: lowerMsg.includes('wife') ? 'marriage' : lowerMsg.includes('family') ? 'family' : 'personal',
        conversationHistory: [...(context.conversationHistory || []), message],
        timestamp: Date.now()
      });
    }
    
    // Force Gemini API usage for personal counseling
    if (genAI) {
      try {
        console.log('Attempting Gemini API for personal counseling...');
        return await this.getGeminiCounselingResponse(message, context, sessionId);
      } catch (error: any) {
        console.error('Gemini API failed for counseling:', {
          error: error.message,
          status: error.status,
          statusText: error.statusText,
          apiKeyPresent: !!API_KEY,
          apiKeyLength: API_KEY?.length || 0
        });
        // Continue with enhanced fallback
      }
    } else {
      console.log('Gemini API not available - no API key found');
    }
    
    let reply = "";
    
    // Handle follow-up responses in ongoing conversation
    if (lowerMsg.includes('continue discussing') || lowerMsg.includes('talk about') || lowerMsg.includes('tell me more')) {
      if (context.lastTopic === 'marriage' || lowerMsg.includes('wife')) {
        reply = "I'm here to listen. Please share what's on your mind about your relationship. Sometimes just talking through these feelings can help bring clarity.\n\n💭 **You can tell me:**\n• What specific things are bothering you most?\n• How this situation is making you feel\n• What you think might help improve things\n\nTake your time - I'm here to listen and support you through this difficult time.";
      } else {
        reply = "I'm listening. Please feel free to share whatever is weighing on your heart. Sometimes expressing our thoughts and feelings can help us process difficult situations better.\n\n💭 **Feel free to share:**\n• What happened and how it's affecting you\n• Your thoughts and concerns\n• What kind of support feels most helpful right now\n\nI'm here to provide a safe space for you to talk through this.";
      }
    }
    // Handle accusations of cheating
    else if (lowerMsg.includes('cheat') || lowerMsg.includes('told me') || lowerMsg.includes('never did')) {
      reply = "That must be incredibly painful and frustrating - being accused of something you didn't do, especially by someone you love. False accusations can feel like a betrayal of trust from both sides.\n\n💭 **This is really tough because:**\n• You feel hurt that she doesn't trust you\n• She might be feeling insecure or threatened by something\n• Both of you are probably feeling misunderstood\n\n**Some thoughts to consider:**\n• What might have triggered her suspicion? (Not that it's justified, but understanding helps)\n• Has there been anything that could have been misinterpreted?\n• Are there underlying trust or communication issues in your relationship?\n\n**Moving forward:**\n• Stay calm and don't get defensive (I know it's hard)\n• Ask her specifically what made her think this\n• Be completely transparent and patient\n• Consider couples counseling to rebuild trust and communication\n\nHow are you feeling right now? And do you have any idea what might have triggered her suspicion?";
    }
    // Initial responses for different situations
    else if (lowerMsg.includes('family') && (lowerMsg.includes('fight') || lowerMsg.includes('fought'))) {
      reply = "I'm really sorry to hear about the conflict with your family. Family disagreements can be incredibly stressful and emotionally draining.\n\n💭 **Let's talk about it first:**\n• What was the main issue that led to the fight?\n• How are you feeling right now?\n• Have you tried talking to them calmly about it?\n\n**Some immediate steps you could consider:**\n• Take some time to cool down if emotions are still high\n• Try to see their perspective - what might they be feeling?\n• Consider writing down your thoughts before having another conversation\n• Focus on the specific issue, not past grievances\n\n**Would you like to:**\n• Talk more about what happened?\n• Get some professional guidance from a family counselor?\n• Find legal advice if it's a serious matter?\n\nI'm here to listen and help you work through this. What feels most helpful right now?";
    } else if (lowerMsg.includes('wife') && (lowerMsg.includes('fight') || lowerMsg.includes('fought'))) {
      reply = "I understand how difficult marital conflicts can be. Arguments with your spouse can feel overwhelming and leave you both hurt and frustrated.\n\n💭 **Let's explore this together:**\n• What triggered this particular argument?\n• How long have you two been having difficulties?\n• Do you both want to work things out?\n\n**Some gentle suggestions:**\n• Give each other some space to process emotions\n• When you're both calm, try using 'I feel' statements instead of 'you always/never'\n• Listen to understand, not to win the argument\n• Remember what you love about each other\n\n**I can help you:**\n• Talk through your feelings and find clarity\n• Connect you with marriage counselors who specialize in communication\n• Find legal guidance if you're considering separation (though I hope it doesn't come to that)\n\nWhat would be most helpful for you right now? Do you want to talk about what happened, or are you looking for professional support?";
    } else {
      reply = "I can hear that you're going through a difficult time. Personal problems can feel overwhelming, but talking about them often helps.\n\n💭 **I'm here to listen:**\n• What's been weighing on your mind?\n• How has this been affecting you?\n• What kind of support do you think would help most?\n\n**We can:**\n• Continue discussing your situation\n• Find professional counselors or therapists\n• Connect you with relevant experts if needed\n\nWhat feels right for you? Would you like to share more about what's happening?";
    }
    
    // Add action buttons for better user guidance
    return {
      reply: reply + "\n\n**Choose how you'd like to continue:**",
      consultancies: [],
      actionType: 'info',
      needsBooking: false
    };
  }

  private async getGeminiCounselingResponse(message: string, context: any, sessionId?: string): Promise<ChatResponse> {
    console.log('Creating Gemini model...');
    const model = genAI!.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
    
    const conversationHistory = context.conversationHistory || [];
    const lastTopic = context.lastTopic || 'personal';
    
    const prompt = `You are Shaan, an empathetic AI counselor helping someone with ${lastTopic} issues. 

Conversation history: ${conversationHistory.slice(-3).join(' -> ')}
Current message: "${message}"
Topic: ${lastTopic}

Provide a compassionate, personalized response that:
1. Acknowledges their specific situation
2. Asks 1-2 thoughtful follow-up questions
3. Offers practical advice or coping strategies
4. Shows genuine empathy and understanding
5. Keeps the conversation flowing naturally

If they want to "talk about it" or "continue discussing", ask specific questions about their feelings, the situation, or what they think might help.

For marriage issues, focus on communication, trust, and understanding both perspectives.
For family issues, focus on conflict resolution and emotional healing.

Be warm, supportive, and conversational. Limit response to 150 words.`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    console.log('Gemini API response received');
    const aiResponse = result.response.text();

    // Update conversation history
    if (sessionId) {
      const currentContext = this.sessionMemory.get(sessionId) || {};
      this.sessionMemory.set(sessionId, {
        ...currentContext,
        conversationHistory: [...(currentContext.conversationHistory || []), message, aiResponse],
        lastAIResponse: aiResponse,
        timestamp: Date.now()
      });
    }

    console.log('Gemini counseling response generated successfully');
    return {
      reply: aiResponse,
      consultancies: [],
      actionType: 'info',
      needsBooking: false
    };
  }

  private async handleGeneralQuery(message: string, intent: any): Promise<ChatResponse> {
    if (!genAI) {
      // Provide intelligent fallback without AI
      const category = this.detectCategory(message.toLowerCase());
      if (category) {
        const consultancies = await this.searchConsultancies(category);
        return {
          reply: `I can help you find ${this.getCategoryDisplayName(category)} consultants. Here are some options:`,
          consultancies: consultancies.slice(0, 3),
          actionType: 'search',
          needsBooking: false
        };
      }
      
      return {
        reply: "I can help you find consultants in Legal, Business, Finance, Technology, Career, and Health fields. What type of expert are you looking for?",
        consultancies: [],
        actionType: 'info',
        needsBooking: false
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are Shaan, a helpful consultant finder assistant. Respond empathetically to this query and suggest relevant consultancy services:

User: "${message}"

Available services: Legal Advisory, Business Strategy, Financial Services, Technology, Career Consultation, Health & Wellness

For personal/family issues, suggest appropriate counseling or legal services. Keep response under 150 words and be supportive.`;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();

      // Check if we should search for consultants based on the response
      const lowerMsg = message.toLowerCase();
      let consultancies = [];
      if (lowerMsg.includes('family') || lowerMsg.includes('relationship') || lowerMsg.includes('marriage')) {
        consultancies = await this.searchConsultancies('legal'); // Family law consultants
      }

      return {
        reply: aiResponse,
        consultancies: consultancies.slice(0, 2),
        actionType: 'info',
        needsBooking: false
      };
    } catch (error: any) {
      console.log('AI service temporarily unavailable for general query, using smart fallback');
      // Use intelligent pattern matching fallback
      const category = this.detectCategory(message.toLowerCase());
      if (category) {
        const consultancies = await this.searchConsultancies(category);
        return {
          reply: `I understand you're looking for help with ${this.getCategoryDisplayName(category)} matters. Here are some expert consultants who can assist you:`,
          consultancies: consultancies.slice(0, 3),
          actionType: 'search',
          needsBooking: false
        };
      }
      return this.handleFallback(message);
    }
  }

  private async handleFallback(message: string): Promise<ChatResponse> {
    return {
      reply: "I can help you find expert consultants and book appointments. Try asking:\n• 'Find me a business consultant'\n• 'Book appointment with [name]'\n• 'Show my bookings'\n\nWhat would you like to do?",
      consultancies: [],
      actionType: 'info',
      needsBooking: false
    };
  }

  private handleError(): ChatResponse {
    return {
      reply: "I'm having trouble processing your request. Please try again or ask me to find consultants in a specific field.",
      consultancies: [],
      actionType: 'info',
      needsBooking: false
    };
  }

  private async searchConsultancies(category: string): Promise<any[]> {
    try {
      await connectDB();
      
      const categoryMap: { [key: string]: string[] } = {
        legal: ['Legal Advisory', 'Legal'],
        business: ['Business Strategy', 'Business'],
        finance: ['Financial Services', 'Finance'],
        technology: ['Technology', 'Tech'],
        career: ['Career Consultation', 'Career'],
        health: ['Health & Wellness', 'Healthcare']
      };
      
      const searchTerms = categoryMap[category] || [category];
      
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database not connected');
      
      const consultanciesCollection = db.collection('consultancies');
      
      let consultancies = await consultanciesCollection.find({
        status: 'verified',
        category: { $in: searchTerms.map(term => new RegExp(term, 'i')) }
      })
      .sort({ rating: -1 })
      .limit(5)
      .toArray();
      
      if (consultancies.length === 0) {
        consultancies = await consultanciesCollection.find({
          status: 'verified'
        })
        .sort({ rating: -1 })
        .limit(3)
        .toArray();
      }
      
      return consultancies;
    } catch (error) {
      console.error('Search consultancies error:', error);
      return [];
    }
  }

  private async findConsultantByName(name: string): Promise<any> {
    try {
      await connectDB();
      
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database not connected');
      
      const consultanciesCollection = db.collection('consultancies');
      
      const consultant = await consultanciesCollection.findOne({
        name: { $regex: name, $options: 'i' },
        status: 'verified'
      });
      
      return consultant;
    } catch (error) {
      console.error('Find consultant error:', error);
      return null;
    }
  }

  private async getUserBookings(userId: string): Promise<any[]> {
    try {
      await connectDB();
      
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database not connected');
      
      const appointmentsCollection = db.collection('appointments');
      
      const appointments = await appointmentsCollection.find({
        clientId: userId,
        status: { $in: ['confirmed', 'pending'] },
        appointmentDate: { $gte: new Date() }
      })
      .sort({ appointmentDate: 1 })
      .limit(5)
      .toArray();
      
      return appointments.map(apt => ({
        consultantName: apt.consultancyName || 'Unknown',
        date: new Date(apt.appointmentDate).toLocaleDateString('en-GB'),
        time: apt.appointmentTime,
        type: apt.appointmentType || 'Online',
        status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
      }));
    } catch (error) {
      console.error('Get user bookings error:', error);
      return [];
    }
  }

  private getCategoryDisplayName(category: string): string {
    const displayNames: { [key: string]: string } = {
      legal: 'Legal',
      business: 'Business',
      finance: 'Financial',
      technology: 'Technology',
      career: 'Career',
      health: 'Health & Wellness'
    };
    return displayNames[category] || category;
  }

  private formatAvailability(consultant: any): string {
    const days = consultant.availability?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const hours = consultant.availability?.hours || '9:00 AM - 6:00 PM';
    
    // Sort days in proper order
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedDays = days.sort((a: string, b: string) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    
    return `${sortedDays.join(', ')} (${hours})`;
  }

  private getSessionContext(sessionId?: string): any {
    if (!sessionId) return {};
    return this.sessionMemory.get(sessionId) || {};
  }
}