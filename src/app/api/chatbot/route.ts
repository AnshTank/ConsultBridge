import { NextRequest } from "next/server";
import connectDB from "../../../lib/mongodb";
import Consultancy from "../../../models/Consultancy";
import Appointment from "../../../models/Appointment";
import { generatePDFReceipt } from "../../../lib/pdfGenerator";

// Session-based storage for chat history and states
const sessionStorage = new Map<
  string,
  {
    chatHistory: { sender: "user" | "bot"; text: string }[];
    bookingState: {
      selectedConsultancy: any;
      step: number;
      tempData: any;
    };
    appointmentAction: {
      type: "reschedule" | "cancel" | "";
      step: number;
      selectedAppointment: any;
    };
  }
>();

// Helper function to get or create session
function getSession(sessionId: string) {
  if (!sessionStorage.has(sessionId)) {
    sessionStorage.set(sessionId, {
      chatHistory: [],
      bookingState: {
        selectedConsultancy: null,
        step: 0,
        tempData: {},
      },
      appointmentAction: {
        type: "",
        step: 0,
        selectedAppointment: null,
      },
    });
  }
  return sessionStorage.get(sessionId)!;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userMessage = body.message?.trim();
  const userId = body.userId || null;
  const sessionId = body.sessionId || `session_${Date.now()}_${Math.random()}`;

  if (!userMessage) {
    return new Response(JSON.stringify({ reply: "Message is required" }), {
      status: 400,
    });
  }

  await connectDB();

  // Get session data
  const session = getSession(sessionId);
  const { chatHistory, bookingState, appointmentAction } = session;

  chatHistory.push({ sender: "user", text: userMessage });
  
  // Enhanced context awareness - analyze conversation flow
  const conversationContext = {
    recentMessages: chatHistory.slice(-5),
    lastBotMessage: chatHistory.slice().reverse().find(m => m.sender === "bot")?.text || "",
    userEmotionalState: analyzeEmotionalState(chatHistory),
    conversationStage: determineConversationStage(chatHistory),
    topicsDiscussed: extractTopicsFromHistory(chatHistory)
  };

  // Enhanced context awareness for yes/no responses
  const msg = userMessage.toLowerCase();
  const lastBotMessage = conversationContext.lastBotMessage;

  // Handle summary/website choice for view details
  if (msg === "summary" || msg === "website" || msg === "chat summary") {
    const lastBotMessage =
      chatHistory
        .slice()
        .reverse()
        .find((m) => m.sender === "bot")?.text || "";

    if (
      lastBotMessage.includes("Chat Summary") &&
      lastBotMessage.includes("View on Website")
    ) {
      // Extract consultancy name from the message
      const nameMatch = lastBotMessage.match(
        /details about ([^\n]+) in two ways/
      );
      if (nameMatch) {
        const consultancyName = nameMatch[1].trim();

        if (msg === "summary" || msg === "chat summary") {
          // Directly trigger summary without extra message
          try {
            const consultancy = await Consultancy.findOne({
              name: { $regex: consultancyName, $options: "i" },
            });

            if (consultancy) {
              const rating = consultancy.rating || 0;
              const ratingText =
                rating > 0 ? `⭐ ${rating.toFixed(1)}/5` : "New";
              const expertise = Array.isArray(consultancy.expertise)
                ? consultancy.expertise.join(", ")
                : "General consulting";
              const whyChooseUs = Array.isArray(consultancy.whyChooseUs)
                ? consultancy.whyChooseUs
                    .slice(0, 3)
                    .map((reason) => `• ${reason}`)
                    .join("\n")
                : "• Professional service\n• Expert guidance";

              const summary =
                `📋 ${consultancy.name} Summary\n\n` +
                `🏷️ Category: ${consultancy.category}\n` +
                `📍 Location: ${consultancy.location}\n` +
                `${ratingText} (${consultancy.reviews || 0} reviews)\n` +
                `💰 Price: ${consultancy.price || "Contact for pricing"}\n\n` +
                `🎯 Expertise: ${expertise}\n\n` +
                `📝 About: ${
                  consultancy.description || "Professional consulting services"
                }\n\n` +
                `✨ Why Choose Us:\n${whyChooseUs}\n\n` +
                `📞 Contact: ${
                  consultancy.contact?.email || "Available on booking"
                }\n` +
                `🌐 Website: ${consultancy.contact?.website || "N/A"}\n\n` +
                `Would you like to book a consultation with ${consultancy.name}?`;

              chatHistory.push({ sender: "bot", text: summary });
              return new Response(
                JSON.stringify({
                  reply: summary,
                  sessionId,
                  chatHistory,
                  consultancies: [
                    {
                      _id: consultancy._id,
                      name: consultancy.name,
                      category: consultancy.category,
                      description: consultancy.description,
                    },
                  ],
                }),
                { status: 200 }
              );
            }
          } catch (error) {
            console.error("Error fetching consultancy summary:", error);
          }

          const reply = `Sorry, I couldn't find detailed information for "${consultancyName}". Would you like me to search for similar consultancies?`;
          chatHistory.push({ sender: "bot", text: reply });
          return new Response(
            JSON.stringify({ reply, sessionId, chatHistory }),
            { status: 200 }
          );
        } else if (msg === "website") {
          const reply = `Great choice! I'll open the detailed page for ${consultancyName} on our website.`;
          chatHistory.push({ sender: "bot", text: reply });

          // Find consultancy and return navigation info
          try {
            const consultancy = await Consultancy.findOne({
              name: { $regex: consultancyName, $options: "i" },
            });

            if (consultancy) {
              return new Response(
                JSON.stringify({
                  reply,
                  sessionId,
                  chatHistory,
                  redirectToConsultancy: consultancy._id,
                }),
                { status: 200 }
              );
            }
          } catch (error) {
            console.error("Error finding consultancy:", error);
          }

          return new Response(
            JSON.stringify({ reply, sessionId, chatHistory }),
            { status: 200 }
          );
        }
      }
    }
  }

  // Handle yes/no responses based on previous bot question
  if (
    msg === "yes" ||
    msg === "yeah" ||
    msg === "sure" ||
    msg === "ok" ||
    msg === "yep"
  ) {
    let reply = "";
    if (
      lastBotMessage.includes("health") ||
      lastBotMessage.includes("wellness") ||
      lastBotMessage.includes("medical") ||
      lastBotMessage.includes("fitness")
    ) {
      reply =
        "Great! I'll help you find health and wellness experts. Let me search for top-rated consultants who can assist with your health needs.";
    } else if (
      lastBotMessage.includes("travel") ||
      lastBotMessage.includes("hospitality") ||
      lastBotMessage.includes("trip") ||
      lastBotMessage.includes("event management")
    ) {
      reply =
        "Perfect! I'll find travel and hospitality consultants for you. Let me search for experienced professionals who can help with your travel and hospitality needs.";
    } else if (
      lastBotMessage.includes("business") ||
      lastBotMessage.includes("startup") ||
      lastBotMessage.includes("entrepreneur")
    ) {
      reply =
        "Perfect! I'll find business consultants for you. Let me search for experienced professionals who can help with your business needs.";
    } else if (
      lastBotMessage.includes("legal") ||
      lastBotMessage.includes("attorney") ||
      lastBotMessage.includes("lawyer")
    ) {
      reply =
        "Understood! I'll connect you with legal experts. Let me find qualified attorneys and legal consultants for your situation.";
    } else if (
      lastBotMessage.includes("financial") ||
      lastBotMessage.includes("finance") ||
      lastBotMessage.includes("money")
    ) {
      reply =
        "Excellent! I'll help you find financial advisors. Let me search for certified financial consultants who can assist with your needs.";
    } else if (
      lastBotMessage.includes("technology") ||
      lastBotMessage.includes("tech") ||
      lastBotMessage.includes("software") ||
      lastBotMessage.includes("IT")
    ) {
      reply =
        "Awesome! I'll find technology consultants for you. Let me search for tech experts who can help with your technology needs.";
    } else if (
      lastBotMessage.includes("career") ||
      lastBotMessage.includes("job") ||
      lastBotMessage.includes("employment")
    ) {
      reply =
        "Great! I'll find career consultants for you. Let me search for career experts who can help with your professional development.";
    } else if (
      lastBotMessage.includes("lifestyle") ||
      lastBotMessage.includes("personal growth") ||
      lastBotMessage.includes("life coaching")
    ) {
      reply =
        "Wonderful! I'll find lifestyle and personal growth consultants for you. Let me search for coaches who can help with your personal development.";
    } else if (
      lastBotMessage.includes("real estate") ||
      lastBotMessage.includes("property") ||
      lastBotMessage.includes("housing")
    ) {
      reply =
        "Excellent! I'll find real estate consultants for you. Let me search for property experts who can help with your real estate needs.";
    }

    if (reply) {
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply, sessionId, chatHistory }), {
        status: 200,
      });
    }
  }

  if (msg === "no" || msg === "nope" || msg === "not really" || msg === "nah") {
    const reply =
      "No problem! What specific area would you like help with instead? I can assist with business, legal, financial, health, technology, marketing, or educational consulting.";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(JSON.stringify({ reply }), { status: 200 });
  }

  // Handle view details requests - HIGH PRIORITY
  if (
    msg.includes("view detail") ||
    msg.includes("view details") ||
    msg.includes("see detail") ||
    msg.includes("see details") ||
    msg.includes("show detail") ||
    msg.includes("show details") ||
    msg.includes("more detail") ||
    msg.includes("more details") ||
    (msg.includes("detail") &&
      (msg.includes("want") ||
        msg.includes("like") ||
        msg.includes("need") ||
        msg.includes("explore")))
  ) {
    // Look for consultancy name in recent messages
    const recentMessages = chatHistory.slice(-3);
    let consultancyName = null;

    for (const message of recentMessages) {
      if (message.sender === "bot" && message.text.includes("1.")) {
        // Extract consultancy name from numbered list
        const match = message.text.match(/1\.\s*([^-]+)\s*-/);
        if (match) {
          consultancyName = match[1].trim();
          break;
        }
      }
    }

    if (consultancyName) {
      const reply = `Great! I can show you details about ${consultancyName} in two ways:\n\n🔍 Chat Summary - Quick overview right here in our conversation\n🌐 View on Website - Complete detailed page with all information\n\nHow would you like to view the details? Just say "summary" for chat or "website" for the full page experience!`;
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply, sessionId, chatHistory }), {
        status: 200,
      });
    } else {
      const reply =
        "I'd love to show you details! Could you let me know which consultancy you're interested in learning more about?";
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply, sessionId, chatHistory }), {
        status: 200,
      });
    }
  }

  // Handle consultancy summary requests
  if (
    userMessage.includes("show summary of") ||
    userMessage.includes("summary of")
  ) {
    const nameMatch = userMessage.match(
      /(?:show summary of|summary of)\s+(.+)/i
    );
    if (nameMatch) {
      const consultancyName = nameMatch[1].trim();
      try {
        const consultancy = await Consultancy.findOne({
          name: { $regex: consultancyName, $options: "i" },
        });

        if (consultancy) {
          const rating = consultancy.rating || 0;
          const ratingText = rating > 0 ? `⭐ ${rating.toFixed(1)}/5` : "New";
          const expertise = Array.isArray(consultancy.expertise)
            ? consultancy.expertise.join(", ")
            : "General consulting";
          const whyChooseUs = Array.isArray(consultancy.whyChooseUs)
            ? consultancy.whyChooseUs
                .slice(0, 3)
                .map((reason) => `• ${reason}`)
                .join("\n")
            : "• Professional service\n• Expert guidance";

          const summary =
            `📋 ${consultancy.name} Summary\n\n` +
            `🏷️ Category: ${consultancy.category}\n` +
            `📍 Location: ${consultancy.location}\n` +
            `${ratingText} (${consultancy.reviews || 0} reviews)\n` +
            `💰 Price: ${consultancy.price || "Contact for pricing"}\n\n` +
            `🎯 Expertise: ${expertise}\n\n` +
            `📝 About: ${
              consultancy.description || "Professional consulting services"
            }\n\n` +
            `✨ Why Choose Us:\n${whyChooseUs}\n\n` +
            `📞 Contact: ${
              consultancy.contact?.email || "Available on booking"
            }\n` +
            `🌐 Website: ${consultancy.contact?.website || "N/A"}\n\n` +
            `Would you like to book a consultation with ${consultancy.name}?`;

          chatHistory.push({ sender: "bot", text: summary });
          return new Response(
            JSON.stringify({
              reply: summary,
              sessionId,
              chatHistory,
              consultancies: [
                {
                  _id: consultancy._id,
                  name: consultancy.name,
                  category: consultancy.category,
                  description: consultancy.description,
                },
              ],
            }),
            { status: 200 }
          );
        } else {
          const reply = `Sorry, I couldn't find detailed information for "${consultancyName}". Would you like me to search for similar consultancies?`;
          chatHistory.push({ sender: "bot", text: reply });
          return new Response(
            JSON.stringify({ reply, sessionId, chatHistory }),
            { status: 200 }
          );
        }
      } catch (error) {
        console.error("Error fetching consultancy summary:", error);
        const reply =
          "Sorry, I encountered an error while fetching the consultancy details. Please try again.";
        chatHistory.push({ sender: "bot", text: reply });
        return new Response(JSON.stringify({ reply, sessionId, chatHistory }), {
          status: 200,
        });
      }
    }
  }

  // Handle appointment management commands
  if (userMessage.toLowerCase().includes("reschedule")) {
    return await handleRescheduleStart(userId, session);
  }
  if (userMessage.toLowerCase().includes("cancel")) {
    return await handleCancelStart(userId, session);
  }
  if (
    userMessage.toLowerCase().includes("my bookings") ||
    userMessage.toLowerCase().includes("show bookings")
  ) {
    return await handleShowBookings(userId, session);
  }

  // Admin commands
  if (
    userMessage.toLowerCase().includes("admin report") ||
    userMessage.toLowerCase().includes("analytics")
  ) {
    return await handleAdminReport();
  }

  // Handle ongoing appointment actions
  if (appointmentAction.type)
    return await handleAppointmentAction(userMessage, userId, session);
  // Handle ongoing booking
  if (bookingState.step > 0)
    return await handleBookingStep(userMessage, userId, session);

  // Enhanced booking intent detection - only trigger on explicit booking requests
  const explicitBookingKeywords = [
    "book appointment with",
    "schedule appointment with",
    "book consultation with",
    "schedule consultation with",
  ];
  const isExplicitBookingIntent = explicitBookingKeywords.some((k) =>
    userMessage.toLowerCase().includes(k)
  );

  if (isExplicitBookingIntent) {
    // Check if user is signed in before allowing booking
    if (!userId) {
      const funnyMessages = [
        "Whoa there, speed racer! 🏎️ I'd love to book that appointment for you, but first we need to know who you are! Think of signing in as getting your VIP pass to the ConsultBridge experience. Ready to join the party?",
        "Hold your horses, booking champion! 🐎 You're eager to get started (I love that energy!), but I need you to sign in first. It's like showing your ID at an exclusive club - totally worth it for the premium experience!",
        "Easy there, appointment ninja! 🥷 Your booking skills are impressive, but even ninjas need to reveal their identity sometimes. Sign in and let's make this booking happen like the pro you are!",
        "Pump the brakes, booking boss! 🚗 I can see you're ready to dive in, but signing in first is like putting on your seatbelt - it's for your own safety and a much smoother ride ahead!",
        "Slow down there, consultation conqueror! ⚡ Your enthusiasm is contagious, but let's get you signed in first. Think of it as your golden ticket to the ConsultBridge chocolate factory of expertise!",
      ];
      const reply =
        funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(
        JSON.stringify({
          reply,
          requiresAuth: true,
          authMessage: "Sign in required to book appointments",
        }),
        { status: 200 }
      );
    }

    // Extract consultancy name from message or find from recent context
    let consultancyName = null;

    // Check if message contains "book appointment with [name]"
    const bookMatch = userMessage.match(/book appointment with (.+)/i);
    if (bookMatch) {
      consultancyName = bookMatch[1].trim();
    } else {
      // Look for consultancy name in recent bot messages
      const lastBotReply = [...chatHistory]
        .reverse()
        .find((m) => m.sender === "bot")?.text;
      const nameMatch = lastBotReply?.match(/\*\*([^*]+)\*\*/); // Match **Name** format
      if (nameMatch) {
        consultancyName = nameMatch[1];
      }
    }

    if (consultancyName) {
      const consultancy = await Consultancy.findOne({
        name: { $regex: consultancyName, $options: "i" },
      });

      if (consultancy) {
        // Check verification status
        if (consultancy.status !== "verified") {
          const reply = `I apologize, but ${consultancy.name} is currently under verification by our admin team. 🔍\n\nFor your safety and to ensure quality service, we only allow bookings with verified consultancies. This consultancy will be available for booking once the verification process is complete.\n\nWould you like me to suggest other verified consultants in the same category?`;
          chatHistory.push({ sender: "bot", text: reply });
          return new Response(JSON.stringify({ reply }), { status: 200 });
        }

        bookingState.selectedConsultancy = consultancy;
        bookingState.step = 1;
        const today = new Date();
        const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
        const availableDays = consultancy.availability?.days || [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ];

        const reply = `Excellent choice! Let's book your appointment with ${
          consultancy.name
        }.\n\nAvailable Days: ${availableDays.join(", ")}\nHours: ${
          consultancy.availability?.hours || "9:00 AM - 6:00 PM"
        }\n\nWhat date works best for you?\nFormat: YYYY-MM-DD (e.g., ${minDate.getFullYear()}-${String(
          minDate.getMonth() + 1
        ).padStart(2, "0")}-${String(minDate.getDate()).padStart(
          2,
          "0"
        )})\n\nNote: Date must be tomorrow or later and on an available day.`;
        chatHistory.push({ sender: "bot", text: reply });
        return new Response(JSON.stringify({ reply }), { status: 200 });
      }
    }

    // If no specific consultancy found, ask user to clarify
    const reply =
      "I'd be happy to help you book an appointment! Which consultancy would you like to schedule with? Please let me know the name.";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(JSON.stringify({ reply }), { status: 200 });
  }

  // Direct intent detection for common user expressions
  const directIntents = {
    travel: [
      "trip",
      "travel",
      "vacation",
      "holiday",
      "tour",
      "journey",
      "visit",
      "destination",
      "flight",
      "hotel",
      "booking",
      "tourism",
      "hospitality",
      "event",
      "planning",
      "guide",
    ],
    business: [
      "business",
      "startup",
      "company",
      "entrepreneur",
      "venture",
      "enterprise",
      "strategy",
      "consulting",
      "management",
      "growth",
      "scaling",
      "operations",
      "marketing",
      "sales",
    ],
    legal: [
      "legal",
      "lawyer",
      "attorney",
      "law",
      "court",
      "contract",
      "lawsuit",
      "advice",
      "consultation",
      "dispute",
      "compliance",
      "rights",
      "litigation",
      "counsel",
    ],
    finance: [
      "money",
      "finance",
      "financial",
      "investment",
      "loan",
      "tax",
      "banking",
      "budget",
      "advice",
      "planning",
      "wealth",
      "savings",
      "insurance",
      "retirement",
      "portfolio",
      "accounting",
      "funds",
    ],
    health: [
      "health",
      "medical",
      "doctor",
      "fitness",
      "wellness",
      "therapy",
      "treatment",
      "healthcare",
      "nutrition",
      "mental",
      "physical",
      "healing",
      "medicine",
      "consultation",
    ],
    career: [
      "job",
      "career",
      "work",
      "employment",
      "resume",
      "interview",
      "promotion",
      "professional",
      "development",
      "coaching",
      "guidance",
      "skills",
      "training",
      "workplace",
    ],
    technology: [
      "tech",
      "technology",
      "software",
      "app",
      "website",
      "development",
      "IT",
      "digital",
      "programming",
      "coding",
      "system",
      "automation",
      "innovation",
      "solutions",
    ],
    realestate: [
      "property",
      "house",
      "home",
      "real estate",
      "apartment",
      "rent",
      "buy",
      "housing",
      "mortgage",
      "investment",
      "residential",
      "commercial",
      "broker",
      "agent",
    ],
  };

  // Check for direct intent matches with better detection
  let detectedCategory = null;
  for (const [category, keywords] of Object.entries(directIntents)) {
    if (
      keywords.some((keyword) => {
        // Check for exact word matches to avoid false positives
        const regex = new RegExp(`\\b${keyword}\\b`, "i");
        return regex.test(userMessage);
      })
    ) {
      detectedCategory = category;
      break;
    }
  }

  // Special handling for common phrase patterns across all categories
  if (!detectedCategory) {
    const specialPatterns = {
      finance: [
        "financial advice",
        "money advice",
        "investment advice",
        "financial help",
        "financial guidance",
        "financial planning",
        "money help",
        "investment help",
      ],
      business: [
        "business advice",
        "business help",
        "startup help",
        "business guidance",
        "company help",
        "business consultation",
        "entrepreneurship help",
      ],
      legal: [
        "legal advice",
        "legal help",
        "legal guidance",
        "legal consultation",
        "law help",
        "attorney help",
        "lawyer help",
      ],
      health: [
        "health advice",
        "medical advice",
        "health help",
        "medical help",
        "wellness help",
        "fitness help",
        "health guidance",
      ],
      career: [
        "career advice",
        "job advice",
        "career help",
        "job help",
        "career guidance",
        "professional help",
        "work help",
      ],
      technology: [
        "tech advice",
        "tech help",
        "technology help",
        "software help",
        "IT help",
        "development help",
        "programming help",
      ],
      travel: [
        "travel advice",
        "travel help",
        "trip help",
        "vacation help",
        "holiday help",
        "tourism help",
        "travel guidance",
      ],
      realestate: [
        "property advice",
        "real estate advice",
        "housing advice",
        "property help",
        "real estate help",
        "housing help",
      ],
    };

    for (const [category, patterns] of Object.entries(specialPatterns)) {
      if (
        patterns.some((pattern) => userMessage.toLowerCase().includes(pattern))
      ) {
        detectedCategory = category;
        break;
      }
    }
  }

  // If direct intent detected, find consultancies immediately
  if (detectedCategory) {
    const matchedConsultancies = await findSemanticMatches(
      userMessage,
      detectedCategory,
      tokenize(userMessage)
    );

    if (matchedConsultancies.length > 0) {
      const suggestions = matchedConsultancies
        .slice(0, 3)
        .map((c, i) => {
          const description =
            c.description || "Professional consulting services";
          const truncatedDesc =
            description.length > 200
              ? description.substring(0, 200) + "..."
              : description;
          const rating = c.rating || 0;
          const ratingText = rating > 0 ? `⭐ ${rating.toFixed(1)}/5` : "New";
          return `${i + 1}. ${c.name} - ${ratingText}\n   ${truncatedDesc}`;
        })
        .join("\n\n");

      const categoryResponses = {
        travel:
          "Perfect! I found some excellent travel and hospitality consultants for you:",
        business:
          "Great! Here are top business consultants who can help with your needs:",
        legal:
          "Excellent! I found qualified legal advisors who can assist you:",
        finance:
          "Perfect! I found excellent financial advisors who can help with your financial needs:",
        health:
          "Great! I found health and wellness experts who can support you:",
        career:
          "Perfect! Here are career development specialists who can guide you:",
        technology:
          "Excellent! I found technology consultants who can help with your tech needs:",
        realestate:
          "Great! Here are real estate experts who can assist with your property needs:",
      };

      const reply = `${
        categoryResponses[detectedCategory as keyof typeof categoryResponses]
      }\n\n${suggestions}\n\nWould you like to book a consultation with any of these specialists?`;
      chatHistory.push({ sender: "bot", text: reply });

      return new Response(
        JSON.stringify({
          reply,
          sessionId,
          chatHistory,
          consultancies: matchedConsultancies.slice(0, 3).map((c) => ({
            _id: c._id,
            name: c.name,
            category: c.category,
            description: c.description,
          })),
        }),
        { status: 200 }
      );
    }
  }

  // Fallback to advanced NLP if no direct match
  const { matchedConsultancies, userIntent, needsMoreInfo } =
    await analyzeUserQuery(userMessage, chatHistory, conversationContext);

  const recentHistory = chatHistory
    .slice(-6)
    .map((m) => `${m.sender === "user" ? "User" : "Shaan"}: ${m.text}`)
    .join("\n");

  // Intelligent conversational AI with context awareness
  const response = generateIntelligentResponse(
    userMessage,
    matchedConsultancies,
    recentHistory,
    userIntent,
    needsMoreInfo,
    userId,
    chatHistory,
    conversationContext
  );

  // Handle special responses (auth, category navigation, etc.)
  if (typeof response === "object" && response.isSpecialResponse) {
    chatHistory.push({ sender: "bot", text: response.reply });

    const responseData: any = { reply: response.reply };

    if (response.requiresAuth) {
      responseData.requiresAuth = response.requiresAuth;
      responseData.authMessage = response.authMessage;
    }

    if (response.categoryNavigation) {
      responseData.categoryNavigation = response.categoryNavigation;
    }

    if (response.allCategories) {
      responseData.allCategories = response.allCategories;
    }

    return new Response(JSON.stringify(responseData), { status: 200 });
  }

  // Handle other special responses
  if (typeof response === "object" && response.isSpecialResponse) {
    chatHistory.push({ sender: "bot", text: response.reply });

    const responseData: any = { reply: response.reply };

    if (response.categoryNavigation) {
      responseData.categoryNavigation = response.categoryNavigation;
    }

    if (response.allCategories) {
      responseData.allCategories = response.allCategories;
    }

    return new Response(JSON.stringify(responseData), { status: 200 });
  }

  const reply = response as string;

  // Calculate professional delay based on message length
  const baseDelay = 800; // Base delay in ms
  const lengthDelay = Math.min(reply.length * 20, 2000); // 20ms per character, max 2s
  const randomDelay = Math.random() * 500; // Random 0-500ms for naturalness
  const totalDelay = baseDelay + lengthDelay + randomDelay;

  // Add professional delay
  await new Promise((resolve) => setTimeout(resolve, totalDelay));

  chatHistory.push({ sender: "bot", text: reply });

  // Return consultancies only when user shows clear interest
  const responseData: any = {
    reply: String(reply),
    sessionId: sessionId,
    chatHistory: chatHistory,
  };
  if (matchedConsultancies.length > 0 && userIntent.showConsultancies) {
    responseData.consultancies = matchedConsultancies.map((c) => ({
      _id: c._id,
      name: c.name,
      category: c.category,
      description: c.description,
    }));
  }

  return new Response(JSON.stringify(responseData), { status: 200 });
}

