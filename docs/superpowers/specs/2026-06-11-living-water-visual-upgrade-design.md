# Design: "Living Water" Visual Upgrade

**Date:** 2026-06-11
**Project:** PFM-MK — Swimming Federation of North Macedonia website
**Status:** Approved by user (not committed — user requested no git commits)

## Goal

Transform the site from clean-but-static into a memorable, animated, swimming-themed
experience: motion polish site-wide, water-themed CSS/SVG signature elements, and one
3D WebGL water effect in the home hero. Performance and accessibility must not regress.

## Decisions made with user

1. **Full package** — motion polish + CSS water effects + 3D hero (phased in one effort).
2. **3D hero blends over the existing photo** (`public/Landing.webp` stays; WebGL particle
   waves layer between the photo and the hero content; the photo is the built-in fallback).
3. **Site-wide scope** — page transitions and scroll reveals apply to all routes; the
   signature 3D effect is home-page only.
4. **No git commits** — all work stays uncommitted in the working tree.

## Current state (for context)

- React 19 + Vite (rolldown-vite) + Tailwind 4 + Ant Design 6 + react-router 7 + i18next (mk/en).
- Consistent dark-navy glassmorphism design system using `pfm-*` CSS classes, cyan/blue
  accents (`rgba(56,189,248,…)`, `rgba(37,99,235,…)`), one CSS file per component.
- Home page composition: `Landing` → `HomeHighlights` → `HomeAbout` → `HomeDisciplines`.
- The only motion on the site today is a 1px hover lift on cards. No animation library,
  no 3D, no scroll effects.

## New dependencies

| Package | Purpose | Notes |
|---|---|---|
| `motion` | All UI animation (reveals, stagger, page transitions, count-up) | Successor to framer-motion; React 19 compatible; import from `motion/react` |
| `three` | WebGL rendering for hero water | Lazy-loaded only |
| `@react-three/fiber` | React renderer for three.js | Lazy-loaded only |

`@react-three/drei` is intentionally **not** included — the particle wave needs no helpers
and skipping drei keeps the bundle smaller.

## Components

All new FX components live in `src/components/fx/`.

### Reveal.jsx
Wrapper component using `motion`'s `whileInView`. Fades + slides children in when they
enter the viewport. Props: `delay`, `direction` (up/left/right), `once` (default true).
Supports stagger when wrapping a list (children variants). Used across home sections and
sub-pages. With `prefers-reduced-motion`, renders children statically.

### CountUp.jsx
Animates a number from 0 to its target when scrolled into view. Parses i18n string values
like `"120+"` — animates the numeric part, preserves any prefix/suffix. Falls back to
static text under reduced motion or if the value has no parseable number.

### WaveDivider.jsx
Layered translucent SVG waves used as section dividers. 2–3 wave layers drifting
horizontally at different speeds via CSS keyframes (`translateX` loop on duplicated
paths). Props: `flip` (vertical mirror), `height`, color/opacity tuning. Pure
CSS animation — no JS per frame.

### Bubbles.jsx
Pure-CSS rising bubble particles (a handful of blurred circles with randomized size,
horizontal position, duration, delay). Prop: `count` (default ~10). `aria-hidden`.
Disabled entirely under reduced motion.

### ClickRipple.jsx
Site-wide water-ripple on pointer click: an expanding fading ring at the click position,
rendered via a fixed-position overlay container. Mounted once in `AppLayout`. Skips
under reduced motion.

### HeroWater.jsx (signature piece)
React-three-fiber `<Canvas>` rendering a particle wave field: a grid of points
(`THREE.Points`) displaced by layered sine waves in a custom vertex shader, colored in
the site's cyan→blue palette, additive-blended, slightly transparent so the photo shows
through. Positioned absolutely in the hero between the photo/overlay layers and the text
content (`z-index` between the vignette and `.pfm-landing-inner`).

Guardrails:
- Lazy-loaded via `React.lazy` + `Suspense fallback={null}` so three.js is code-split
  and only downloads on the home route.
- Not mounted when: WebGL unavailable, `prefers-reduced-motion`, or save-data signals.
- `dpr` capped at 1.5; reduced particle grid on viewports < 768px.
- Render loop pauses when the hero is off-screen (IntersectionObserver) or the tab is
  hidden (`frameloop` toggling).
- The photo hero remains fully functional without it — no designed fallback needed.

### PageTransition.jsx
Wraps the router `Outlet` content in `AnimatePresence` keyed by `location.pathname`;
short fade + slight upward slide on route change. Must not break `ScrollToTop`.

### Lane-rope underline (CSS only)
A `pfm-lane-underline` class added to a shared stylesheet: a heading underline styled as
a pool lane rope (alternating red/white/blue segments). Applied to section headings
(`HomeDisciplines` title, sub-page headers).

## Integration points

| File | Change |
|---|---|
| `src/layout/AppLayout.jsx` | Mount `ClickRipple`; wrap `Outlet` with `PageTransition` |
| `src/pages/Home/Landing.jsx` | Staggered entrance (badge → title → subtitle → buttons → quick-access card); add `Bubbles` + lazy `HeroWater` layers; animate scroll indicator (CSS pulse/drift) |
| `src/pages/Home/HomeHighlights.jsx` | Wrap cards in `Reveal` with stagger |
| `src/pages/Home/HomeAbout.jsx` | `Reveal` on columns; `CountUp` on stat values |
| `src/pages/Home/HomeDisciplines.jsx` | `Reveal` stagger on discipline cards; lane-rope underline on title |
| `src/pages/Home/HomePage.jsx` | Insert `WaveDivider` between sections |
| Sub-pages (Swimming, Waterpolo, DistanceSwimming, News, Documents) | Light touch: wrap main content blocks in `Reveal`; page transitions come free via layout |

## Performance & accessibility

- `prefers-reduced-motion: reduce` → every effect renders static; `HeroWater` and
  `Bubbles` do not mount; `ClickRipple` inert.
- Reveals animate `opacity`/`transform` only — no layout shift.
- three.js code-split; zero cost on sub-pages and on first paint.
- All decorative layers `aria-hidden="true"`; no keyboard/focus changes.

## Verification

- Run dev server; visually verify hero entrance, bubbles, water particles, wave
  dividers, reveals, count-up, page transitions, click ripple.
- Check browser console for errors/warnings.
- Verify reduced-motion behavior (emulate via devtools).
- `npm run lint` and `npm run build` pass.
- **No git commits at any point.**

## Out of scope (future ideas, noted for later)

- Ohrid Marathon page: SVG Lake Ohrid map with scroll-driven route drawing.
- Records page: animated race-bar comparison of record times.
- 3D swimmer glTF model in the hero.
