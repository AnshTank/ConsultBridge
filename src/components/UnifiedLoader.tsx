"use client";
import { useState, useEffect, ReactNode } from 'react';
import LoadingScreen from './LoadingScreen';
import LoadingStateController from './LoadingStateController';

interface UnifiedLoaderProps {
  children: ReactNode;
  message?: string;
  isHomePage?: boolean;
}

export default function UnifiedLoader({ 
  children, 
  message = "Loading ConsultBridge...",
  isHomePage = false
}: UnifiedLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Home page: 2x time (4000ms), Other pages: x time (2000ms)
    const loadingDuration = isHomePage ? 4000 : 2000;
    
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 800); // 800ms fade out
    }, loadingDuration);

    return () => clearTimeout(timer);
  }, [isHomePage]);

  return (
    <>
      <LoadingStateController isLoading={!isClient || isLoading} />
      {(!isClient || isLoading) ? (
        <LoadingScreen message={message} isHomePage={isHomePage} isFadingOut={isFadingOut} />
      ) : (
        children
      )}
    </>
  );
}