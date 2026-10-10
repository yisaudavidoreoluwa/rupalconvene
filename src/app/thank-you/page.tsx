import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import ThankYouClient from '@/components/ThankYouClient';

export const metadata: Metadata = {
  title: 'Thank You | Rupal Convene',
  description:
    'Your Rupal Convene conference has been provisioned and confirmed. Add to your calendar, copy the room invite link, or enter the conference lobby.',
  alternates: {
    canonical: 'https://rupalconvene.vercel.app/thank-you',
  },
  openGraph: {
    title: 'Thank You | Rupal Convene',
    description:
      'Your Rupal Convene conference has been provisioned and confirmed. Add to your calendar, copy the room invite link, or enter the conference lobby.',
    url: 'https://rupalconvene.vercel.app/thank-you',
    siteName: 'Rupal Convene',
  },
};

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-[#0f172a] animate-spin" />
        </div>
      }
    >
      <ThankYouClient />
    </Suspense>
  );
}
