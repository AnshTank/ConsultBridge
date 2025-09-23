import { NextRequest } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Consultancy from "../../../../models/Consultancy";
import ChatSession from "../../../../models/ChatSession";

export async function GET() {
  try {
    // Test MongoDB connection
    await connectDB();
    
    // Test consultancy count
    const consultancyCount = await Consultancy.countDocuments();
    
    // Test chat session creation
    const testSession = new ChatSession({
      sessionId: `verify_${Date.now()}`,
      chatHistory: [
        { sender: 'user', text: 'Test message' },
        { sender: 'bot', text: 'Test response' }
      ]
    });
    await testSession.save();
    await ChatSession.deleteOne({ _id: testSession._id });

    return new Response(JSON.stringify({
      success: true,
      status: "🟢 AI Agent System Operational",
      checks: {
        mongodb: "✅ Connected",
        consultancies: `✅ ${consultancyCount} consultancies available`,
        chatSessions: "✅ Chat memory working",
        geminiApi: process.env.GEMINI_API_KEY ? "✅ Configured" : "⚠️ Not configured",
        environment: {
          mongoUrl: process.env.MONGO_URL ? "✅ Set" : "❌ Missing",
          geminiKey: process.env.GEMINI_API_KEY ? "✅ Set" : "❌ Missing"
        }
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
    });

  } catch (error) {
    console.error("Verification error:", error);
    return new Response(JSON.stringify({
      success: false,
      status: "🔴 System Error",
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        mongodb: "❌ Connection failed",
        environment: {
          mongoUrl: process.env.MONGO_URL ? "✅ Set" : "❌ Missing",
          geminiKey: process.env.GEMINI_API_KEY ? "✅ Set" : "❌ Missing"
        }
      },
      timestamp: new Date().toISOString()
    }), {
      status: 500,
    });
  }
}