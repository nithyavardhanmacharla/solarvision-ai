'use client';

import { motion, Variants } from 'motion/react';
import React from 'react';

// ─── Reusable Animation Variants ────────────────────────────────────────────

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -3 },
  visible: {
    opacity: 1, scale: 1, rotate: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  }
};

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15
    }
  }
};

export const cardHover = {
  rest: { scale: 1, boxShadow: '0 0 0px rgba(250, 204, 21, 0)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 0 25px -5px rgba(250, 204, 21, 0.15)',
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

export const cardHoverSubtle = {
  rest: { scale: 1 },
  hover: {
    scale: 1.015,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const glowPulse: Variants = {
  hidden: { opacity: 0.4 },
  visible: {
    opacity: [0.4, 1, 0.4],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
  }
};

export const float: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [0, -6, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
};

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -12, scale: 0.8 },
  visible: {
    opacity: 1, rotate: 0, scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 15 }
  }
};

// ─── Animated Component Wrappers ────────────────────────────────────────────

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: Variants;
}

export function AnimatedSection({
  children, className = '', delay = 0, variant = fadeInUp
}: AnimatedSectionProps) {
  return (
    <motion.div
      variants={variant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
}

export function AnimatedCard({
  children, className = '', delay = 0, hoverEffect = true
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay }}
      whileHover={hoverEffect ? {
        scale: 1.02,
        boxShadow: '0 0 30px -8px rgba(250, 204, 21, 0.12)',
        transition: { duration: 0.25 }
      } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  slow?: boolean;
}

export function StaggerGrid({ children, className = '', slow = false }: StaggerGridProps) {
  return (
    <motion.div
      variants={slow ? staggerContainerSlow : staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Re-export motion for convenience
export { motion };
