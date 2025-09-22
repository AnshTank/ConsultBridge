import { RecommendationEngine } from './recommendationEngine';

export class RuleBasedHandler {
  private recommendationEngine: RecommendationEngine;

  constructor(recommendationEngine: RecommendationEngine) {
    this.recommendationEngine = recommendationEngine;
  }

  async handleMessage(message: string, userId?: string, sessionId?: string): Promise<{
    response: string;
    consultancies?: any[];
    needsBooking?: boolean;
  }> {
    const lowerMessage = message.toLowerCase().trim();

    // Greeting responses - remove default messages, use intelligent responses
    if (this.isGreeting(lowerMessage)) {
      // Check if it's a simple "hello" vs more specific greeting
      if (lowerMessage === 'hello' || lowerMessage === 'hi' || lowerMessage === 'hey') {
        const casualResponses = [
          "Hey! What brings you here today?",
          "Hi! What can I help you with?",
          "Hello! Looking for some expert advice?",
          "Hey there! What's on your mind?"
        ];
        return {
          response: casualResponses[Math.floor(Math.random() * casualResponses.length)]
        };
      } else {
        const contextualResponses = [
          "Good to see you! What kind of expertise are you looking for?",
          "Welcome! Tell me what challenge you're facing.",
          "Great to meet you! What area do you need consultation in?"
        ];
        return {
          response: contextualResponses[Math.floor(Math.random() * contextualResponses.length)]
        };
      }
    }

    // Website explanation - enhanced patterns
    if (this.isWebsiteQuery(lowerMessage)) {
      return {
        response: "ConsultBridge is India's premier consultation platform! 🇮🇳\n\n✨ What we offer:\n• 500+ verified consultants across 10+ categories\n• Legal, Finance, Business, Tech, Healthcare & more\n• Online & offline consultations\n• Transparent pricing & genuine reviews\n• Easy booking & secure payments\n\nWhat type of expert are you looking for?"
      };
    }

    // Service inquiry
    if (this.isServiceQuery(lowerMessage)) {
      return {
        response: "Our consultation categories:\n\n⚖️ Legal Advisory - Lawyers, Legal Advisors\n💰 Financial Services - Financial Planners, Tax Experts\n📈 Business Strategy - Strategy, Marketing, HR\n💻 Technology - IT, Software, Digital Solutions\n💆 Health & Wellness - Doctors, Wellness Experts\n📖 Career Consultation - Career Counselors\n🏡 Real Estate & Housing - Property Advisors\n\nWhich area interests you?"
      };
    }

    // How are you doing responses
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how you doing')) {
      const responses = [
        "I'm doing great, thanks for asking! Ready to help you find amazing consultants. What do you need assistance with?",
        "Fantastic! I'm here and excited to help you connect with the perfect consultant. What's your consultation need?",
        "I'm wonderful, thank you! Let's focus on finding you the right expert. What area do you need help with?"
      ];
      return {
        response: responses[Math.floor(Math.random() * responses.length)]
      };
    }

    // Category-based search
    const category = this.extractCategory(lowerMessage);
    if (category) {
      console.log('Searching for category:', category);
      const consultancies = await this.recommendationEngine.searchConsultancies({ category });
      console.log('Found consultancies:', consultancies.length);
      
      if (consultancies.length > 0) {
        const suggestions = consultancies.slice(0, 3).map((c: any, i: number) => 
          `${i + 1}. ${c.name} - ${c.category}\n   ${c.description?.substring(0, 100) || 'Professional consultation services'}...`
        ).join('\n\n');

        return {
          response: `🎯 Perfect! I found ${consultancies.length} excellent ${category} consultants ready to help you:\n\n${suggestions}\n\n✨ What makes them special:\n• Verified professionals with proven expertise\n• Real client reviews and transparent pricing\n• Flexible online/offline consultation options\n• Quick response times and professional service\n\n💼 Ready to connect? Click on any consultant above to view their full profile, check availability, and book your consultation instantly!`,
          consultancies: consultancies.slice(0, 3)
        };
      } else {
        // Fallback search without strict category matching
        const fallbackSearch = await this.recommendationEngine.searchConsultancies({ query: lowerMessage });
        if (fallbackSearch.length > 0) {
          const suggestions = fallbackSearch.slice(0, 3).map((c: any, i: number) => 
            `${i + 1}. ${c.name} - ${c.category}\n   ${c.description?.substring(0, 100) || 'Professional consultation services'}...`
          ).join('\n\n');
          
          return {
            response: `🔍 I found these consultants that might help with your ${category} needs:\n\n${suggestions}\n\nWould you like to explore these options?`,
            consultancies: fallbackSearch.slice(0, 3)
          };
        }
        
        return {
          response: `I'm actively searching our network of ${category} consultants for you. Let me try a broader search or suggest some related categories that might help:\n\n🔍 Alternative suggestions:\n• Try "Technology consulting" or "IT services"\n• Browse our Business Strategy experts\n• Check out Digital Marketing specialists\n\nWould you like me to show consultants from related categories, or do you have a specific ${category} need I can help refine?`
        };
      }
    }

