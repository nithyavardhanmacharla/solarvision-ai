'use client';

import React, { useRef, useState, ReactNode } from 'react';

interface CursorGlowContainerProps {
  children: ReactNode;
  className?: string;
  glowColor?: string; // e.g. "rgba(250, 204, 21, 0.08)"
}

export function CursorGlowContainer({
  children,
  className = '',
  glowColor = 'rgba(250, 204, 21, 0.08)',
}: CursorGlowContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Soft Radial Glow Following Cursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-[inherit]"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${cursorPos.x}px ${cursorPos.y}px, ${glowColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
