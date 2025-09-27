"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { SendHorizonal, Bot, X, Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useScrollLock } from "../hooks/useScrollLock";
import "../styles/chatbot.css";

// Payment Step Animation Component
function PaymentStep({ step }: { step: { step: number; text: string; icon: string; delay: number } }) {
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setIsActive(true), step.delay);
    const timer2 = setTimeout(() => setIsComplete(true), step.delay + 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [step.delay]);

  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-500 ${
      isActive ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-50 opacity-50'
    }`}>
      <div className={`text-lg transition-all duration-300 ${
        isActive ? 'scale-110' : 'scale-100 opacity-50'
      }`}>
        {isComplete ? '✅' : isActive ? step.icon : '⏳'}
      </div>
      <div className={`flex-1 transition-all duration-300 ${
        isActive ? 'text-blue-700 font-medium' : 'text-gray-500'
      }`}>
        {step.text}
      </div>
      {isActive && !isComplete && (
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  );
}

export default function Chatbot() {
  const router = useRouter();
  const { isSignedIn, userId, isLoaded } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showEntrance, setShowEntrance] = useState(false);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [entranceGreeting, setEntranceGreeting] = useState("Hello there!");
  const [sessionId, setSessionId] = useState<string>("");
  const [pageLoaded, setPageLoaded] = useState(false);
  const [messages, setMessages] = useState<
    {
      sender: "user" | "bot";
      text: string;
      booking?: any;
      consultancies?: any[];
      paymentReceipt?: any;
      requiresAuth?: boolean;
      authMessage?: string;
      processingPayment?: boolean;
      paymentSteps?: Array<{step: number; text: string; icon: string; delay: number}>;
      bookings?: any[];
      actionType?: string;
      categoryNavigation?: {
        category: string;
        categoryName: string;
        url: string;
      };
      allCategories?: {
        categories: { name: string; url: string }[];
        url: string;
      };
    }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showChatbox, setShowChatbox] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [waitingTip, setWaitingTip] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentTypingInterval, setCurrentTypingInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Enable scroll lock when chatbot is open
  useScrollLock(isOpen || showEntrance);

  const waitingTips = [
    "💡 Did you know? We have 500+ verified consultants ready to help!",
    "⚡ Pro tip: Be specific about your needs for better recommendations",
    "🎯 Fun fact: 95% of our clients find their perfect consultant match",
    "🚀 Quick tip: You can reschedule appointments anytime through chat",
    "💼 Did you know? We cover 50+ business categories",
    "⭐ Fun fact: Our average response time is under 2 minutes",
    "🔍 Pro tip: Use keywords like 'legal', 'marketing', 'finance' for faster results",
    "📊 Did you know? You can view detailed consultant profiles before booking",
  ];

  const greetings = [
    "Well hello hello! 👋",
    "Hey there, superstar! ✨",
    "Greetings, earthling! 🚀",
    "What's cooking, good looking? 😎",
    "Ahoy there, captain! ⚓",
    "Howdy, partner! 🤠",
  ];

  // Handle Clerk errors gracefully
  useEffect(() => {
    const handleClerkError = (error: any) => {
      console.warn("Clerk error handled:", error);
      // Don't crash the app, just log the error
    };

    window.addEventListener("unhandledrejection", handleClerkError);
    return () =>
      window.removeEventListener("unhandledrejection", handleClerkError);
  }, []);

  // Check if page is fully loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 5000); // Wait 5 seconds for smooth appearance

    return () => clearTimeout(timer);
  }, []);

  // Load chat history from database on component mount
  useEffect(() => {
    if (!isLoaded || !pageLoaded) return;

    const loadChatHistory = async () => {
      let savedSessionId = sessionStorage.getItem("chatSessionId");

      // Create new session if none exists
      if (!savedSessionId) {
        savedSessionId = `session_${Date.now()}_${Math.random()}`;
        sessionStorage.setItem("chatSessionId", savedSessionId);
      }

      setSessionId(savedSessionId);

      // Load chat history from database
      try {
        const response = await fetch(
          `/api/chat-history?sessionId=${savedSessionId}&userId=${userId || ""}`
        );
        const data = await response.json();

        if (data.success && data.chatHistory.length > 0) {
          setMessages(data.chatHistory);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, [isLoaded, isSignedIn, userId, pageLoaded]);

  // Messages are now saved automatically via API calls

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, typingMessage, isTyping]);

  const typeMessage = (text: string, callback?: () => void) => {
    setIsTyping(true);
    setTypingMessage("");
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setTypingMessage(text.slice(0, index + 1));
        index++;
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 10);
      } else {
        clearInterval(typeInterval);
        setCurrentTypingInterval(null);
        setIsTyping(false);
        setTypingMessage("");
        callback?.();
      }
    }, 25);

    setCurrentTypingInterval(typeInterval);
  };

  const stopTyping = () => {
    if (currentTypingInterval) {
      clearInterval(currentTypingInterval);
      setCurrentTypingInterval(null);
    }

    // Save the partially typed message to chat history
    if (typingMessage && typingMessage.trim()) {
      const partialMessage = {
        sender: "bot" as const,
        text: typingMessage + " [interrupted]",
      };
      setMessages((prev) => [...prev, partialMessage]);
    }

    setIsTyping(false);
    setTypingMessage("");
    setIsLoading(false);
    setLoadingProgress(0);
    setWaitingTip("");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isTyping) return;

    const userMessage = { sender: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Show random tip and progress animation
    const randomTip =
      waitingTips[Math.floor(Math.random() * waitingTips.length)];
    setWaitingTip(randomTip);
    setLoadingProgress(0);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userId: userId || null,
          sessionId: sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Handle consultancy redirect
      if (data.redirectToConsultancy) {
        closeChatbot();
        router.push(`/consultancy/${data.redirectToConsultancy}`);
        return;
      }

      // Update sessionId if provided by server
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        sessionStorage.setItem("chatSessionId", data.sessionId);
      }

      // Don't overwrite messages with server history during normal chat

      // Handle new backend response format: { success, error, data }
      let reply = data?.data?.reply ?? data.reply;
      if (typeof reply !== "string") {
        console.error("Invalid reply format:", reply);
        reply = "Sorry, there was an issue processing your request. Please try again.";
      }

      // If search is processing, show search animation
      if (data.processingSearch) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "🔍 Searching our database..." },
        ]);

        // Step 1: Analyzing requirements
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { sender: "bot", text: "🧠 Analyzing your requirements..." },
          ]);
        }, 1000);

        // Step 2: Matching consultants
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { sender: "bot", text: "⚡ Matching you with top consultants..." },
          ]);
        }, 2000);

        // Step 3: Verifying credentials
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { sender: "bot", text: "✅ Verifying consultant credentials..." },
          ]);
        }, 3000);

        // Final: Show results
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              sender: "bot",
              text: reply,
              consultancies: data?.data?.consultancies || data.consultancies,
            },
          ]);
        }, 4000);
      } else if (data.processingPayment) {
        // Show unique processing animation
        setMessages((prev) => [
          ...prev,
          { 
            sender: "bot", 
            text: "", 
            processingPayment: true,
            paymentSteps: [
              { step: 1, text: "Initializing secure payment gateway", icon: "🔒", delay: 0 },
              { step: 2, text: "Validating payment credentials", icon: "🔍", delay: 1500 },
              { step: 3, text: "Processing transaction securely", icon: "💳", delay: 3000 },
              { step: 4, text: "Confirming appointment slot", icon: "📅", delay: 4500 },
              { step: 5, text: "Generating confirmation receipt", icon: "📧", delay: 6000 },
              { step: 6, text: "Finalizing booking details", icon: "✅", delay: 7000 }
            ]
          },
        ]);

        // Final: Show success message with receipt only
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              sender: "bot",
              text: reply,
              paymentReceipt: data?.data?.bookingData?.receipt || data?.bookingData?.receipt,
            },
          ]);
        }, 8000);
      } else {
        // Format the reply first, then type it
        const replyText = typeof reply === "string" ? reply : String(reply);
        const formattedText = replyText
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
          .replace(/#{1,6}\s*(.*)/g, '<strong class="font-semibold text-gray-800">$1</strong>');
        
        typeMessage(formattedText, () => {
          const botMessage = {
            sender: "bot" as const,
            text: formattedText,
            consultancies: data?.data?.consultancies || data.consultancies || null,
            paymentReceipt: data?.data?.bookingData?.receipt || null,
            requiresAuth: data?.data?.requiresAuth || data.requiresAuth || false,
            authMessage: data?.data?.authMessage || data.authMessage || null,
            categoryNavigation: data?.data?.categoryNavigation || data.categoryNavigation || null,
            allCategories: data?.data?.allCategories || data.allCategories || null,
            bookings: data?.data?.bookings || data.bookings || null,
            processingPayment: false,
          };
          setMessages((prev) => [...prev, botMessage]);
          setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot" as const,
          text: "⚠️ Could not get a reply. Try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setLoadingProgress(100);
      setTimeout(() => {
        setWaitingTip("");
        setLoadingProgress(0);
      }, 500);
      setShowQuickActions(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (isLoading || isTyping) return;
    setInput(action);
    handleSend();
  };

  const startBotEntrance = () => {
    setShowEntrance(true);

    // Select greeting once and store it - only changes on new button click
    const selectedGreeting =
      greetings[Math.floor(Math.random() * greetings.length)];
    setEntranceGreeting(selectedGreeting);
    const welcomeMessage = `${selectedGreeting} I'm Shaan, your personal consultant assistant! Tell me what you're looking for and I'll help you find the perfect consultancy.`;

    // Bot appears in center with greeting
    setTimeout(() => {
      setEntranceComplete(true);
    }, 1000);

    // Set the message early to prevent glitch
    setTimeout(() => {
      // Only set welcome message if no existing messages
      if (messages.length === 0) {
        setMessages([
          {
            sender: "bot",
            text: welcomeMessage,
          },
        ]);
      }
    }, 3000);

    // Transform to chat container
    setTimeout(() => {
      setIsOpen(true);
      setTimeout(() => {
        setShowChatbox(true);
      }, 200);
      setShowQuickActions(true);
    }, 4500);

    // Hide entrance animation
    setTimeout(() => {
      setShowEntrance(false);
      setEntranceComplete(false);
    }, 5000);
  };

  const showConfirmation = (action: () => void) => {
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const clearChatHistory = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const performClear = async () => {
        if (isLoading || isTyping) {
          stopTyping();
        }

        // Clear from database
        try {
          await fetch(`/api/chat-history?sessionId=${sessionId}`, {
            method: "DELETE",
          });
        } catch (error) {
          console.error("Error clearing chat history:", error);
        }

        // Create new session
        const newSessionId = `session_${Date.now()}_${Math.random()}`;
        setSessionId(newSessionId);
        sessionStorage.setItem("chatSessionId", newSessionId);
        setMessages([]);

        resolve(true);
      };

      showConfirmation(performClear);
    });
  };

  const closeChatbot = () => {
    setShowChatbox(false);
    setTimeout(() => {
      setIsOpen(false);
      setShowQuickActions(true);
      setIsLoading(false);
      setWaitingTip("");
      setLoadingProgress(0);
    }, 300);
  };

  return (
    <>
      {/* Simple Unique Chatbot Button */}
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
        {!isOpen && !showEntrance && isLoaded && pageLoaded && (
          <motion.div
            className="relative group pointer-events-auto"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
          >
            {/* Notification Badge */}
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-md border-2 border-white z-10">
              💬
            </div>

            {/* Main Button */}
            <button
              onClick={startBotEntrance}
              className="relative bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-white/20"
            >
              {/* Subtle Inner Border */}
              <div className="absolute inset-1 rounded-full border border-white/10"></div>

              {/* Bot Icon */}
              <Bot size={24} className="relative z-10" />

              {/* Corner Dots */}
              <div className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/60 rounded-full"></div>
            </button>

            {/* Simple Tooltip */}
            <div className="absolute bottom-full right-0 mb-3 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
              Chat with Shaan AI 🤖
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </motion.div>
        )}

        {/* Simple Loading State */}
        {!isLoaded && (
          <div className="pointer-events-auto">
            <div className="bg-gray-500 text-white p-4 rounded-full shadow-lg animate-pulse">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>

      {/* Background Blur Overlay */}
      {(isOpen || showEntrance) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-500" />
      )}

      {/* Bot Entrance Animation */}
      {showEntrance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className={`transform transition-all duration-1000 ease-out ${
              entranceComplete ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-10 rounded-3xl shadow-2xl text-center max-w-md mx-4">
              <div className="animate-bounce mb-6">
                <Bot size={64} className="mx-auto" />
              </div>
              <h2 className="text-3xl font-bold mb-4 animate-pulse bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {entranceGreeting || "Hello there!"}
              </h2>
              <p className="text-indigo-100 text-lg mb-4 animate-fade-in-up">
                I'm Shaan, your personal consultant assistant at ConsultBridge!
              </p>
              <p
                className="text-indigo-200 text-sm mb-6 animate-fade-in-up"
                style={{ animationDelay: "0.5s" }}
              >
                🌆 Connecting you with India's top consultants...
              </p>
              <div className="flex justify-center items-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="text-sm animate-pulse">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] sm:w-[90vw] md:w-[85vw] max-w-[800px] h-[85vh] sm:h-[90vh] max-h-[750px] bg-white rounded-xl md:rounded-2xl shadow-2xl border border-gray-300 flex flex-col transition-all duration-700 ease-out ${
            showChatbox ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          {/* SHAAN AI - Same Bot, Better Eyes */}
          <div className="absolute top-2 left-2 z-[60] pointer-events-none hidden md:block">
            <div className={`transform transition-all duration-800 ease-out ${
              input.trim() ? 'translate-x-1 -translate-y-1 rotate-2 scale-105' : 
              isLoading ? 'translate-y-0.5 rotate-1 scale-102' : 
              isTyping ? 'translate-x-0.5 translate-y-0.5 rotate-1 scale-108' :
              'translate-x-0 translate-y-0 rotate-0 scale-100'
            }`}>
              <div className="relative w-10 h-10 md:w-16 md:h-16">
                
                {/* Subtle Aura */}
                <div className={`absolute inset-3 rounded-full transition-all duration-600 blur-sm ${
                  input.trim() ? 'bg-emerald-200/25' : 
                  isLoading ? 'bg-blue-200/25 animate-pulse' : 
                  isTyping ? 'bg-orange-200/25' :
                  'bg-purple-200/20'
                }`}></div>
                
                {/* Main Robot Head */}
                <div className="relative w-8 h-7 md:w-12 md:h-10 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 rounded-lg md:rounded-xl border border-slate-400 shadow-lg mx-auto overflow-hidden">
                  
                  {/* Digital Face Display */}
                  <div className="absolute inset-1.5 bg-gradient-to-br from-slate-900 via-black to-slate-800 rounded-xl overflow-hidden">
                    
                    {/* Smooth Living Eyes */}
                    <div className="absolute inset-0 flex items-center justify-center space-x-2.5">
                      {/* Left Eye */}
                      <div className={`relative w-3 h-3 transition-all duration-600 ${
                        input.trim() ? 'bg-emerald-400 scale-125 shadow-emerald-400/60 shadow-lg' :
                        isLoading ? 'bg-blue-400 scale-110 shadow-blue-400/60 shadow-lg' :
                        isTyping ? 'bg-orange-400 scale-115 shadow-orange-400/60 shadow-lg' :
                        'bg-slate-400 scale-100'
                      } rounded-full`}>
                        {/* Eye Iris */}
                        <div className={`absolute inset-0.5 bg-white rounded-full transition-all duration-400 ${
                          input.trim() ? 'scale-80' : isLoading ? 'scale-60' : isTyping ? 'scale-70' : 'scale-90'
                        }`}></div>
                        {/* Smooth Eye Ball */}
                        <div className={`absolute w-1.5 h-1.5 bg-black rounded-full top-1 left-1 ${
                          input.trim() ? 'transition-all duration-1000 ease-out transform translate-x-0.5 -translate-y-0.5' : ''
                        }`} style={{
                          animation: isLoading ? 'thinking 3s ease-in-out infinite' : 
                                   isTyping ? 'writing 2s ease-in-out infinite' : 
                                   (!input.trim() && !isLoading) ? 'randomLook 8s ease-in-out infinite' : undefined
                        }}></div>
                        {/* Eye Shine */}
                        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-90"></div>
                      </div>
                      
                      {/* Right Eye */}
                      <div className={`relative w-3 h-3 transition-all duration-600 ${
                        input.trim() ? 'bg-emerald-400 scale-125 shadow-emerald-400/60 shadow-lg' :
                        isLoading ? 'bg-blue-400 scale-110 shadow-blue-400/60 shadow-lg' :
                        isTyping ? 'bg-orange-400 scale-115 shadow-orange-400/60 shadow-lg' :
                        'bg-slate-400 scale-100'
                      } rounded-full`}>
                        {/* Eye Iris */}
                        <div className={`absolute inset-0.5 bg-white rounded-full transition-all duration-400 ${
                          input.trim() ? 'scale-80' : isLoading ? 'scale-60' : isTyping ? 'scale-70' : 'scale-90'
                        }`}></div>
                        {/* Smooth Eye Ball */}
                        <div className={`absolute w-1.5 h-1.5 bg-black rounded-full top-1 left-1 ${
                          input.trim() ? 'transition-all duration-1000 ease-out transform translate-x-0.5 -translate-y-0.5' : ''
                        }`} style={{
                          animation: isLoading ? 'thinking 3s ease-in-out infinite' : 
                                   isTyping ? 'writing 2s ease-in-out infinite' : 
                                   (!input.trim() && !isLoading) ? 'randomLook 8s ease-in-out infinite' : undefined
                        }}></div>
                        {/* Eye Shine */}
                        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-90"></div>
                      </div>
                    </div>
                    
                    {/* Dynamic Mouth Expression */}
                    <div className={`absolute bottom-1.5 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
                      input.trim() ? 'w-4 h-0.5 bg-emerald-400 rounded-full shadow-emerald-400/50 shadow-md' :
                      isLoading ? 'w-3 h-3 border-2 border-blue-400 rounded-full animate-spin' :
                      isTyping ? 'w-5 h-1 bg-orange-400 rounded-full animate-pulse shadow-orange-400/50 shadow-md' :
                      'w-3 h-0.5 bg-slate-400 rounded-full'
                    }`}></div>
                    
                    {/* Status LED Strip */}
                    <div className={`absolute top-0.5 left-1 right-1 h-0.5 rounded-full transition-all duration-800 ${
                      input.trim() ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80' :
                      isLoading ? 'bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-90 animate-pulse' :
                      isTyping ? 'bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-85' :
                      'bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-40'
                    }`}></div>
                    
                    {/* Breathing Effect */}
                    <div className="absolute inset-0 rounded-xl animate-pulse opacity-10 bg-gradient-to-br from-white to-transparent" style={{animationDuration: '3s'}}></div>
                  </div>
                  
                  {/* Side Audio Panels */}
                  <div className={`absolute -left-1 top-2 w-1.5 h-8 rounded-l-full transition-all duration-500 ${
                    input.trim() ? 'bg-gradient-to-b from-emerald-300 to-emerald-500 shadow-emerald-400/40 shadow-md' :
                    isLoading ? 'bg-gradient-to-b from-blue-300 to-blue-500 shadow-blue-400/40 shadow-md' :
                    isTyping ? 'bg-gradient-to-b from-orange-300 to-orange-500 shadow-orange-400/40 shadow-md' :
                    'bg-gradient-to-b from-slate-300 to-slate-500'
                  }`}></div>
                  <div className={`absolute -right-1 top-2 w-1.5 h-8 rounded-l-full transition-all duration-500 ${
                    input.trim() ? 'bg-gradient-to-b from-emerald-300 to-emerald-500 shadow-emerald-400/40 shadow-md' :
                    isLoading ? 'bg-gradient-to-b from-blue-300 to-blue-500 shadow-blue-400/40 shadow-md' :
                    isTyping ? 'bg-gradient-to-b from-orange-300 to-orange-500 shadow-orange-400/40 shadow-md' :
                    'bg-gradient-to-b from-slate-300 to-slate-500'
                  }`}></div>
                </div>
                
                {/* Communication Antenna */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="w-0.5 h-4 bg-slate-600 rounded-full"></div>
                  <div className={`w-2.5 h-2.5 rounded-full -mt-1 mx-auto transition-all duration-600 ${
                    input.trim() ? 'bg-emerald-400 animate-pulse shadow-emerald-400/70 shadow-lg scale-110' :
                    isLoading ? 'bg-blue-400 animate-ping shadow-blue-400/70 shadow-lg scale-105' :
                    isTyping ? 'bg-orange-400 animate-bounce shadow-orange-400/70 shadow-lg scale-108' :
                    'bg-slate-400 scale-100'
                  }`}>
                    <div className="absolute inset-0.5 bg-white rounded-full opacity-70"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="p-2 md:p-3 pl-3 md:pl-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-t-xl md:rounded-t-2xl flex justify-between items-center relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10 animate-float-slow"></div>
              <div
                className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-full translate-x-8 translate-y-8 animate-float-slow"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
            <div className="font-semibold flex items-center gap-2 relative z-10">
              <div className="animate-pulse">
                <Bot size={16} className="md:w-5 md:h-5" />
              </div>
              <div>
                <div className="text-sm md:text-base">Shaan AI</div>
                <div className="text-xs opacity-90 hidden sm:block">
                  ConsultBridge Assistant 🌆
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={async () => {
                  const cleared = await clearChatHistory();
                  if (cleared) {
                    // Add new greeting only if chat was actually cleared
                    const selectedGreeting =
                      greetings[Math.floor(Math.random() * greetings.length)];
                    const welcomeMessage = `${selectedGreeting} I'm Shaan, your personal consultant assistant! Tell me what you're looking for and I'll help you find the perfect consultancy.`;
                    setTimeout(() => {
                      setMessages([
                        {
                          sender: "bot",
                          text: welcomeMessage,
                        },
                      ]);
                      setShowQuickActions(true);
                    }, 100);
                  }
                }}
                className="hover:bg-white/20 px-2 py-1 rounded transition opacity-60 hover:opacity-100 text-xs"
                title="Start New Chat"
              >
                <span className="hidden sm:inline">New Chat</span>
                <span className="sm:hidden">New</span>
              </button>
              <button
                onClick={closeChatbot}
                className="hover:bg-white/20 p-1 rounded transition hover:rotate-90"
              >
                <X size={16} className="md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50" data-chat-container>
            <div className="p-3 md:p-4 space-y-3">
              {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col">
                <div
                  className={`p-2 md:p-3 px-3 md:px-4 max-w-[90%] md:max-w-[85%] rounded-lg md:rounded-xl text-xs md:text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.sender === "user"
                      ? "ml-auto bg-indigo-100"
                      : "mr-auto bg-white border"
                  }`}
                >
                  {msg.sender === "bot" ? (
                    <div className="whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{
                      __html: typeof msg.text === "string" ? msg.text : JSON.stringify(msg.text)
                    }}></div>
                  ) : (
                    typeof msg.text === "string" ? msg.text : JSON.stringify(msg.text)
                  )}
                </div>




                {/* Payment Processing Animation */}
                {msg.processingPayment && msg.paymentSteps && (
                  <div className="mt-3 mr-auto bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg md:rounded-xl p-3 md:p-4 w-[95%] md:w-[90%] text-xs md:text-sm shadow">
                    <div className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Processing Payment
                    </div>
                    <div className="space-y-2">
                      {msg.paymentSteps.map((step, i) => (
                        <PaymentStep key={i} step={step} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Payment Receipt */}
                {msg.paymentReceipt && (
                  <div className="mt-3 mr-auto bg-green-50 border border-green-200 rounded-lg md:rounded-xl p-3 md:p-4 w-[95%] md:w-[90%] text-xs md:text-sm shadow">
                    <div className="font-semibold text-green-700 mb-2 flex items-center justify-between">
                      <span>💳 Payment Receipt</span>
                      <button
                        onClick={() => {
                          const printContent = `
                            CONSULTBRIDGE PAYMENT RECEIPT\n\n
                            Receipt ID: ${msg.paymentReceipt.id}\n
                            Client: ${msg.paymentReceipt.clientName}\n
                            Consultancy: ${msg.paymentReceipt.consultancyName}\n
                            Meeting Type: ${
                              msg.paymentReceipt.appointmentType?.toUpperCase() ||
                              "ONLINE"
                            }\n
                            Date: ${msg.paymentReceipt.date}\n
                            Time: ${msg.paymentReceipt.time}\n
                            Amount: ₹${msg.paymentReceipt.amount}\n
                            Payment Method: ${
                              msg.paymentReceipt.paymentMethod?.toUpperCase() ||
                              "CARD"
                            }\n
                            Status: CONFIRMED\n\n
                            Thank you for using ConsultBridge!
                          `;
                          const printWindow = window.open("", "_blank");
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head><title>Payment Receipt</title></head>
                                <body style="font-family: monospace; white-space: pre-line; padding: 20px;">
                                  ${printContent}
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                            printWindow.print();
                          }
                        }}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition flex items-center gap-1"
                      >
                        🖨️ Print
                      </button>
                    </div>
                    <div className="space-y-1 text-green-600">
                      <p>
                        <strong>Receipt ID:</strong> {msg.paymentReceipt.id}
                      </p>
                      <p>
                        <strong>Amount:</strong> ₹{msg.paymentReceipt.amount}
                      </p>
                      <p>
                        <strong>Payment Method:</strong>{" "}
                        {msg.paymentReceipt.paymentMethod?.toUpperCase() ||
                          "CARD"}
                      </p>
                      <p>
                        <strong>Client:</strong> {msg.paymentReceipt.clientName}
                      </p>
                      <p>
                        <strong>Consultancy:</strong>{" "}
                        {msg.paymentReceipt.consultancyName}
                      </p>
                      <p>
                        <strong>Meeting Type:</strong>{" "}
                        {msg.paymentReceipt.appointmentType?.toUpperCase() ||
                          "ONLINE"}
                      </p>
                      <p>
                        <strong>Date:</strong> {msg.paymentReceipt.date}
                      </p>
                      <p>
                        <strong>Time:</strong> {msg.paymentReceipt.time}
                      </p>
                    </div>
                  </div>
                )}

                {/* Category Navigation Card */}
                {msg.categoryNavigation && (
                  <div className="mt-3 mr-auto bg-blue-50 border border-blue-200 rounded-xl p-3 w-[85%] text-sm shadow">
                    <div className="font-semibold text-blue-700 flex items-center gap-2">
                      📁 Browse {msg.categoryNavigation.categoryName}{" "}
                      Consultancies
                    </div>
                    <p className="text-blue-600 mt-1">
                      Explore all available consultants in this category
                    </p>
                    <button
                      onClick={() => {
                        window.open(msg.categoryNavigation?.url, "_blank");
                      }}
                      className="mt-2 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition flex items-center gap-1"
                    >
                      🔍 Navigates
                    </button>
                  </div>
                )}

                {/* All Categories Card */}
                {msg.allCategories && (
                  <div className="mt-3 mr-auto bg-purple-50 border border-purple-200 rounded-xl p-3 w-[85%] text-sm shadow">
                    <div className="font-semibold text-purple-700 flex items-center gap-2">
                      📂 Browse All Categories
                    </div>
                    <p className="text-purple-600 mt-1">
                      Explore all 10 consultation categories available
                    </p>
                    <button
                      onClick={() => {
                        window.open(msg.allCategories?.url, "_blank");
                      }}
                      className="mt-2 text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition flex items-center gap-1"
                    >
                      🔍 Browse All
                    </button>
                  </div>
                )}

                {/* Bookings Display Card */}
                {msg.bookings && msg.bookings.length > 0 && (
                  <div className="mt-3 mr-auto bg-blue-50 border border-blue-200 rounded-xl p-3 w-[90%] text-sm shadow">
                    <div className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      📅 Your Bookings ({msg.bookings.length})
                    </div>
                    <div className="space-y-3">
                      {msg.bookings.map((booking: any, i: number) => (
                        <div key={i} className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-gray-800">{booking.consultancyName}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            📅 {booking.date} at {booking.time}
                          </div>
                          <div className="text-xs text-gray-600">
                            📍 {booking.type} consultation
                          </div>
                          <div className="text-xs mt-1 flex items-center gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {booking.status === 'Confirmed' ? '✅' : '⏳'} {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authentication Required Card */}
                {msg.requiresAuth && (
                  <div className="mt-3 mr-auto bg-yellow-50 border border-yellow-200 rounded-xl p-3 w-[85%] text-sm shadow">
                    <div className="font-semibold text-yellow-700 flex items-center gap-2">
                      <LogIn size={16} /> Authentication Required
                    </div>
                    <p className="text-yellow-600 mt-1">{msg.authMessage}</p>
                    <button
                      onClick={() => {
                        closeChatbot();
                        router.push("/sign-in");
                      }}
                      className="mt-2 text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition flex items-center gap-1"
                    >
                      <LogIn size={12} /> Sign In Now
                    </button>
                  </div>
                )}

                {/* Consultancy Action Buttons - Hide during booking flow */}
                {msg.consultancies && msg.consultancies.length > 0 && (!msg.actionType || msg.actionType !== 'book') && 
                 !msg.text.includes('Please provide your preferred date') && 
                 !msg.text.includes('what time would you prefer') && 
                 !msg.text.includes('How would you prefer to meet') && 
                 !msg.text.includes('How would you like to pay') && 
                 !msg.text.includes('Available Days: Monday to Friday') && (
                  <div className="mt-3 space-y-1">
                    {msg.consultancies.map((consultancy: any) => (
                      <div
                        key={consultancy._id}
                        className="flex gap-2 items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800">
                            {consultancy.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ⭐ {consultancy.rating || 4.5}/5 • {consultancy.category} • {consultancy.price || '₹1,500/hr'}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            console.log(
                              "Chat Summary clicked for:",
                              consultancy.name
                            );
                            handleQuickAction(
                              `show summary of ${consultancy.name}`
                            );
                          }}
                          className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                        >
                          Summary
                        </button>
                        <button
                          onClick={() => {
                            closeChatbot();
                            router.push(`/consultancy/${consultancy._id}`);
                          }}
                          className="text-xs bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition"
                        >
                          View on Website
                        </button>
                        <button
                          onClick={() => {
                            if (isLoading || isTyping) return;
                            if (!isSignedIn) {
                              const authMessage = {
                                sender: "bot" as const,
                                text: "To book appointments, please sign in first. It's quick and secure! 🔒",
                                requiresAuth: true,
                                authMessage: "Sign in required to book appointments",
                              };
                              setMessages((prev) => [...prev, authMessage]);
                            } else {
                              handleQuickAction(`book ${consultancy.name}`);
                            }
                          }}
                          className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition flex items-center gap-1"
                        >
                          {!isSignedIn && <LogIn size={10} />}
                          Book Now
                        </button>
                      </div>
                    ))}
                    {/* More button */}
                    <div className="flex justify-center mt-3">
                      <button
                        onClick={() => {
                          const category = msg.consultancies?.[0]?.category;
                          if (category) {
                            const categorySlug = category
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                              .replace(/&/g, "%26");
                            closeChatbot();
                            // Use window.location for reliable navigation
                            setTimeout(() => {
                              window.location.href = `/category/${categorySlug}`;
                            }, 300);
                          }
                        }}
                        className="text-xs bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition flex items-center gap-1"
                      >
                        🔍 More in this category
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Enhanced Typing Indicator with Tips */}
            {isLoading && (
              <div className="mr-auto max-w-[90%] space-y-3">
                <div className="flex items-center gap-3 p-3 px-4 text-sm rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-indigo-700 font-medium">
                    Shaan is analyzing your request...
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>

                {/* Random Tip */}
                {waitingTip && (
                  <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl text-sm animate-fade-in">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">💭</span>
                      <span className="text-gray-700">{waitingTip}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Real-time Typing Message */}
            {isTyping && (
              <div className="mr-auto max-w-[85%] rounded-xl text-sm bg-white border p-3 px-4">
                <div className="whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{
                  __html: (typeof typingMessage === "string" ? typingMessage : "") + 
                    '<span class="inline-block w-3 h-5 bg-gradient-to-r from-blue-500 to-purple-500 ml-1 rounded animate-pulse shadow-lg" style="animation-duration: 0.8s;"></span>'
                }}></div>
              </div>
            )}

            {/* Quick Action Buttons */}
            {showQuickActions && messages.length === 1 && (
              <div className="mr-auto space-y-2 mt-2">
                <div className="text-xs text-gray-500 mb-2">Quick actions:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickAction("Show my bookings")}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition"
                  >
                    📅 My Bookings
                  </button>
                  <button
                    onClick={() =>
                      handleQuickAction("I need business consulting")
                    }
                    className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition"
                  >
                    💼 Business Help
                  </button>
                  <button
                    onClick={() => handleQuickAction("I need legal advice")}
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition"
                  >
                    ⚖️ Legal Advice
                  </button>
                  <button
                    onClick={() => handleQuickAction("Reschedule appointment")}
                    className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-200 transition"
                  >
                    🔄 Reschedule
                  </button>
                </div>
              </div>
            )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-2 md:p-3 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-full px-3 md:px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all hover:border-indigo-300"
              placeholder={
                isLoading
                  ? "Please wait..."
                  : "Ask me anything... 🚀"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !isLoading &&
                  !isTyping &&
                  input.trim()
                ) {
                  handleSend();
                }
              }}
              disabled={isLoading || isTyping}
            />

            <button
              onClick={() => {
                if (isLoading || isTyping) {
                  stopTyping();
                } else {
                  handleSend();
                }
              }}
              disabled={!input.trim() && !isLoading && !isTyping}
              className={`p-2 rounded-full transition-all duration-200 ${
                !input.trim() && !isLoading && !isTyping
                  ? "text-gray-400 cursor-not-allowed"
                  : isLoading || isTyping
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-lg"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:scale-105 shadow-lg"
              }`}
              title={isLoading || isTyping ? "Stop response" : "Send message"}
            >
              {isLoading || isTyping ? (
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white rounded-sm"></div>
              ) : (
                <SendHorizonal size={16} className="md:w-[18px] md:h-[18px]" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 border border-gray-200"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤔</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Start Fresh Chat?
              </h3>
              <p className="text-gray-600 mb-6">
                {isLoading || isTyping
                  ? "Shaan is currently responding. Starting a new chat will stop the current response and clear all messages."
                  : "This will clear all your current messages and conversation history. Are you sure you want to continue?"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Keep Chat
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all font-medium shadow-lg"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
