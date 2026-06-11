# Living Water Visual Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add site-wide motion polish, swimming-themed CSS/SVG effects, and a lazy-loaded 3D particle-wave hero to the PFM-MK federation site, per the approved spec at `docs/superpowers/specs/2026-06-11-living-water-visual-upgrade-design.md`.

**Architecture:** New reusable FX components in `src/components/fx/` (each with its own CSS file, matching the project's one-CSS-per-component convention). Home page gets the signature effects; all routes get page transitions via the layout. Every effect degrades gracefully under `prefers-reduced-motion`.

**Tech Stack:** React 19, Vite (rolldown), `motion` (motion/react) for UI animation, `three` + `@react-three/fiber` (lazy-loaded, home hero only), Tailwind 4 + Ant Design 6 already present.

**⚠️ NO GIT COMMITS:** The user explicitly forbade committing. Every "commit" step normally in a plan is replaced by "do not commit". Leave all changes uncommitted in the working tree.

**Testing note:** This project has no test framework, and the work is visual/animation code (shaders, CSS keyframes, scroll triggers). We deliberately do not introduce a test harness for it (YAGNI). Verification per task = `npm run lint` passes; integration tasks add dev-server visual checks; final task runs a production build.

---

### Task 1: Install dependencies

**Files:** `package.json`, `package-lock.json` (modified by npm)

- [ ] **Step 1: Install the three new packages**

Run: `npm install motion three @react-three/fiber`
Expected: success, no peer-dependency errors (fiber v9+ supports React 19).

- [ ] **Step 2: Verify the dev server still boots**

Run: `npm run dev` (background), open http://localhost:5173, confirm home page renders, then stop it.

- [ ] **Step 3: Do NOT commit** (user instruction — applies to every task; not repeated below)

---

### Task 2: `Reveal` — scroll-reveal wrapper

**Files:**
- Create: `src/components/fx/Reveal.jsx`

- [ ] **Step 1: Create the component**

```jsx
// src/components/fx/Reveal.jsx
import React from "react";
import { motion, useReducedMotion } from "motion/react";

const offsets = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: 28, y: 0 },
  right: { x: -28, y: 0 },
};

const Reveal = ({
  children,
  delay = 0,
  direction = "up",
  once = true,
  className,
}) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const off = offsets[direction] ?? offsets.up;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...off }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
```

- [ ] **Step 2: Verify lint passes**

Run: `npm run lint`
Expected: no new errors.

---

### Task 3: `CountUp` — animated stat numbers

**Files:**
- Create: `src/components/fx/CountUp.jsx`

- [ ] **Step 1: Create the component**

Parses values like `"120+"` from i18n strings: animates the numeric part, preserves prefix/suffix. Static fallback when there is no number or reduced motion is on.

```jsx
// src/components/fx/CountUp.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

const CountUp = ({ value, duration = 1.4, className }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  const parsed = useMemo(() => {
    const m = String(value).match(/^([^0-9]*)([0-9][0-9.,]*)(.*)$/);
    if (!m) return null;
    return {
      prefix: m[1],
      target: parseFloat(m[2].replace(/,/g, "")),
      suffix: m[3],
    };
  }, [value]);

  useEffect(() => {
    if (!parsed || reduceMotion || !inView) return undefined;
    const controls = animate(0, parsed.target, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return () => controls.stop();
  }, [parsed, reduceMotion, inView, duration]);

  if (!parsed || reduceMotion) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {parsed.prefix}
      {count}
      {parsed.suffix}
    </span>
  );
};

export default CountUp;
```

- [ ] **Step 2: Verify lint passes**

Run: `npm run lint`
Expected: no new errors.

---

### Task 4: `WaveDivider` — animated SVG section divider

**Files:**
- Create: `src/components/fx/WaveDivider.jsx`
- Create: `src/components/fx/WaveDivider.css`

- [ ] **Step 1: Create the component**

The wave path tiles seamlessly (quadratic curve with `T` reflections, period 1440, drawn twice for 2880) so a `translateX(-50%)` loop never jumps.

```jsx
// src/components/fx/WaveDivider.jsx
import React from "react";
import "./WaveDivider.css";

const WAVE_PATH = "M0,60 Q360,120 720,60 T1440,60 T2160,60 T2880,60 V120 H0 Z";

const layers = [
  { className: "pfm-wave-layer-1", fill: "rgba(56, 189, 248, 0.10)" },
  { className: "pfm-wave-layer-2", fill: "rgba(37, 99, 235, 0.14)" },
  { className: "pfm-wave-layer-3", fill: "rgba(148, 163, 184, 0.08)" },
];

const WaveDivider = ({ flip = false, height = 90 }) => (
  <div
    className={`pfm-wave-divider ${flip ? "pfm-wave-flip" : ""}`}
    style={{ height: `${height}px` }}
    aria-hidden="true"
  >
    {layers.map((l) => (
      <div key={l.className} className={`pfm-wave-layer ${l.className}`}>
        <svg viewBox="0 0 2880 120" preserveAspectRatio="none">
          <path d={WAVE_PATH} fill={l.fill} />
        </svg>
      </div>
    ))}
  </div>
);

export default WaveDivider;
```

- [ ] **Step 2: Create the CSS**

```css
/* src/components/fx/WaveDivider.css */
.pfm-wave-divider {
  position: relative;
  overflow: hidden;
  pointer-events: none;
}

.pfm-wave-flip {
  transform: scaleY(-1);
}

.pfm-wave-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  animation: pfm-wave-drift linear infinite;
}

.pfm-wave-layer svg {
  width: 100%;
  height: 100%;
  display: block;
}

.pfm-wave-layer-1 { animation-duration: 26s; }
.pfm-wave-layer-2 { animation-duration: 18s; animation-direction: reverse; }
.pfm-wave-layer-3 { animation-duration: 34s; }

@keyframes pfm-wave-drift {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .pfm-wave-layer { animation: none; }
}
```

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: no new errors.

---

### Task 5: `Bubbles` — CSS rising bubbles

**Files:**
- Create: `src/components/fx/Bubbles.jsx`
- Create: `src/components/fx/Bubbles.css`

- [ ] **Step 1: Create the component**

```jsx
// src/components/fx/Bubbles.jsx
import React, { useMemo } from "react";
import "./Bubbles.css";

const Bubbles = ({ count = 12 }) => {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 18,
        duration: 9 + Math.random() * 10,
        delay: Math.random() * 12,
        drift: -30 + Math.random() * 60,
      })),
    [count]
  );

  return (
    <div className="pfm-bubbles" aria-hidden="true">
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="pfm-bubble"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            "--pfm-bubble-drift": `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
};

