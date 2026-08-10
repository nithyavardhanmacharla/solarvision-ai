'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Hero3DScene = dynamic(() => import('@/components/Hero3DScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[220px] sm:min-h-[300px] animate-pulse bg-zinc-900/20 rounded-2xl" />,
});

export function Hero3DWrapper() {
  return <Hero3DScene />;
}
