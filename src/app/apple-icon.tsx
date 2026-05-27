import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/*
 * iOS "Add to Home Screen" icon. The WB logo on a brand-navy square so
 * the home-screen tile reads as a deliberate brand surface instead of a
 * transparent logo floating on whatever system color iOS picks. Padded
 * 20px on each side so the mark breathes.
 */
export default async function AppleIcon() {
  const logoBytes = await readFile(
    join(process.cwd(), "public/logos/logo-color-without-background.png"),
  );
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#03214D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          width={140}
          height={140}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}
