"use client";
import { useEffect } from 'react';

interface PerformanceMonitorProps {
  pageName: string;
  startTime: number;
  endTime?: number;
}

export default function PerformanceMonitor({ pageName, startTime, endTime }: PerformanceMonitorProps) {
  useEffect(() => {
    if (endTime) {
      const loadTime = endTime - startTime;
      console.log(`[Performance] ${pageName} loaded in ${loadTime}ms`);
      
      // Only log if it's development mode
      if (process.env.NODE_ENV === 'development') {
        const performanceEntry = {
          page: pageName,
          loadTime,
          timestamp: new Date().toISOString()
        };
        
        // Store in sessionStorage for debugging
        const existingData = sessionStorage.getItem('performance_logs');
        const logs = existingData ? JSON.parse(existingData) : [];
        logs.push(performanceEntry);
        
        // Keep only last 10 entries
        if (logs.length > 10) {
          logs.shift();
        }
        
        sessionStorage.setItem('performance_logs', JSON.stringify(logs));
      }
    }
  }, [pageName, startTime, endTime]);

  return null; // This component doesn't render anything
}