import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LoadingOverlay } from "@/components/LoadingOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "HealthCare Plus - Compare & Buy Health Insurance Online",
  description: "Compare health insurance plans from top insurers in India. Get instant quotes, CKYC verification, and buy health insurance online in minutes.",
  keywords: "health insurance, mediclaim, health policy, buy health insurance online, compare health insurance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <LoadingOverlay />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
