"use client";
import { useState, useEffect, ReactNode } from 'react';
import LoadingScreen from './LoadingScreen';
import LoadingStateController from './LoadingStateController';

interface UnifiedLoaderProps {
  children: ReactNode;
  message?: string;
  isHomePage?: boolean;
  contentReady?: boolean;
}

export default function UnifiedLoader({ 
  children, 
  message = "Loading ConsultBridge...",
  isHomePage = false,
  contentReady = true
}: UnifiedLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [spiralCount, setSpiralCount] = useState(0);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Minimum loading time based on spiral rotations
    const spiralDuration = 2000; // 2 seconds per spiral
    const requiredSpirals = isHomePage ? 2 : 1;
    const minLoadingTime = spiralDuration * requiredSpirals;
    
    // Set minimum loading complete after exact time
    const minTimer = setTimeout(() => {
      setMinLoadingComplete(true);
      setSpiralCount(requiredSpirals);
    }, minLoadingTime);
    
    return () => {
      clearTimeout(minTimer);
    };
  }, [isHomePage]);
  
  // Check if we can finish loading
  useEffect(() => {
    if (minLoadingComplete && contentReady) {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [minLoadingComplete, contentReady]);

  return (
    <>
      <LoadingStateController isLoading={!isClient || isLoading} />
      {(!isClient || isLoading) ? (
        <LoadingScreen 
          message={message} 
          isHomePage={isHomePage} 
          isFadingOut={isFadingOut}
          spiralCount={spiralCount}
        />
      ) : (
        <div 
          className="animate-in fade-in duration-500 ease-out min-h-screen"
          style={{ minHeight: "100vh" }}
        >
          {children}
        </div>
      )}
    </>
  );
}