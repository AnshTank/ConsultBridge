'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function AuthErrorBoundary({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event) => {
      if (event.error?.message?.includes('Token refresh failed')) {
        setHasError(true);
        // Clear any cached auth state
        localStorage.removeItem('clerk-db-jwt');
        sessionStorage.clear();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-6">Please refresh the page to continue.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
}