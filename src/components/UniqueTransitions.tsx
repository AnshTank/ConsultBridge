"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const UniqueTransitions = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // Skip transitions during loading screens
  useEffect(() => {
    const hasLoadingClass = document.body.classList.contains('loading');
    setIsLoading(hasLoadingClass);
  }, [pathname]);

  // Smooth vanishing/appearing transition
  const getAnimation = () => {
    // No transition during loading
    if (isLoading) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 }
      };
    }
    
    return {
      initial: { 
        opacity: 0,
        scale: 1.02,
        filter: "blur(4px) brightness(1.1)"
      },
      animate: { 
        opacity: 1,
        scale: 1,
        filter: "blur(0px) brightness(1)"
      },
      exit: { 
        opacity: 0,
        scale: 0.98,
        filter: "blur(4px) brightness(0.9)"
      }
    };
  };

  const animation = getAnimation();

  return (
    <>
      {/* Unique Page Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={animation.initial}
          animate={animation.animate}
          exit={animation.exit}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            type: "tween"
          }}
          style={{ 
            transformStyle: "preserve-3d",
            perspective: "1000px"
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Smooth Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Random Moving Orbs */}
        {[...Array(3)].map((_, i) => {
          const getRandomPath = () => [
            Math.random() * 150 - 75,
            Math.random() * 150 - 75,
            Math.random() * 150 - 75,
            Math.random() * 150 - 75,
            Math.random() * 150 - 75
          ];
          
          return (
            <motion.div
              key={i}
              className="absolute w-40 h-40 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, ${
                  i === 0 ? '#6366f1' : i === 1 ? '#8b5cf6' : '#ec4899'
                } 0%, transparent 70%)`
              }}
              animate={{
                x: getRandomPath(),
                y: getRandomPath(),
                scale: [1, Math.random() * 0.5 + 0.8, Math.random() * 0.5 + 0.8, Math.random() * 0.5 + 0.8, 1]
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
              initial={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`
              }}
            />
          );
        })}
        
        {/* Random Floating Dots */}
        {[...Array(6)].map((_, i) => {
          const getRandomDotPath = () => [
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40
          ];
          
          return (
            <motion.div
              key={`dot-${i}`}
              className="absolute w-2 h-2 bg-indigo-400 rounded-full opacity-20"
              animate={{
                x: getRandomDotPath(),
                y: getRandomDotPath(),
                opacity: [0.1, 0.4, 0.2, 0.6, 0.3, 0.1]
              }}
              transition={{
                duration: 8 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "linear"
              }}
              style={{
                left: `${15 + i * 15}%`,
                top: `${40 + (i % 2) * 20}%`
              }}
            />
          );
        })}
      </div>
    </>
  );
};

export default UniqueTransitions;