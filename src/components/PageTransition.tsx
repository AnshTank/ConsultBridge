"use client";
import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isHome, setIsHome] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    setIsHome(window.location.pathname === '/');
  }, []);

  // If not client-side yet, render with background to prevent flash
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 opacity-0">
        {children}
      </div>
    );
  }
  
  // Home page gets wave transition, others get simple fade
  if (isHome) {
    return (
      <>
        {/* Wave overlay for home page */}
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transform skew-x-12 origin-top-left scale-110" />
        </motion.div>
        
        {/* Home page content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.5
          }}
        >
          {children}
        </motion.div>
      </>
    );
  }
  
  // Other pages get smooth left-to-right slide transition
  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.2
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;