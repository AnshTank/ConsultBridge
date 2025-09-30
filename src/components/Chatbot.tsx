"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { SendHorizonal, Bot, X, Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useScrollLock } from "../hooks/useScrollLock";
import { usePopup } from "../contexts/PopupContext";
import "../styles/chatbot.css";

// Payment Step Animation Component
function PaymentStep({
  step,
}: {
  step: { step: number; text: string; icon: string; delay: number };
}) {
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
    <div
      className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-500 ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400"
          : "bg-gray-50 dark:bg-gray-700 opacity-50"
      }`}
    >
      <div
        className={`text-lg transition-all duration-300 ${
          isActive ? "scale-110" : "scale-100 opacity-50"
        }`}
      >
        {isComplete ? "✅" : isActive ? step.icon : "⏳"}
      </div>
      <div
        className={`flex-1 transition-all duration-300 ${
          isActive
            ? "text-blue-700 dark:text-blue-300 font-medium"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {step.text}
      </div>
      {isActive && !isComplete && (
        <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  );
}

export default function Chatbot() {
  const router = useRouter();
  const { isSignedIn, userId, isLoaded } = useAuth();
  const { isAnyPopupOpen } = usePopup();
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
      paymentSteps?: Array<{
        step: number;
        text: string;
        icon: string;
        delay: number;
      }>;
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

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes("ClerkJS") ||
        event.reason?.message?.includes("Token refresh failed")
      ) {
        console.warn(
          "Clerk authentication error handled:",
          event.reason.message
        );
        event.preventDefault(); // Prevent the error from crashing the app
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleClerkError);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleClerkError);
    };
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

      // Load chat history from database with error handling
      try {
        const safeUserId = userId || "";
        const response = await fetch(
          `/api/chat-history?sessionId=${savedSessionId}&userId=${safeUserId}`
        );
        const data = await response.json();

        if (data.success && data.chatHistory.length > 0) {
          setMessages(data.chatHistory);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        // Continue without chat history if there's an error
      }
    };

    // Add delay to ensure Clerk is fully loaded
    const timer = setTimeout(loadChatHistory, 500);
    return () => clearTimeout(timer);
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
      // Safely get userId with fallback
      const safeUserId = (() => {
        try {
          return userId || null;
        } catch (error) {
          console.warn("Error accessing userId:", error);
          return null;
        }
      })();

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userId: safeUserId,
          sessionId: sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Chatbot response:", data);

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
        reply =
          "Sorry, there was an issue processing your request. Please try again.";
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
      } else if (data.processingPayment || data?.data?.processingPayment) {
        // Show processing animation
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "🔄 Processing your booking and payment...",
            processingPayment: true,
            paymentSteps: [
              {
                step: 1,
                text: "Validating payment details",
                icon: "🔒",
                delay: 0,
              },
              {
                step: 2,
                text: "Processing secure transaction",
                icon: "💳",
                delay: 1000,
              },
              {
                step: 3,
                text: "Confirming appointment slot",
                icon: "📅",
                delay: 2000,
              },
              {
                step: 4,
                text: "Generating confirmation",
                icon: "✅",
                delay: 3000,
              },
            ],
          },
        ]);

        // Complete payment after 4 seconds
        setTimeout(async () => {
          try {
            console.log("Completing payment for session:", sessionId);
            const completionRes = await fetch("/api/chatbot", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: "complete_payment",
                userId: userId || null,
                sessionId: sessionId,
              }),
            });
            const completionData = await completionRes.json();
            console.log("Payment completion response:", completionData);

            const receipt = {
              id: `CB-${Date.now().toString().slice(-8)}`,
              clientName: "User",
              consultancyName:
                data?.data?.bookingData?.consultantName || "Consultant",
              date: data?.data?.bookingData?.selectedDate || "29/09/2025",
              time: data?.data?.bookingData?.selectedTime || "11:00 AM",
              appointmentType:
                data?.data?.bookingData?.appointmentType || "online",
              amount: "2149",
              paymentMethod:
                data?.data?.bookingData?.paymentMethod || "Credit Card",
            };

            setMessages((prev) => [
              ...prev.slice(0, -1),
              {
                sender: "bot",
                text:
                  completionData?.data?.reply ||
                  "✅ Payment Successful!\n\nBooking Confirmed!\nYour appointment has been saved to database.",
                paymentReceipt: completionData?.data?.paymentReceipt || receipt,
              },
            ]);
          } catch (error) {
            console.error("Payment completion error:", error);
            setMessages((prev) => [
              ...prev.slice(0, -1),
              {
                sender: "bot",
                text: "❌ Payment processing failed. Please try again.",
              },
            ]);
          }
        }, 4000);
      } else {
        // Format the reply first, then type it
        const replyText = typeof reply === "string" ? reply : String(reply);
        const formattedText = replyText
          .replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="font-semibold text-gray-800 dark:text-gray-100">$1</strong>'
          )
          .replace(
            /\*(.*?)\*/g,
            '<em class="italic text-gray-600 dark:text-gray-300">$1</em>'
          )
          .replace(
            /`(.*?)`/g,
            '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">$1</code>'
          )
          .replace(
            /#{1,6}\s*(.*)/g,
            '<strong class="font-semibold text-gray-800 dark:text-gray-100">$1</strong>'
          );

        typeMessage(formattedText, () => {
          const botMessage = {
            sender: "bot" as const,
            text: formattedText,
            consultancies:
              data?.data?.consultancies || data.consultancies || null,
            paymentReceipt: data?.data?.bookingData?.receipt || null,
            requiresAuth:
              data?.data?.requiresAuth || data.requiresAuth || false,
            authMessage: data?.data?.authMessage || data.authMessage || null,
            categoryNavigation:
              data?.data?.categoryNavigation || data.categoryNavigation || null,
            allCategories:
              data?.data?.allCategories || data.allCategories || null,
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
        {!isOpen &&
          !showEntrance &&
          isLoaded &&
          pageLoaded &&
          !showConfirmModal &&
          !isAnyPopupOpen && (
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
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] sm:w-[90vw] md:w-[85vw] max-w-[800px] h-[85vh] sm:h-[90vh] max-h-[750px] bg-white dark:bg-dark-card rounded-xl md:rounded-2xl shadow-2xl dark:shadow-neon-lg border border-gray-300 dark:border-dark-border flex flex-col transition-all duration-700 ease-out ${
            showChatbox ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          {/* SHAAN AI - Ultra Advanced Animated Bot */}
          <div className="absolute top-2 left-2 z-[60] pointer-events-none hidden md:block">
            <style jsx>{`
              @keyframes randomLook {
                0%,
                100% {
                  transform: translate(1px, 1px);
                }
                10% {
                  transform: translate(2px, 0px);
                }
                20% {
                  transform: translate(-1px, 2px);
                }
                30% {
                  transform: translate(0px, -1px);
                }
                40% {
                  transform: translate(2px, 1px);
                }
                50% {
                  transform: translate(-1px, -1px);
                }
                60% {
                  transform: translate(1px, 0px);
                }
                70% {
                  transform: translate(0px, 2px);
                }
                80% {
                  transform: translate(-2px, 0px);
                }
                90% {
                  transform: translate(1px, -1px);
                }
              }

              @keyframes blinkEyes {
                0%,
                90%,
                100% {
                  height: 12px;
                  opacity: 1;
                }
                95% {
                  height: 2px;
                  opacity: 0.8;
                }
              }

              @keyframes thinkingEyes {
                0%,
                100% {
                  transform: translate(0px, 1px) rotate(-5deg);
                }
                25% {
                  transform: translate(-1px, 0px) rotate(0deg);
                }
                50% {
                  transform: translate(1px, -1px) rotate(5deg);
                }
                75% {
                  transform: translate(0px, 1px) rotate(-2deg);
                }
              }

              @keyframes listeningEyes {
                0%,
                100% {
                  transform: translate(0px, 0px) scale(1.1);
                }
                50% {
                  transform: translate(1px, -1px) scale(1.2);
                }
              }

              @keyframes typingEyes {
                0% {
                  transform: translate(-1px, 0px);
                }
                25% {
                  transform: translate(0px, -1px);
                }
                50% {
                  transform: translate(1px, 0px);
                }
                75% {
                  transform: translate(0px, 1px);
                }
                100% {
                  transform: translate(-1px, 0px);
                }
              }

              @keyframes mouthTalk {
                0%,
                100% {
                  transform: scaleY(1) scaleX(1);
                }
                25% {
                  transform: scaleY(1.5) scaleX(0.8);
                }
                50% {
                  transform: scaleY(0.7) scaleX(1.3);
                }
                75% {
                  transform: scaleY(1.2) scaleX(0.9);
                }
              }

              @keyframes headBobThinking {
                0%,
                100% {
                  transform: translateY(0px) rotate(0deg);
                }
                50% {
                  transform: translateY(-2px) rotate(1deg);
                }
              }

              @keyframes headNodListening {
                0%,
                100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-1px);
                }
              }

              @keyframes antennaSignal {
                0%,
                100% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.3);
                  box-shadow: 0 0 15px currentColor;
                }
              }

              @keyframes eyeShineFloat {
                0%,
                100% {
                  opacity: 0.7;
                  transform: scale(1);
                }
                50% {
                  opacity: 1;
                  transform: scale(1.2);
                }
              }

              @keyframes audioWave {
                0%,
                100% {
                  height: 32px;
                }
                50% {
                  height: 24px;
                }
              }

              @keyframes processingGlow {
                0%,
                100% {
                  box-shadow: 0 0 5px currentColor;
                }
                50% {
                  box-shadow:
                    0 0 20px currentColor,
                    0 0 30px currentColor;
                }
              }
            `}</style>

            <div
              className={`transform transition-all duration-500 ease-out ${
                input.trim()
                  ? "scale-105 rotate-1"
                  : isLoading
                    ? "scale-102 -rotate-1"
                    : isTyping
                      ? "scale-108 rotate-2"
                      : "scale-100 rotate-0"
              }`}
              style={{
                animation: isLoading
                  ? "headBobThinking 2s ease-in-out infinite"
                  : input.trim()
                    ? "headNodListening 1.5s ease-in-out infinite"
                    : undefined,
              }}
            >
              <div className="relative w-14 h-14 md:w-16 md:h-16">
                {/* Ultra Enhanced Aura with Multiple Layers */}
                <div
                  className={`absolute inset-1 rounded-full transition-all duration-700 blur-lg ${
                    input.trim()
                      ? "bg-emerald-300/50 shadow-emerald-400/60 shadow-xl"
                      : isLoading
                        ? "bg-blue-300/50 shadow-blue-400/60 shadow-xl"
                        : isTyping
                          ? "bg-orange-300/60 shadow-orange-400/70 shadow-2xl"
                          : "bg-purple-200/40 shadow-purple-300/40 shadow-lg"
                  }`}
                  style={{
                    animation: isTyping
                      ? "processingGlow 0.8s ease-in-out infinite"
                      : isLoading
                        ? "processingGlow 1.5s ease-in-out infinite"
                        : input.trim()
                          ? "processingGlow 2s ease-in-out infinite"
                          : "processingGlow 3s ease-in-out infinite",
                  }}
                ></div>

                {/* Outer Ring Effect */}
                <div
                  className={`absolute inset-3 rounded-full border-2 transition-all duration-500 ${
                    input.trim()
                      ? "border-emerald-300/60 animate-spin"
                      : isLoading
                        ? "border-blue-300/60 animate-spin"
                        : isTyping
                          ? "border-orange-300/70 animate-spin"
                          : "border-purple-200/40"
                  }`}
                  style={{
                    animationDuration: isTyping
                      ? "3s"
                      : isLoading
                        ? "4s"
                        : input.trim()
                          ? "5s"
                          : undefined,
                  }}
                ></div>

                {/* Main Robot Head with Enhanced Design */}
                <div className="relative w-12 h-10 md:w-14 md:h-12 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 rounded-lg border border-slate-400 shadow-lg mx-auto overflow-hidden">
                  {/* Metallic Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg"></div>

                  {/* Digital Face Display with Enhanced Lighting */}
                  <div className="absolute inset-1 bg-gradient-to-br from-slate-900 via-black to-slate-800 rounded-md overflow-hidden shadow-inner">
                    {/* Advanced Eye System */}
                    <div className="absolute inset-0 flex items-center justify-center space-x-2">
                      {/* Left Eye with Advanced Animations */}
                      <div
                        className={`relative w-3 h-3 md:w-4 md:h-4 transition-all duration-400 ${
                          input.trim()
                            ? "bg-emerald-400 scale-125 shadow-emerald-400/70 shadow-lg"
                            : isLoading
                              ? "bg-blue-400 scale-115 shadow-blue-400/70 shadow-lg"
                              : isTyping
                                ? "bg-orange-400 scale-130 shadow-orange-400/80 shadow-xl"
                                : "bg-slate-400 scale-100"
                        } rounded-full`}
                        style={{
                          animation: input.trim()
                            ? "blinkEyes 5s ease-in-out infinite"
                            : isLoading
                              ? "blinkEyes 3s ease-in-out infinite"
                              : "blinkEyes 8s ease-in-out infinite",
                        }}
                      >
                        {/* Eye White */}
                        <div
                          className={`absolute inset-0.5 bg-white rounded-full transition-all duration-300 ${
                            input.trim()
                              ? "scale-90"
                              : isLoading
                                ? "scale-85"
                                : isTyping
                                  ? "scale-88"
                                  : "scale-95"
                          }`}
                        ></div>

                        {/* Pupil with Advanced Tracking */}
                        <div
                          className={`absolute w-1 h-1 bg-black rounded-full transition-all duration-300`}
                          style={{
                            top: input.trim()
                              ? "4px"
                              : isLoading
                                ? "2px"
                                : isTyping
                                  ? "6px"
                                  : "4px",
                            left: input.trim()
                              ? "6px"
                              : isLoading
                                ? "2px"
                                : isTyping
                                  ? "4px"
                                  : "4px",
                            animation:
                              !input.trim() && !isLoading && !isTyping
                                ? "randomLook 10s ease-in-out infinite"
                                : isLoading
                                  ? "thinkingEyes 2s ease-in-out infinite"
                                  : input.trim()
                                    ? "listeningEyes 1.5s ease-in-out infinite"
                                    : isTyping
                                      ? "typingEyes 1s ease-in-out infinite"
                                      : undefined,
                          }}
                        ></div>

                        {/* Multiple Eye Shines */}
                        <div
                          className={`absolute top-1 left-1 w-0.5 h-0.5 bg-white rounded-full transition-all duration-300`}
                          style={{
                            animation: "eyeShineFloat 2s ease-in-out infinite",
                          }}
                        ></div>
                        <div
                          className={`absolute top-2 right-1 w-0.5 h-0.5 bg-white/60 rounded-full transition-all duration-300 ${
                            isTyping ? "opacity-100" : "opacity-40"
                          }`}
                        ></div>

                        {/* Iris Detail */}
                        <div
                          className={`absolute inset-1 rounded-full border border-gray-300/30 ${
                            isTyping ? "animate-pulse" : ""
                          }`}
                        ></div>
                      </div>

                      {/* Right Eye (Mirror of Left) */}
                      <div
                        className={`relative w-3 h-3 md:w-4 md:h-4 transition-all duration-400 ${
                          input.trim()
                            ? "bg-emerald-400 scale-125 shadow-emerald-400/70 shadow-lg"
                            : isLoading
                              ? "bg-blue-400 scale-115 shadow-blue-400/70 shadow-lg"
                              : isTyping
                                ? "bg-orange-400 scale-130 shadow-orange-400/80 shadow-xl"
                                : "bg-slate-400 scale-100"
                        } rounded-full`}
                        style={{
                          animation: input.trim()
                            ? "blinkEyes 5s ease-in-out infinite 0.1s"
                            : isLoading
                              ? "blinkEyes 3s ease-in-out infinite 0.1s"
                              : "blinkEyes 8s ease-in-out infinite 0.1s",
                        }}
                      >
                        <div
                          className={`absolute inset-0.5 bg-white rounded-full transition-all duration-300 ${
                            input.trim()
                              ? "scale-90"
                              : isLoading
                                ? "scale-85"
                                : isTyping
                                  ? "scale-88"
                                  : "scale-95"
                          }`}
                        ></div>
                        <div
                          className={`absolute w-1 h-1 bg-black rounded-full transition-all duration-300`}
                          style={{
                            top: input.trim()
                              ? "4px"
                              : isLoading
                                ? "2px"
                                : isTyping
                                  ? "6px"
                                  : "4px",
                            left: input.trim()
                              ? "6px"
                              : isLoading
                                ? "2px"
                                : isTyping
                                  ? "4px"
                                  : "4px",
                            animation:
                              !input.trim() && !isLoading && !isTyping
                                ? "randomLook 10s ease-in-out infinite 0.5s"
                                : isLoading
                                  ? "thinkingEyes 2s ease-in-out infinite 0.2s"
                                  : input.trim()
                                    ? "listeningEyes 1.5s ease-in-out infinite 0.1s"
                                    : isTyping
                                      ? "typingEyes 1s ease-in-out infinite 0.3s"
                                      : undefined,
                          }}
                        ></div>
                        <div
                          className={`absolute top-1 left-1 w-0.5 h-0.5 bg-white rounded-full transition-all duration-300`}
                          style={{
                            animation:
                              "eyeShineFloat 2s ease-in-out infinite 0.5s",
                          }}
                        ></div>
                        <div
                          className={`absolute top-2 right-1 w-0.5 h-0.5 bg-white/60 rounded-full transition-all duration-300 ${
                            isTyping ? "opacity-100" : "opacity-40"
                          }`}
                        ></div>
                        <div
                          className={`absolute inset-1 rounded-full border border-gray-300/30 ${
                            isTyping ? "animate-pulse" : ""
                          }`}
                        ></div>
                      </div>
                    </div>

                    {/* Advanced Mouth Expressions */}
                    <div
                      className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 transition-all duration-400`}
                    >
                      {/* Idle/Happy Mouth */}
                      {!input.trim() && !isLoading && !isTyping && (
                        <div className="w-2 h-0.5 bg-slate-400 rounded-full"></div>
                      )}

                      {/* Listening Mouth */}
                      {input.trim() && (
                        <div
                          className="w-3 h-0.5 bg-emerald-400 rounded-full animate-pulse shadow-emerald-400/50 shadow-md"
                          style={{
                            animation: "mouthTalk 0.8s ease-in-out infinite",
                          }}
                        ></div>
                      )}

                      {/* Thinking Mouth */}
                      {isLoading && (
                        <div className="w-2 h-2 border-2 border-blue-400 rounded-full animate-spin shadow-blue-400/50 shadow-md"></div>
                      )}

                      {/* Speaking Mouth */}
                      {isTyping && (
                        <div className="flex space-x-0.5">
                          <div
                            className="w-1 h-1 bg-orange-400 rounded-full"
                            style={{
                              animation: "mouthTalk 0.6s ease-in-out infinite",
                            }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-orange-400 rounded-full"
                            style={{
                              animation:
                                "mouthTalk 0.6s ease-in-out infinite 0.2s",
                            }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-orange-400 rounded-full"
                            style={{
                              animation:
                                "mouthTalk 0.6s ease-in-out infinite 0.4s",
                            }}
                          ></div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Status LED Strip */}
                    <div
                      className={`absolute top-0.5 left-1 right-1 h-0.5 rounded-full transition-all duration-800 ${
                        input.trim()
                          ? "bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-90"
                          : isLoading
                            ? "bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-95"
                            : isTyping
                              ? "bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-90"
                              : "bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-50"
                      }`}
                      style={{
                        animation: input.trim()
                          ? "processingGlow 2s ease-in-out infinite"
                          : isLoading
                            ? "processingGlow 1.5s ease-in-out infinite"
                            : isTyping
                              ? "processingGlow 1s ease-in-out infinite"
                              : "processingGlow 4s ease-in-out infinite",
                      }}
                    ></div>

                    {/* Additional LED Indicators */}
                    <div className="absolute top-1 right-1 flex space-x-0.5">
                      <div
                        className={`w-0.5 h-0.5 rounded-full transition-all duration-500 ${
                          input.trim()
                            ? "bg-emerald-400 opacity-100"
                            : isLoading
                              ? "bg-blue-400 opacity-100"
                              : isTyping
                                ? "bg-orange-400 opacity-100"
                                : "bg-slate-400 opacity-60"
                        }`}
                        style={{
                          animation: isTyping
                            ? "processingGlow 0.5s ease-in-out infinite"
                            : isLoading
                              ? "processingGlow 1s ease-in-out infinite"
                              : undefined,
                        }}
                      ></div>
                      <div
                        className={`w-0.5 h-0.5 rounded-full transition-all duration-500 ${
                          isLoading
                            ? "bg-blue-400 opacity-100"
                            : isTyping
                              ? "bg-orange-400 opacity-100"
                              : "bg-slate-400 opacity-40"
                        }`}
                        style={{
                          animation: isTyping
                            ? "processingGlow 0.5s ease-in-out infinite 0.2s"
                            : isLoading
                              ? "processingGlow 1s ease-in-out infinite 0.5s"
                              : undefined,
                        }}
                      ></div>
                    </div>

                    {/* Enhanced Breathing Effect */}
                    <div
                      className="absolute inset-0 rounded-md opacity-5 bg-gradient-to-br from-white to-transparent"
                      style={{
                        animation: "processingGlow 4s ease-in-out infinite",
                      }}
                    ></div>
                  </div>

                  {/* Enhanced Side Audio Panels with Wave Effect */}
                  <div
                    className={`absolute -left-1 top-2 w-1.5 rounded-l-full transition-all duration-500 ${
                      input.trim()
                        ? "bg-gradient-to-b from-emerald-300 to-emerald-500 shadow-emerald-400/50 shadow-md h-8"
                        : isLoading
                          ? "bg-gradient-to-b from-blue-300 to-blue-500 shadow-blue-400/50 shadow-md h-8"
                          : isTyping
                            ? "bg-gradient-to-b from-orange-300 to-orange-500 shadow-orange-400/50 shadow-md h-8"
                            : "bg-gradient-to-b from-slate-300 to-slate-500 h-8"
                    }`}
                    style={{
                      animation: isTyping
                        ? "audioWave 0.8s ease-in-out infinite"
                        : input.trim()
                          ? "audioWave 0.8s ease-in-out infinite"
                          : isLoading
                            ? "audioWave 1.2s ease-in-out infinite"
                            : undefined,
                    }}
                  ></div>
                  <div
                    className={`absolute -right-1 top-2 w-1.5 rounded-r-full transition-all duration-500 ${
                      input.trim()
                        ? "bg-gradient-to-b from-emerald-300 to-emerald-500 shadow-emerald-400/50 shadow-md h-8"
                        : isLoading
                          ? "bg-gradient-to-b from-blue-300 to-blue-500 shadow-blue-400/50 shadow-md h-8"
                          : isTyping
                            ? "bg-gradient-to-b from-orange-300 to-orange-500 shadow-orange-400/50 shadow-md h-8"
                            : "bg-gradient-to-b from-slate-300 to-slate-500 h-8"
                    }`}
                    style={{
                      animation: isTyping
                        ? "audioWave 0.8s ease-in-out infinite 0.2s"
                        : input.trim()
                          ? "audioWave 0.8s ease-in-out infinite 0.2s"
                          : isLoading
                            ? "audioWave 1.2s ease-in-out infinite 0.3s"
                            : undefined,
                    }}
                  ></div>

                  {/* Additional Visual Elements */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-full"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-full"></div>
                </div>

                {/* Enhanced Antenna System */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  {/* Main Antenna Rod */}
                  <div
                    className={`w-0.5 h-4 bg-gradient-to-t from-slate-600 to-slate-400 rounded-full transition-all duration-300 ${
                      isTyping ? "animate-pulse shadow-lg" : ""
                    }`}
                  ></div>

                  {/* Antenna Signal Ball */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full -mt-1 mx-auto transition-all duration-400 border border-white/30 ${
                      input.trim()
                        ? "bg-emerald-400 scale-110 shadow-emerald-400/80 shadow-xl"
                        : isLoading
                          ? "bg-blue-400 scale-105 shadow-blue-400/80 shadow-xl"
                          : isTyping
                            ? "bg-orange-400 scale-125 shadow-orange-400/90 shadow-2xl"
                            : "bg-slate-400 scale-100 shadow-slate-400/50 shadow-md"
                    }`}
                    style={{
                      animation: isTyping
                        ? "antennaSignal 0.8s ease-in-out infinite"
                        : input.trim()
                          ? "processingGlow 2s ease-in-out infinite"
                          : isLoading
                            ? "processingGlow 1.5s ease-in-out infinite"
                            : "processingGlow 4s ease-in-out infinite",
                    }}
                  >
                    {/* Inner Core */}
                    <div
                      className={`absolute inset-1 bg-white rounded-full transition-all duration-300 ${
                        isTyping ? "opacity-90 animate-pulse" : "opacity-80"
                      }`}
                    ></div>

                    {/* Signal Waves */}
                    {(isTyping || isLoading || input.trim()) && (
                      <>
                        <div
                          className="absolute -inset-2 rounded-full border border-current opacity-40 animate-ping"
                          style={{ animationDuration: "2s" }}
                        ></div>
                        <div
                          className="absolute -inset-3 rounded-full border border-current opacity-20 animate-ping"
                          style={{
                            animationDuration: "2.5s",
                            animationDelay: "0.5s",
                          }}
                        ></div>
                      </>
                    )}
                  </div>

                  {/* Secondary Antenna Elements */}
                  <div className="absolute -left-1 top-1 w-0.5 h-2 bg-slate-500 rounded-full transform rotate-45 opacity-60"></div>
                  <div className="absolute -right-1 top-1 w-0.5 h-2 bg-slate-500 rounded-full transform -rotate-45 opacity-60"></div>
                </div>

                {/* Dynamic Background Particles */}
                {(isTyping || isLoading) && (
                  <div className="absolute inset-0 overflow-hidden rounded-full opacity-30">
                    <div
                      className={`absolute w-1 h-1 bg-current rounded-full ${
                        isTyping ? "animate-bounce" : "animate-pulse"
                      }`}
                      style={{
                        top: "20%",
                        left: "15%",
                        animationDelay: "0s",
                        animationDuration: "2s",
                      }}
                    ></div>
                    <div
                      className={`absolute w-1 h-1 bg-current rounded-full ${
                        isTyping ? "animate-bounce" : "animate-pulse"
                      }`}
                      style={{
                        top: "60%",
                        right: "20%",
                        animationDelay: "0.7s",
                        animationDuration: "2.2s",
                      }}
                    ></div>
                    <div
                      className={`absolute w-1 h-1 bg-current rounded-full ${
                        isTyping ? "animate-bounce" : "animate-pulse"
                      }`}
                      style={{
                        bottom: "30%",
                        left: "70%",
                        animationDelay: "1.4s",
                        animationDuration: "1.8s",
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="p-2 md:p-3 pl-3 md:pl-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 text-white rounded-t-xl md:rounded-t-2xl flex justify-between items-center relative overflow-hidden transition-all duration-300">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10 animate-float-slow"></div>
              <div
                className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-full translate-x-8 translate-y-8 animate-float-slow"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
            <div className="font-semibold flex items-center gap-2 relative z-10">
              <div className="md:hidden animate-pulse">
                <Bot size={16} className="w-5 h-5" />
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
          <div
            className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-surface"
            data-chat-container
          >
            <div className="p-3 md:p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex flex-col">
                  <div
                    className={`p-2 md:p-3 px-3 md:px-4 max-w-[90%] md:max-w-[85%] rounded-lg md:rounded-xl text-xs md:text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.sender === "user"
                        ? "ml-auto bg-indigo-100 dark:bg-indigo-900/30 text-gray-800 dark:text-gray-200"
                        : "mr-auto bg-white dark:bg-dark-card border dark:border-dark-border text-gray-800 dark:text-gray-200"
                    } transition-all duration-300`}
                  >
                    {msg.sender === "bot" ? (
                      <div
                        className="whitespace-pre-line leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html:
                            typeof msg.text === "string"
                              ? msg.text
                              : JSON.stringify(msg.text),
                        }}
                      ></div>
                    ) : typeof msg.text === "string" ? (
                      msg.text
                    ) : (
                      JSON.stringify(msg.text)
                    )}
                  </div>

                  {/* Payment Processing Animation */}
                  {msg.processingPayment && msg.paymentSteps && (
                    <div className="mt-3 mr-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg md:rounded-xl p-3 md:p-4 w-[95%] md:w-[90%] text-xs md:text-sm shadow transition-all duration-300">
                      <div className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2 transition-colors duration-300">
                        <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
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
                    <div className="mt-3 mr-auto bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg md:rounded-xl p-3 md:p-4 w-[95%] md:w-[90%] text-xs md:text-sm shadow transition-all duration-300">
                      <div className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center justify-between transition-colors duration-300">
                        <span>💳 Payment Receipt</span>
                        <button
                          onClick={() => {
                            const printWindow = window.open("", "_blank");
                            if (printWindow) {
                              printWindow.document.write(`
                              <html>
                                <head>
                                  <title>ConsultBridge Payment Receipt</title>
                                  <style>
                                    body {
                                      font-family: 'Arial', sans-serif;
                                      max-width: 400px;
                                      margin: 20px auto;
                                      padding: 30px;
                                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                      color: white;
                                      border-radius: 15px;
                                      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                                    }
                                    .header {
                                      text-align: center;
                                      margin-bottom: 30px;
                                      border-bottom: 2px dashed rgba(255,255,255,0.3);
                                      padding-bottom: 20px;
                                    }
                                    .logo {
                                      font-size: 32px;
                                      font-weight: bold;
                                      margin-bottom: 5px;
                                      background: linear-gradient(45deg, #FFD700, #FFA500);
                                      -webkit-background-clip: text;
                                      -webkit-text-fill-color: transparent;
                                      background-clip: text;
                                    }
                                    .tagline {
                                      font-size: 12px;
                                      opacity: 0.8;
                                      margin-bottom: 10px;
                                    }
                                    .receipt-title {
                                      font-size: 18px;
                                      font-weight: bold;
                                      margin-bottom: 5px;
                                    }
                                    .receipt-id {
                                      font-size: 14px;
                                      opacity: 0.9;
                                      font-family: monospace;
                                      background: rgba(255,255,255,0.1);
                                      padding: 5px 10px;
                                      border-radius: 5px;
                                      display: inline-block;
                                    }
                                    .details {
                                      margin: 25px 0;
                                    }
                                    .detail-row {
                                      display: flex;
                                      justify-content: space-between;
                                      margin: 12px 0;
                                      padding: 8px 0;
                                      border-bottom: 1px solid rgba(255,255,255,0.1);
                                    }
                                    .detail-label {
                                      font-weight: 600;
                                      opacity: 0.9;
                                    }
                                    .detail-value {
                                      font-weight: bold;
                                    }
                                    .amount-row {
                                      background: rgba(255,255,255,0.1);
                                      margin: 20px -15px;
                                      padding: 15px;
                                      border-radius: 10px;
                                      font-size: 18px;
                                    }
                                    .status {
                                      text-align: center;
                                      margin: 25px 0;
                                      padding: 15px;
                                      background: rgba(34, 197, 94, 0.2);
                                      border: 2px solid #22c55e;
                                      border-radius: 10px;
                                      font-weight: bold;
                                      font-size: 16px;
                                    }
                                    .footer {
                                      text-align: center;
                                      margin-top: 30px;
                                      padding-top: 20px;
                                      border-top: 2px dashed rgba(255,255,255,0.3);
                                      font-size: 12px;
                                      opacity: 0.8;
                                    }
                                    .qr-placeholder {
                                      width: 80px;
                                      height: 80px;
                                      background: rgba(255,255,255,0.9);
                                      margin: 15px auto;
                                      border-radius: 10px;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      color: #333;
                                      font-size: 10px;
                                      text-align: center;
                                      font-weight: bold;
                                    }
                                    @media print {
                                      body {
                                        background: white !important;
                                        color: black !important;
                                        box-shadow: none !important;
                                      }
                                      .logo {
                                        color: #4f46e5 !important;
                                        -webkit-text-fill-color: #4f46e5 !important;
                                      }
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <div class="logo">🌉 ConsultBridge</div>
                                    <div class="tagline">Bridging You to the Right Consultancy</div>
                                    <div class="receipt-title">💳 PAYMENT RECEIPT</div>
                                    <div class="receipt-id">${msg.paymentReceipt.id}</div>
                                  </div>
                                  
                                  <div class="details">
                                    <div class="detail-row">
                                      <span class="detail-label">👤 Client:</span>
                                      <span class="detail-value">${msg.paymentReceipt.clientName}</span>
                                    </div>
                                    <div class="detail-row">
                                      <span class="detail-label">🏢 Consultancy:</span>
                                      <span class="detail-value">${msg.paymentReceipt.consultancyName}</span>
                                    </div>
                                    <div class="detail-row">
                                      <span class="detail-label">📅 Date:</span>
                                      <span class="detail-value">${msg.paymentReceipt.date}</span>
                                    </div>
                                    <div class="detail-row">
                                      <span class="detail-label">🕐 Time:</span>
                                      <span class="detail-value">${msg.paymentReceipt.time}</span>
                                    </div>
                                    <div class="detail-row">
                                      <span class="detail-label">📍 Meeting Type:</span>
                                      <span class="detail-value">${msg.paymentReceipt.appointmentType?.toUpperCase() || "ONLINE"}</span>
                                    </div>
                                    <div class="detail-row">
                                      <span class="detail-label">💳 Payment Method:</span>
                                      <span class="detail-value">${msg.paymentReceipt.paymentMethod?.toUpperCase() || "CARD"}</span>
                                    </div>
                                  </div>
                                  
                                  <div class="detail-row amount-row">
                                    <span class="detail-label">💰 Total Amount:</span>
                                    <span class="detail-value">₹${msg.paymentReceipt.amount}</span>
                                  </div>
                                  
                                  <div class="status">
                                    ✅ PAYMENT CONFIRMED
                                  </div>
                                  
                                  <div class="footer">
                                    <div class="qr-placeholder">
                                      📱<br>QR CODE<br>PLACEHOLDER
                                    </div>
                                    <div>Thank you for choosing ConsultBridge!</div>
                                    <div style="margin-top: 10px; font-size: 10px;">
                                      📧 support@consultbridge.com | 📞 +91-XXXX-XXXX-XX
                                    </div>
                                    <div style="margin-top: 5px; font-size: 10px;">
                                      Generated on ${new Date().toLocaleString()}
                                    </div>
                                  </div>
                                </body>
                              </html>
                            `);
                              printWindow.document.close();
                              printWindow.print();
                            }
                          }}
                          className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          🖨️ Print
                        </button>
                      </div>
                      <div className="space-y-1 text-green-600 dark:text-green-400 transition-colors duration-300">
                        <p>
                          <strong className="text-green-700 dark:text-green-300">
                            Receipt ID:
                          </strong>{" "}
                          {msg.paymentReceipt.id}
                        </p>
                        <p>
                          <strong className="text-green-700 dark:text-green-300">
                            Amount:
                          </strong>{" "}
                          ₹{msg.paymentReceipt.amount}
                        </p>
                        <p>
                          <strong className="text-green-700 dark:text-green-300">
                            Payment Method:
                          </strong>{" "}
                          {msg.paymentReceipt.paymentMethod?.toUpperCase() ||
                            "CARD"}
                        </p>
                        <p>
                          <strong className="text-green-700 dark:text-green-300">
                            Client:
                          </strong>{" "}
                          {msg.paymentReceipt.clientName}
                        </p>
                        <p>
                          <strong className="text-green-700 dark:text-green-300">
                            Consultancy:
                          </strong>{" "}
                          {msg.paymentReceipt.consultancyName}
                        </p>
                        <p>
                          <strong className="text-green-700 dark:text-green-300">
                            Meeting Type:
                          </strong>{" "}
                          {msg.paymentReceipt.appointmentType?.toUpperCase() ||
                            "ONLINE"}
                        </p>
                        <p>
                          <strong className="text-green-700 dark:text-green-300">
                            Date:
                          </strong>{" "}
                          {msg.paymentReceipt.date}
                        </p>
                        <p>
                          <strong className="text-green-700 dark:text-green-300">
                            Time:
                          </strong>{" "}
                          {msg.paymentReceipt.time}
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
                          <div
                            key={i}
                            className="bg-white p-3 rounded-lg border border-blue-100"
                          >
                            <div className="font-medium text-gray-800">
                              {booking.consultancyName}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              📅 {booking.date} at {booking.time}
                            </div>
                            <div className="text-xs text-gray-600">
                              📍 {booking.type} consultation
                            </div>
                            <div className="text-xs mt-1 flex items-center gap-1">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === "Confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : booking.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {booking.status === "Confirmed" ? "✅" : "⏳"}{" "}
                                {booking.status}
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
                  {msg.consultancies &&
                    msg.consultancies.length > 0 &&
                    (!msg.actionType || msg.actionType !== "book") &&
                    !msg.text.includes("Please provide your preferred date") &&
                    !msg.text.includes("what time would you prefer") &&
                    !msg.text.includes("How would you prefer to meet") &&
                    !msg.text.includes("How would you like to pay") &&
                    !msg.text.includes("Available Days: Monday to Friday") && (
                      <div className="mt-3 space-y-1">
                        {msg.consultancies.map((consultancy: any) => (
                          <div
                            key={consultancy._id}
                            className="flex gap-2 items-center p-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                                {consultancy.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                                ⭐ {consultancy.rating || 4.5}/5 •{" "}
                                {consultancy.category} •{" "}
                                {consultancy.price || "₹1,500/hr"}
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
                                // Safely check authentication status
                                const checkAuthStatus = () => {
                                  try {
                                    return isSignedIn && userId;
                                  } catch (error) {
                                    console.warn(
                                      "Error checking auth status:",
                                      error
                                    );
                                    return false;
                                  }
                                };

                                if (!checkAuthStatus()) {
                                  const authMessage = {
                                    sender: "bot" as const,
                                    text: "To book appointments, please sign in first. It's quick and secure! 🔒",
                                    requiresAuth: true,
                                    authMessage:
                                      "Sign in required to book appointments",
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
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden transition-all duration-300">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 h-full transition-all duration-300 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>

                  {/* Random Tip */}
                  {waitingTip && (
                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-sm animate-fade-in transition-all duration-300">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">💭</span>
                        <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
                          {waitingTip}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Real-time Typing Message */}
              {isTyping && (
                <div className="mr-auto max-w-[85%] rounded-xl text-sm bg-white dark:bg-dark-card border dark:border-dark-border p-3 px-4 transition-all duration-300">
                  <div
                    className="whitespace-pre-line leading-relaxed text-gray-800 dark:text-gray-200 transition-all duration-300"
                    dangerouslySetInnerHTML={{
                      __html:
                        (typeof typingMessage === "string"
                          ? typingMessage
                          : "") +
                        '<span class="inline-block w-3 h-5 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-neon-blue dark:to-neon-purple ml-1 rounded animate-pulse shadow-lg" style="animation-duration: 0.8s;"></span>',
                    }}
                  ></div>
                </div>
              )}

              {/* Quick Action Buttons */}
              {showQuickActions && messages.length === 1 && (
                <div className="mr-auto space-y-2 mt-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 transition-all duration-300">
                    Quick actions:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleQuickAction("Show my bookings")}
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-all duration-300"
                    >
                      📅 My Bookings
                    </button>
                    <button
                      onClick={() =>
                        handleQuickAction("I need business consulting")
                      }
                      className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800/40 transition-all duration-300"
                    >
                      💼 Business Help
                    </button>
                    <button
                      onClick={() => handleQuickAction("I need legal advice")}
                      className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-all duration-300"
                    >
                      ⚖️ Legal Advice
                    </button>
                    <button
                      onClick={() =>
                        handleQuickAction("Reschedule appointment")
                      }
                      className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800/40 transition-all duration-300"
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
          <div className="p-2 md:p-3 bg-gradient-to-r from-gray-50 to-white dark:from-dark-surface dark:to-dark-card flex items-center gap-2 transition-all duration-300">
            <input
              type="text"
              className="flex-1 border border-gray-300 dark:border-dark-border rounded-full px-3 md:px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-neon-blue focus:border-indigo-500 dark:focus:border-neon-blue transition-all hover:border-indigo-300 dark:hover:border-neon-cyan bg-white dark:bg-dark-surface text-gray-800 dark:text-gray-200"
              placeholder={
                isLoading ? "Please wait..." : "Ask me anything... 🚀"
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md mx-4 border border-gray-200 dark:border-gray-700 transition-colors duration-500"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤔</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-500">
                Start Fresh Chat?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-500">
                {isLoading || isTyping
                  ? "Shaan is currently responding. Starting a new chat will stop the current response and clear all messages."
                  : "This will clear all your current messages and conversation history. Are you sure you want to continue?"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium"
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
