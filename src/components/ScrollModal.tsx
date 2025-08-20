import React, { useEffect } from 'react';

interface ScrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

const ScrollModal: React.FC<ScrollModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  maxWidth = "max-w-4xl" 
}) => {
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const overlay = document.createElement('div');
      overlay.className = 'scroll-modal-overlay';
      overlay.style.top = `${scrollY}px`;
      overlay.onclick = onClose;
      
      const container = document.createElement('div');
      container.className = `scroll-modal-container ${maxWidth} w-full`;
      container.style.top = `${scrollY + window.innerHeight / 2}px`;
      
      document.body.appendChild(overlay);
      document.body.appendChild(container);
      
      return () => {
        document.body.removeChild(overlay);
        document.body.removeChild(container);
      };
    }
  }, [isOpen, onClose, maxWidth]);

  if (!isOpen) return null;

  return null; // Rendered via DOM manipulation above
};

export default ScrollModal;