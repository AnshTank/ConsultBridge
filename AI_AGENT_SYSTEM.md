# 🤖 AI Agent Chatbot System

## Overview
ConsultBridge now features an advanced AI Agent-powered chatbot that combines rule-based responses with Gemini AI reasoning for intelligent consultancy discovery and booking.

## Architecture

### Core Components

1. **MessageOrchestrator** (`src/services/messageOrchestrator.ts`)
   - Routes messages between rule-based and AI handlers
   - Determines query complexity
   - Manages conversation flow

2. **AIAgent** (`src/services/aiAgent.ts`)
   - Uses Gemini AI for complex reasoning
   - Extracts user intent and actions
   - Handles multi-step conversations

3. **RuleBasedHandler** (`src/services/ruleBasedHandler.ts`)
   - Processes simple queries (greetings, categories)
   - Direct MongoDB lookups
   - Fast response for common patterns

4. **MemoryService** (`src/services/memoryService.ts`)
   - Stores conversation history in MongoDB
   - Tracks user preferences
   - Provides conversation context

5. **RecommendationEngine** (`src/services/recommendationEngine.ts`)
   - Searches consultancies with filters
   - Provides personalized recommendations
   - Handles availability checking

## API Endpoints

### Main Chat
```
POST /api/chatbot
{
  "message": "Find me legal consultants",
  "userId": "user123",
  "sessionId": "session456"
}
```

### Booking Integration
```
POST /api/chatbot/book
{
  "consultancyId": "cons123",
  "userId": "user123",
  "sessionId": "session456",
  "appointmentDetails": {...}
}
```

### Chat History
```
GET /api/chat-history?sessionId=session456
GET /api/chat-history?userId=user123
```

### System Test
```
GET /api/chatbot/test
POST /api/chatbot/test
```

## Features

### Smart Query Routing
- **Simple queries** → Rule-based handler (fast)
- **Complex queries** → AI Agent (intelligent)

### Conversation Memory
- Stores chat history in MongoDB
- Remembers user preferences
- Tracks booking history
- Provides conversation context

### AI Agent Tools
- `searchConsultancies(category, budget, location)`
- `getPastConversations(userId)`
- `createBooking(consultancyId, details)`
- `getConsultancyById(id)`

### Example Conversations

**Simple Query (Rule-based)**
```
User: "Hello"
Bot: "Hello! I'm Shaan, your personal consultant assistant..."
```

**Complex Query (AI Agent)**
```
User: "Find me the same consultancy I booked last month but online"
AI: Analyzes → getPastConversations → searchConsultancies
Bot: "I found your previous booking with ABC Legal. They're now available online..."
```

## Setup

1. **Add Gemini API Key**
```env
GEMINI_API_KEY=your_gemini_api_key
```

2. **Test the System**
```bash
curl -X POST http://localhost:3000/api/chatbot/test
```

3. **Chat with the Bot**
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "I need legal help", "userId": "test123"}'
```

## Flow Diagram

```
User Message
     ↓
MessageOrchestrator
     ↓
Simple Query? → RuleBasedHandler → MongoDB → Response
     ↓
Complex Query? → AIAgent → Gemini → Tools → Response
     ↓
MemoryService (Save Conversation)
     ↓
Return Response + Consultancies + Actions
```

## Benefits

✅ **Hybrid Intelligence**: Rule-based speed + AI reasoning  
✅ **Memory & Context**: Remembers past conversations  
✅ **Booking Integration**: Direct appointment creation  
✅ **Scalable Architecture**: Modular, maintainable code  
✅ **Fallback Handling**: Graceful error recovery  
✅ **Real-time Recommendations**: Smart consultancy matching  

## Next Steps

- Add voice input/output
- Implement sentiment analysis
- Add multi-language support
- Create admin analytics dashboard
- Integrate payment processing