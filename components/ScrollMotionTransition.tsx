'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

interface ScrollMotionTransitionProps {
  children: React.ReactNode;
  className?: string;
  type?: 'fade-scale' | 'slide-up' | 'blur-in' | '3d-flip';
  staggerDelay?: number;
}

export function ScrollMotionTransition({
  children,
  className = '',
  type = 'fade-scale',
  staggerDelay = 0
}: ScrollMotionTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const timer = setTimeout(() => {
        setReducedMotion(isReduced);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const springProgress = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 24,
    restDelta: 0.001
  });

  // Smooth transforms based on viewport scroll progress (0 = entering, 0.4 = center, 1 = exit)
  const opacity = useTransform(springProgress, [0, 0.35, 0.75, 1], [0.15, 1, 1, 0.2]);
  const scale = useTransform(springProgress, [0, 0.35, 0.75, 1], [0.94, 1, 1, 0.96]);
  const y = useTransform(springProgress, [0, 0.35, 0.75, 1], [45, 0, 0, -35]);
  const blur = useTransform(springProgress, [0, 0.35, 0.75, 1], [8, 0, 0, 6]);
  const rotateX = useTransform(springProgress, [0, 0.35, 0.75, 1], [15, 0, 0, -12]);
  const filterBlur = useTransform(blur, (b: number) => `blur(${b}px)`);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const getStyle = () => {
    switch (type) {
      case 'blur-in':
        return {
          opacity,
          scale,
          y,
          filter: filterBlur
        };
      case '3d-flip':
        return {
          opacity,
          scale,
          y,
          rotateX,
          transformStyle: 'preserve-3d' as const
        };
      case 'slide-up':
        return {
          opacity,
          y
        };
      case 'fade-scale':
      default:
        return {
          opacity,
          scale,
          y
        };
    }
  };

  return (
    <div ref={containerRef} className={`perspective-1000 ${className}`}>
      <motion.div style={getStyle()} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
