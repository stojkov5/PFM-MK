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
