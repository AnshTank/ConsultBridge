import { AdvancedNLP } from './advancedNLP';
import { RecommendationEngine } from './recommendationEngine';
import { MemoryService } from './memoryService';
import { ProblemSolver } from './problemSolver';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

interface IntentAnalysis {
  intent: 'search' | 'book' | 'info' | 'greeting' | 'complaint' | 'support' | 'clarification';
  categories: string[];
  entities: {
    budget?: number;
    location?: string;
    urgency: 'low' | 'medium' | 'high';
    timeframe?: string;
    consultationType?: 'online' | 'offline' | 'both';
  };
  confidence: number;
  context: {
    isFollowUp: boolean;
    needsClarification: boolean;
    hasSpecificRequest: boolean;
  };
}

export class IntelligentAgent {
  private nlp: AdvancedNLP;
  private recommendationEngine: RecommendationEngine;
  private memoryService: MemoryService;
  private problemSolver: ProblemSolver;
  private conversationContext: Map<string, any> = new Map();

  constructor() {
    this.nlp = new AdvancedNLP();
    this.recommendationEngine = new RecommendationEngine();
    this.memoryService = new MemoryService();
    this.problemSolver = new ProblemSolver();
  }

  async processUserMessage(
    message: string,
    userId?: string,
    sessionId?: string,
    conversationHistory: any[] = [],
    contextualReference?: string
  ): Promise<{
    response: string;
    consultancies: any[];
    confidence: number;
    actionType: string;
    needsBooking: boolean;
    nextSteps: string[];
    awaitingConsent?: boolean;
    suggestedCategory?: string;
    bookingData?: any;
  }> {
    try {
      // Enhanced intent analysis with AI and context
      const intentAnalysis = await this.analyzeIntentWithAI(message, conversationHistory, contextualReference);
      console.log('🧠 Enhanced Intent Analysis:', intentAnalysis);

      // Update conversation context
      if (sessionId) {
        this.updateConversationContext(sessionId, intentAnalysis, message);
      }

      // Check if user is in booking flow
      if (this.isBookingStep(message, conversationHistory)) {
        return this.handleBookingStep(message, conversationHistory);
      }

      // Priority: Handle problems with solution-first approach
      if (this.isProblemStatement(message)) {
        return await this.handleProblemSolving(message, conversationHistory, intentAnalysis);
      }

      // Check if user is responding to empathy
      if (this.isConsentResponse(message, conversationHistory)) {
        return await this.handleConsentResponse(message, conversationHistory, userId);
      }
    
      // Handle different intents with enhanced logic
      switch (intentAnalysis.intent) {
        case 'greeting':
          return await this.handleGreeting(intentAnalysis);
        case 'book':
          return await this.handleBookingRequest(intentAnalysis, conversationHistory);
        case 'info':
          return await this.handleInformationRequest(intentAnalysis, message);
        case 'complaint':
          return this.handleComplaint(intentAnalysis, message);
        case 'support':
          return this.handleSupportRequest(intentAnalysis, message);
        case 'clarification':
          return this.handleClarificationRequest(intentAnalysis, conversationHistory);
        case 'search':
        default:
          return await this.handleSearchRequest(intentAnalysis, userId, sessionId);
      }
    } catch (error) {
      console.error('Error in processUserMessage:', error);
      return {
        response: "I apologize, but I'm having trouble processing your request right now. Could you please rephrase what you're looking for?",
        consultancies: [],
        confidence: 0.3,
        actionType: 'error',
        needsBooking: false,
        nextSteps: ['Try again', 'Contact support']
      };
    }
  }

