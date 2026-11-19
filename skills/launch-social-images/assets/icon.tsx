// app/icon.tsx — generates a 512×512 PNG app icon (a letter mark on the brand color).
// Duplicate as app/apple-icon.tsx with size { width: 180, height: 180 } and a smaller font for iOS.
// Static export with cacheComponents OFF: add `export const dynamic = "force-static";`
import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6366f1",
          color: "#ffffff",
          fontSize: 320,
          fontWeight: 700,
          borderRadius: 112,
        }}
      >
        B
      </div>
    ),
    { ...size },
  );
}