// Fallback response for any unhandled cases
export async function GET() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
  });
}

// Booking Flow
async function handleBookingStep(
  userMessage: string,
  userId: string | null,
  session: any
) {
  const { chatHistory, bookingState } = session;
  // Check for cancel command at any step
  if (
    userMessage.toLowerCase().includes("cancel") ||
    userMessage.toLowerCase().includes("stop")
  ) {
    bookingState.step = 0;
    bookingState.selectedConsultancy = null;
    bookingState.tempData = {};
    const reply =
      "Booking process cancelled. No worries! Feel free to start again anytime or ask me anything else.";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(JSON.stringify({ reply }), { status: 200 });
  }

  if (bookingState.step === 1) {
    const dateInput = userMessage.trim();
    const consultancy = bookingState.selectedConsultancy;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateInput)) {
      const reply =
        "Please use the correct date format: YYYY-MM-DD\nExample: 2024-01-29\n\nWhat date would you like?";
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    const selectedDate = new Date(dateInput + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if date is in the past
    if (selectedDate <= today) {
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const reply = `Sorry, that date is in the past or today. Please choose a future date.\nEarliest available: ${tomorrow.getFullYear()}-${String(
        tomorrow.getMonth() + 1
      ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(
        2,
        "0"
      )}\n\nWhat date would you like?`;
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    // Check if date falls on available day
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const selectedDay = dayNames[selectedDate.getDay()];
    const availableDays = consultancy.availability?.days || [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ];

    if (!availableDays.includes(selectedDay)) {
      const reply = `Sorry, ${
        consultancy.name
      } is not available on ${selectedDay}.\nAvailable days: ${availableDays.join(
        ", "
      )}\n\nPlease choose a date on an available day.`;
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    bookingState.tempData.date = dateInput;
    bookingState.step = 2;
    const reply = `Perfect! ${selectedDay}, ${dateInput} is available.\n\nWhat time works for you?\nFormat: HH:00 AM/PM (1-hour slots only)\nExamples: 10:00 AM, 2:00 PM, 4:00 PM\n\nAvailable hours: ${
      consultancy.availability?.hours || "9:00 AM - 6:00 PM"
    }`;
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(JSON.stringify({ reply }), { status: 200 });
  }

  if (bookingState.step === 2) {
    const timeInput = userMessage.trim();

    // Validate time format (HH:00 AM/PM - 1 hour slots only)
    const timeRegex = /^(0?[1-9]|1[0-2]):00\s?(AM|PM)$/i;
    if (!timeRegex.test(timeInput)) {
      const reply =
        "Please use the correct time format for 1-hour slots:\nFormat: HH:00 AM/PM\nExamples: 9:00 AM, 10:00 AM, 2:00 PM, 3:00 PM\n\nNo 30-minute slots (like 10:30 AM) allowed.\n\nWhat time would you like?";
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    // Normalize time format
    const normalizedTime = timeInput.toUpperCase().replace(/\s+/g, " ");

    bookingState.tempData.time = normalizedTime;
    bookingState.step = 3;
    const reply =
      "Great! Would you prefer an online meeting (video call) or offline meeting (in-person)? Please type 'online' or 'offline'.";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(JSON.stringify({ reply }), { status: 200 });
  }

  if (bookingState.step === 3) {
    const meetingType = userMessage.toLowerCase();
    if (meetingType.includes("online")) {
      bookingState.tempData.meetingType = "online";
    } else if (meetingType.includes("offline")) {
      bookingState.tempData.meetingType = "offline";
    } else {
      const reply =
        "Please specify 'online' for video call or 'offline' for in-person meeting.";
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    bookingState.step = 4;
    const reply =
      "Excellent! Please provide your details in this format:\n\nFull Name, Email, Phone Number\n\nExample: John Smith, john@email.com, +1234567890\n\nPlease separate with commas:";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(JSON.stringify({ reply }), { status: 200 });
  }

  if (bookingState.step === 4) {
    const parts = userMessage.split(/[,\n]+/).map((p) => p.trim());

    // Validate all three parts are provided
    if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) {
      const reply =
        "Please provide all three details in the correct format:\n\nFull Name, Email, Phone Number\n\nExample: John Smith, john@email.com, +1234567890\n\nMake sure to separate with commas.";
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parts[1])) {
      const reply =
        "Please provide a valid email address.\n\nExample format: john@email.com\n\nPlease provide your details again:\nFull Name, Email, Phone Number";
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(parts[2])) {
      const reply =
        "Please provide a valid phone number.\n\nExample formats: +1234567890, 1234567890, (123) 456-7890\n\nPlease provide your details again:\nFull Name, Email, Phone Number";
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    bookingState.tempData.name = parts[0];
    bookingState.tempData.email = parts[1];
    bookingState.tempData.phone = parts[2];
    bookingState.step = 5;

    // Get actual consultancy price
    const consultancy = bookingState.selectedConsultancy;
    const price = consultancy?.price || 500;

    const reply = `Choose payment method: Card, UPI, or PayPal\n\nConsultation Fee: ₹${price}`;
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(
      JSON.stringify({ reply, paymentOptions: ["Card", "UPI", "PayPal"] }),
      { status: 200 }
    );
  }

  if (bookingState.step === 5) {
    const consultancy = bookingState.selectedConsultancy;
    const paymentMethod = userMessage.trim();

    // Validate payment method
    const validMethods = ["card", "upi", "paypal"];
    if (!validMethods.includes(paymentMethod.toLowerCase())) {
      const reply =
        "Please choose a valid payment method: Card, UPI, or PayPal";
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    // Store payment method
    bookingState.tempData.paymentMethod = paymentMethod;

    // Debug logging
    console.log("=== BOOKING STEP 5 DEBUG ===");
    console.log("bookingState.selectedConsultancy:", consultancy);
    console.log("consultancy?.name:", consultancy?.name);
    console.log("consultancy?._id:", consultancy?._id);
    console.log("paymentMethod:", paymentMethod);

    // Check if user is authenticated for booking
    if (!userId) {
      const reply =
        "To complete your booking, you'll need to sign in first. This helps us save your appointment details and send you confirmations. Would you like me to redirect you to sign in?";
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(
        JSON.stringify({
          reply,
          requiresAuth: true,
          authMessage: "Sign in required for booking appointments",
        }),
        { status: 200 }
      );
    }

    // Ensure consultancy is available
    if (!consultancy) {
      const reply =
        "Sorry, consultancy information is missing. Please start the booking process again by selecting a consultancy.";
      chatHistory.push({ sender: "bot", text: reply });
      bookingState.step = 0;
      bookingState.selectedConsultancy = null;
      bookingState.tempData = {};
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    // Ensure consultancy name is available
    if (!consultancy.name) {
      const reply =
        "Sorry, consultancy name is missing. Please start the booking process again.";
      chatHistory.push({ sender: "bot", text: reply });
      bookingState.step = 0;
      bookingState.selectedConsultancy = null;
      bookingState.tempData = {};
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    // Prepare appointment data with ALL required fields
    const appointmentData = {
      consultancyId: consultancy._id.toString(),
      clientId: userId,
      clientName: bookingState.tempData.name,
      clientEmail: bookingState.tempData.email,
      clientPhone: bookingState.tempData.phone,
      appointmentDate: new Date(bookingState.tempData.date + "T00:00:00.000Z"),
      appointmentTime: bookingState.tempData.time,
      appointmentType: bookingState.tempData.meetingType || "online",
      message: "Appointment booked via Shaan chatbot assistant",
      consultancyName: consultancy.name,
      status: "confirmed",
    };

    console.log("=== APPOINTMENT DATA BEFORE CREATION ===");
    console.log("appointmentData:", JSON.stringify(appointmentData, null, 2));

    // Validate required fields before creation
    if (!appointmentData.consultancyName) {
      throw new Error("consultancyName is missing!");
    }
    if (!appointmentData.appointmentType) {
      throw new Error("appointmentType is missing!");
    }

    // Create appointment with explicit field validation
    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Generate PDF receipt with actual data
    const actualPrice = consultancy?.price || 500;
    const receiptData = {
      id: `PAY${Date.now()}`,
      amount: actualPrice,
      paymentMethod: bookingState.tempData.paymentMethod,
      clientName: bookingState.tempData.name,
      consultancyName: consultancy.name,
      appointmentType: bookingState.tempData.meetingType,
      date: bookingState.tempData.date,
      time: bookingState.tempData.time,
      transactionDate: new Date().toISOString(),
    };

    // Generate PDF receipt
    try {
      const pdfBuffer = await generatePDFReceipt(receiptData);
      console.log("PDF receipt generated successfully");
    } catch (error) {
      console.error("Error generating PDF receipt:", error);
    }

    // Mock email
    console.log("=== APPOINTMENT CREATED ===");
    console.log(
      "Created appointment:",
      JSON.stringify(appointment.toObject(), null, 2)
    );
    console.log("appointment.consultancyName:", appointment.consultancyName);
    console.log(
      `Email sent to ${bookingState.tempData.email}: Appointment confirmed with ${consultancy.name}`
    );

    const reply = `✅ Payment successful via ${bookingState.tempData.paymentMethod.toUpperCase()}! \n\nYour ${
      bookingState.tempData.meetingType
    } appointment with ${
      consultancy.name
    } is confirmed for ${appointment.appointmentDate.toDateString()} at ${
      appointment.appointmentTime
    }.\n\nAmount Paid: ₹${actualPrice}\nPayment Method: ${bookingState.tempData.paymentMethod.toUpperCase()}\n\nConfirmation email and receipt sent!`;
    chatHistory.push({ sender: "bot", text: reply });

    // Reset booking state
    bookingState.step = 0;
    bookingState.selectedConsultancy = null;
    bookingState.tempData = {};

    const bookingResponse = appointment.toObject();
    console.log("=== BOOKING RESPONSE ===");
    console.log("bookingResponse:", JSON.stringify(bookingResponse, null, 2));
    console.log(
      "bookingResponse.consultancyName:",
      bookingResponse.consultancyName
    );

    return new Response(
      JSON.stringify({
        reply,
        booking: bookingResponse,
        paymentReceipt: receiptData,
        processingPayment: true,
      }),
      { status: 200 }
    );
  }
}

// Appointment Management Functions
async function handleRescheduleStart(userId: string | null, session: any) {
  const { chatHistory } = session;
  if (!userId) {
    const reply =
      "To reschedule appointments, you'll need to sign in first. This ensures we're updating the right appointments securely.";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(
      JSON.stringify({
        reply,
        requiresAuth: true,
        authMessage: "Sign in to reschedule appointments",
      }),
      { status: 200 }
    );
  }

  // Update expired appointments first
  await updateExpiredAppointments();

  const appointments = await Appointment.find({
    clientId: userId,
    status: "confirmed",
  }).limit(5);

  if (appointments.length === 0) {
    const reply =
      "You don't have any confirmed appointments to reschedule. Would you like me to help you book a new appointment?";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(JSON.stringify({ reply }), { status: 200 });
  }

  appointmentAction.type = "reschedule";
  appointmentAction.step = 1;

  const list = appointments
    .map(
      (apt, i) =>
        `${i + 1}. ${apt.consultancyName} - ${new Date(
          apt.appointmentDate
        ).toDateString()} at ${apt.appointmentTime}`
    )
    .join("\n");

  const reply = `Which appointment would you like to reschedule?\n\n${list}\n\nType the number:`;
  chatHistory.push({ sender: "bot", text: reply });
  return new Response(JSON.stringify({ reply }), { status: 200 });
}

async function handleCancelStart(userId: string | null, session: any) {
  const { chatHistory } = session;
  if (!userId) {
    const reply =
      "To cancel appointments, you'll need to sign in first. This ensures we're canceling the right appointments securely.";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(
      JSON.stringify({
        reply,
        requiresAuth: true,
        authMessage: "Sign in to cancel appointments",
      }),
      { status: 200 }
    );
  }

  // Update expired appointments first
  await updateExpiredAppointments();

  const appointments = await Appointment.find({
    clientId: userId,
    status: "confirmed",
  }).limit(5);

  if (appointments.length === 0) {
    const reply =
      "You don't have any confirmed appointments to cancel. Would you like me to help you book a new appointment?";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(JSON.stringify({ reply }), { status: 200 });
  }

  appointmentAction.type = "cancel";
  appointmentAction.step = 1;

  const list = appointments
    .map(
      (apt, i) =>
        `${i + 1}. ${apt.consultancyName} - ${new Date(
          apt.appointmentDate
        ).toDateString()} at ${apt.appointmentTime}`
    )
    .join("\n");

  const reply = `Which appointment would you like to cancel?\n\n${list}\n\nType the number:`;
  chatHistory.push({ sender: "bot", text: reply });
  return new Response(JSON.stringify({ reply }), { status: 200 });
}

async function handleShowBookings(userId: string | null, session: any) {
  const { chatHistory } = session;
  if (!userId) {
    const reply =
      "To view your bookings, you'll need to sign in first. This helps us show you your personal appointment history securely.";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(
      JSON.stringify({
        reply,
        requiresAuth: true,
        authMessage: "Sign in to view your bookings",
      }),
      { status: 200 }
    );
  }

  // Update expired appointments first
  await updateExpiredAppointments();

  // Get all appointments (confirmed, cancelled, expired)
  const appointments = await Appointment.find({
    clientId: userId,
  })
    .sort({ appointmentDate: -1 })
    .limit(10);

  if (appointments.length === 0) {
    const reply =
      "You don't have any appointments yet. Would you like me to help you find a consultant and book your first appointment?";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(JSON.stringify({ reply }), { status: 200 });
  }

  // Separate appointments by status
  const confirmedAppts = appointments.filter(
    (apt) => apt.status === "confirmed"
  );
  const expiredAppts = appointments.filter((apt) => apt.status === "expired");
  const cancelledAppts = appointments.filter(
    (apt) => apt.status === "cancelled"
  );

  let reply = "Your appointments:\n\n";

  if (confirmedAppts.length > 0) {
    reply += "✅ CONFIRMED:\n";
    reply += confirmedAppts
      .map(
        (apt) =>
          `• ${apt.consultancyName}\n  Date: ${new Date(
            apt.appointmentDate
          ).toDateString()}\n  Time: ${apt.appointmentTime}`
      )
      .join("\n\n");
    reply += "\n\n";
  }

  if (expiredAppts.length > 0) {
    reply += "⏰ EXPIRED:\n";
    reply += expiredAppts
      .map(
        (apt) =>
          `• ${apt.consultancyName}\n  Date: ${new Date(
            apt.appointmentDate
          ).toDateString()}\n  Time: ${apt.appointmentTime}`
      )
      .join("\n\n");
    reply += "\n\n";
  }

  if (cancelledAppts.length > 0) {
    reply += "❌ CANCELLED:\n";
    reply += cancelledAppts
      .map(
        (apt) =>
          `• ${apt.consultancyName}\n  Date: ${new Date(
            apt.appointmentDate
          ).toDateString()}\n  Time: ${apt.appointmentTime}`
      )
      .join("\n\n");
  }

  chatHistory.push({ sender: "bot", text: reply });
  return new Response(JSON.stringify({ reply }), { status: 200 });
}

async function handleAppointmentAction(
  userMessage: string,
  userId: string | null,
  session: any
) {
  const { chatHistory, appointmentAction } = session;

  if (!userId)
    return new Response(JSON.stringify({ reply: "Authentication required" }), {
      status: 401,
    });

  const appointments = await Appointment.find({
    clientId: userId,
    status: "confirmed",
  });

  if (appointmentAction.step === 1) {
    const index = parseInt(userMessage) - 1;
    if (!appointments[index]) {
      appointmentAction.type = "";
      appointmentAction.step = 0;
      const reply = "Invalid selection. Please try again.";
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    appointmentAction.selectedAppointment = appointments[index];

    if (appointmentAction.type === "reschedule") {
      appointmentAction.step = 2;
      const reply = "Enter new date (YYYY-MM-DD):";
      chatHistory.push({ sender: "bot", text: reply });
      return new Response(JSON.stringify({ reply }), { status: 200 });
    }

    if (appointmentAction.type === "cancel") {
      appointmentAction.selectedAppointment.status = "cancelled";
      await appointmentAction.selectedAppointment.save();

      const reply = `Your appointment with ${appointmentAction.selectedAppointment.consultancyName} has been cancelled.`;
      chatHistory.push({ sender: "bot", text: reply });

      appointmentAction.type = "";
      appointmentAction.step = 0;
      appointmentAction.selectedAppointment = null;

      return new Response(JSON.stringify({ reply }), { status: 200 });
    }
  }

  if (appointmentAction.step === 2) {
    appointmentAction.selectedAppointment.appointmentDate = userMessage;
    appointmentAction.step = 3;
    const reply = "Enter new time (e.g., 2:00 PM):";
    chatHistory.push({ sender: "bot", text: reply });
    return new Response(JSON.stringify({ reply }), { status: 200 });
  }

  if (appointmentAction.step === 3) {
    appointmentAction.selectedAppointment.appointmentTime = userMessage;
    await appointmentAction.selectedAppointment.save();

    const updated = appointmentAction.selectedAppointment;
    const reply = `✅ Appointment rescheduled! New date: ${updated.appointmentDate} at ${updated.appointmentTime}`;
    chatHistory.push({ sender: "bot", text: reply });

    appointmentAction.type = "";
    appointmentAction.step = 0;
    appointmentAction.selectedAppointment = null;

    return new Response(JSON.stringify({ reply, booking: updated }), {
      status: 200,
    });
  }
}

// Helper functions for conversation context
function analyzeEmotionalState(chatHistory: any[]) {
  const recentMessages = chatHistory.slice(-3).filter(m => m.sender === "user");
  const allText = recentMessages.map(m => m.text).join(" ").toLowerCase();
  
  const emotions = {
    frustrated: ["frustrated", "annoyed", "angry", "upset", "mad"],
    sad: ["sad", "disappointed", "depressed", "down", "failed", "failure"],
    anxious: ["worried", "anxious", "nervous", "scared", "concerned"],
    confused: ["confused", "lost", "don't know", "unsure", "help"],
    positive: ["excited", "happy", "great", "awesome", "good"]
  };
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      return emotion;
    }
  }
  
  return "neutral";
}

function determineConversationStage(chatHistory: any[]) {
  const messageCount = chatHistory.length;
  if (messageCount <= 2) return "greeting";
  if (messageCount <= 4) return "understanding";
  if (messageCount <= 8) return "helping";
  return "ongoing";
}

function extractTopicsFromHistory(chatHistory: any[]) {
  const allText = chatHistory.map(m => m.text).join(" ").toLowerCase();
  const topics = [];
  
  const topicKeywords = {
    interview: ["interview", "job interview", "failed interview"],
    career: ["career", "job", "work", "employment"],
    business: ["business", "startup", "company"],
    personal: ["personal", "life", "relationship"],
    financial: ["money", "financial", "finance", "investment"]
  };
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      topics.push(topic);
    }
  }
  
  return topics;
}

// Advanced NLP with Semantic Analysis & Context Understanding
async function analyzeUserQuery(userMessage: string, history: any[], conversationContext?: any) {
  const msg = userMessage.toLowerCase();
  const tokens = tokenize(msg);
  const context = extractContext(history);

  // Enhanced category mapping with ConsultBridge-specific keywords
  const categoryMap = {
    business: {
      primary: [
        "business",
        "startup",
        "entrepreneur",
        "company",
        "enterprise",
        "venture",
        "strategy",
        "business strategy",
        "business plan",
        "business development",
        "scaling",
        "expansion",
      ],
      secondary: [
        "planning",
        "growth",
        "revenue",
        "profit",
        "market",
        "competition",
        "new business",
        "starting",
        "operations",
        "management",
        "leadership",
        "consulting",
      ],
      problems: [
        "failing business",
        "low sales",
        "no customers",
        "need funding",
        "business struggling",
        "market entry",
        "competitive analysis",
      ],
      synonyms: [
        "commerce",
        "trade",
        "industry",
        "corporate",
        "commercial",
        "entrepreneurship",
      ],
    },
    legal: {
      primary: ["legal", "lawyer", "attorney", "law", "court", "judge"],
      secondary: [
        "contract",
        "agreement",
        "lawsuit",
        "compliance",
        "rights",
        "dispute",
      ],
      problems: [
        "legal trouble",
        "sued",
        "contract issue",
        "legal advice",
        "court case",
      ],
      synonyms: ["juridical", "judicial", "litigation", "counsel", "advocate"],
    },
    finance: {
      primary: [
        "finance",
        "financial",
        "money",
        "investment",
        "accounting",
        "tax",
        "financial services",
        "financial planning",
        "wealth management",
        "portfolio",
        "retirement planning",
      ],
      secondary: [
        "budget",
        "loan",
        "credit",
        "debt",
        "savings",
        "insurance",
        "banking",
        "financial guidance",
        "cash flow",
        "funding",
        "capital",
        "mortgage",
      ],
      problems: [
        "broke",
        "debt",
        "financial crisis",
        "tax problem",
        "loan rejected",
        "need funding",
        "financial help",
        "bankruptcy",
        "poor credit",
      ],
      synonyms: [
        "monetary",
        "fiscal",
        "economic",
        "funds",
        "financing",
        "treasury",
      ],
    },
    technology: {
      primary: [
        "tech",
        "technology",
        "software",
        "app",
        "website",
        "development",
        "IT",
        "digital transformation",
        "automation",
        "AI",
        "machine learning",
      ],
      secondary: [
        "coding",
        "programming",
        "system",
        "database",
        "cloud",
        "cybersecurity",
        "data analysis",
        "mobile app",
        "web development",
      ],
      problems: [
        "website broken",
        "app not working",
        "tech issues",
        "software bug",
        "system crash",
        "data breach",
        "slow performance",
      ],
      synonyms: [
        "digital",
        "cyber",
        "electronic",
        "computer",
        "technical",
        "IT services",
      ],
    },
    health: {
      primary: [
        "health",
        "medical",
        "doctor",
        "wellness",
        "fitness",
        "nutrition",
        "healthcare",
        "wellbeing",
        "mental health",
        "physical health",
        "lifestyle",
      ],
      secondary: [
        "therapy",
        "treatment",
        "medicine",
        "hospital",
        "clinic",
        "disease",
        "diet",
        "exercise",
        "meditation",
        "stress management",
        "preventive care",
      ],
      problems: [
        "sick",
        "illness",
        "pain",
        "health problem",
        "medical issue",
        "chronic condition",
        "weight issues",
        "stress",
        "anxiety",
      ],
      synonyms: [
        "healthcare",
        "medical care",
        "therapeutic",
        "holistic health",
        "preventive medicine",
      ],
    },
    career: {
      primary: [
        "career",
        "job",
        "employment",
        "profession",
        "work",
        "career guidance",
        "career counseling",
        "career development",
        "job search",
        "resume",
      ],
      secondary: [
        "interview",
        "skills",
        "training",
        "certification",
        "promotion",
        "salary",
        "networking",
        "professional development",
        "career change",
        "job market",
      ],
      problems: [
        "unemployed",
        "job loss",
        "career stuck",
        "no promotion",
        "career confusion",
        "skill gap",
        "interview failure",
      ],
      synonyms: [
        "professional",
        "occupational",
        "vocational",
        "employment guidance",
      ],
    },
    lifestyle: {
      primary: [
        "lifestyle",
        "personal growth",
        "life coaching",
        "self improvement",
        "personal development",
        "life balance",
        "habits",
        "mindfulness",
      ],
      secondary: [
        "productivity",
        "time management",
        "goal setting",
        "motivation",
        "confidence",
        "relationships",
        "communication",
        "stress relief",
      ],
      problems: [
        "feeling stuck",
        "lack motivation",
        "poor habits",
        "work life balance",
        "personal issues",
      ],
      synonyms: [
        "life coaching",
        "personal coaching",
        "self help",
        "life guidance",
      ],
    },
    travel: {
      primary: [
        "travel",
        "tourism",
        "hospitality",
        "vacation",
        "trip",
        "travel planning",
        "destination",
        "hotel",
        "restaurant",
      ],
      secondary: [
        "booking",
        "itinerary",
        "accommodation",
        "flight",
        "visa",
        "travel insurance",
        "tour guide",
        "event planning",
      ],
      problems: [
        "travel issues",
        "booking problems",
        "visa rejection",
        "travel anxiety",
        "budget travel",
      ],
      synonyms: [
        "tourism",
        "hospitality services",
        "travel services",
        "vacation planning",
      ],
    },
    realestate: {
      primary: [
        "real estate",
        "property",
        "housing",
        "home",
        "apartment",
        "house",
        "rent",
        "buy",
        "sell",
        "investment property",
      ],
      secondary: [
        "mortgage",
        "loan",
        "property management",
        "real estate agent",
        "property valuation",
        "market analysis",
        "commercial property",
      ],
      problems: [
        "cant find home",
        "property issues",
        "mortgage rejection",
        "property dispute",
        "rental problems",
      ],
      synonyms: [
        "property services",
        "housing services",
        "real estate services",
        "property consulting",
      ],
    },
  };

  // Multi-layered intent analysis
  const intentAnalysis = performSemanticAnalysis(tokens, categoryMap, context);
  const emotionalContext = analyzeEmotionalContext(msg);
  const urgencyLevel = detectUrgency(msg);

  // Enhanced user intent with multiple confidence scores
  const userIntent = {
    category: intentAnalysis.category,
    confidence: intentAnalysis.confidence,
    semanticScore: intentAnalysis.semanticScore,
    contextScore: intentAnalysis.contextScore,
    emotionalState: emotionalContext.state,
    urgency: urgencyLevel,
    showConsultancies:
      intentAnalysis.confidence > 0.7 && intentAnalysis.readyForSuggestions,
    needsMoreInfo:
      intentAnalysis.confidence < 0.6 || !intentAnalysis.specificEnough,
    conversationStage: determineConversationStage(history, intentAnalysis),
  };

  // Advanced consultancy matching with semantic similarity
  let matchedConsultancies: any[] = [];
  if (userIntent.showConsultancies && userIntent.category) {
    matchedConsultancies = await findSemanticMatches(
      userMessage,
      userIntent.category,
      tokens
    );
  }

  return {
    matchedConsultancies,
    userIntent,
    needsMoreInfo: userIntent.needsMoreInfo,
  };
}

// Tokenization with stop word removal and stemming
function tokenize(text: string): string[] {
  const stopWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
  ];

  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.includes(word))
    .map((word) => stemWord(word));
}

// Simple stemming function
function stemWord(word: string): string {
  const suffixes = [
    "ing",
    "ed",
    "er",
    "est",
    "ly",
    "tion",
    "sion",
    "ness",
    "ment",
    "able",
    "ible",
  ];
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

// Extract conversation context
function extractContext(history: any[]): any {
  const recentMessages = history.slice(-4);
  const mentionedTopics = new Set<string>();
  const userEmotions: string[] = [];

  recentMessages.forEach((msg) => {
    if (msg.sender === "user") {
      const tokens = tokenize(msg.text);
      tokens.forEach((token) => mentionedTopics.add(token));

      // Extract emotional indicators
      const emotions = [
        "frustrated",
        "worried",
        "excited",
        "confused",
        "urgent",
        "desperate",
      ];
      emotions.forEach((emotion) => {
        if (msg.text.toLowerCase().includes(emotion)) {
          userEmotions.push(emotion);
        }
      });
    }
  });

  return {
    mentionedTopics: Array.from(mentionedTopics),
    emotions: userEmotions,
  };
}

// Semantic analysis with TF-IDF-like scoring
function performSemanticAnalysis(
  tokens: string[],
  categoryMap: any,
  context: any
): any {
  let bestCategory = null;
  let bestScore = 0;
  let semanticScore = 0;
  let contextScore = 0;

  for (const [category, keywords] of Object.entries(categoryMap)) {
    const keywordSet = keywords as any;
    let categoryScore = 0;
    let matches = 0;

    // Primary keywords (highest weight)
    keywordSet.primary.forEach((keyword: string) => {
      const similarity = calculateSimilarity(tokens, keyword);
      if (similarity > 0.6) {
        categoryScore += similarity * 3;
        matches++;
      }
    });

    // Secondary keywords (medium weight)
    keywordSet.secondary.forEach((keyword: string) => {
      const similarity = calculateSimilarity(tokens, keyword);
      if (similarity > 0.5) {
        categoryScore += similarity * 2;
        matches++;
      }
    });

    // Problem-specific keywords (high weight for problems)
    keywordSet.problems.forEach((problem: string) => {
      if (tokens.some((token) => problem.includes(token))) {
        categoryScore += 2.5;
        matches++;
      }
    });

    // Synonyms (lower weight)
    keywordSet.synonyms.forEach((synonym: string) => {
      const similarity = calculateSimilarity(tokens, synonym);
      if (similarity > 0.4) {
        categoryScore += similarity * 1.5;
        matches++;
      }
    });

    // Context boost
    const contextBoost =
      context.mentionedTopics.filter((topic: string) =>
        [...keywordSet.primary, ...keywordSet.secondary].some((kw: string) =>
          kw.includes(topic)
        )
      ).length * 0.5;

    categoryScore += contextBoost;

    if (categoryScore > bestScore) {
      bestScore = categoryScore;
      bestCategory = category;
      semanticScore =
        matches / (keywordSet.primary.length + keywordSet.secondary.length);
      contextScore = contextBoost;
    }
  }

  // Enhanced intent detection for complex queries
  const originalMsg = tokens.join(" ");
  const intentPhrases = [
    "need",
    "help",
    "looking",
    "want",
    "require",
    "advice",
    "guidance",
    "consultant",
    "expert",
  ];
  const hasIntent = intentPhrases.some((phrase) =>
    originalMsg.includes(phrase)
  );

  // Multi-category detection (e.g., "financial guidance for farming business")
  const categories = Object.keys(categoryMap);
  const detectedCategories = categories.filter((cat) => {
    const catKeywords = categoryMap[cat as keyof typeof categoryMap] as any;
    return [...catKeywords.primary, ...catKeywords.secondary].some(
      (kw: string) =>
        originalMsg.includes(kw) || tokens.some((token) => kw.includes(token))
    );
  });

  // If multiple categories detected, choose the most specific one
  if (detectedCategories.length > 1) {
    // Prioritize based on specificity and context
    if (
      detectedCategories.includes("finance") &&
      (originalMsg.includes("guidance") || originalMsg.includes("planning"))
    ) {
      bestCategory = "finance";
      bestScore = Math.max(bestScore, 3.5);
    }
  }

  const readyForSuggestions = hasIntent && bestScore > 1.0;
  const specificEnough = bestScore > 1.5 || (hasIntent && tokens.length > 4);

  return {
    category: bestCategory,
    confidence: Math.min(bestScore / 5, 1), // Normalize to 0-1
    semanticScore,
    contextScore,
    readyForSuggestions,
    specificEnough,
  };
}

// Calculate semantic similarity between tokens and keyword
function calculateSimilarity(tokens: string[], keyword: string): number {
  const keywordTokens = tokenize(keyword);
  let matches = 0;

  keywordTokens.forEach((kToken) => {
    tokens.forEach((uToken) => {
      if (kToken === uToken) matches += 1;
      else if (kToken.includes(uToken) || uToken.includes(kToken))
        matches += 0.7;
      else if (levenshteinDistance(kToken, uToken) <= 2) matches += 0.5;
    });
  });

  return matches / Math.max(keywordTokens.length, tokens.length);
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Analyze emotional context
function analyzeEmotionalContext(message: string): any {
  const emotionalIndicators = {
    frustrated: ["frustrated", "annoyed", "irritated", "fed up", "angry"],
    worried: ["worried", "concerned", "anxious", "nervous", "scared"],
    urgent: ["urgent", "asap", "immediately", "quickly", "emergency"],
    desperate: ["desperate", "helpless", "lost", "dont know what to do"],
    positive: ["excited", "happy", "optimistic", "confident", "ready"],
  };

  for (const [emotion, indicators] of Object.entries(emotionalIndicators)) {
    if (indicators.some((indicator) => message.includes(indicator))) {
      return { state: emotion, intensity: 0.8 };
    }
  }

  return { state: "neutral", intensity: 0.5 };
}

// Detect urgency level
function detectUrgency(message: string): string {
  const urgentWords = [
    "urgent",
    "emergency",
    "asap",
    "immediately",
    "quickly",
    "now",
    "today",
  ];
  const highUrgency = ["crisis", "emergency", "desperate", "critical"];

  if (highUrgency.some((word) => message.includes(word))) return "high";
  if (urgentWords.some((word) => message.includes(word))) return "medium";
  return "low";
}

// Determine conversation stage
function determineConversationStage(history: any[], analysis: any): string {
  if (history.length <= 2) return "greeting";
  if (analysis.confidence < 0.4) return "clarification";
  if (analysis.confidence < 0.7) return "refinement";
  return "recommendation";
}

// Precise consultancy matching with strict relevance filtering
async function findSemanticMatches(
  query: string,
  category: string,
  tokens: string[]
): Promise<any[]> {
  const queryLower = query.toLowerCase();

  // Strict category-based filtering first
  const categoryFilters = {
    finance: [
      "finance",
      "financial",
      "accounting",
      "investment",
      "banking",
      "tax",
      "loan",
    ],
    business: [
      "business",
      "startup",
      "entrepreneur",
      "commerce",
      "corporate",
      "enterprise",
    ],
    legal: ["legal", "law", "attorney", "lawyer", "court", "contract"],
    marketing: [
      "marketing",
      "advertising",
      "brand",
      "promotion",
      "digital marketing",
    ],
    technology: [
      "technology",
      "tech",
      "software",
      "development",
      "IT",
      "programming",
    ],
    health: ["health", "medical", "doctor", "clinic", "hospital", "healthcare"],
    education: ["education", "academic", "school", "training", "learning"],
    counseling: ["counseling", "therapy", "psychological", "mental health"],
  };

  const relevantKeywords =
    categoryFilters[category as keyof typeof categoryFilters] || [];

  // First pass: Get consultancies that match the category
  const categoryQuery = {
    $or: [
      { category: { $regex: category, $options: "i" } },
      { name: { $regex: relevantKeywords.join("|"), $options: "i" } },
      { description: { $regex: relevantKeywords.join("|"), $options: "i" } },
      { expertise: { $in: relevantKeywords } },
    ],
  };

  const potentialMatches = await Consultancy.find(categoryQuery);
  const scoredConsultancies: any[] = [];

  potentialMatches.forEach((consultancy) => {
    let score = 0;
    let relevanceScore = 0;

    const allFields = [
      consultancy.name,
      consultancy.category,
      consultancy.description,
      ...(consultancy.expertise || []),
    ]
      .join(" ")
      .toLowerCase();

    // STRICT RELEVANCE CHECK - Must pass this to be included
    const isRelevant = relevantKeywords.some(
      (keyword) =>
        allFields.includes(keyword) ||
        consultancy.category.toLowerCase().includes(keyword)
    );

    if (!isRelevant) return; // Skip irrelevant consultancies

    // Category exact match (highest priority)
    if (consultancy.category.toLowerCase() === category) {
      score += 10;
      relevanceScore += 5;
    } else if (consultancy.category.toLowerCase().includes(category)) {
      score += 6;
      relevanceScore += 3;
    }

    // Query-specific matching
    if (category === "finance") {
      // For finance queries, heavily penalize non-financial consultancies
      if (
        !allFields.includes("finance") &&
        !allFields.includes("financial") &&
        !allFields.includes("accounting") &&
        !allFields.includes("investment") &&
        !allFields.includes("banking") &&
        !allFields.includes("tax")
      ) {
        return; // Skip completely
      }

      // Boost financial keywords
      if (allFields.includes("financial")) score += 5;
      if (allFields.includes("finance")) score += 5;
      if (allFields.includes("accounting")) score += 4;
      if (allFields.includes("investment")) score += 4;
    }

    if (category === "business") {
      // For business queries, ensure it's actually business-related
      if (
        !allFields.includes("business") &&
        !allFields.includes("startup") &&
        !allFields.includes("entrepreneur") &&
        !allFields.includes("corporate") &&
        !allFields.includes("commerce")
      ) {
        if (score < 8) return; // Skip unless very high category match
      }
    }

    // Token matching with context
    tokens.forEach((token) => {
      if (allFields.includes(token)) {
        score += 2;
        if (relevantKeywords.includes(token)) score += 2; // Extra boost for category keywords
      }
    });

    // Expertise matching
    if (consultancy.expertise) {
      consultancy.expertise.forEach((skill: string) => {
        const skillLower = skill.toLowerCase();
        if (relevantKeywords.some((kw) => skillLower.includes(kw))) {
          score += 3;
        }
        tokens.forEach((token) => {
          if (skillLower.includes(token)) score += 2;
        });
      });
    }

    // Description relevance
    if (consultancy.description) {
      const descLower = consultancy.description.toLowerCase();
      relevantKeywords.forEach((keyword) => {
        if (descLower.includes(keyword)) score += 1.5;
      });
    }

    // Name relevance
    const nameLower = consultancy.name.toLowerCase();
    relevantKeywords.forEach((keyword) => {
      if (nameLower.includes(keyword)) score += 3;
    });

    // Final relevance check - must have minimum score and relevance
    if (score >= 3 && relevanceScore >= 1) {
      scoredConsultancies.push({
        ...consultancy.toObject(),
        score: score + relevanceScore,
        relevanceScore,
      });
    }
  });

  // Sort by rating first, then by combined score
  return scoredConsultancies
    .sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      const totalScoreA = a.score + a.relevanceScore;
      const totalScoreB = b.score + b.relevanceScore;

      // Primary sort: by rating (descending)
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      // Secondary sort: by relevance score (descending)
      return totalScoreB - totalScoreA;
    })
    .slice(0, 5);
}

// Advanced Conversational AI with Context Awareness
function generateIntelligentResponse(
  userMessage: string,
  consultancies: any[],
  history: any[],
  userIntent: any,
  needsMoreInfo: boolean,
  userId: string | null = null,
  chatHistory: any[] = [],
  conversationContext?: any
) {
  const msg = userMessage.toLowerCase();
  const isFirstMessage = history.length <= 2;
  
  // Use conversation context for better responses
  const emotionalState = conversationContext?.userEmotionalState || "neutral";
  const conversationStage = conversationContext?.conversationStage || "greeting";
  const topicsDiscussed = conversationContext?.topicsDiscussed || [];
  const recentContext = conversationContext?.recentMessages?.map(m => m.text).join(" ").toLowerCase() || "";

  // Greetings with auth-aware messaging
  if (
    isFirstMessage ||
    msg.includes("hello") ||
    msg.includes("hi") ||
    msg.includes("hey")
  ) {
    if (!userId) {
      const funnyGreetings = [
        "Hey there, future success story! 🎆 I'm Shaan, your personal consultant assistant at ConsultBridge - India's premier consulting platform! Whether you need business strategy, financial planning, legal advice, or any of our 10+ categories, I'm here to connect you with top-rated experts. Browse freely, and when you're ready to book, just sign in! 🚀",
        "Welcome to ConsultBridge! 🌉 I'm Shaan, and I'm thrilled to help you find the perfect consultant for your needs. From career guidance to technology solutions, health & wellness to real estate - we've got India's best experts waiting to help you succeed. Explore our platform and sign in when you're ready to book! 🎯",
        "Namaste and welcome! 🙏 I'm Shaan, your dedicated consultant finder at ConsultBridge. Think of me as your personal guide to India's most trusted consulting platform. Whether you're an entrepreneur, professional, or someone seeking expert guidance, I'll help you discover the perfect consultant. Ready to transform your goals into achievements? 🌟",
        "Greetings, amazing human! ✨ I'm Shaan, your AI consultant matchmaker at ConsultBridge! From business wizards to legal eagles, financial gurus to tech ninjas - I know where to find India's top consulting talent. Browse around, and when you're ready to book your success story, just sign in! 🚀",
        "Well hello there, future game-changer! 🎮 I'm Shaan, your personal consultant concierge at ConsultBridge. Whether you need a business strategist, financial advisor, legal expert, or any of our 10+ specialties, I'm here to connect you with India's finest minds. Explore freely and sign in when ready to book! 💫",
      ];
      const randomGreeting =
        funnyGreetings[Math.floor(Math.random() * funnyGreetings.length)];

      return {
        reply: randomGreeting,
        requiresAuth: true,
        authMessage:
          "Sign in to book appointments and get personalized recommendations",
        isSpecialResponse: true,
      };
    }
    return "Hello! I'm Shaan, your personal consultant assistant at ConsultBridge - India's most trusted consulting platform! 🎆 I'm here to understand your specific needs and connect you with top-rated experts across 10+ categories. Whether it's business strategy, financial planning, legal advice, or personal growth - I'll find the perfect consultant for you. What challenge or goal are you working on today?";
  }

  // Enhanced empathetic responses for personal situations with conversation flow
  if (
    msg.includes("failed") && (msg.includes("interview") || msg.includes("job"))
  ) {
    const empathyResponses = [
      "I'm really sorry to hear about your interview. That must be incredibly disappointing, especially when you were hoping for that opportunity. 😔 Interview rejections can feel personal, but they often have nothing to do with your worth or capabilities. Sometimes it's just not the right fit, timing, or they had internal candidates.\n\nHow are you feeling about it? Would you like to talk through what happened, or are you looking for advice on next steps?",
      "Oh no, that's tough news about the interview. 💙 I can imagine how deflating that must feel, especially if you really wanted that position. Interview outcomes can be so unpredictable - sometimes it's about company culture fit, budget constraints, or they already had someone in mind.\n\nWhat's going through your mind right now? Are you looking to process what happened or thinking about your next move?",
      "I'm sorry that interview didn't work out. That's genuinely disappointing, and it's completely normal to feel frustrated or discouraged right now. 🤗 These setbacks can be really hard, especially when you've invested time and energy preparing.\n\nDo you want to talk about what you're thinking or feeling? Sometimes it helps to process these experiences before jumping into next steps."
    ];
    
    chatHistory.push({ sender: "bot", text: empathyResponses[Math.floor(Math.random() * empathyResponses.length)] });
    return empathyResponses[Math.floor(Math.random() * empathyResponses.length)];
  }

  if (
    msg.includes("failed") ||
    msg.includes("failure") ||
    msg.includes("exam")
  ) {
    return "I'm sorry to hear about that setback. That must be really frustrating, especially after putting in effort. Sometimes these experiences, while difficult, can actually redirect us toward better opportunities. How are you feeling about it right now?";
  }

  // Check if user wants to see all categories - EARLY DETECTION
  if (
    msg.includes("all categories") ||
    msg.includes("show all categories") ||
    msg.includes("all category") ||
    msg.includes("show categories") ||
    msg.includes("categories") ||
    (msg.includes("all") && msg.includes("categor"))
  ) {
    const allCategories = [
      { name: "Career Consultation", url: "career-consultation" },
      { name: "Legal Advisory", url: "legal-advisory" },
      { name: "Business Strategy", url: "business-strategy" },
      { name: "Health & Wellness", url: "health-%26-wellness" },
      { name: "Technology", url: "Technology" },
      { name: "Real Estate & Housing", url: "real-state-%26-Housing" },
      { name: "Financial Services", url: "financial-services" },
      {
        name: "Lifestyle & Personal Growth",
        url: "lifestyle-%26-personal-growth",
      },
      { name: "Travel & Hospitality", url: "travel-%26-hospitality" },
      { name: "Miscellaneous", url: "miscellaneous" },
    ];

    const categoryList = allCategories
      .map((cat, i) => `${i + 1}. ${cat.name}`)
      .join("\n");
    const reply = `Here are all 10 categories available on ConsultBridge:\n\n${categoryList}\n\nYou can explore any category by saying "all [category name]" or click the browse button below to see all categories on ConsultBridge.`;

    return {
      reply: String(reply),
      allCategories: {
        categories: allCategories,
        url: "http://localhost:3000/categories",
      },
      isSpecialResponse: true,
    };
  }

  // Category navigation detection - check this FIRST before other logic
  const categoryNavigationPatterns = [
    {
      keywords: [
        "all career",
        "career consultancy",
        "career consultants",
        "all career consultation",
        "job",
        "employment",
        "profession",
        "work guidance",
      ],
      category: "career-consultation",
      displayName: "Career Consultation",
    },
    {
      keywords: [
        "all legal",
        "legal consultancy",
        "legal consultants",
        "legal advisory",
        "law",
        "lawyer",
        "attorney",
        "legal advice",
        "legal help",
        "legal services",
      ],
      category: "legal-advisory",
      displayName: "Legal Advisory",
    },
    {
      keywords: [
        "all business",
        "business consultancy",
        "business consultants",
        "business strategy",
        "startup",
        "entrepreneur",
        "company",
        "enterprise",
      ],
      category: "business-strategy",
      displayName: "Business Strategy",
    },
    {
      keywords: [
        "all health",
        "health consultancy",
        "health consultants",
        "all wellness",
        "health and wellness",
        "medical",
        "doctor",
        "fitness",
        "nutrition",
      ],
      category: "health-%26-wellness",
      displayName: "Health & Wellness",
    },
    {
      keywords: [
        "all technology",
        "tech consultancy",
        "technology consultants",
        "all technolgy",
        "technology consultancy",
        "all tech",
        "IT",
        "software",
        "development",
      ],
      category: "Technology",
      displayName: "Technology",
    },
    {
      keywords: [
        "all real estate",
        "real estate consultancy",
        "property consultants",
        "housing consultancy",
        "property",
        "housing",
        "home",
        "apartment",
      ],
      category: "real-state-%26-Housing",
      displayName: "Real Estate & Housing",
    },
    {
      keywords: [
        "all financial",
        "finance consultancy",
        "financial consultants",
        "financial services",
        "money",
        "investment",
        "banking",
        "accounting",
      ],
      category: "financial-services",
      displayName: "Financial Services",
    },
    {
      keywords: [
        "all lifestyle",
        "lifestyle consultancy",
        "personal growth",
        "lifestyle and personal growth",
        "life coaching",
        "self improvement",
        "personal development",
      ],
      category: "lifestyle-%26-personal-growth",
      displayName: "Lifestyle & Personal Growth",
    },
    {
      keywords: [
        "all travel",
        "travel consultancy",
        "hospitality consultants",
        "travel and hospitality",
        "tourism",
        "vacation",
        "trip planning",
      ],
      category: "travel-%26-hospitality",
      displayName: "Travel & Hospitality",
    },
    {
      keywords: [
        "all miscellaneous",
        "miscellaneous consultancy",
        "other consultants",
        "general",
        "others",
        "misc",
      ],
      category: "miscellaneous",
      displayName: "Miscellaneous",
    },
  ];

  for (const pattern of categoryNavigationPatterns) {
    if (pattern.keywords.some((keyword) => msg.includes(keyword))) {
      const reply = `Great! Here are all the ${pattern.displayName} consultancies available on ConsultBridge. You can navigate through them to find the perfect match for your needs.`;

      // Return category navigation response
      return {
        reply: String(reply),
        categoryNavigation: {
          category: pattern.category,
          categoryName: pattern.displayName,
          url: `http://localhost:3000/category/${pattern.category}`,
        },
        isSpecialResponse: true,
      };
    }
  }

  // Enhanced health and wellness detection
  if (
    msg.includes("health") ||
    msg.includes("wellness") ||
    msg.includes("fitness") ||
    msg.includes("medical") ||
    msg.includes("doctor") ||
    msg.includes("nutrition") ||
    msg.includes("stressed") ||
    msg.includes("anxiety") ||
    msg.includes("depressed") ||
    msg.includes("mental health") ||
    msg.includes("therapy") ||
    msg.includes("counseling") ||
    msg.includes("workout") ||
    msg.includes("diet") ||
    msg.includes("lifestyle")
  ) {
    return "Your health and wellness journey is our priority! 🌿 ConsultBridge connects you with India's top health professionals, wellness coaches, fitness experts, nutritionists, and mental health specialists. Whether you need medical consultation, lifestyle coaching, or holistic wellness guidance, our certified experts are here to help you achieve optimal wellbeing. Would you like me to find the perfect health consultant for you?";
  }

  // ConsultBridge platform questions
  if (
    msg.includes("about consultbridge") ||
    msg.includes("what is consultbridge") ||
    msg.includes("consultbridge platform") ||
    msg.includes("how does consultbridge work")
  ) {
    return "ConsultBridge is India's premier consulting platform! 🎆 We connect individuals and businesses with top-rated consultants across 10+ categories including Business Strategy, Financial Services, Legal Advisory, Health & Wellness, Technology, Career Consultation, and more. Our mission is to make expert guidance accessible, affordable, and trustworthy. With verified consultants, transparent pricing, and secure booking, we're transforming how India accesses professional consulting services. How can I help you get started?";
  }

  if (
    msg.includes("lost job") ||
    msg.includes("unemployed") ||
    msg.includes("career change")
  ) {
    return "Career transitions can be challenging, but they're also opportunities for growth. I can help you connect with career counselors, resume experts, or business consultants who specialize in helping people navigate career changes and find new opportunities. What specific area would you like guidance on?";
  }

  if (
    msg.includes("relationship") ||
    msg.includes("divorce") ||
    msg.includes("family")
  ) {
    return "Personal relationships can be complex and emotionally challenging. I can connect you with relationship counselors, family therapists, or life coaches who specialize in helping people work through these situations. What kind of support are you looking for?";
  }

  // Enhanced understanding for complex queries
  if (msg.includes("financial guidance") && msg.includes("farming")) {
    return "I understand you need financial guidance for your farming business! That's a specialized area that requires expertise in both agriculture and finance. Let me find you consultants who specialize in agricultural finance, farm business planning, and rural business development.";
  }

  if (
    msg.includes("financial") &&
    msg.includes("business") &&
    (msg.includes("new") || msg.includes("starting"))
  ) {
    return "Starting a new business requires solid financial planning! I can connect you with financial consultants who specialize in startup funding, business financial planning, and cash flow management. What type of business are you starting?";
  }

  // Handle direct help requests - user wants advice, not consultancy
  if (
    (msg.includes("i dont need") || msg.includes("don't need") || msg.includes("dont need")) &&
    (msg.includes("consultancy") || msg.includes("consultant"))
  ) {
    return "I understand! You're looking for direct advice rather than consultant recommendations. I'm here to help however I can. What specific guidance or support are you looking for? I can try to offer some general insights or suggestions.";
  }

  // Handle "direct help" requests
  if (msg.includes("direct help") || msg.includes("direct advice")) {
    if (topicsDiscussed.includes("interview") || contextText.includes("interview")) {
      return "Absolutely! Let me give you some direct advice about interviews and job searching:\n\n**After a Failed Interview:**\n1. **Don't take it personally** - Most rejections aren't about you as a person\n2. **Ask for feedback** - Reach out politely asking what you could improve\n3. **Reflect honestly** - What went well? What could be better?\n4. **Practice more** - Do mock interviews with friends or family\n5. **Research better** - Learn more about the company and role next time\n\n**Moving Forward:**\n- Apply to multiple positions (don't put all hopes in one)\n- Network actively (many jobs come through connections)\n- Keep improving your skills\n- Stay positive and persistent\n\nWhat specific aspect would you like me to elaborate on?";
    }
    return "I'd be happy to give you direct advice! What specific situation or challenge would you like help with? The more details you share, the better I can tailor my suggestions.";
  }

  if (
    msg.includes("suggest") && msg.includes("solution") && 
    !msg.includes("consultant") && !msg.includes("book")
  ) {
    if (contextText.includes("interview") && contextText.includes("failed")) {
      return "Here are some practical steps you can take after a failed interview:\n\n**Immediate Steps:**\n1. **Process the emotions** - It's normal to feel disappointed\n2. **Ask for feedback** - Send a polite email asking for constructive feedback\n3. **Reflect objectively** - What went well? What could improve?\n\n**Skill Building:**\n4. **Practice interviews** - Mock interviews with friends or record yourself\n5. **Research techniques** - Learn about STAR method for behavioral questions\n6. **Address gaps** - If technical skills were lacking, focus on learning\n\n**Next Applications:**\n7. **Apply broadly** - Don't rely on just one opportunity\n8. **Network actively** - Many jobs come through connections\n9. **Tailor applications** - Customize resume and cover letter for each role\n\n**Mindset:**\n10. **Stay resilient** - One rejection doesn't define your capabilities\n\nWhat specific aspect would you like to work on first? 💪";
    }
    
    return "I'd be happy to help you brainstorm solutions! Could you tell me a bit more about the specific situation or challenge you're facing? The more context you give me, the better I can tailor my suggestions to your needs.";
  }

  // Handle no consultancies found with funny messages
  if (consultancies.length === 0 && userIntent.showConsultancies) {
    const funnyMessages = [
      "Oops! 🕵️ Looks like our consultants are playing hide and seek in that category! They must be really good at it because I can't find any. But don't worry, you can explore other ConsultBridge categories or try different keywords. Maybe they're just having a coffee break! ☕",
      "Well, this is awkward... 😅 It seems like our consultants in that area are either on a secret mission or they've mastered the art of invisibility! But hey, ConsultBridge has plenty of other amazing categories to explore. Let's try a different approach! 🎯",
      "Houston, we have a problem! 🚀 Our consultant radar isn't picking up anyone in that specific area right now. They might be busy saving the world or just really good at hide-and-seek! Try browsing other ConsultBridge categories or rephrasing your search. The perfect consultant is out there! 🌟",
      "Plot twist! 🎭 The consultants you're looking for seem to have vanished into thin air! Either they're ninjas or they're all at the same conference. Don't give up though - ConsultBridge has tons of other categories where amazing experts are waiting to help you! 🥷",
      "Whoopsie-daisy! 🤷‍♂️ Looks like that particular consultant species is currently extinct in our database! But don't worry, ConsultBridge is like a zoo full of other amazing expert animals. Let's go on a safari through our other categories! 🦁",
    ];

    return funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
  }

  // Show consultancies with confidence-based messaging
  if (consultancies.length > 0 && userIntent.showConsultancies) {
    // Sort by rating first, then by relevance score
    const sortedConsultancies = consultancies.sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;

      // Primary sort: by rating (descending)
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      // Secondary sort: by relevance score (descending)
      return scoreB - scoreA;
    });

    const suggestions = sortedConsultancies
      .map((c, i) => {
        const description = c.description || "Professional consulting services";
        const truncatedDesc =
          description.length > 200
            ? description.substring(0, 200) + "..."
            : description;

        // Generate star rating display
        const rating = c.rating || 0;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        const starDisplay =
          "★".repeat(fullStars) +
          (hasHalfStar ? "☆" : "") +
          "☆".repeat(emptyStars);

        const ratingText =
          rating > 0 ? `${starDisplay} (${rating.toFixed(1)})` : "New";

        const matchScore =
          c.score && c.score > 0 && c.score <= 1
            ? `• ${Math.round(c.score * 100)}% match`
            : "";

        return `${i + 1}. ${
          c.name
        } - ${ratingText}${matchScore}\n   ${truncatedDesc}`;
      })
      .join("\n\n");

    const confidenceMessage =
      userIntent.confidence > 0.8
        ? "Perfect! I found exactly what you're looking for (sorted by rating):"
        : userIntent.confidence > 0.6
        ? "Great! Based on your needs, here are some excellent matches (sorted by rating):"
        : "I found some consultants who might be able to help (sorted by rating):";

    const urgencyNote =
      userIntent.urgency === "high"
        ? " I understand this is urgent - these top-rated experts can provide immediate assistance."
        : userIntent.urgency === "medium"
        ? " These highly-rated professionals can help you soon."
        : "";

    // Only show consultancies if user is actually ready for professional help
    const isReadyForConsultants = 
      msg.includes("consultant") || 
      msg.includes("professional") || 
      msg.includes("expert") || 
      msg.includes("book") ||
      msg.includes("appointment") ||
      contextText.includes("need professional") ||
      contextText.includes("want consultant");
    
    if (!isReadyForConsultants && userIntent.confidence < 0.8) {
      // Offer both direct help and professional options, considering emotional state
      const supportiveMessage = emotionalState === "sad" || emotionalState === "frustrated" 
        ? "I can see you're going through a tough time. "
        : "";
      
      return `${supportiveMessage}I can help you in two ways:\n\n**Direct Support**: I can offer advice and suggestions right here in our conversation\n\n**Professional Help**: I can connect you with expert consultants who specialize in your area\n\nWhich would you prefer? Just say "direct help" for immediate advice or "find consultant" for professional services.`;
    }

    return `${confidenceMessage}\n\n${suggestions}\n\nWould you like to book a consultation with any of these top-rated specialists?${urgencyNote}`;
  }

  // Intelligent category-specific responses based on detected intent
  if (userIntent.category && userIntent.confidence > 0.3) {
    // If we detected the category but need more info, provide targeted response
    if (userIntent.category === "finance" && userIntent.confidence > 0.5) {
      return "I can help you find financial experts! Based on what you've mentioned, I'll search for consultants who specialize in your specific needs. Let me find the right financial advisors for you.";
    }

    if (userIntent.category === "business" && userIntent.confidence > 0.5) {
      return "Business consulting is my specialty! I'll find you experts who can help with your specific business needs. Let me search for the right consultants.";
    }

    // Generic category responses for lower confidence
    const followUps = {
      business:
        "I can help you with business strategy consulting! Are you starting a new business, need help with strategic planning, looking to scale, or facing operational challenges?",
      legal:
        "Legal advisory services are crucial for protecting your interests. What type of legal assistance do you need - contracts, compliance, disputes, or general legal guidance?",
      finance:
        "Financial services can transform your financial future! Are you looking for investment planning, wealth management, tax optimization, or business financial consulting?",

      technology:
        "Technology consulting can revolutionize your operations! Are you looking for software development, digital transformation, IT infrastructure, or tech strategy?",
      health:
        "Health and wellness are fundamental to success! Are you seeking medical consultation, fitness coaching, nutrition guidance, or mental wellness support?",
      career:
        "Career consultation can accelerate your professional growth! Are you looking for career planning, job search strategy, skill development, or professional coaching?",
      lifestyle:
        "Lifestyle and personal growth consulting can enhance your life quality! Are you looking for life coaching, personal development, productivity improvement, or work-life balance?",
      travel:
        "Travel and hospitality consulting can make your experiences memorable! Are you planning a trip, need event management, or looking for hospitality business guidance?",
      realestate:
        "Real estate and housing guidance is essential for major decisions! Are you buying, selling, investing in property, or need housing consultation?",
    };

    return (
      followUps[userIntent.category as keyof typeof followUps] ||
      "Tell me more about what you need help with so I can find the perfect consultant for you."
    );
  }

  // Booking intent with authentication check
  if (
    msg.includes("book") ||
    msg.includes("appointment") ||
    msg.includes("schedule")
  ) {
    if (!userId) {
      return "I'd love to help you book an appointment! However, you'll need to sign in first to proceed with booking. This ensures we can save your appointment details and send you confirmations.";
    }
    return "I'd love to help you book an appointment! First, let me understand what type of consultation you need. What specific challenge or goal would you like expert help with?";
  }

  // Pricing questions
  if (msg.includes("price") || msg.includes("cost") || msg.includes("fee")) {
    return "Great question! Consultation fees vary by expertise and service type. Each consultant sets their own pricing based on their experience and specialization. Once I understand your needs and find the right consultant, you'll see their exact pricing before booking. What type of consultation are you interested in?";
  }

  // Context-aware conversation flow - use provided conversation context
  const contextText = recentContext || chatHistory.slice(-3).map(m => m.text).join(" ").toLowerCase();
  
  // If user is continuing a conversation about a personal issue, be supportive
  if (topicsDiscussed.includes("interview") || contextText.includes("interview") || contextText.includes("failed")) {
    if (msg.includes("what") || msg.includes("how") || msg.includes("help")) {
      return "I'm here to support you through this. What specific aspect would you like help with? Are you looking for:\n\n• **Emotional support** - Processing feelings and staying motivated\n• **Practical advice** - Next steps for job searching and applications\n• **Interview skills** - Preparation tips and practice strategies\n• **Career planning** - Exploring different paths and opportunities\n• **Professional help** - Connecting with career consultants\n\nJust let me know what feels most helpful right now. 🤗";
    }
  }

  // Smarter default responses based on detected patterns and emotional state
  const tokens = tokenize(userMessage.toLowerCase());
  if (tokens.length > 3 && userIntent.confidence > 0.2) {
    // Only suggest consultants if user seems ready for professional help
    if (msg.includes("professional") || msg.includes("expert") || msg.includes("consultant")) {
      return "I understand you're looking for professional help. Let me search our database for experts who match your specific needs.";
    } else {
      // Adjust response based on emotional state
      if (emotionalState === "sad" || emotionalState === "frustrated") {
        return "I can sense you're going through a challenging time. I'm here to help in whatever way feels most supportive. Would you like me to offer some direct advice, or would you prefer to talk to a professional consultant who specializes in your situation?";
      } else {
        return "I'm here to help! Could you tell me more about what you're looking for? Are you seeking direct advice, professional consultation, or just someone to talk through your situation with?";
      }
    }
  }

  // Default - ask for clarification with context awareness
  if (emotionalState === "sad" || emotionalState === "frustrated") {
    const supportiveQuestions = [
      "I'm here to listen and help. What's on your mind right now? Whether you need someone to talk to or practical advice, I'm here for you. 💙",
      "It sounds like you're dealing with something challenging. I'm here to support you however I can. What would be most helpful - talking through your feelings or getting some practical guidance?",
      "I can sense this might be a difficult time for you. I'm here to help in whatever way feels right. What's weighing on your mind?"
    ];
    return supportiveQuestions[Math.floor(Math.random() * supportiveQuestions.length)];
  }
  
  const clarifyingQuestions = [
    "I'm here to help! What's on your mind today? Whether you need advice, want to talk something through, or are looking for professional guidance - just let me know. 😊",
    "How can I best support you today? I can offer direct advice, help you think through situations, or connect you with professional consultants if needed.",
    "I'm here to help however you need! What specific challenge or goal are you working on? I can provide guidance or connect you with experts.",
    "What brings you here today? Whether you need someone to brainstorm with, want professional advice, or just need to talk something through - I'm here! 🤗",
    "I'm ready to help! What would be most useful for you right now - direct advice, professional consultation, or just a supportive conversation?"
  ];

  return clarifyingQuestions[
    Math.floor(Math.random() * clarifyingQuestions.length)
  ];
}

