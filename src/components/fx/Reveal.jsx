// src/components/fx/Reveal.jsx
import React from "react";
import { motion as Motion, useReducedMotion } from "motion/react";

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
    <Motion.div
      className={className}
      initial={{ opacity: 0, ...off }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Motion.div>
  );
};

export default Reveal;
