'use client';

import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTiltDeg?: number; // Max rotation angle cap in degrees (default 8°)
  perspective?: number; // 3D Perspective in px (default 1200px)
  scaleOnHover?: number; // Hover scale factor (default 1.02)
  showGlare?: boolean; // Enable soft radial cursor glare reflection
  onClick?: () => void;
}

export function TiltCard({
  children,
  className = '',
  maxTiltDeg = 8,
  perspective = 1200,
  scaleOnHover = 1.02,
  showGlare = true,
  onClick
}: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Motion values for normalized cursor offset (-0.5 to +0.5)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smooth tactile spring physics (stiffness 180, damping 20)
  const springConfig = { stiffness: 180, damping: 20 };
  const springX = useSpring(rawX, springConfig);
  const springY = useSpring(rawY, springConfig);

  // Map normalized cursor offset to 3D rotation angles
  const rotateX = useTransform(springY, [-0.5, 0.5], [maxTiltDeg, -maxTiltDeg]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-maxTiltDeg, maxTiltDeg]);

  // Dynamic 3D depth shadow that shifts opposite to tilt
  const shadowX = useTransform(springX, [-0.5, 0.5], [12, -12]);
  const shadowY = useTransform(springY, [-0.5, 0.5], [12, -12]);

  // Glare position percentage (0% to 100%)
  const glareX = useTransform(springX, [-0.5, 0.5], [10, 90]);
  const glareY = useTransform(springY, [-0.5, 0.5], [10, 90]);

  useEffect(() => {
    // Touch detection & reduced motion check
    if (typeof window !== 'undefined') {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const timer = setTimeout(() => {
        setIsTouchDevice(isTouch);
        setPrefersReducedMotion(isReduced);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || isTouchDevice || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate relative cursor position from container center (-0.5 to 0.5)
    const mouseXPos = (e.clientX - rect.left) / width - 0.5;
    const mouseYPos = (e.clientY - rect.top) / height - 0.5;

    rawX.set(mouseXPos);
    rawY.set(mouseYPos);
  };

  const handleMouseEnter = () => {
    if (prefersReducedMotion || isTouchDevice) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion || isTouchDevice) return;
    setIsHovered(false);
    // Smoothly spring back to rest (0°)
    rawX.set(0);
    rawY.set(0);
  };

  // If touch device or reduced motion is enabled, gracefully fall back to flat container
  if (prefersReducedMotion || isTouchDevice) {
    return (
      <div
        onClick={onClick}
        className={`transition-transform active:scale-[0.99] ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d'
      }}
      className={`relative will-change-transform cursor-pointer ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale: isHovered ? scaleOnHover : 1,
          transformStyle: 'preserve-3d'
        }}
        transition={{ duration: 0.2 }}
        className="w-full h-full relative rounded-2xl"
      >
        {/* Children inner content with preserve-3d for depth layering */}
        <div style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }} className="w-full h-full">
          {children}
        </div>

        {/* Soft Radial Cursor Glare Reflection */}
        {showGlare && isHovered && (
          <motion.div
            style={{
              background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255, 255, 255, 0.08) 0%, transparent 65%)`
            }}
            className="absolute inset-0 rounded-2xl pointer-events-none z-30 transition-opacity duration-300"
          />
        )}
      </motion.div>
    </motion.div>
  );
}
