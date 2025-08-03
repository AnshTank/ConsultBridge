"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const RouteTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Different animations for different routes
  const getAnimation = () => {
    if (pathname.includes('/categories')) {
      return {
        initial: { opacity: 0, x: 100, scale: 0.95 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: -100, scale: 1.05 }
      };
    }
    
    if (pathname.includes('/consultancy/')) {
      return {
        initial: { opacity: 0, y: 50, rotateX: -10 },
        animate: { opacity: 1, y: 0, rotateX: 0 },
        exit: { opacity: 0, y: -50, rotateX: 10 }
      };
    }
    
    if (pathname.includes('/admin')) {
      return {
        initial: { opacity: 0, scale: 0.9, rotateY: -15 },
        animate: { opacity: 1, scale: 1, rotateY: 0 },
        exit: { opacity: 0, scale: 1.1, rotateY: 15 }
      };
    }
    
    // Default smooth transition
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    };
  };

  const animation = getAnimation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={animation.initial}
        animate={animation.animate}
        exit={animation.exit}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default RouteTransition;