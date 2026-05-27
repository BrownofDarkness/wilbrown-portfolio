export const SITE = {
  name: "Wilfried Brown",
  fullName: "Wilfried Brown DJOUTSOP TAKOU",
  role: "Développeur full-stack",
  location: "Yaoundé, Cameroun",
  email: "takoubrown@gmail.com",
  url: "https://wilfriedbrown.dev",
  twitter: "@BrownofDarkness",
  // Set both to empty string when you don't want to broadcast availability
  // — the AvailabilityPill component hides itself when the localized
  // string is empty.
  availability: {
    fr: "Disponible · Ouvert aux missions",
    en: "Available · Open to work",
  },
  socials: {
    github: "https://github.com/BrownofDarkness",
    gitlab: "https://gitlab.com/BrownWilfried",
    linkedin:
      "https://www.linkedin.com/in/djoutsop-takou-wilfried-brown-735363256",
    twitter: "https://x.com/BrownofDarkness",
  },
} as const;

export const BRAND = {
  navy: "#03214D",
  navyDeep: "#021838",
  navyDark: "#010C1F",
  cyan: "#00A29A",
  cyanSoft: "#5BCCC4",
  cyanDim: "#006B66",
  anthracite: "#2A2D33",
  offWhite: "#FCFCFB",
  offWhiteWarm: "#F2EEE8",
} as const;

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";
