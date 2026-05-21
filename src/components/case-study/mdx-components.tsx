import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/*
 * Custom components available inside case-study .mdx files.
 * Imported via `import { mdxComponents } from "@/components/case-study/mdx-components"`
 * and passed as the `components` prop to the rendered MDX module.
 */

type CalloutProps = {
  type?: "note" | "warn" | "info";
  title?: string;
  children: ReactNode;
};

function Callout({ type = "note", title, children }: CalloutProps) {
  const palette = {
    note: "border-accent/40 bg-accent/[0.06] text-fg",
    warn: "border-yellow-500/40 bg-yellow-500/[0.06] text-fg",
    info: "border-border bg-bg-elevated text-fg-muted",
  } as const;
  return (
    <aside
      className={cn(
        "my-8 rounded-2xl border px-5 py-4 text-sm leading-relaxed",
        palette[type],
      )}
    >
      {title && (
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
          {title}
        </p>
      )}
      <div>{children}</div>
    </aside>
  );
}

function TechStack({ items }: { items: string[] }) {
  return (
    <ul className="not-prose my-6 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="inline-flex items-center rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-xs text-fg-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Quote({ children, author }: { children: ReactNode; author?: string }) {
  return (
    <figure className="my-10 border-l-2 border-accent pl-6">
      <blockquote className="text-lg italic leading-relaxed text-fg">
        {children}
      </blockquote>
      {author && (
        <figcaption className="mt-3 font-mono text-xs text-fg-subtle">
          — {author}
        </figcaption>
      )}
    </figure>
  );
}

type Metric = { value: string; label: string };

function Metrics({ items }: { items: Metric[] }) {
  return (
    <div className="not-prose my-10 grid gap-4 sm:grid-cols-3">
      {items.map((m) => (
        <div
          key={m.label}
          className="rounded-2xl border border-border-subtle bg-bg-elevated p-6"
        >
          <p className="font-sans text-3xl font-bold text-accent">{m.value}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-fg-muted">
            {m.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function MdxImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-10">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center font-mono text-xs text-fg-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* Base typography overrides — applied to standard markdown elements */
const proseClasses = {
  h2: "mt-16 mb-4 font-sans text-2xl font-bold tracking-tight text-fg sm:text-3xl",
  h3: "mt-10 mb-3 font-sans text-xl font-semibold text-fg",
  p: "my-5 text-base leading-[1.75] text-fg sm:text-lg",
  ul: "my-5 space-y-2 pl-5 text-base leading-[1.75] text-fg sm:text-lg",
  ol: "my-5 list-decimal space-y-2 pl-6 text-base leading-[1.75] text-fg sm:text-lg",
  li: "marker:text-accent",
  a: "text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent",
  strong: "font-semibold text-fg",
  em: "italic",
  blockquote:
    "my-6 border-l-2 border-accent pl-5 text-lg italic leading-relaxed text-fg-muted",
  code: "rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[0.9em] text-accent",
  pre: "my-6 overflow-x-auto rounded-2xl border border-border-subtle bg-bg-elevated p-5 font-mono text-sm leading-relaxed text-fg",
  hr: "my-12 border-border-subtle",
};

export const mdxComponents = {
  // Custom blocks
  Callout,
  TechStack,
  Quote,
  Metrics,
  Image: MdxImage,

  // Typography overrides
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className={proseClasses.h2} {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className={proseClasses.h3} {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className={proseClasses.p} {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className={cn("list-disc", proseClasses.ul)} {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className={proseClasses.ol} {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className={proseClasses.li} {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className={proseClasses.a} {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className={proseClasses.strong} {...props} />
  ),
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className={proseClasses.em} {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className={proseClasses.blockquote} {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className={proseClasses.code} {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre className={proseClasses.pre} {...props} />
  ),
  hr: () => <hr className={proseClasses.hr} />,
};
