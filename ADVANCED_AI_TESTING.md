# 🧠 Advanced AI Agent Testing - Natural Language Understanding

## 🎯 Test the Enhanced Capabilities

### 1️⃣ Natural Language Problem Understanding
**POST** `/api/chatbot`
```json
{
  "message": "I am facing issues with my startup's legal compliance in Vadodara under ₹10k budget",
  "userId": "advanced_test_001"
}
```

**Expected Response:**
```json
{
  "reply": "I understand you're dealing with legal compliance challenges for your startup in Vadodara with a budget under ₹10k. This is a common concern for new businesses. Let me find legal consultants in your area who specialize in startup compliance and work within your budget:\n\n1. Vadodara Legal Solutions - Legal\n   Startup compliance specialist, ₹8k package deals\n   ⭐ 4.7/5 | 📍 Vadodara | 💰 ₹150/hour\n\n2. Gujarat Business Law - Legal  \n   Corporate compliance and registration services\n   ⭐ 4.5/5 | 📍 Vadodara | 💰 ₹200/hour",
  "consultancies": [...],
  "intent": "problem",
  "nextSteps": ["View Profile", "Book Consultation", "Ask More Questions"]
}
```

---

### 2️⃣ Memory-Based Contextual Queries
**POST** `/api/chatbot`
```json
{
  "message": "Find me the same consultancy I booked last month but cheaper",
  "userId": "memory_test_user",
  "sessionId": "memory_session_123"
}
```

**Expected Response:**
```json
{
  "reply": "Based on your previous booking with TechLaw Solutions (₹300/hour), I found similar legal consultants that are more budget-friendly:\n\n💰 Legal Pro Services - ₹200/hour\n   Same expertise in tech law, 33% cheaper\n   ⭐ 4.6/5 | 🌐 Online available\n\n💰 Startup Legal Hub - ₹180/hour\n   Specializes in tech startups, 40% savings\n   ⭐ 4.4/5 | 📍 Your city + Online",
  "consultancies": [...],
  "intent": "memory",
  "nextSteps": ["View Profile", "Compare Options", "Book Now"]
}
```

---

### 3️⃣ Intelligent Booking with Conflict Detection
**POST** `/api/chatbot/book`
```json
{
  "consultancyId": "64f8a1b2c3d4e5f6789012ab",
  "userId": "booking_test_user",
  "sessionId": "booking_session_456",
  "appointmentDetails": {
    "date": "2024-12-30",
    "time": "14:00",
    "type": "online",
    "duration": 60,
    "notes": "Startup legal consultation"
  }
}
```

**Conflict Response:**
```json
{
  "success": false,
  "message": "Booking validation failed: Time slot 14:00 is already booked",
  "conflicts": ["Time slot 14:00 is already booked"],
  "suggestions": ["Available at 15:00", "Available at 16:00"],
  "availableSlots": ["09:00", "10:00", "11:00", "15:00", "16:00"]
}
```

**Success Response:**
```json
{
  "success": true,
  "appointment": {
    "_id": "64f8a1b2c3d4e5f6789012gh",
    "date": "2024-12-30",
    "time": "15:00",
    "status": "pending"
  },
  "message": "Great! I've successfully booked your online appointment with Smith & Associates on 2024-12-30 at 15:00. Your booking ID is 64f8a1b2c3d4e5f6789012gh.",
  "validation": {
    "isValid": true
  }
}
```

---

### 4️⃣ Ambiguous Query Clarification
**POST** `/api/chatbot`
```json
{
  "message": "I need guidance but not sure in which area",
  "userId": "clarification_test"
}
```

**Expected Response:**
```json
{
  "reply": "I'd be happy to help you find the right guidance! To point you in the right direction, could you tell me a bit more about what's on your mind?\n\n• Are you dealing with business or career decisions?\n• Do you have legal concerns or questions?\n• Are you looking for financial planning advice?\n• Is it related to technology or healthcare?\n\nEven a brief description of your situation would help me connect you with the perfect consultant.",
  "intent": "clarification",
  "nextSteps": ["Legal Help", "Business Advice", "Financial Planning", "Tech Support"]
}
```

---

### 5️⃣ Multi-Filter Complex Search
**POST** `/api/chatbot`
```json
{
  "message": "Find me business consultants under $100 per hour who can help with startup strategy, are available for online meetings, and preferably in Mumbai",
  "userId": "complex_search_test"
}
```

