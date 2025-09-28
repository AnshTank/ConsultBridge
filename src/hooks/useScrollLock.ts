"use client";
import { useEffect } from "react";

export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    const originalScrollY = window.scrollY;
    const originalBodyStyle = document.body.style.cssText;

    const preventBackgroundScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const chatContainer = target.closest("[data-chat-container]");

      if (chatContainer) return;

      e.preventDefault();
      e.stopPropagation();
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${originalScrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    document.addEventListener("wheel", preventBackgroundScroll, {
      passive: false,
    });
    document.addEventListener("touchmove", preventBackgroundScroll, {
      passive: false,
    });

    return () => {
      document.body.style.cssText = originalBodyStyle;
      window.scrollTo(0, originalScrollY);
      document.removeEventListener("wheel", preventBackgroundScroll);
      document.removeEventListener("touchmove", preventBackgroundScroll);
    };
  }, [isLocked]);
};
