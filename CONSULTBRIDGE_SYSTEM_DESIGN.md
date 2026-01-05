# 🌉 ConsultBridge System Design Documentation

**Version:** 1.0  
**Date:** December 2024  
**Author:** Ansh Tank  
**Project:** ConsultBridge - AI-Powered Consultancy Discovery Platform

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Design](#architecture-design)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [AI & Chatbot System](#ai--chatbot-system)
7. [Authentication & Authorization](#authentication--authorization)
8. [Frontend Architecture](#frontend-architecture)
9. [Performance & Optimization](#performance--optimization)
10. [Security Implementation](#security-implementation)
11. [Deployment & Infrastructure](#deployment--infrastructure)
12. [Monitoring & Analytics](#monitoring--analytics)
13. [Scalability Considerations](#scalability-considerations)
14. [Future Enhancements](#future-enhancements)

---

## 🎯 Executive Summary

ConsultBridge is a modern, AI-powered consultancy discovery platform built with Next.js 14, featuring an intelligent chatbot system, real-time booking management, and comprehensive user experience optimization. The platform connects users with verified consultants across multiple domains including Legal, Business, Finance, Technology, Career, and Health & Wellness.

### Key Features
- **AI-Powered Chatbot** with Gemini 2.5 Flash integration
- **Smart Booking System** with real-time availability
- **Multi-Role Authentication** (Users, Consultants, Admins)
- **Responsive Design** with dark/light mode support
- **Real-time Notifications** and status updates
- **Advanced Search & Filtering** capabilities
- **Professional Receipt Generation** with print functionality

---

## 🏗️ System Overview

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | Next.js | 14.2.32 | React framework with App Router |
| **UI Framework** | React | 18.3.1 | Component-based UI |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS framework |
| **Animations** | Framer Motion | 11.11.17 | Advanced animations |
| **Database** | MongoDB | 8.8.3 | NoSQL document database |
| **ODM** | Mongoose | 8.8.3 | MongoDB object modeling |
| **Authentication** | Clerk | 4.29.12 | User authentication & management |
| **AI/ML** | Google Gemini | 0.24.1 | Conversational AI |
| **Deployment** | Vercel | - | Serverless deployment platform |
| **Language** | TypeScript | 5.6.3 | Type-safe JavaScript |

### System Architecture Principles
- **Microservices Architecture** with modular components
- **Serverless-First** approach for scalability
- **API-First Design** for flexibility
- **Progressive Enhancement** for accessibility
- **Mobile-First** responsive design
- **Security by Design** with multiple layers

---

## 🏛️ Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Web Browser  │  Mobile Browser  │  PWA  │  API Clients    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CDN & EDGE LAYER                         │
├─────────────────────────────────────────────────────────────┤
│           Vercel Edge Network & Caching                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router  │  Middleware  │  API Routes          │
│  React Components    │  Server Actions │ Serverless Funcs  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  AI Chatbot Service  │  Booking Manager  │  Auth Service   │
│  Notification Svc    │  Email Service    │  PDF Generator  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  MongoDB Atlas  │  Clerk Auth DB  │  Session Storage       │
│  File Storage   │  Cache Layer    │  Analytics DB          │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Dashboard routes
│   ├── api/                # API endpoints
│   └── globals.css         # Global styles
├── components/             # Reusable UI components
│   ├── pages/              # Page-specific components
│   ├── ui/                 # Base UI components
│   └── layout/             # Layout components
├── services/               # Business logic services
│   ├── intelligentChatbot.ts
│   ├── bookingFlowManager.ts
│   └── appointmentStatusUpdater.ts
├── models/                 # Database models
├── lib/                    # Utility libraries
├── hooks/                  # Custom React hooks
├── contexts/               # React contexts
└── utils/                  # Helper functions
```

---

## 🗄️ Database Schema

### MongoDB Collections

#### 1. Consultancies Collection
```typescript
interface IConsultancy {
  _id: ObjectId;
  name: string;                    // Consultancy name
  rating: number;                  // 0-5 rating
  reviews: number;                 // Review count
  image: string;                   // Profile image URL
  category: string;                // Business category
  description: string;             // Detailed description
  location: string;                // Physical location
  expertise: string[];             // Areas of expertise
  price: string;                   // Hourly rate
  whyChooseUs?: string[];          // Unique selling points
  availability: {
    days: string[];                // Available days
    hours: string;                 // Available hours
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    password: string;              // Hashed password
  };
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    emailCode?: string;
    phoneCode?: string;
    emailCodeExpiry?: Date;
    phoneCodeExpiry?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. Appointments Collection
```typescript
interface IAppointment {
  _id: ObjectId;
  consultancyId: string;           // Reference to consultancy
  clientId: string;                // Clerk user ID
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDate: Date;
  appointmentTime: string;         // "10:00 AM"
  appointmentType: 'online' | 'offline';
  message?: string;                // Optional message
  consultancyName: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  meetingId?: string;              // For online meetings
  meetingStartedAt?: Date;
  meetingEndedAt?: Date;
  meetingDuration?: number;        // In minutes
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3. Categories Collection
```typescript
interface ICategory {
  _id: ObjectId;
  name: string;                    // "Legal Advisory"
  description: string;
  emoji: string;                   // "⚖️"
  slug: string;                    // "legal-advisory"
  createdAt: Date;
}
```

#### 4. Chat Sessions Collection
```typescript
interface IChatSession {
  _id: ObjectId;
  sessionId: string;               // Unique session identifier
  userId?: string;                 // Clerk user ID (optional)
  chatHistory: IMessage[];
  conversationMemory: {
    userProblem?: string;
    problemCategory?: string;
    emotionalState: string;
    topicsDiscussed: string[];
    lastProblemMention?: number;
    hasSharedProblem: boolean;
    recentContext: any[];
    communicationStyle: string;
    conversationFlow: string;
  };
  bookingState: {
    selectedConsultancy?: any;
    step: number;
    tempData?: any;
  };
  appointmentAction: {
    type: 'reschedule' | 'cancel' | '';
    step: number;
    selectedAppointment?: any;
  };
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  metadata?: {
    booking?: any;
    consultancies?: any[];
    paymentReceipt?: any;
    requiresAuth?: boolean;
    authMessage?: string;
    categoryNavigation?: any;
    allCategories?: any;
  };
}
```

#### 5. Reviews Collection
```typescript
interface IReview {
  _id: ObjectId;
  consultancyId: string;
  userId: string;
  user: string;                    // User display name
  rating: number;                  // 1-5 stars
  text: string;                    // Review content
  likes: number;
  replies: IReply[];
  createdAt: Date;
}

interface IReply {
  user: string;
  userId: string;
  text: string;
  createdAt: Date;
}
```

#### 6. Contact & Feedback Collections
```typescript
interface IContact {
  _id: ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  userType: 'user' | 'consultancy' | 'enterprise';
  inquiryType: string;
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'New' | 'In Progress' | 'Responded' | 'Resolved' | 'Closed';
  preferredContactMethod: 'Email' | 'Phone' | 'Either';
  createdAt: Date;
  updatedAt: Date;
}

interface IFeedback {
  _id: ObjectId;
  name: string;
  email: string;
  userType: 'user' | 'consultancy';
  topic: string;
  category: string;
  priority: string;
  rating: number;                  // 1-5 stars
  feedback: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Indexes

```javascript
// Performance optimization indexes
db.consultancies.createIndex({ "status": 1, "category": 1, "rating": -1 });
db.consultancies.createIndex({ "name": "text", "description": "text" });
db.appointments.createIndex({ "clientId": 1, "appointmentDate": 1 });
db.appointments.createIndex({ "consultancyId": 1, "status": 1 });
db.chatsessions.createIndex({ "sessionId": 1 }, { unique: true });
db.chatsessions.createIndex({ "lastActivity": 1 }, { expireAfterSeconds: 604800 });
db.reviews.createIndex({ "consultancyId": 1, "createdAt": -1 });
```

---

## 🔌 API Design

### RESTful API Endpoints

#### Authentication & Users
```
POST   /api/auth/sign-up          # User registration
POST   /api/auth/sign-in          # User login
POST   /api/auth/sign-out         # User logout
GET    /api/auth/user             # Get current user
PUT    /api/auth/user             # Update user profile
```

#### Consultancies
```
GET    /api/consultancies         # List all consultancies
GET    /api/consultancies/:id     # Get consultancy details
POST   /api/consultancies         # Create consultancy (admin)
PUT    /api/consultancies/:id     # Update consultancy
DELETE /api/consultancies/:id     # Delete consultancy
GET    /api/consultancies/search  # Search consultancies
POST   /api/consultancies/verify  # Verify consultancy
```

#### Appointments
```
GET    /api/appointments          # Get appointments (filtered)
POST   /api/appointments          # Create appointment
PUT    /api/appointments/:id      # Update appointment
DELETE /api/appointments/:id      # Cancel appointment
GET    /api/appointments/:id      # Get appointment details
```

#### Categories
```
GET    /api/categories            # List all categories
POST   /api/categories            # Create category (admin)
PUT    /api/categories/:id        # Update category
DELETE /api/categories/:id        # Delete category
```

#### AI Chatbot
```
POST   /api/chatbot               # Process chat message
GET    /api/chat-history          # Get chat history
DELETE /api/chat-history          # Clear chat history
```

#### Reviews & Feedback
```
GET    /api/reviews               # Get reviews for consultancy
POST   /api/reviews               # Create review
PUT    /api/reviews/:id           # Update review
DELETE /api/reviews/:id           # Delete review
POST   /api/feedback              # Submit feedback
POST   /api/contact               # Submit contact form
```

### API Response Format

```typescript
// Success Response
interface APIResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Error Response
interface APIError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}
```

### Rate Limiting & Security

```typescript
// Rate limiting configuration
const rateLimits = {
  '/api/chatbot': '100 requests per 15 minutes',
  '/api/appointments': '50 requests per hour',
  '/api/consultancies': '200 requests per hour',
  '/api/auth/*': '20 requests per 5 minutes'
};

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'"
};
```

---

## 🤖 AI & Chatbot System

### Intelligent Chatbot Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                INTENT RECOGNITION                           │
├─────────────────────────────────────────────────────────────┤
│  • Pattern Matching     • NLP Processing                   │
│  • Context Analysis     • Gemini AI Integration            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                CONVERSATION MEMORY                          │
├─────────────────────────────────────────────────────────────┤
│  • Session Context      • User Preferences                 │
│  • Booking State        • Emotional State                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                RESPONSE GENERATION                          │
├─────────────────────────────────────────────────────────────┤
│  • Business Logic       • AI-Generated Responses           │
│  • Template Responses   • Personalized Content             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                ACTION EXECUTION                             │
├─────────────────────────────────────────────────────────────┤
│  • Database Queries     • Booking Operations               │
│  • API Calls           • Notification Triggers             │
└─────────────────────────────────────────────────────────────┘
```

### Intent Recognition System

```typescript
interface Intent {
  type: 'greeting' | 'search_consultancy' | 'book_appointment' | 
        'view_bookings' | 'signin_help' | 'personal_counseling' | 
        'general_query';
  confidence: number;
  entities?: {
    consultantName?: string;
    category?: string;
    date?: string;
    time?: string;
  };
  context?: any;
}

class IntentRecognizer {
  async recognizeIntent(message: string, context: any): Promise<Intent> {
    // 1. Pattern matching for common intents
    if (this.isGreeting(message)) {
      return { type: 'greeting', confidence: 0.9 };
    }
    
    // 2. Business logic detection
    if (this.isBookingRequest(message)) {
      return {
        type: 'book_appointment',
        confidence: 0.8,
        entities: {
          consultantName: this.extractConsultantName(message),
          date: this.extractDate(message)
        }
      };
    }
    
    // 3. AI-powered intent recognition
    if (this.geminiAPI) {
      return await this.getAIIntent(message, context);
    }
    
    // 4. Fallback to category detection
    return this.detectCategory(message);
  }
}
```

### Booking Flow Management

```typescript
interface BookingSession {
  consultantId: string;
  consultantName: string;
  userId?: string;
  step: 'date_selection' | 'time_selection' | 'type_selection' | 
        'payment_selection' | 'confirmation' | 'processing' | 'complete';
  selectedDate?: string;
  selectedTime?: string;
  appointmentType?: 'online' | 'offline';
  paymentMethod?: string;
  lastActivity: number;
}

class BookingFlowManager {
  private sessions = new Map<string, BookingSession>();
  
  async processBookingStep(
    message: string, 
    sessionId: string, 
    currentSession: BookingSession
  ): Promise<BookingResponse> {
    switch (currentSession.step) {
      case 'date_selection':
        return await this.handleDateSelection(message, sessionId, currentSession);
      case 'time_selection':
        return await this.handleTimeSelection(message, sessionId, currentSession);
      // ... other steps
    }
  }
}
```

### AI Integration with Gemini

```typescript
class GeminiIntegration {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    }
  });
  
  async generateResponse(prompt: string, context: any): Promise<string> {
    const enhancedPrompt = this.buildContextualPrompt(prompt, context);
    const result = await this.model.generateContent(enhancedPrompt);
    return result.response.text();
  }
  
  private buildContextualPrompt(prompt: string, context: any): string {
    return `
      You are Shaan, an empathetic AI consultant finder assistant.
      Context: ${JSON.stringify(context)}
      User message: "${prompt}"
      
      Provide a helpful, personalized response that:
      1. Acknowledges the user's specific situation
      2. Offers relevant consultancy recommendations
      3. Maintains a warm, professional tone
      4. Guides toward appropriate next steps
    `;
  }
}
```

---

## 🔐 Authentication & Authorization

### Clerk Integration

```typescript
// Authentication configuration
const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/',
  afterSignUpUrl: '/onboarding'
};

// User roles and permissions
interface UserMetadata {
  role: 'user' | 'consultancy' | 'admin';
  permissions: string[];
  profile?: {
    consultancyId?: string;
    preferences?: any;
  };
}
```

### Middleware Protection

```typescript
// middleware.ts
export default authMiddleware({
  publicRoutes: [
    "/", "/categories", "/category/(.*)", "/consultancies",
    "/consultancy/(.*)", "/about", "/contact", "/api/(.*)"
  ],
  afterAuth(auth, req) {
    const role = auth.user?.publicMetadata?.role;
    const url = req.nextUrl.pathname;
    
    // Role-based redirects
    if (auth.userId && url === "/") {
      if (role === "consultancy") {
        return Response.redirect(new URL("/consultancy-dashboard", req.url));
      } else if (role === "user") {
        return Response.redirect(new URL("/dashboard", req.url));
      }
    }
  }
});
```

### Permission System

```typescript
class PermissionManager {
  private permissions = {
    user: [
      'view:consultancies',
      'create:appointments',
      'view:own_appointments',
      'create:reviews'
    ],
    consultancy: [
      'view:own_profile',
      'update:own_profile',
      'view:own_appointments',
      'update:appointment_status'
    ],
    admin: [
      'view:all',
      'create:all',
      'update:all',
      'delete:all'
    ]
  };
  
  hasPermission(userRole: string, action: string): boolean {
    return this.permissions[userRole]?.includes(action) || false;
  }
}
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App Layout
├── Navbar
│   ├── Logo
│   ├── Navigation Menu
│   ├── Theme Toggle
│   ├── User Menu
│   └── Button Skeleton (loading state)
├── Main Content
│   ├── Page Wrapper
│   │   ├── Loading Screen
│   │   ├── Page Transitions
│   │   └── Content
│   └── Chatbot
│       ├── Bot Animation
│       ├── Chat Interface
│       ├── Quick Actions
│       └── Booking Flow
└── Footer
    ├── Links
    ├── Social Media
    └── Copyright
```

### State Management

```typescript
// Context-based state management
interface AppState {
  theme: 'light' | 'dark';
  user: User | null;
  chatSession: ChatSession | null;
  bookingState: BookingState | null;
  notifications: Notification[];
}

// Theme Context
const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {}
});

// Popup Context for modal management
const PopupContext = createContext<{
  isAnyPopupOpen: boolean;
  openPopup: (id: string) => void;
  closePopup: (id: string) => void;
}>({
  isAnyPopupOpen: false,
  openPopup: () => {},
  closePopup: () => {}
});
```

### Performance Optimizations

```typescript
// Lazy loading components
const LazyConsultancyCard = lazy(() => import('./ConsultancyCard'));
const LazyChatbot = lazy(() => import('./Chatbot'));

// Memoized components
const MemoizedConsultancyList = memo(ConsultancyList);

// Custom hooks for performance
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// Intersection Observer for lazy loading
const useIntersectionObserver = (ref: RefObject<Element>) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  
  return isIntersecting;
};
```

### Responsive Design System

```css
/* Tailwind CSS configuration */
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0a',
          card: '#1a1a1a',
          surface: '#262626',
          border: '#525252',
        },
        neon: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          pink: '#ec4899',
        }
      }
    }
  }
}
```

---

## ⚡ Performance & Optimization

### Loading Strategies

```typescript
// Unified loading system
class LoadingManager {
  private loadingStates = new Map<string, boolean>();
  
