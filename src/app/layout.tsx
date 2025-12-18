import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "../styles/globals.css";
import "../styles/dark-mode.css";
import "../styles/instant-theme.css";
import Chatbot from "@/components/Chatbot";
import FloatingParticles from "../components/FloatingParticles";
import FloatingDhaba from "../components/FloatingDhaba";
import { PopupProvider } from "../contexts/PopupContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AuthErrorBoundary from "../components/AuthErrorBoundary";

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
        <body suppressHydrationWarning={true} className="preload bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 antialiased">
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Remove preload class after page loads to enable smooth transitions
                window.addEventListener('load', () => {
                  setTimeout(() => {
                    document.body.classList.remove('preload');
                  }, 100);
                });
              `,
            }}
          />
          <ThemeProvider>
            <PopupProvider>
              <AuthErrorBoundary>
                {children}
                <FloatingDhaba />
                <FloatingParticles />
                <Chatbot />
                <SpeedInsights />
              </AuthErrorBoundary>
            </PopupProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
