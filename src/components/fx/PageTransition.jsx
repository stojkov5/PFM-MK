// src/components/fx/PageTransition.jsx
import React from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion as Motion, useReducedMotion } from "motion/react";

const PageTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return outlet;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Motion.div
        key={location.pathname}
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
