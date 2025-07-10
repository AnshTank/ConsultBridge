"use client";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Twitter, Linkedin, Facebook, Instagram, Rocket } from "lucide-react";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function ComingSoonPage() {
  const searchParams = useSearchParams();
  const platform = searchParams?.get('platform') || 'feature';
  
  const platformConfig = {
    twitter: {
      icon: Twitter,
      name: "Twitter",
      color: "from-blue-400 to-blue-600",
      emoji: "🐦",
      description: "Follow us for the latest updates and insights"
    },
    linkedin: {
      icon: Linkedin,
      name: "LinkedIn",
      color: "from-blue-600 to-blue-800",
      emoji: "💼",
      description: "Connect with us professionally"
    },
    facebook: {
      icon: Facebook,
      name: "Facebook",
      color: "from-blue-500 to-blue-700",
      emoji: "👥",
      description: "Join our community"
    },
    instagram: {
      icon: Instagram,
      name: "Instagram",
      color: "from-pink-500 to-purple-600",
      emoji: "📸",
      description: "See behind the scenes"
    }
  };

  const config = platformConfig[platform as keyof typeof platformConfig] || {
    icon: Sparkles,
    name: "Amazing Feature",
    color: "from-purple-500 to-pink-600",
    emoji: "✨",
    description: "Something incredible is coming"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden page-transition">
      <Navbar />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: Math.random() * 1200,
              y: Math.random() * 800,
              opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{
              y: [null, -50],
              opacity: [null, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            <motion.div
              className="flex justify-center mb-8"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className={`p-8 rounded-full bg-gradient-to-r ${config.color} shadow-2xl`}>
                <config.icon className="w-16 h-16 text-white" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-6"
            >
              <div className="text-6xl mb-4">{config.emoji}</div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                <span className={`bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                  {config.name}
                </span>
              </h1>
              <h2 className="text-3xl md:text-5xl text-gray-300 mb-6">
                Coming Soon
              </h2>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-8"
            >
              ✨ {config.description} ✨
              <br />
              <span className="text-lg text-gray-400 mt-2 block">
                We're crafting something extraordinary just for you!
              </span>
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mb-12"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 1, -1, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-6xl mb-4"
            >
              🚀
            </motion.div>
            <p className="text-lg text-gray-300">
              Stay tuned for something amazing!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <Link
              href="/"
              className={`inline-flex items-center px-8 py-4 bg-gradient-to-r ${config.color} text-white font-semibold rounded-full hover:shadow-2xl transition-all transform hover:scale-105`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}