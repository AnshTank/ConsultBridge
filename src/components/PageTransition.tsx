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
      <div className="min-h-screen bg-gray-50 opacity-0 overflow-x-hidden">
        {children}
      </div>
    );
  }
  
  // Home page gets simple fade transition
  if (isHome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="overflow-x-hidden"
      >
        {children}
      </motion.div>
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
      className="overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;