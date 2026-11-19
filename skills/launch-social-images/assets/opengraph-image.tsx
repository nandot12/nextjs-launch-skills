// app/opengraph-image.tsx — generates the site-wide 1200×630 share image at build time.
// Static export with cacheComponents OFF: add `export const dynamic = "force-static";`
import { ImageResponse } from "next/og";

const brand = {
  name: "Brand",
  domain: "your-domain.com",
  headline: "Say the outcome in 3–8 words",
  subline: "One short supporting line",
  background: "#0b1020",
  foreground: "#ffffff",
  accent: "#6366f1",
};

export const alt = `${brand.name} — ${brand.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: brand.background,
          color: brand.foreground,
          fontSize: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: brand.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {brand.name.slice(0, 1)}
          </div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 600 }}>{brand.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>
            {brand.headline}
          </div>
          <div style={{ display: "flex", fontSize: 36, opacity: 0.75, maxWidth: 900 }}>{brand.subline}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, opacity: 0.7 }}>
          <div style={{ display: "flex" }}>{brand.domain}</div>
          <div style={{ display: "flex", width: 120, height: 8, borderRadius: 4, background: brand.accent }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
