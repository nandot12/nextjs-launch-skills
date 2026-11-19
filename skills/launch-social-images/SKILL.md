---
name: launch-social-images
description: Creates the share and icon images a Next.js App Router site needs — a 1200×630 Open Graph image generated with next/og ImageResponse, Twitter/X card tags, favicon, app icons and Apple touch icon, plus per-page OG images for blog posts — and verifies them with a checker script. Use when the user mentions OG image, social preview, link preview, share card, Twitter card, favicon or app icon, or when links to the site show no image on X, LinkedIn, Slack, Discord or WhatsApp.
license: MIT
metadata:
  pack: nextjs-launch-skills
  version: "1.0.0"
---

# Social share images and icons

When someone pastes the site's link into X, LinkedIn, Slack, Discord or WhatsApp, a large image with a readable headline should appear. Browsers and phones should show a crisp icon.

## 1. Inspect

- App folder (`src/app/` or `app/`), existing `favicon.ico`, `icon.*`, `apple-icon.*`, `opengraph-image.*`, `twitter-image.*`.
- `metadataBase` in the root layout. **Without it, og:image URLs are relative and social platforms ignore them.** If it is missing, add it (see the `launch-seo` skill, or set `metadataBase: new URL("https://your-domain.com")`).
- `next.config.*`: `output: "export"`?
- Brand: name, tagline, primary color, logo (SVG preferred). Reuse tokens from `globals.css`.
- Read the version-matched docs:
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/image-response.md`

## 2. Open Graph image (site-wide)

Copy [assets/opengraph-image.tsx](assets/opengraph-image.tsx) to `app/opengraph-image.tsx` and edit the brand values. It exports `alt`, `size` (1200×630) and `contentType`, and draws the image with `ImageResponse` from `next/og`.

Design rules for share images:

- Headline of 3–8 words, at least 64 px, high contrast. It must be readable as a 300 px wide thumbnail.
- Keep important content inside the central 1000×500 area; some platforms crop the edges.
- Brand mark + domain name in a corner so people know where the link goes.
- Flexbox only: `ImageResponse` supports a subset of CSS (`display: flex`, no grid). Every element with more than one child needs `display: "flex"`.
- Fonts: the default font works out of the box. For a custom font, load a `.ttf`/`.otf`/`.woff` file (not `.woff2`) with `readFile` and pass it in the `fonts` option, as shown in the docs.
- Size limit: 8 MB for Open Graph, 5 MB for Twitter. Generated PNGs are usually under 100 KB.

`twitter-image` is optional: when it is missing, X uses the Open Graph image. Make sure the root metadata sets `twitter: { card: "summary_large_image" }`.

## 3. Per-page images (blog posts, docs, product pages)

Add `opengraph-image.tsx` inside the dynamic segment, for example `app/blog/[slug]/opengraph-image.tsx`. It receives `params` (a Promise) and can load the post title; export `generateStaticParams` from the image file so every image is prerendered. Keep the same template so all shares look like one brand.

This matters more than it looks: when a page sets its own `openGraph` in `metadata`/`generateMetadata`, it replaces the parent's `openGraph` object, and the root share image disappears from that page. A segment-level `opengraph-image` file (or an explicit `openGraph.images`) fixes it.

## 4. Icons

| File (in `app/`) | Size | Purpose |
|---|---|---|
| `favicon.ico` | 32×32 (multi-size ok) | Browser tab, required at the app root |
| `icon.png` or `icon.svg` | 512×512 PNG or SVG | Modern browsers, Android |
| `apple-icon.png` | 180×180 | iOS home screen |

You can also generate `icon.tsx` / `apple-icon.tsx` with `ImageResponse` — see [assets/icon.tsx](assets/icon.tsx). Replace the default create-next-app `favicon.ico` before launch; if no `.ico` tool is available, a 32×32 `icon.png` plus removing the old `favicon.ico` is acceptable.

## 5. Static export note

With `output: "export"` (tested on Next.js 16.4):

- `cacheComponents` must be off for a static export, and every generated image file (`opengraph-image.tsx`, `icon.tsx`, `apple-icon.tsx`) needs `export const dynamic = "force-static";`, or the build fails. Dynamic segments also need `generateStaticParams`.
- Generated images are exported **without a file extension** (`out/opengraph-image`), so static hosts serve them without a `Content-Type` header (verified on Cloudflare Pages). Some crawlers reject that. Best fix for the site-wide image: open `/opengraph-image` in the running site, save it, and commit it as `app/opengraph-image.png` (then delete the `.tsx`); it exports as `opengraph-image.png` with the right type. Same for icons (`app/icon.png`, `app/apple-icon.png`). For per-post images, set `Content-Type: image/png` for those paths in the host's headers file (`public/_headers` on Cloudflare Pages/Netlify).

## 6. Verify

1. `npm run build` must pass. The build output lists the `opengraph-image` routes.
2. Start the site (`npm run start`, or serve the `out/` folder) and run the checker (Node 18+, no dependencies). `<skill-dir>` is the folder that contains this SKILL.md:

   ```bash
   node <skill-dir>/scripts/check-og.mjs http://localhost:3000/ http://localhost:3000/blog/some-post
   ```

   It reads the page's `og:*` and `twitter:*` tags, downloads the image, and checks absolute URL, HTTP status, file size, dimensions (1200×630), `og:image:alt`, and `twitter:card`. Localhost URLs in the tags are reported, because they mean `metadataBase` is missing or wrong for production.
3. Open the image URL in the browser and look at it. Check the text is readable when the browser window is narrow.
4. After deploy, tell the user to test with the platforms' own tools (LinkedIn Post Inspector, the Facebook Sharing Debugger). These also refresh cached previews.

## Report

List the image and icon files created, the checker output, and a reminder that platforms cache previews: after changing the image, re-scrape with the tools above.
