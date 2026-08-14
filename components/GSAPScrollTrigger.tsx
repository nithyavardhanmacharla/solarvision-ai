'use client';

import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
  });
}

export function GSAPScrollInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

    const ctx = gsap.context(() => {
      // 1. Batch Fade-Up & Slide-Up Entrances
      ScrollTrigger.batch('[data-gsap="fade-up"]', {
        interval: 0.1,
        batchMax: 6,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: isMobile ? 20 : 40 },
            {
              opacity: 1,
              y: 0,
              duration: isMobile ? 0.5 : 0.8,
              ease: 'power2.out',
              stagger: 0.08,
              overwrite: 'auto'
            }
          );
        }
      });

      // 2. Batch Slide-In From Left
      ScrollTrigger.batch('[data-gsap="slide-left"]', {
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, x: isMobile ? -20 : -50 },
            { opacity: 1, x: 0, duration: isMobile ? 0.5 : 0.8, ease: 'power2.out', stagger: 0.1, overwrite: 'auto' }
          );
        }
      });

      // 3. Batch Slide-In From Right
      ScrollTrigger.batch('[data-gsap="slide-right"]', {
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, x: isMobile ? 20 : 50 },
            { opacity: 1, x: 0, duration: isMobile ? 0.5 : 0.8, ease: 'power2.out', stagger: 0.1, overwrite: 'auto' }
          );
        }
      });

      // 4. Stagger Grid Children
      const staggerContainers = document.querySelectorAll('[data-gsap="stagger-container"]');
      staggerContainers.forEach((container) => {
        const children = container.querySelectorAll('[data-gsap="stagger-item"]');
        if (children.length > 0) {
          gsap.fromTo(
            children,
            { opacity: 0, y: isMobile ? 15 : 35, scale: isMobile ? 0.98 : 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: isMobile ? 0.45 : 0.7,
              ease: 'power2.out',
              stagger: 0.06,
              scrollTrigger: {
                trigger: container,
                start: 'top 88%',
                toggleActions: 'play none none none'
              }
            }
          );
        }
      });

      // 5. Scroll-Driven 3D Tilt & Z-Depth Displacement ([data-gsap="3d-card"])
      // On mobile devices, keep cards clean to prevent GPU paint thrashing during touch scrolling
      if (!isMobile) {
        const scroll3DCards = document.querySelectorAll('[data-gsap="3d-card"]');
        scroll3DCards.forEach((card) => {
          gsap.fromTo(
            card,
            {
              rotateX: 12,
              rotateY: -4,
              z: -50,
              scale: 0.94,
              opacity: 0.4
            },
            {
              rotateX: 0,
              rotateY: 0,
              z: 0,
              scale: 1,
              opacity: 1,
              duration: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 92%',
                end: 'top 45%',
                scrub: 0.6
              }
            }
          );
        });

        // 6. Scroll-Driven 3D Continuous Y-Axis Orbit Spin ([data-gsap="3d-spin"])
        const spinItems = document.querySelectorAll('[data-gsap="3d-spin"]');
        spinItems.forEach((item) => {
          gsap.to(item, {
            rotateY: 360,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          });
        });

        // 7. Parallax Background & Floating Items (Scrubbed)
        const parallaxItems = document.querySelectorAll('[data-gsap="parallax"]');
        parallaxItems.forEach((el) => {
          const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.2');
          const direction = el.getAttribute('data-parallax-dir') || 'y';

          if (direction === 'y') {
            gsap.to(el, {
              y: () => -50 * speed,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5
              }
            });
          }
        });

        // 8. Smooth Section Motion Transitions, Scaling & Blur
        const sections = document.querySelectorAll('[data-gsap="section-reveal"]');
        sections.forEach((sec) => {
          gsap.fromTo(
            sec,
            { opacity: 0.2, scale: 0.97, y: 25 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sec,
                start: 'top 92%',
                end: 'top 45%',
                scrub: 0.5
              }
            }
          );
        });
      }

      // 9. Clip-Path Mask Reveal Motion Transitions ([data-gsap="mask-reveal"])
      const maskItems = document.querySelectorAll('[data-gsap="mask-reveal"]');
      maskItems.forEach((item) => {
        gsap.fromTo(
          item,
          { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
          {
            clipPath: 'inset(0 0 0% 0)',
            opacity: 1,
            duration: 0.9,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return null;
}
