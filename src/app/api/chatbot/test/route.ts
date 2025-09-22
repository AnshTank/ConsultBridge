import { NextRequest } from "next/server";
import { MessageOrchestrator } from "../../../../services/messageOrchestrator";

export async function POST(req: NextRequest) {
  try {
    const orchestrator = new MessageOrchestrator();
    // Diverse and edge-case test messages
    const testMessages = [
      "Hello",
      "I need legal help",
      "Find me the same consultancy I booked last month but online",
      "Show me business consultants under $100/hour",
      "Book an appointment for tomorrow at 10am",
      "I want to cancel my last booking",
      "What is ConsultBridge?",
      "I have a problem with my payment",
      "Can I get a consultant for mental health?",
      "Schedule a meeting with a tech expert next week",
      "",
      "<script>alert('xss')</script>",
      "I need urgent help with a contract dispute"
    ];

    const results = [];
    const failed = [];
    for (const message of testMessages) {
      try {
        const result = await orchestrator.processMessage(message, "test_user", `test_session_${Date.now()}`);
        results.push({ input: message, output: result });
      } catch (err) {
        failed.push({ input: message, error: (err as any)?.message || 'Unknown error' });
      }
    }

    return new Response(JSON.stringify({
      success: failed.length === 0,
      error: failed.length > 0 ? "Some test cases failed" : null,
      data: { testResults: results, failed },
      message: failed.length > 0 ? `${failed.length} test(s) failed` : "AI Agent system test completed"
    }), { status: failed.length > 0 ? 207 : 200 });
  } catch (error) {
    let errMsg = 'Unknown error';
    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
      errMsg = (error as any).message;
    }
    console.error("Test API error:", errMsg);
    return new Response(JSON.stringify({
      success: false,
      error: errMsg,
      data: null,
      message: "AI Agent system test failed"
    }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    success: true,
    error: null,
    message: "AI Agent Chatbot System",
    data: {
      endpoints: {
        "/api/chatbot": "Main chat endpoint",
        "/api/chatbot/book": "Booking integration",
        "/api/chatbot/test": "System test",
        "/api/chat-history": "Conversation history"
      },
      features: [
        "Smart query routing (Rule-based vs AI)",
        "Conversation memory with MongoDB",
        "Gemini AI for complex reasoning",
        "Consultancy recommendation engine",
        "Booking integration",
        "Past conversation analysis"
      ]
    }
  }), { status: 200 });
}