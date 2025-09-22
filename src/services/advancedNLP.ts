export class AdvancedNLP {
  private categoryKeywords = {
    legal: {
      primary: ['legal', 'law', 'lawyer', 'attorney', 'advocate', 'counsel', 'litigation', 'court', 'judge', 'case'],
      secondary: ['contract', 'agreement', 'dispute', 'sue', 'lawsuit', 'rights', 'compliance', 'regulation', 'legal advice', 'legal help'],
      contexts: ['divorce', 'criminal', 'corporate', 'property', 'intellectual', 'employment', 'immigration', 'family law', 'business law']
    },
    business: {
      primary: ['business', 'startup', 'company', 'entrepreneur', 'strategy', 'management', 'consulting', 'business plan', 'business advice'],
      secondary: ['growth', 'planning', 'operations', 'marketing', 'sales', 'revenue', 'profit', 'expansion', 'business development', 'strategy consulting'],
      contexts: ['small business', 'scaling', 'funding', 'investment', 'partnership', 'acquisition', 'business model', 'market analysis']
    },
    finance: {
      primary: ['finance', 'financial', 'money', 'investment', 'accounting', 'tax', 'banking', 'financial planning', 'financial advice'],
      secondary: ['budget', 'loan', 'credit', 'debt', 'savings', 'insurance', 'wealth', 'portfolio', 'financial consultant', 'tax planning'],
      contexts: ['retirement', 'mortgage', 'trading', 'crypto', 'stocks', 'mutual funds', 'personal finance', 'corporate finance']
    },
    technology: {
      primary: ['tech', 'technology', 'software', 'app', 'website', 'digital', 'it', 'development', 'tech consulting', 'it support'],
      secondary: ['coding', 'programming', 'database', 'cloud', 'security', 'ai', 'automation', 'tech advice', 'software development'],
      contexts: ['mobile app', 'web development', 'cybersecurity', 'data science', 'blockchain', 'digital transformation', 'tech strategy']
    },
    healthcare: {
      primary: ['health', 'medical', 'doctor', 'healthcare', 'wellness', 'therapy', 'treatment', 'health advice', 'medical consultation'],
      secondary: ['diagnosis', 'medicine', 'hospital', 'clinic', 'patient', 'symptoms', 'disease', 'health consultant', 'medical advice'],
      contexts: ['mental health', 'nutrition', 'fitness', 'alternative medicine', 'pediatric', 'preventive care', 'health planning']
    },
    career: {
      primary: ['career', 'job', 'employment', 'work', 'profession', 'career advice', 'career guidance', 'career coaching'],
      secondary: ['resume', 'interview', 'promotion', 'skills', 'training', 'development', 'job search', 'career change'],
      contexts: ['career planning', 'professional development', 'job hunting', 'career transition', 'workplace issues']
    }
  };

  private urgencyIndicators = {
    high: ['urgent', 'asap', 'immediately', 'right now', 'today', 'emergency', 'critical', 'need now', 'time sensitive', 'deadline'],
    medium: ['quickly', 'fast', 'soon', 'this week', 'within days', 'as soon as possible', 'priority'],
    low: ['eventually', 'when possible', 'no rush', 'flexible', 'sometime', 'future']
  };

  private budgetPatterns = [
    /under\s*[\$₹]?(\d+)/i,
    /below\s*[\$₹]?(\d+)/i,
    /less\s+than\s*[\$₹]?(\d+)/i,
    /budget\s*of\s*[\$₹]?(\d+)/i,
    /around\s*[\$₹]?(\d+)/i,
    /approximately\s*[\$₹]?(\d+)/i
  ];

  private experiencePatterns = [
    /(\d+)\s*years?\s*experience/i,
    /experienced/i,
    /expert/i,
    /senior/i,
    /qualified/i,
    /certified/i,
    /professional/i
  ];

  analyzeUserIntent(message: string, conversationHistory: any[] = []): {
    categories: string[];
    urgency: 'low' | 'medium' | 'high';
    budget?: number;
    experienceLevel?: string;
    specificNeeds: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    actionType: 'search' | 'book' | 'info' | 'greeting' | 'complaint';
  } {
    const lowerMessage = message.toLowerCase();
    
    // Analyze categories with confidence scoring
    const categories = this.extractCategories(lowerMessage);
    
    // Detect urgency
    const urgency = this.detectUrgency(lowerMessage);
    
    // Extract budget
    const budget = this.extractBudget(lowerMessage);
    
    // Detect experience requirements
    const experienceLevel = this.detectExperienceLevel(lowerMessage);
    
    // Extract specific needs
    const specificNeeds = this.extractSpecificNeeds(lowerMessage);
    
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(lowerMessage);
    
    // Determine action type
    const actionType = this.determineActionType(lowerMessage, conversationHistory);
    
    // Calculate overall confidence
    const confidence = this.calculateConfidence(categories, actionType, specificNeeds);
    
    return {
      categories,
      urgency,
      budget,
      experienceLevel,
      specificNeeds,
      sentiment,
      confidence,
      actionType
    };
  }

  private extractCategories(message: string): string[] {
    const foundCategories: { category: string; score: number }[] = [];
    
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      let score = 0;
      
      // Primary keywords (high weight)
      keywords.primary.forEach(keyword => {
        if (message.includes(keyword)) score += 10;
      });
      
      // Secondary keywords (medium weight)
      keywords.secondary.forEach(keyword => {
        if (message.includes(keyword)) score += 5;
      });
      
      // Context keywords (low weight)
      keywords.contexts.forEach(context => {
        if (message.includes(context)) score += 3;
      });
      
      if (score > 0) {
        foundCategories.push({ category, score });
      }
    }
    
    // Sort by score and return top categories
    return foundCategories
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(item => item.category);
  }

  private detectUrgency(message: string): 'low' | 'medium' | 'high' {
    const lowerMessage = message.toLowerCase();
    
    // Check for high urgency indicators
    if (this.urgencyIndicators.high.some(indicator => lowerMessage.includes(indicator))) {
      return 'high';
    }
    
    // Check for medium urgency indicators
    if (this.urgencyIndicators.medium.some(indicator => lowerMessage.includes(indicator))) {
      return 'medium';
    }
    
    // Check for low urgency indicators
    if (this.urgencyIndicators.low.some(indicator => lowerMessage.includes(indicator))) {
      return 'low';
    }
    
    // Default based on context
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
      return 'medium';
    }
    
    return 'low';
  }

  private extractBudget(message: string): number | undefined {
    for (const pattern of this.budgetPatterns) {
      const match = message.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return undefined;
  }

  private detectExperienceLevel(message: string): string | undefined {
    for (const pattern of this.experiencePatterns) {
      const match = message.match(pattern);
      if (match) {
        if (match[1]) return `${match[1]} years`;
        return 'experienced';
      }
    }
    return undefined;
  }

  private extractSpecificNeeds(message: string): string[] {
    const needs: string[] = [];
    
    // Enhanced problem indicators
    const problemPatterns = [
      /having\s+(trouble|issues?|problems?|difficulties?)\s+with\s+(.+)/i,
      /need\s+help\s+with\s+(.+)/i,
      /struggling\s+with\s+(.+)/i,
      /facing\s+(challenges?|issues?|problems?)\s+with\s+(.+)/i,
      /looking\s+for\s+help\s+with\s+(.+)/i,
      /require\s+assistance\s+with\s+(.+)/i
    ];
    
    problemPatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) {
        const need = match[match.length - 1]; // Get the last capture group
        if (need && need.trim().length > 2) {
          needs.push(need.trim());
        }
      }
    });
    
    // Enhanced service type indicators
    const servicePatterns = [
      /consultation\s+for\s+(.+)/i,
      /advice\s+on\s+(.+)/i,
      /guidance\s+(with|on|for)\s+(.+)/i,
      /help\s+me\s+(with\s+)?(.+)/i,
      /expert\s+in\s+(.+)/i,
      /consultant\s+for\s+(.+)/i,
      /looking\s+for\s+(.+?)\s+(consultant|expert|advice|help)/i
    ];
    
    servicePatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) {
        const need = match[match.length - 1]; // Get the last meaningful capture group
        if (need && need.trim().length > 2 && !['consultant', 'expert', 'advice', 'help'].includes(need.toLowerCase())) {
          needs.push(need.trim());
        }
      }
    });
    
    // Remove duplicates and filter out common words
    const filteredNeeds = [...new Set(needs)]
      .filter(need => need.length > 2 && !['with', 'for', 'on', 'in', 'the', 'and', 'or'].includes(need.toLowerCase()))
      .slice(0, 3); // Limit to top 3 needs
    
    return filteredNeeds;
  }

  private analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'perfect', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointed', 'frustrated', 'angry'];
    
    const positiveCount = positiveWords.filter(word => message.includes(word)).length;
    const negativeCount = negativeWords.filter(word => message.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private determineActionType(message: string, history: any[]): 'search' | 'book' | 'info' | 'greeting' | 'complaint' {
    const lowerMessage = message.toLowerCase().trim();
    
    // Enhanced greeting patterns
    if (/^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings|howdy)/i.test(lowerMessage)) {
      return 'greeting';
    }
    
    // Enhanced booking patterns
    if (/\b(book|schedule|appointment|meeting|available|when\s+can|reserve|consultation|session|call|meet)\b/i.test(lowerMessage)) {
      return 'book';
    }
    
    // Enhanced information patterns
    if (/\b(what|how|tell\s+me|explain|information|about|describe|details|learn\s+about)\b/i.test(lowerMessage)) {
      // But not if it's clearly a search request
      if (!/\b(need|looking\s+for|find|search|help\s+with|consultant|expert)\b/i.test(lowerMessage)) {
        return 'info';
      }
    }
    
    // Enhanced complaint patterns
    if (/\b(problem|issue|complaint|disappointed|frustrated|not\s+working|error|bug|wrong|bad\s+experience)\b/i.test(lowerMessage)) {
      return 'complaint';
    }
    
    // Support/help patterns
    if (/\b(help\s+me|struggling|having\s+trouble|difficult|challenge|stuck|confused)\b/i.test(lowerMessage)) {
      return 'search'; // Treat as search with empathy
    }
    
    // Default to search for consultation requests
    return 'search';
  }

  private calculateConfidence(categories: string[], actionType: string, specificNeeds: string[]): number {
    let confidence = 0.4; // Base confidence
    
    // Category detection confidence (stronger weight)
    if (categories.length > 0) confidence += 0.3;
    if (categories.length > 1) confidence += 0.15;
    
    // Action type confidence (clear intent)
    if (actionType === 'greeting') confidence += 0.25;
    else if (actionType === 'book') confidence += 0.2;
    else if (actionType === 'info') confidence += 0.15;
    else if (actionType !== 'search') confidence += 0.1;
    
    // Specific needs confidence
    if (specificNeeds.length > 0) confidence += 0.15;
    if (specificNeeds.length > 1) confidence += 0.1;
    
    // Boost confidence for clear patterns
    if (categories.length > 0 && specificNeeds.length > 0) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }

  generateSmartResponse(analysis: any, consultancies: any[]): string {
    const { categories, urgency, budget, experienceLevel, specificNeeds, sentiment, actionType } = analysis;
    
    let response = '';
    
    // Enhanced greeting response
    if (actionType === 'greeting') {
      const greetings = [
        "Hi there! I'm Shaan, your AI consultant finder at ConsultBridge. I help connect you with verified experts across Legal, Business, Finance, Technology, and Healthcare. What can I help you with today? 🚀",
        "Hello! Welcome to ConsultBridge! I'm Shaan, and I specialize in matching you with top-rated consultants. Whether you need legal advice, business strategy, or any other expertise - just tell me what you're looking for! 💼",
        "Hey! Great to meet you! I'm Shaan, your personal consultant finder. I have access to hundreds of verified experts ready to help. What brings you here today? 🎯"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Enhanced urgency-based opening
    if (urgency === 'high') {
      response += "🚨 I understand this is urgent! Let me prioritize finding you immediate help. ";
    } else if (urgency === 'medium') {
      response += "⚡ I'll help you find the right expert quickly! ";
    } else {
      response += "Perfect! Let me find you the ideal consultant. ";
    }
    
    // Enhanced category-specific response
    if (categories.length > 0) {
      const categoryText = categories.join(' and ');
      response += `I found excellent ${categoryText} consultants for you! `;
      
      if (consultancies.length > 0) {
        response += `Here are the top ${Math.min(consultancies.length, 3)} experts I recommend:\n\n`;
        
        consultancies.slice(0, 3).forEach((consultant, i) => {
          response += `${i + 1}. **${consultant.name}** - ${consultant.category}\n`;
          response += `   ⭐ ${consultant.rating || 'New'} rating | 💰 ₹${consultant.price || consultant.pricing?.hourlyRate || 'Contact for pricing'}${consultant.pricing?.hourlyRate ? '/hr' : ''}\n`;
          response += `   📍 ${consultant.location || 'Multiple locations'}\n`;
          if (consultant.description) {
            response += `   📝 ${consultant.description.substring(0, 100)}...\n`;
          }
          response += '\n';
        });
        
        // Enhanced budget consideration
        if (budget) {
          const withinBudget = consultancies.filter(c => {
            const rate = c.pricing?.hourlyRate || (c.price ? parseInt(c.price.replace(/[^\d]/g, '')) : null);
            return rate && rate <= budget;
          }).length;
          if (withinBudget > 0) {
            response += `💡 Great news! ${withinBudget} consultant${withinBudget > 1 ? 's are' : ' is'} within your ₹${budget} budget!\n\n`;
          } else {
            response += `💰 I've found consultants near your ₹${budget} budget range.\n\n`;
          }
        }
        
        // Experience consideration
        if (experienceLevel) {
          response += `🎯 I've prioritized ${experienceLevel} professionals for you.\n\n`;
        }
        
        // Specific needs acknowledgment
        if (specificNeeds.length > 0) {
          response += `📋 I understand you need help with: ${specificNeeds.join(', ')}\n\n`;
        }
        
        response += "🚀 **Ready to proceed?**\n";
        response += "• Click any consultant above to view their full profile\n";
        response += "• Check availability and book instantly\n";
        response += "• Read reviews from previous clients\n";
        response += "• Compare pricing and expertise\n\n";
        
        if (urgency === 'high') {
          response += "⏰ Given the urgency, I recommend booking immediately with your preferred consultant!";
        } else {
          response += "Which consultant catches your interest? I can provide more details about any of them!";
        }
      }
    } else {
      // Enhanced no category response
      response += "I'm here to help you find the perfect consultant! To give you the best recommendations, could you tell me more about what you need help with?\n\n";
      response += "🏢 **I specialize in:**\n";
      response += "• Legal - Contracts, disputes, compliance\n";
      response += "• Business - Strategy, operations, growth\n";
      response += "• Finance - Planning, investments, taxes\n";
      response += "• Technology - Development, IT, digital solutions\n";
      response += "• Healthcare - Medical advice, wellness\n";
      response += "• Career - Job search, professional development\n\n";
      response += "Just describe your situation, and I'll find the right expert for you!";
    }
    
    return response;
  }

  // Enhanced method for better context understanding
  analyzeConversationFlow(currentMessage: string, history: any[]): {
    isFollowUp: boolean;
    contextCategory?: string;
    previousIntent?: string;
    needsClarification: boolean;
  } {
    if (history.length === 0) {
      return {
        isFollowUp: false,
        needsClarification: false
      };
    }

    const lastExchange = history[history.length - 1];
    const lastUserMessage = lastExchange?.userMessage?.toLowerCase() || '';
    const lastBotResponse = lastExchange?.botResponse?.toLowerCase() || '';
    
    // Check if current message is a follow-up
    const followUpIndicators = ['yes', 'no', 'okay', 'sure', 'that one', 'the first', 'book', 'more info'];
    const isFollowUp = followUpIndicators.some(indicator => 
      currentMessage.toLowerCase().includes(indicator)
    ) && currentMessage.length < 50;

    // Extract context from previous conversation
    let contextCategory;
    for (const [category] of Object.entries(this.categoryKeywords)) {
      if (lastBotResponse.includes(category) || lastUserMessage.includes(category)) {
        contextCategory = category;
        break;
      }
    }

    // Determine if clarification is needed
    const needsClarification = currentMessage.length < 10 || 
      ['what', 'huh', 'unclear', 'explain'].some(word => 
        currentMessage.toLowerCase().includes(word)
      );

    return {
      isFollowUp,
      contextCategory,
      needsClarification
    };
  }
}