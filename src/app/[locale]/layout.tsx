import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Manrope, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { TopNav } from "@/components/layout/TopNav";
import { ConstellationBg } from "@/components/ui/ConstellationBg";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/constants";
import "../globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Je code des apps. Je tiens les serveurs. Je forme aux deux. Flutter / Django / Linux. Yaoundé, Cameroun.",
  authors: [{ name: SITE.fullName }],
  metadataBase: new URL(SITE.url),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    creator: SITE.twitter,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      data-theme="dark"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="relative flex min-h-full flex-col bg-bg text-fg font-sans">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Global constellation backdrop — sits behind everything, theme-tinted */}
        <div className="pointer-events-none fixed inset-0 -z-50 text-accent opacity-[0.22]">
          <ConstellationBg />
        </div>
        <NextIntlClientProvider>
          <TopNav />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
