"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white overflow-hidden">
      {/* Simple Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400 to-indigo-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Brand Section */}
          <motion.div
            className="text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-center md:justify-start mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3 md:mr-4">
                <span className="text-lg md:text-xl font-bold">CB</span>
              </div>
              <h4 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                ConsultBridge
              </h4>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4 text-sm md:text-base">
              Your gateway to professional consultancy services.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 text-xs md:text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                Growing Network
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Quality Verified
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Always Available
              </span>
            </div>
          </motion.div>

          {/* Categories & Company Side by Side */}
          <motion.div
            className="grid grid-cols-2 gap-4 md:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Categories */}
            <div>
              <h5 className="font-bold mb-3 md:mb-4 text-indigo-300 text-center md:text-left">Categories</h5>
              <ul className="space-y-2">
                {[
                  { name: "Browse All", href: "/categories" },
                  { name: "Business", href: "/category/business-strategy" },
                  { name: "Technology", href: "/category/technology" },
                  { name: "Legal", href: "/category/legal-advisory" }
                ].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href={item.href} 
                      className="group flex items-center justify-center md:justify-start text-gray-400 hover:text-white transition-colors duration-300 text-xs md:text-sm"
                    >
                      <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-indigo-400 transition-colors"></span>
                      <span>{item.name}</span>
                      <ArrowRight className="w-2 h-2 md:w-3 md:h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="font-bold mb-3 md:mb-4 text-purple-300 text-center md:text-left">Company</h5>
              <ul className="space-y-2">
                {[
                  { name: "About", href: "/about" },
                  { name: "Contact", href: "/contact" },
                  { name: "Privacy", href: "/privacy" },
                  { name: "Terms", href: "/terms" }
                ].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href={item.href} 
                      className="group flex items-center justify-center md:justify-start text-gray-400 hover:text-white transition-colors duration-300 text-xs md:text-sm"
                    >
                      <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-purple-400 transition-colors"></span>
                      <span>{item.name}</span>
                      <ArrowRight className="w-2 h-2 md:w-3 md:h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h5 className="font-bold mb-3 md:mb-4 text-pink-300 text-center md:text-left">Connect</h5>
            
            {/* Mobile: Popup Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setShowSocialLinks(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all flex items-center gap-2 mx-auto"
              >
                Follow Us
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            {/* Desktop: Full List */}
            <ul className="space-y-2 hidden md:block">
              {[
                { name: "Twitter", href: "/coming-soon?platform=twitter" },
                { name: "LinkedIn", href: "/coming-soon?platform=linkedin" },
                { name: "Facebook", href: "/coming-soon?platform=facebook" },
                { name: "Instagram", href: "/coming-soon?platform=instagram" }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="group flex items-center justify-center md:justify-start text-gray-400 hover:text-white transition-colors duration-300 text-sm md:text-base"
                  >
                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-3 group-hover:bg-pink-400 transition-colors"></span>
                    <span>{item.name}</span>
                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-gray-700/50 pt-4 md:pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex flex-col items-center justify-center gap-2 md:gap-4 text-center">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-400 text-xs md:text-sm">
              <span>&copy; 2025 ConsultBridge. All rights reserved.</span>
              <span className="hidden md:inline">|</span>
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <span>Crafted by</span>
                <Link 
                  href="https://github.com/AnshTank" 
                  target="_blank"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Ansh Tank
                </Link>
                <span className="text-gray-500">• Bridging Excellence</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Social Media Popup Modal */}
      {showSocialLinks && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowSocialLinks(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center">Follow Us</h3>
            <div className="space-y-3">
              {[
                { name: "Twitter", href: "/coming-soon?platform=twitter", emoji: "🐦" },
                { name: "LinkedIn", href: "/coming-soon?platform=linkedin", emoji: "💼" },
                { name: "Facebook", href: "/coming-soon?platform=facebook", emoji: "👥" },
                { name: "Instagram", href: "/coming-soon?platform=instagram", emoji: "📸" }
              ].map((item, index) => (
                <Link 
                  key={index}
                  href={item.href} 
                  className="flex items-center gap-3 text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 py-3 px-4 rounded-lg transition-all"
                  onClick={() => setShowSocialLinks(false)}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="font-medium">{item.name}</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Link>
              ))}
            </div>
            <button
              onClick={() => setShowSocialLinks(false)}
              className="w-full mt-4 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </footer>
  );
};

export default Footer;