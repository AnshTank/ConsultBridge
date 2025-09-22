"use client";
import { useEffect } from "react";

interface LoadingStateControllerProps {
  isLoading: boolean;
}

const LoadingStateController = ({ isLoading }: LoadingStateControllerProps) => {
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("loading");
      document.body.classList.remove("loaded");
      // Prevent scrolling during loading
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("loading");
      document.body.classList.add("loaded");
      // Restore scrolling after loading
      document.body.style.overflow = "auto";
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("loading", "loaded");
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  return null; // This component doesn't render anything
};

export default LoadingStateController;