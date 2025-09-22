# 🚀 AI Agent Chatbot - Postman Testing Suite

## 🎯 Base Configuration
```
Base URL: http://localhost:3000
Content-Type: application/json
```

---

## 🔍 Pre-Flight Check
**GET** `/api/chatbot/verify`

**Expected Response:**
```json
{
  "success": true,
  "status": "🟢 AI Agent System Operational",
  "checks": {
    "mongodb": "✅ Connected",
    "consultancies": "✅ 15 consultancies available",
    "chatSessions": "✅ Chat memory working",
    "geminiApi": "✅ Configured",
    "environment": {
      "mongoUrl": "✅ Set",
      "geminiKey": "✅ Set"
    }
  },
  "timestamp": "2024-12-25T10:25:30.123Z"
}
```

---

## 🧪 Test Scenarios

### 1️⃣ System Health Check
**GET** `/api/chatbot/test`

**Expected Response:**
```json
{
  "message": "AI Agent Chatbot System",
  "endpoints": {
    "/api/chatbot": "Main chat endpoint",
    "/api/chatbot/book": "Booking integration",
    "/api/chatbot/test": "System test",
    "/api/chat-history": "Conversation history"
  },
  "features": [
    "Smart query routing (Rule-based vs AI)",
    "Conversation memory with MongoDB",
    "Gemini AI for complex reasoning",
    "Consultancy recommendation engine",
    "Booking integration",
    "Past conversation analysis"
  ]
}
```

---

### 2️⃣ Greeting Test (Rule-Based)
**POST** `/api/chatbot`
```json
{
  "message": "Hello",
  "userId": "shaan_test_001"
}
```

**Expected Response:**
```json
{
  "reply": "Hello! I'm Shaan, your personal consultant assistant at ConsultBridge. I can help you find the perfect consultant for your needs. What type of consultation are you looking for?",
  "sessionId": "temp_1735123456789_abc123def",
  "chatHistory": [
    {
      "sender": "user",
      "text": "Hello",
      "timestamp": "2024-12-25T10:30:45.123Z"
    },
    {
      "sender": "bot",
      "text": "Hello! I'm Shaan...",
      "timestamp": "2024-12-25T10:30:45.456Z"
    }
  ]
}
```

---

### 3️⃣ Category Search (Rule-Based)
**POST** `/api/chatbot`
```json
{
  "message": "I need legal consultation",
  "userId": "shaan_test_001",
  "sessionId": "session_legal_test"
}
```

**Expected Response:**
```json
{
  "reply": "I found some excellent legal consultants for you:\n\n1. Smith & Associates - Legal\n   Expert legal consultation for business and personal matters...\n\n2. Legal Pro Services - Legal\n   Comprehensive legal support with 15+ years experience...\n\nWould you like to book a consultation with any of them?",
  "sessionId": "session_legal_test",
  "consultancies": [
    {
      "_id": "64f8a1b2c3d4e5f6789012ab",
      "name": "Smith & Associates",
      "category": "Legal",
      "description": "Expert legal consultation...",
      "rating": 4.8,
      "pricing": { "hourlyRate": 150 }
    }
  ],
  "chatHistory": [...]
}
```

---

### 4️⃣ Complex AI Query (Gemini-Powered)
**POST** `/api/chatbot`
```json
{
  "message": "Find me business consultants under $100 per hour who can help with startup strategy and are available for online meetings",
  "userId": "shaan_test_001",
  "sessionId": "session_complex_ai"
}
```

**Expected Response:**
```json
{
  "reply": "I found several business consultants that match your criteria perfectly! Here are startup strategy experts under $100/hour available online:\n\n🚀 StartupGuru Pro - $85/hour\n   Specializes in startup strategy, business planning, and growth hacking\n   ⭐ 4.9/5 rating | 📅 Available today\n\n💼 Business Boost Consulting - $75/hour\n   Expert in lean startup methodology and market validation\n   ⭐ 4.7/5 rating | 🌐 100% remote\n\nWould you like me to check their availability for this week?",
  "sessionId": "session_complex_ai",
  "consultancies": [
    {
      "_id": "64f8a1b2c3d4e5f6789012cd",
      "name": "StartupGuru Pro",
      "category": "Business",
      "pricing": { "hourlyRate": 85 },
      "isRemote": true,
      "rating": 4.9
    }
  ],
  "needsBooking": false,
  "chatHistory": [...]
}
```

---

### 5️⃣ Memory & Past Conversations
**POST** `/api/chatbot`
```json
{
  "message": "Show me consultants similar to the one I booked last month",
  "userId": "shaan_test_001",
  "sessionId": "session_memory_test"
}
```

**Expected Response:**
```json
{
  "reply": "Based on your previous booking with TechLaw Solutions (Legal Technology), I found similar consultants:\n\n🔧 Digital Legal Experts - Legal Tech\n   Specializes in software licensing and tech compliance\n   ⭐ 4.8/5 | 💰 $120/hour\n\n⚖️ Innovation Law Group - Legal Tech\n   Startup legal services and IP protection\n   ⭐ 4.6/5 | 💰 $140/hour\n\nWould you like to book with any of these, or shall I find more options?",
  "sessionId": "session_memory_test",
  "consultancies": [...],
  "chatHistory": [...]
}
```

---

### 6️⃣ Get Conversation History
**GET** `/api/chat-history?sessionId=session_legal_test`

