/**
 * useScrollReveal — IntersectionObserver hook for scroll-triggered animations
 * 
 * Applies .visible class to elements with .animate-in, .stagger-children,
 * .scale-in, or .slide-left when they enter the viewport.
 */
import { useEffect } from "react";

const REVEAL_SELECTORS = ".animate-in, .stagger-children, .scale-in, .slide-left";

export function useScrollReveal() {
  useEffect(() => {
    // Skip if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Immediately make everything visible
      document.querySelectorAll(REVEAL_SELECTORS).forEach((el) => {
        el.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // Only animate once
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    // Observe all animatable elements
    const targets = document.querySelectorAll(REVEAL_SELECTORS);
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });
}
