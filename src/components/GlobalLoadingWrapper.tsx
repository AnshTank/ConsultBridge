"use client";
import { ReactNode } from 'react';
import UnifiedLoader from './UnifiedLoader';

interface GlobalLoadingWrapperProps {
  children: ReactNode;
}

export default function GlobalLoadingWrapper({ children }: GlobalLoadingWrapperProps) {
  return (
    <UnifiedLoader message="Loading ConsultBridge..." isGlobal={true}>
      {children}
    </UnifiedLoader>
  );
}