"use client";
import { useEffect, ReactNode } from 'react';

interface OverlayManagerProps {
  isActive: boolean;
  onClose?: () => void;
  children: ReactNode;
}

const OverlayManager = ({ isActive, onClose, children }: OverlayManagerProps) => {
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Background Blur Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          {children}
        </div>
      </div>
    </>
  );
};

export default OverlayManager;