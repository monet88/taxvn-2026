'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hook dùng IntersectionObserver để trigger reveal animation khi element vào viewport.
 * - Chỉ trigger 1 lần, unobserve sau khi intersect
 * - Tôn trọng prefers-reduced-motion (return true ngay)
 * - SSR-safe
 */
export function useScrollReveal(options?: {
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return;

    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? '0px 0px -40px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { ref, isVisible };
}
