import type {Metadata} from 'next';
import './globals.css';
import { SmoothScrollProvider } from '@/lib/smooth-scroll';
import { GSAPScrollInitializer } from '@/components/GSAPScrollTrigger';
import { ScrollProgressBar } from '@/components/ScrollProgressBar';

export const metadata: Metadata = {
  title: 'SolarVision AI | Photovoltaic Intelligence Platform',
  description: 'AI-Powered Solar Infrastructure Design, ROI Forecasting, and Interactive Studio',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body suppressHydrationWarning>
        <SmoothScrollProvider>
          <ScrollProgressBar />
          <GSAPScrollInitializer />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