    // Simple booking request
    if (lowerMessage.includes('book') && (lowerMessage.includes('appointment') || lowerMessage.includes('consultation'))) {
      return {
        response: "I'd be happy to help you book an appointment! What type of consultant do you need?\n\n• Technology & IT\n• Legal Advisory\n• Business Strategy\n• Financial Services\n• Health & Wellness\n• Career Consultation\n\nJust tell me the category and I'll find the best experts for you!",
        needsBooking: true
      };
    }

    // Help request
    if (lowerMessage.includes('help')) {
      return {
        response: "I can help you with:\n• Finding consultants by category (legal, finance, business, tech, healthcare)\n• Booking appointments\n• Viewing your past consultations\n• Getting recommendations based on your needs\n\nWhat would you like to do?"
      };
    }

    // Intelligent default response based on message content
    if (lowerMessage.length < 10) {
      return {
        response: "Could you tell me more about what you need help with? I can connect you with experts in various fields."
      };
    }
    
    return {
      response: `I understand you're looking for assistance. Based on what you've mentioned, I can help you find consultants in areas like legal, business, technology, finance, or healthcare. What specific challenge are you facing?`
    };
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => message.startsWith(greeting) || message === greeting);
  }

  private extractCategory(message: string): string | null {
    const categories = {
      'Technology': ['tech', 'technology', 'software', 'it', 'digital', 'app', 'website', 'development', 'cybersecurity', 'programming', 'coding'],
      'Legal Advisory': ['legal', 'law', 'lawyer', 'attorney', 'court', 'litigation', 'contract', 'dispute', 'compliance', 'intellectual property'],
      'Financial Services': ['finance', 'financial', 'money', 'investment', 'accounting', 'tax', 'loan', 'insurance', 'banking', 'wealth'],
      'Business Strategy': ['business', 'startup', 'company', 'management', 'strategy', 'marketing', 'hr', 'operations', 'consulting'],
      'Health & Wellness': ['health', 'medical', 'doctor', 'healthcare', 'wellness', 'therapy', 'nutrition', 'fitness', 'mental health'],
      'Career Consultation': ['education', 'career', 'training', 'coaching', 'tutoring', 'skill development', 'certification'],
      'Real Estate & Housing': ['real estate', 'property', 'housing', 'investment property', 'commercial property']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return category;
      }
    }

    return null;
  }

  private isWebsiteQuery(message: string): boolean {
    const patterns = [
      /what\s+(is|are)\s+(this|consultbridge|the\s+website)/,
      /tell\s+me\s+about\s+(this|consultbridge)/,
      /how\s+does\s+(this|it|consultbridge)\s+work/,
      /what\s+do\s+you\s+do/
    ];
    return patterns.some(pattern => pattern.test(message));
  }

  private isServiceQuery(message: string): boolean {
    const patterns = [
      /what\s+services/,
      /what\s+categories/,
      /what\s+types?\s+of\s+(consultants?|experts?)/,
      /show\s+me\s+(all\s+)?(categories|services)/,
      /list\s+(all\s+)?(categories|services)/
    ];
    return patterns.some(pattern => pattern.test(message));
  }
}