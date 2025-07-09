"use client";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const mode = searchParams?.get("mode") || localStorage.getItem('signup_mode') || "user";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {mode === "consultancy" ? "Join as Consultancy" : "Join as User"}
          </h1>
          <p className="text-gray-600">
            {mode === "consultancy" 
              ? "Start offering your consultancy services" 
              : "Find the perfect consultancy services"}
          </p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border-0",
            }
          }}
          afterSignUpUrl={`/onboarding?mode=${mode}`}
          redirectUrl={`/onboarding?mode=${mode}`}
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}