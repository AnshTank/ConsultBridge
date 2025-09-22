import { GoogleGenerativeAI } from "@google/generative-ai";
import { IntentRecognition, Intent } from "./intentRecognition";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not found, AI features will be limited");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;
const intentRecognizer = new IntentRecognition();

export interface AgentTools {
  searchConsultancies: (params: any) => Promise<any>;
  getPastConversations: (userId: string) => Promise<any>;
  createBooking: (params: any) => Promise<any>;
  getConsultancyById: (id: string) => Promise<any>;
}

export interface AgentContext {
  userMessage: string;
  userId?: string;
  sessionId: string;
  conversationHistory: any[];
  tools: AgentTools;
  intent?: Intent;
  userPreferences?: any;
}

export class AIAgent {
  private tools: AgentTools;

  constructor(tools: AgentTools) {
    this.tools = tools;
  }

  async processQuery(context: AgentContext): Promise<{
    response: string;
    actions?: any[];
    consultancies?: any[];
    needsBooking?: boolean;
    nextSteps?: string[];
  }> {
    // Recognize intent if not provided
    const intent =
      context.intent ||
      intentRecognizer.recognizeIntent(
        context.userMessage,
        context.conversationHistory
      );

    // Handle based on intent type
    switch (intent.type) {
      case "problem":
        return await this.handleProblemStatement(context, intent);
      case "memory":
        return await this.handleMemoryReference(context, intent);
      case "booking":
        return await this.handleBookingIntent(context, intent);
      case "search":
        return await this.handleSearchIntent(context, intent);
      case "clarification":
        return await this.handleClarification(context, intent);
      default:
        return await this.handleGeneralQuery(context, intent);
    }
  }

