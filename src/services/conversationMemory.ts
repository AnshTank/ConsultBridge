interface ConversationTurn {
  userMessage: string;
  botResponse: string;
  timestamp: Date;
  metadata?: any;
}

interface ConversationSummary {
  sessionId: string;
  userPreferences: {
    categories: string[];
    budget?: number;
    urgency: string;
    consultationType?: string;
  };
  mentionedTopics: string[];
  lastConsultancies: any[];
  conversationFlow: string[];
  keyPoints: string[];
}

export class ConversationMemory {
  private conversations: Map<string, ConversationTurn[]> = new Map();
  private summaries: Map<string, ConversationSummary> = new Map();

  addTurn(sessionId: string, userMessage: string, botResponse: string, metadata?: any) {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
    }
    
    this.conversations.get(sessionId)!.push({
      userMessage,
      botResponse,
      timestamp: new Date(),
      metadata
    });

    this.updateSummary(sessionId, userMessage, botResponse, metadata);
  }

  getRecentContext(sessionId: string, turns: number = 5): string {
    const conversation = this.conversations.get(sessionId) || [];
    const recent = conversation.slice(-turns);
    
    return recent.map(turn => 
      `User: ${turn.userMessage}\nBot: ${turn.botResponse}`
    ).join('\n\n');
  }

  getConversationSummary(sessionId: string): ConversationSummary | null {
    return this.summaries.get(sessionId) || null;
  }

  private updateSummary(sessionId: string, userMessage: string, botResponse: string, metadata?: any) {
    let summary = this.summaries.get(sessionId);
    
    if (!summary) {
      summary = {
        sessionId,
        userPreferences: {
          categories: [],
          urgency: 'low'
        },
        mentionedTopics: [],
        lastConsultancies: [],
        conversationFlow: [],
        keyPoints: []
      };
    }

    // Extract categories from metadata
    if (metadata?.suggestedCategory) {
      if (!summary.userPreferences.categories.includes(metadata.suggestedCategory)) {
        summary.userPreferences.categories.push(metadata.suggestedCategory);
      }
    }

    // Update consultancies
    if (metadata?.consultancies?.length > 0) {
      summary.lastConsultancies = metadata.consultancies;
    }

    // Track conversation flow
    if (metadata?.actionType) {
      summary.conversationFlow.push(metadata.actionType);
    }

    // Extract key topics from user message
    const topics = this.extractTopics(userMessage);
    topics.forEach(topic => {
      if (!summary.mentionedTopics.includes(topic)) {
        summary.mentionedTopics.push(topic);
      }
    });

    this.summaries.set(sessionId, summary);
  }

  private extractTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    const topicKeywords = {
      'legal': ['legal', 'lawyer', 'contract', 'law', 'attorney'],
      'business': ['business', 'startup', 'company', 'strategy'],
      'finance': ['finance', 'money', 'budget', 'investment'],
      'career': ['job', 'career', 'interview', 'resume'],
      'technology': ['tech', 'software', 'app', 'website'],
      'healthcare': ['health', 'medical', 'doctor', 'wellness']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  generateContextualReference(sessionId: string): string {
    const summary = this.summaries.get(sessionId);
    if (!summary) return '';

    const references: string[] = [];

    if (summary.userPreferences.categories.length > 0) {
      references.push(`You mentioned needing help with ${summary.userPreferences.categories.join(' and ')}`);
    }

    if (summary.lastConsultancies.length > 0) {
      references.push(`We found ${summary.lastConsultancies.length} consultants for you earlier`);
    }

    if (summary.mentionedTopics.length > 0) {
      const recentTopics = summary.mentionedTopics.slice(-2);
      references.push(`Based on our discussion about ${recentTopics.join(' and ')}`);
    }

    return references.length > 0 ? references[0] : '';
  }
}