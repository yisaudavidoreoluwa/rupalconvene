import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import React, { Suspense } from "react";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { Analytics } from "@/components/Analytics";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rupalconvene.vercel.app"),
  title: {
    default: "Rupal Convene | Ultra-Fast Video Conferences for Builders & Leaders",
    template: "%s | Rupal Convene",
  },
  description:
    "Host ultra-low latency conferences with real-time collaborative code editing, architecture whiteboards, synchronized pitch decks, and automated Gemini AI meeting notes.",
  keywords: [
    "video conferencing",
    "WebRTC mesh",
    "code workspace IDE",
    "architecture whiteboard",
    "synchronized pitch decks",
    "Gemini AI meeting notes",
    "engineering conferences",
    "Rupal Convene",
  ],
  authors: [{ name: "Rupal Tech Solutions Ltd", url: "https://rupalconvene.vercel.app" }],
  creator: "Rupal Tech Solutions Ltd",
  publisher: "Rupal Tech Solutions Ltd",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rupalconvene.vercel.app",
    siteName: "Rupal Convene",
    title: "Rupal Convene | Ultra-Fast Video Conferences for Builders & Leaders",
    description:
      "Host ultra-low latency conferences with real-time collaborative code editing, architecture whiteboards, synchronized pitch decks, and automated Gemini AI meeting notes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rupal Convene | Ultra-Fast Video Conferences for Builders & Leaders",
    description:
      "Host ultra-low latency conferences with real-time collaborative code editing, architecture whiteboards, synchronized pitch decks, and automated Gemini AI meeting notes.",
    creator: "@rupaltech",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <CookieBanner />
      </body>
    </html>
  );
}
