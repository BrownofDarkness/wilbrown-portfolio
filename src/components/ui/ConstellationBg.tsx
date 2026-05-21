import { cn } from "@/lib/utils";

/*
 * Subtle static constellation pattern — placeholder/companion to the Phase 3
 * R3F Network Constellation. Uses currentColor so opacity & theme tint flow
 * from the parent's text color. Pure SVG, no JS.
 */

type Star = { x: number; y: number; r: number };
type Line = { a: number; b: number };

// Hand-tuned cluster of ~80 stars across a 1600x900 viewBox. Indices into
// the STARS array drive LINES so constellations stay coherent.
const STARS: Star[] = [
  // Top band
  { x: 80, y: 70, r: 1.4 },
  { x: 200, y: 120, r: 1 },
  { x: 320, y: 60, r: 0.8 },
  { x: 440, y: 140, r: 1.2 },
  { x: 560, y: 90, r: 0.9 },
  { x: 700, y: 50, r: 1.6 },
  { x: 840, y: 130, r: 1 },
  { x: 980, y: 80, r: 0.7 },
  { x: 1120, y: 110, r: 1.3 },
  { x: 1260, y: 50, r: 0.9 },
  { x: 1400, y: 140, r: 1.1 },
  { x: 1520, y: 70, r: 1.5 },

  // Upper-middle
  { x: 140, y: 220, r: 0.9 },
  { x: 280, y: 270, r: 1.3 },
  { x: 420, y: 240, r: 0.7 },
  { x: 580, y: 300, r: 1.1 },
  { x: 720, y: 230, r: 1.5 },
  { x: 880, y: 280, r: 0.8 },
  { x: 1020, y: 220, r: 1.2 },
  { x: 1180, y: 290, r: 1 },
  { x: 1340, y: 240, r: 1.4 },
  { x: 1500, y: 280, r: 0.9 },

  // Middle
  { x: 70, y: 380, r: 1.2 },
  { x: 220, y: 410, r: 0.8 },
  { x: 360, y: 380, r: 1.5 },
  { x: 500, y: 430, r: 1 },
  { x: 640, y: 400, r: 0.9 },
  { x: 800, y: 460, r: 1.3 },
  { x: 940, y: 390, r: 0.7 },
  { x: 1080, y: 440, r: 1.1 },
  { x: 1240, y: 380, r: 1.4 },
  { x: 1380, y: 430, r: 0.8 },
  { x: 1520, y: 400, r: 1 },

  // Lower-middle
  { x: 130, y: 560, r: 1 },
  { x: 280, y: 600, r: 1.4 },
  { x: 420, y: 540, r: 0.8 },
  { x: 580, y: 590, r: 1.1 },
  { x: 720, y: 540, r: 0.9 },
  { x: 880, y: 610, r: 1.2 },
  { x: 1020, y: 560, r: 0.7 },
  { x: 1180, y: 600, r: 1.3 },
  { x: 1340, y: 560, r: 0.8 },
  { x: 1500, y: 600, r: 1.5 },

  // Bottom band
  { x: 90, y: 740, r: 1.1 },
  { x: 240, y: 790, r: 0.9 },
  { x: 380, y: 720, r: 1.3 },
  { x: 520, y: 790, r: 0.8 },
  { x: 660, y: 740, r: 1 },
  { x: 800, y: 810, r: 1.4 },
  { x: 940, y: 730, r: 0.9 },
  { x: 1100, y: 800, r: 1.1 },
  { x: 1240, y: 740, r: 0.8 },
  { x: 1400, y: 790, r: 1.2 },
  { x: 1550, y: 730, r: 1 },
];

// Constellation line segments (indices into STARS)
const LINES: Line[] = [
  // Top cluster
  { a: 0, b: 1 },
  { a: 1, b: 3 },
  { a: 3, b: 5 },
  { a: 5, b: 7 },
  { a: 7, b: 9 },
  { a: 9, b: 11 },
  // Diagonal cross
  { a: 13, b: 17 },
  { a: 17, b: 19 },
  { a: 19, b: 21 },
  // Middle constellation (a "W" shape)
  { a: 23, b: 25 },
  { a: 25, b: 27 },
  { a: 27, b: 29 },
  { a: 29, b: 31 },
  // Lower-middle line
  { a: 35, b: 37 },
  { a: 37, b: 41 },
  // Bottom band (irregular)
  { a: 44, b: 46 },
  { a: 46, b: 48 },
  { a: 50, b: 52 },
  // Vertical link
  { a: 6, b: 18 },
  { a: 18, b: 30 },
];

type Props = {
  className?: string;
  starColor?: string;
  lineColor?: string;
};

export function ConstellationBg({
  className,
  starColor = "currentColor",
  lineColor = "currentColor",
}: Props) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 h-full w-full", className)}
    >
      <g fill={starColor}>
        {STARS.map((s, i) => (
          <circle key={`s-${i}`} cx={s.x} cy={s.y} r={s.r} />
        ))}
      </g>
      <g stroke={lineColor} strokeWidth="0.5" fill="none" opacity="0.45">
        {LINES.map((l, i) => {
          const a = STARS[l.a];
          const b = STARS[l.b];
          return (
            <line key={`l-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          );
        })}
      </g>
    </svg>
  );
}