  setLoading(key: string, isLoading: boolean) {
    this.loadingStates.set(key, isLoading);
    this.updateGlobalLoadingState();
  }
  
  private updateGlobalLoadingState() {
    const isAnyLoading = Array.from(this.loadingStates.values())
      .some(state => state);
    
    // Update global loading indicator
    document.body.classList.toggle('loading', isAnyLoading);
  }
}

// Device-aware optimizations
const deviceDetection = {
  isMobile: () => window.innerWidth < 768,
  isLowEnd: () => {
    return navigator.hardwareConcurrency <= 2 || 
           navigator.deviceMemory <= 4;
  },
  
  getOptimizedAnimations: () => {
    if (deviceDetection.isLowEnd()) {
      return { duration: 0.2, ease: 'linear' };
    }
    return { duration: 0.5, ease: 'easeOut' };
  }
};
```

### Caching Strategy

```typescript
// API response caching
const cacheConfig = {
  consultancies: { ttl: 300000, key: 'consultancies_list' }, // 5 minutes
  categories: { ttl: 3600000, key: 'categories_list' },      // 1 hour
  userProfile: { ttl: 600000, key: 'user_profile' }          // 10 minutes
};

class CacheManager {
  private cache = new Map<string, { data: any; expires: number }>();
  
  set(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }
  
  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached || cached.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }
}
```

### Image Optimization

```typescript
// Next.js Image component configuration
const imageConfig = {
  domains: ['images.unsplash.com', 'cdn.consultbridge.com'],
  formats: ['image/webp', 'image/avif'],
  sizes: {
    mobile: '(max-width: 768px) 100vw',
    tablet: '(max-width: 1024px) 50vw',
    desktop: '33vw'
  }
};

