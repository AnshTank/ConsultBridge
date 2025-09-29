"use client";
import React from 'react';

interface ButtonSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

const ButtonSkeleton: React.FC<ButtonSkeletonProps> = ({ 
  width = "w-20", 
  height = "h-10", 
  className = "" 
}) => {
  return (
    <div 
      className={`
        ${width} ${height} 
        bg-white/20 dark:bg-gray-700/50 
        rounded-lg 
        animate-pulse 
        relative 
        overflow-hidden
        ${className}
      `}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-gray-400/30 to-transparent" />
    </div>
  );
};

export default ButtonSkeleton;