import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface OptimizedLoaderProps {
  isLoading: boolean;
  error?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
}

const OptimizedLoader: React.FC<OptimizedLoaderProps> = memo(({
  isLoading,
  error,
  children,
  fallback,
  minHeight = "200px"
}) => {
  const loadingContent = useMemo(() => {
    if (error) {
      return (
        <div className="flex items-center justify-center py-8" style={{ minHeight }}>
          <div className="text-center">
            <div className="text-red-500 dark:text-red-400 mb-2">⚠️</div>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return fallback || (
        <div className="flex items-center justify-center py-8" style={{ minHeight }}>
          <motion.div
            className="flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </div>
      );
    }

    return null;
  }, [isLoading, error, fallback, minHeight]);

  if (isLoading || error) {
    return <>{loadingContent}</>;
  }

  return <>{children}</>;
});

OptimizedLoader.displayName = 'OptimizedLoader';

export default OptimizedLoader;