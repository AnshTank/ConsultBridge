"use client";
import { useState, useRef, useEffect } from "react";
import { SendHorizonal, Bot, X, Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import "../styles/chatbot.css";

export default function Chatbot() {
  const router = useRouter();
  const { isSignedIn, userId, isLoaded } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showEntrance, setShowEntrance] = useState(false);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [entranceGreeting, setEntranceGreeting] = useState("Hello there!");
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<
    {
      sender: "user" | "bot";
      text: string;
      booking?: any;
      consultancies?: any[];
      paymentReceipt?: any;
      requiresAuth?: boolean;
      authMessage?: string;
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
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // Disable background scrolling when chatbot is open
  useEffect(() => {
    if (isOpen || showEntrance) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, showEntrance]);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    if (!isLoaded) return;

    const savedSessionId = localStorage.getItem("chatSessionId");
    const savedMessages = localStorage.getItem("chatMessages");

    // Clear session if user signed out
    if (!isSignedIn && savedMessages) {
      localStorage.removeItem("chatMessages");
      localStorage.removeItem("chatSessionId");
      const newSessionId = `session_${Date.now()}_${Math.random()}`;
      setSessionId(newSessionId);
      localStorage.setItem("chatSessionId", newSessionId);
      setMessages([]);
      return;
    }

    if (savedSessionId) {
      setSessionId(savedSessionId);
      if (savedMessages && isSignedIn) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          if (parsedMessages.length > 0) {
            setMessages(parsedMessages);
          }
        } catch (error) {
          console.error("Error parsing saved messages:", error);
        }
      }
    } else {
      // Create new session
      const newSessionId = `session_${Date.now()}_${Math.random()}`;
      setSessionId(newSessionId);
      localStorage.setItem("chatSessionId", newSessionId);
    }
  }, [isLoaded, isSignedIn]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const typeMessage = (text: string, callback?: () => void) => {
    setIsTyping(true);
    setTypingMessage("");
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setTypingMessage(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setCurrentTypingInterval(null);
        setIsTyping(false);
        setTypingMessage("");
        callback?.();
      }
    }, 30); // Adjust speed here (lower = faster)

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
    if (!input.trim()) return;

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
        localStorage.setItem("chatSessionId", data.sessionId);
      }

      // Don't overwrite messages with server history during normal chat

      // Ensure data.reply is always a string
      if (typeof data.reply !== "string") {
        console.error("Invalid reply format:", data.reply);
        data.reply =
          "Sorry, there was an issue processing your request. Please try again.";
      }

      // If payment is processing, show realistic animated loader
      if (data.processingPayment) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "🔄 Processing your payment..." },
        ]);

        // Step 1: Validating payment method
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { sender: "bot", text: "🔍 Validating payment method..." },
          ]);
        }, 1500);

        // Step 2: Processing transaction
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { sender: "bot", text: "💳 Processing transaction securely..." },
          ]);
        }, 3000);

        // Step 3: Confirming booking
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { sender: "bot", text: "📅 Confirming your appointment..." },
          ]);
        }, 4500);

        // Step 4: Sending confirmation
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { sender: "bot", text: "📧 Sending confirmation email..." },
          ]);
        }, 6000);

        // Final: Show success message
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              sender: "bot",
              text: data.reply,
              booking: data.booking,
              paymentReceipt: data.paymentReceipt,
            },
          ]);
        }, 7500);
      } else {
        // Type the message letter by letter
        const replyText =
          typeof data.reply === "string" ? data.reply : String(data.reply);
        typeMessage(replyText, () => {
          const botMessage = {
            sender: "bot" as const,
            text: replyText,
            booking: data.booking || null,
            consultancies: data.consultancies || null,
            paymentReceipt: data.paymentReceipt || null,
            requiresAuth: data.requiresAuth || false,
            authMessage: data.authMessage || null,
            categoryNavigation: data.categoryNavigation || null,
            allCategories: data.allCategories || null,
          };
          setMessages((prev) => [...prev, botMessage]);
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

  const clearChatHistory = () => {
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatSessionId");
    const newSessionId = `session_${Date.now()}_${Math.random()}`;
    setSessionId(newSessionId);
    localStorage.setItem("chatSessionId", newSessionId);
    setMessages([]);
  };

  const closeChatbot = () => {
    setShowChatbox(false);
    setTimeout(() => {
      setIsOpen(false);
      // Don't clear messages - keep them for session persistence
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
        {!isOpen && !showEntrance && isLoaded && (
          <div className="relative group pointer-events-auto">
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

            {/* Online Status */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
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
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[98vw] max-w-[800px] h-[90vh] max-h-[750px] bg-white rounded-2xl shadow-2xl border border-gray-300 flex flex-col transition-all duration-700 ease-out ${
            showChatbox ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          {/* Header */}
          <div className="p-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-t-2xl flex justify-between items-center relative overflow-hidden">
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
                <Bot size={20} />
              </div>
              <div>
                <div>Shaan AI</div>
                <div className="text-xs opacity-90">
                  ConsultBridge Assistant 🌆
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={() => {
                  clearChatHistory();
                  // Add new greeting after clearing
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
                }}
                className="hover:bg-white/20 px-2 py-1 rounded transition opacity-60 hover:opacity-100 text-xs"
                title="Start New Chat"
              >
                New Chat
              </button>
              <button
                onClick={closeChatbot}
                className="hover:bg-white/20 p-1 rounded transition hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col">
                <div
                  className={`p-2 px-3 max-w-[85%] rounded-xl text-sm whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "ml-auto bg-indigo-100"
                      : "mr-auto bg-white border"
                  }`}
                >
                  {typeof msg.text === "string"
                    ? msg.text
                    : JSON.stringify(msg.text)}
                </div>

                {/* Booking confirmation card */}
                {msg.booking && (
                  <div className="mt-3 mr-auto bg-green-50 border border-green-200 rounded-xl p-3 w-[85%] text-sm shadow">
                    <div className="font-semibold text-green-700">
                      Appointment Confirmed!
                    </div>
                    <p>
                      <strong>Consultancy:</strong>{" "}
                      {msg.booking.consultancyName || "Not specified"}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(msg.booking.appointmentDate).toDateString()}
                    </p>
                    <p>
                      <strong>Time:</strong> {msg.booking.appointmentTime}
                    </p>
                    <p>
                      <strong>Status:</strong> {msg.booking.status}
                    </p>
                  </div>
                )}

                {/* Enhanced Payment Receipt */}
                {msg.paymentReceipt && (
                  <div className="mt-3 mr-auto bg-green-50 border border-green-200 rounded-xl p-4 w-[90%] text-sm shadow">
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
                        window.open(msg.allCategories.url, "_blank");
                      }}
                      className="mt-2 text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition flex items-center gap-1"
                    >
                      🔍 Browse All
                    </button>
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

                {/* Consultancy Action Buttons */}
                {msg.consultancies && msg.consultancies.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.consultancies.map((consultancy: any) => (
                      <div
                        key={consultancy._id}
                        className="flex gap-2 items-center p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-700 flex-1">
                          {consultancy.name}
                        </span>
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
                            if (!isSignedIn) {
                              const funnyMessages = [
                                "Whoa there, speed racer! 🏎️ I'd love to book that appointment for you, but first we need to know who you are! Think of signing in as getting your VIP pass to the ConsultBridge experience. Ready to join the party?",
                                "Hold your horses, booking champion! 🐎 You're eager to get started (I love that energy!), but I need you to sign in first. It's like showing your ID at an exclusive club - totally worth it for the premium experience!",
                                "Easy there, appointment ninja! 🥷 Your booking skills are impressive, but even ninjas need to reveal their identity sometimes. Sign in and let's make this booking happen like the pro you are!",
                                "Pump the brakes, booking boss! 🚗 I can see you're ready to dive in, but signing in first is like putting on your seatbelt - it's for your own safety and a much smoother ride ahead!",
                                "Slow down there, consultation conqueror! ⚡ Your enthusiasm is contagious, but let's get you signed in first. Think of it as your golden ticket to the ConsultBridge chocolate factory of expertise!",
                              ];
                              const randomMessage =
                                funnyMessages[
                                  Math.floor(
                                    Math.random() * funnyMessages.length
                                  )
                                ];

                              const authMessage = {
                                sender: "bot" as const,
                                text: randomMessage,
                                requiresAuth: true,
                                authMessage:
                                  "Sign in required to book appointments",
                              };
                              setMessages((prev) => [...prev, authMessage]);
                            } else {
                              handleQuickAction(
                                `book appointment with ${consultancy.name}`
                              );
                            }
                          }}
                          className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition flex items-center gap-1"
                        >
                          {!isSignedIn && <LogIn size={10} />}
                          Book Now
                        </button>
                      </div>
                    ))}
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
              <div className="mr-auto max-w-[85%] rounded-xl text-sm bg-white border p-2 px-3 whitespace-pre-wrap">
                {typeof typingMessage === "string" ? typingMessage : ""}
                <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse"></span>
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

          {/* Input */}
          <div className="p-3 border-t bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all hover:border-indigo-300"
              placeholder={
                isLoading
                  ? "Please wait..."
                  : "Ask me anything about consultants... 🚀"
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
              disabled={isLoading}
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
                <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
              ) : (
                <SendHorizonal size={18} />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
