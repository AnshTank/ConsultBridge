"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white overflow-hidden">
      {/* Simple Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400 to-indigo-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-xl font-bold">CB</span>
              </div>
              <h4 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                ConsultBridge
              </h4>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Your gateway to professional consultancy services.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
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

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h5 className="font-bold mb-4 text-indigo-300">Categories</h5>
            <ul className="space-y-2">
              {[
                { name: "Browse All", href: "/categories" },
                { name: "Business Strategy", href: "/category/business-strategy" },
                { name: "Technology", href: "/category/technology" },
                { name: "Legal Advisory", href: "/category/legal-advisory" }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="group flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-3 group-hover:bg-indigo-400 transition-colors"></span>
                    <span>{item.name}</span>
                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h5 className="font-bold mb-4 text-purple-300">Company</h5>
            <ul className="space-y-2">
              {[
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="group flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></span>
                    <span>{item.name}</span>
                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h5 className="font-bold mb-4 text-pink-300">Connect</h5>
            <ul className="space-y-2">
              {[
                { name: "Twitter", href: "/coming-soon?platform=twitter" },
                { name: "LinkedIn", href: "/coming-soon?platform=linkedin" },
                { name: "Facebook", href: "/coming-soon?platform=facebook" },
                { name: "Instagram", href: "/coming-soon?platform=instagram" }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="group flex items-center text-gray-400 hover:text-white transition-colors duration-300"
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
          className="border-t border-gray-700/50 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <span>&copy; 2025 ConsultBridge. All rights reserved.</span>
              <span className="hidden md:inline">|</span>
              <div className="flex items-center gap-1">
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
    </footer>
  );
};

export default Footer;