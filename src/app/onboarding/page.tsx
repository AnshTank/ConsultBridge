"use client";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { CheckCircle, Building, User } from "lucide-react";

function OnboardingContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const mode = searchParams?.get("mode") || localStorage.getItem('signup_mode') || "user";

  useEffect(() => {
    const assignRole = async () => {
      if (!user) return;

      try {
        // Check if role already exists
        if (user.publicMetadata?.role) {
          setIsLoading(false);
          if (user.publicMetadata.role === "consultancy") {
            router.replace("/consultancy-dashboard");
          } else {
            router.replace("/dashboard");
          }
          return;
        }

        // Update user metadata with role
        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            role: mode,
          },
        });

        await user.reload();
        localStorage.removeItem('signup_mode');
        
        setTimeout(() => {
          setIsLoading(false);
          const redirectType = localStorage.getItem('redirect_after_auth');
          localStorage.removeItem('redirect_after_auth');
          
          if (mode === "consultancy" || redirectType === 'consultancy-admin') {
            // Check if consultancy profile exists
            const hasProfile = localStorage.getItem(`consultancy_${user.id}`);
            if (hasProfile) {
              router.replace("/consultancy-admin");
            } else {
              router.replace("/consultancy-setup");
            }
          } else {
            router.replace("/dashboard");
          }
        }, 1000);
      } catch (error) {
        console.error("Error assigning role:", error);
        setIsLoading(false);
        router.replace("/");
      }
    };

    if (user) {
      assignRole();
    }
  }, [user, mode, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome aboard!</h1>
          <p className="text-gray-600 mb-6">
            Your account has been set up as a{" "}
            <span className="font-semibold text-indigo-600">
              {mode === "consultancy" ? "Consultancy Admin" : "User"}
            </span>
          </p>
          
          <div className="flex items-center justify-center mb-6">
            {mode === "consultancy" ? (
              <Building className="w-8 h-8 text-indigo-600" />
            ) : (
              <User className="w-8 h-8 text-indigo-600" />
            )}
          </div>
          
          <p className="text-sm text-gray-500">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}