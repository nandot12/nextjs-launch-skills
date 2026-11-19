"use client";

// components/theme-toggle.tsx — cycles Light → Dark → System.
// The icon is chosen by CSS from <html data-theme-pref>, so the server HTML is correct before
// hydration and there is no icon flash or hydration mismatch.
import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "./theme-script";

type Pref = "light" | "dark" | "system";
const order: Pref[] = ["light", "dark", "system"];
const labels: Record<Pref, string> = { light: "Light", dark: "Dark", system: "System" };

function apply(pref: Pref) {
  const root = document.documentElement;
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.setAttribute("data-theme", dark ? "dark" : "light");
  root.setAttribute("data-theme-pref", pref);
  root.style.colorScheme = dark ? "dark" : "light";
}

function readPref(): Pref {
  const value = document.documentElement.getAttribute("data-theme-pref");
  return value === "light" || value === "dark" ? value : "system";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  // null until mounted: the server doesn't know the user's choice.
  const [pref, setPref] = useState<Pref | null>(null);

  useEffect(() => {
    setPref(readPref());
    // Follow OS changes while the preference is "system".
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readPref() === "system") apply("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function cycle() {
    const current = readPref();
    const next = order[(order.indexOf(current) + 1) % order.length];
    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage blocked: still switch for this page view
    }
    apply(next);
    setPref(next);
  }

  const label = pref ? `Theme: ${labels[pref]}. Switch theme` : "Switch theme";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className={`inline-flex size-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900 ${className}`}
    >
      {/* Sun: shown when the saved preference is light */}
      <svg aria-hidden viewBox="0 0 24 24" className="hidden size-5 [[data-theme-pref=light]_&]:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      {/* Moon: dark */}
      <svg aria-hidden viewBox="0 0 24 24" className="hidden size-5 [[data-theme-pref=dark]_&]:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      {/* Monitor: system (also the default before the script runs) */}
      <svg aria-hidden viewBox="0 0 24 24" className="block size-5 [[data-theme-pref=light]_&]:hidden [[data-theme-pref=dark]_&]:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    </button>
  );
}
