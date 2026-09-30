import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechConvene | Developer & Partner Conference SaaS",
  description: "Next-generation conference and collaborative workspace platform for engineering teams and business partners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-violet-500 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
