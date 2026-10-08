import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rupal Convene | Video Conferencing & Real-Time Collaboration",
  description: "Enterprise video conferencing and collaboration platform by Rupal Tech Solutions. Designed for technical engineering teams and strategic business partners.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                window.location.replace('https://rupalconvene.vercel.app' + window.location.pathname + window.location.search + window.location.hash);
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} font-sans bg-white text-slate-900 antialiased selection:bg-blue-500 selection:text-white min-h-screen overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
