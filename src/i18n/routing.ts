import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  // Always default to FR — don't auto-redirect to /en based on browser
  // Accept-Language header. Visitors choose EN via the explicit toggle.
  localeDetection: false,
});
