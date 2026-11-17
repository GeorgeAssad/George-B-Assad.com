"use client";

import { useSyncExternalStore } from "react";
import { IconMoon, IconSun } from "@/components/ui/icons";

type Theme = "dark" | "light";
const STORAGE_KEY = "sc-theme";

/**
 * The theme follows the operating system until the visitor chooses one; the choice lives on <html data-theme>.
 * Observe both so every toggle instance stays in sync.
 */
function subscribe(listener: () => void): () => void {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", listener);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", listener);
  };
}
function getTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** The light/dark switch in the top bar, styled like the cart button next to it. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as Theme);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference just won't persist.
    }
  };

  return (
    <button type="button" onClick={toggle} className={`lg-icon-button ${className}`} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
      {theme === "dark" ? <IconSun size={21} /> : <IconMoon size={21} />}
    </button>
  );
}