**Expected Response:**
```json
{
  "success": true,
  "chatHistory": [
    {
      "sender": "user",
      "text": "I need legal consultation",
      "timestamp": "2024-12-25T10:35:12.123Z"
    },
    {
      "sender": "bot",
      "text": "I found some excellent legal consultants...",
      "timestamp": "2024-12-25T10:35:12.456Z",
      "metadata": {
        "consultancies": [...]
      }
    }
  ],
  "sessionId": "session_legal_test"
}
```

---

### 7️⃣ User Profile & Preferences
**GET** `/api/chat-history?userId=shaan_test_001`

**Expected Response:**
```json
{
  "success": true,
  "recentBookings": [
    {
      "_id": "64f8a1b2c3d4e5f6789012ef",
      "consultancyId": {
        "name": "TechLaw Solutions",
        "category": "Legal"
      },
      "date": "2024-11-15",
      "status": "completed"
    }
  ],
  "preferences": {
    "preferredCategories": ["legal", "business"],
    "communicationStyle": "professional",
    "bookingPreferences": {}
  },
  "conversationSummary": "Your last booking was with TechLaw Solutions for Legal consultation. We've had 3 conversation sessions with 12 messages total."
}
```

---

### 8️⃣ Booking Integration
**POST** `/api/chatbot/book`
```json
{
  "consultancyId": "64f8a1b2c3d4e5f6789012ab",
  "userId": "shaan_test_001",
  "sessionId": "session_booking_test",
  "appointmentDetails": {
    "date": "2024-12-30",
    "time": "14:00",
    "type": "online",
    "duration": 60,
    "notes": "Startup legal consultation"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "appointment": {
    "_id": "64f8a1b2c3d4e5f6789012gh",
    "userId": "shaan_test_001",
    "consultancyId": "64f8a1b2c3d4e5f6789012ab",
    "date": "2024-12-30",
    "time": "14:00",
    "status": "pending",
    "createdAt": "2024-12-25T10:40:15.789Z"
  },
  "consultancy": {
    "_id": "64f8a1b2c3d4e5f6789012ab",
    "name": "Smith & Associates",
    "category": "Legal"
  },
  "message": "Great! I've successfully booked your appointment with Smith & Associates. Your booking ID is 64f8a1b2c3d4e5f6789012gh. You'll receive a confirmation email shortly."
}
```

---

### 9️⃣ System Stress Test
**POST** `/api/chatbot/test`

**Expected Response:**
```json
{
  "success": true,
  "testResults": [
    {
      "input": "Hello",
      "output": {
        "reply": "Hello! I'm Shaan...",
        "sessionId": "test_session_1735123456789"
      }
    },
    {
      "input": "I need legal help",
      "output": {
        "reply": "I found some excellent legal consultants...",
        "consultancies": [...]
      }
    }
  ],
  "message": "AI Agent system test completed"
}
```

---

## 🎨 Creative Test Scenarios

### Personality Test
```json
{
  "message": "Hey Shaan! I'm feeling overwhelmed with my startup. Can you help me find someone who gets it?",
  "userId": "creative_test_001"
}
```

### Multi-Language Test
```json
{
  "message": "Necesito ayuda legal para mi empresa",
  "userId": "multilang_test"
}
```

### Edge Case Test
```json
{
  "message": "Find me a consultant who can help with quantum computing legal issues for my AI startup that's also eco-friendly",
  "userId": "edge_case_test"
}
```

---

## 🔧 Debug & Troubleshooting

### 🔍 Debug Booking Issue
**POST** `/api/chatbot/debug`
```json
{
  "message": "Show my bookings",
  "userId": "test_user_123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "debug": {
    "input": {
      "message": "Show my bookings",
      "userId": "test_user_123"
    },
    "pastData": {
      "recentBookings": [...],
      "preferences": {...},
      "conversationSummary": "..."
    },
    "orchestratorResult": {
      "reply": "Here are your recent bookings...",
      "sessionId": "..."
    }
  }
}
```

### 🩺 Fixed Booking Query Test
**POST** `/api/chatbot`
```json
{
  "message": "Show my bookings",
  "userId": "test_user_123"
}
```

**Expected Response:**
```json
{
  "reply": "Here are your recent bookings:\n\n📅 TechLaw Solutions - Legal\n   Date: Nov 15, 2024 | Status: Completed\n   ⭐ Great session on startup legal matters\n\n📅 Business Pro Consulting - Business\n   Date: Oct 22, 2024 | Status: Completed\n   💼 Helped with business strategy\n\nWould you like to book another session or find similar consultants?",
  "sessionId": "session_bookings_123",
  "consultancies": [...],
  "chatHistory": [...]
}
```

---

## 🚨 Error Scenarios

### Missing Message
```json
{
  "userId": "error_test"
}
```
**Expected:** `400 Bad Request - Message is required`

### Invalid Consultancy ID
```json
{
  "consultancyId": "invalid_id",
  "userId": "error_test"
}
```
**Expected:** `404 Not Found - Consultancy not found`

---

## ✅ Success Indicators
- ✅ System responds within 2-3 seconds
- ✅ Conversation memory persists across sessions
- ✅ AI provides contextual, helpful responses
- ✅ Consultancy recommendations are relevant
- ✅ Booking integration works seamlessly
- ✅ Error handling is graceful and informative