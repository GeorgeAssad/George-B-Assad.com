"use client";

import type { ReactNode } from "react";
import { useScrolledPast } from "@/lib/use-scrolled-past";

/** On phones, a glass bar at the bottom that brings the page's main action back once the original has scrolled away. */
export function FollowBar({ target, children }: { target: string; children: ReactNode }) {
  const show = useScrolledPast(target);
  if (!show) return null;
  return (
    <div className="action-bar glass page-enter fixed inset-x-3 z-40 rounded-[1.75rem] p-2 shadow-[var(--lg-rim),var(--lg-edge),var(--lg-lift-2)] lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-3 pl-2">{children}</div>
    </div>
  );
}