// Lazy loading with intersection observer
const LazyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} className="relative">
      {isInView && (
        <Image
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
};
```

---

## 🔒 Security Implementation

### Data Protection

```typescript
// Input sanitization
const sanitizeInput = (input: unknown): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')           // Remove HTML tags
    .trim()                         // Remove whitespace
    .slice(0, 2000);               // Limit length
};

// SQL injection prevention (MongoDB)
const sanitizeQuery = (query: any) => {
  if (typeof query === 'object' && query !== null) {
    for (const key in query) {
      if (key.startsWith('$')) {
        delete query[key];          // Remove MongoDB operators
      }
    }
  }
  return query;
};
```

### Rate Limiting

```typescript
// Rate limiting implementation
class RateLimiter {
  private requests = new Map<string, number[]>();
  
  isAllowed(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];
    
    // Filter out old requests
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (recentRequests.length >= limit) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }
}
```

### CSRF Protection

```typescript
// CSRF token generation and validation
const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(sessionToken, 'hex')
  );
};
```

### Content Security Policy

```typescript
// CSP headers configuration
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://clerk.dev'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https://images.unsplash.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://api.clerk.dev', 'https://generativelanguage.googleapis.com'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};
```

---

## 🚀 Deployment & Infrastructure

### Vercel Deployment Configuration

```json
// vercel.json
{
  "buildCommand": "npm install --omit=optional && npm run build",
  "installCommand": "npm install --omit=optional",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, no-cache, must-revalidate"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### Environment Configuration

```bash
# Production Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=AIza...
RESEND_API_KEY=re_...
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://consultbridge.vercel.app

# Optional SMS Services (Production)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Alternative Services
SENDGRID_API_KEY=your_sendgrid_key
VONAGE_API_KEY=your_vonage_key
TEXTBELT_API_KEY=your_textbelt_key
```

### Database Configuration

```typescript
// MongoDB Atlas configuration
const mongoConfig = {
  uri: process.env.MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    bufferMaxEntries: 0
  }
};

// Connection management
class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected = false;
  
  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }
  
  async connect(): Promise<void> {
    if (this.isConnected) return;
    
    try {
      await mongoose.connect(mongoConfig.uri, mongoConfig.options);
      this.isConnected = true;
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "start:prod": "NODE_ENV=production next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "test": "echo \"No tests specified\" && exit 0",
    "audit:fix": "npm audit fix --force",
    "check-updates": "npm outdated",
    "optimize-db": "node optimize-indexes.js"
  }
}
```

### Node.js Requirements

```json
{
  "engines": {
    "node": ">=18.17.0",
    "npm": ">=9"
  }
}
```

---

## 🧪 Testing Strategy

### Testing Framework (Future Implementation)

```typescript
// Jest configuration for unit testing
const jestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};

// Example test cases
describe('Chatbot Service', () => {
  test('should recognize booking intent', async () => {
    const intent = await recognizeIntent('I want to book a consultation');
    expect(intent.type).toBe('book_appointment');
    expect(intent.confidence).toBeGreaterThan(0.8);
  });
});

describe('Booking Flow Manager', () => {
  test('should generate available time slots', () => {
    const slots = generateTimeSlots('2024-12-25');
    expect(slots).toHaveLength(8);
    expect(slots[0]).toBe('09:00 AM');
  });
});
```

### API Testing

```typescript
// API endpoint testing with supertest
describe('/api/appointments', () => {
  test('POST should create new appointment', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .send({
        consultancyId: 'test-id',
        appointmentDate: '2024-12-25',
        appointmentTime: '10:00 AM'
      })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('pending');
  });
});
```

### Performance Testing

```typescript
// Load testing configuration
const loadTestConfig = {
  scenarios: {
    chatbot_interaction: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 }
      ]
    },
    booking_flow: {
      executor: 'constant-vus',
      vus: 50,
      duration: '10m'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1']
  }
};
```

---

## 📊 Monitoring & Analytics

### Performance Monitoring

```typescript
// Performance metrics collection
class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }
  
  getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || [];
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  // Core Web Vitals tracking
  trackCoreWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.recordMetric('FID', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
}
```

### Error Tracking

```typescript
// Error boundary and logging
class ErrorTracker {
  static logError(error: Error, context?: any) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context
    };
    
    // Send to monitoring service
    this.sendToMonitoring(errorData);
  }
  
  private static async sendToMonitoring(errorData: any) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }
}

// React Error Boundary
class ErrorBoundary extends Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    ErrorTracker.logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Analytics Integration

```typescript
// User behavior analytics
class AnalyticsManager {
  private events: AnalyticsEvent[] = [];
  
  track(event: string, properties?: any) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    };
    
    this.events.push(analyticsEvent);
    this.sendBatch();
  }
  
  // Batch send events to reduce network requests
  private async sendBatch() {
    if (this.events.length >= 10) {
      const batch = this.events.splice(0, 10);
      
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: batch })
        });
      } catch (error) {
        console.error('Analytics batch send failed:', error);
      }
    }
  }
}

