"use client";
import React, { useEffect, useState } from "react";
import {
  SignInButton,
  UserButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/nextjs";

const Navbar: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [buttonOpacity, setButtonOpacity] = useState(0);
  
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
    <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white h-20 w-full relative" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-2 left-10 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
        <div className="absolute top-8 right-20 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-4 left-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <nav className="container mx-auto px-6 h-full flex items-center justify-between relative z-10">
        {/* Liquid Logo */}
        <div className="w-48">
          <h1 className="text-2xl font-bold cursor-pointer group relative overflow-hidden">
            <span className="relative z-10 inline-block group-hover:animate-pulse">
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
            {/* Liquid wave effect */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left"></div>
          </h1>
        </div>
        
        {/* Magnetic Navigation */}
        <div className="flex items-center gap-2">
          <a href="/" className="px-4 py-2 font-medium whitespace-nowrap relative group overflow-hidden rounded-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1">
            <span className="relative z-10 transition-colors duration-500 group-hover:text-purple-900">Home</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-yellow-100 to-white transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-center rounded-full"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
          </a>
          {(!user || user.publicMetadata?.role !== "consultancy") && (
            <a href="/categories" className="px-4 py-2 font-medium whitespace-nowrap relative group overflow-hidden rounded-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1">
              <span className="relative z-10 transition-colors duration-500 group-hover:text-purple-900">Categories</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white via-yellow-100 to-white transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-center rounded-full"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
            </a>
          )}
          <a href="/about" className="px-4 py-2 font-medium whitespace-nowrap relative group overflow-hidden rounded-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1">
            <span className="relative z-10 transition-colors duration-500 group-hover:text-purple-900">About</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-yellow-100 to-white transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-center rounded-full"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
          </a>
          <a href="/contact" className="px-4 py-2 font-medium whitespace-nowrap relative group overflow-hidden rounded-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1">
            <span className="relative z-10 transition-colors duration-500 group-hover:text-purple-900">Contact</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-yellow-100 to-white transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-center rounded-full"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
          </a>
        </div>

        {/* User Actions */}
        <div className="w-48 flex justify-end">
          <div className="flex items-center gap-4 w-[140px] justify-end">
            <div className="w-20 h-10 flex items-center justify-end">
              {!isClient || !isLoaded || !showButtons ? (
                <div className="h-10 bg-white/20 rounded-lg w-20 animate-pulse"></div>
              ) : (
                <>
                  <div style={{ opacity: buttonOpacity, transition: 'opacity 0.8s ease-out' }}>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="bg-white text-indigo-600 px-4 py-2 h-10 rounded-lg font-medium hover:bg-indigo-50 transition-all shadow-sm whitespace-nowrap">
                          Sign In
                        </button>
                      </SignInButton>
                    </SignedOut>
                    
                    <SignedIn>
                      <a
                        href={user?.publicMetadata?.role === "consultancy" ? "/consultancy-dashboard" : "/dashboard"}
                        className="bg-white text-indigo-600 px-4 py-2 h-10 rounded-lg font-medium hover:bg-indigo-50 transition-all shadow-sm whitespace-nowrap flex items-center"
                      >
                        Dashboard
                      </a>
                    </SignedIn>
                  </div>
                </>
              )}
            </div>
            
            <div className="w-8 h-8 flex items-center justify-center">
              {!isClient || !isLoaded || !showButtons ? (
                <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
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
        </div>
      </nav>
    </header>
  );
};

export default Navbar;