  private async analyzeIntentWithAI(message: string, history: any[], contextualReference?: string): Promise<IntentAnalysis> {
    if (!model) {
      // Fallback to basic NLP if AI unavailable
      const basicAnalysis = this.nlp.analyzeUserIntent(message, history);
      return {
        intent: basicAnalysis.actionType as any,
        categories: basicAnalysis.categories,
        entities: {
          budget: basicAnalysis.budget,
          urgency: basicAnalysis.urgency,
        },
        confidence: basicAnalysis.confidence,
        context: {
          isFollowUp: history.length > 0,
          needsClarification: basicAnalysis.confidence < 0.6,
          hasSpecificRequest: basicAnalysis.specificNeeds.length > 0
        }
      };
    }

    try {
      const contextSummary = history.slice(-3).map(h => `User: ${h.userMessage}\nBot: ${h.botResponse}`).join('\n');
      const referenceContext = contextualReference ? `\nPrevious Context: ${contextualReference}` : '';
      
      const prompt = `You are an expert intent classifier for ConsultBridge, a consultancy discovery platform.

Analyze this user message and return a JSON response:

User Message: "${message}"

Recent Context:
${contextSummary}${referenceContext}

Return JSON with:
{
  "intent": "greeting|search|book|info|complaint|support|clarification",
  "categories": ["legal", "business", "finance", "technology", "healthcare"],
  "entities": {
    "budget": number or null,
    "location": "string or null",
    "urgency": "low|medium|high",
    "timeframe": "string or null",
    "consultationType": "online|offline|both|null"
  },
  "confidence": 0.0-1.0,
  "context": {
    "isFollowUp": boolean,
    "needsClarification": boolean,
    "hasSpecificRequest": boolean
  }
}

Intent Guidelines:
- greeting: Hi, hello, good morning
- search: Looking for consultants, need help with
- book: Schedule, appointment, book, when available
- info: What is, how does, tell me about
- complaint: Problem, issue, not working, disappointed
- support: Help me, I'm struggling, having trouble
- clarification: Follow-up questions, "what do you mean"

Only return valid JSON, no other text.`;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text().trim();
      
      // Clean and parse JSON
      const cleanJson = aiResponse.replace(/```json\n?|```\n?/g, '').trim();
      const analysis = JSON.parse(cleanJson);
      
      // Validate and enhance confidence
      analysis.confidence = Math.max(0.7, Math.min(1.0, analysis.confidence));
      
      return analysis;
    } catch (error) {
      console.error('AI intent analysis failed:', error);
      // Fallback to basic NLP
      const basicAnalysis = this.nlp.analyzeUserIntent(message, history);
      return {
        intent: basicAnalysis.actionType as any,
        categories: basicAnalysis.categories,
        entities: {
          budget: basicAnalysis.budget,
          urgency: basicAnalysis.urgency,
        },
        confidence: Math.max(0.5, basicAnalysis.confidence),
        context: {
          isFollowUp: history.length > 0,
          needsClarification: basicAnalysis.confidence < 0.6,
          hasSpecificRequest: basicAnalysis.specificNeeds.length > 0
        }
      };
    }
  }

  private updateConversationContext(sessionId: string, analysis: IntentAnalysis, message: string) {
    const context = this.conversationContext.get(sessionId) || {
      intents: [],
      categories: new Set(),
      entities: {},
      lastMessage: null
    };
    
    context.intents.push(analysis.intent);
    analysis.categories.forEach(cat => context.categories.add(cat));
    context.entities = { ...context.entities, ...analysis.entities };
    context.lastMessage = message;
    
    this.conversationContext.set(sessionId, context);
  }

  private async handleGreeting(analysis: IntentAnalysis) {
    if (model) {
      try {
        const prompt = `You are Shaan, ConsultBridge's AI assistant. Generate a warm, helpful greeting that:
        - Welcomes them enthusiastically
        - Mentions you help find expert consultants
        - Asks what they need help with
        - Keep it conversational and around 30-40 words
        - Be engaging and professional`;
        
        const result = await model.generateContent(prompt);
        const aiGreeting = result.response.text();
        
        return {
          response: aiGreeting,
          consultancies: [],
          confidence: 0.95,
          actionType: 'greeting',
          needsBooking: false,
          nextSteps: ['Tell me your needs', 'Browse categories', 'Search experts']
        };
      } catch (error) {
        console.error('Gemini greeting error:', error);
      }
    }
    
    const detailedGreetings = [
      "Hey there! I'm Shaan, your AI consultant finder. I help connect people with verified experts across various fields. What kind of consultation are you looking for today?",
      "Hello! Welcome to ConsultBridge! I'm here to help you find the perfect consultant for your needs. Whether it's legal, business, tech, or any other expertise - just let me know what you're looking for!",
      "Hi! I'm Shaan, and I specialize in matching you with top-rated consultants. From legal advice to business strategy, I can help you find the right expert. What brings you here today?",
      "Welcome! I'm your personal consultant finder. I have access to hundreds of verified experts across different categories. Tell me what kind of help you need and I'll find the perfect match!"
    ];
    
    return {
      response: detailedGreetings[Math.floor(Math.random() * detailedGreetings.length)],
      consultancies: [],
      confidence: 0.95,
      actionType: 'greeting',
      needsBooking: false,
      nextSteps: ['Tell me your needs', 'Browse categories', 'Search experts']
    };
  }

  private async handleSearchRequest(analysis: IntentAnalysis, userId?: string, sessionId?: string) {
    const { categories, entities } = analysis;
    
    // Get conversation context for better search
    const context = sessionId ? this.conversationContext.get(sessionId) : null;
    const allCategories = context ? Array.from(context.categories) : categories;
    
    // Add contextual reference to response if available
    const contextualRef = context?.lastMessage ? this.generateContextualResponse(context) : '';
    
    // Build comprehensive search parameters
    const searchParams: any = {};
    
    if (allCategories.length > 0) {
      searchParams.category = allCategories[0];
    }
    
    if (entities.budget) {
      searchParams.budget = entities.budget;
    }
    
    if (entities.location) {
      searchParams.location = entities.location;
    }
    
    if (entities.consultationType && entities.consultationType !== 'both') {
      searchParams.mode = entities.consultationType;
    }
    
    console.log('🔍 Enhanced search params:', searchParams);
    
    // Search with multiple fallback strategies
    let consultancies = await this.searchWithFallbacks(searchParams);
    
    // Generate AI-powered response with context
    let response = await this.generateSearchResponse(analysis, consultancies, searchParams);
    
    // Add contextual reference if available
    if (contextualRef) {
      response = `${contextualRef}\n\n${response}`;
    }
    
    return {
      response,
      consultancies: consultancies.slice(0, 3),
      confidence: analysis.confidence,
      actionType: 'search',
      needsBooking: false,
      nextSteps: this.generateContextualNextSteps(analysis, consultancies)
    };
  }

