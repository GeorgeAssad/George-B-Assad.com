"use client";

import { useEffect, useState } from "react";

/**
 * True once the element matching `selector` has scrolled up out of view (its bottom is above the viewport).
 * Used to bring a call to action back when the page's own one is no longer visible, so there is always one,
 * never two. False during the server render and when the element is on screen or below it.
 */
export function useScrolledPast(selector: string | null): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    if (!selector) return;
    const el = document.querySelector(selector);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry) setPast(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [selector]);
  return selector ? past : false;
}
