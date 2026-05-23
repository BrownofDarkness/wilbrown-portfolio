"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CONNECTIONS,
  SKILLS,
  deviconUrl,
  type Skill,
  type SkillCategory,
} from "@/data/skills";
import { cn } from "@/lib/utils";

type Filter = "all" | SkillCategory;

const FILTERS: Filter[] = ["all", "mobile", "backend", "infra", "tools"];

const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
const SKILL_INDEX = Object.fromEntries(SKILLS.map((s, i) => [s.id, i]));

// Drift parameters in pixels (applied via transform on the node wrappers)
const DRIFT_AMP_X = 14; // px horizontal
const DRIFT_AMP_Y = 10; // px vertical
const DRIFT_SPEED = 0.35; // base radians/sec
const DRIFT_SPEED_Y = 0.27;

function offsetFor(idx: number, t: number) {
  return {
    dx: Math.sin(t * DRIFT_SPEED + idx * 0.9) * DRIFT_AMP_X,
    dy: Math.cos(t * DRIFT_SPEED_Y + idx * 1.7) * DRIFT_AMP_Y,
  };
}

function isVisible(skill: Skill, filter: Filter) {
  return filter === "all" || skill.category === filter;
}

function connectionVisible(from: Skill, to: Skill, filter: Filter) {
  if (filter === "all") return true;
  return from.category === filter && to.category === filter;
}

export function SkillsConstellation() {
  const t = useTranslations("stack.filters");
  const tCount = useTranslations("stack");
  const [filter, setFilter] = useState<Filter>("all");
  const [hovered, setHovered] = useState<string | null>(null);

  // Each node has a wrapper div that owns positioning + drift transform.
  // The inner button handles hover/scale transitions separately, so RAF
  // doesn't fight CSS transition-all.
  const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);

  // Continuous drift driven by RAF. Wrapper transform is mutated imperatively
  // (no React re-render per frame, no layout reflow — pure GPU composite).
  // Lines are SVG attribute updates inside the same viewBox, also cheap.
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    let raf = 0;
    const start = performance.now();

    const tick = () => {
      const time = (performance.now() - start) / 1000;

      // Drift the wrapper via transform (no left/top layout cost)
      for (const skill of SKILLS) {
        const el = wrapperRefs.current[skill.id];
        if (!el) continue;
        const { dx, dy } = offsetFor(SKILL_INDEX[skill.id], time);
        // -50% centers the node on its base point; px deltas drift around it
        el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      }

      // Update SVG line endpoints — these are in viewBox units (0-100),
      // so we convert px drift to % of nominal container width assuming
      // the SVG fills its parent. Approximate but consistent with nodes.
      for (let i = 0; i < CONNECTIONS.length; i++) {
        const line = lineRefs.current[i];
        if (!line) continue;
        const [fromId, toId] = CONNECTIONS[i];
        const from = SKILL_BY_ID[fromId];
        const to = SKILL_BY_ID[toId];
        if (!from || !to) continue;
        const off1 = offsetFor(SKILL_INDEX[fromId], time);
        const off2 = offsetFor(SKILL_INDEX[toId], time);
        // Convert px drift to viewBox %. Container is ~800px wide on desktop
        // → 1px ≈ 0.125 viewBox units. Empirical, matches node motion well.
        const pxToVb = 0.12;
        line.setAttribute("x1", String(from.x + off1.dx * pxToVb));
        line.setAttribute("y1", String(from.y + off1.dy * pxToVb));
        line.setAttribute("x2", String(to.x + off2.dx * pxToVb));
        line.setAttribute("y2", String(to.y + off2.dy * pxToVb));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const visibleCount = SKILLS.filter((s) => isVisible(s, filter)).length;

  return (
    <div>
      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="Skill categories"
        className="flex flex-wrap items-center gap-2"
      >
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-4 font-mono text-xs uppercase tracking-[0.1em] transition-colors",
                active
                  ? "border-accent bg-accent text-navy-dark"
                  : "border-border text-fg-muted hover:border-accent hover:text-accent",
              )}
            >
              {t(f)}
            </button>
          );
        })}
        <span className="ml-auto font-mono text-xs text-fg-subtle">
          {visibleCount} / {SKILLS.length} {tCount("count_label")}
        </span>
      </div>

      {/* Desktop: constellation SVG + absolutely-positioned nodes */}
      <div
        className="relative mt-12 hidden aspect-[16/10] w-full md:block"
        onMouseLeave={() => setHovered(null)}
      >
        {/* Connection lines */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {CONNECTIONS.map(([fromId, toId], i) => {
            const from = SKILL_BY_ID[fromId];
            const to = SKILL_BY_ID[toId];
            if (!from || !to) return null;
            const visible = connectionVisible(from, to, filter);
            const highlighted =
              hovered && (hovered === fromId || hovered === toId);
            return (
              <line
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="currentColor"
                strokeWidth={1}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className={cn(
                  "text-accent transition-opacity duration-300",
                  highlighted
                    ? "opacity-100"
                    : visible
                      ? "opacity-70"
                      : "opacity-20",
                )}
              />
            );
          })}
        </svg>

        {/* Skill nodes: wrapper owns position + RAF transform; button owns
            hover/scale transitions. No transition-all interference. */}
        {SKILLS.map((skill) => {
          const visible = isVisible(skill, filter);
          const isHovered = hovered === skill.id;
          return (
            <div
              key={skill.id}
              ref={(el) => {
                wrapperRefs.current[skill.id] = el;
              }}
              className={cn(
                "absolute",
                isHovered ? "z-20" : "z-10",
              )}
              style={{
                left: `${skill.x}%`,
                top: `${skill.y}%`,
                // Initial transform centers the node; RAF will overwrite with
                // the same -50% offset plus drift deltas
                transform: "translate(-50%, -50%)",
                willChange: "transform",
              }}
            >
              <button
                type="button"
                onMouseEnter={() => setHovered(skill.id)}
                onFocus={() => setHovered(skill.id)}
                onBlur={() => setHovered(null)}
                aria-label={skill.label}
                className={cn(
                  "group flex flex-col items-center gap-2 transition-transform duration-300",
                  visible
                    ? "opacity-100"
                    : "pointer-events-none opacity-15 grayscale",
                  isHovered ? "scale-110" : "scale-100",
                )}
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl border bg-bg-elevated p-2 transition-colors duration-300",
                    isHovered
                      ? "border-accent shadow-[0_0_24px_-4px] shadow-accent/40"
                      : "border-border-subtle",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={deviconUrl(skill)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={32}
                    height={32}
                    className="h-full w-full object-contain"
                  />
                </span>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                    isHovered ? "text-accent" : "text-fg-muted",
                  )}
                >
                  {skill.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Mobile fallback: clean grid, no positions */}
      <div className="mt-12 grid grid-cols-3 gap-4 sm:grid-cols-4 md:hidden">
        {SKILLS.filter((s) => isVisible(s, filter)).map((skill) => (
          <div
            key={skill.id}
            className="flex flex-col items-center gap-2 rounded-xl border border-border-subtle bg-bg-elevated p-4"
          >
            <span className="flex h-10 w-10 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={deviconUrl(skill)}
                alt=""
                loading="lazy"
                decoding="async"
                width={32}
                height={32}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-fg-muted">
              {skill.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
