"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: number;
}

const AnimatedCard = ({ 
  children, 
  className = "", 
  delay = 0,
  hoverScale = 1.03
}: AnimatedCardProps) => {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ 
        opacity: 0, 
        y: 50,
        rotateX: -15
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotateX: 0
      }}
      transition={{ 
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ 
        scale: hoverScale,
        y: -5,
        rotateY: 5,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0"
        whileHover={{ 
          opacity: 1,
          x: ['-100%', '100%']
        }}
        transition={{ 
          opacity: { duration: 0.3 },
          x: { duration: 0.6, ease: "easeInOut" }
        }}
      />
      
      {/* Border glow */}
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-transparent"
        whileHover={{
          borderColor: "rgba(99, 102, 241, 0.3)",
          boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)"
        }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default AnimatedCard;