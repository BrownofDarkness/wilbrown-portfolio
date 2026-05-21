"use client";

import { useState } from "react";
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

        {/* Skill nodes */}
        {SKILLS.map((skill) => {
          const visible = isVisible(skill, filter);
          const isHovered = hovered === skill.id;
          return (
            <button
              key={skill.id}
              type="button"
              onMouseEnter={() => setHovered(skill.id)}
              onFocus={() => setHovered(skill.id)}
              onBlur={() => setHovered(null)}
              aria-label={skill.label}
              className={cn(
                "group absolute flex flex-col items-center gap-2 transition-all duration-300",
                "-translate-x-1/2 -translate-y-1/2",
                visible
                  ? "opacity-100"
                  : "pointer-events-none opacity-15 grayscale",
                isHovered ? "z-20 scale-110" : "z-10 scale-100",
              )}
              style={{ left: `${skill.x}%`, top: `${skill.y}%` }}
            >
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl border bg-bg-elevated p-2 transition-all duration-300",
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
