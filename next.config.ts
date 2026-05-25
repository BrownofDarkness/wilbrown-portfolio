import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withMDX = createMDX({});
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Keep native modules outside the bundler — they ship as-is at runtime
  serverExternalPackages: ["better-sqlite3", "sharp"],
  experimental: {
    // proxy.ts buffers the request body so it can be re-read by the route
    // handler. Default 10MB is too tight for multi-photo event uploads.
    proxyClientMaxBodySize: "200mb",
    serverActions: {
      // Event photo uploads ship up to ~30 files × ~3-8MB each via FormData.
      bodySizeLimit: "200mb",
    },
  },
};

export default withNextIntl(withMDX(nextConfig));
