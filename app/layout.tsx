import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Conversable – Master Your Communication Skills with AI",
  description:
    "Conversable is your personal AI-powered communication coach. Practice conversations, build charisma, and unlock your social potential with intelligent voice coaching.",
  keywords: [
    "Conversable",
    "communication skills",
    "AI coach",
    "charisma training",
    "voice coaching",
    "social skills",
    "conversation practice",
  ],
  openGraph: {
    title: "Conversable – Master Your Communication Skills",
    description:
      "Your personal AI-powered communication coach. Build charisma and unlock your social potential.",
    type: "website",
    siteName: "Conversable",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conversable – Master Your Communication Skills",
    description:
      "Your personal AI-powered communication coach. Build charisma and unlock your social potential.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