**Expected Response:**
```json
{
  "reply": "I found several business consultants matching your criteria perfectly! Here are startup strategy experts under $100/hour available online in Mumbai:\n\n🚀 Mumbai Startup Hub - $85/hour\n   Specializes in startup strategy and funding\n   ⭐ 4.9/5 rating | 📅 Available today | 🌐 Online\n\n💼 Business Growth Partners - $75/hour\n   Expert in lean startup methodology\n   ⭐ 4.7/5 rating | 📍 Mumbai | 🌐 Remote friendly\n\n🎯 Strategy Pro Consulting - $90/hour\n   15+ years in startup mentoring\n   ⭐ 4.8/5 rating | 📍 Mumbai | 💻 Online sessions",
  "consultancies": [...],
  "intent": "search",
  "nextSteps": ["View Profile", "Book Consultation", "See More Options"]
}
```

---

### 6️⃣ Conversational Booking Flow
**Sequence of Messages:**

**Message 1:**
```json
{
  "message": "I want to book with the first consultant you showed me",
  "userId": "booking_flow_test",
  "sessionId": "booking_flow_session"
}
```

**Response 1:**
```json
{
  "reply": "Great! I can help you book with Mumbai Startup Hub. They offer business consultation at $85/hour. What date and time works best for you?",
  "consultancies": [...],
  "needsBooking": true,
  "nextSteps": ["Choose Date", "Select Time", "Confirm Booking"]
}
```

**Message 2:**
```json
{
  "message": "Tomorrow at 2 PM would be perfect",
  "userId": "booking_flow_test",
  "sessionId": "booking_flow_session"
}
```

**Response 2:**
```json
{
  "reply": "Perfect! Let me book your appointment with Mumbai Startup Hub for tomorrow (Dec 26, 2024) at 2:00 PM. This will be an online session. Should I proceed with the booking?",
  "needsBooking": true,
  "nextSteps": ["Confirm Booking", "Change Time", "Add Notes"]
}
```

---

### 7️⃣ Problem-to-Solution Mapping
**POST** `/api/chatbot`
```json
{
  "message": "My e-commerce business is losing money due to tax compliance issues and I don't understand GST filing",
  "userId": "problem_mapping_test"
}
```

**Expected Response:**
```json
{
  "reply": "I understand how stressful tax compliance issues can be for e-commerce businesses, especially with GST complexities. This is definitely something that needs immediate attention to protect your business.\n\nBased on your situation, I recommend finance consultants who specialize in e-commerce taxation and GST compliance:\n\n📊 E-commerce Tax Experts - Finance\n   Specializes in online business GST and compliance\n   ⭐ 4.8/5 | 💰 ₹250/hour | 🎯 E-commerce focus\n\n📈 Digital Business Finance - Finance\n   GST filing and e-commerce accounting specialists\n   ⭐ 4.6/5 | 💰 ₹200/hour | 📱 Online consultations",
  "consultancies": [...],
  "intent": "problem",
  "nextSteps": ["Book Urgent Consultation", "View Profile", "Get Free Assessment"]
}
```

---

### 8️⃣ Context-Aware Follow-ups
**POST** `/api/chatbot`
```json
{
  "message": "What about their availability this week?",
  "userId": "context_test",
  "sessionId": "context_session_789"
}
```

**Expected Response:**
```json
{
  "reply": "Let me check the availability for E-commerce Tax Experts this week:\n\n📅 Available Slots:\n• Today: 3:00 PM, 4:00 PM\n• Tomorrow: 10:00 AM, 2:00 PM, 5:00 PM  \n• Thursday: 11:00 AM, 1:00 PM, 3:00 PM\n• Friday: 9:00 AM, 4:00 PM\n\nGiven the urgency of your tax compliance issues, I'd recommend booking the earliest available slot. Would you like me to book today at 3:00 PM?",
  "nextSteps": ["Book Today 3PM", "Book Tomorrow 10AM", "See More Times"]
}
```

---

## 🎨 Creative Test Scenarios

### Emotional Intelligence Test
```json
{
  "message": "I'm really stressed about my startup failing and don't know who to turn to for help",
  "userId": "emotional_test"
}
```

### Multi-Language Support Test
```json
{
  "message": "मुझे अपने बिजनेस के लिए legal advice चाहिए",
  "userId": "hindi_test"
}
```

### Edge Case Handling
```json
{
  "message": "Find me a consultant who can help with quantum computing legal issues for my AI startup that's also eco-friendly and works on weekends",
  "userId": "edge_case_test"
}
```

---

## ✅ Success Indicators

- 🧠 **Intent Recognition**: Correctly identifies problem vs search vs booking
- 💭 **Memory Integration**: References past conversations naturally  
- 🔍 **Smart Routing**: Uses AI for complex, rules for simple queries
- ⚡ **Conflict Detection**: Prevents booking conflicts proactively
- 🎯 **Contextual Responses**: Maintains conversation flow
- 🚀 **Next Steps**: Always guides user toward useful actions
- 🔄 **Learning**: Improves recommendations based on user history