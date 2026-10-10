import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'Rupal Convene | Ultra-Fast Video Conferences for Builders & Leaders',
  description:
    'Host ultra-low latency conferences with real-time collaborative code editing, architecture whiteboards, synchronized pitch decks, and automated Gemini AI meeting notes.',
  alternates: {
    canonical: 'https://rupalconvene.vercel.app',
  },
  openGraph: {
    title: 'Rupal Convene | Ultra-Fast Video Conferences for Builders & Leaders',
    description:
      'Host ultra-low latency conferences with real-time collaborative code editing, architecture whiteboards, synchronized pitch decks, and automated Gemini AI meeting notes.',
    url: 'https://rupalconvene.vercel.app',
    siteName: 'Rupal Convene',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rupal Convene | Ultra-Fast Video Conferences for Builders & Leaders',
    description:
      'Host ultra-low latency conferences with real-time collaborative code editing, architecture whiteboards, synchronized pitch decks, and automated Gemini AI meeting notes.',
    creator: '@rupaltech',
  },
};

export default function Page() {
  return <HomeClient />;
}
