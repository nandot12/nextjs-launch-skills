#!/usr/bin/env node
/**
 * link-check — crawl a site and report broken links, missing anchors and placeholder links.
 * Zero dependencies, Node 18+.
 *
 * Usage:
 *   node link-check.mjs http://localhost:3000 [--max 200] [--external] [--json]
 *
 * Internal pages are crawled (same origin). For every page it checks: internal links and assets
 * (status < 400), #fragment targets exist, no href="#" or javascript: placeholder links,
 * mailto: links are well-formed. With --external, external links get a HEAD/GET request too.
 * Exit code 1 when any error is found.
 */
const argv = process.argv.slice(2);
const opt = (n) => {
  const i = argv.indexOf(n);
  return i === -1 ? undefined : argv[i + 1];
};
const start = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--max");
if (!start || argv.includes("--help")) {
  console.log("Usage: node link-check.mjs <base-url> [--max 200] [--external] [--json]");
  process.exit(start ? 0 : 1);
}
const maxPages = Number(opt("--max") ?? 200);
const checkExternal = argv.includes("--external");
const asJson = argv.includes("--json");
const origin = new URL(start).origin;

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
const pages = new Map(); // url (no hash) -> { status, ids:Set, html }
const linkSources = new Map(); // target url (with hash) -> Set(source pages)
const findings = [];
const add = (level, rule, message, source) => findings.push({ level, rule, message, source });

async function get(url, method = "GET") {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, { method, redirect: "follow", signal: ctrl.signal, headers: { "user-agent": "link-check/1.0" } });
    const type = res.headers.get("content-type") ?? "";
    const text = method === "GET" && type.includes("html") ? await res.text() : "";
    if (method === "GET" && !text) await res.body?.cancel().catch(() => {});
    return { status: res.status, type, text, finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}

