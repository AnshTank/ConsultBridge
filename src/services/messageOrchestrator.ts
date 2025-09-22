import { IntelligentAgent } from "./intelligentAgent";
import { MemoryService } from "./memoryService";
import { BookingService } from "./bookingService";
import { ContextManager } from "./contextManager";
import { ConversationMemory } from "./conversationMemory";
import { ProcessingIndicator } from "./processingIndicator";
import { BookingFlowManager } from "./bookingFlowManager";

export class MessageOrchestrator {
  private intelligentAgent: IntelligentAgent;
  private memoryService: MemoryService;
  private bookingService: BookingService;
  private contextManager: ContextManager;
  private conversationMemory: ConversationMemory;
  private processingIndicator: ProcessingIndicator;
  private bookingFlowManager: BookingFlowManager;

  constructor() {
    this.intelligentAgent = new IntelligentAgent();
    this.memoryService = new MemoryService();
    this.bookingService = new BookingService();
    this.contextManager = new ContextManager();
    this.conversationMemory = new ConversationMemory();
    this.processingIndicator = new ProcessingIndicator();
    this.bookingFlowManager = new BookingFlowManager();
    
    // Clean up expired contexts every 10 minutes
    setInterval(() => {
      this.contextManager.cleanupExpiredContexts();
    }, 10 * 60 * 1000);
  }

