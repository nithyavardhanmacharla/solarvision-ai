import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SmoothScrollProvider } from '@/lib/smooth-scroll';
import { GSAPScrollInitializer } from '@/components/GSAPScrollTrigger';
import { ScrollProgressBar } from '@/components/ScrollProgressBar';

export const metadata: Metadata = {
  title: 'SolarVision AI | Photovoltaic Intelligence Platform',
  description: 'AI-Powered Solar Infrastructure Design, ROI Forecasting, and Interactive Studio',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0A0A0B',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0A0B" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body suppressHydrationWarning className="overflow-x-hidden w-full max-w-full">
        <SmoothScrollProvider>
          <ScrollProgressBar />
          <GSAPScrollInitializer />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

