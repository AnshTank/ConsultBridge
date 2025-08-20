import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "../index.css";
import Chatbot from "@/components/Chatbot";
import UniqueTransitions from "../components/UniqueTransitions";
import "../styles/page-transitions.css";
import "../styles/scroll-modal.css";
import "../styles/page-loading.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        <body
          className={`${inter.className} page-transition`}
          style={{ overflowX: "hidden" }}
          id="app-body"
        >
          <SpeedInsights />
          <UniqueTransitions>{children}</UniqueTransitions>
          <Chatbot />
        </body>
      </html>
    </ClerkProvider>
  );
}
