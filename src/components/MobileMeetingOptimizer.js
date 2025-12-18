'use client';
import { useEffect, useState } from 'react';

export default function MobileMeetingOptimizer({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    // Prevent zoom on mobile
    if (typeof window !== 'undefined') {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  if (isMobile && !isLandscape) {
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Rotate Your Device</h2>
            <p className="text-gray-300 text-sm">
              For the best meeting experience, please rotate your device to landscape mode.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? 'mobile-meeting-container' : ''}>
      {children}
      <style jsx global>{`
        .mobile-meeting-container {
          -webkit-overflow-scrolling: touch;
          overflow: hidden;
        }
        
        @media (max-width: 768px) {
          body {
            overflow: hidden;
            position: fixed;
            width: 100%;
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
}