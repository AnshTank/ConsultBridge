// Performance monitoring utility for loading optimizations
export class LoadingPerformanceMonitor {
  private static instance: LoadingPerformanceMonitor;
  private metrics: Map<string, { startTime: number; endTime?: number; duration?: number }> = new Map();

  static getInstance(): LoadingPerformanceMonitor {
    if (!LoadingPerformanceMonitor.instance) {
      LoadingPerformanceMonitor.instance = new LoadingPerformanceMonitor();
    }
    return LoadingPerformanceMonitor.instance;
  }

  startTiming(key: string): void {
    if (typeof window !== 'undefined' && typeof performance !== 'undefined') {
      this.metrics.set(key, { startTime: performance.now() });
    }
  }

  endTiming(key: string): number | null {
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return null;
    }
    
    const metric = this.metrics.get(key);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    this.metrics.set(key, {
      ...metric,
      endTime,
      duration
    });

    // Log performance in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ Loading Performance: ${key} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  getMetric(key: string): { startTime: number; endTime?: number; duration?: number } | null {
    return this.metrics.get(key) || null;
  }

  getAllMetrics(): Record<string, { startTime: number; endTime?: number; duration?: number }> {
    return Object.fromEntries(this.metrics);
  }

  clear(): void {
    this.metrics.clear();
  }
}

// Hook for performance monitoring
export const usePerformanceMonitor = (key: string) => {
  const monitor = LoadingPerformanceMonitor.getInstance();

  const startTiming = () => monitor.startTiming(key);
  const endTiming = () => monitor.endTiming(key);
  const getMetric = () => monitor.getMetric(key);

  return { startTiming, endTiming, getMetric };
};