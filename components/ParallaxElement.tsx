'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxElementProps {
  children?: ReactNode;
  className?: string;
  speed?: number; // Speed factor: e.g. 0.1 for 10% parallax, positive moves up faster, negative moves down
  maxTravelPx?: number; // Max travel distance cap (e.g. 60px)
}

export function ParallaxElement({
  children,
  className = '',
  speed = 0.12,
  maxTravelPx = 50,
}: ParallaxElementProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!containerRef.current) return;

    const el = containerRef.current;
    const travel = Math.min(Math.abs(speed * 300), maxTravelPx) * (speed >= 0 ? -1 : 1);

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: travel,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [speed, maxTravelPx]);

  return (
    <div ref={containerRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
