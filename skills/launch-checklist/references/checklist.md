# Launch checklist

Mark each item pass / fail / not applicable. "Manual" items need a human look even when scripts pass.

## Content

- [ ] No placeholder text: lorem ipsum, `[Product name]`, TODO, "Create Next App", example.com.
- [ ] Headline says what the product does and for whom (5-second test: show the hero to someone; can they explain it?).
- [ ] One primary CTA label used consistently.
- [ ] Testimonials, logos and numbers are real and approved by the people quoted.
- [ ] Prices, currency and billing period are correct everywhere they appear.
- [ ] Spelling and grammar checked; product and brand names spelled consistently.
- [ ] Contact method visible (email, form or chat).
- [ ] Footer year correct; no `href="#"` links.

## SEO

- [ ] Unique `<title>` (30–60 chars) and meta description (70–160 chars) on every page.
- [ ] `metadataBase` set to the production URL; canonical URLs absolute.
- [ ] `/robots.txt` allows crawling and lists the sitemap; `/sitemap.xml` lists every public page.
- [ ] One `<h1>` per page; `<html lang>` set.
- [ ] Structured data (JSON-LD) is valid and matches visible content; no fake ratings.
- [ ] Thank-you and draft pages are `noindex` and not in the sitemap.

## Social sharing

- [ ] `og:image` is absolute, 1200×630, under 5 MB, and readable as a thumbnail.
- [ ] `twitter:card` is `summary_large_image`.
- [ ] Favicon and Apple touch icon replaced (not the create-next-app default).
- [ ] Preview tested by pasting the URL in a chat app or with the LinkedIn Post Inspector (after deploy).

## Forms (manual)

- [ ] Email/contact form submits to a real destination; the test entry arrived.
- [ ] Error states shown for invalid input; success state shown; keyboard-only submission works.
- [ ] Spam protection (honeypot or provider protection) in place.
- [ ] Confirmation or welcome email works if the provider sends one.

## Checkout (manual, if selling)

- [ ] Every buy button opens the right product/plan and price.
- [ ] Test purchase done in test mode or with a 100% discount code; receipt and file delivery work.
- [ ] Refund policy and terms linked near the price or in the footer.
- [ ] Success redirect goes to the right page.

## Analytics

- [ ] Exactly one analytics script loads; page views arrive in the dashboard.
- [ ] Conversion events fire (CTA click, signup, checkout click).
- [ ] UTM-tagged links prepared for each launch channel.

## Performance

- [ ] Lighthouse mobile performance ≥ 90 on the home page (production build), or the main causes are known.
- [ ] Hero image optimized and preloaded; no layout shift from images or fonts.
- [ ] No large client-side libraries on the landing page that aren't needed above the fold.

## Accessibility (manual + automated)

- [ ] Lighthouse accessibility ≥ 95; text contrast ≥ 4.5:1 in light and dark mode.
- [ ] Keyboard: every control reachable, visible focus, skip link works, menus close with Escape.
- [ ] Form inputs labeled; icon buttons have accessible names; images have appropriate alt.
- [ ] Reduced motion respected.

## Legal and trust

- [ ] Privacy policy page (required in most places when collecting emails or using analytics with cookies).
- [ ] Terms / license page for paid products; refund policy.
- [ ] Cookie consent only if a tool sets non-essential cookies where the visitor's law requires consent (ask the user; not legal advice).
- [ ] Company or creator name and contact shown.

## Technical

- [ ] Custom 404 page.
- [ ] HTTPS works; one canonical host (www or apex) and the other redirects.
- [ ] Every page loads when opened directly (deep links), not only via client navigation.
- [ ] No console errors or hydration warnings on any page.
- [ ] Env vars for production set in the hosting dashboard (form endpoint, analytics IDs).
- [ ] Works in Safari (iOS) and Chrome (Android) at 375 px wide.

## Post-launch (tell the user)

- [ ] Add the site to Google Search Console and Bing Webmaster Tools; submit the sitemap; request indexing for the home page.
- [ ] Share with UTM-tagged links; note where each launch post went.
- [ ] Re-run this checklist after major changes.
- [ ] One week later: review analytics (sources, conversion rate) and Search Console (queries, indexing errors).
