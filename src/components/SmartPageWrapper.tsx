"use client";
import { ReactNode } from 'react';
import UnifiedLoader from './UnifiedLoader';

interface SmartPageWrapperProps {
  children: ReactNode;
  loadingMessage?: string;
  isHomePage?: boolean;
}

export default function SmartPageWrapper({ 
  children, 
  loadingMessage = "Loading...",
  isHomePage = false
}: SmartPageWrapperProps) {
  return (
    <UnifiedLoader message={loadingMessage} isHomePage={isHomePage}>
      {children}
    </UnifiedLoader>
  );
}