"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  SignInButton,
  UserButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  

  if (!isClient || !isLoaded) {
    return (
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ConsultBridge</h1>
          <div className="flex items-center gap-8">
            <a href="/" className="hover:text-indigo-200 transition-all font-medium">
              Home
            </a>
            <a href="/about" className="hover:text-indigo-200 transition-all font-medium">
              About
            </a>
            <a href="/contact" className="hover:text-indigo-200 transition-all font-medium">
              Contact
            </a>
          </div>
        </nav>
      </header>
    );
  }
  
  return (
    <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ConsultBridge</h1>
        <div className="flex items-center gap-8">
          <a href="/" className="hover:text-indigo-200 transition-all font-medium">
            Home
          </a>
          {(!user || user.publicMetadata?.role !== "consultancy") && (
            <a href="/categories" className="hover:text-indigo-200 transition-all font-medium">
              Categories
            </a>
          )}
          <a href="/about" className="hover:text-indigo-200 transition-all font-medium">
            About
          </a>
          <a href="/contact" className="hover:text-indigo-200 transition-all font-medium">
            Contact
          </a>


          <SignedOut>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <SignInButton mode="modal">
                <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-all shadow-sm">
                  Sign In
                </button>
              </SignInButton>
            </motion.div>
          </SignedOut>
          
          <SignedIn>
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <a
                href={user?.publicMetadata?.role === "consultancy" ? "/consultancy-dashboard" : "/dashboard"}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-all shadow-sm"
              >
                Dashboard
              </a>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </motion.div>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
