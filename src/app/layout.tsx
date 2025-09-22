import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "../styles/globals.css";
import Chatbot from "@/components/Chatbot";
import FloatingParticles from "../components/FloatingParticles";
import FloatingDhaba from "../components/FloatingDhaba";
import { SpeedInsights } from "@vercel/speed-insights/next";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ConsultBridge - Connect with Expert Consultants",
  description:
    "Find and book consultations with verified experts across various industries. Get professional advice tailored to your needs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <body suppressHydrationWarning={true}>
          {children}
          <FloatingDhaba />
          <FloatingParticles />
          <Chatbot />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