  private async searchWithFallbacks(params: any): Promise<any[]> {
    // Strategy 1: Exact match
    let results = await this.recommendationEngine.searchConsultancies(params);
    if (results.length > 0) return results;
    
    // Strategy 2: Category only
    if (params.category) {
      results = await this.recommendationEngine.searchConsultancies({ category: params.category });
      if (results.length > 0) return results;
    }
    
    // Strategy 3: Text search
    if (params.category) {
      results = await this.recommendationEngine.searchConsultancies({ query: params.category });
      if (results.length > 0) return results;
    }
    
    // Strategy 4: Get all verified consultancies
    results = await this.recommendationEngine.searchConsultancies({});
    return results;
  }

  private async generateSearchResponse(analysis: IntentAnalysis, consultancies: any[], searchParams: any): Promise<string> {
    if (!model) {
      return this.generateFallbackSearchResponse(analysis, consultancies);
    }
    
    try {
      const consultancyList = consultancies.slice(0, 3).map((c, i) => 
        `${i + 1}. ${c.name} - ${c.category} (${c.rating || 'New'}⭐, ₹${c.price || 'Contact for pricing'})`
      ).join('\n');
      
      const prompt = `You are Shaan, ConsultBridge's AI assistant. Generate a helpful response for a user searching for consultants.

User Intent: ${analysis.intent}
Categories: ${analysis.categories.join(', ')}
Urgency: ${analysis.entities.urgency}
Budget: ${analysis.entities.budget ? '₹' + analysis.entities.budget : 'Not specified'}
Location: ${analysis.entities.location || 'Not specified'}

Found Consultancies:
${consultancyList || 'No specific matches found'}

Generate a response that:
- Acknowledges their specific need enthusiastically
- Shows understanding of their requirements
- Presents the consultancies naturally (if found)
- Provides helpful next steps
- Keeps it conversational and under 150 words
- Uses emojis appropriately

If no consultancies found, suggest refining search or browsing categories.`;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI response generation failed:', error);
      return this.generateFallbackSearchResponse(analysis, consultancies);
    }
  }

  private generateFallbackSearchResponse(analysis: IntentAnalysis, consultancies: any[]): string {
    const categoryText = analysis.categories.length > 0 ? analysis.categories[0] : 'expert';
    
    if (consultancies.length === 0) {
      return `I understand you're looking for ${categoryText} consultation. Let me help you find the right expert! Could you provide more details about your specific needs? I can search across Legal, Business, Finance, Technology, and Healthcare categories.`;
    }
    
    let response = `Great! I found excellent ${categoryText} consultants for you:\n\n`;
    
    consultancies.slice(0, 3).forEach((consultant, i) => {
      response += `${i + 1}. **${consultant.name}** - ${consultant.category}\n`;
      response += `   ⭐ ${consultant.rating || 'New'} | 💰 ₹${consultant.price || 'Contact for pricing'}\n`;
      response += `   📍 ${consultant.location}\n\n`;
    });
    
    response += "🚀 Ready to proceed? Click on any consultant to view their profile and book a consultation!";
    return response;
  }

  private handleSupportRequest(analysis: IntentAnalysis, message: string) {
    return {
      response: "I'm here to help you! 💙 It sounds like you're going through a challenging situation. Let me connect you with the right expert who can provide the guidance and support you need.\n\nWhat specific area would you like help with? I can find consultants in:\n• Legal matters\n• Business challenges\n• Financial planning\n• Technology solutions\n• Healthcare guidance\n\nTell me more about your situation, and I'll find the perfect consultant to support you.",
      consultancies: [],
      confidence: 0.9,
      actionType: 'support',
      needsBooking: false,
      nextSteps: ['Describe your situation', 'Choose category', 'Find expert help']
    };
  }

  private handleClarificationRequest(analysis: IntentAnalysis, history: any[]) {
    const lastBotMessage = history[history.length - 1]?.botResponse || '';
    
    return {
      response: `Let me clarify that for you! Based on our conversation, I understand you're looking for consultation services. \n\n${lastBotMessage ? 'From my previous response: ' + lastBotMessage.substring(0, 100) + '...' : ''}\n\nWhat specific part would you like me to explain further? I'm here to make sure you get exactly what you need!`,
      consultancies: [],
      confidence: 0.8,
      actionType: 'clarification',
      needsBooking: false,
      nextSteps: ['Ask specific questions', 'Browse categories', 'Start fresh search']
    };
  }

