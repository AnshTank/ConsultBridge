"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="relative inline-block w-14 h-7 rounded-full overflow-hidden transition-all duration-500 ease-out" 
         style={{
           backgroundColor: isDarkMode ? '#2a2a2a' : 'linear-gradient(to right, #60a5fa, #a855f7)',
           background: isDarkMode ? '#2a2a2a' : 'linear-gradient(to right, #60a5fa, #a855f7)',
           border: '2px solid rgba(255,255,255,0.2)'
         }}>
      <input
        type="checkbox"
        checked={isDarkMode}
        onChange={toggleTheme}
        className="absolute w-full h-full opacity-0 z-10 cursor-pointer"
      />
      
      {/* Toggle Circle */}
      <div 
        className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-500 ease-out flex items-center justify-center"
        style={{
          backgroundColor: isDarkMode ? '#f1f5f9' : '#fbbf24',
          transform: isDarkMode ? 'translateX(2px)' : 'translateX(30px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
        
        {/* Sun (Day mode) */}
        {!isDarkMode && (
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
        )}
        
        {/* Moon (Night mode) */}
        {isDarkMode && (
          <div className="relative w-3 h-3 bg-gray-200 rounded-full">
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-gray-300 rounded-full" />
            <div className="absolute top-1.5 left-2 w-0.5 h-0.5 bg-gray-300 rounded-full" />
            <div className="absolute top-2 left-1 w-0.5 h-0.5 bg-gray-300 rounded-full" />
          </div>
        )}
      </div>
      
      {/* Background stars (Night mode only) */}
      {isDarkMode && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-white rounded-full opacity-80" />
          <div className="absolute top-3 left-4 w-0.5 h-0.5 bg-white rounded-full opacity-60" />
          <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-white rounded-full opacity-70" />
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;