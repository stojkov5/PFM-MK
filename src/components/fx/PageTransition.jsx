// src/components/fx/PageTransition.jsx
import React from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion as Motion, useReducedMotion } from "motion/react";
import { sectionOf } from "../../lib/sections.js";

const PageTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return outlet;

  // Pages of one section share a key, so the section's hero and bar stay on
  // screen and only the content under them changes.
  const key = sectionOf(location.pathname) ?? location.pathname;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Motion.div
        key={key}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        {outlet}
      </Motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