export default Bubbles;
```

- [ ] **Step 2: Create the CSS**

```css
/* src/components/fx/Bubbles.css */
.pfm-bubbles {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.pfm-bubble {
  position: absolute;
  bottom: -40px;
  border-radius: 9999px;
  background: radial-gradient(
    circle at 32% 30%,
    rgba(255, 255, 255, 0.55),
    rgba(56, 189, 248, 0.12) 55%,
    transparent 70%
  );
  border: 1px solid rgba(255, 255, 255, 0.18);
  opacity: 0;
  animation-name: pfm-bubble-rise;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes pfm-bubble-rise {
  0% { transform: translate3d(0, 0, 0); opacity: 0; }
  10% { opacity: 0.7; }
  85% { opacity: 0.5; }
  100% {
    transform: translate3d(var(--pfm-bubble-drift, 20px), -110vh, 0);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pfm-bubbles { display: none; }
}
```

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: no new errors.

---

### Task 6: `ClickRipple` — site-wide water ripple on click

**Files:**
- Create: `src/components/fx/ClickRipple.jsx`
- Create: `src/components/fx/ClickRipple.css`

- [ ] **Step 1: Create the component**

```jsx
// src/components/fx/ClickRipple.jsx
import React, { useEffect, useState } from "react";
import "./ClickRipple.css";

const ClickRipple = () => {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const onPointerDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const id = `${Date.now()}-${Math.random()}`;
      setRipples((prev) => [
        ...prev.slice(-5),
        { id, x: e.clientX, y: e.clientY },
      ]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 750);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div className="pfm-ripple-layer" aria-hidden="true">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pfm-ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </div>
  );
};

export default ClickRipple;
```

- [ ] **Step 2: Create the CSS**

```css
/* src/components/fx/ClickRipple.css */
.pfm-ripple-layer {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

.pfm-ripple {
  position: absolute;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 9999px;
  border: 2px solid rgba(56, 189, 248, 0.65);
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.35);
  animation: pfm-ripple-expand 0.7s ease-out forwards;
}

@keyframes pfm-ripple-expand {
  from { transform: scale(0.4); opacity: 0.8; }
  to { transform: scale(5); opacity: 0; }
}
```

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: no new errors.

---

### Task 7: `PageTransition` — animated route changes

**Files:**
- Create: `src/components/fx/PageTransition.jsx`

- [ ] **Step 1: Create the component**

Uses `useOutlet()` (not `<Outlet />`) so `AnimatePresence` can hold the old page during its exit animation. Replaces the `<Outlet />` in AppLayout (Task 8).

```jsx
// src/components/fx/PageTransition.jsx
import React from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const PageTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return outlet;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
```

- [ ] **Step 2: Verify lint passes**

Run: `npm run lint`
Expected: no new errors.

---

### Task 8: Layout integration + lane-rope underline CSS

**Files:**
- Modify: `src/layout/AppLayout.jsx`
- Modify: `src/App.css` (append)

- [ ] **Step 1: Wire `PageTransition` and `ClickRipple` into the layout**

Full new content of `src/layout/AppLayout.jsx`:

```jsx
// src/layout/AppLayout.jsx
import React from "react";
import Navbar from "../components/Navbar.jsx";
import "../App.css";
import Footer from "../components/Footer.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";
import PageTransition from "../components/fx/PageTransition.jsx";
import ClickRipple from "../components/fx/ClickRipple.jsx";

const AppLayout = () => {
  return (
    <div className=" pfm-site min-h-screen bg-slate-50 text-slate-900">
      <ScrollToTop />
      <ClickRipple />
      <Navbar />
      <main className="pfm-site-main ">
        <PageTransition />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
```

(Note: the `Outlet` import is removed — `PageTransition` renders the outlet itself.)

- [ ] **Step 2: Append the lane-rope underline to `src/App.css`**

```css
/* Pool lane-rope heading underline */
.pfm-lane-underline {
  position: relative;
  padding-bottom: 16px;
}

.pfm-lane-underline::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 6px;
  border-radius: 9999px;
  background: repeating-linear-gradient(
    90deg,
    #ef4444 0 14px,
    #f8fafc 14px 28px,
    #38bdf8 28px 42px,
    #f8fafc 42px 56px
  );
  opacity: 0.85;
}

.pfm-lane-underline-left::after {
  left: 0;
  transform: none;
}
```

- [ ] **Step 3: Visual check**

Run dev server; navigate Home → News → a Waterpolo page. Expected: short fade/slide between routes, ripple ring on every click, no console errors, ScrollToTop still jumps to top.

---

### Task 9: `HeroWater` — 3D particle wave field

**Files:**
- Create: `src/components/fx/HeroWater.jsx`
- Create: `src/components/fx/HeroWater.css`

- [ ] **Step 1: Create the component**

A grid of `THREE.Points` displaced by layered sine waves in a custom vertex shader, cyan→blue palette, additive blending. Pauses rendering when off-screen or tab hidden. Reduced particle grid on mobile. This file is ONLY ever imported via `React.lazy` (Task 10) so three.js stays in its own chunk.

```jsx
// src/components/fx/HeroWater.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./HeroWater.css";

const vertexShader = /* glsl */ `
  uniform float uTime;
  attribute float aScale;
  varying float vElev;
  void main() {
    vec3 p = position;
    float e = sin(p.x * 0.55 + uTime * 0.8) * 0.35
            + sin(p.y * 0.95 + uTime * 0.55) * 0.25
            + sin((p.x + p.y) * 0.4 + uTime * 0.35) * 0.2;
    p.z += e;
    vElev = e;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * (16.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vElev;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    vec3 deep  = vec3(0.145, 0.388, 0.922);
    vec3 light = vec3(0.220, 0.741, 0.973);
    vec3 col = mix(deep, light, clamp(vElev * 0.9 + 0.5, 0.0, 1.0));
    gl_FragColor = vec4(col, a * 0.5);
  }
`;

const WaveField = ({ cols, rows }) => {
  const matRef = useRef(null);

  const { positions, scales } = useMemo(() => {
    const pos = new Float32Array(cols * rows * 3);
    const sc = new Float32Array(cols * rows);
    let i = 0;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        pos[i * 3] = (x / (cols - 1) - 0.5) * 24;
        pos[i * 3 + 1] = (y / (rows - 1) - 0.5) * 12;
        pos[i * 3 + 2] = 0;
        sc[i] = 0.6 + Math.random() * 0.9;
        i += 1;
      }
    }
    return { positions: pos, scales: sc };
  }, [cols, rows]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <points rotation={[-1.15, 0, 0]} position={[0, -2.2, 0]}>
      <bufferGeometry key={`${cols}x${rows}`}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const HeroWater = () => {
  const wrapRef = useRef(null);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const isMobile = useMemo(
    () => window.matchMedia("(max-width: 767px)").matches,
    []
  );

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting)
    );
    if (wrapRef.current) io.observe(wrapRef.current);

    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const running = onScreen && tabVisible;

  return (
    <div ref={wrapRef} className="pfm-hero-water" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={running ? "always" : "never"}
        camera={{ position: [0, 1.6, 7], fov: 55 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      >
        <WaveField cols={isMobile ? 70 : 130} rows={isMobile ? 36 : 60} />
      </Canvas>
    </div>
  );
};

export default HeroWater;
```

- [ ] **Step 2: Create the CSS**

Anchored to the bottom ~60% of the hero so it reads as a water surface; top edge masked so it fades into the photo.

```css
/* src/components/fx/HeroWater.css */
.pfm-hero-water {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 62%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.85;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 30%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 30%);
}

.pfm-hero-water canvas {
  display: block;
}
```

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: no new errors. (Visual check happens in Task 10 once it's mounted.)

---

### Task 10: Landing hero integration (entrance stagger + bubbles + 3D water + scroll indicator)

**Files:**
- Modify: `src/pages/Home/Landing.jsx` (full rewrite below)
- Modify: `src/pages/Home/Landing.css` (append)

- [ ] **Step 1: Rewrite `Landing.jsx`**

Changes vs current file: motion entrance variants on the left column (badge → title → subtitle → actions → meta) and the right card; `Bubbles` mounted unless reduced motion; `HeroWater` lazy-mounted only when WebGL exists and motion is allowed. All JSX content (translations, buttons, quick links) is unchanged.

```jsx
// src/pages/Landing.jsx
import React, { Suspense, lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "antd";
import { TbSwimming, TbWaterpolo } from "react-icons/tb";
import { TiWaves } from "react-icons/ti";
import { FiArrowRight, FiAward } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import Bubbles from "../../components/fx/Bubbles.jsx";
import "./Landing.css";

const HeroWater = lazy(() => import("../../components/fx/HeroWater.jsx"));

const canUseWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    if (!reduceMotion && canUseWebGL()) setShow3D(true);
  }, [reduceMotion]);

  const quickLinks = [
    {
      key: "swimming",
      icon: <TbSwimming />,
      href: "/swimming",
      chips: ["programs", "calendar", "records"],
    },
    {
      key: "waterpolo",
      icon: <TbWaterpolo />,
      href: "/waterpolo/programs",
      chips: ["programs", "calendar", "criteria"],
    },
    {
      key: "distance",
      icon: <TiWaves />,
      href: "/distance-swimming/calendar",
      chips: ["calendar", "ohridMarathon", "news"],
    },
  ];

  return (
    <section className="pfm-landing pfm-landing-bg pt-24">
      {/* background overlays */}
      <div className="pfm-landing-overlay" aria-hidden="true" />
      <div className="pfm-landing-vignette" aria-hidden="true" />

      {!reduceMotion && <Bubbles count={12} />}

      {show3D && (
        <Suspense fallback={null}>
          <HeroWater />
        </Suspense>
      )}

      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <Row gutter={[24, 24]} align="middle" className="pfm-landing-row">
          {/* LEFT */}
          <Col xs={24} lg={13}>
            <motion.div
              className="pfm-hero-left"
              variants={stagger}
              initial={reduceMotion ? false : "hidden"}
              animate="show"
            >
              <motion.div variants={rise} className="pfm-hero-badge">
                <FiAward className="pfm-hero-badge-icon" />
                <span>{t("landing.badge")}</span>
              </motion.div>

              <motion.h1 variants={rise} className="pfm-hero-title">
                {t("landing.titleLine1")}
                <br />
                {t("landing.titleLine2")}
              </motion.h1>

              <motion.p variants={rise} className="pfm-hero-subtitle">
                {t("landing.subtitle")}
              </motion.p>

              <motion.div variants={rise} className="pfm-hero-actions">
                <Button
                  type="primary"
                  size="large"
                  className="pfm-btn-primary"
                  onClick={() => navigate("/news")}
                >
                  {t("landing.actions.news")} <FiArrowRight />
                </Button>

                <Button
                  size="large"
                  className="pfm-btn-ghost"
                  onClick={() =>
                    window.scrollTo({
                      top: window.innerHeight,
                      behavior: "smooth",
                    })
                  }
                >
                  {t("landing.actions.browse")}
                </Button>
              </motion.div>

              <motion.div variants={rise} className="pfm-hero-meta">
                <div className="pfm-hero-meta-item">
                  <div className="pfm-hero-meta-label">
                    {t("landing.meta.focusLabel")}
                  </div>
                  <div className="pfm-hero-meta-value">
                    {t("landing.meta.focusValue")}
                  </div>
                </div>
                <div className="pfm-hero-meta-item">
                  <div className="pfm-hero-meta-label">
                    {t("landing.meta.infoLabel")}
                  </div>
                  <div className="pfm-hero-meta-value">
                    {t("landing.meta.infoValue")}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </Col>

          {/* RIGHT */}
          <Col xs={24} lg={11}>
            <motion.div
              className="pfm-hero-right"
              initial={
                reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="pfm-hero-card">
                <div className="pfm-hero-card-top">
                  <div className="pfm-hero-card-title">
                    {t("landing.quickAccess.title")}
                  </div>
                  <div className="pfm-hero-card-sub">
                    {t("landing.quickAccess.subtitle")}
                  </div>
                </div>

                <div className="pfm-quick-grid">
                  {quickLinks.map((q) => (
                    <button
                      key={q.key}
                      type="button"
                      className="pfm-quick-item"
                      onClick={() => navigate(q.href)}
                    >
                      <div className="pfm-quick-icon">{q.icon}</div>

                      <div className="pfm-quick-body">
                        <div className="pfm-quick-title">
                          {t(`landing.quickLinks.${q.key}.title`)}
                        </div>
                        <div className="pfm-quick-desc">
                          {t(`landing.quickLinks.${q.key}.desc`)}
                        </div>

                        <div className="pfm-quick-chips">
                          {q.chips.map((c) => (
                            <span key={c} className="pfm-chip">
                              {t(`landing.quickLinks.chips.${c}`)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <FiArrowRight className="pfm-quick-arrow" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pfm-hero-glow" aria-hidden="true" />
            </motion.div>
          </Col>
        </Row>

        <div className="pfm-scroll-indicator" aria-hidden="true">
          <div className="pfm-scroll-dot" />
          <div className="pfm-scroll-line" />
        </div>
      </div>
    </section>
  );
};

export default Landing;
```

- [ ] **Step 2: Append scroll-indicator animation to `src/pages/Home/Landing.css`**

```css
/* Animated scroll indicator */
.pfm-scroll-dot {
  animation: pfm-scroll-pulse 2.2s ease-in-out infinite;
}

@keyframes pfm-scroll-pulse {
  0%, 100% { transform: translateY(0); opacity: 0.9; }
  50% { transform: translateY(14px); opacity: 0.4; }
}

@media (prefers-reduced-motion: reduce) {
  .pfm-scroll-dot { animation: none; }
}
```

- [ ] **Step 3: Visual check**

Run dev server, open home page. Expected: hero content cascades in; bubbles drift up; glowing cyan/blue particle waves animate over the lower part of the hero photo; scroll dot pulses; no console errors; network tab shows three.js arriving as a separate lazy chunk.

---

### Task 11: Home sections — reveals, count-up, lane underline, wave dividers

**Files:**
- Modify: `src/pages/Home/HomePage.jsx` (full rewrite below)
- Modify: `src/pages/Home/HomeHighlights.jsx`
- Modify: `src/pages/Home/HomeAbout.jsx`
- Modify: `src/pages/Home/HomeDisciplines.jsx`

- [ ] **Step 1: `HomePage.jsx` — insert wave dividers**

```jsx
// src/pages/Home/HomePage.jsx
import React from "react";
import "./HomePage.css";
import Landing from "./Landing";
import HomeHighlights from "./HomeHighlights";
import HomeAbout from "./HomeAbout";
import HomeDisciplines from "./HomeDisciplines";
import WaveDivider from "../../components/fx/WaveDivider.jsx";

const HomePage = () => {
  return (
    <>
      <Landing />
      <WaveDivider flip />
      <HomeHighlights />
      <WaveDivider />
      <HomeAbout />
      <WaveDivider flip />
      <HomeDisciplines />
    </>
  );
};

export default HomePage;
```

- [ ] **Step 2: `HomeHighlights.jsx` — wrap the two cards in `Reveal`**

Add import: `import Reveal from "../../components/fx/Reveal.jsx";`

Wrap the news card (keep everything inside unchanged):

```jsx
<Col xs={24} lg={14}>
  <Reveal>
    <div className="pfm-card pfm-card-news">
      {/* ...existing content unchanged... */}
    </div>
  </Reveal>
</Col>
```

Wrap the events card:

```jsx
<Col xs={24} lg={10}>
  <Reveal delay={0.12}>
    <div className="pfm-card pfm-card-events">
      {/* ...existing content unchanged... */}
    </div>
  </Reveal>
</Col>
```

- [ ] **Step 3: `HomeAbout.jsx` — reveals + `CountUp` on stats**

Add imports:

```jsx
import Reveal from "../../components/fx/Reveal.jsx";
import CountUp from "../../components/fx/CountUp.jsx";
```

Wrap the about card (left column content) in `<Reveal>` and the stats wrap (right column content) in `<Reveal delay={0.12}>`, same pattern as Step 2.

Replace the stat value line:

```jsx
<div className="pfm-stat-title">{s.value}</div>
```

with:

```jsx
<div className="pfm-stat-title">
  <CountUp value={s.value} />
</div>
```

- [ ] **Step 4: `HomeDisciplines.jsx` — header underline + staggered cards**

Add import: `import Reveal from "../../components/fx/Reveal.jsx";`

Add the lane underline to the section title:

```jsx
<h2 className="pfm-disciplines-title pfm-lane-underline">
  {t("homeDisciplines.title")}
</h2>
```

Change the map to expose the index and wrap each card (inside the `Col`, around the `pfm-discipline-card` div):

```jsx
{items.map((it, idx) => (
  <Col xs={24} lg={8} key={it.key}>
    <Reveal delay={idx * 0.12}>
      <div className="pfm-discipline-card">
        {/* ...existing content unchanged... */}
      </div>
    </Reveal>
  </Col>
))}
```

- [ ] **Step 5: Visual check**

Run dev server, scroll the full home page. Expected: wavy animated dividers between sections; cards slide in as they enter the viewport (disciplines staggered left→right); stats count up from 0; lane-rope underline under the disciplines title; no layout jumps.

---

### Task 12: Sub-page reveals (light touch)

**Files (modify each):**
- `src/pages/Swimming/SwimmingLayout.jsx` (full code below)
- `src/pages/News/News.jsx` (full code below)
- `src/pages/Swimming/Clubs.jsx`
- `src/pages/Swimming/CalendarNational.jsx`
- `src/pages/Swimming/CalendarInternational.jsx`
- `src/pages/Swimming/Records.jsx`
- `src/pages/Swimming/Criteria.jsx`
- `src/pages/Waterpolo/WaterpoloPrograms.jsx`
- `src/pages/Waterpolo/WaterpoloCalendarNational.jsx`
- `src/pages/Waterpolo/WaterpoloCalendarInternational.jsx`
- `src/pages/Waterpolo/WaterpoloRecords.jsx`
- `src/pages/Waterpolo/WaterpoloCriteria.jsx`
- `src/pages/DistanceSwimming/DistanceSwimmingCalendar.jsx`
- `src/pages/DistanceSwimming/OhridMarathon.jsx`
- `src/pages/DistanceSwimming/DistanceSwimmingNews.jsx`
- `src/components/Documents.jsx`

**The pattern (applies to every file):** import `Reveal`, wrap the page's header block (kicker/title/subtitle) in `<Reveal>`, and wrap each major content block (card grid, table card, document list) in `<Reveal delay={0.1}>`. Do NOT wrap individual table rows or small items. Read each file before editing; keep all content and logic unchanged. Page-level entrance is already covered by `PageTransition`, so this is one or two wrappers per file, no more.

- [ ] **Step 1: `SwimmingLayout.jsx` — reference implementation**

```jsx
import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiGlobe,
  FiFileText,
  FiAward,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import "./swimming.css";

const SwimmingLayout = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const cards = [
    {
      to: "/swimming/clubs",
      label: t("swimming.cards.clubs.title"),
      desc: t("swimming.cards.clubs.desc"),
      icon: <FiUsers />,
    },
    {
      to: "/swimming/calendar-national",
      label: t("swimming.cards.calendarNational.title"),
      desc: t("swimming.cards.calendarNational.desc"),
      icon: <FiCalendar />,
    },
    {
      to: "/swimming/calendar-international",
      label: t("swimming.cards.calendarInternational.title"),
      desc: t("swimming.cards.calendarInternational.desc"),
      icon: <FiGlobe />,
    },
    {
      to: "/swimming/criteria",
      label: t("swimming.cards.criteria.title"),
      desc: t("swimming.cards.criteria.desc"),
      icon: <FiFileText />,
    },
    {
      to: "/swimming/records",
      label: t("swimming.cards.records.title"),
      desc: t("swimming.cards.records.desc"),
      icon: <FiAward />,
    },
  ];

  return (
    <section className="pfm-swimming">
      {/* Header / Hero */}
      <div className="pfm-swimming-hero">
        <div className="pfm-swimming-hero-inner max-w-6xl mx-auto px-4 md:px-6">
          <Reveal>
            <span className="pfm-swimming-kicker">
              {t("swimming.hero.kicker")}
            </span>
            <h1 className="pfm-swimming-title pfm-lane-underline pfm-lane-underline-left">
              {t("swimming.hero.title")}
            </h1>
            <p className="pfm-swimming-sub">{t("swimming.hero.subtitle")}</p>
          </Reveal>

          {/* Cards nav */}
          <Reveal delay={0.1}>
            <div className="pfm-swimming-cardgrid">
              {cards.map((c) => {
                const isActive = location.pathname.startsWith(c.to);

                return (
                  <NavLink
                    key={c.to}
                    to={c.to}
                    className={`pfm-swimming-card ${isActive ? "active" : ""}`}
                  >
                    <div className="pfm-swimming-card-top">
                      <div className="pfm-swimming-card-icon">{c.icon}</div>
                      <div className="pfm-swimming-card-title">{c.label}</div>
                    </div>

                    <div className="pfm-swimming-card-desc">{c.desc}</div>

                    <div className="pfm-swimming-card-cta">
                      {t("swimming.open")}{" "}
                      <span className="pfm-swimming-card-arrow">→</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Page content */}
      <div className="pfm-swimming-content max-w-6xl mx-auto px-4 md:px-6">
        <Outlet />
      </div>
    </section>
  );
};

export default SwimmingLayout;
```

- [ ] **Step 2: `News.jsx` — reference for minimal pages**

```jsx
import Reveal from "../../components/fx/Reveal.jsx";

const News = () => {
  return (
    <div className="pfm-cal pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <h1 className="pfm-cal-title text-3xl font-bold mb-4">News</h1>
          <p className="pfm-cal-description mb-8 text-center text-gray-600">
            Нема Податоци / No data
          </p>
        </Reveal>
      </div>
    </div>
  );
};
export default News;
```

- [ ] **Step 3: Apply the same pattern to the remaining 14 files**

For each remaining file in the list: read it, identify the header block and major content blocks, wrap per the pattern. Where a page has an `h1`/title heading, also add `pfm-lane-underline pfm-lane-underline-left` (or centered variant if the page centers its heading) — skip the underline if the page has no clear heading.

- [ ] **Step 4: Verify lint + visual spot-check**

Run: `npm run lint` — expected: no new errors.
Dev server: visit Swimming hub, Records, Clubs, a Waterpolo page, Distance Swimming, Documents. Expected: header and content blocks fade in once per visit, tables/PDF links all still work.

---

### Task 13: Final verification (NO commit)

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: exits 0.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: success; output shows a separate chunk containing three.js (lazy split), confirming the main bundle didn't swallow it.

- [ ] **Step 3: Full visual pass on the dev server**

- Home: hero stagger, bubbles, particle water, wave dividers, reveals, count-up, lane underline, scroll-dot pulse.
- Route changes: page transitions both directions, ScrollToTop intact.
- Click ripple everywhere.
- Console: zero errors/warnings introduced.

- [ ] **Step 4: Reduced-motion pass**

In devtools, emulate `prefers-reduced-motion: reduce` and reload. Expected: no bubbles, no 3D canvas, no wave drift, content appears statically, count-up shows final values, no ripple — page fully usable.

- [ ] **Step 5: Confirm nothing was committed**

Run: `git status` — expected: all changes present as uncommitted modifications/untracked files; `git log -1` shows the pre-existing `c590575` commit as HEAD.
