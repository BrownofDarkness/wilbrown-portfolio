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
 * Avatar Pose 8 + brand layout in navy/cyan with Manrope-like display fonts.
 */
export default async function OpengraphImage() {
  const avatarBytes = await readFile(
    join(process.cwd(), "public/avatars/avatar-08-headshot.jpeg"),
  );
  const avatarSrc = `data:image/jpeg;base64,${avatarBytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at top left, #021838 0%, #010c1f 60%)",
          color: "#fcfcfb",
          padding: 64,
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Subtle cyan accent ring on top-right */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "rgba(0, 162, 154, 0.08)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />

        {/* Left column: identity */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 1,
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
                  display: "inline-block",
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

        {/* Right column: avatar */}
        <div
          style={{
            width: 360,
            height: 360,
            alignSelf: "center",
            marginLeft: 48,
            borderRadius: 24,
            overflow: "hidden",
            border: "1px solid rgba(0, 162, 154, 0.3)",
            boxShadow: "0 30px 80px -20px rgba(0, 162, 154, 0.35)",
            display: "flex",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarSrc}
            alt=""
            width={360}
            height={360}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