  private generateContextualNextSteps(analysis: IntentAnalysis, consultancies: any[]): string[] {
    const steps: string[] = [];
    
    if (consultancies.length > 0) {
      if (analysis.entities.urgency === 'high') {
        steps.push('Book immediately', 'Check availability');
      } else {
        steps.push('View profiles', 'Compare options');
      }
      steps.push('Read reviews', 'Check pricing');
    } else {
      steps.push('Refine search', 'Browse categories');
      if (analysis.categories.length > 0) {
        steps.push(`More ${analysis.categories[0]} experts`);
      }
    }
    
    return steps.slice(0, 4);
  }

  private async handleSearchRequestOld(analysis: any, userId?: string) {
    const { categories, budget, experienceLevel, urgency, specificNeeds } = analysis;
    
    // Use AI to generate personalized search response first
    let aiResponse = '';
    if (model) {
      try {
        const prompt = `You are Shaan, ConsultBridge's AI assistant. A user needs help with: ${categories.join(', ') || 'consultation'}.
        
        Generate a detailed, helpful response that:
        - Acknowledges their specific need enthusiastically
        - Shows you understand their situation
        - Mentions you're finding the best consultants for them
        - Keep it around 60-80 words
        - Be encouraging, professional and detailed
        - Don't mention specific consultant names
        
        User context: ${specificNeeds.join(', ') || 'general consultation'}
        Urgency: ${urgency}
        Budget: ${budget ? '₹' + budget : 'not specified'}`;
        
        const result = await model.generateContent(prompt);
        aiResponse = result.response.text();
      } catch (error) {
        console.error('Gemini search error:', error);
      }
    }
    
    // Build search parameters
    const searchParams: any = {};
    
    if (categories.length > 0) {
      searchParams.category = categories[0];
    }
    
    if (budget) {
      searchParams.budget = budget;
    }
    
    if (experienceLevel && experienceLevel.includes('years')) {
      const years = parseInt(experienceLevel);
      searchParams.experience = years;
    }
    
    // Search for consultants
    let consultancies = await this.recommendationEngine.searchConsultancies(searchParams);
    
    // Fallback searches
    if (consultancies.length === 0 && categories.length > 0) {
      consultancies = await this.recommendationEngine.searchConsultancies({
        query: categories.join(' ')
      });
    }
    
    if (consultancies.length === 0) {
      consultancies = await this.recommendationEngine.searchConsultancies({});
    }
    
    // Generate complete response with AI intro + consultant results
    const fullResponse = this.generateAIConsultantResponse(aiResponse, analysis, consultancies);
    
    return {
      response: fullResponse,
      consultancies: consultancies.slice(0, 3),
      confidence: analysis.confidence,
      actionType: 'search',
      needsBooking: false,
      nextSteps: this.generateSmartNextSteps(analysis, consultancies)
    };
  }

  private async handleBookingRequest(analysis: any, conversationHistory: any[]) {
    // Extract consultant from recent conversation
    const recentConsultants = this.extractRecentConsultants(conversationHistory);
    
    if (recentConsultants.length === 0) {
      return {
        response: "I'd love to help you book an appointment! First, let me find the perfect consultant for you. What type of expertise do you need?",
        consultancies: [],
        confidence: 0.8,
        actionType: 'book',
        needsBooking: true,
        nextSteps: ['Find consultant', 'Specify needs', 'Browse categories']
      };
    }
    
    const consultant = recentConsultants[0];
    const rating = consultant.rating || 4.5;
    
    return {
      response: `Perfect! I'll help you book with ${consultant.name}. They have a ${rating}⭐ rating and specialize in ${consultant.category}.\n\nLet's start with your preferred date. When would you like to schedule your consultation?\n\n📅 You can say:\n• "Tomorrow"\n• "Next Monday"\n• "December 15th"\n• Or any specific date`,
      consultancies: [],
      confidence: 0.9,
      actionType: 'booking_date',
      needsBooking: true,
      nextSteps: ['Choose date', 'Choose time', 'Choose type']
    };
  }

  private async handleInformationRequest(analysis: any, message: string) {
    if (model) {
      try {
        const prompt = `You are Shaan, ConsultBridge's AI assistant. User asked: "${message}"
        
        Generate a helpful response about ConsultBridge that:
        - Answers their specific question
        - Mentions key features: 500+ verified consultants, 10+ categories, AI matching
        - Includes pricing if they asked about costs
        - Asks what type of consultant they need
        - Keep it under 100 words
        - Be informative and engaging
        - Don't mention specific consultant names`;
        
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();
        
        return {
          response: aiResponse,
          consultancies: [],
          confidence: 0.9,
          actionType: 'info',
          needsBooking: false,
          nextSteps: ['Search consultants', 'Browse categories', 'Ask questions']
        };
      } catch (error) {
        console.error('Gemini info error:', error);
      }
    }
    
    return {
      response: "ConsultBridge connects you with 500+ verified consultants across 10+ categories. We use AI to match you with the perfect expert. What type of consultation do you need?",
      consultancies: [],
      confidence: 0.7,
      actionType: 'info',
      needsBooking: false,
      nextSteps: ['Search consultants', 'Browse categories', 'Ask questions']
    };
  }

