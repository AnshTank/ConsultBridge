export interface Intent {
  type: 'search' | 'booking' | 'problem' | 'memory' | 'general' | 'clarification';
  confidence: number;
  entities: {
    category?: string;
    location?: string;
    budget?: number;
    mode?: 'online' | 'offline';
    timeframe?: string;
    problem?: string;
  };
  needsAI: boolean;
}

export class IntentRecognition {
  recognizeIntent(message: string, conversationHistory: any[] = []): Intent {
    const lowerMessage = message.toLowerCase().trim();
    
    // Problem statement patterns (needs AI)
    if (this.isProblemStatement(lowerMessage)) {
      return {
        type: 'problem',
        confidence: 0.9,
        entities: { problem: message },
        needsAI: true
      };
    }

    // Memory/reference patterns (needs AI for context)
    if (this.isMemoryReference(lowerMessage)) {
      return {
        type: 'memory',
        confidence: 0.95,
        entities: this.extractMemoryEntities(lowerMessage),
        needsAI: true
      };
    }

    // Booking patterns
    if (this.isBookingIntent(lowerMessage)) {
      return {
        type: 'booking',
        confidence: 0.9,
        entities: this.extractBookingEntities(lowerMessage),
        needsAI: this.isComplexBooking(lowerMessage)
      };
    }

    // Search patterns
    if (this.isSearchIntent(lowerMessage)) {
      const entities = this.extractSearchEntities(lowerMessage);
      return {
        type: 'search',
        confidence: 0.8,
        entities,
        needsAI: this.isComplexSearch(entities)
      };
    }

    // Ambiguous/complex queries (needs AI)
    if (this.isAmbiguous(lowerMessage)) {
      return {
        type: 'clarification',
        confidence: 0.7,
        entities: {},
        needsAI: true
      };
    }

    // Default to general query
    return {
      type: 'general',
      confidence: 0.6,
      entities: {},
      needsAI: false
    };
  }

  private isProblemStatement(message: string): boolean {
    const problemPatterns = [
      /i am facing|i have|i'm having|i need help with|struggling with/i,
      /my (business|startup|company).*(issue|problem|challenge)/i,
      /facing (issues?|problems?|challenges?) with/i,
      /don't know (how|what|where|who)/i
    ];
    return problemPatterns.some(pattern => pattern.test(message));
  }

  private isMemoryReference(message: string): boolean {
    const memoryPatterns = [
      /(same|similar|like).*(last|previous|before|earlier)/i,
      /(show|find|get).*(my|previous|past|last).*(booking|appointment|consultation)/i,
      /we (discussed|talked about|mentioned) (earlier|before)/i,
      /(cheaper|better|different) (than|from) (last|previous)/i
    ];
    return memoryPatterns.some(pattern => pattern.test(message));
  }

  private isBookingIntent(message: string): boolean {
    const bookingPatterns = [
      /book|schedule|appointment|meeting|session/i,
      /(when|what time|available|free) (can|could|is)/i,
      /check availability|book now|schedule now/i
    ];
    return bookingPatterns.some(pattern => pattern.test(message));
  }

  private isSearchIntent(message: string): boolean {
    const searchPatterns = [
      /(find|show|search|look for|need|want).*(consultant|consultancy|expert|advisor)/i,
      /(legal|finance|business|tech|healthcare|career) (consultant|help|advice)/i,
      /consultants? (in|for|under|with)/i
    ];
    return searchPatterns.some(pattern => pattern.test(message));
  }

  private extractSearchEntities(message: string) {
    const entities: any = {};
    
    // Category extraction
    const categories = ['legal', 'finance', 'business', 'tech', 'healthcare', 'career'];
    categories.forEach(cat => {
      if (message.includes(cat)) entities.category = cat;
    });

    // Budget extraction
    const budgetMatch = message.match(/under|below|less than|<\s*[₹$]?(\d+)/i);
    if (budgetMatch) entities.budget = parseInt(budgetMatch[1]);

    // Location extraction
    const locationMatch = message.match(/in\s+([a-zA-Z\s]+?)(?:\s|$|,)/i);
    if (locationMatch) entities.location = locationMatch[1].trim();

    // Mode extraction
    if (message.includes('online') || message.includes('remote')) entities.mode = 'online';
    if (message.includes('offline') || message.includes('person')) entities.mode = 'offline';

    return entities;
  }

  private extractBookingEntities(message: string) {
    const entities: any = {};
    
    // Time extraction
    const timePatterns = [
      /today|tomorrow|this week|next week/i,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /\d{1,2}:\d{2}|morning|afternoon|evening/i
    ];
    
    timePatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) entities.timeframe = match[0];
    });

    return entities;
  }

  private extractMemoryEntities(message: string) {
    const entities: any = {};
    
    if (message.includes('cheaper') || message.includes('less expensive')) {
      entities.budget = 'lower';
    }
    if (message.includes('better') || message.includes('higher rated')) {
      entities.quality = 'higher';
    }
    
    return entities;
  }

  private isComplexSearch(entities: any): boolean {
    // Complex if multiple filters or ambiguous requirements
    const filterCount = Object.keys(entities).length;
    return filterCount > 2 || entities.problem;
  }

  private isComplexBooking(message: string): boolean {
    // Complex if involves scheduling conflicts or specific requirements
    return message.includes('reschedule') || 
           message.includes('conflict') || 
           message.includes('specific time');
  }

  private isAmbiguous(message: string): boolean {
    const ambiguousPatterns = [
      /not sure|don't know|confused|help me decide/i,
      /what (should|would|do) i/i,
      /any (advice|suggestion|recommendation)/i,
      /guidance|direction|lost/i
    ];
    return ambiguousPatterns.some(pattern => pattern.test(message));
  }
}