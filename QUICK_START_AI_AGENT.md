# 🚀 Quick Start - AI Agent Chatbot

## ⚡ 30-Second Setup

1. **Start the server:**
```bash
npm run dev
```

2. **Verify system:**
```bash
curl http://localhost:3000/api/chatbot/verify
```

3. **Test basic chat:**
```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "userId": "test123"}'
```

## 🎯 Expected Results

### ✅ System Verification
```json
{
  "success": true,
  "status": "🟢 AI Agent System Operational",
  "checks": {
    "mongodb": "✅ Connected",
    "consultancies": "✅ X consultancies available",
    "geminiApi": "✅ Configured"
  }
}
```

### ✅ Chat Response
```json
{
  "reply": "Hello! I'm Shaan, your personal consultant assistant at ConsultBridge...",
  "sessionId": "temp_1735123456789_abc123",
  "chatHistory": [...]
}
```

## 🔧 Environment Check

Your `.env.local` should have:
```env
MONGO_URL=mongodb+srv://...
GEMINI_API_KEY=AIzaSy...
```

## 🧪 Test Scenarios

1. **Greeting:** `"Hello"`
2. **Search:** `"I need legal help"`
3. **Complex:** `"Find business consultants under $100/hour"`
4. **Memory:** `"Show my previous bookings"`

## 🎨 Creative Responses

The AI Agent provides:
- 🤖 **Contextual responses** based on conversation history
- 🎯 **Smart recommendations** using Gemini AI
- 💾 **Memory persistence** across sessions
- 📚 **Learning from interactions**

## 🚨 Troubleshooting

**MongoDB Error?**
- Check `MONGO_URL` in `.env.local`
- Verify network connection

**Gemini Error?**
- Check `GEMINI_API_KEY` in `.env.local`
- System falls back to rule-based responses

**No Consultancies?**
- Run: `GET /api/consultancies` to check data
- Seed database if empty

## 🎉 Success Indicators

- ✅ Verification endpoint returns green status
- ✅ Chat responses are contextual and helpful
- ✅ Conversation history persists
- ✅ Consultancy recommendations work
- ✅ System handles errors gracefully