  private handleComplaint(analysis: any, message: string) {
    return {
      response: "I'm sorry to hear you're experiencing issues! 😔 Your satisfaction is my top priority. Let me help resolve this immediately.\n\n🛠️ **I can help with:**\n• Finding better consultant matches\n• Rescheduling appointments\n• Resolving booking issues\n• Getting refunds if needed\n\nPlease tell me exactly what happened, and I'll make it right! You can also contact our support team for immediate assistance.",
      consultancies: [],
      confidence: 0.85,
      actionType: 'complaint',
      needsBooking: false,
      nextSteps: ['Describe issue', 'Contact support', 'Find alternative']
    };
  }

  private generateSmartNextSteps(analysis: any, consultancies: any[]): string[] {
    const { urgency, actionType, categories } = analysis;
    const steps: string[] = [];
    
    if (consultancies.length > 0) {
      if (urgency === 'high') {
        steps.push('Book immediately', 'Check availability today');
      } else {
        steps.push('View profiles', 'Compare options');
      }
      steps.push('Read reviews', 'Check pricing');
    } else {
      steps.push('Refine search', 'Browse categories', 'Try different keywords');
    }
    
    if (categories.length > 0) {
      steps.push(`More ${categories[0]} experts`);
    }
    
    return steps.slice(0, 4);
  }

  private isProblemStatement(message: string): boolean {
    const problemIndicators = [
      'failed', 'failure', 'rejected', 'didn\'t get', 'lost', 'struggling',
      'having trouble', 'can\'t', 'unable to', 'difficulty', 'problem',
      'issue', 'challenge', 'stuck', 'confused', 'worried', 'stressed'
    ];
    
    const lowerMessage = message.toLowerCase();
    return problemIndicators.some(indicator => lowerMessage.includes(indicator));
  }
  
  private async handleProblemSolving(message: string, history: any[], analysis: IntentAnalysis) {
    const problemAnalysis = await this.problemSolver.analyzeProblem(message, history);
    
    // Check if user is in problem-solving conversation
    const isFollowUp = this.isFollowUpToProblemSolving(history);
    
    if (isFollowUp) {
      return this.handleProblemFollowUp(message, history, problemAnalysis);
    }
    
    // First time problem - offer solutions first
    const supportiveResponse = this.problemSolver.generateSupportiveResponse(problemAnalysis, message);
    
    return {
      response: supportiveResponse,
      consultancies: [],
      confidence: 0.9,
      actionType: 'problem_solving',
      needsBooking: false,
      nextSteps: ['Try suggested steps', 'Answer questions', 'Get expert help if needed'],
      awaitingConsent: false,
      suggestedCategory: problemAnalysis.problemType,
      problemSolving: {
        canSelfSolve: problemAnalysis.canSelfSolve,
        severity: problemAnalysis.severity,
        solutionSteps: problemAnalysis.solutionSteps,
        followUpQuestions: problemAnalysis.followUpQuestions
      }
    };
  }

  private isFollowUpToProblemSolving(history: any[]): boolean {
    const lastMessage = history[history.length - 1];
    return lastMessage?.metadata?.actionType === 'problem_solving' || 
           lastMessage?.metadata?.actionType === 'problem_followup';
  }

  private async handleProblemFollowUp(message: string, history: any[], problemAnalysis: any) {
    const lowerMessage = message.toLowerCase();
    
    // Check if user wants consultant now
    if (lowerMessage.includes('consultant') || lowerMessage.includes('expert') || 
        lowerMessage.includes('professional help') || lowerMessage.includes('didn\'t work')) {
      
      const consultancies = await this.recommendationEngine.searchConsultancies({
        category: problemAnalysis.problemType
      });
      
      const response = `I understand the self-help approach isn't sufficient. Let me connect you with professional ${problemAnalysis.problemType} experts who can provide personalized guidance.\n\n` +
        this.generateAIConsultantResponse('', { categories: [problemAnalysis.problemType] }, consultancies);
      
      return {
        response,
        consultancies: consultancies.slice(0, 3),
        confidence: 0.95,
        actionType: 'search',
        needsBooking: false,
        nextSteps: ['View profiles', 'Book consultation', 'Compare experts']
      };
    }
    
    // Continue problem-solving conversation
    let response = "Thanks for sharing more details! 💙\n\n";
    
    // Provide more specific guidance based on their response
    if (lowerMessage.includes('tried') || lowerMessage.includes('done')) {
      response += "It sounds like you've already taken some steps. That's great progress! ";
      response += "Based on what you've shared, here are some additional approaches:\n\n";
      
      // Generate more advanced solutions
      const advancedSteps = this.generateAdvancedSolutions(problemAnalysis.problemType, message);
      advancedSteps.forEach((step, i) => {
        response += `${i + 1}. ${step}\n`;
      });
      
      response += "\nIf these don't help, I'd recommend consulting with a professional expert. Would you like me to find some specialists?";
    } else {
      response += "Let me provide more specific guidance based on your situation:\n\n";
      response += this.generatePersonalizedAdvice(problemAnalysis.problemType, message);
      response += "\n\nHow does this sound? Are you ready to try these steps, or would you prefer to speak with a professional consultant?";
    }
    
    return {
      response,
      consultancies: [],
      confidence: 0.85,
      actionType: 'problem_followup',
      needsBooking: false,
      nextSteps: ['Try new suggestions', 'Get professional help', 'Ask more questions']
    };
  }

