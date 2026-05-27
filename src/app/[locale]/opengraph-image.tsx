import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";
export const alt = `${SITE.name} — ${SITE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/*
 * Auto-generated OG image used by social platforms (LinkedIn, X, Slack…)
 * when someone shares the portfolio URL. Composed via next/og (Satori).
 *
 * Layout: avatar-06 (back view, coding on laptop, landscape) fills the
 * full canvas; a left→right dark gradient overlay keeps text legible on
 * the left 60% while the avatar fades visible on the right. Brand
 * navy/cyan palette throughout.
 */
export default async function OpengraphImage() {
  const avatarBytes = await readFile(
    join(process.cwd(), "public/avatars/avatar-06-coding.jpeg"),
  );
  const avatarSrc = `data:image/jpeg;base64,${avatarBytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          color: "#fcfcfb",
          fontFamily: "system-ui, sans-serif",
          background: "#010c1f",
        }}
      >
        {/* Background avatar — fills the canvas, anchored right so the
            laptop + figure stays visible behind the right side of the OG */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "right center",
          }}
        />

        {/* Gradient overlay: dark navy on the left fades to transparent on
            the right so the avatar art reads underneath the text-free area */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(90deg, #010c1f 0%, rgba(1,12,31,0.85) 28%, rgba(1,12,31,0.35) 55%, rgba(1,12,31,0.05) 85%)",
          }}
        />

        {/* Content — sits on top of the gradient on the left 60% */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 72,
            width: "60%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 16,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#00a29a",
                fontFamily: "monospace",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#00a29a",
                }}
              />
              Portfolio · 2026
            </span>
            <h1
              style={{
                margin: "32px 0 0 0",
                fontSize: 96,
                lineHeight: 0.95,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Wilfried</span>
              <span style={{ color: "#00a29a" }}>Brown.</span>
            </h1>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <p
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.4,
                color: "#fcfcfb",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Je code des apps. Je tiens les serveurs.</span>
              <span style={{ color: "#9ba4b2" }}>Le reste s'apprend.</span>
            </p>
            <p
              style={{
                marginTop: 24,
                fontSize: 18,
                color: "#9ba4b2",
                fontFamily: "monospace",
              }}
            >
              Flutter / Django / Linux · Yaoundé, Cameroun
            </p>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
