import type { Metadata } from 'next';
import DocsClient from '@/components/DocsClient';

export const metadata: Metadata = {
  title: 'Developer Documentation & WebRTC SDK | Rupal Convene',
  description:
    'Comprehensive documentation, signaling API reference, peer mesh architecture guides, and WebRTC integration tutorials for Rupal Convene.',
  alternates: {
    canonical: 'https://rupalconvene.vercel.app/docs',
  },
  openGraph: {
    title: 'Developer Documentation & WebRTC SDK | Rupal Convene',
    description:
      'Comprehensive documentation, signaling API reference, peer mesh architecture guides, and WebRTC integration tutorials for Rupal Convene.',
    url: 'https://rupalconvene.vercel.app/docs',
    siteName: 'Rupal Convene',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Documentation & WebRTC SDK | Rupal Convene',
    description:
      'Comprehensive documentation, signaling API reference, peer mesh architecture guides, and WebRTC integration tutorials for Rupal Convene.',
  },
};

export default function DocsPage() {
  return <DocsClient />;
}
