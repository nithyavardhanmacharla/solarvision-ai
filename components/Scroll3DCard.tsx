'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

interface Scroll3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotateX?: number; // deg when entering/exiting
  maxRotateY?: number; // deg lateral shift
  maxTranslateZ?: number; // px depth
  depthOffset?: number; // inner 3D depth pop
}

export function Scroll3DCard({
  children,
  className = '',
  maxRotateX = 14,
  maxRotateY = 4,
  maxTranslateZ = -40,
  depthOffset = 25
}: Scroll3DCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Smooth out progress values with spring physics
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 22,
    restDelta: 0.001
  });

  // Map scroll progress (0 = entering bottom, 0.5 = viewport center, 1 = exiting top)
  const rawRotateX = useTransform(springProgress, [0, 0.5, 1], [maxRotateX, 0, -maxRotateX]);
  const rawRotateY = useTransform(springProgress, [0, 0.5, 1], [-maxRotateY, 0, maxRotateY]);
  const rawTranslateZ = useTransform(springProgress, [0, 0.25, 0.5, 0.75, 1], [maxTranslateZ, -10, 0, -10, maxTranslateZ]);
  const rawScale = useTransform(springProgress, [0, 0.5, 1], [0.93, 1, 0.95]);
  const rawOpacity = useTransform(springProgress, [0, 0.25, 0.75, 1], [0.2, 1, 1, 0.3]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className="perspective-1200 w-full">
      <motion.div
        style={{
          rotateX: rawRotateX,
          rotateY: rawRotateY,
          translateZ: rawTranslateZ,
          scale: rawScale,
          opacity: rawOpacity,
          transformStyle: 'preserve-3d'
        }}
        className={`will-change-transform transition-shadow duration-300 ${className}`}
      >
        {/* Inner Content Container with 3D Depth Layering */}
        <div style={{ transform: `translateZ(${depthOffset}px)`, transformStyle: 'preserve-3d' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
