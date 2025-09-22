import { NextRequest } from "next/server";
import { MemoryService } from "../../../../services/memoryService";
import { MessageOrchestrator } from "../../../../services/messageOrchestrator";

// WARNING: This endpoint should be disabled or protected in production!

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();
    const orchestrator = new MessageOrchestrator();
    const memoryService = new MemoryService();
    // Test memory service directly (no sensitive data returned)
    const pastData = await memoryService.getPastConversations(userId || 'test_user');
    // Test orchestrator
    const result = await orchestrator.processMessage(message || "Show my bookings", userId || 'test_user');
    return new Response(JSON.stringify({
      success: true,
      debug: {
        input: { message, userId },
        pastData,
        orchestratorResult: result
      },
      timestamp: new Date().toISOString()
    }), { status: 200 });
  } catch (error) {
    let errMsg = 'Unknown error';
    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
      errMsg = (error as any).message;
    }
    console.error("Debug error:", errMsg);
    return new Response(JSON.stringify({
      success: false,
      error: errMsg
    }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    message: "Debug endpoint for AI Agent troubleshooting (disable in production)",
    usage: "POST with {\"message\": \"Show my bookings\", \"userId\": \"test123\"}"
  }), { status: 200 });
}