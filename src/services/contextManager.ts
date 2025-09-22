interface ConversationContext {
  sessionId: string;
  userId?: string;
  currentIntent: string;
  categories: Set<string>;
  entities: {
    budget?: number;
    location?: string;
    urgency: 'low' | 'medium' | 'high';
    timeframe?: string;
    consultationType?: 'online' | 'offline' | 'both';
  };
  conversationState: 'greeting' | 'searching' | 'booking' | 'clarifying' | 'completed';
  lastConsultancies: any[];
  bookingFlow?: {
    consultancyId?: string;
    step: 'date' | 'time' | 'type' | 'confirmation';
    data: any;
  };
  messageCount: number;
  lastActivity: Date;
}

export class ContextManager {
  private contexts: Map<string, ConversationContext> = new Map();
  private readonly CONTEXT_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  getContext(sessionId: string): ConversationContext | null {
    const context = this.contexts.get(sessionId);
    
    // Check if context has expired
    if (context && Date.now() - context.lastActivity.getTime() > this.CONTEXT_TIMEOUT) {
      this.contexts.delete(sessionId);
      return null;
    }
    
    return context || null;
  }

  createContext(sessionId: string, userId?: string): ConversationContext {
    const context: ConversationContext = {
      sessionId,
      userId,
      currentIntent: 'greeting',
      categories: new Set(),
      entities: {
        urgency: 'low'
      },
      conversationState: 'greeting',
      lastConsultancies: [],
      messageCount: 0,
      lastActivity: new Date()
    };
    
    this.contexts.set(sessionId, context);
    return context;
  }

  updateContext(sessionId: string, updates: Partial<ConversationContext>): ConversationContext {
    let context = this.getContext(sessionId);
    
    if (!context) {
      context = this.createContext(sessionId);
    }
    
    // Merge updates
    Object.assign(context, updates);
    context.lastActivity = new Date();
    context.messageCount++;
    
    // Update categories set
    if (updates.categories) {
      context.categories = new Set([...context.categories, ...updates.categories]);
    }
    
    this.contexts.set(sessionId, context);
    return context;
  }

  addConsultancies(sessionId: string, consultancies: any[]): void {
    const context = this.getContext(sessionId);
    if (context) {
      context.lastConsultancies = consultancies;
      context.lastActivity = new Date();
      this.contexts.set(sessionId, context);
    }
  }

  startBookingFlow(sessionId: string, consultancyId: string): void {
    const context = this.getContext(sessionId);
    if (context) {
      context.conversationState = 'booking';
      context.bookingFlow = {
        consultancyId,
        step: 'date',
        data: {}
      };
      context.lastActivity = new Date();
      this.contexts.set(sessionId, context);
    }
  }

  updateBookingFlow(sessionId: string, step: 'date' | 'time' | 'type' | 'confirmation', data: any): void {
    const context = this.getContext(sessionId);
    if (context && context.bookingFlow) {
      context.bookingFlow.step = step;
      context.bookingFlow.data = { ...context.bookingFlow.data, ...data };
      context.lastActivity = new Date();
      this.contexts.set(sessionId, context);
    }
  }

  getBookingData(sessionId: string): any {
    const context = this.getContext(sessionId);
    return context?.bookingFlow?.data || {};
  }

  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }

  // Clean up expired contexts
  cleanupExpiredContexts(): void {
    const now = Date.now();
    for (const [sessionId, context] of this.contexts.entries()) {
      if (now - context.lastActivity.getTime() > this.CONTEXT_TIMEOUT) {
        this.contexts.delete(sessionId);
      }
    }
  }

  // Get conversation insights for better responses
  getConversationInsights(sessionId: string): {
    isNewUser: boolean;
    hasSearched: boolean;
    preferredCategories: string[];
    isReturningForBooking: boolean;
    conversationLength: number;
  } {
    const context = this.getContext(sessionId);
    
    if (!context) {
      return {
        isNewUser: true,
        hasSearched: false,
        preferredCategories: [],
        isReturningForBooking: false,
        conversationLength: 0
      };
    }

    return {
      isNewUser: context.messageCount <= 1,
      hasSearched: context.lastConsultancies.length > 0,
      preferredCategories: Array.from(context.categories),
      isReturningForBooking: context.conversationState === 'booking',
      conversationLength: context.messageCount
    };
  }

  // Enhanced context-aware suggestions
  getContextualSuggestions(sessionId: string): string[] {
    const context = this.getContext(sessionId);
    const suggestions: string[] = [];
    
    if (!context) {
      return ['Tell me what you need help with', 'Browse categories', 'Find experts'];
    }

    switch (context.conversationState) {
      case 'greeting':
        suggestions.push('I need legal advice', 'Business consultation', 'Financial planning');
        break;
        
      case 'searching':
        if (context.lastConsultancies.length > 0) {
          suggestions.push('Book with first consultant', 'See more options', 'Compare profiles');
        } else {
          suggestions.push('Try different keywords', 'Browse all categories', 'Refine search');
        }
        break;
        
      case 'booking':
        const step = context.bookingFlow?.step;
        if (step === 'date') {
          suggestions.push('Tomorrow', 'Next Monday', 'This weekend');
        } else if (step === 'time') {
          suggestions.push('10 AM', '2 PM', 'Evening');
        } else if (step === 'type') {
          suggestions.push('Online consultation', 'In-person meeting');
        }
        break;
        
      default:
        suggestions.push('Find more consultants', 'Book appointment', 'Ask questions');
    }
    
    return suggestions.slice(0, 3);
  }
}