// Function to update expired appointments
async function updateExpiredAppointments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all confirmed appointments with past dates
  const expiredAppointments = await Appointment.find({
    status: "confirmed",
    appointmentDate: { $lt: today },
  });

  // Update them to expired status
  if (expiredAppointments.length > 0) {
    await Appointment.updateMany(
      {
        status: "confirmed",
        appointmentDate: { $lt: today },
      },
      { status: "expired" }
    );
    console.log(
      `Updated ${expiredAppointments.length} appointments to expired status`
    );
  }
}

// Admin Functions
async function handleAdminReport() {
  // Update expired appointments first
  await updateExpiredAppointments();

  const totalBookings = await Appointment.countDocuments();
  const confirmedBookings = await Appointment.countDocuments({
    status: "confirmed",
  });
  const cancelledBookings = await Appointment.countDocuments({
    status: "cancelled",
  });
  const expiredBookings = await Appointment.countDocuments({
    status: "expired",
  });

  const popularConsultancies = await Appointment.aggregate([
    { $group: { _id: "$consultancyName", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // Get recent bookings excluding expired ones
  const recentBookings = await Appointment.find({
    status: { $ne: "expired" },
  })
    .sort({ createdAt: -1 })
    .limit(5);

  const report = `📊 Admin Report:\n\nTotal Bookings: ${totalBookings}\nConfirmed: ${confirmedBookings}\nCancelled: ${cancelledBookings}\nExpired: ${expiredBookings}\n\nTop Consultancies:\n${popularConsultancies
    .map((c, i) => `${i + 1}. ${c._id}: ${c.count} bookings`)
    .join("\n")}\n\nRecent Active Bookings:\n${recentBookings
    .map(
      (b) =>
        `• ${b.consultancyName} - ${new Date(
          b.appointmentDate
        ).toDateString()} (${b.status})`
    )
    .join("\n")}`;

  chatHistory.push({ sender: "bot", text: report });
  return new Response(
    JSON.stringify({
      reply: report,
      adminData: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        expiredBookings,
        popularConsultancies,
      },
    }),
    { status: 200 }
  );
}
