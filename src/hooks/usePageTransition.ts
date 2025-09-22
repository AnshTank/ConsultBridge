"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsTransitioning(true);
    setIsReady(false);

    // Simulate content loading time based on page type
    const getLoadingTime = () => {
      if (pathname === '/') return 800;
      if (pathname.startsWith('/dashboard')) return 1200;
      if (pathname.startsWith('/consultancy')) return 1000;
      if (pathname.startsWith('/category')) return 900;
      return 600;
    };

    const timer = setTimeout(() => {
      setIsReady(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }, getLoadingTime());

    return () => clearTimeout(timer);
  }, [pathname]);

  return { isTransitioning, isReady };
};

export const useStaggeredAnimation = (itemCount: number, delay: number = 100) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    setVisibleItems([]);
    
    const timers: NodeJS.Timeout[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => [...prev, i]);
      }, i * delay);
      
      timers.push(timer);
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [itemCount, delay]);

  return visibleItems;
};

export const useLoadingProgress = (duration: number = 2000) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setProgress(0);
    setIsComplete(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 15;
        const newProgress = Math.min(prev + increment, 95);
        
        if (newProgress >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setProgress(100);
            setTimeout(() => setIsComplete(true), 300);
          }, 200);
        }
        
        return newProgress;
      });
    }, duration / 20);

    return () => clearInterval(interval);
  }, [duration]);

  return { progress, isComplete };
};