interface AnalyticsEvent {
  event: string;
  properties?: any;
  timestamp: number;
  sessionId: string;
  userId?: string;
}
```

### Health Check Endpoints

```typescript
// Health monitoring endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});

app.get('/api/health/db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});
```

---

## 📈 Scalability Considerations

### Horizontal Scaling

```typescript
// Load balancing configuration
const loadBalancerConfig = {
  algorithm: 'round-robin',
  healthCheck: {
    path: '/api/health',
    interval: 30000,
    timeout: 5000
  },
  servers: [
    { host: 'server1.consultbridge.com', weight: 1 },
    { host: 'server2.consultbridge.com', weight: 1 },
    { host: 'server3.consultbridge.com', weight: 2 }
  ]
};

// Database sharding strategy
const shardingConfig = {
  shardKey: 'userId',
  shards: [
    { name: 'shard1', range: { min: 'a', max: 'm' } },
    { name: 'shard2', range: { min: 'n', max: 'z' } }
  ]
};
```

### Caching Layers

```typescript
// Multi-level caching strategy
class CacheStrategy {
  private levels = {
    L1: new Map<string, any>(),        // In-memory cache
    L2: null,                          // Redis cache (future)
    L3: null                           // CDN cache (Vercel)
  };
  
  async get(key: string): Promise<any> {
    // Try L1 cache first
    if (this.levels.L1.has(key)) {
      return this.levels.L1.get(key);
    }
    
    // Try L2 cache (Redis)
    if (this.levels.L2) {
      const value = await this.levels.L2.get(key);
      if (value) {
        this.levels.L1.set(key, value);
        return value;
      }
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl: number): Promise<void> {
    // Set in all available cache levels
    this.levels.L1.set(key, value);
    
    if (this.levels.L2) {
      await this.levels.L2.setex(key, ttl, JSON.stringify(value));
    }
  }
}
```

### Database Optimization

```typescript
// Query optimization strategies
class QueryOptimizer {
  // Aggregation pipeline for complex queries
  static buildConsultancyAggregation(filters: any) {
    return [
      { $match: { status: 'verified', ...filters } },
      { $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'consultancyId',
          as: 'reviews'
        }
      },
      { $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      { $sort: { averageRating: -1, reviewCount: -1 } },
      { $limit: 20 }
    ];
  }
  
  // Connection pooling
  static getOptimizedConnection() {
    return mongoose.createConnection(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000
    });
  }
}
```

### Backup & Recovery Strategy

```typescript
// Database backup configuration
const backupStrategy = {
  frequency: {
    full: 'daily at 2 AM UTC',
    incremental: 'every 6 hours',
    pointInTime: 'continuous (MongoDB Atlas)'
  },
  retention: {
    daily: '30 days',
    weekly: '12 weeks', 
    monthly: '12 months',
    yearly: '7 years'
  },
  storage: {
    primary: 'MongoDB Atlas Cloud Backup',
    secondary: 'AWS S3 Cross-Region Replication'
  },
  testing: {
    frequency: 'monthly',
    procedure: 'automated restore to staging environment'
  }
};

// Disaster recovery procedures
const disasterRecovery = {
  rto: '4 hours',  // Recovery Time Objective
  rpo: '1 hour',   // Recovery Point Objective
  procedures: [
    '1. Assess impact and activate DR team',
    '2. Switch DNS to backup infrastructure',
    '3. Restore database from latest backup',
    '4. Verify system functionality',
    '5. Communicate status to stakeholders'
  ]
};
```

---

## 🔮 Future Enhancements

### Planned Features

#### Phase 1: Core Enhancements (Q1 2025)
- **Video Calling Integration**: WebRTC-based video consultations
- **Payment Gateway**: Stripe integration for secure payments
- **Mobile App**: React Native mobile application
- **Advanced Search**: Elasticsearch integration
- **Real-time Notifications**: WebSocket-based notifications

#### Phase 2: AI & Analytics (Q2 2025)
- **AI Matching Algorithm**: ML-based consultant recommendations
- **Sentiment Analysis**: Analyze user feedback and reviews
- **Predictive Analytics**: Forecast demand and optimize pricing
- **Voice Assistant**: Voice-based chatbot interaction
- **Smart Scheduling**: AI-optimized appointment scheduling

#### Phase 3: Enterprise Features (Q3 2025)
- **Multi-tenant Architecture**: Enterprise client support
- **White-label Solution**: Customizable platform for partners
- **Advanced Reporting**: Business intelligence dashboard
- **API Marketplace**: Third-party integrations
- **Compliance Tools**: GDPR, HIPAA compliance features

### Technical Roadmap

```typescript
// Future architecture considerations
interface FutureArchitecture {
  microservices: {
    userService: 'Dedicated user management service';
    consultancyService: 'Consultancy management and verification';
    bookingService: 'Appointment and scheduling management';
    paymentService: 'Payment processing and billing';
    notificationService: 'Multi-channel notifications';
    analyticsService: 'Data analytics and reporting';
  };
  
  infrastructure: {
    containerization: 'Docker containers for services';
    orchestration: 'Kubernetes for container management';
    messageQueue: 'Redis/RabbitMQ for async processing';
    cdn: 'Global CDN for static assets';
    monitoring: 'Comprehensive observability stack';
  };
  
  dataLayer: {
    primaryDB: 'MongoDB for operational data';
    analyticsDB: 'ClickHouse for analytics';
    cacheLayer: 'Redis for caching';
    searchEngine: 'Elasticsearch for search';
    fileStorage: 'AWS S3 for file storage';
  };
}
```

### Performance Targets

| Metric | Current | Target (2025) |
|--------|---------|---------------|
| Page Load Time | < 3s | < 1s |
| API Response Time | < 500ms | < 200ms |
| Uptime | 99.5% | 99.9% |
| Concurrent Users | 1,000 | 10,000 |
| Database Queries/sec | 100 | 1,000 |
| Mobile Performance Score | 85 | 95 |

---

## 📝 Conclusion

ConsultBridge represents a comprehensive, modern approach to consultancy discovery and booking. The system is built with scalability, performance, and user experience as core principles. The modular architecture allows for easy maintenance and feature additions, while the AI-powered chatbot provides an intuitive interface for users to find and book consultations.

The platform successfully addresses the key challenges in the consultancy industry:
- **Discovery**: AI-powered search and recommendations
- **Trust**: Verified consultants and authentic reviews
- **Convenience**: Seamless booking and payment process
- **Communication**: Intelligent chatbot for 24/7 support
- **Accessibility**: Mobile-first, responsive design

With the planned enhancements and technical roadmap, ConsultBridge is positioned to become a leading platform in the consultancy services market.

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Next Review:** March 2025

---

*This document is maintained by the ConsultBridge development team and is updated regularly to reflect the current system architecture and future plans.*