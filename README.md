# 🌉 ConsultBridge

**AI-Powered Consultancy Discovery Platform**

ConsultBridge is a modern, enterprise-grade platform that connects users with verified consultants across multiple industries. Built with Next.js 14, featuring an intelligent AI chatbot, real-time booking management, and comprehensive user experience optimization.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.32-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.8.3-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

## ✨ Features

- 🤖 **AI-Powered Chatbot** - Intelligent consultant matching with Gemini 2.5 Flash
- 📅 **Smart Booking System** - Real-time appointment scheduling with conflict detection
- 🔐 **Multi-Role Authentication** - Secure user, consultant, and admin portals
- 🎨 **Modern UI/UX** - Responsive design with dark/light mode support
- ⚡ **Performance Optimized** - Fast loading with advanced caching strategies
- 📱 **Mobile-First** - Optimized for all devices and screen sizes
- 🔍 **Advanced Search** - Category-based filtering and intelligent recommendations
- ⭐ **Review System** - Authentic feedback and rating system

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- npm 9 or higher
- MongoDB Atlas account
- Clerk account for authentication
- Google AI API key for chatbot

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnshTank/ConsultBridge.git
   cd ConsultBridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   GEMINI_API_KEY=your_google_ai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | Modern web application framework |
| **Styling** | Tailwind CSS, Framer Motion | Responsive design and animations |
| **Backend** | Next.js API Routes, Node.js | Serverless API endpoints |
| **Database** | MongoDB Atlas, Mongoose | Document-based data storage |
| **Authentication** | Clerk | User management and security |
| **AI/ML** | Google Gemini 2.5 Flash | Conversational AI and NLP |
| **Deployment** | Vercel | Serverless hosting platform |

### Key Components

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── (auth)/            # Authentication pages
│   └── (dashboard)/       # Dashboard pages
├── components/            # Reusable UI components
├── services/              # Business logic services
├── models/                # Database schemas
├── lib/                   # Utility libraries
└── styles/                # Global styles
```

## 📊 Database Schema

### Core Collections

- **Consultancies** - Verified consultant profiles and services
- **Appointments** - Booking and scheduling data
- **Categories** - Service categories and classifications
- **Reviews** - User feedback and ratings
- **Chat Sessions** - AI chatbot conversation history

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login

### Consultancies
- `GET /api/consultancies` - List consultancies
- `GET /api/consultancies/[id]` - Get consultancy details
- `POST /api/consultancies` - Create consultancy

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/[id]` - Update appointment

### AI Chatbot
- `POST /api/chatbot` - Process chat message
- `GET /api/chat-history` - Get conversation history

## 🤖 AI Chatbot Features

- **Intent Recognition** - Natural language understanding
- **Context Awareness** - Maintains conversation memory
- **Smart Recommendations** - AI-powered consultant matching
- **Booking Automation** - End-to-end appointment scheduling
- **Multi-language Support** - Handles various communication styles

## 🔐 Security

- **Authentication** - Clerk-based secure user management
- **Authorization** - Role-based access control (RBAC)
- **Data Protection** - Input sanitization and validation
- **Rate Limiting** - API endpoint protection
- **HTTPS/TLS** - Encrypted data transmission

## 📈 Performance

- **Core Web Vitals** - Optimized for Google's performance metrics
- **Lazy Loading** - Component and image optimization
- **Caching** - Multi-layer caching strategy
- **Code Splitting** - Optimized bundle sizes
- **Mobile Optimization** - Device-aware performance tuning

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Automatic deployments on push to main

### Manual Deployment

```bash
npm run build
npm run start
```

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For seamless deployment platform
- **Clerk** - For robust authentication solution
- **Google AI** - For powerful Gemini API
- **MongoDB** - For flexible database solution

## 📞 Support

- **GitHub Issues** - [Report bugs or request features](https://github.com/AnshTank/ConsultBridge/issues)
- **Developer** - [Ansh Tank](https://github.com/AnshTank)
- **LinkedIn** - [@anshtank9](https://www.linkedin.com/in/anshtank9)

---

**ConsultBridge** - *Bridging You to the Right Consultancy with Confidence*

Made with ❤️ by [Ansh Tank](https://github.com/AnshTank)