  private async handleProblemStatement(context: AgentContext, intent: Intent) {
    if (!model) return this.fallbackResponse(context);

    const prompt =
      `You are Shaan, assistant for ConsultBridge (a consultancy marketplace).\n\n` +
      `Rules:\n` +
      `- Do NOT invent or mention specific consultant names.\n` +
      `- Base suggestions on ConsultBridge listings only (the system will attach platform suggestions).\n` +
      `- Focus on guidance, criteria (e.g., higher-rated, budget fit), and next steps.\n\n` +
      `User problem: "${context.userMessage}"\n` +
      `Task: Map the problem to likely categories, provide an empathetic, concise plan, and clear next steps. Refer generically to "the consultants listed below" rather than naming any.`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Extract category from problem
      const category = this.extractCategoryFromProblem(context.userMessage);
      const consultancies = await this.tools.searchConsultancies({ category });

      return {
        response: this.formatProblemResponse(response, consultancies),
        consultancies: consultancies.slice(0, 3),
        nextSteps: ["View Profile", "Book Consultation", "Ask More Questions"],
      };
    } catch (error) {
      return this.fallbackResponse(context);
    }
  }

  private async handleMemoryReference(context: AgentContext, intent: Intent) {
    const pastData = await this.tools.getPastConversations(
      context.userId || ""
    );

    if (pastData.recentBookings.length === 0) {
      return {
        response:
          "I don't see any previous bookings in your history. Would you like me to help you find a consultant for your needs?",
        nextSteps: ["Search Consultants", "Browse Categories"],
      };
    }

    const lastBooking = pastData.recentBookings[0];
    let searchParams: any = { category: lastBooking.consultancyId?.category };

    // Apply memory entities (cheaper, better, etc.)
    if (intent.entities.budget === "lower") {
      searchParams.budget =
        lastBooking.consultancyId?.pricing?.hourlyRate * 0.8;
    }

    const consultancies = await this.tools.searchConsultancies(searchParams);

    return {
      response: `Based on your previous booking with ${lastBooking.consultancyId?.name}, I found similar consultants that might interest you:`,
      consultancies: consultancies.slice(0, 3),
      nextSteps: ["View Profile", "Compare Options", "Book Now"],
    };
  }

  private async handleBookingIntent(context: AgentContext, intent: Intent) {
    // Check if specific consultancy mentioned in conversation
    const recentConsultancies = this.extractRecentConsultancies(
      context.conversationHistory
    );

    if (recentConsultancies.length === 0) {
      return {
        response:
          "I'd be happy to help you book an appointment! First, let me know which consultant you'd like to book with, or I can help you find one.",
        nextSteps: ["Search Consultants", "Browse Categories"],
      };
    }

    const consultancy = recentConsultancies[0];
    return {
      response: `Great! I can help you book with ${consultancy.name}. They offer ${consultancy.category} consultation. What date and time works best for you?`,
      consultancies: [consultancy],
      needsBooking: true,
      nextSteps: ["Choose Date", "Select Time", "Confirm Booking"],
    };
  }

  private async handleSearchIntent(context: AgentContext, intent: Intent) {
    const consultancies = await this.tools.searchConsultancies(intent.entities);

    if (consultancies.length === 0) {
      return {
        response: `I couldn't find consultants matching your exact criteria. Let me suggest some alternatives or help you refine your search.`,
        nextSteps: ["Broaden Search", "Try Different Category", "Browse All"],
      };
    }

    return {
      response: this.formatSearchResults(consultancies, intent.entities),
      consultancies: consultancies.slice(0, 3),
      nextSteps: ["View Profile", "Book Consultation", "See More Options"],
    };
  }

  private async handleClarification(context: AgentContext, intent: Intent) {
    if (!model) {
      return {
        response:
          "I'm here to help! Are you looking for legal, business, finance, tech, or healthcare consultation?",
        nextSteps: ["Legal", "Business", "Finance", "Tech", "Healthcare"],
      };
    }

    const prompt =
      `You are Shaan, assistant for ConsultBridge.\n\n` +
      `Rules:\n` +
      `- Do NOT invent or mention any consultant names.\n` +
      `- Keep responses concise, ask 1-2 targeted clarifying questions.\n` +
      `- Reference platform suggestions generically ("the options below") if needed.\n\n` +
      `User message: "${context.userMessage}"\n` +
      `Task: Ask clarifying questions to understand their needs better and propose next steps.`;

    try {
      const result = await model.generateContent(prompt);
      return {
        response: result.response.text(),
        nextSteps: [
          "Legal Help",
          "Business Advice",
          "Financial Planning",
          "Tech Support",
        ],
      };
    } catch (error) {
      return this.fallbackResponse(context);
    }
  }

  private async handleGeneralQuery(context: AgentContext, intent: Intent) {
    // Check if it's a greeting
    const isGreeting = /^(hi|hello|hey|good\s+(morning|afternoon|evening))\b/i.test(context.userMessage.trim());
    
    if (isGreeting) {
      const greetings = [
        "Hi there! I'm Shaan, your ConsultBridge assistant. What kind of consultation are you looking for today?",
        "Hello! Ready to find the perfect consultant? Tell me what you need help with!",
        "Hey! I'm here to connect you with top consultants. What's on your mind?",
        "Hi! Looking for expert advice? I can help you find the right consultant for your needs.",
        "Hello! Welcome to ConsultBridge! I'm Shaan, and I'm excited to help you find amazing consultants. What area do you need assistance with?",
        "Hey there! I'm Shaan, your personal consultant finder. What type of expertise are you looking for?"
      ];
      
      return {
        response: greetings[Math.floor(Math.random() * greetings.length)],
        nextSteps: ["Legal Help", "Business Advice", "Finance", "Tech Support", "Healthcare"],
      };
    }

    // If Gemini is available, generate a tailored response
    if (model) {
      try {
        const prompt =
          `You are Shaan, assistant for ConsultBridge (consultancy marketplace). \n\n` +
          `User message: "${context.userMessage}"\n` +
          `Rules: Do NOT invent consultant names; never list external firms; keep it concise and varied.\n` +
          `Task: Provide a helpful, varied response. Infer likely category needs if any, and suggest how to proceed. Refer to platform suggestions generically.`;

        const result = await model.generateContent(prompt);
        const aiText = result.response.text();

        // Try to suggest top consultancies broadly if none inferred
        const consultancies = await context.tools.searchConsultancies({
          query: context.userMessage,
          category: undefined,
        });

        return {
          response: aiText,
          consultancies: consultancies.slice(0, 3),
          nextSteps: ["View Profile", "Book Consultation", "See More Options"],
        };
      } catch (_) {
        // fall through to static response
      }
    }

    // Fallback varied responses
    const fallbacks = [
      "I'm here to help you find the perfect consultant! What type of expertise do you need?",
      "Looking for professional advice? I can connect you with top-rated consultants. What area interests you?",
      "Ready to find expert help? Tell me what kind of consultation you're looking for!",
      "I can help you discover amazing consultants across various fields. What's your area of need?"
    ];
    
    return {
      response: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      nextSteps: ["Legal", "Business", "Finance", "Tech", "Healthcare"],
    };
  }

  private fallbackResponse(context: AgentContext) {
    return {
      response:
        "I'm here to help you find the right consultant. Could you tell me more about what you need help with?",
      nextSteps: [
        "Describe Problem",
        "Browse Categories",
        "View Popular Consultants",
      ],
    };
  }

  private extractCategoryFromProblem(problem: string): string {
    const categoryKeywords = {
      legal: ["legal", "law", "court", "contract", "lawsuit", "attorney"],
      business: ["business", "startup", "company", "strategy", "management"],
      finance: [
        "finance",
        "money",
        "investment",
        "tax",
        "accounting",
        "budget",
      ],
      tech: ["tech", "software", "app", "website", "digital", "IT"],
      healthcare: ["health", "medical", "doctor", "wellness", "therapy"],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => problem.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    return "business"; // default
  }

  private formatProblemResponse(
    aiResponse: string,
    consultancies: any[]
  ): string {
    if (consultancies.length === 0) return aiResponse;

    const suggestions = consultancies
      .slice(0, 2)
      .map(
        (c, i) =>
          `${i + 1}. ${c.name} - ${c.category}\n   ${c.description?.substring(0, 80)}...`
      )
      .join("\n\n");

    return `${aiResponse}\n\nHere are some consultants who can help:\n\n${suggestions}`;
  }

  private formatSearchResults(consultancies: any[], entities: any): string {
    const filters = [];
    if (entities.category) filters.push(entities.category);
    if (entities.budget) filters.push(`under $${entities.budget}`);
    if (entities.location) filters.push(`in ${entities.location}`);
    if (entities.mode) filters.push(entities.mode);

    const filterText =
      filters.length > 0 ? ` matching ${filters.join(", ")}` : "";

    const suggestions = consultancies
      .slice(0, 3)
      .map(
        (c, i) =>
          `${i + 1}. ${c.name} - ${c.category}\n   ${c.description?.substring(0, 80)}...\n   ⭐ ${c.rating || "N/A"} | 💰 $${c.pricing?.hourlyRate || "Contact for pricing"}/hour`
      )
      .join("\n\n");

    return `I found ${consultancies.length} excellent consultants${filterText}:\n\n${suggestions}\n\nWould you like to book a consultation with any of them?`;
  }

  private extractRecentConsultancies(history: any[]): any[] {
    const consultancies = [];
    for (const msg of history.slice(-5)) {
      if (msg.metadata?.consultancies) {
        consultancies.push(...msg.metadata.consultancies);
      }
    }
    return consultancies;
  }

  private async extractActions(response: string, context: AgentContext) {
    const actions: any[] = [];
    let consultancies: any[] = [];
    let needsBooking = false;

    // Extract ACTIONS from AI response
    const actionMatch = response.match(/ACTIONS:\s*(\[.*?\])/s);
    if (actionMatch) {
      try {
        const parsedActions = JSON.parse(actionMatch[1]);

        for (const action of parsedActions) {
          switch (action.tool) {
            case "searchConsultancies":
              consultancies = await this.tools.searchConsultancies(
                action.params
              );
              actions.push({ type: "search", data: consultancies });
              break;

            case "getPastConversations":
              const pastData = await this.tools.getPastConversations(
                action.params?.userId || context.userId || ""
              );
              actions.push({ type: "pastConversation", data: pastData });
              // Update consultancies with recent bookings
              if (pastData.recentBookings?.length > 0) {
                consultancies = pastData.recentBookings
                  .map((booking) => booking.consultancyId)
                  .filter(Boolean);
              }
              break;

            case "createBooking":
              needsBooking = true;
              actions.push({ type: "booking", data: action.params });
              break;

            case "getConsultancyById":
              const consultancy = await this.tools.getConsultancyById(
                action.params.id
              );
              consultancies = [consultancy];
              actions.push({ type: "consultancy", data: consultancy });
              break;
          }
        }
      } catch (error) {
        console.error("Action parsing error:", error);
      }
    }

    return { actions, consultancies, needsBooking };
  }

  private cleanResponse(response: string): string {
    // Remove ACTIONS section from response
    return response
      .replace(/ACTIONS:\s*\[.*?\]/s, "")
      .replace(/RESPONSE:\s*/, "")
      .trim();
  }
}