  private generateAdvancedSolutions(problemType: string, message: string): string[] {
    const solutions: Record<string, string[]> = {
      career: [
        'Reach out to recruiters in your industry',
        'Consider informational interviews with professionals',
        'Join professional associations or networking groups',
        'Work with a career coach for personalized guidance'
      ],
      business: [
        'Conduct customer interviews to validate your idea',
        'Create a minimum viable product (MVP)',
        'Seek mentorship from successful entrepreneurs',
        'Consider joining a startup accelerator program'
      ],
      financial: [
        'Consult with a financial advisor for personalized planning',
        'Consider debt consolidation options',
        'Explore investment opportunities for long-term growth',
        'Look into financial assistance programs'
      ]
    };
    
    return solutions[problemType] || [
      'Seek advice from experienced professionals',
      'Consider getting expert consultation',
      'Join relevant communities or support groups'
    ];
  }

  private generatePersonalizedAdvice(problemType: string, message: string): string {
    const advice: Record<string, string> = {
      career: "Focus on highlighting your unique value proposition. Tailor your resume for each application and practice your elevator pitch. Consider reaching out to your network for referrals.",
      business: "Start by validating your business idea with potential customers. Create a simple business plan and consider starting small to test the market before making large investments.",
      financial: "Begin with tracking all your expenses for a month to understand your spending patterns. Then create a realistic budget and look for areas where you can reduce costs.",
      legal: "Document everything related to your situation. Try to resolve the matter through direct communication first, but don't hesitate to seek legal advice if it's complex."
    };
    
    return advice[problemType] || "Take it step by step and don't hesitate to ask for help when needed. Sometimes talking through the problem with someone can provide new perspectives.";
  }

  private handleProblemWithEmpathyOld(message: string, analysis: IntentAnalysis) {
    const lowerMessage = message.toLowerCase();
    
    let empathyResponse = '';
    let suggestedCategory = 'Career';
    
    if (lowerMessage.includes('interview')) {
      empathyResponse = "I'm sorry to hear about your interview experience. 😔 That can be really disappointing, but remember - every setback is a setup for a comeback!\n\n";
      suggestedCategory = 'Career';
    } else if (lowerMessage.includes('job') || lowerMessage.includes('career')) {
      empathyResponse = "I understand how challenging career situations can be. 💪 You're not alone in this.\n\n";
      suggestedCategory = 'Career';
    } else {
      empathyResponse = "I hear you, and I want you to know that facing challenges is part of growth. 🌱\n\n";
    }
    
    const supportResponse = empathyResponse + 
      `💡 **Here's how I can help:**\n` +
      `• Connect you with ${suggestedCategory.toLowerCase()} experts who've helped others in similar situations\n` +
      `• Find mentors who can provide guidance and support\n` +
      `• Get professional advice on next steps\n\n` +
      `Would you like me to find some ${suggestedCategory.toLowerCase()} consultants who can help you move forward? Or would you prefer to talk through your situation first?`;
    
    return {
      response: supportResponse,
      consultancies: [],
      confidence: 0.9,
      actionType: 'empathy',
      needsBooking: false,
      nextSteps: ['Find consultants', 'Get guidance', 'Talk more'],
      awaitingConsent: true,
      suggestedCategory
    };
  }
  
  private isConsentResponse(message: string, history: any[]): boolean {
    const lastMessage = history[history.length - 1];
    if (!lastMessage?.metadata?.awaitingConsent) return false;
    
    const lowerMessage = message.toLowerCase();
    
    // Check for booking requests that reference the context
    if (lowerMessage.includes('book') && (lowerMessage.includes('this') || lowerMessage.includes('consultancy'))) {
      return true;
    }
    
    return ['yes', 'yeah', 'sure', 'ok', 'okay', 'find', 'show', 'help', 'no', 'not now', 'talk']
      .some(word => lowerMessage.includes(word));
  }
  
