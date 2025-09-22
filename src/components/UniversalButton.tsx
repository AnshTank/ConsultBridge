"use client";
import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

interface UniversalButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "enhanced";
  type?: "button" | "submit" | "reset";
}

const UniversalButton = ({ 
  children, 
  onClick, 
  className = "",
  disabled = false,
  loading = false,
  variant = "default",
  type = "button"
}: UniversalButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{id: number, x: number, y: number}>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  if (variant === "enhanced") {
    return (
      <motion.button
        type={type}
        className={`relative overflow-hidden transition-all duration-300 ${className} ${
          disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={handleClick}
        disabled={disabled || loading}
        whileHover={disabled || loading ? {} : { 
          scale: 1.02,
          y: -1
        }}
        whileTap={disabled || loading ? {} : { 
          scale: 0.98
        }}
        animate={{ 
          scale: isPressed ? 0.95 : 1
        }}
        transition={{ 
          duration: 0.2,
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
        
        {/* Hover glow */}
        <motion.div
          className="absolute inset-0 bg-white rounded-lg"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.1 }}
          transition={{ duration: 0.3 }}
        />
        
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && (
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
          {children}
        </span>
      </motion.button>
    );
  }

  // Default variant - minimal enhancement
  return (
    <motion.button
      type={type}
      className={`relative overflow-hidden transition-all duration-200 ${className} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { 
        scale: 1.01
      }}
      whileTap={disabled || loading ? {} : { 
        scale: 0.99
      }}
      transition={{ 
        duration: 0.15,
        ease: "easeOut"
      }}
    >
      {/* Subtle ripple for default variant */}
      {ripples.slice(-1).map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full bg-current pointer-events-none"
          style={{
            left: ripple.x - 5,
            top: ripple.y - 5,
            width: 10,
            height: 10,
          }}
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      ))}
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            className="w-3 h-3 border border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </span>
    </motion.button>
  );
};

export default UniversalButton;