function extract(html, pageUrl) {
  const out = [];
  const re = /<(a|link|img|script|source|iframe)\b[^>]*?\s(href|src)\s*=\s*["']([^"']*)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const raw = decode(m[3].trim());
    if (/rel=["'](preconnect|dns-prefetch)["']/i.test(tag)) continue;
    out.push({ tag: m[1].toLowerCase(), raw });
  }
  return out.map((l) => ({ ...l, page: pageUrl }));
}

const queue = [new URL(start).href];
const queued = new Set(queue);
const external = new Map();
const emptyLinks = new Map(); // page path -> count of href="#" / href=""

while (queue.length && pages.size < maxPages) {
  const url = queue.shift();
  let res;
  try {
    res = await get(url);
  } catch (e) {
    pages.set(url, { status: 0, ids: new Set() });
    add("error", "fetch", `Could not fetch ${url}: ${e.message}`);
    continue;
  }
  const ids = new Set([...res.text.matchAll(/\s(?:id|name)\s*=\s*["']([^"']+)["']/gi)].map((m) => decode(m[1])));
  pages.set(url, { status: res.status, ids, isHtml: res.type.includes("html") });
  if (!res.type.includes("html") || res.status >= 400) continue;

  for (const link of extract(res.text, url)) {
    const { raw, tag } = link;
    const path = new URL(url).pathname;
    if (raw === "" || raw === "#") {
      if (tag === "a") emptyLinks.set(path, (emptyLinks.get(path) ?? 0) + 1);
      continue;
    }
    if (/^javascript:/i.test(raw)) { add("warning", "placeholder", `javascript: link`, path); continue; }
    if (/^mailto:/i.test(raw)) {
      if (!/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+/i.test(raw)) add("error", "mailto", `Malformed ${raw}`, path);
      else if (/example\.(com|org|net)/i.test(raw)) add("warning", "placeholder", `Placeholder email ${raw}`, path);
      continue;
    }
    if (/^(tel:|data:|blob:)/i.test(raw)) continue;
    let target;
    try { target = new URL(raw, url); } catch { add("error", "bad-url", `Invalid URL "${raw}"`, path); continue; }
    if (!/^https?:$/.test(target.protocol)) continue;
    if (/example\.(com|org|net)$/i.test(target.hostname)) add("warning", "placeholder", `Link to placeholder domain ${target.href}`, path);
    if (target.origin === origin) {
      const key = target.href;
      if (!linkSources.has(key)) linkSources.set(key, new Set());
      linkSources.get(key).add(path);
      const noHash = new URL(target.href);
      noHash.hash = "";
      const pageKey = noHash.href;
      const looksLikePage = tag === "a" && !/\.(png|jpe?g|gif|svg|webp|avif|ico|pdf|zip|xml|txt|json|css|js|woff2?|mp4|webm)$/i.test(noHash.pathname);
      if (!queued.has(pageKey)) {
        queued.add(pageKey);
        if (looksLikePage) queue.push(pageKey);
        else pages.set(pageKey, { pending: true });
      }
    } else if (tag === "a" || tag === "img" || tag === "script" || tag === "link") {
      if (!external.has(target.href)) external.set(target.href, new Set());
      external.get(target.href).add(path);
    }
  }
}

// Check assets / pages queued but not crawled (non-HTML or over the limit)
for (const [url, info] of pages) {
  if (!info.pending) continue;
  try {
    let r = await get(url, "HEAD");
    if (r.status === 405 || r.status === 501) r = await get(url, "GET");
    pages.set(url, { status: r.status, ids: new Set() });
  } catch (e) {
    pages.set(url, { status: 0, ids: new Set(), error: e.message });
  }
}

for (const [path, count] of emptyLinks) {
  add("warning", "placeholder", `${count} placeholder link(s) with href="#" — point them somewhere real or remove them`, path);
}

// Evaluate internal links
for (const [target, sources] of linkSources) {
  const u = new URL(target);
  const hash = decodeURIComponent(u.hash.slice(1));
  u.hash = "";
  const info = pages.get(u.href);
  const from = [...sources].slice(0, 3).join(", ");
  if (!info) continue; // over --max
  if (info.status === 0 || info.status >= 400) {
    add("error", "broken", `${u.pathname} → HTTP ${info.status || "error"}`, from);
  } else if (hash && info.ids && info.isHtml && !info.ids.has(hash)) {
    add("error", "anchor", `${u.pathname}#${hash} — no element with id="${hash}"`, from);
  }
}

// External links
if (checkExternal) {
  const entries = [...external.entries()];
  const results = [];
  for (let i = 0; i < entries.length; i += 5) {
    await Promise.all(
      entries.slice(i, i + 5).map(async ([href, sources]) => {
        try {
          let r = await get(href, "HEAD");
          if ([403, 405, 429, 501].includes(r.status)) r = await get(href, "GET");
          results.push({ href, status: r.status, sources });
        } catch (e) {
          results.push({ href, status: 0, error: e.message, sources });
        }
      }),
    );
  }
  for (const r of results) {
    const from = [...r.sources].slice(0, 3).join(", ");
    if (r.status === 0) add("warning", "external", `${r.href} — ${r.error}`, from);
    else if (r.status === 404 || r.status === 410) add("error", "external", `${r.href} → HTTP ${r.status}`, from);
    else if (r.status >= 400) add("warning", "external", `${r.href} → HTTP ${r.status} (may block bots; check by hand)`, from);
  }
}

const crawled = [...pages.entries()].filter(([, i]) => i.isHtml).length;
const errors = findings.filter((f) => f.level === "error").length;
const warnings = findings.length - errors;
if (asJson) console.log(JSON.stringify({ origin, pagesCrawled: crawled, internalLinks: linkSources.size, externalLinks: external.size, errors, warnings, findings }, null, 2));
else {
  console.log(`link-check: ${crawled} page(s) crawled, ${linkSources.size} internal link target(s), ${external.size} external link(s)${checkExternal ? " checked" : " (use --external to check)"}\n`);
  for (const f of findings) console.log(`${f.level === "error" ? "ERROR  " : "WARNING"}  [${f.rule}] ${f.message}${f.source ? `   (on ${f.source})` : ""}`);
  console.log(`\n${errors} error(s), ${warnings} warning(s)`);
}
process.exit(errors > 0 ? 1 : 0);
