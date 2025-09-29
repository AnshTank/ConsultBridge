"use client";
import React, { useEffect, useState } from "react";
import {
  SignInButton,
  UserButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ButtonSkeleton from "./ButtonSkeleton";

const Navbar: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [buttonOpacity, setButtonOpacity] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Check if buttons were already loaded in this session
    const buttonsLoaded = sessionStorage.getItem('navbarButtonsLoaded');
    
    if (buttonsLoaded === 'true') {
      // Show buttons immediately if already loaded
      setShowButtons(true);
      setButtonOpacity(1);
    } else {
      // First time - delay button appearance
      const timer = setTimeout(() => {
        setShowButtons(true);
        sessionStorage.setItem('navbarButtonsLoaded', 'true');
        // Gradual opacity increase
        setTimeout(() => setButtonOpacity(0.3), 100);
        setTimeout(() => setButtonOpacity(0.6), 300);
        setTimeout(() => setButtonOpacity(1), 600);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:bg-dark-nav text-white h-16 md:h-20 w-full relative transition-all duration-300 shadow-lg dark:shadow-neon-sm dark:border-b dark:border-dark-border" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
      {/* Floating particles - hidden on mobile */}
      <div className="absolute inset-0 overflow-hidden hidden md:block">
        <div className="absolute top-2 left-10 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
        <div className="absolute top-8 right-20 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-4 left-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <nav className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between relative z-10">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="/" className="text-lg md:text-2xl font-bold cursor-pointer group relative overflow-hidden">
            <span className="relative z-10 inline-block group-hover:animate-pulse">
              <span className="md:hidden">CB</span>
              <span className="hidden md:inline">
                {"ConsultBridge".split("").map((letter, index) => (
                  <span 
                    key={index}
                    className="inline-block transition-all duration-700 group-hover:text-yellow-300 hover:scale-125 hover:-rotate-12"
                    style={{
                      transitionDelay: `${index * 50}ms`,
                      filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </span>
            {/* Liquid wave effect */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left"></div>
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <a href="/" className="px-4 py-2 font-medium whitespace-nowrap relative group overflow-hidden rounded-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1">
            <span className="relative z-10 transition-colors duration-500 group-hover:text-purple-900 dark:group-hover:text-neon-blue">Home</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-yellow-100 to-white dark:from-neon-blue/20 dark:via-neon-purple/20 dark:to-neon-pink/20 transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-center rounded-full"></div>
          </a>
          {(!user || user.publicMetadata?.role !== "consultancy") && (
            <a href="/categories" className="px-4 py-2 font-medium whitespace-nowrap relative group overflow-hidden rounded-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1">
              <span className="relative z-10 transition-colors duration-500 group-hover:text-purple-900 dark:group-hover:text-neon-purple">Categories</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white via-yellow-100 to-white dark:from-neon-purple/20 dark:via-neon-pink/20 dark:to-neon-cyan/20 transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-center rounded-full"></div>

            </a>
          )}
          <a href="/about" className="px-4 py-2 font-medium whitespace-nowrap relative group overflow-hidden rounded-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1">
            <span className="relative z-10 transition-colors duration-500 group-hover:text-purple-900 dark:group-hover:text-neon-green">About</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-yellow-100 to-white dark:from-neon-green/20 dark:via-neon-yellow/20 dark:to-neon-orange/20 transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-center rounded-full"></div>

          </a>
          <a href="/contact" className="px-4 py-2 font-medium whitespace-nowrap relative group overflow-hidden rounded-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1">
            <span className="relative z-10 transition-colors duration-500 group-hover:text-purple-900 dark:group-hover:text-neon-pink">Contact</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-yellow-100 to-white dark:from-neon-pink/20 dark:via-neon-red/20 dark:to-neon-orange/20 transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-center rounded-full"></div>

          </a>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center justify-end">
            {!isClient || !isLoaded || !showButtons ? (
              <ButtonSkeleton width="w-20" height="h-10" />
            ) : (
              <div style={{ opacity: buttonOpacity, transition: 'opacity 0.8s ease-out' }}>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-white dark:bg-neon-blue text-indigo-600 dark:text-dark-bg px-4 py-2 h-10 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-neon-cyan transition-all shadow-sm dark:shadow-neon-sm whitespace-nowrap">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                
                <SignedIn>
                  <a
                    href={user?.publicMetadata?.role === "consultancy" ? "/consultancy-dashboard" : "/dashboard"}
                    className="bg-white dark:bg-neon-purple text-indigo-600 dark:text-dark-bg px-4 py-2 h-10 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-neon-pink transition-all shadow-sm dark:shadow-neon-purple whitespace-nowrap flex items-center"
                  >
                    Dashboard
                  </a>
                </SignedIn>
              </div>
            )}
          </div>
          
          <div className="w-8 h-8 flex items-center justify-center">
            {!isClient || !isLoaded || !showButtons ? (
              <ButtonSkeleton width="w-8" height="h-8" className="rounded-full" />
            ) : (
              <SignedIn>
                <div style={{ opacity: buttonOpacity, transition: 'opacity 0.8s ease-out' }}>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                    signInUrl="/sign-in"
                  />
                </div>
              </SignedIn>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <SignedIn>
            <div className="w-8 h-8 flex items-center justify-center">
              {!isClient || !isLoaded || !showButtons ? (
                <ButtonSkeleton width="w-8" height="h-8" className="rounded-full" />
              ) : (
                <div style={{ opacity: buttonOpacity, transition: 'opacity 0.8s ease-out' }}>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                    signInUrl="/sign-in"
                  />
                </div>
              )}
            </div>
          </SignedIn>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <div className={`transition-all duration-300 ${mobileMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:bg-dark-card border-t border-white/20 dark:border-dark-border z-50 transition-all duration-300 shadow-lg dark:shadow-neon-sm">
          <div className="px-4 py-4 space-y-2">
            <a href="/" className="block px-4 py-3 rounded-lg bg-white/10 dark:bg-neon-blue/20 hover:bg-white/20 dark:hover:bg-neon-blue/30 transition-colors font-medium">
              Home
            </a>
            {(!user || user.publicMetadata?.role !== "consultancy") && (
              <a href="/categories" className="block px-4 py-3 rounded-lg bg-white/10 dark:bg-neon-purple/20 hover:bg-white/20 dark:hover:bg-neon-purple/30 transition-colors font-medium">
                Categories
              </a>
            )}
            <a href="/about" className="block px-4 py-3 rounded-lg bg-white/10 dark:bg-neon-green/20 hover:bg-white/20 dark:hover:bg-neon-green/30 transition-colors font-medium">
              About
            </a>
            <a href="/contact" className="block px-4 py-3 rounded-lg bg-white/10 dark:bg-neon-pink/20 hover:bg-white/20 dark:hover:bg-neon-pink/30 transition-colors font-medium">
              Contact
            </a>
            
            <div className="pt-2 border-t border-white/20">
              {!isClient || !isLoaded || !showButtons ? (
                <ButtonSkeleton width="w-full" height="h-10" />
              ) : (
                <div style={{ opacity: buttonOpacity, transition: 'opacity 0.8s ease-out' }}>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="w-full bg-white dark:bg-neon-cyan text-indigo-600 dark:text-dark-bg px-4 py-3 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-neon-blue transition-all shadow-sm dark:shadow-neon-sm">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                  
                  <SignedIn>
                    <a
                      href={user?.publicMetadata?.role === "consultancy" ? "/consultancy-dashboard" : "/dashboard"}
                      className="block w-full bg-white dark:bg-neon-orange text-indigo-600 dark:text-dark-bg px-4 py-3 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-neon-yellow transition-all shadow-sm dark:shadow-neon-sm text-center"
                    >
                      Dashboard
                    </a>
                  </SignedIn>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;