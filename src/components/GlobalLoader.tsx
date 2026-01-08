"use client";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import LoadingScreen from "./LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";

interface DataLoadingState {
  isDataLoaded: boolean;
  dataType?: string;
}

export default function GlobalLoader({
  children,
  dataLoadingState,
}: {
  children: React.ReactNode;
  dataLoadingState?: DataLoadingState;
}) {
  const [isReady, setIsReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(false);

  const { isLoaded } = useUser();
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [isPageChange, setIsPageChange] = useState(false);

  const getLoadingMessage = () => {
    if (pathname === "/") return "🏠 Initializing ConsultBridge...";
    if (pathname.startsWith("/category/"))
      return "🎯 Discovering consultants...";
    if (pathname.startsWith("/consultancy/"))
      return "👔 Loading consultant profile...";
    if (pathname === "/consultancies")
      return "🔍 Gathering all consultancies...";
    if (pathname === "/categories") return "📂 Organizing categories...";
    if (pathname === "/dashboard") return "📊 Preparing your dashboard...";
    if (pathname === "/consultancy-dashboard")
      return "💼 Setting up consultancy hub...";
    if (pathname === "/about") return "ℹ️ Loading about us...";
    if (pathname === "/contact") return "📞 Connecting contact info...";
    if (pathname.includes("sign")) return "🔐 Securing authentication...";
    return "✨ Loading amazing content...";
  };

  const getMinLoadingTime = () => {
    // Minimum loading time for UX (prevents flash)
    if (pathname === "/") return 800;
    if (pathname === "/contact") return 600;
    if (pathname === "/dashboard") return 700;
    if (pathname === "/consultancy-dashboard") return 700;
    if (pathname.startsWith("/consultancy/")) return 600;
    if (pathname.startsWith("/category/")) return 500;
    if (pathname === "/consultancies") return 600;
    if (pathname === "/categories") return 400;
    if (pathname === "/about") return 300;
    if (pathname.includes("sign")) return 500;
    return 400;
  };

  useEffect(() => {
    // Detect page change
    if (previousPathname.current !== pathname) {
      setIsPageChange(true);
      setIsReady(false);
      setShowContent(false);
      setMinLoadingTime(false);
      previousPathname.current = pathname;
    }
  }, [pathname]);

  // Minimum loading time timer
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinLoadingTime(true);
    }, getMinLoadingTime());

    return () => clearTimeout(minTimer);
  }, [pathname]);

  useEffect(() => {
    // Check if all conditions are met to show content
    const canShowContent = isLoaded && minLoadingTime && 
      (!dataLoadingState || dataLoadingState.isDataLoaded);

    if (canShowContent && !isReady) {
      setIsReady(true);
      
      // Staggered content reveal
      setTimeout(() => {
        setShowContent(true);
        setIsPageChange(false);
      }, 300);
    }
  }, [isLoaded, minLoadingTime, dataLoadingState, isReady]);

  if (!isReady) {
    return <LoadingScreen message={getLoadingMessage()} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{
          opacity: showContent ? 1 : 0,
          scale: showContent ? 1 : 0.98,
        }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
