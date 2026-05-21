@AGENTS.md

# Wilfried Brown — Personal Portfolio

Portfolio Next.js 16 + R3F + GSAP. Intention: portfolio éditorial sobre avec une seule signature 3D forte au hero (Network Constellation). Audience: recruteurs tech + communauté dev.

## Stack
- Next.js 16 (App Router) + React 19
- TypeScript strict
- Tailwind v4 (config CSS via `@theme` dans `src/app/globals.css`)
- next-intl v4 (FR par défaut + EN, `localePrefix: "as-needed"`)
- @next/mdx pour les case studies
- @react-three/fiber + drei + postprocessing pour la 3D
- gsap + @gsap/react pour les animations scroll-driven
- lucide-react (+ custom WB icons à venir)

## Layout

```
src/
  app/[locale]/
    layout.tsx           root, fonts, NextIntlClientProvider, <html data-theme="dark">
    page.tsx             hero / home
    globals.css          tokens brand + @theme
  components/
    ui/                  primitives (Button, Tag, ...)
    sections/            Hero, About, Experience, Work, Stack, Contact
    three/               R3F (NetworkConstellation, LogoWB)
    layout/              Nav, Footer
  content/projects/      MDX case studies (lumidata, snmp, quickshift, n8n)
  i18n/                  routing.ts + request.ts (next-intl)
  lib/                   utils.ts (cn), constants.ts (SITE, BRAND, LOCALES)
  middleware.ts          next-intl routing
messages/
  fr.json en.json        TOUTES les copies du site (pas de strings hardcodées)
public/
  avatars/               9 visuels manga éditorial 2.5D (avatar-01-hero..avatar-08-headshot + alt)
  logos/                 variantes du logo WB
design/                  GITIGNORÉ — planche char-sheet de référence, fichiers de travail
```

## Brand tokens (figés, ne pas freestyler)
- Navy `#03214D` — primaire, base bg sombre
- Cyan `#00A29A` — accent, signature brand
- Anthracite `#2A2D33` — neutre sombre
- Off-white `#FCFCFB` / warm `#F2EEE8`
- Sans-serif: **Manrope** · Mono: **Geist Mono** · Pas de serif

Tokens dans `src/app/globals.css` (`@theme inline`). Préférer les utilitaires sémantiques (`bg-bg`, `text-fg`, `text-accent`, `border-border`) aux utilitaires brand bruts.

## Color mode
Dark par défaut. Light theme via `data-theme="light"` sur `<html>`. Toggle implementation: Phase 1.

## Hero 3D — Network Constellation (specs)
- Logo WB centerpiece: rotation Y lente (~3°/s) + breathing scale 2-3% sur 3s
- 50-80 nodes cyan, slow drift + reconnexion procédurale
- Curseur: parallax + glow proximité (~150px de rayon)
- Fallback statique sur mobile faible
- Cible perf: 60fps desktop, 30fps mobile minimum

## Conventions
- Utiliser `cn()` depuis `@/lib/utils` pour composer les classes Tailwind
- Utiliser `SITE` depuis `@/lib/constants` pour toute donnée site-wide
- Server components par défaut; `"use client"` uniquement si interactivité requise
- Toute copie vit dans `messages/{fr,en}.json` — pas de string hardcodée dans les composants
- Sections dans `src/components/sections/`, fichier nommé `Hero.tsx`, `About.tsx`, etc.
- Composants 3D dans `src/components/three/` avec dynamic import si lourds

## Contexte perso (gitignoré, lire si présent)
- `PORTFOLIO_CONTEXT.md` (racine) — profil complet, compétences, expériences, intent brand
- `CV_DJOUTOP_TAKOU_Wilfried_Brown.pdf` (racine) — CV officiel

## Workflow
- `npm run dev` — Turbopack par défaut (Next.js 16)
- `npm run build` — build prod
- `npm run start` — serveur prod
- `npm run lint` — ESLint

## Phases du projet (memo)
- Phase 0: scaffold + setup ✓
- Phase 1: squelette UI + sections en static
- Phase 2: case studies MDX
- Phase 3: Hero 3D Network Constellation
- Phase 4: polish + i18n EN content review
- Phase 5: ship Vercel
