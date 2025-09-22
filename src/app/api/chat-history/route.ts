import { NextRequest } from "next/server";
import connectDB from "../../../lib/mongodb";
import ChatSession from "../../../models/ChatSession";
import { MemoryService } from "../../../services/memoryService";

const memoryService = new MemoryService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');

  if (!sessionId && !userId) {
    return new Response(JSON.stringify({ error: "Session ID or User ID required" }), { status: 400 });
  }

  try {
    if (sessionId) {
      // Get specific session history
      const chatHistory = await memoryService.getConversationHistory(sessionId);
      return new Response(JSON.stringify({ 
        success: true,
        chatHistory,
        sessionId 
      }), { status: 200 });
    } else if (userId) {
      // Get user's past conversations and preferences
      const pastData = await memoryService.getPastConversations(userId);
      return new Response(JSON.stringify({
        success: true,
        ...pastData
      }), { status: 200 });
    }

  } catch (error) {
    console.error("Error retrieving chat history:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to retrieve chat history" 
    }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Session ID required" }), { status: 400 });
  }

  await connectDB();

  try {
    await ChatSession.deleteOne({ sessionId });
    
    return new Response(JSON.stringify({
      success: true,
      message: "Chat history cleared"
    }), { status: 200 });

  } catch (error) {
    console.error("Error clearing chat history:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to clear chat history" 
    }), { status: 500 });
  }
}