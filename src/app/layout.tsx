import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rupal Convene | Video Conferencing & Real-Time Collaboration",
  description: "Enterprise video conferencing and collaboration platform by Rupal Tech Solutions. Designed for technical engineering teams and strategic business partners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-slate-900 antialiased selection:bg-blue-500 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
