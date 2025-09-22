"use client";
import { ReactNode } from 'react';
import UnifiedLoader from './UnifiedLoader';

interface PageWrapperProps {
  children: ReactNode;
  loadingMessage?: string;
}

export default function PageWrapper({ 
  children, 
  loadingMessage = "Loading..."
}: PageWrapperProps) {
  return (
    <UnifiedLoader message={loadingMessage}>
      {children}
    </UnifiedLoader>
  );
}