  async processMessage(
    userMessage: string,
    userId?: string,
    sessionId?: string,
    onProgress?: (message: string) => void
  ): Promise<any> {
    const session =
      sessionId ||
      `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get or create conversation context
    let context = this.contextManager.getContext(session);
    if (!context) {
      context = this.contextManager.createContext(session, userId);
    }

    // Get conversation history and memory
    const conversationHistory = await this.memoryService.getConversationHistory(session);
    const conversationSummary = this.conversationMemory.getConversationSummary(session);
    const contextualReference = this.conversationMemory.generateContextualReference(session);

    console.log("🚀 Processing message with Enhanced Intelligent Agent:", userMessage);
    console.log("📊 Conversation Context:", {
      state: context.conversationState,
      categories: Array.from(context.categories),
      messageCount: context.messageCount,
      hasHistory: conversationHistory.length > 0
    });

    // Check if we're in a booking flow
    const isBookingFlow = context.conversationState === 'booking' || 
                         userMessage.toLowerCase().includes('book') ||
                         userMessage.toLowerCase().includes('appointment');

    let result: any;
    const needsProcessing = this.shouldShowProcessing(userMessage, context.conversationState);

    if (isBookingFlow) {
      // Handle booking flow
      const bookingResult = await this.bookingFlowManager.processBookingFlow(
        userMessage,
        context.currentIntent || 'initial',
        context.bookingData || {},
        context.consultancies || []
      );

      result = {
        response: bookingResult.response,
        actionType: bookingResult.nextState,
        consultancies: [],
        needsBooking: bookingResult.needsInput,
        nextSteps: [],
        awaitingConsent: false,
        confidence: 0.9,
        bookingData: bookingResult.bookingData,
        bookingOptions: bookingResult.options
      };
    } else {
      // Regular processing
      if (needsProcessing) {
        const { message: processingMsg, duration } = this.processingIndicator.getProcessingMessage(
          this.predictActionType(userMessage, conversationHistory)
        );
        
        result = await this.processingIndicator.executeWithProgress(
          `process_${session}`,
          processingMsg,
          duration,
          async () => {
            return await this.intelligentAgent.processUserMessage(
              userMessage,
              userId,
              session,
              conversationHistory,
              contextualReference
            );
          },
          onProgress
        );
      } else {
        result = await this.intelligentAgent.processUserMessage(
          userMessage,
          userId,
          session,
          conversationHistory,
          contextualReference
        );
      }
    }

    // Update context based on results
    this.contextManager.updateContext(session, {
      currentIntent: result.actionType,
      categories: new Set(result.suggestedCategory ? [result.suggestedCategory] : []),
      conversationState: this.determineConversationState(result.actionType, result.needsBooking),
      bookingData: result.bookingData || context.bookingData,
      consultancies: result.consultancies.length > 0 ? result.consultancies : context.consultancies
    });

    // Add consultancies to context if found
    if (result.consultancies.length > 0) {
      this.contextManager.addConsultancies(session, result.consultancies);
    }

    console.log("🎯 Enhanced Agent Result:", {
      confidence: result.confidence,
      actionType: result.actionType,
      consultanciesFound: result.consultancies.length,
      conversationState: context.conversationState
    });

    // Save to both memory service and conversation memory
    await this.memoryService.saveConversation(
      session,
      userMessage,
      result.response,
      userId,
      {
        consultancies: result.consultancies,
        actionType: result.actionType,
        confidence: result.confidence,
        nextSteps: result.nextSteps,
        awaitingConsent: result.awaitingConsent,
        suggestedCategory: result.suggestedCategory,
        bookingData: result.bookingData,
      }
    );

    // Update conversation memory for context tracking
    this.conversationMemory.addTurn(
      session,
      userMessage,
      result.response,
      {
        actionType: result.actionType,
        consultancies: result.consultancies,
        suggestedCategory: result.suggestedCategory
      }
    );

    // Format and clean the AI response
    let cleanedReply = this.formatResponse(result.response || "");

    // Get contextual suggestions
    const contextualSuggestions = this.contextManager.getContextualSuggestions(session);
    const conversationInsights = this.contextManager.getConversationInsights(session);

    const responseObj: any = {
      reply: cleanedReply,
      sessionId: session,
      consultancies: result.consultancies,
      needsBooking: result.needsBooking,
      nextSteps: result.nextSteps.length > 0 ? result.nextSteps : contextualSuggestions,
      confidence: result.confidence,
      actionType: result.actionType,
      awaitingConsent: result.awaitingConsent,
      suggestedCategory: result.suggestedCategory,
      chatHistory: await this.memoryService.getConversationHistory(session),
      conversationInsights,
      contextualSuggestions,
      contextualReference: contextualReference || null,
      hasProcessing: needsProcessing
    };
    
    if ("bookingData" in result && result.bookingData) {
      responseObj.bookingData = result.bookingData;
    }
    
    if ("bookingOptions" in result && result.bookingOptions) {
      responseObj.bookingOptions = result.bookingOptions;
    }
    
    return responseObj;
  }

  private determineConversationState(actionType: string, needsBooking: boolean): 'greeting' | 'searching' | 'booking' | 'clarifying' | 'completed' {
    switch (actionType) {
      case 'greeting':
        return 'greeting';
      case 'book':
      case 'booking_consultancy_selection':
      case 'booking_date_selection':
      case 'booking_time_selection':
      case 'booking_type_selection':
      case 'booking_confirmation':
      case 'booking_payment_method':
      case 'booking_processing':
        return 'booking';
      case 'search':
        return 'searching';
      case 'info':
      case 'clarification':
        return 'clarifying';
      case 'booking_completed':
        return 'completed';
      default:
        return needsBooking ? 'booking' : 'searching';
    }
  }

  private async handleAdvancedBooking(params: any): Promise<any> {
    try {
      const bookingRequest = {
        consultancyId: params.consultancyId,
        userId: params.userId,
        date: params.date,
        time: params.time,
        duration: params.duration || 60,
        type: params.type || "online",
        notes: params.notes,
      };

      const result = await this.bookingService.createBooking(bookingRequest);
      
      // Update context on successful booking
      if (result.success && params.sessionId) {
        this.contextManager.updateContext(params.sessionId, {
          conversationState: 'completed'
        });
      }
      
      return result;
    } catch (error) {
      console.error("Advanced booking error:", error);
      return { success: false, message: "Booking failed. Please try again." };
    }
  }

  // Method to get conversation analytics
  getConversationAnalytics(sessionId: string) {
    return this.contextManager.getConversationInsights(sessionId);
  }

  // Method to reset conversation context
  resetConversation(sessionId: string) {
    this.contextManager.clearContext(sessionId);
  }

  private shouldShowProcessing(message: string, conversationState: string): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Show processing for search requests
    if (lowerMessage.includes('find') || lowerMessage.includes('search') || 
        lowerMessage.includes('looking for') || lowerMessage.includes('need')) {
      return true;
    }
    
    // Show processing for booking requests
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || 
        lowerMessage.includes('schedule')) {
      return true;
    }
    
    // Show processing for complex problem-solving
    if (lowerMessage.includes('help me') || lowerMessage.includes('struggling') || 
        lowerMessage.includes('problem')) {
      return true;
    }
    
    return false;
  }

  private predictActionType(message: string, history: any[]): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) return 'booking';
    if (lowerMessage.includes('find') || lowerMessage.includes('search')) return 'search';
    if (lowerMessage.includes('help') || lowerMessage.includes('problem')) return 'problem_solving';
    
    return 'search';
  }

  private formatResponse(response: string): string {
    return response
      .replace(/^[\s\n]+/, "")
      .replace(/[\n]{2,}/g, "\n")
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/#{1,6}\s*(.*)/g, '<strong class="font-semibold text-gray-800">$1</strong>')
      .trim();
  }
}
