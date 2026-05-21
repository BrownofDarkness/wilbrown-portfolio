import type { MDXComponents } from "mdx/types";
import { mdxComponents } from "@/components/case-study/mdx-components";

/**
 * Required by @next/mdx in App Router. Provides the components map
 * used when rendering MDX without the @mdx-js/react context provider
 * (which would crash in server components).
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
