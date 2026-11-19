---
name: launch-dark-mode
description: Adds light, dark and system theme support to a Next.js App Router + Tailwind CSS site with no extra library and no flash of the wrong theme — an inline head script, a data-theme attribute wired to Tailwind's dark variant, design tokens for both themes, and an accessible Light/Dark/System toggle — compatible with static export and Cache Components. Use when the user wants dark mode, a theme switcher, or reports a white flash, theme flicker or hydration warning when loading a dark page.
license: MIT
metadata:
  pack: nextjs-launch-skills
  version: "1.0.0"
---

# Dark mode without the flash

The page must render in the right theme on the very first paint, respect the OS setting by default, and remember the visitor's choice.

## 1. Inspect

- Root layout (`app/layout.tsx` or `src/app/layout.tsx`) and global CSS.
- Tailwind version: v4 (`@import "tailwindcss"` in CSS) or v3 (`tailwind.config.*`).
- How dark styles are written today: `dark:` classes, `@media (prefers-color-scheme: dark)` blocks, a `.dark` class, or a library such as `next-themes`. If a library already works, ask before replacing it.
- Read `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md` (section "Themes"). This skill follows that pattern.

## 2. Install the pieces

1. Copy [assets/theme-script.tsx](assets/theme-script.tsx) and [assets/theme-toggle.tsx](assets/theme-toggle.tsx) to `components/`.
2. Root layout:

   ```tsx
   import { ThemeScript } from "@/components/theme-script";

   export default function RootLayout({ children }: LayoutProps<"/">) {
     return (
       <html lang="en" data-theme="light" suppressHydrationWarning>
         <head>
           <ThemeScript />
         </head>
         <body>{children}</body>
       </html>
     );
   }
   ```

   `suppressHydrationWarning` on `<html>` is required: the script changes its attributes before React hydrates. It only affects that one element.
3. Tailwind v4 — make `dark:` follow the attribute instead of the OS media query (add after `@import "tailwindcss";`):

   ```css
   @custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
   ```

   Tailwind v3: set `darkMode: ["selector", '[data-theme="dark"]']` in `tailwind.config`.
4. Move theme colors to tokens, so most components need no `dark:` classes at all:

   ```css
   :root { --background: #ffffff; --foreground: #171717; }
   [data-theme="dark"] { --background: #0a0a0a; --foreground: #ededed; }
   @theme inline { --color-background: var(--background); --color-foreground: var(--foreground); }
   ```

   Replace an existing `@media (prefers-color-scheme: dark) { :root { … } }` block with the `[data-theme="dark"]` block; the script already applies the OS preference when the visitor hasn't chosen.
5. Put `<ThemeToggle />` in the navbar (desktop and mobile menu).
6. Optional: browser UI color with `viewport.themeColor` using `media` queries (see the `launch-seo` assets).

## 3. Rules

- The script must be inline in `<head>` (not `next/script`, not an effect), so it runs before paint.
- Never read `localStorage` or `matchMedia` during render. The toggle shows the right icon through CSS on `data-theme-pref`, and fills its label after mount.
- Images that need a dark variant: render both and hide one with `dark:hidden` / `hidden dark:block`, or use `<picture>` with `prefers-color-scheme` for logos.
- Re-check text contrast in dark mode (`launch-a11y-audit` has a token contrast checker).

## 4. Verify

1. `npm run build` passes (works with `output: "export"` and with `cacheComponents`).
2. In the running site, for each of Light, Dark, System: reload the page with cache disabled. No flash of the other theme; the toggle icon matches.
3. Set the OS to dark with the preference on System: the page switches live.
4. Console: no hydration warnings.
5. Keyboard: the toggle is reachable, has a visible focus ring, and its accessible name says the current theme.
6. If localStorage is blocked (private mode in some browsers), the page still renders using the OS theme.

## Report

Files changed, how tokens map in both themes, components that still use hard-coded colors, and contrast results for both themes.