  private async handleConsentResponse(message: string, history: any[], userId?: string) {
    const lastMessage = history[history.length - 1];
    const suggestedCategory = lastMessage?.metadata?.suggestedCategory || 'Career';
    
    const lowerMessage = message.toLowerCase();
    
    // Extract the original problem from conversation history
    const originalProblem = this.extractOriginalProblem(history);
    
    // Check if user wants to book or find consultants
    const wantsConsultants = ['yes', 'yeah', 'sure', 'ok', 'okay', 'find', 'show', 'help', 'book']
      .some(word => lowerMessage.includes(word));
    
    if (wantsConsultants) {
      const consultancies = await this.recommendationEngine.searchConsultancies({
        category: suggestedCategory
      });
      
      // Generate contextual response that references the original problem
      let contextualResponse = '';
      
      if (lowerMessage.includes('book')) {
        contextualResponse = `Perfect! I understand you want to book a consultation for your ${originalProblem || 'interview situation'}. `;
      } else {
        contextualResponse = `Great! Let me find the best ${suggestedCategory.toLowerCase()} consultants to help with your ${originalProblem || 'situation'}. `;
      }
      
  const response = contextualResponse + this.generateAIConsultantResponse('', { categories: [suggestedCategory], urgency: 'medium' }, consultancies);
      
      return {
        response,
        consultancies: consultancies.slice(0, 3),
        confidence: 0.95,
        actionType: 'search',
        needsBooking: lowerMessage.includes('book'),
        nextSteps: ['View profiles', 'Book consultation', 'Compare options']
      };
    } else {
      return {
        response: `I'm here to listen and support you about your ${originalProblem || 'situation'}. 💙 Tell me more about what happened. What specific aspects are bothering you most?`,
        consultancies: [],
        confidence: 0.85,
        actionType: 'support',
        needsBooking: false,
        nextSteps: ['Share details', 'Get support', 'Find consultants later']
      };
    }
  }
  
  private extractOriginalProblem(history: any[]): string {
    // Look for the original problem statement in recent history
    for (let i = history.length - 1; i >= Math.max(0, history.length - 3); i--) {
      const msg = history[i];
      if (msg.userMessage) {
        const lowerMsg = msg.userMessage.toLowerCase();
        if (lowerMsg.includes('failed') && lowerMsg.includes('interview')) {
          return 'interview experience';
        }
        if (lowerMsg.includes('job') || lowerMsg.includes('career')) {
          return 'career situation';
        }
        if (lowerMsg.includes('business')) {
          return 'business challenge';
        }
        if (lowerMsg.includes('legal')) {
          return 'legal matter';
        }
      }
    }
    return 'situation';
  }
  
  private generateAIConsultantResponse(aiIntro: string, analysis: any, consultancies: any[]): string {
    const { categories, urgency, budget } = analysis;
    
    if (consultancies.length === 0) {
      return aiIntro + "\n\nI couldn't find consultants matching your exact criteria right now. Let me help you refine your search or explore related categories.";
    }
    
    let response = aiIntro + "\n\n";
    
    if (urgency === 'high') {
      response += "🚨 I understand this is urgent! ";
    }
    
    const categoryText = categories?.length > 0 ? categories[0] : 'expert';
    response += `Here are the top 3 ${categoryText} consultants I found for you:\n\n`;
    
    consultancies.slice(0, 3).forEach((consultant, i) => {
      response += `${i + 1}. ${consultant.name} - ${consultant.category}\n`;
      response += `⭐ Rating: ${consultant.rating || 'New'} | 💰 ₹${consultant.pricing?.hourlyRate || consultant.price || 'Contact for pricing'}/hour\n`;
      response += `📝 ${consultant.description?.substring(0, 120) || 'Professional consultation services'}...\n\n`;
    });
    
    if (budget) {
      const withinBudget = consultancies.filter(c => 
        c.pricing?.hourlyRate && c.pricing.hourlyRate <= budget
      ).length;
      if (withinBudget > 0) {
        response += `💡 ${withinBudget} consultants are within your ₹${budget} budget!\n\n`;
      }
    }
    
    response += "🚀 Ready to proceed?\n";
    response += "• Click on any consultant above to view profile and book\n";
    response += "• Compare ratings and pricing\n";
    response += "• Check availability and reviews\n";
    
    return response;
  }
  
  private extractRecentConsultants(history: any[]): any[] {
    const consultants: any[] = [];
    
    for (const msg of history.slice(-5).reverse()) {
      if (msg.metadata?.consultancies) {
        consultants.push(...msg.metadata.consultancies);
      }
    }
    
    return consultants.slice(0, 3);
  }

  private isBookingStep(message: string, history: any[]): boolean {
    const lastMessage = history[history.length - 1];
    if (!lastMessage?.metadata) return false;
    
    const actionType = lastMessage.metadata.actionType;
    return ['booking_date', 'booking_time', 'booking_type'].includes(actionType);
  }
  
