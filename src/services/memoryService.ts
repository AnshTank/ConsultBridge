import connectDB from '../lib/mongodb';
import ChatSession from '../models/ChatSession';
import Appointment from '../models/Appointment';

export class MemoryService {
  async saveConversation(
    sessionId: string, 
    userMessage: string, 
    botResponse: string, 
    userId?: string,
    metadata?: any
  ): Promise<void> {
    try {
      await connectDB();
      
      const userMsg = {
        sender: 'user' as const,
        text: userMessage,
        timestamp: new Date()
      };
      
      const botMsg = {
        sender: 'bot' as const,
        text: botResponse,
        timestamp: new Date(),
        metadata
      };

      await ChatSession.findOneAndUpdate(
        { sessionId },
        {
          $push: { 
            chatHistory: { $each: [userMsg, botMsg] }
          },
          $set: { 
            userId,
            lastActivity: new Date()
          }
        },
        { 
          upsert: true, 
          new: true 
        }
      );
    } catch (error) {
      console.error('Memory service save error:', error);
    }
  }

  async getConversationHistory(sessionId: string): Promise<any[]> {
    try {
      await connectDB();
      
      const session = await ChatSession.findOne({ sessionId });
      return session?.chatHistory || [];
    } catch (error) {
      console.error('Memory service get error:', error);
      return [];
    }
  }

  async getPastConversations(userId: string): Promise<{
    recentBookings: any[];
    preferences: any;
    conversationSummary: string;
  }> {
    try {
      await connectDB();
      
      // Get recent appointments
      const recentBookings = await Appointment.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('consultancyId');

      // Get conversation patterns
      const sessions = await ChatSession.find({ userId })
        .sort({ lastActivity: -1 })
        .limit(10);

      // Extract preferences from conversation history
      const preferences = this.extractPreferences(sessions);
      
      // Create conversation summary
      const conversationSummary = this.createConversationSummary(sessions, recentBookings);

      return {
        recentBookings,
        preferences,
        conversationSummary
      };
    } catch (error) {
      console.error('Past conversations error:', error);
      return {
        recentBookings: [],
        preferences: {},
        conversationSummary: 'No previous conversation history found.'
      };
    }
  }

  private extractPreferences(sessions: any[]): any {
    const preferences: any = {
      preferredCategories: [],
      communicationStyle: 'neutral',
      bookingPreferences: {}
    };

    // Analyze conversation patterns
    sessions.forEach(session => {
      session.chatHistory?.forEach((msg: any) => {
        if (msg.sender === 'user') {
          // Extract category preferences
          const categories = ['legal', 'finance', 'business', 'tech', 'healthcare'];
          categories.forEach(cat => {
            if (msg.text.toLowerCase().includes(cat)) {
              if (!preferences.preferredCategories.includes(cat)) {
                preferences.preferredCategories.push(cat);
              }
            }
          });
        }
      });
    });

    return preferences;
  }

  private createConversationSummary(sessions: any[], recentBookings: any[]): string {
    if (sessions.length === 0 && recentBookings.length === 0) {
      return 'This is your first conversation with me.';
    }

    let summary = '';
    
    if (recentBookings.length > 0) {
      const lastBooking = recentBookings[0];
      summary += `Your last booking was with ${lastBooking.consultancyId?.name || 'a consultancy'} for ${lastBooking.consultancyId?.category || 'consultation'}. `;
    }

    if (sessions.length > 0) {
      const totalMessages = sessions.reduce((sum, session) => sum + (session.chatHistory?.length || 0), 0);
      summary += `We've had ${sessions.length} conversation sessions with ${totalMessages} messages total.`;
    }

    return summary;
  }

  async updateConversationMemory(sessionId: string, memoryUpdate: any): Promise<void> {
    try {
      await connectDB();
      
      await ChatSession.findOneAndUpdate(
        { sessionId },
        { $set: { conversationMemory: memoryUpdate } },
        { upsert: true }
      );
    } catch (error) {
      console.error('Memory update error:', error);
    }
  }
}