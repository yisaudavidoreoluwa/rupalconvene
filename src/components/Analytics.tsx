'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
}

// Client-side helper function for components to report events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  try {
    const consentRaw = localStorage.getItem('rupal_cookie_consent');
    if (consentRaw) {
      const consent = JSON.parse(consentRaw);
      if (consent.analytics === false) {
        return; // User explicitly opted out
      }
    }

    // 1. Google Analytics if configured
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }

    // 2. First-party privacy telemetry
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        properties,
        path: window.location.pathname,
        referrer: document.referrer || '',
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  } catch {}
}

export const Analytics: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-RUPALCONV26';

  // Automatically track route changes
  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackEvent('page_view', { page_path: url, title: document.title });
  }, [pathname, searchParams]);

  return (
    <>
      {gaId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
};
