"use client";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const mode = searchParams?.get("mode") || localStorage.getItem('signup_mode') || "user";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {mode === "consultancy" ? "Consultancy Sign In" : "User Sign In"}
          </h1>
          <p className="text-gray-600">
            {mode === "consultancy" 
              ? "Access your consultancy dashboard" 
              : "Access your user dashboard"}
          </p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border-0",
            }
          }}
          afterSignInUrl={mode === "consultancy" ? "/consultancy-dashboard" : "/dashboard"}
          redirectUrl={mode === "consultancy" ? "/consultancy-dashboard" : "/dashboard"}
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}