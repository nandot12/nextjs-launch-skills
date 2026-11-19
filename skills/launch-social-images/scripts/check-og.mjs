#!/usr/bin/env node
/**
 * check-og — verify the social share tags and image of one or more pages. Zero dependencies, Node 18+.
 *
 * Usage:
 *   node check-og.mjs <page-url> [<page-url> ...] [--json]
 *   node check-og.mjs http://localhost:3000/ http://localhost:3000/blog/hello
 *
 * Checks: og:title, og:description, og:url, og:image (absolute, reachable, size, dimensions),
 * og:image:alt, twitter:card, twitter:image fallback, and localhost URLs in the tags.
 * When the page is served from localhost, image URLs that point to the production domain are
 * fetched from the local server instead (same path), so you can test before deploying.
 * Exit code 1 when any error is found.
 */

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const pages = argv.filter((a) => !a.startsWith("--"));
if (!pages.length) {
  console.log("Usage: node check-og.mjs <page-url> [<page-url> ...] [--json]");
  process.exit(1);
}

const isLocal = (u) => /\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?/i.test(u);
const decode = (s = "") =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
function metaTags(html) {
  const head = html.split(/<\/head>/i)[0] ?? html;
  const out = [];
  for (const m of head.matchAll(/<meta\b[^>]*>/gi)) {
    const a = {};
    for (const x of m[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) a[x[1].toLowerCase()] = decode(x[2] ?? x[3]);
    out.push(a);
  }
  return out;
}
function imageSize(buf) {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return { type: "png", width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { type: "jpeg", height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { type: "webp", width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    if (chunk === "VP8 ") return { type: "webp", width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  return null;
}

const report = [];
let errors = 0;
let warnings = 0;

for (const pageUrl of pages) {
  const issues = [];
  const err = (m) => { issues.push({ level: "error", message: m }); errors++; };
  const warn = (m) => { issues.push({ level: "warning", message: m }); warnings++; };
  const info = {};
  try {
    const res = await fetch(pageUrl, { headers: { "user-agent": "facebookexternalhit/1.1 (check-og)" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const metas = metaTags(await res.text());
    const prop = (p) => metas.find((m) => (m.property ?? m.name ?? "").toLowerCase() === p)?.content;
    info.title = prop("og:title");
    info.description = prop("og:description");
    info.url = prop("og:url");
    info.image = prop("og:image");
    info.imageAlt = prop("og:image:alt");
    info.twitterCard = prop("twitter:card");
    info.twitterImage = prop("twitter:image");

    if (!info.title) err("Missing og:title");
    if (!info.description) warn("Missing og:description");
    if (!info.url) warn("Missing og:url");
    if (!info.twitterCard) err("Missing twitter:card (set twitter: { card: \"summary_large_image\" })");
    else if (info.twitterCard !== "summary_large_image") warn(`twitter:card is "${info.twitterCard}" — use summary_large_image for a big preview`);
    if (!info.image) err("Missing og:image (add app/opengraph-image.tsx or set openGraph.images)");
    if (info.image && !info.imageAlt) warn("Missing og:image:alt (export `alt` from opengraph-image.tsx)");
    const pageIsLocal = isLocal(pageUrl);
    for (const [k, v] of Object.entries({ "og:url": info.url, "og:image": info.image, "twitter:image": info.twitterImage })) {
      if (v && isLocal(v)) (pageIsLocal ? warn : err)(`${k} points to localhost (${v}) — set metadataBase to the production URL before deploying`);
    }

    if (info.image) {
      if (!/^https?:\/\//.test(info.image)) err(`og:image is not an absolute URL: ${info.image} (set metadataBase)`);
      else {
        let target = info.image;
        if (pageIsLocal && !isLocal(target)) {
          const u = new URL(target);
          target = new URL(pageUrl).origin + u.pathname + u.search;
          info.fetchedFrom = target;
        }
        const img = await fetch(target);
        if (!img.ok) err(`og:image returned HTTP ${img.status} (${target})`);
        else {
          const type = img.headers.get("content-type") ?? "";
          const buf = Buffer.from(await img.arrayBuffer());
          info.bytes = buf.length;
          if (!/^image\//.test(type))
            warn(
              `og:image is served with content-type "${type || "(none)"}" instead of image/* — static exports write generated images without an extension; use a static opengraph-image.png or set Content-Type in the host's headers file`,
            );
          if (buf.length > 8 * 1024 * 1024) err(`og:image is ${(buf.length / 1048576).toFixed(1)} MB (Open Graph max 8 MB)`);
          else if (buf.length > 5 * 1024 * 1024) warn(`og:image is ${(buf.length / 1048576).toFixed(1)} MB (X/Twitter max 5 MB)`);
          const size = imageSize(buf);
          if (!size) warn("Could not read image dimensions (PNG, JPEG or WebP expected)");
          else {
            info.dimensions = `${size.width}×${size.height} ${size.type}`;
            if (size.width < 600 || size.height < 315) err(`Image is ${size.width}×${size.height}; minimum 600×315, recommended 1200×630`);
            else if (Math.abs(size.width / size.height - 1.91) > 0.05) warn(`Image is ${size.width}×${size.height}; 1200×630 (1.91:1) avoids cropping`);
          }
        }
      }
    }
  } catch (e) {
    err(`Could not check page: ${e.message}`);
  }
  report.push({ page: pageUrl, ...info, issues });
}

if (asJson) console.log(JSON.stringify({ errors, warnings, report }, null, 2));
else {
  for (const r of report) {
    console.log(`\n${r.page}`);
    console.log(`  og:title     ${r.title ?? "—"}`);
    console.log(`  og:image     ${r.image ?? "—"}${r.dimensions ? `  (${r.dimensions}, ${Math.round((r.bytes ?? 0) / 1024)} KB)` : ""}`);
    if (r.fetchedFrom) console.log(`               fetched from ${r.fetchedFrom}`);
    console.log(`  twitter:card ${r.twitterCard ?? "—"}`);
    for (const i of r.issues) console.log(`  ${i.level === "error" ? "ERROR  " : "WARNING"} ${i.message}`);
    if (!r.issues.length) console.log("  OK");
  }
  console.log(`\ncheck-og: ${errors} error(s), ${warnings} warning(s)`);
}
process.exit(errors > 0 ? 1 : 0);