  private isDateInput(message: string): boolean {
    const datePatterns = [
      /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/, // Date patterns
      /(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /\d{1,2}(st|nd|rd|th)/i
    ];
    return datePatterns.some(pattern => pattern.test(message));
  }
  
  private isTimeInput(message: string): boolean {
    const timePatterns = [
      /\d{1,2}:\d{2}\s*(am|pm|AM|PM)?/,
      /\d{1,2}\s*(am|pm|AM|PM)/i,
      /(morning|afternoon|evening|noon)/i
    ];
    return timePatterns.some(pattern => pattern.test(message));
  }

  private generateContextualResponse(context: any): string {
    const references: string[] = [];
    
    if (context.categories && context.categories.size > 0) {
      const cats = Array.from(context.categories).join(' and ');
      references.push(`Continuing our discussion about ${cats}`);
    }
    
    return references.length > 0 ? references[0] : '';
  }

  private handleBookingStep(message: string, history: any[]) {
    const lastMessage = history[history.length - 1];
    const actionType = lastMessage?.metadata?.actionType;
    const recentConsultants = this.extractRecentConsultants(history);
    const consultant = recentConsultants[0];
    
    if (!consultant) {
      return {
        response: "I need to know which consultant you'd like to book with first. Please let me find some options for you.",
        consultancies: [],
        confidence: 0.7,
        actionType: 'book',
        needsBooking: true,
        nextSteps: ['Find consultant', 'Choose expert']
      };
    }
    
    switch (actionType) {
      case 'booking_date':
        if (this.isDateInput(message)) {
          return {
            response: `Great! ${message} works perfectly.\n\nNow, what time would you prefer for your consultation with ${consultant.name}?\n\n🕐 You can say:\n• "10 AM"\n• "2:30 PM"\n• "Morning"\n• "Afternoon"`,
            consultancies: [],
            confidence: 0.9,
            actionType: 'booking_time',
            needsBooking: true,
            nextSteps: ['Choose time', 'Choose type'],
            bookingData: { date: message }
          };
        } else {
          return {
            response: `I need a valid date. Please tell me when you'd like to schedule your consultation:\n\n📅 Examples:\n• "Tomorrow"\n• "Next Monday"\n• "December 15th"\n• "12/15/2024"`,
            consultancies: [consultant],
            confidence: 0.8,
            actionType: 'booking_date',
            needsBooking: true,
            nextSteps: ['Choose date']
          };
        }
        
      case 'booking_time':
        if (this.isTimeInput(message)) {
          const bookingData = lastMessage.metadata.bookingData || {};
          return {
            response: `Perfect! ${message} on ${bookingData.date || 'your chosen date'}.\n\nLastly, would you prefer an online or offline consultation?\n\n💻 Online - Video call from anywhere\n🏢 Offline - In-person meeting at their office`,
            consultancies: [],
            confidence: 0.9,
            actionType: 'booking_type',
            needsBooking: true,
            nextSteps: ['Choose type'],
            bookingData: { ...bookingData, time: message }
          };
        } else {
          return {
            response: `Please provide a valid time:\n\n🕐 Examples:\n• "10 AM"\n• "2:30 PM"\n• "Morning"\n• "Evening"`,
            consultancies: [consultant],
            confidence: 0.8,
            actionType: 'booking_time',
            needsBooking: true,
            nextSteps: ['Choose time']
          };
        }
        
      case 'booking_type':
        const isOnline = message.toLowerCase().includes('online') || message.toLowerCase().includes('video');
        const isOffline = message.toLowerCase().includes('offline') || message.toLowerCase().includes('person') || message.toLowerCase().includes('office');
        
        if (isOnline || isOffline) {
          const bookingData = lastMessage.metadata.bookingData || {};
          const meetingType = isOnline ? 'Online' : 'Offline';
          
          return {
            response: `✅ Booking Confirmed!\n\n📋 Appointment Details:\n• Consultant: ${consultant.name}\n• Category: ${consultant.category}\n• Date: ${bookingData.date || 'Your chosen date'}\n• Time: ${bookingData.time || 'Your chosen time'}\n• Type: ${meetingType} consultation\n• Duration: 1 hour\n• Status: Confirmed\n\n🎉 You're all set! You'll receive a confirmation email shortly with meeting details and payment information.\n\n💡 Need to reschedule? Just let me know!`,
            consultancies: [consultant],
            confidence: 0.95,
            actionType: 'booking_confirmed',
            needsBooking: false,
            nextSteps: ['Check email', 'Prepare for meeting', 'Reschedule if needed']
          };
        } else {
          return {
            response: `Please choose your consultation type:\n\n💻 Say "Online" for video call\n🏢 Say "Offline" for in-person meeting`,
            consultancies: [consultant],
            confidence: 0.8,
            actionType: 'booking_type',
            needsBooking: true,
            nextSteps: ['Choose type']
          };
        }
        
      default:
        return {
          response: "Let me help you start the booking process again. Which consultant would you like to book with?",
          consultancies: [],
          confidence: 0.7,
          actionType: 'book',
          needsBooking: true,
          nextSteps: ['Find consultant']
        };
    }
  }
}