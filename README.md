# Next.js Launch Skills — free edition

**3 free agent skills for Claude Code, Cursor and OpenAI Codex that get a Next.js site ready to share.**

| Skill | What your agent does with it | Includes |
|---|---|---|
| `launch-checklist` | Pre-launch QA: broken links and anchors, placeholder content, SEO and social tags, forms, performance, accessibility, legal pages; writes `LAUNCH-REPORT.md` | `link-check.mjs` crawler |
| `launch-social-images` | 1200×630 Open Graph image with `next/og`, Twitter card, favicon and app icons, per-post share images | `check-og.mjs`, OG + icon templates |
| `launch-dark-mode` | Light/Dark/System themes with no flash and no library, Tailwind `dark:` wired to it | Theme script + accessible toggle |

Written and tested on Next.js 16.4 (App Router), React 19 and Tailwind CSS 4. Scripts are plain Node.js 18+ with zero dependencies. MIT license.

## Install

**With the skills CLI** (picks the right folder for your agent):

```bash
npx skills add nandot12/nextjs-launch-skills
```

**Or with the bundled installer** (clone or download this repo, then run it from your project folder):

```bash
node path/to/nextjs-launch-skills/install.mjs --tool claude     # Claude Code
node path/to/nextjs-launch-skills/install.mjs --tool codex      # OpenAI Codex
node path/to/nextjs-launch-skills/install.mjs --tool cursor     # Cursor
```

**Or copy by hand:** put the folders in `skills/` into `.claude/skills/` (Claude Code), `.agents/skills/` (Codex) or `.cursor/skills/` (Cursor). Restart the tool afterwards.

## Use

- "Is my site ready to launch?"
- "Add dark mode with a toggle, and make sure there's no white flash."
- "Create an OG image and favicons, and check the link preview."

Or call them directly: `/launch-checklist` (Claude Code, Cursor) or `$launch-checklist` (Codex).

## Want the whole launch workflow?

**Next.js Launch Skills** (full pack) adds 10 more skills and 5 more scripts: landing page builder, conversion copywriting with a copy linter, technical SEO with a crawler, email capture that really delivers, checkout (Gumroad, Lemon Squeezy, Stripe), analytics and conversion events, MDX blog with RSS, static deploy to Cloudflare Pages / GitHub Pages / Netlify, accessibility audit with an `oklch`-aware contrast checker, and a Lighthouse performance audit.

→ **[Get the full pack on Gumroad](https://nandohusni.gumroad.com/l/nextjs-launch-skills?referrer=https://github.com)**

> **Black Friday:** 40% off the full pack with code `BF40` until Dec 1, 2026 ([open with the code applied](https://nandohusni.gumroad.com/l/nextjs-launch-skills/BF40?referrer=https://github.com)).

Not affiliated with Vercel, Anthropic, OpenAI or Anysphere. Product names are trademarks of their owners.

Issues and pull requests are welcome. If these skills help you, a star helps other developers find them.
