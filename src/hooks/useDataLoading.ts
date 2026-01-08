import { useState, useEffect, useCallback } from 'react';
import { LoadingPerformanceMonitor } from '../utils/performanceMonitor';

interface DataLoadingState {
  isDataLoaded: boolean;
  dataType?: string;
  error?: string;
}

interface UseDataLoadingOptions {
  minLoadingTime?: number;
  dataType?: string;
  enablePerformanceMonitoring?: boolean;
}

export const useDataLoading = (options: UseDataLoadingOptions = {}) => {
  const [state, setState] = useState<DataLoadingState>({
    isDataLoaded: false,
    dataType: options.dataType,
  });
  
  const [startTime] = useState(Date.now());
  const minLoadingTime = options.minLoadingTime || 500;
  const monitor = LoadingPerformanceMonitor.getInstance();

  useEffect(() => {
    if (options.enablePerformanceMonitoring && options.dataType && typeof window !== 'undefined') {
      monitor.startTiming(options.dataType);
    }
  }, []);

  const setDataLoaded = useCallback((loaded: boolean, error?: string) => {
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, minLoadingTime - elapsed);

    const updateState = () => {
      setState(prev => ({
        ...prev,
        isDataLoaded: loaded,
        error
      }));
      
      if (options.enablePerformanceMonitoring && options.dataType && loaded && typeof window !== 'undefined') {
        monitor.endTiming(options.dataType);
      }
    };

    if (remainingTime > 0) {
      setTimeout(updateState, remainingTime);
    } else {
      updateState();
    }
  }, [startTime, minLoadingTime, options.enablePerformanceMonitoring, options.dataType]);

  const setError = useCallback((error: string) => {
    setDataLoaded(false, error);
  }, [setDataLoaded]);

  const reset = useCallback(() => {
    setState({
      isDataLoaded: false,
      dataType: options.dataType,
    });
    
    if (options.enablePerformanceMonitoring && options.dataType && typeof window !== 'undefined') {
      monitor.startTiming(options.dataType);
    }
  }, [options.dataType, options.enablePerformanceMonitoring]);

  return {
    ...state,
    setDataLoaded,
    setError,
    reset
  };
};

// Hook for API calls with loading state and performance monitoring
export const useApiCall = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: UseDataLoadingOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const loadingState = useDataLoading({
    ...options,
    enablePerformanceMonitoring: true
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        loadingState.reset();
        const result = await apiCall();
        
        if (isMounted) {
          setData(result);
          loadingState.setDataLoaded(true);
        }
      } catch (error) {
        if (isMounted) {
          console.error('API call failed:', error);
          loadingState.setError(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return {
    data,
    ...loadingState,
    refetch: () => {
      loadingState.reset();
      // Trigger re-fetch by updating dependencies
    }
  };
};