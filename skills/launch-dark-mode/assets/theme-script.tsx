// components/theme-script.tsx — runs before first paint, so there is no flash of the wrong theme.
// Render <ThemeScript /> inside <head> in app/layout.tsx, and add suppressHydrationWarning to <html>.
// Pattern from the Next.js guide "Preventing flash before hydration" (Themes section).
//
// Sets on <html>:
//   data-theme="light" | "dark"                → used by CSS and Tailwind's dark: variant
//   data-theme-pref="light" | "dark" | "system" → the user's saved choice (for the toggle icon)
//   style.colorScheme                           → native form controls and scrollbars match

export const THEME_STORAGE_KEY = "theme";

const script = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var p=localStorage.getItem(k);if(p!=="light"&&p!=="dark")p="system";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.setAttribute("data-theme",d?"dark":"light");r.setAttribute("data-theme-pref",p);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
