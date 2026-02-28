import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Brieflytics — The analytics tool that talks to you.',
  description: 'No dashboards. No logins. Brieflytics sends plain English reports + AI growth tips straight to your Telegram or email. EU-hosted, GDPR compliant, no cookies. $5 lifetime.',
  keywords: ['web analytics', 'privacy analytics', 'cookieless analytics', 'GDPR analytics', 'Google Analytics alternative', 'EU analytics', 'no dashboard analytics'],
  authors: [{ name: 'Brieflytics' }],
  creator: 'Brieflytics',
  metadataBase: new URL('https://brieflytics.com'),
  openGraph: {
    title: 'Brieflytics — The analytics tool that talks to you.',
    description: 'No dashboards. No logins. Plain English reports + AI growth tips sent to your Telegram or email. EU-hosted, GDPR compliant.',
    url: 'https://brieflytics.com',
    siteName: 'Brieflytics',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brieflytics — The analytics tool that talks to you.',
    description: 'No dashboards. No logins. Plain English reports + AI growth tips sent to your phone.',
    site: '@brieflytics',
    creator: '@brieflytics',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://brieflytics.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://brieflytics.com/tracker.js"
          data-token="c4669b624ed687fc0cecc2d57a87472d"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
