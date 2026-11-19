---
name: launch-checklist
description: Runs a pre-launch quality check on a Next.js website — build, broken links and anchors, placeholder content, SEO and social tags, forms, checkout, analytics, performance, accessibility, legal pages and hosting — using a link-crawler script and any other Launch Skills that are installed, then writes LAUNCH-REPORT.md with pass, fail and to-do items. Use when the user is about to launch, ship, go live, publish or share a site, asks "is my site ready", or wants a final QA pass.
license: MIT
metadata:
  pack: nextjs-launch-skills
  version: "1.0.0"
---

# Pre-launch checklist

Find everything that would embarrass the user on launch day, fix what is safe to fix, and hand them a short report of what only they can do.

## 1. Build and start

1. `npm run build` must pass with no errors. Note warnings (for example "metadataBase property … is not set").
2. Start the production build: `npm run start`, or for a static export `npx serve out`. Note the URL.
3. If the site is already deployed, also run the checks against the live URL.

## 2. Automated checks

Run what is available. Scripts need Node 18+. `<skill-dir>` is the folder that contains a skill's SKILL.md (for example `.claude/skills/launch-checklist`).

| Check | Command | Comes with |
|---|---|---|
| Broken links, anchors, placeholder links | `node <skill-dir>/scripts/link-check.mjs http://localhost:3000 --external` | this skill |
| SEO tags, sitemap, robots, JSON-LD | `node <launch-seo>/scripts/seo-check.mjs --url http://localhost:3000` | `launch-seo` |
| Share images | `node <launch-social-images>/scripts/check-og.mjs http://localhost:3000/` | `launch-social-images` |
| Static export folder | `node <launch-static-deploy>/scripts/check-export.mjs out` | `launch-static-deploy` |
| Lighthouse scores | `node <launch-performance-audit>/scripts/lighthouse-report.mjs http://localhost:3000/` | `launch-performance-audit` |
| Copy placeholders and hype | `node <launch-copywriting>/scripts/copy-lint.mjs src` | `launch-copywriting` |

Look for sibling skill folders next to this one (same parent folder). If a skill is not installed, do the manual version of that check from [references/checklist.md](references/checklist.md) instead and say it was checked manually.

Also search the source for leftovers:

```bash
grep -rniE "lorem ipsum|TODO|FIXME|example\.com|Create Next App|localhost:3000" src app components content --include=*.{ts,tsx,js,jsx,md,mdx} 2>/dev/null
```

## 3. Manual checks

Walk through every section of [references/checklist.md](references/checklist.md): content, SEO, social, forms, checkout, analytics, performance, accessibility, legal and trust, technical, and post-launch. Use the running site in a browser at 375 px and 1280 px wide.

## 4. Fix what is safe

Fix without asking: broken internal links and anchors, missing `alt`, default create-next-app metadata, missing `lang`, missing 404 page, `href="#"` links that have an obvious destination.

Ask before changing: copy and claims, prices, colors, removing sections, anything legal, anything that needs the user's accounts (domains, payment, email provider).

## 5. Write LAUNCH-REPORT.md

Create `LAUNCH-REPORT.md` in the project root:

```markdown
# Launch report — <site> — <date>

## Verdict
Ready / Ready after the must-fix items / Not ready

## Must fix before launch
- [ ] …

## Fixed during this check
- … (file)

## Should fix soon
- [ ] …

## Only you can do this
- [ ] … (account, decision, content)

## Results
| Check | Result |
|---|---|
| Build | pass |
| Links | 0 errors, 2 warnings |
| SEO | … |
| Lighthouse (mobile) | Perf 92 · A11y 100 · BP 100 · SEO 100 |
```

Keep it short. Every item names the page or file and the exact problem.

## 6. Tell the user

Summarize the verdict and the must-fix list in a few lines and point to `LAUNCH-REPORT.md`. Then suggest the post-launch steps from the checklist (Search Console, sitemap submission, first share posts with UTM links).

If the user has only some Launch Skills installed, mention once that the full pack adds automated checks for the parts that were done by hand.
