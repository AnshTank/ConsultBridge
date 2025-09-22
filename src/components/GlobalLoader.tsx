"use client";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import LoadingScreen from "./LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);
  const [showContent, setShowContent] = useState(false);

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

  const getLoadingDelay = () => {
    if (pathname === "/") return 1200;
    if (pathname === "/contact") return 1800;
    if (pathname === "/dashboard") return 1400;
    if (pathname === "/consultancy-dashboard") return 1600;
    if (pathname.startsWith("/consultancy/")) return 1200;
    if (pathname.startsWith("/category/")) return 1000;
    if (pathname === "/consultancies") return 1100;
    if (pathname === "/categories") return 900;
    if (pathname === "/about") return 800;
    if (pathname.includes("sign")) return 1000;
    return 800;
  };

  useEffect(() => {
    // Detect page change
    if (previousPathname.current !== pathname) {
      setIsPageChange(true);
      previousPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    if (isLoaded) {
      const delay = getLoadingDelay();
      setIsReady(false);
      setShowContent(false);

      // Complete loading after delay
      const loadingTimer = setTimeout(() => {
        setIsReady(true);

        // Staggered content reveal
        setTimeout(() => {
          setShowContent(true);
          setIsPageChange(false);
        }, 500);
      }, delay);

      return () => {
        clearTimeout(loadingTimer);
      };
    }
  }, [isLoaded, pathname]);

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
          scale: showContent ? 1 : 0.96,
        }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
